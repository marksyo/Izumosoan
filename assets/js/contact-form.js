(function() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    emailjs.init('43OQ_Ry644Q3c0bdc');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        var btn = form.querySelector('.btn-primary');
        btn.disabled = true;
        btn.textContent = btn.getAttribute('data-sending') || 'Sending...';

        emailjs.sendForm('izumosoan_contact', 'template_l4qxgu6', form)
            .then(function() {
                var msg = form.getAttribute('data-success') || 'Sent successfully!';
                alert(msg);
                form.reset();
            })
            .catch(function() {
                var msg = form.getAttribute('data-error') || 'Failed to send. Please try again.';
                alert(msg);
            })
            .finally(function() {
                btn.disabled = false;
                btn.textContent = btn.getAttribute('data-submit') || 'Submit';
            });
    });
})();
