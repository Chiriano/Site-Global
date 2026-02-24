(function initLoginPage() {
  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const submitButton = document.getElementById('submit-btn');
  const messageBox = document.getElementById('login-message');
  const logo = document.getElementById('login-logo');

  function resolveLogo() {
    const candidates = [
      '/assets/logo/logo.png',
      'assets/logo/logo.png',
      '/assets/logo/logo-dark-2.png',
      'assets/logo/logo-dark-2.png',
      '/assets/logo/logo-white-2.png',
      'assets/logo/logo-white-2.png',
    ];

    let index = 0;
    logo.src = candidates[index];
    logo.onerror = () => {
      index += 1;
      if (index < candidates.length) {
        logo.src = candidates[index];
        return;
      }
      logo.onerror = null;
    };
  }

  function setMessage(text, type) {
    messageBox.textContent = text;
    messageBox.className = 'form-message';
    if (type === 'success') {
      messageBox.classList.add('is-success');
    }
  }

  function setLoading(isLoading) {
    submitButton.classList.toggle('is-loading', isLoading);
    submitButton.setAttribute('aria-busy', String(isLoading));
    submitButton.disabled = isLoading;
  }

  async function loginUser(email, password) {
    console.log('Login mock:', { email, passwordMask: '*'.repeat(password.length) });

    // Estrutura pronta para integração real futura:
    // return fetch('/api/auth/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, password }),
    // });

    return new Promise((resolve) => {
      setTimeout(() => resolve({ ok: true }), 1200);
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage('', '');

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      setMessage('Preencha e-mail e senha para continuar.', 'error');
      if (!email) {
        emailInput.focus();
      } else {
        passwordInput.focus();
      }
      return;
    }

    try {
      setLoading(true);
      const result = await loginUser(email, password);

      if (!result || result.ok === false) {
        setMessage('Não foi possível autenticar. Tente novamente.', 'error');
        return;
      }

      setMessage('Login validado. Integração com backend pronta para próxima etapa.', 'success');
    } catch (error) {
      setMessage('Erro inesperado no login. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  });

  resolveLogo();
})();

