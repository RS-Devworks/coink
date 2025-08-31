import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');
  
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, body, params, query } = req;
    const userAgent = req.get('User-Agent') || '';
    const ip = req.ip || req.connection.remoteAddress;
    const startTime = Date.now();

    // Tentar extrair informações do usuário do token JWT
    let userId = 'anonymous';
    let userEmail = 'anonymous';
    
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = this.jwtService.decode(token) as any;
        if (decoded && decoded.sub) {
          userId = decoded.sub;
          userEmail = decoded.email || 'unknown';
        }
      } catch (error) {
        // Token inválido ou expirado, manter como anonymous
      }
    }

    // Log da requisição inicial
    this.logger.log(
      `📥 ${method} ${originalUrl} - User: ${userEmail} (${userId}) - IP: ${ip} - UA: ${userAgent}`
    );

    // Log adicional para dados da requisição (sem senhas)
    if (body && typeof body === 'object' && Object.keys(body).length > 0) {
      const sanitizedBody = this.sanitizeBody(body);
      this.logger.debug(`📦 Body: ${JSON.stringify(sanitizedBody)}`);
    }

    if (params && typeof params === 'object' && Object.keys(params).length > 0) {
      this.logger.debug(`🎯 Params: ${JSON.stringify(params)}`);
    }

    if (query && typeof query === 'object' && Object.keys(query).length > 0) {
      this.logger.debug(`❓ Query: ${JSON.stringify(query)}`);
    }

    // Interceptar o final da resposta
    const originalSend = res.send;
    res.send = function (body) {
      const duration = Date.now() - startTime;
      const contentLength = Buffer.byteLength(body || '');
      
      const statusCode = res.statusCode;
      const statusEmoji = statusCode >= 200 && statusCode < 300 ? '✅' : 
                         statusCode >= 400 && statusCode < 500 ? '⚠️' : '❌';

      this.logger.log(
        `📤 ${method} ${originalUrl} ${statusEmoji} ${statusCode} - ${duration}ms - ${contentLength} bytes - User: ${userEmail}`
      );

      // Log de erro se status >= 400
      if (statusCode >= 400) {
        try {
          const errorBody = JSON.parse(body);
          this.logger.error(`💥 Error Response: ${JSON.stringify(errorBody)}`);
        } catch {
          // Não é JSON válido, ignorar
        }
      }

      return originalSend.call(this, body);
    }.bind(this);

    next();
  }

  private sanitizeBody(body: any): any {
    const sensitiveFields = ['password', 'currentPassword', 'newPassword', 'token'];
    const sanitized = { ...body };

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    return sanitized;
  }
}