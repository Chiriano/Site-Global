const axios = require('axios');

const ASAAS_BASE_URL =
  process.env.ASAAS_ENV === 'production'
    ? 'https://api.asaas.com/v3'
    : 'https://sandbox.asaas.com/api/v3';

function getApi() {
  return axios.create({
    baseURL: ASAAS_BASE_URL,
    headers: {
      access_token: process.env.ASAAS_API_KEY,
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

async function createPayment({ customerId, value, billingType, dueDate, description }) {
  const api = getApi();
  const { data } = await api.post('/payments', {
    customer: customerId,
    billingType,
    value,
    dueDate,
    description,
  });
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
