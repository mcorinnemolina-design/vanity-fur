(function() {
    // Initialize EmailJS with your Public Key
    emailjs.init("16xWCEtdm90YFJjAB");

    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const submitBtn = document.getElementById('submit-btn');

    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();

            // Change button state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            
            formStatus.style.display = 'block';
            formStatus.style.color = 'var(--taupe)';
            formStatus.textContent = 'Processing your request...';

            // These IDs need to be set up in your EmailJS dashboard
            // Replace 'YOUR_SERVICE_ID' and 'YOUR_TEMPLATE_ID' with your actual IDs
            const serviceID = 'service_zym85cm';
            const templateID = 'template_o0ng9yj';

            emailjs.sendForm(serviceID, templateID, this)
                .then(() => {
                    formStatus.style.color = 'green';
                    formStatus.textContent = 'Message sent successfully! We will get back to you soon.';
                    contactForm.reset();
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Send Message';
                }, (error) => {
                    console.error('EmailJS Error:', error);
                    formStatus.style.color = 'red';
                    formStatus.textContent = 'Oops! Something went wrong. Please try again later or email us directly.';
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Send Message';
                });
        });
    }
})();
