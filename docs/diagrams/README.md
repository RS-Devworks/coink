# Diagramas do Sistema Coink

Este diretório contém todos os diagramas UML, de arquitetura e fluxogramas do sistema Coink, criados no padrão Eraser.io.

## 📁 Estrutura dos Diagramas

### 🏗️ Arquitetura
- **`architecture.eraser`** - Diagrama de arquitetura de desenvolvimento, mostrando a estrutura do monorepo com Turborepo, Docker e stacks internos.
- **`architecture-production.eraser`** - Diagrama de arquitetura de produção, mostrando a infraestrutura VPS com NGINX, Docker e CI/CD.

### 🎯 Casos de Uso
- **`use-case-diagram.eraser`** - Diagrama de casos de uso mostrando todas as funcionalidades principais do sistema e seus atores.

### 🏛️ Modelagem de Dados
- **`class-diagram.eraser`** - Diagrama de classes baseado no schema Prisma, mostrando as entidades principais e seus relacionamentos.
- **`entity-relationship.eraser`** - Diagrama de relacionamento de entidades (ERD) com sintaxe correta do Eraser.io para relacionamentos UML.

### 🔄 Diagramas de Sequência
- **`sequence-authentication.eraser`** - Fluxo de autenticação (login/registro) com validações e tratamento de erros.
- **`sequence-transaction.eraser`** - Fluxo de criação de transações, incluindo validações e tratamento de parcelas.
- **`sequence-dashboard.eraser`** - Fluxo de carregamento do dashboard com cálculos paralelos e atualizações.

### 📊 Fluxogramas
- **`flowchart-transaction-process.eraser`** - Processo detalhado de criação de transações com todas as validações e fluxos alternativos.
- **`flowchart-user-journey.eraser`** - Jornada completa do usuário pela aplicação, desde o acesso inicial até as funcionalidades principais.
- **`flowchart-data-flow.eraser`** - Fluxo de dados através das camadas do sistema, incluindo validações, cache e persistência.

## 🚀 Como Visualizar os Diagramas

### Opção 1: Eraser.io (Recomendado)
1. Acesse [https://app.eraser.io/](https://app.eraser.io/)
2. Crie um novo diagrama
3. Selecione "Diagram as Code"
4. Cole o conteúdo do arquivo `.eraser` desejado
5. O diagrama será renderizado automaticamente

### Opção 2: VS Code Extension
1. Instale a extensão "Eraser" no VS Code
2. Abra qualquer arquivo `.eraser`
3. Use `Ctrl+Shift+P` e execute "Eraser: Preview"

## 📋 Tecnologias Representadas

### Frontend
- **Next.js 15.5.0** - Framework React
- **React 19** - Biblioteca de interface
- **TailwindCSS v4** - Framework CSS

### Backend
- **NestJS** - Framework Node.js
- **JWT** - Autenticação
- **bcrypt** - Hash de senhas
- **Prisma** - ORM

### Banco de Dados
- **SQLite** - Banco de dados principal
- **Prisma ORM** - Mapeamento objeto-relacional

### Infraestrutura
- **Turborepo** - Gerenciamento de monorepo
- **pnpm** - Gerenciador de pacotes

## 🎨 Convenções Utilizadas

### Ícones
- `user` - Usuários e perfis
- `nextdotjs` - Frontend Next.js
- `nestjs` - Backend NestJS
- `sqlite` - Banco de dados
- `shield` - Autenticação e segurança
- `dollar` - Transações financeiras
- `dashboard` - Interface principal
- `chart` - Relatórios e analytics

### Cores
- **Azul** - Entidades principais e usuários
- **Verde** - Ações de sucesso e criação
- **Vermelho** - Erros e exclusões
- **Amarelo** - Validações e decisões
- **Roxo** - Processamento e lógica de negócio
- **Cinza** - Sistema e eventos

### Sintaxe de Relacionamentos UML
Para diagramas de classes e ERD, use a sintaxe correta do Eraser.io:

- `<` - Relacionamento um-para-muitos (1:N)
- `>` - Relacionamento muitos-para-um (N:1)
- `-` - Relacionamento um-para-um (1:1)
- `<>` - Relacionamento muitos-para-muitos (N:N)

**Exemplo:**
```eraser
users.id < orders.userId  // Um usuário pode ter muitos pedidos
orders.userId > users.id  // Muitos pedidos pertencem a um usuário
```

**Atributos:**
- `pk` - Chave primária
- `fk` - Chave estrangeira
- `unique` - Valor único

## 📝 Atualizações

Os diagramas devem ser atualizados sempre que:
- Novas funcionalidades forem adicionadas
- A arquitetura do sistema for modificada
- Novos fluxos de dados forem implementados
- Mudanças no schema do banco de dados ocorrerem

## 🔗 Links Úteis

- [Documentação Eraser.io](https://docs.eraser.io/)
- [Sintaxe Eraser.io](https://docs.eraser.io/diagram-as-code)
- [Exemplos de Diagramas](https://www.eraser.io/examples)
