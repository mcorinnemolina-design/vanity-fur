/* ============================================
   VANITY FUR CLUB  -  Klaviyo Integration
   ============================================ */

(function() {
  // Klaviyo Company ID / Public API Key
  window.KLAVIYO_COMPANY_ID = window.KLAVIYO_COMPANY_ID || 'YnTR8b';

  // Initialize _learnq array for Klaviyo tracking
  window._learnq = window._learnq || [];

  // Load Klaviyo On-Site JS if Company ID is available
  if (window.KLAVIYO_COMPANY_ID && window.KLAVIYO_COMPANY_ID !== 'YOUR_KLAVIYO_COMPANY_ID') {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=' + window.KLAVIYO_COMPANY_ID;
    var firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    }
  }

  // Handle Footer Newsletter Form Submission
  document.addEventListener('DOMContentLoaded', function() {
    var form = document.getElementById('klaviyo-footer-form');
    if (!form) return;

    var emailInput = document.getElementById('klaviyo-email-input');
    var messageContainer = document.getElementById('klaviyo-newsletter-message');
    var submitBtn = form.querySelector('.footer__newsletter-btn');

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var email = emailInput ? emailInput.value.trim() : '';

      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        if (messageContainer) {
          messageContainer.textContent = 'Please enter a valid email address.';
          messageContainer.className = 'footer__newsletter-message error';
        }
        return;
      }

      // Disable button during submission
      if (submitBtn) submitBtn.disabled = true;

      // Identify subscriber in Klaviyo
      window._learnq.push(['identify', {
        '$email': email,
        '$source': 'Website Footer'
      }]);

      // Track Newsletter Subscription Event
      window._learnq.push(['track', 'Subscribed to Newsletter', {
        'Source': 'Website Footer',
        'URL': window.location.href
      }]);

      // AJAX call to Klaviyo Client Subscriptions API
      if (window.KLAVIYO_COMPANY_ID && window.KLAVIYO_COMPANY_ID !== 'YOUR_KLAVIYO_COMPANY_ID') {
        try {
          fetch('https://a.klaviyo.com/client/subscriptions/?company_id=' + window.KLAVIYO_COMPANY_ID, {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'revision': '2024-02-15'
            },
            body: JSON.stringify({
              data: {
                type: 'subscription',
                attributes: {
                  profile: {
                    data: {
                      type: 'profile',
                      attributes: {
                        email: email
                      }
                    }
                  }
                }
              }
            })
          }).catch(function(err) {
            // Silently fallback to _learnq identify
          });
        } catch(err) {}
      }

      // Feedback to User
      if (messageContainer) {
        messageContainer.textContent = 'Thank you for subscribing to Vanity Fur Club.';
        messageContainer.className = 'footer__newsletter-message success';
      }

      form.reset();
      if (submitBtn) submitBtn.disabled = false;
    });
  });
})();
