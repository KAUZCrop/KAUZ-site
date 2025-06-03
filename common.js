// common.js
// ─────────────────────────────────────────────────────────────────────────────
// This file contains shared JavaScript logic for About, Portfolio, and Contact pages.
// It handles the hamburger menu toggle, closing on link click, ESC key, and background click.

document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const menuOverlay = document.getElementById('menu-overlay');

  // Function to close the menu and restore scrolling
  function closeMenu() {
    menuOverlay.classList.remove('active');
    hamburger.classList.remove('active');
    document.body.style.overflow = '';
    document.body.classList.remove('menu-open');
  }

  // Toggle menu on hamburger click
  if (hamburger && menuOverlay) {
    hamburger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isOpen = menuOverlay.classList.contains('active');
      if (isOpen) {
        closeMenu();
      } else {
        menuOverlay.classList.add('active');
        hamburger.classList.add('active');
        document.body.style.overflow = 'hidden';
        document.body.classList.add('menu-open');
      }
    });

    // Close menu when clicking on any link inside the overlay
    menuOverlay.querySelectorAll('.menu-content a').forEach(link => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });
  }

  // Close menu on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOverlay.classList.contains('active')) {
      closeMenu();
    }
  });

  // Close menu when clicking outside the menu content (on the overlay background)
  if (menuOverlay) {
    menuOverlay.addEventListener('click', (e) => {
      if (e.target === menuOverlay) {
        closeMenu();
      }
    });
  }
});
