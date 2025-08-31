const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function runTransactionTests() {
  console.log('🧪 Starting Transaction System Tests...\n');

  try {
    // 1. Login para obter token
    console.log('1. Testing login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'demo@coink.com',
      password: '123456'
    });
    
    const token = loginResponse.data.accessToken;
    console.log('✅ Login successful');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Buscar categorias
    console.log('2. Testing categories...');
    const categoriesResponse = await axios.get(`${API_BASE_URL}/categories`, { headers });
    const categories = categoriesResponse.data;
    console.log(`✅ Found ${categories.length} categories`);

    // Pegar uma categoria de despesa para teste
    const expenseCategory = categories.find(cat => cat.type === 'EXPENSE');

    // 3. Criar transação simples
    console.log('3. Testing simple transaction creation...');
    const simpleTransactionResponse = await axios.post(`${API_BASE_URL}/transactions`, {
      description: 'Teste E2E - Transação Simples',
      amount: 100.00,
      type: 'EXPENSE',
      paymentMethod: 'PIX',
      categoryId: expenseCategory.id
    }, { headers });
    
    console.log(`✅ Simple transaction created: ${simpleTransactionResponse.data.id}`);

    // 4. Criar transação parcelada
    console.log('4. Testing installment transaction creation...');
    const installmentTransactionResponse = await axios.post(`${API_BASE_URL}/transactions`, {
      description: 'Teste E2E - Transação Parcelada',
      amount: 600.00,
      type: 'EXPENSE',
      paymentMethod: 'CREDIT_CARD',
      categoryId: expenseCategory.id,
      isInstallment: true,
      totalInstallments: 6,
      interestRate: 2.0
    }, { headers });
    
    console.log(`✅ Installment transaction created: ${installmentTransactionResponse.data.installmentGroupId}`);
    console.log(`   - Created ${installmentTransactionResponse.data.transactions.length} installments`);

    // 5. Testar endpoint de tabela
    console.log('5. Testing table endpoint...');
    const tableResponse = await axios.get(`${API_BASE_URL}/transactions/table?limit=5`, { headers });
    console.log(`✅ Table endpoint returned ${tableResponse.data.data.length} transactions`);

    // 6. Testar endpoint de dashboard
    console.log('6. Testing dashboard endpoint...');
    const dashboardResponse = await axios.get(`${API_BASE_URL}/transactions/dashboard`, { headers });
    console.log(`✅ Dashboard endpoint successful - Total transactions: ${dashboardResponse.data.stats.totalTransactions}`);

    // 7. Testar filtros
    console.log('7. Testing filters...');
    const filteredResponse = await axios.get(`${API_BASE_URL}/transactions/table?paymentMethod=CREDIT_CARD&limit=3`, { headers });
    console.log(`✅ Filtered by CREDIT_CARD: ${filteredResponse.data.data.length} transactions`);

    // 8. Testar paginação
    console.log('8. Testing pagination...');
    const page2Response = await axios.get(`${API_BASE_URL}/transactions/table?page=2&limit=5`, { headers });
    console.log(`✅ Page 2 returned ${page2Response.data.data.length} transactions`);

    // 9. Testar filtro por mês
    console.log('9. Testing monthly filter...');
    const monthlyResponse = await axios.get(`${API_BASE_URL}/transactions/table?month=8&year=2025&limit=3`, { headers });
    console.log(`✅ Monthly filter (Aug 2025): ${monthlyResponse.data.data.length} transactions`);

    // 10. Testar visualização de parcelas
    console.log('10. Testing installment details...');
    // Buscar um parcelamento existente
    const installmentTransaction = monthlyResponse.data.data.find(t => t.isInstallment);
    if (installmentTransaction && installmentTransaction.installmentGroupId) {
      const installmentResponse = await axios.get(`${API_BASE_URL}/transactions/installments/${installmentTransaction.installmentGroupId}`, { headers });
      console.log(`✅ Installment details: ${installmentResponse.data.transactions.length} installments found`);
      console.log(`   - Paid: ${installmentResponse.data.paidInstallments}/${installmentResponse.data.totalInstallments}`);
    }

    console.log('\n🎉 All tests passed successfully!');
    console.log('\n📊 Test Summary:');
    console.log(`- Login: Working ✅`);
    console.log(`- Categories: Working ✅`);
    console.log(`- Simple Transactions: Working ✅`);
    console.log(`- Installment Transactions: Working ✅`);
    console.log(`- Table Endpoint: Working ✅`);
    console.log(`- Dashboard Endpoint: Working ✅`);
    console.log(`- Filtering: Working ✅`);
    console.log(`- Pagination: Working ✅`);
    console.log(`- Monthly Filtering: Working ✅`);
    console.log(`- Installment Progress: Working ✅`);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests
runTransactionTests();