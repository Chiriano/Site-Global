const asaas = require('../services/asaasService');

function dueDateFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function stripNonDigits(str) {
  return String(str || '').replace(/\D/g, '');
}

function validatePayload(body) {
  const { customer, items, total, billingType } = body;
  const errors = [];

  if (!customer) errors.push('Dados do cliente ausentes.');
  else {
    if (!customer.name || customer.name.trim().length < 3) errors.push('Nome inválido.');
    if (!customer.email || !/\S+@\S+\.\S+/.test(customer.email)) errors.push('E-mail inválido.');
    if (!customer.cpfCnpj || ![11, 14].includes(stripNonDigits(customer.cpfCnpj).length))
      errors.push('CPF/CNPJ inválido.');
    if (!customer.phone || stripNonDigits(customer.phone).length < 10) errors.push('Telefone inválido.');
    if (!customer.cep || stripNonDigits(customer.cep).length < 8) errors.push('CEP inválido.');
    if (!customer.address) errors.push('Endereço obrigatório.');
    if (!customer.addressNumber) errors.push('Número obrigatório.');
    if (!customer.neighborhood) errors.push('Bairro obrigatório.');
    if (!customer.city) errors.push('Cidade obrigatória.');
    if (!customer.state) errors.push('Estado obrigatório.');
  }

  if (!items || !Array.isArray(items) || items.length === 0) errors.push('Itens do pedido ausentes.');
  if (!total || isNaN(Number(total)) || Number(total) <= 0) errors.push('Valor total inválido.');
  if (!['PIX', 'BOLETO'].includes(billingType)) errors.push('Forma de pagamento inválida.');

  return errors;
}

async function createPayment(req, res) {
  const errors = validatePayload(req.body);
  if (errors.length) {
    return res.status(400).json({ success: false, errors });
  }

  const { customer, items, total, billingType } = req.body;

  try {
    const asaasCustomer = await asaas.createOrFindCustomer({
      name: customer.name.trim(),
      cpfCnpj: stripNonDigits(customer.cpfCnpj),
      email: customer.email.trim().toLowerCase(),
      mobilePhone: stripNonDigits(customer.phone),
    });

    const dueDate = billingType === 'BOLETO' ? dueDateFromNow(3) : dueDateFromNow(1);
    const description = `Alpha Convites — ${items.length} item(s)`;

    const payment = await asaas.createPayment({
      customerId: asaasCustomer.id,
      value: Number(Number(total).toFixed(2)),
      billingType,
      dueDate,
      description,
    });

    let pixData = null;
    if (billingType === 'PIX') {
      try {
        pixData = await asaas.getPixQrCode(payment.id);
      } catch (e) {
        console.warn('[Asaas] PIX QR Code indisponivel:', e.message);
      }
    }

    console.log(`[Asaas] Pagamento criado: ${payment.id} | ${billingType} | R$ ${total}`);

    return res.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        billingType: payment.billingType,
        value: payment.value,
        dueDate: payment.dueDate,
        invoiceUrl: payment.invoiceUrl || null,
        bankSlipUrl: payment.bankSlipUrl || null,
        pixData,
      },
    });
  } catch (err) {
    const asaasMsg = err.response?.data?.errors?.[0]?.description;
    const msg = asaasMsg || 'Erro ao processar pagamento. Tente novamente.';
    console.error('[Asaas] Erro:', err.response?.data || err.message);
    return res.status(502).json({ success: false, error: msg });
  }
}

async function getPaymentStatus(req, res) {
  try {
    const payment = await asaas.getPaymentStatus(req.params.id);
    return res.json({ success: true, payment });
  } catch (err) {
    console.error('[Asaas] Erro ao consultar:', err.message);
    return res.status(502).json({ success: false, error: 'Erro ao consultar pagamento.' });
  }
}

module.exports = { createPayment, getPaymentStatus };
