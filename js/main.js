/* ============================================
   VANITY FUR CLUB — Main Interactions
   ============================================ */

(function () {
  'use strict';

  /* --- Nav Scroll Behavior --- */
  const nav = document.getElementById('nav');
  const hero = document.getElementById('hero');

  function handleNavScroll() {
    if (!nav) return;
    const scrolled = window.scrollY > 60;
    nav.classList.toggle('nav--scrolled', scrolled);
  }

  /* --- Hamburger Toggle --- */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      const isActive = hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active', isActive);
      hamburger.setAttribute('aria-expanded', isActive);
      document.body.style.overflow = isActive ? 'hidden' : '';
    });

    // Close on link click
    const mobileLinks = mobileMenu.querySelectorAll('.mobile-menu__link');
    mobileLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* --- Scroll Reveal (IntersectionObserver) --- */
  function initScrollReveal() {
    var revealElements = document.querySelectorAll('.reveal, .reveal-stagger');

    if (!revealElements.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* --- Hero Image Parallax Settle --- */
  function initHeroImage() {
    var heroImage = document.getElementById('hero-image');
    if (heroImage) {
      // Slight delay for the settle effect
      setTimeout(function () {
        heroImage.classList.add('loaded');
      }, 200);
    }
  }

  /* --- Gallery Drag-to-Scroll --- */
  function initGalleryDrag() {
    var track = document.getElementById('gallery-track');
    if (!track) return;

    var isDown = false;
    var startX;
    var scrollLeft;

    track.addEventListener('mousedown', function (e) {
      isDown = true;
      track.style.cursor = 'grabbing';
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });

    track.addEventListener('mouseleave', function () {
      isDown = false;
      track.style.cursor = 'grab';
    });

    track.addEventListener('mouseup', function () {
      isDown = false;
      track.style.cursor = 'grab';
    });

    track.addEventListener('mousemove', function (e) {
      if (!isDown) return;
      e.preventDefault();
      var x = e.pageX - track.offsetLeft;
      var walk = (x - startX) * 1.5;
      track.scrollLeft = scrollLeft - walk;
    });
  }

  /* --- Gallery Navigation Buttons --- */
  function initGalleryNav() {
    var track = document.getElementById('gallery-track');
    var prevBtn = document.getElementById('gallery-prev');
    var nextBtn = document.getElementById('gallery-next');

    if (!track || !prevBtn || !nextBtn) return;

    function getScrollAmount() {
      var firstItem = track.querySelector('.gallery__item');
      return firstItem ? firstItem.offsetWidth + 24 : 400; 
    }

    prevBtn.addEventListener('click', function () {
      track.scrollBy({
        left: -getScrollAmount(),
        behavior: 'smooth'
      });
    });

    nextBtn.addEventListener('click', function () {
      track.scrollBy({
        left: getScrollAmount(),
        behavior: 'smooth'
      });
    });
  }

  /* --- Smooth Scroll for Anchor Links --- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;

        var target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          var offsetTop = target.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth',
          });
        }
      });
    });
  }

  /* --- Initialize --- */
  function init() {
    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll(); // Check initial state
    initScrollReveal();
    initHeroImage();
    initGalleryDrag();
    initGalleryNav();
    initSmoothScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
