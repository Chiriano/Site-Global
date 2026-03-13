(function () {
  'use strict';

  var BASE_URL = 'http://localhost:3000';
  var ASAAS_API = BASE_URL + '/api/asaas/payment';

  /* =============================================
     UTILITÁRIOS
     ============================================= */
  function fmt(value) {
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function digits(str) {
    return String(str || '').replace(/\D/g, '');
  }

  function buildImageUrl(url) {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return BASE_URL + url;
    return BASE_URL + '/' + url;
  }

  /* =============================================
     MÁSCARAS
     ============================================= */
  function maskCpfCnpj(value) {
    var v = digits(value);
    if (v.length <= 11) {
      return v.replace(/(\d{3})(\d)/, '$1.$2')
               .replace(/(\d{3})(\d)/, '$1.$2')
               .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return v.replace(/(\d{2})(\d)/, '$1.$2')
             .replace(/(\d{3})(\d)/, '$1.$2')
             .replace(/(\d{3})(\d)/, '$1/$2')
             .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }

  function maskPhone(value) {
    var v = digits(value).slice(0, 11);
    if (v.length <= 10) {
      return v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trimEnd().replace(/-$/, '');
    }
    return v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trimEnd().replace(/-$/, '');
  }

  function maskCep(value) {
    var v = digits(value).slice(0, 8);
    return v.replace(/(\d{5})(\d{0,3})/, '$1-$2').replace(/-$/, '');
  }

  function maskCardNumber(value) {
    return digits(value).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  function maskCardExpiry(value) {
    var v = digits(value).slice(0, 4);
    if (v.length >= 3) return v.slice(0, 2) + '/' + v.slice(2);
    return v;
  }

  /* =============================================
     VALIDAÇÃO DE CPF/CNPJ
     ============================================= */
  function validateCpf(cpf) {
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    var sum = 0;
    for (var i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
    var r = (sum * 10) % 11;
    if (r === 10 || r === 11) r = 0;
    if (r !== parseInt(cpf[9])) return false;
    sum = 0;
    for (var j = 0; j < 10; j++) sum += parseInt(cpf[j]) * (11 - j);
    r = (sum * 10) % 11;
    if (r === 10 || r === 11) r = 0;
    return r === parseInt(cpf[10]);
  }

  function validateCnpj(cnpj) {
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
    var calc = function (d, n) {
      var s = 0, p = n - 7;
      for (var i = 0; i < n; i++) {
        s += parseInt(d[i]) * p--;
        if (p < 2) p = 9;
      }
      var r = s % 11;
      return r < 2 ? 0 : 11 - r;
    };
    return calc(cnpj, 12) === parseInt(cnpj[12]) && calc(cnpj, 13) === parseInt(cnpj[13]);
  }

  function isCpfCnpjValid(raw) {
    var v = digits(raw);
    if (v.length === 11) return validateCpf(v);
    if (v.length === 14) return validateCnpj(v);
    return false;
  }

  /* =============================================
     CONSULTA DE CEP (ViaCEP)
     ============================================= */
  function fetchCep(cep) {
    var clean = digits(cep);
    if (clean.length !== 8) return;

    fetch('https://viacep.com.br/ws/' + clean + '/json/')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.erro) return;
        var address = document.getElementById('ck-address');
        var neighborhood = document.getElementById('ck-neighborhood');
        var city = document.getElementById('ck-city');
        var state = document.getElementById('ck-state');
        if (address && !address.value)     address.value = data.logradouro || '';
        if (neighborhood && !neighborhood.value) neighborhood.value = data.bairro || '';
        if (city && !city.value)           city.value = data.localidade || '';
        if (state && data.uf)              state.value = data.uf;
      })
      .catch(function () {});
  }

  /* =============================================
     RENDERIZAÇÃO DO RESUMO
     ============================================= */
  function renderOrderSummary(cart) {
    var container = document.getElementById('order-items');
    var subtotalEl = document.getElementById('ck-subtotal');
    var totalEl = document.getElementById('ck-total');
    if (!container) return;

    var total = window.CartStore.calculateTotal(cart);

    container.innerHTML = cart.map(function (item) {
      var img = buildImageUrl(item.image_url);
      var subtotal = Number(item.price) * Number(item.quantity);
      return '<div class="order-item">' +
        (img
          ? '<img class="order-item__img" src="' + img + '" alt="' + item.name + '">'
          : '<div class="order-item__img-placeholder"><i class="fas fa-image" style="color:#d1d5db"></i></div>') +
        '<div class="order-item__info">' +
          '<div class="order-item__name">' + item.name + '</div>' +
          '<div class="order-item__qty">Qtd: ' + item.quantity + '</div>' +
        '</div>' +
        '<div class="order-item__price">' + fmt(subtotal) + '</div>' +
      '</div>';
    }).join('');

    if (subtotalEl) subtotalEl.textContent = fmt(total);
    if (totalEl)    totalEl.textContent    = fmt(total);
  }

  /* =============================================
     VALIDAÇÃO DO FORMULÁRIO
     ============================================= */
  function setFieldError(groupId, hasError) {
    var g = document.getElementById(groupId);
    if (!g) return;
    if (hasError) g.classList.add('has-error');
    else          g.classList.remove('has-error');
  }

  function validateForm() {
    var valid = true;

    var name = document.getElementById('ck-name').value.trim();
    var nameOk = name.length >= 3;
    setFieldError('fg-name', !nameOk);
    if (!nameOk) valid = false;

    var cpfCnpj = document.getElementById('ck-cpfcnpj').value;
    var cpfOk = isCpfCnpjValid(cpfCnpj);
    setFieldError('fg-cpfcnpj', !cpfOk);
    if (!cpfOk) valid = false;

    var email = document.getElementById('ck-email').value.trim();
    var emailOk = /\S+@\S+\.\S+/.test(email);
    setFieldError('fg-email', !emailOk);
    if (!emailOk) valid = false;

    var phone = document.getElementById('ck-phone').value;
    var phoneOk = digits(phone).length >= 10;
    setFieldError('fg-phone', !phoneOk);
    if (!phoneOk) valid = false;

    var cep = document.getElementById('ck-cep').value;
    var cepOk = digits(cep).length === 8;
    setFieldError('fg-cep', !cepOk);
    if (!cepOk) valid = false;

    var address = document.getElementById('ck-address').value.trim();
    var addrOk = address.length > 0;
    setFieldError('fg-address', !addrOk);
    if (!addrOk) valid = false;

    var number = document.getElementById('ck-number').value.trim();
    var numOk = number.length > 0;
    setFieldError('fg-number', !numOk);
    if (!numOk) valid = false;

    var neighborhood = document.getElementById('ck-neighborhood').value.trim();
    var neighOk = neighborhood.length > 0;
    setFieldError('fg-neighborhood', !neighOk);
    if (!neighOk) valid = false;

    var city = document.getElementById('ck-city').value.trim();
    var cityOk = city.length > 0;
    setFieldError('fg-city', !cityOk);
    if (!cityOk) valid = false;

    var state = document.getElementById('ck-state').value;
    var stateOk = state.length > 0;
    setFieldError('fg-state', !stateOk);
    if (!stateOk) valid = false;

    // Validação dos campos do cartão (só quando CREDIT_CARD selecionado)
    if (getSelectedBillingType() === 'CREDIT_CARD') {
      var cardNumber = digits(document.getElementById('ck-card-number').value);
      var cardNumOk = cardNumber.length === 16;
      setFieldError('fg-card-number', !cardNumOk);
      if (!cardNumOk) valid = false;

      var cardName = document.getElementById('ck-card-name').value.trim();
      var cardNameOk = cardName.length >= 3 && cardName.indexOf(' ') > 0;
      setFieldError('fg-card-name', !cardNameOk);
      if (!cardNameOk) valid = false;

      var cardExpiry = document.getElementById('ck-card-expiry').value;
      var expiryDigits = digits(cardExpiry);
      var expiryOk = expiryDigits.length === 4 && parseInt(expiryDigits.slice(0,2)) >= 1 && parseInt(expiryDigits.slice(0,2)) <= 12;
      setFieldError('fg-card-expiry', !expiryOk);
      if (!expiryOk) valid = false;

      var cvv = digits(document.getElementById('ck-card-cvv').value);
      var cvvOk = cvv.length >= 3 && cvv.length <= 4;
      setFieldError('fg-card-cvv', !cvvOk);
      if (!cvvOk) valid = false;
    }

    return valid;
  }

  /* =============================================
     RESULTADO DO PAGAMENTO
     ============================================= */
  function showPixResult(payment) {
    var pix = payment.pixData;
    var resultEl = document.getElementById('payment-result');
    var qrHtml = '';

    if (pix && pix.encodedImage) {
      qrHtml = '<img src="data:image/png;base64,' + pix.encodedImage + '" alt="QR Code PIX">';
    } else {
      qrHtml = '<p style="color:#6b7280;font-size:13px;">QR Code será disponibilizado em breve.</p>';
    }

    var payload = (pix && pix.payload) ? pix.payload : '';

    resultEl.innerHTML =
      '<div class="result-card success">' +
        '<div class="result-icon"><i class="fas fa-check-circle"></i></div>' +
        '<div class="result-title">Cobrança PIX gerada!</div>' +
        '<div class="result-subtitle">Escaneie o QR Code ou copie o código para pagar.</div>' +
        '<div class="pix-box">' +
          qrHtml +
          (payload
            ? '<div class="pix-copy-label">Código PIX Copia e Cola:</div>' +
              '<div class="pix-copy-wrap">' +
                '<div class="pix-code" id="pix-code-text">' + payload + '</div>' +
                '<button class="btn-copy" id="btn-copy-pix">Copiar</button>' +
              '</div>'
            : '') +
        '</div>' +
        '<div style="font-size:13px;color:#6b7280;margin-bottom:8px;">' +
          'ID do pedido: <strong>' + payment.id + '</strong>' +
        '</div>' +
        '<div class="result-actions">' +
          '<a href="index.html" class="btn-back"><i class="fas fa-store"></i> Continuar comprando</a>' +
        '</div>' +
      '</div>';

    resultEl.style.display = 'block';
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

    var copyBtn = document.getElementById('btn-copy-pix');
    if (copyBtn && payload) {
      copyBtn.addEventListener('click', function () {
        navigator.clipboard.writeText(payload).then(function () {
          copyBtn.textContent = 'Copiado!';
          copyBtn.classList.add('copied');
          setTimeout(function () {
            copyBtn.textContent = 'Copiar';
            copyBtn.classList.remove('copied');
          }, 3000);
        });
      });
    }
  }

  function showCreditCardResult(payment) {
    var resultEl = document.getElementById('payment-result');
    var approved = payment.status === 'CONFIRMED' || payment.status === 'RECEIVED';
    resultEl.innerHTML =
      '<div class="result-card ' + (approved ? 'success' : 'error') + '">' +
        '<div class="result-icon"><i class="fas fa-' + (approved ? 'check-circle' : 'times-circle') + '"></i></div>' +
        '<div class="result-title">' + (approved ? 'Pagamento aprovado!' : 'Pagamento não aprovado') + '</div>' +
        '<div class="result-subtitle">' + (approved ? 'Seu pedido foi confirmado com sucesso.' : 'Verifique os dados do cartão e tente novamente.') + '</div>' +
        '<div style="font-size:13px;color:#6b7280;margin-bottom:16px;">' +
          'ID do pedido: <strong>' + payment.id + '</strong>' +
        '</div>' +
        '<div class="result-actions">' +
          (approved
            ? '<a href="index.html" class="btn-back"><i class="fas fa-store"></i> Continuar comprando</a>'
            : '<button class="btn-back" onclick="document.getElementById(\'payment-result\').style.display=\'none\'">Tentar novamente</button>') +
        '</div>' +
      '</div>';
    resultEl.style.display = 'block';
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showBoletoResult(payment) {
    var resultEl = document.getElementById('payment-result');
    var link = payment.bankSlipUrl || payment.invoiceUrl || '#';
    var due = payment.dueDate
      ? new Date(payment.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')
      : '3 dias úteis';

    resultEl.innerHTML =
      '<div class="result-card success">' +
        '<div class="result-icon"><i class="fas fa-file-invoice-dollar"></i></div>' +
        '<div class="result-title">Boleto gerado com sucesso!</div>' +
        '<div class="result-subtitle">Pague até a data de vencimento para confirmar seu pedido.</div>' +
        '<div class="boleto-box">' +
          '<div class="boleto-info">' +
            'Valor: <strong>' + fmt(payment.value) + '</strong><br>' +
            'Vencimento: <strong>' + due + '</strong>' +
          '</div>' +
          '<a href="' + link + '" target="_blank" rel="noopener" class="btn-boleto">' +
            '<i class="fas fa-print"></i> Visualizar / Imprimir Boleto' +
          '</a>' +
        '</div>' +
        '<div style="font-size:13px;color:#6b7280;margin-bottom:8px;margin-top:16px;">' +
          'ID do pedido: <strong>' + payment.id + '</strong>' +
        '</div>' +
        '<div class="result-actions">' +
          '<a href="index.html" class="btn-back"><i class="fas fa-store"></i> Continuar comprando</a>' +
        '</div>' +
      '</div>';

    resultEl.style.display = 'block';
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showErrorResult(message) {
    var resultEl = document.getElementById('payment-result');
    resultEl.innerHTML =
      '<div class="result-card error">' +
        '<div class="result-icon"><i class="fas fa-times-circle"></i></div>' +
        '<div class="result-title">Erro ao processar pagamento</div>' +
        '<div class="result-subtitle">' + message + '</div>' +
        '<div class="result-actions">' +
          '<button class="btn-back" onclick="document.getElementById(\'payment-result\').style.display=\'none\'">' +
            'Tentar novamente' +
          '</button>' +
          '<a href="cart.html" class="btn-back">Voltar ao carrinho</a>' +
        '</div>' +
      '</div>';
    resultEl.style.display = 'block';
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* =============================================
     SUBMISSÃO
     ============================================= */
  function setLoading(active) {
    var btn = document.getElementById('btn-pay');
    var loader = document.getElementById('ck-loader');
    if (btn)    btn.disabled = active;
    if (loader) loader.classList.toggle('visible', active);
  }

  function getSelectedBillingType() {
    var checked = document.querySelector('input[name="billingType"]:checked');
    return checked ? checked.value : 'PIX';
  }

  function handlePay() {
    if (!validateForm()) {
      var firstError = document.querySelector('.has-error input, .has-error select');
      if (firstError) firstError.focus();
      return;
    }

    var cart = window.CartStore.getCart();
    if (!cart.length) {
      window.location.href = 'cart.html';
      return;
    }

    var total = Number(window.CartStore.calculateTotal(cart).toFixed(2));
    var billingType = getSelectedBillingType();

    var payload = {
      customer: {
        name:            document.getElementById('ck-name').value.trim(),
        cpfCnpj:         digits(document.getElementById('ck-cpfcnpj').value),
        email:           document.getElementById('ck-email').value.trim(),
        phone:           digits(document.getElementById('ck-phone').value),
        cep:             digits(document.getElementById('ck-cep').value),
        address:         document.getElementById('ck-address').value.trim(),
        addressNumber:   document.getElementById('ck-number').value.trim(),
        complement:      document.getElementById('ck-complement').value.trim(),
        neighborhood:    document.getElementById('ck-neighborhood').value.trim(),
        city:            document.getElementById('ck-city').value.trim(),
        state:           document.getElementById('ck-state').value,
      },
      items: cart.map(function (item) {
        return { product_id: item.id, name: item.name, quantity: item.quantity, price: item.price };
      }),
      total:       total,
      billingType: billingType,
    };

    if (billingType === 'CREDIT_CARD') {
      var expiryDigits = digits(document.getElementById('ck-card-expiry').value);
      payload.creditCard = {
        holderName:  document.getElementById('ck-card-name').value.trim().toUpperCase(),
        number:      digits(document.getElementById('ck-card-number').value),
        expiryMonth: expiryDigits.slice(0, 2),
        expiryYear:  '20' + expiryDigits.slice(2, 4),
        ccv:         digits(document.getElementById('ck-card-cvv').value),
      };
      payload.creditCardHolderInfo = {
        name:          payload.customer.name,
        email:         payload.customer.email,
        cpfCnpj:       payload.customer.cpfCnpj,
        postalCode:    payload.customer.cep,
        addressNumber: payload.customer.addressNumber,
        phone:         payload.customer.phone,
      };
    }

    setLoading(true);
    document.getElementById('payment-result').style.display = 'none';

    fetch(ASAAS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        setLoading(false);
        if (!data.success) {
          showErrorResult(data.error || (data.errors && data.errors.join(' ')) || 'Erro desconhecido.');
          return;
        }
        if (data.payment.billingType !== 'CREDIT_CARD' || data.payment.status === 'CONFIRMED' || data.payment.status === 'RECEIVED') {
          window.CartStore.clearCart();
        }
        if (data.payment.billingType === 'PIX') {
          showPixResult(data.payment);
        } else if (data.payment.billingType === 'CREDIT_CARD') {
          showCreditCardResult(data.payment);
        } else {
          showBoletoResult(data.payment);
        }
      })
      .catch(function (err) {
        setLoading(false);
        showErrorResult('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
        console.error('[Checkout] Erro de rede:', err);
      });
  }

  /* =============================================
     INICIALIZAÇÃO
     ============================================= */
  document.addEventListener('DOMContentLoaded', function () {
    var cart = window.CartStore ? window.CartStore.getCart() : [];

    if (!cart.length) {
      window.location.href = 'cart.html';
      return;
    }

    renderOrderSummary(cart);

    // Atualizar contador do header
    var counts = document.querySelectorAll('.cart-count');
    var count = window.CartStore.countItems();
    counts.forEach(function (el) { el.textContent = '(' + count + ')'; });

    // Máscaras
    var cpfEl   = document.getElementById('ck-cpfcnpj');
    var phoneEl = document.getElementById('ck-phone');
    var cepEl   = document.getElementById('ck-cep');

    cpfEl.addEventListener('input', function () {
      this.value = maskCpfCnpj(this.value);
    });

    phoneEl.addEventListener('input', function () {
      this.value = maskPhone(this.value);
    });

    cepEl.addEventListener('input', function () {
      this.value = maskCep(this.value);
    });

    cepEl.addEventListener('blur', function () {
      fetchCep(this.value);
    });

    // Cartão — máscaras e toggle de visibilidade
    var cardNumberEl = document.getElementById('ck-card-number');
    var cardExpiryEl = document.getElementById('ck-card-expiry');
    var cardCvvEl    = document.getElementById('ck-card-cvv');
    var cardNameEl   = document.getElementById('ck-card-name');
    var cardFields   = document.getElementById('card-fields');

    if (cardNumberEl) cardNumberEl.addEventListener('input', function () { this.value = maskCardNumber(this.value); });
    if (cardExpiryEl) cardExpiryEl.addEventListener('input', function () { this.value = maskCardExpiry(this.value); });
    if (cardCvvEl)    cardCvvEl.addEventListener('input',    function () { this.value = digits(this.value).slice(0, 4); });
    if (cardNameEl)   cardNameEl.addEventListener('input',   function () { this.value = this.value.toUpperCase(); });

    document.querySelectorAll('input[name="billingType"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        if (cardFields) cardFields.style.display = this.value === 'CREDIT_CARD' ? 'block' : 'none';
      });
    });

    // Botão pagar
    var btnPay = document.getElementById('btn-pay');
    if (btnPay) btnPay.addEventListener('click', handlePay);
  });
})();
