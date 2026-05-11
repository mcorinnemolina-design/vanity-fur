/* ============================================
   VANITY FUR CLUB — Premium Enhancements
   Preloader · Scroll Reveals
   ============================================ */

(function () {
  'use strict';

  /* ==========================================
     1. PRE-LOADER
     VFC monogram fades out once page is ready
     ========================================== */
  function initPreloader() {
    var preloader = document.getElementById('vfc-preloader');
    if (!preloader) return;

    document.body.style.overflow = 'hidden';

    window.addEventListener('load', function () {
      setTimeout(function () {
        preloader.classList.add('vfc-preloader--done');
        setTimeout(function () {
          preloader.style.display = 'none';
          document.body.style.overflow = '';
        }, 800);
      }, 400);
    });
  }

  /* ==========================================
     2. ENHANCED SCROLL REVEALS
     ========================================== */
  function initEnhancedReveal() {
    document.querySelectorAll('.reveal-stagger').forEach(function (parent) {
      var children = parent.querySelectorAll('.reveal-stagger__item, .service-card, .addon-item, .process__step');
      children.forEach(function (child, i) {
        child.style.transitionDelay = (i * 0.08) + 's';
      });
    });
  }

  /* ==========================================
     INIT ALL
     ========================================== */
  function init() {
    initPreloader();
    initEnhancedReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
