/* SABAL SECURITY — site scripts (nav toggle, contact form) */
(function () {
  'use strict';

  /* ---- Mobile nav ---- */
  var toggle = document.querySelector('.nav__toggle');
  var links = document.querySelector('.nav__links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('is-open')) {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  /* ---- Contact form (Formspree, AJAX with graceful fallback) ---- */
  var form = document.querySelector('[data-formspree]');
  if (form) {
    var status = form.querySelector('.form__status');
    var button = form.querySelector('button[type="submit"]');

    var show = function (msg, isError) {
      if (!status) return;
      status.textContent = msg;
      status.classList.add('is-visible');
      status.classList.toggle('is-error', !!isError);
      status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    form.addEventListener('submit', function (e) {
      // If the endpoint hasn't been configured yet, don't post anywhere.
      if (form.action.indexOf('YOUR_FORM_ID') !== -1) {
        e.preventDefault();
        show('The contact form is not connected yet. Please check back shortly.', true);
        return;
      }
      if (!window.fetch || !window.FormData) return; // native submit fallback
      e.preventDefault();

      var label = button ? button.textContent : '';
      if (button) { button.disabled = true; button.textContent = 'Sending…'; }

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function (res) {
        if (res.ok) {
          form.reset();
          show('Thanks — your message is in. We reply within one business day.');
        } else {
          return res.json().then(function (data) {
            var msg = (data && data.errors) ? data.errors.map(function (x) { return x.message; }).join(', ')
                                             : 'Something went wrong. Please try again in a moment.';
            show(msg, true);
          });
        }
      }).catch(function () {
        show('Network error. Please try again in a moment.', true);
      }).finally(function () {
        if (button) { button.disabled = false; button.textContent = label; }
      });
    });
  }
})();
