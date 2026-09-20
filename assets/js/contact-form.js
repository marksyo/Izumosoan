/* 出雲創安 izumosoan.com - Contact form handler (self-hosted API). */
document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    var submitButton = form.querySelector('button[type="submit"]') ||
                       form.querySelector('.btn-primary');
    if (!submitButton) return;

    // Status message element. If the page doesn't have one, create it just
    // after the form so we can report progress inline instead of alert().
    var messageElement = document.getElementById('form-message');
    if (!messageElement) {
      messageElement = document.createElement('p');
      messageElement.id = 'form-message';
      messageElement.setAttribute('role', 'status');
      messageElement.setAttribute('aria-live', 'polite');
      messageElement.style.marginTop = '12px';
      messageElement.style.fontWeight = '700';
      form.appendChild(messageElement);
    }

    var sendingText = form.getAttribute('data-sending') || 'Sending...';
    var successText = form.getAttribute('data-success') || 'Message sent successfully.';
    var errorText = form.getAttribute('data-error') || 'Failed to send your message. Please try again later.';
    var submitText = form.getAttribute('data-submit') || submitButton.textContent;

    // Honeypot: hidden field real users never fill. izumosoan pages use
    // name="website"; kaiseix-style pages use name="_gotcha". Support both.
    var honeypot = '';
    var hpWebsite = form.querySelector('input[name="website"]');
    var hpGotcha = form.querySelector('input[name="_gotcha"]');
    if (hpWebsite) honeypot = hpWebsite.value || '';
    if (!honeypot && hpGotcha) honeypot = hpGotcha.value || '';

    var formData = new FormData(form);
    var email = formData.get('email') || '';
    // Turnstile token (empty string if the widget is not configured yet).
    var turnstileToken = formData.get('cf-turnstile-response') || '';

    var originalButtonHTML = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.textContent = sendingText;
    messageElement.style.color = '#555';
    messageElement.textContent = sendingText;

    var payload = {
      site: 'izumosoan',
      form: 'contact',
      subject: '',
      replyTo: email,
      pageUrl: window.location.href,
      turnstileToken: turnstileToken,
      _gotcha: honeypot,
      metadata: {
        language: document.documentElement.lang || 'ja',
        page: window.location.href,
        version: '1.0'
      },
      data: {
        name: formData.get('name') || '',
        company: formData.get('company') || '',
        email: email,
        message: formData.get('message') || ''
      }
    };

    try {
      var response = await fetch('https://api.yasashiikaikei.com/api/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      var result = {};
      try { result = await response.json(); } catch (e) { /* non-JSON */ }

      if (!response.ok || result.success === false) {
        var code = (result.error && result.error.code) || ('HTTP_' + response.status);
        throw new Error(code);
      }

      messageElement.style.color = '#00880f';
      var okMsg = successText;
      if (result.requestId) okMsg += ' (ID: ' + result.requestId + ')';
      messageElement.textContent = okMsg;
      form.reset();
      if (window.turnstile && typeof window.turnstile.reset === 'function') {
        try { window.turnstile.reset(); } catch (e) { /* ignore */ }
      }
    } catch (error) {
      console.error('Contact form error:', error);
      messageElement.style.color = '#c0392b';
      messageElement.textContent = errorText;
    } finally {
      submitButton.innerHTML = originalButtonHTML;
      submitButton.textContent = submitText;
      submitButton.disabled = false;
    }
  });
});
