#!/bin/bash

# Script para testar a API de usuários
# Execute com: chmod +x test-api.sh && ./test-api.sh

BASE_URL="http://localhost:3000"
echo "🧪 Testando API de Usuários"
echo "=========================="

# 1. Testar login com usuário admin
echo "1. 🔐 Fazendo login com admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@coink.com",
    "password": "admin123"
  }')

echo "Response: $LOGIN_RESPONSE"

# Extrair token (requer jq)
if command -v jq &> /dev/null; then
  TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken')
  echo "Token extraído: ${TOKEN:0:50}..."
else
  echo "⚠️  jq não encontrado. Instale com: sudo apt install jq"
  echo "📝 Copie o token manualmente da resposta acima"
  read -p "Cole o token aqui: " TOKEN
fi

echo ""

# 2. Testar criação de usuário
echo "2. 👤 Criando novo usuário..."
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Usuário Teste",
    "email": "teste@example.com",
    "password": "senha123"
  }')

echo "Response: $CREATE_RESPONSE"
echo ""

# 3. Testar listagem de usuários (autenticado)
echo "3. 📋 Listando usuários (autenticado)..."
LIST_RESPONSE=$(curl -s -X GET "$BASE_URL/users" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $LIST_RESPONSE"
echo ""

# 4. Testar busca por ID
if command -v jq &> /dev/null; then
  USER_ID=$(echo $CREATE_RESPONSE | jq -r '.id')
  if [ "$USER_ID" != "null" ] && [ "$USER_ID" != "" ]; then
    echo "4. 🔍 Buscando usuário por ID ($USER_ID)..."
    GET_RESPONSE=$(curl -s -X GET "$BASE_URL/users/$USER_ID" \
      -H "Authorization: Bearer $TOKEN")
    echo "Response: $GET_RESPONSE"
    echo ""
  fi
fi

echo "✅ Testes concluídos!"
echo ""
echo "📖 Para mais testes, consulte o arquivo USER_API_README.md"
echo "🚀 Servidor rodando em: $BASE_URL"
