const axios = require('axios');

const ASAAS_BASE_URL =
  process.env.ASAAS_ENV === 'production'
    ? 'https://api.asaas.com/v3'
    : 'https://sandbox.asaas.com/api/v3';

function getApi() {
  const key = (process.env.ASAAS_API_KEY || '').trim();
  if (!key || key === 'SUA_CHAVE_ASAAS_AQUI') {
    console.error('[Asaas] ERRO: ASAAS_API_KEY não configurada no .env');
    console.error('[Asaas] Caminho do .env esperado: backend/.env');
    console.error('[Asaas] Variáveis carregadas:', Object.keys(process.env).filter(k => k.startsWith('ASAAS')));
  } else {
    console.log('[Asaas] API Key carregada:', key.slice(0, 12) + '...');
    console.log('[Asaas] Ambiente:', ASAAS_BASE_URL);
  }
  return axios.create({
    baseURL: ASAAS_BASE_URL,
    headers: {
      access_token: key,
      'Content-Type': 'application/json',
    },
    timeout: 15000,
  });
}

async function createOrFindCustomer({ name, cpfCnpj, email, mobilePhone }) {
  const api = getApi();
  const search = await api.get('/customers', { params: { cpfCnpj } });

  if (search.data.totalCount > 0) {
    return search.data.data[0];
  }

  const { data } = await api.post('/customers', {
    name,
    cpfCnpj,
    email,
    mobilePhone,
  });
  return data;
}

async function createPayment({ customerId, value, billingType, dueDate, description, creditCard, creditCardHolderInfo }) {
  const api = getApi();
  const body = { customer: customerId, billingType, value, dueDate, description };
  if (billingType === 'CREDIT_CARD' && creditCard) {
    body.creditCard = creditCard;
    body.creditCardHolderInfo = creditCardHolderInfo;
  }
  const { data } = await api.post('/payments', body);
  return data;
}

async function getPixQrCode(paymentId) {
  const api = getApi();
  const { data } = await api.get(`/payments/${paymentId}/pixQrCode`);
  return data;
}

async function getPaymentStatus(paymentId) {
  const api = getApi();
  const { data } = await api.get(`/payments/${paymentId}`);
  return data;
}

module.exports = { createOrFindCustomer, createPayment, getPixQrCode, getPaymentStatus };
