# Backend API Endpoints - Coink

## Visão Geral

Este documento descreve todos os endpoints da API backend do Coink, uma plataforma de gerenciamento financeiro pessoal construída com NestJS, Prisma e SQLite.

## Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Todos os endpoints, exceto criação de usuário e login, requerem o header `Authorization: Bearer <token>`.

## Base URL
```
http://localhost:3001/api
```

---

## 📋 Endpoints de Autenticação

### POST /auth/login
Autentica um usuário e retorna um JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Nome do Usuário"
  }
}
```

---

## 👤 Endpoints de Usuários

### POST /users
Cria um novo usuário (não requer autenticação).

**Request Body:**
```json
{
  "name": "Nome do Usuário",
  "email": "user@example.com",
  "password": "senha123"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "name": "Nome do Usuário",
  "email": "user@example.com",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### GET /users
Lista todos os usuários (requer autenticação).

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Nome do Usuário",
    "email": "user@example.com",
    "lastAccess": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### GET /users/:id
Busca um usuário específico por ID.

### PATCH /users/:id
Atualiza dados do usuário.

**Request Body:**
```json
{
  "name": "Novo Nome",
  "email": "novoemail@example.com"
}
```

### PATCH /users/:id/password
Atualiza senha do usuário.

**Request Body:**
```json
{
  "currentPassword": "senhaAtual",
  "newPassword": "novaSenha123"
}
```

### DELETE /users/:id
Remove um usuário (retorna `204 No Content`).

---

## 🏷️ Endpoints de Categorias

### POST /categories
Cria uma nova categoria.

**Request Body:**
```json
{
  "name": "Alimentação",
  "description": "Gastos com alimentação",
  "color": "#FF5722",
  "icon": "restaurant",
  "type": "EXPENSE"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Alimentação",
  "description": "Gastos com alimentação",
  "color": "#FF5722",
  "icon": "restaurant",
  "type": "EXPENSE",
  "isDefault": false,
  "userId": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### GET /categories
Lista todas as categorias do usuário.

**Query Parameters:**
- `type` (opcional): `INCOME` ou `EXPENSE`

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Alimentação",
    "description": "Gastos com alimentação",
    "color": "#FF5722",
    "icon": "restaurant",
    "type": "EXPENSE",
    "isDefault": false
  }
]
```

### GET /categories/:id
Busca uma categoria específica.

### PATCH /categories/:id
Atualiza uma categoria.

### DELETE /categories/:id
Remove uma categoria.

### POST /categories/setup-defaults
Cria categorias padrão para o usuário.

---

## 💰 Endpoints de Transações

### POST /transactions
Cria uma nova transação.

**Request Body:**
```json
{
  "description": "Compra no supermercado",
  "amount": 150.50,
  "type": "EXPENSE",
  "paymentMethod": "DEBIT_CARD",
  "categoryId": "uuid",
  "date": "2024-01-01T00:00:00.000Z",
  "dueDate": "2024-01-05T00:00:00.000Z",
  "isPaid": true,
  "isRecurring": false,
  "recurringDay": null,
  "interestRate": 0,
  "taxRate": 0
}
```

**Response:**
```json
{
  "id": "uuid",
  "description": "Compra no supermercado",
  "amount": 150.50,
  "type": "EXPENSE",
  "paymentMethod": "DEBIT_CARD",
  "date": "2024-01-01T00:00:00.000Z",
  "isPaid": true,
  "categoryId": "uuid",
  "userId": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### POST /transactions/installments
Cria transação parcelada (múltiplas transações).

**Request Body:**
```json
{
  "description": "Compra parcelada",
  "totalAmount": 1200.00,
  "type": "EXPENSE",
  "paymentMethod": "CREDIT_CARD",
  "categoryId": "uuid",
  "installments": 12,
  "firstPaymentDate": "2024-02-01T00:00:00.000Z",
  "interestRate": 2.5
}
```

**Response:**
```json
{
  "installmentGroupId": "uuid",
  "transactions": [
    {
      "id": "uuid",
      "description": "Compra parcelada (1/12)",
      "amount": 105.00,
      "installmentNum": 1,
      "totalInstallments": 12,
      "dueDate": "2024-02-01T00:00:00.000Z"
    }
  ]
}
```

### GET /transactions
Lista transações do usuário com filtros opcionais.

**Query Parameters:**
- `type`: `INCOME` ou `EXPENSE`
- `categoryId`: UUID da categoria
- `paymentMethod`: Método de pagamento
- `dateFrom`: Data início (ISO string)
- `dateTo`: Data fim (ISO string)
- `isPaid`: `true` ou `false`
- `isRecurring`: `true` ou `false`
- `page`: Número da página
- `limit`: Itens por página

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "description": "Compra no supermercado",
      "amount": 150.50,
      "type": "EXPENSE",
      "paymentMethod": "DEBIT_CARD",
      "date": "2024-01-01T00:00:00.000Z",
      "isPaid": true,
      "category": {
        "name": "Alimentação",
        "color": "#FF5722"
      }
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

### GET /transactions/summary/:year/:month
Retorna resumo financeiro mensal.

**Response:**
```json
{
  "month": 1,
  "year": 2024,
  "totalIncome": 3000.00,
  "totalExpenses": 2500.00,
  "balance": 500.00,
  "byCategory": [
    {
      "categoryId": "uuid",
      "categoryName": "Alimentação",
      "total": 800.00,
      "type": "EXPENSE"
    }
  ],
  "byPaymentMethod": [
    {
      "paymentMethod": "DEBIT_CARD",
      "total": 1200.00
    }
  ]
}
```

### GET /transactions/installments/:groupId
Lista todas as parcelas de um grupo de parcelamento.

**Response:**
```json
[
  {
    "id": "uuid",
    "description": "Compra parcelada (1/12)",
    "amount": 105.00,
    "installmentNum": 1,
    "totalInstallments": 12,
    "dueDate": "2024-02-01T00:00:00.000Z",
    "isPaid": false
  }
]
```

### GET /transactions/:id
Busca uma transação específica.

### PATCH /transactions/:id
Atualiza uma transação.

### PATCH /transactions/:id/payment-status
Marca uma parcela como paga/não paga.

**Request Body:**
```json
{
  "isPaid": true
}
```

### DELETE /transactions/:id
Remove uma transação.

### DELETE /transactions/installments/:groupId
Remove todas as parcelas de um grupo.

---

## 💳 Métodos de Pagamento Disponíveis

O enum `PaymentMethod` inclui:

- `CASH` - Dinheiro
- `DEBIT_CARD` - Cartão de Débito
- `CREDIT_CARD` - Cartão de Crédito (pode ser parcelado)
- `PIX` - PIX
- `BANK_TRANSFER` - Transferência Bancária
- `CHECK` - Cheque
- `BOLETO` - Boleto (pode ser parcelado)
- `LOAN` - Empréstimo

---

## 📊 Tipos de Transação

- `INCOME` - Receita
- `EXPENSE` - Despesa

---

## ⚠️ Códigos de Erro Comuns

- `400 Bad Request` - Dados inválidos
- `401 Unauthorized` - Token inválido ou expirado
- `403 Forbidden` - Acesso negado
- `404 Not Found` - Recurso não encontrado
- `409 Conflict` - Email já existe (criação de usuário)
- `500 Internal Server Error` - Erro interno do servidor

---

## 🔒 Segurança

- Senhas são criptografadas com bcrypt (12 salt rounds)
- JWT tokens têm expiração de 1 dia
- Todas as operações são vinculadas ao usuário autenticado
- Validação de dados com class-validator
- Proteção contra SQL injection via Prisma ORM