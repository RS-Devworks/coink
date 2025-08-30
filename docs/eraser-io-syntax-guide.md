# Eraser.io Complete Syntax Guide

Este é um guia completo para criar diagramas no Eraser.io usando a sintaxe "diagram-as-code".

## 🎯 **Conceito Básico**

Eraser.io permite criar diagramas técnicos usando uma linguagem DSL (Domain Specific Language) simples, ao invés de arrastar caixas e setas com o mouse.

### **Vantagens:**
- ⚡ Mais rápido de desenhar
- 🎨 Bonito por padrão
- 🔧 Fácil de manter e atualizar

## 📊 **Tipos de Diagramas Suportados**

- Cloud Architecture Diagrams
- Sequence Diagrams
- Flow Charts
- Entity Relationship Diagrams
- Data Flow Diagrams
- Network Diagrams

---

## 🏗️ **Cloud Architecture Diagrams**

### **1. Nodes (Nós)**

Um node é o bloco básico mais fundamental. Consiste em um nome seguido por propriedades opcionais.

```
// Sintaxe básica
nodeName

// Com ícone
compute [icon: aws-ec2]

// Com múltiplas propriedades
webServer [icon: nginx, color: blue, label: "Web Server"]
```

**Regras:**
- Nomes de nodes devem ser únicos
- Propriedades são opcionais e ficam entre `[ ]`

### **2. Groups (Grupos)**

Grupos são contêineres que encapsulam nodes e outros grupos.

```
// Sintaxe básica
GroupName {
  node1
  node2
}

// Exemplo prático
AWS Cloud {
  VPC {
    webServer [icon: aws-ec2]
    database [icon: aws-rds]
  }
  
  Storage [icon: aws-s3]
}

// Grupos aninhados
Main {
  Frontend {
    React [icon: react]
  }
  Backend {
    API [icon: nodejs]
    DB [icon: postgresql]
  }
}
```

### **3. Properties (Propriedades)**

Propriedades são pares chave-valor entre `[ ]` que podem ser anexadas a definições de nodes e grupos.

```
node [icon: iconName, color: colorName, label: "Custom Label"]
```

**Propriedades Suportadas:**

| Propriedade | Descrição | Exemplo |
|-------------|-----------|---------|
| `icon` | Ícone anexado | `icon: aws-ec2` |
| `color` | Cor do contorno e preenchimento | `color: blue` |
| `label` | Rótulo de texto personalizado | `label: "Web Server"` |
| `colorMode` | Leveza da cor de preenchimento | `colorMode: bold` |
| `styleMode` | Enfeites visuais | `styleMode: shadow` |
| `typeface` | Estilo do texto | `typeface: clean` |

### **4. Connections (Conexões)**

```
// Tipos de conectores
NodeA > NodeB              // Seta da esquerda para direita
NodeA < NodeB              // Seta da direita para esquerda
NodeA <> NodeB             // Seta bidirecional
NodeA - NodeB              // Linha simples
NodeA -- NodeB             // Linha pontilhada

// Com rótulos
Storage > Server: Cache Hit
Database > API: Query Data
Frontend > Backend: HTTP Request

// Conexões um-para-muitos
LoadBalancer > Server1
LoadBalancer > Server2
LoadBalancer > Server3
```

### **5. Direction (Direção)**

```
direction right    // Padrão - da esquerda para direita
direction left     // Da direita para esquerda  
direction down     // De cima para baixo
direction up       // De baixo para cima
```

### **6. Title (Título)**

```
title My Architecture Diagram
title Sistema de Gestão Financeira - Coink
```

### **7. Styling Global**

```
// Configurações globais de estilo
colorMode bold
styleMode shadow
typeface clean
```

---

## 🔄 **Sequence Diagrams**

### **1. Estrutura Básica**

Cada linha consiste em duas colunas, uma seta e uma mensagem.

```
Column1 > Column2: Message
Web App > Database: Start transaction
User > Frontend: Click button
Frontend > API: Send request
API > Database: Query data
Database > API: Return results
API > Frontend: JSON response
Frontend > User: Display data
```

### **2. Tipos de Setas**

```
A > B: Seta direita
A < B: Seta esquerda
A <> B: Seta bidirecional
A - B: Linha simples
A -- B: Linha pontilhada
A --> B: Seta pontilhada
```

### **3. Propriedades de Colunas**

```
User [icon: user] > API [icon: server]: Login request
Frontend [color: blue] > Backend [color: green]: Data fetch
Client [label: "Mobile App"] > Server [label: "API Gateway"]: Request
```

### **4. Blocks (Blocos de Controle)**

```
// Loop
loop Payment Processing
  User > API: Submit payment
  API > PaymentGateway: Process
  PaymentGateway > API: Confirm
end

// Alternative
alt Successful payment
  API > User: Success message
else Failed payment
  API > User: Error message
end

// Optional
opt User is logged in
  API > Database: Update user data
end

// Parallel
par
  API > EmailService: Send confirmation
  API > NotificationService: Push notification
end

// Break
break Payment failed
  API > User: Transaction cancelled
end
```

### **5. Activations**

```
activate Server
User > Server: Request
Server > Database: Query
Database > Server: Results
Server > User: Response
deactivate Server
```

---

## 🎨 **Ícones Disponíveis**

### **Cloud Providers**
- AWS: `aws-ec2`, `aws-rds`, `aws-s3`, `aws-lambda`, `aws-api-gateway`
- Azure: `azure-vm`, `azure-sql`, `azure-storage`
- GCP: `gcp-compute`, `gcp-storage`, `gcp-database`

### **Technologies**
- Frontend: `react`, `vue`, `angular`, `nextdotjs`
- Backend: `nodejs`, `nestjs`, `express`, `fastapi`
- Database: `postgresql`, `mysql`, `mongodb`, `sqlite`
- Other: `docker`, `kubernetes`, `nginx`, `redis`

### **General**
- `user`, `server`, `database`, `shield`, `key`, `lock`, `chrome`
- `dollar`, `tag`, `chart`, `dashboard`, `credit-card`

---

## 📝 **Exemplo Completo - Cloud Architecture**

```
direction right
title Sistema de Gestão Financeira - Arquitetura

// Frontend
Client [icon: chrome, label: "Browser"]

// Application Layer  
Frontend [icon: nextdotjs, label: "Next.js App"]

// Backend Services
Backend {
  API [icon: nestjs, label: "NestJS API"]
  Auth [icon: shield, label: "JWT Auth"]
}

// Data Layer
Database [icon: sqlite, label: "SQLite DB"]
ORM [icon: prisma, label: "Prisma ORM"]

// Connections
Client > Frontend: HTTPS
Frontend > API: REST API
API > Auth: Validate
Auth > API: Token
API > ORM: Queries
ORM > Database: SQL
```

## 📝 **Exemplo Completo - Sequence Diagram**

```
title Fluxo de Autenticação

User [icon: user] > Frontend [icon: nextdotjs]: Login
Frontend > API [icon: nestjs]: POST /auth/login
API > Database [icon: sqlite]: Validate credentials

alt Valid credentials
  Database > API: User data
  API > JWT [icon: key]: Generate token
  JWT > API: Access token
  API > Frontend: Token + user info
  Frontend > User: Success + redirect
else Invalid credentials
  Database > API: Authentication failed
  API > Frontend: Error 401
  Frontend > User: Show error message
end
```

---

## ✅ **Melhores Práticas**

1. **Nomes Únicos**: Sempre use nomes únicos para nodes
2. **Organização**: Use grupos para organizar elementos relacionados
3. **Ícones Consistentes**: Use ícones que representem claramente a tecnologia
4. **Rótulos Claros**: Use labels quando o nome do node não for autoexplicativo
5. **Direção Lógica**: Escolha a direção que melhor representa o fluxo
6. **Cores Moderadas**: Use cores para destacar, não para decorar
7. **Conexões Lógicas**: Use o tipo de seta apropriado para cada relação

---

## 🚀 **Como Usar**

1. Acesse https://app.eraser.io/
2. Crie um novo diagrama
3. Selecione "Diagram as Code"
4. Cole sua sintaxe no editor
5. O diagrama é renderizado automaticamente
6. Ajuste conforme necessário

---

## 🔗 **Recursos Adicionais**

- **Documentação Oficial**: https://docs.eraser.io/
- **Exemplos**: https://www.eraser.io/examples
- **AI Diagram Generator**: Use `/` para gerar diagramas com IA
- **Suporte**: Eraser.io tem suporte para importar de outros formatos