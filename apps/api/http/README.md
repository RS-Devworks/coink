# Testes da API com REST Client

Esta pasta contém arquivos `.http` para testar a API usando a extensão **REST Client** do VS Code.

## 📋 Pré-requisitos

1. **Extensão REST Client** instalada no VS Code
2. **API rodando** em `http://localhost:5000`

## 📁 Estrutura dos Arquivos

### `workflow.http`

**🚀 COMECE AQUI!** - Fluxo completo passo a passo para testar toda a API

### `auth.http`

Testes específicos do módulo de autenticação:

- Login com credenciais válidas
- Testes de validação e erro

### `user.http`

Testes completos do CRUD de usuários:

- Criar usuário
- Listar usuários
- Buscar por ID
- Atualizar dados
- Alterar senha
- Deletar usuário
- Testes de validação e autenticação

### `http-client.env.http`

Variáveis de ambiente compartilhadas

## 🔧 Como Usar

### 1. Inicie a API

```bash
cd apps/api
npm run start:dev
```

### 2. Execute os Testes

#### Opção A: Fluxo Completo (Recomendado)

1. Abra `workflow.http`
2. Execute cada request em sequência
3. Copie tokens quando solicitado

#### Opção B: Testes Específicos

1. Abra o arquivo do módulo desejado (`auth.http` ou `user.http`)
2. Execute os requests individualmente

### 3. Executar Requests

**Métodos para executar:**

- Clique em "Send Request" acima de cada request
- Use `Ctrl+Alt+R` (Windows/Linux) ou `Cmd+Alt+R` (Mac)
- Clique direito → "Send Request"

## 🔐 Autenticação

### Fluxo de Autenticação:

1. **Criar usuário** (POST `/users`)
2. **Fazer login** (POST `/auth`)
3. **Copiar o token** da resposta
4. **Usar o token** nos headers: `Authorization: Bearer SEU_TOKEN`

### Exemplo de Token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📝 Endpoints Disponíveis

### Autenticação

| Método | Endpoint | Descrição | Autenticação |
| ------ | -------- | --------- | ------------ |
| POST   | `/auth`  | Login     | ❌ Não       |

### Usuários

| Método | Endpoint              | Descrição       | Autenticação |
| ------ | --------------------- | --------------- | ------------ |
| POST   | `/users`              | Criar usuário   | ❌ Não       |
| GET    | `/users`              | Listar usuários | ✅ Sim       |
| GET    | `/users/:id`          | Buscar por ID   | ✅ Sim       |
| PATCH  | `/users/:id`          | Atualizar dados | ✅ Sim       |
| PATCH  | `/users/:id/password` | Alterar senha   | ✅ Sim       |
| DELETE | `/users/:id`          | Deletar usuário | ✅ Sim       |

## 🧪 Dados de Teste

### Usuário Padrão:

```json
{
  "name": "Usuário de Teste",
  "email": "teste@coink.com",
  "password": "senha123"
}
```

### Login:

```json
{
  "email": "teste@coink.com",
  "password": "senha123"
}
```

## ⚠️ Dicas Importantes

1. **Execute em ordem** - Alguns requests dependem de outros
2. **Copie tokens** - Necessários para endpoints protegidos
3. **Verifique a porta** - API deve estar em `localhost:5000`
4. **IDs dinâmicos** - Ajuste os IDs conforme criados no banco

## 🔍 Troubleshooting

### Erro 404 - Not Found

- ✅ Verifique se a API está rodando
- ✅ Confirme a URL base (`localhost:5000`)

### Erro 401 - Unauthorized

- ✅ Verifique se o token foi copiado corretamente
- ✅ Faça login novamente para obter novo token

### Erro 400 - Bad Request

- ✅ Verifique os dados JSON enviados
- ✅ Confirme campos obrigatórios

### Connection Refused

- ✅ Inicie a API: `npm run start:dev`
- ✅ Aguarde a API carregar completamente
