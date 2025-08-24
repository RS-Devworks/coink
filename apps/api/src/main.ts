import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração global de validação
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove propriedades não definidas no DTO
      forbidNonWhitelisted: true, // Rejeita requisições com propriedades extras
      transform: true, // Transforma automaticamente os tipos
      disableErrorMessages: false, // Mantém mensagens de erro detalhadas
    }),
  );

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
