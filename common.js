// common.js - 서브 페이지(About, Portfolio, Contact) 공통 JavaScript
// 🔥 X표시 변환 완벽 수정 버전 - 간소화 및 안정성 강화

document.addEventListener('DOMContentLoaded', () => {
  console.log('🔄 Common.js loading for sub pages...');

  // ─── 🔥 새로고침 시 페이지 상단으로 이동 ───
  try {
    if (performance.getEntriesByType('navigation')[0].type === 'reload') {
      console.log('🔄 Page refresh detected, scrolling to top...');
      window.scrollTo(0, 0);
    }
  } catch (e) {
    console.log('⚠️ Navigation API not supported, continuing...');
  }

  // ─── 🔥 간소화된 요소 찾기 (더 관대한 방식) ───
  let hamburger = null;
  let menuOverlay = null;
  
  // 다양한 방법으로 요소 찾기
  function findElements() {
    hamburger = document.getElementById('hamburger') || 
                document.querySelector('.hamburger') ||
                document.querySelector('[class*="hamburger"]') ||
                document.querySelector('button.hamburger');
                
    menuOverlay = document.getElementById('menu-overlay') || 
                  document.querySelector('.menu-overlay') ||
                  document.querySelector('[class*="menu-overlay"]');
    
    return hamburger && menuOverlay;
  }

  // 요소를 찾을 때까지 재시도 (최대 3초)
  let retryCount = 0;
  const maxRetries = 30;
  
  function initializeWhenReady() {
    if (findElements()) {
      console.log('✅ Elements found:', { 
        hamburger: hamburger.tagName, 
        menuOverlay: menuOverlay.tagName 
      });
      setupHamburgerMenu();
    } else if (retryCount < maxRetries) {
      retryCount++;
      setTimeout(initializeWhenReady, 100);
    } else {
      console.error('❌ Elements not found after retries');
    }
  }

  // ─── 🔥 메뉴 닫기 함수 (간소화) ───
  function closeMenu() {
    console.log('🔴 Closing menu...');
    
    try {
      if (menuOverlay) {
        menuOverlay.classList.remove('active');
      }
      
      if (hamburger) {
        // 🔥 모든 가능한 클래스 제거
        hamburger.classList.remove('active', 'is-active', 'menu-open');
        hamburger.removeAttribute('data-state');
      }
      
      // 스크롤 복원
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      document.body.classList.remove('menu-open');
      
    } catch (e) {
      console.error('❌ Error closing menu:', e);
    }
  }

  // ─── 🔥 메뉴 열기 함수 (간소화) ───
  function openMenu() {
    console.log('🟢 Opening menu...');
    
    try {
      if (menuOverlay) {
        menuOverlay.classList.add('active');
      }
      
      if (hamburger) {
        // 🔥 모든 가능한 방법으로 active 상태 적용
        hamburger.classList.add('active', 'is-active', 'menu-open');
        hamburger.setAttribute('data-state', 'active');
      }
      
      // 배경 스크롤 방지
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollY}px`;
      document.body.classList.add('menu-open');
      
    } catch (e) {
      console.error('❌ Error opening menu:', e);
    }
  }

  // ─── 🔥 햄버거 메뉴 설정 (대폭 간소화) ───
  function setupHamburgerMenu() {
    if (!hamburger || !menuOverlay) {
      console.error('❌ Required elements missing');
      return;
    }

    // 🔥 span 요소 확인 (더 관대하게)
    const spans = hamburger.querySelectorAll('span');
    console.log('🔍 Spans found:', spans.length);
    
    // span이 없으면 자동으로 생성
    if (spans.length === 0) {
      console.log('🔧 Creating missing spans...');
      hamburger.innerHTML = '<span></span><span></span>';
    } else if (spans.length === 1) {
      console.log('🔧 Adding missing span...');
      hamburger.appendChild(document.createElement('span'));
    } else if (spans.length > 2) {
      console.log('🔧 Removing extra spans...');
      for (let i = spans.length - 1; i >= 2; i--) {
        spans[i].remove();
      }
    }

    // ─── 🔥 클릭 이벤트 (매우 간단한 버전) ───
    function handleClick(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const isOpen = menuOverlay.classList.contains('active') || 
                     hamburger.classList.contains('active') ||
                     hamburger.classList.contains('is-active') ||
                     hamburger.getAttribute('data-state') === 'active';
      
      console.log('🍔 Hamburger clicked, current state:', isOpen ? 'Open' : 'Closed');
      
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    // ─── 🔥 이벤트 리스너 등록 (모든 가능한 방법) ───
    
    // 기존 이벤트 제거
    hamburger.onclick = null;
    
    // 새 이벤트 등록
    hamburger.addEventListener('click', handleClick);
    
    // 추가 보험: onclick도 설정
    hamburger.onclick = handleClick;
    
    // 터치 이벤트도 추가
    if ('ontouchstart' in window) {
      hamburger.addEventListener('touchend', function(e) {
        e.preventDefault();
        handleClick(e);
      });
    }

    console.log('✅ Hamburger menu events registered');

    // ─── 메뉴 링크 클릭 시 메뉴 닫기 ───
    try {
      const menuLinks = menuOverlay.querySelectorAll('.menu-content a, a');
      menuLinks.forEach((link, index) => {
        link.addEventListener('click', (e) => {
          console.log(`📎 Menu link ${index + 1} clicked`);
          
          if (link.href && !link.href.includes('#')) {
            e.preventDefault();
            closeMenu();
            setTimeout(() => {
              window.location.href = link.href;
            }, 200);
          } else {
            closeMenu();
          }
        });
      });
    } catch (e) {
      console.error('❌ Error setting up menu links:', e);
    }

    // ─── ESC 키로 메뉴 닫기 ───
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuOverlay.classList.contains('active')) {
        closeMenu();
      }
    });

    // ─── 메뉴 배경 클릭 시 닫기 ───
    menuOverlay.addEventListener('click', (e) => {
      if (e.target === menuOverlay) {
        closeMenu();
      }
    });

    // ─── 윈도우 리사이즈 시 메뉴 닫기 ───
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && menuOverlay.classList.contains('active')) {
        closeMenu();
      }
    });

    // ─── 페이지 가시성 변경 시 메뉴 닫기 ───
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && menuOverlay.classList.contains('active')) {
        closeMenu();
      }
    });
  }

  // ─── Fade-up 애니메이션 처리 ───
  try {
    const fadeUpElements = document.querySelectorAll('.fade-up');
    
    if (fadeUpElements.length > 0) {
      console.log('🎭 Fade-up elements found:', fadeUpElements.length);
      
      const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            fadeObserver.unobserve(entry.target);
          }
        });
      }, { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });
      
      fadeUpElements.forEach((element) => {
        fadeObserver.observe(element);
      });
    }
  } catch (e) {
    console.error('❌ Error setting up fade-up animation:', e);
  }

  // ─── 🔥 초기화 시작 ───
  initializeWhenReady();

  // ─── 🔥 디버깅용 전역 함수 (간소화) ───
  window.debugMenu = {
    openMenu,
    closeMenu,
    hamburger: () => hamburger,
    menuOverlay: () => menuOverlay,
    isMenuOpen: () => menuOverlay ? menuOverlay.classList.contains('active') : false,
    forceToggle: () => {
      if (!hamburger) return false;
      
      // 강제로 토글
      const isActive = hamburger.classList.contains('active');
      if (isActive) {
        closeMenu();
      } else {
        openMenu();
      }
      return true;
    },
    testX: () => {
      if (!hamburger) return false;
      
      // 강제로 X 모양으로 변환
      hamburger.classList.add('active', 'is-active', 'menu-open');
      hamburger.setAttribute('data-state', 'active');
      
      console.log('🔥 Force X shape applied');
      return true;
    },
    resetHamburger: () => {
      if (!hamburger) return false;
      
      // 모든 상태 초기화
      hamburger.classList.remove('active', 'is-active', 'menu-open');
      hamburger.removeAttribute('data-state');
      
      console.log('🔄 Hamburger reset');
      return true;
    },
    checkSpans: () => {
      if (!hamburger) return 0;
      const spans = hamburger.querySelectorAll('span');
      console.log('🔍 Current spans:', spans.length);
      return spans.length;
    },
    fixSpans: () => {
      if (!hamburger) return false;
      
      // span 요소 정리 및 재생성
      hamburger.innerHTML = '<span></span><span></span>';
      console.log('🔧 Spans fixed');
      return true;
    },
    getState: () => ({
      hamburgerExists: !!hamburger,
      menuOverlayExists: !!menuOverlay,
      isActive: hamburger ? hamburger.classList.contains('active') : false,
      hasActiveClass: hamburger ? hamburger.classList.contains('active') : false,
      hasIsActiveClass: hamburger ? hamburger.classList.contains('is-active') : false,
      hasMenuOpenClass: hamburger ? hamburger.classList.contains('menu-open') : false,
      dataState: hamburger ? hamburger.getAttribute('data-state') : null,
      spansCount: hamburger ? hamburger.querySelectorAll('span').length : 0
    })
  };

  console.log('✅ Common.js initialization complete');
  
  // 개발 모드 정보
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🛠️ Development mode detected');
    console.log('🎯 Debug commands available:');
    console.log('  - window.debugMenu.forceToggle()  // 강제 토글');
    console.log('  - window.debugMenu.testX()        // 강제 X 모양');
    console.log('  - window.debugMenu.resetHamburger() // 초기화');
    console.log('  - window.debugMenu.fixSpans()     // span 수정');
    console.log('  - window.debugMenu.getState()     // 상태 확인');
  }
});

// ─── 🔥 추가 안전장치: 페이지 로드 후에도 재시도 ───
window.addEventListener('load', () => {
  setTimeout(() => {
    if (window.debugMenu && !window.debugMenu.hamburger()) {
      console.log('🔄 Retrying hamburger initialization...');
      location.reload();
    }
  }, 1000);
});

// ─── 🔥 최후의 수단: 직접 CSS 조작 ───
function forceHamburgerFix() {
  const hamburger = document.getElementById('hamburger') || document.querySelector('.hamburger');
  if (!hamburger) return;
  
  // 강제로 span 생성
  if (hamburger.querySelectorAll('span').length < 2) {
    hamburger.innerHTML = '<span></span><span></span>';
  }
  
  // 강제로 CSS 적용
  const style = document.createElement('style');
  style.innerHTML = `
    .hamburger.active span:nth-child(1) {
      transform: translate(-50%, -50%) rotate(45deg) !important;
    }
    .hamburger.active span:nth-child(2) {
      transform: translate(-50%, -50%) rotate(-45deg) !important;
    }
  `;
  document.head.appendChild(style);
  
  // 강제로 이벤트 추가
  hamburger.onclick = function() {
    this.classList.toggle('active');
    document.querySelector('.menu-overlay')?.classList.toggle('active');
  };
  
  console.log('🔧 Force fix applied');
}

// 3초 후에도 작동하지 않으면 강제 수정
setTimeout(() => {
  if (!window.debugMenu || !window.debugMenu.hamburger()) {
    console.log('🚨 Applying force fix...');
    forceHamburgerFix();
  }
}, 3000);
