# Coink - Financial Management System Documentation

Esta pasta contém diagramas de arquitetura e documentação da aplicação Coink, um sistema de gestão financeira pessoal.

## 📋 Diagramas Disponíveis

### 🏗️ [architecture-diagram.txt](./architecture-diagram.txt)
**Diagrama de Arquitetura da Aplicação**
- Visão geral da arquitetura do sistema
- Relacionamento entre frontend (Next.js) e backend (NestJS)
- Integração com banco de dados SQLite via Prisma
- Fluxo de autenticação JWT
- Estrutura do monorepo Turborepo

### 🗃️ [data-model-diagram.txt](./data-model-diagram.txt)
**Diagrama UML dos Modelos de Dados**
- Entidades: User, Category, Transaction
- Relacionamentos entre as entidades
- Enums: TransactionType, PaymentMethod
- Regras de negócio e validações
- Funcionalidades principais do sistema

### 🔄 [application-flow-diagram.txt](./application-flow-diagram.txt)
**Fluxo da Aplicação e Jornada do Usuário**
- Fluxo de autenticação (registro/login)
- Navegação principal da aplicação
- Processo de criação de transações
- Opções avançadas (parcelamento, recorrência, juros)
- Geração de relatórios e análises

### 🚀 [api-endpoints-diagram.txt](./api-endpoints-diagram.txt)
**Documentação dos Endpoints da API**
- Todos os endpoints REST da aplicação
- Parâmetros de consulta e filtros
- Exemplos de request/response
- Tratamento de erros
- Requisitos de autenticação

## 🎨 Como Usar os Diagramas

Estes diagramas são compatíveis com o **Eraser.io** (https://app.eraser.io/). Para visualizá-los:

1. Acesse https://app.eraser.io/
2. Crie um novo diagrama
3. Copie e cole o conteúdo de qualquer arquivo `.txt`
4. O diagrama será renderizado automaticamente

## 🏛️ Arquitetura Geral

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Browser   │───▶│   Next.js Web   │───▶│   NestJS API    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │  Prisma ORM     │
                                               │                 │
                                               └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │ SQLite Database │
                                               │                 │
                                               └─────────────────┘
```

## 📊 Funcionalidades Principais

- **Gestão de Categorias**: Categorias personalizadas de receitas e despesas
- **Transações Completas**: Receitas, despesas, parcelamento, recorrência
- **Cálculos Financeiros**: Juros compostos, impostos, análises
- **Relatórios**: Resumos mensais, análise por categoria
- **Autenticação**: JWT com isolamento de dados por usuário
- **Parcelamento**: Sistema completo de compras parceladas
- **API REST**: Endpoints completos com validação e filtros

## 🔧 Stack Tecnológica

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: NestJS, Prisma ORM
- **Database**: SQLite
- **Authentication**: JWT
- **Testing**: Jest (E2E)
- **Monorepo**: Turborepo
- **Package Manager**: pnpm

## 📝 Notas Técnicas

- Todos os dados são isolados por usuário
- Validação completa com class-validator
- Testes E2E abrangentes
- Suporte a diferentes métodos de pagamento
- Cálculo automático de parcelamentos
- Sistema de categorias padrão e personalizadas