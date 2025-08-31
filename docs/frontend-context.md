# Frontend Context - Coink Web App

## Visão Geral

O frontend da plataforma Coink é construído com Next.js 15, React 19, TailwindCSS v4 e Shadcn/ui, seguindo as melhores práticas de desenvolvimento moderno.

## Stack Tecnológica

### Core Framework
- **Next.js 15.5.0** - Framework React com SSR/SSG
- **React 19.1.0** - Biblioteca JavaScript para UI
- **TypeScript 5** - Tipagem estática

### Styling & UI
- **TailwindCSS v4** - Framework CSS utilitário
- **Shadcn/ui** - Biblioteca de componentes React
- **Radix UI** - Componentes primitivos acessíveis
- **Lucide React** - Ícones SVG
- **Next Themes** - Sistema de temas (dark mode padrão)

### State Management & Data Fetching
- **React Query (@tanstack/react-query)** - Gerenciamento de estado servidor
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de esquemas
- **Axios** - Cliente HTTP

### Autenticação
- **NextAuth.js v4** - Sistema de autenticação
- **JWT Tokens** - Autenticação baseada em tokens

### Charts & Visualizations
- **Recharts** - Biblioteca de gráficos React

## Estrutura de Pastas

```
apps/web/src/
├── app/                        # App Router (Next.js 13+)
│   ├── (auth)/                 # Grupo de rotas de autenticação
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── dashboard/              # Dashboard principal
│   │   └── _components/        # Componentes específicos do dashboard
│   ├── table/                  # Página de tabela de transações
│   │   └── _components/
│   ├── profile/                # Página de perfil
│   └── api/                    # API Routes
├── components/                 # Componentes globais
│   └── ui/                     # Componentes Shadcn/ui
├── lib/                        # Utilitários e configurações
├── hooks/                      # Custom hooks
├── server/                     # Server-side code
│   ├── actions/                # Server Actions
│   └── lib/                    # Bibliotecas server-side
├── @types/                     # Tipos TypeScript globais
└── styles/                     # Estilos globais
```

## Estado Atual da Aplicação

### Páginas Implementadas
1. **Landing Page** (`/`) - Página inicial
2. **Login** (`/login`) - Autenticação de usuários
3. **Registro** (`/register`) - Cadastro de novos usuários
4. **Dashboard** (`/dashboard`) - Painel principal com resumo financeiro
5. **Tabela** (`/table`) - Lista de transações
6. **Perfil** (`/profile`) - Dados do usuário

### Componentes Principais

#### Dashboard
- `dashboard-stats.tsx` - Cards com estatísticas financeiras
- `financial-chart.tsx` - Gráficos de receitas/despesas
- `recent-transactions.tsx` - Lista de transações recentes
- `app-sidebar.tsx` - Barra lateral de navegação

#### Transações
- `transactions-table.tsx` - Tabela de transações com filtros
- `add-transaction-modal.tsx` - Modal para adicionar transações

#### UI Components (Shadcn/ui)
- Todos os componentes do Shadcn/ui estão instalados e disponíveis
- Tema escuro configurado como padrão

### Server Actions Implementadas

#### Autenticação (`/server/actions/auth.ts`)
- Login/logout
- Registro de usuários
- Gerenciamento de sessão

#### Transações (`/server/actions/transactions.ts`)
- `getTransactions()` - Buscar transações
- `createTransaction()` - Criar transação
- `updateTransaction()` - Atualizar transação
- `deleteTransaction()` - Excluir transação

### Tipos TypeScript

#### Autenticação (`/@types/auth.ts`)
- Interfaces para login/registro
- Tipos de sessão NextAuth

#### Transações (`/@types/transaction.ts`)
```typescript
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export interface Transaction {
  id: string
  title: string
  description?: string
  amount: number
  type: TransactionType
  category: string
  date: Date
  userId: string
  createdAt: Date
  updatedAt: Date
}
```

**⚠️ DESATUALIZADO**: Os tipos atuais não correspondem ao schema do backend.

## Funcionalidades Implementadas

### ✅ Autenticação
- Login/logout com NextAuth
- Registro de usuários
- Proteção de rotas
- Gerenciamento de sessão JWT

### ✅ Dashboard
- Estatísticas financeiras básicas
- Gráficos de receitas e despesas
- Lista de transações recentes
- Navegação por sidebar

### ✅ Tabela de Transações
- Listagem de transações
- Filtros básicos
- Paginação

### ✅ Interface Responsiva
- Design responsivo com TailwindCSS
- Tema escuro como padrão
- Componentes acessíveis (Radix UI)

## Funcionalidades Pendentes de Implementação

### ❌ Sistema de Transações Completo
- **Métodos de Pagamento**: Atual sistema não suporta PIX, Cartão, Boleto
- **Parcelamento**: Não implementado
- **Categorias**: Sistema básico de categorias não integrado
- **Filtros Avançados**: Por método de pagamento, data, categoria

### ❌ Formulários de Transação
- Formulário não suporta todos os campos do backend:
  - `paymentMethod` (CASH, DEBIT_CARD, CREDIT_CARD, PIX, BOLETO, etc.)
  - `categoryId` (integração com categorias)
  - `dueDate` (data de vencimento)
  - `isInstallment` e `totalInstallments` (parcelamento)
  - `interestRate` e `taxRate` (juros e taxas)

### ❌ Categorias
- Sistema de categorias não implementado
- Não há CRUD de categorias
- Não há integração categoria ↔ transação

### ❌ Relatórios Financeiros
- Relatórios mensais não implementados
- Insights por categoria não disponíveis
- Resumos por método de pagamento não implementados

## Integração com Backend

### ✅ Configurado
- Axios configurado em `/server/lib/api.ts`
- JWT tokens passados automaticamente
- Server Actions funcionando
- Error handling básico

### ❌ Desatualizado
- URL da API: Atualmente configurada para `http://localhost:5000`
- **CORRETO**: API roda na porta `3001` conforme backend
- Tipos TypeScript não correspondem ao schema Prisma
- Endpoints não utilizados completamente (summary, installments, etc.)

## Próximos Passos Necessários

1. **Atualizar Tipos TypeScript** - Sincronizar com schema Prisma
2. **Corrigir URL da API** - Mudar de porta 5000 para 3001
3. **Implementar Sistema de Categorias** - CRUD + integração
4. **Reformular Formulário de Transações** - Incluir todos os campos
5. **Adicionar Suporte a Parcelamento** - Interface para installments
6. **Implementar Filtros Avançados** - Por método, categoria, datas
7. **Criar Relatórios** - Dashboards com insights financeiros

## Configurações de Ambiente

### Variáveis Necessárias (.env.local)
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
NEXT_PUBLIC_API_URL=http://localhost:3001/api  # CORREÇÃO NECESSÁRIA
```

## Convenções de Código

### ✅ Seguindo Boas Práticas
- Componentes funcionais com hooks
- TypeScript com tipagem rigorosa
- Server Actions para operações servidor
- Interfaces ao invés de types
- Separação client/server types
- Componentes específicos em `_components`

### ✅ Estrutura Organizacional
- Páginas seguem App Router do Next.js
- Componentes reutilizáveis em `/components`
- Hooks customizados em `/hooks`
- Utilitários em `/lib`
- Server Actions em `/server/actions`

## Status de Desenvolvimento

**Estado Atual**: 🟡 **Parcialmente Implementado**

- ✅ Estrutura base funcional
- ✅ Autenticação implementada
- ✅ Dashboard básico
- ❌ Sistema de transações incompleto
- ❌ Tipos desatualizados
- ❌ Integração com backend limitada

**Próxima Prioridade**: Sincronizar tipos e implementar sistema completo de transações com métodos de pagamento e parcelamento.