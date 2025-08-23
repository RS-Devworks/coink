# API de Usuários - Sistema de Login

Este projeto implementa um CRUD completo de usuários com sistema de autenticação JWT e criptografia de senhas usando bcrypt com salt.

## 🔧 Funcionalidades

- **CRUD completo de usuários**
- **Autenticação JWT**
- **Criptografia de senhas com bcrypt e salt**
- **Seed para popular usuário admin**
- **Validação de dados com class-validator**

## 📊 Estrutura do Banco

### User Model

```prisma
model User {
  id         String   @id @default(uuid())
  email      String   @unique
  name       String
  password   String   // Hash + Salt
  lastAccess DateTime @default(now())
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

## 🚀 Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar banco de dados

```bash
npx prisma generate
npx prisma db push
```

### 3. Popular com dados iniciais

```bash
npm run db:seed
```

**Usuário Admin criado:**

- Email: `admin@coink.com`
- Senha: `admin123`

## 🔐 Endpoints da API

### Autenticação

#### POST /auth/login

Fazer login no sistema

```json
{
  "email": "admin@coink.com",
  "password": "admin123"
}
```

**Response:**

```json
{
  "accessToken": "jwt-token-here",
  "name": "Administrator",
  "email": "admin@coink.com",
  "id": "user-id"
}
```

### Usuários

#### POST /users

Criar novo usuário (público)

```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "minhasenha123"
}
```

#### GET /users

Listar todos os usuários (autenticado)

```
Headers: Authorization: Bearer {token}
```

#### GET /users/:id

Buscar usuário por ID (autenticado)

```
Headers: Authorization: Bearer {token}
```

#### PATCH /users/:id

Atualizar dados do usuário (autenticado)

```json
{
  "name": "Novo Nome",
  "email": "novoemail@example.com"
}
```

#### PATCH /users/:id/password

Alterar senha do usuário (autenticado)

```json
{
  "currentPassword": "senhaatual",
  "newPassword": "novasenha123"
}
```

#### DELETE /users/:id

Deletar usuário (autenticado)

```
Headers: Authorization: Bearer {token}
```

## 🔒 Segurança

### Criptografia de Senhas

- **Algoritmo:** bcrypt
- **Salt Rounds:** 12
- **Hash + Salt automático**

### JWT Token

- **Expiração:** 24 horas
- **Payload:** id, name, email
- **Header:** `Authorization: Bearer {token}`

### Validação

- **Email válido** obrigatório
- **Senhas** não podem ser vazias
- **Names** obrigatórios

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Banco de dados
npm run db:generate  # Gerar cliente Prisma
npm run db:push      # Aplicar mudanças no schema
npm run db:migrate   # Criar migração
npm run db:studio    # Abrir Prisma Studio
npm run db:seed      # Popular banco com dados

# Testes
npm run test
npm run test:e2e
```

## 🧪 Testando a API

### 1. Fazer login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@coink.com",
    "password": "admin123"
  }'
```

### 2. Criar novo usuário

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste User",
    "email": "teste@example.com",
    "password": "senha123"
  }'
```

### 3. Listar usuários (com token)

```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📁 Estrutura de Arquivos

```
src/
├── auth/
│   ├── auth.controller.ts    # Endpoints de autenticação
│   ├── auth.service.ts       # Lógica de autenticação
│   ├── auth.module.ts        # Módulo de autenticação
│   └── guards/
│       └── auth.guard.ts     # Guard para rotas protegidas
├── user/
│   ├── user.controller.ts    # Endpoints CRUD de usuários
│   ├── user.service.ts       # Lógica de negócio de usuários
│   ├── user.module.ts        # Módulo de usuários
│   └── dto/
│       └── user.dto.ts       # Validação e tipos
├── prisma.service.ts         # Serviço do Prisma
└── main.ts                   # Entry point da aplicação

prisma/
├── schema.prisma             # Schema do banco
├── seed.ts                   # Script de seed
└── database.db              # Banco SQLite
```

## ⚠️ Importante

- As senhas são **automaticamente criptografadas** com bcrypt + salt
- O token JWT expira em **24 horas**
- Todas as rotas de usuário (exceto criação) requerem **autenticação**
- Use **HTTPS em produção** para proteger tokens e senhas
- Nunca commite arquivos `.env` com credenciais reais
