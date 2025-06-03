// common.js
// ─────────────────────────────────────────────────────────────────────────────
// This file contains shared JavaScript logic for About, Portfolio, and Contact pages.
// 햄버거 클릭 시 .active 토글, 메뉴 오버레이 닫기(ESC, 배경, 링크 클릭) 등을 처리

document.addEventListener('DOMContentLoaded', () => {
  const hamburger   = document.getElementById('hamburger');
  const menuOverlay = document.getElementById('menu-overlay');

  function closeMenu() {
    menuOverlay.classList.remove('active');
    hamburger.classList.remove('active');
    document.body.style.overflow = '';
    document.body.classList.remove('menu-open');
  }

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

    // 메뉴 내 링크 클릭 시 메뉴 닫기
    menuOverlay.querySelectorAll('.menu-content a').forEach(link => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });
  }

  // ESC 키 눌러도 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOverlay.classList.contains('active')) {
      closeMenu();
    }
  });

  // 메뉴 배경 클릭 시 닫기
  if (menuOverlay) {
    menuOverlay.addEventListener('click', (e) => {
      if (e.target === menuOverlay) {
        closeMenu();
      }
    });
  }
});
