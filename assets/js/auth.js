/* /assets/js/auth.js
   Robust auth UI:
   - supports loginForm / login-form and signupForm / signup-form
   - ensures clicked submit button name/value included even when JS calls form.submit()
   - safe null checks, password strength, basic validation
*/

(() => {
  'use strict';

  // Track last clicked submit button (for browsers that don't provide event.submitter)
  let lastClickedButton = null;
  document.addEventListener('click', (e) => {
    const btn = e.target.closest && e.target.closest('button[type="submit"], input[type="submit"]');
    if (btn) lastClickedButton = btn;
  });

  function getFormByVariants(...ids) {
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) return el;
    }
    return null;
  }

  // Ensure button's name=value is included in POST even when using form.submit()
  function includeButtonValueForSubmit(form, submitBtn) {
    if (!form || !submitBtn) return;
    try {
      const name = submitBtn.name;
      if (!name) return;
      // If there's already a form element with same name and it's hidden, update it.
      let hidden = form.querySelector('input[type="hidden"][name="' + CSS.escape(name) + '"]');
      if (!hidden) {
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = name;
        form.appendChild(hidden);
      }
      hidden.value = submitBtn.value != null ? submitBtn.value : '';
    } catch (err) {
      console.error('includeButtonValueForSubmit error', err);
    }
  }

  // Basic utilities
  function qs(selector, root = document) { return root.querySelector(selector); }
  function qsa(selector, root = document) { return Array.from(root.querySelectorAll(selector)); }
  function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || ''); }

  // Simple toast for errors (dev-friendly)
  function showToast(type, message) {
    const id = 'auth-toast-container';
    let c = document.getElementById(id);
    if (!c) {
      c = document.createElement('div');
      c.id = id;
      c.style.position = 'fixed';
      c.style.top = '16px';
      c.style.right = '16px';
      c.style.zIndex = 99999;
      document.body.appendChild(c);
    }
    const t = document.createElement('div');
    t.textContent = message;
    t.style.margin = '6px';
    t.style.padding = '8px 12px';
    t.style.borderRadius = '6px';
    t.style.boxShadow = '0 2px 6px rgba(0,0,0,0.12)';
    t.style.background = type === 'error' ? '#ffecec' : '#e8ffef';
    c.appendChild(t);
    setTimeout(() => { try { t.remove(); } catch (e) {} }, 3500);
  }

  // Field error rendering
  function showFieldError(field, message) {
    if (!field) { showToast('error', message); return; }
    const grp = field.closest('.form-group') || field.parentElement;
    if (!grp) { showToast('error', message); return; }
    let err = grp.querySelector('.field-error');
    if (!err) {
      err = document.createElement('div');
      err.className = 'field-error';
      err.style.color = '#c00';
      err.style.fontSize = '0.9rem';
      err.style.marginTop = '4px';
      grp.appendChild(err);
    }
    err.textContent = message;
    grp.classList.add('error');
  }
  function clearFieldError(field) {
    if (!field) return;
    const grp = field.closest('.form-group') || field.parentElement;
    if (!grp) return;
    grp.classList.remove('error');
    const err = grp.querySelector('.field-error');
    if (err) err.textContent = '';
  }

  // Password strength
  function calculatePasswordStrength(password) {
    if (!password) return 'none';
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score < 3) return 'weak';
    if (score < 5) return 'medium';
    return 'strong';
  }
  function updatePasswordStrengthIndicator(ind, strength) {
    if (!ind) return;
    ind.textContent = strength === 'none' ? '' : 'Strength: ' + strength;
    ind.dataset.strength = strength;
  }

  // Validation
  function validateField(input) {
    if (!input) return true;
    const v = (input.value || '').trim();
    if (input.required && v.length === 0) {
      showFieldError(input, 'This field is required');
      return false;
    }
    if (input.name === 'email' && v && !isValidEmail(v)) {
      showFieldError(input, 'Please enter a valid email');
      return false;
    }
    if (input.name === 'password' && v && v.length < 8) {
      showFieldError(input, 'Password must be at least 8 characters');
      return false;
    }
    clearFieldError(input);
    return true;
  }

  function validateForm(form) {
    if (!form) return false;
    let ok = true;
    qsa('input[required], select[required], textarea[required]', form).forEach(inp => {
      if (!validateField(inp)) ok = false;
    });
    // additional signup checks
    const isSignup = (form.id === 'signup-form' || form.id === 'signupForm' || form.classList.contains('signup'));
    if (isSignup) {
      const pw = form.querySelector('input[name="password"]')?.value || '';
      const email = form.querySelector('input[name="email"]')?.value || '';
      if (!isValidEmail(email)) { showFieldError(form.querySelector('input[name="email"]'), 'Invalid email'); ok = false; }
      if (pw.length < 8) { showFieldError(form.querySelector('input[name="password"]'), 'Password too short'); ok = false; }
    }
    return ok;
  }

  function showSignupForm() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    if (loginForm && signupForm) {
        loginForm.classList.remove('active');
        signupForm.classList.add('active');

        // Focus first input
        setTimeout(() => {
            const firstInput = signupForm.querySelector('.form-input');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }
  }

  /**
   * Show login form
   */
  function showLoginForm() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    if (loginForm && signupForm) {
        signupForm.classList.remove('active');
        loginForm.classList.add('active');

        // Focus first input
        setTimeout(() => {
            const firstInput = loginForm.querySelector('.form-input');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }
  }

  /**
   * Toggle password visibility
   */
  function togglePassword(inputName) {
    const input = document.querySelector(`input[name="${inputName}"]`);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
  }


  // Submit handler (safe)
  function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    // Submit button detection: prefer event.submitter, fallback to lastClickedButton, fallback to first submit button
    const submitBtn = event.submitter || lastClickedButton || form.querySelector('button[type="submit"], input[type="submit"]');
    // Ensure form contains a stable action key (fallback hidden)
    includeButtonValueForSubmit(form, submitBtn);

    // If you use a hidden "action" input as well, ensure it's set (defensive)
    const actionInput = form.querySelector('input[name="action"]');
    if (actionInput && !actionInput.value) {
      // choose sensible default if button name is 'login' or value present
      if (submitBtn && submitBtn.name) actionInput.value = submitBtn.name;
    }

    if (!validateForm(form)) {
      showToast('error', 'Please fix the errors');
      return;
    }

    // disable button after hidden input created (short delay to avoid losing value in some old browsers)
    if (submitBtn) {
      setTimeout(() => { try { submitBtn.disabled = true; } catch (e) {} }, 40);
    }

    // Debug log what will be sent (optional)
    try {
      const fd = new FormData(form);
      const debug = {};
      for (const [k, v] of fd.entries()) debug[k] = v;
      console.log('Submitting form data:', debug);
    } catch (e) {}

    // Normal submit (lets server handle redirect/render)
    try {
      form.submit();
    } catch (err) {
      console.error('form.submit error', err);
      showToast('error', 'Submit failed (see console).');
    }
  }

  // Toggle password visibility if you have buttons with class "toggle-password" and data-target = id or name
  function initPasswordToggles(root = document) {
    qsa('.toggle-password', root).forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = btn.dataset.target;
        if (!target) return;
        let input = document.getElementById(target) || document.querySelector(`input[name="${target}"]`);
        if (!input) return;
        input.type = (input.type === 'password') ? 'text' : 'password';
      });
    });
  }

  // Initialize forms
  function initializeAuth() {
    const loginForm = getFormByVariants('login-form', 'loginForm');
    const signupForm = getFormByVariants('signup-form', 'signupForm');
    [loginForm, signupForm].forEach(form => {
      if (!form) return;
      // Attach submit handler
      form.addEventListener('submit', handleFormSubmit);
      // Input listeners
      qsa('input[required], select[required], textarea[required]', form).forEach(inp => {
        inp.addEventListener('blur', () => validateField(inp));
        inp.addEventListener('input', () => clearFieldError(inp));
      });
      // password strength indicator (signup)
      const pw = form.querySelector('input[name="password"]');
      const pwIndicator = form.querySelector('#password-strength');
      if (pw && pwIndicator) {
        pw.addEventListener('input', () => {
          const s = calculatePasswordStrength(pw.value || '');
          updatePasswordStrengthIndicator(pwIndicator, s);
        });
      }
    });

    initPasswordToggles(document);

    // initial focus
    const active = document.querySelector('.form-container.active') || loginForm || signupForm;
    active?.querySelector('input, select, textarea')?.focus();
    console.log('auth.js initialized');
  }

  // On DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    try {
      initializeAuth();
    } catch (err) {
      console.error('auth init error', err);
      showToast('error', 'Script init failed (see console).');
    }
  });
    // expose for debug if needed
  window.__AuthUI = {
    includeButtonValueForSubmit,
    getFormByVariants,
    showSignupForm,
    showLoginForm,
    togglePassword
  };

  // expose directly for inline onclick handlers
  window.showSignupForm = showSignupForm;
  window.showLoginForm = showLoginForm;
  window.togglePassword = togglePassword;

})();
