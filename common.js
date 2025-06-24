// common.js - 서브 페이지(About, Portfolio, Contact) 공통 JavaScript
// 🔥 X표시 변환 완벽 수정 버전 - 햄버거 표시 오류 해결

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Common.js loading for sub pages...');

  // ─── 🔥 새로고침 시 페이지 상단으로 이동 ───
  try {
    if (performance.getEntriesByType('navigation')[0].type === 'reload') {
      console.log('🔄 Page refresh detected, scrolling to top...');
      window.scrollTo(0, 0);
    }
  } catch (e) {
    console.log('⚠️ Navigation API not supported, continuing...');
  }

  // ─── 🔥 전역 변수 선언 및 초기화 ───
  let hamburger = null;
  let menuOverlay = null;
  
  console.log('📋 Starting element search...');

  // ─── 🔥 요소 찾기 함수 (더 안정적) ───
  function findElements() {
    // 햄버거 메뉴 찾기 - 더 광범위한 검색
    hamburger = document.getElementById('hamburger') || 
                document.querySelector('.hamburger') ||
                document.querySelector('[class*="hamburger"]') ||
                document.querySelector('button[id*="hamburger"]') ||
                document.querySelector('button.hamburger');
                
    // 메뉴 오버레이 찾기 - 더 광범위한 검색           
    menuOverlay = document.getElementById('menu-overlay') || 
                  document.querySelector('.menu-overlay') ||
                  document.querySelector('[class*="menu-overlay"]') ||
                  document.querySelector('div.menu-overlay');
    
    console.log('🔍 Element search result:', {
      hamburger: hamburger ? hamburger.tagName + '#' + (hamburger.id || 'no-id') + '.' + (hamburger.className || 'no-class') : null,
      menuOverlay: menuOverlay ? menuOverlay.tagName + '#' + (menuOverlay.id || 'no-id') + '.' + (menuOverlay.className || 'no-class') : null
    });
    
    return hamburger && menuOverlay;
  }

  // ─── 🔥 햄버거 메뉴 초기화 함수 ───
  function initializeHamburger() {
    if (!hamburger) {
      console.warn('❌ Hamburger element not found');
      return false;
    }

    console.log('🔧 Initializing hamburger menu...');

    // span 요소 확인 및 생성
    const spans = hamburger.querySelectorAll('span');
    console.log('📊 Current spans:', spans.length);
    
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

    // 확실하게 표시되도록 설정
    hamburger.style.display = 'flex';
    hamburger.style.visibility = 'visible';
    hamburger.style.opacity = '1';

    console.log('✅ Hamburger initialized and visible');
    return true;
  }

  // ─── 🔥 메뉴 닫기 함수 ───
  function closeMenu() {
    console.log('🔴 Closing menu...');
    
    try {
      if (menuOverlay) {
        menuOverlay.classList.remove('active');
      }
      
      if (hamburger) {
        // 모든 가능한 클래스 제거
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

  // ─── 🔥 메뉴 열기 함수 ───
  function openMenu() {
    console.log('🟢 Opening menu...');
    
    try {
      if (menuOverlay) {
        menuOverlay.classList.add('active');
      }
      
      if (hamburger) {
        // 모든 가능한 방법으로 active 상태 적용
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

  // ─── 🔥 햄버거 메뉴 이벤트 설정 ───
  function setupHamburgerEvents() {
    if (!hamburger || !menuOverlay) {
      console.error('❌ Required elements missing for hamburger events');
      return false;
    }

    console.log('🎯 Setting up hamburger events...');

    // 클릭 이벤트 핸들러
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

    // 기존 이벤트 리스너 제거 (중복 방지)
    hamburger.removeEventListener('click', handleClick);
    hamburger.onclick = null;
    
    // 새 이벤트 리스너 등록
    hamburger.addEventListener('click', handleClick);
    
    // 추가 보험: onclick도 설정
    hamburger.onclick = handleClick;
    
    // 터치 이벤트도 추가
    if ('ontouchstart' in window) {
      hamburger.removeEventListener('touchend', handleClick);
      hamburger.addEventListener('touchend', function(e) {
        e.preventDefault();
        handleClick(e);
      });
    }

    console.log('✅ Hamburger events registered successfully');

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

    return true;
  }

  // ─── 🔥 요소 초기화 재시도 로직 ───
  let retryCount = 0;
  const maxRetries = 50; // 5초간 재시도
  
  function initializeWhenReady() {
    console.log(`🔄 Initialization attempt ${retryCount + 1}/${maxRetries}`);
    
    if (findElements()) {
      console.log('✅ All elements found, proceeding with initialization...');
      
      if (initializeHamburger()) {
        setupHamburgerEvents();
        console.log('🎉 Hamburger menu fully initialized!');
        return true;
      }
    }
    
    if (retryCount < maxRetries) {
      retryCount++;
      setTimeout(initializeWhenReady, 100);
    } else {
      console.error('❌ Failed to initialize after maximum retries');
      // 최후의 수단: 강제 생성
      createFallbackElements();
    }
    
    return false;
  }

  // ─── 🔥 최후의 수단: 요소 강제 생성 ───
  function createFallbackElements() {
    console.log('🚨 Creating fallback elements...');
    
    // 햄버거 요소가 없으면 생성
    if (!hamburger) {
      hamburger = document.createElement('button');
      hamburger.id = 'hamburger';
      hamburger.className = 'hamburger';
      hamburger.innerHTML = '<span></span><span></span>';
      document.body.appendChild(hamburger);
      console.log('🔧 Fallback hamburger created');
    }
    
    // 메뉴 오버레이가 없으면 생성
    if (!menuOverlay) {
      menuOverlay = document.createElement('div');
      menuOverlay.id = 'menu-overlay';
      menuOverlay.className = 'menu-overlay';
      menuOverlay.innerHTML = `
        <div class="menu-content">
          <a href="index.html">Home</a>
          <a href="about.html">About</a>
          <a href="portfolio.html">Portfolio</a>
          <a href="contact.html">Contact</a>
          <a href="mailto:hello@kauzcorp.com">E-mail</a>
        </div>
      `;
      document.body.appendChild(menuOverlay);
      console.log('🔧 Fallback menu overlay created');
    }
    
    // 다시 초기화 시도
    if (initializeHamburger()) {
      setupHamburgerEvents();
      console.log('✅ Fallback initialization successful!');
    }
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
  console.log('🔄 Starting hamburger initialization...');
  initializeWhenReady();

  // ─── 🔥 디버깅용 전역 함수 (강화됨) ───
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
      
      // 확실하게 표시되도록 설정
      hamburger.style.display = 'flex';
      hamburger.style.visibility = 'visible';
      hamburger.style.opacity = '1';
      
      console.log('🔄 Hamburger reset and shown');
      return true;
    },
    showHamburger: () => {
      if (!hamburger) return false;
      
      hamburger.style.display = 'flex';
      hamburger.style.visibility = 'visible';
      hamburger.style.opacity = '1';
      console.log('🔓 Hamburger forced visible');
      return true;
    },
    hideHamburger: () => {
      if (!hamburger) return false;
      
      hamburger.style.display = 'none';
      hamburger.style.visibility = 'hidden';
      hamburger.style.opacity = '0';
      console.log('🔒 Hamburger forced hidden');
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
    reinitialize: () => {
      console.log('🔄 Reinitializing hamburger...');
      retryCount = 0;
      initializeWhenReady();
    },
    createFallback: () => {
      createFallbackElements();
    },
    getState: () => ({
      hamburgerExists: !!hamburger,
      menuOverlayExists: !!menuOverlay,
      isActive: hamburger ? hamburger.classList.contains('active') : false,
      hasActiveClass: hamburger ? hamburger.classList.contains('active') : false,
      hasIsActiveClass: hamburger ? hamburger.classList.contains('is-active') : false,
      hasMenuOpenClass: hamburger ? hamburger.classList.contains('menu-open') : false,
      dataState: hamburger ? hamburger.getAttribute('data-state') : null,
      spansCount: hamburger ? hamburger.querySelectorAll('span').length : 0,
      hamburgerStyle: hamburger ? {
        display: hamburger.style.display,
        visibility: hamburger.style.visibility,
        opacity: hamburger.style.opacity
      } : null,
      retryCount: retryCount,
      maxRetries: maxRetries
    })
  };

  console.log('✅ Common.js initialization complete');
  
  // 개발 모드 정보
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🛠️ Development mode detected');
    console.log('🎯 Debug commands available:');
    console.log('  - window.debugMenu.forceToggle()     // 강제 토글');
    console.log('  - window.debugMenu.testX()           // 강제 X 모양');
    console.log('  - window.debugMenu.resetHamburger()  // 초기화');
    console.log('  - window.debugMenu.showHamburger()   // 강제 표시');
    console.log('  - window.debugMenu.hideHamburger()   // 강제 숨김');
    console.log('  - window.debugMenu.fixSpans()        // span 수정');
    console.log('  - window.debugMenu.reinitialize()    // 재초기화');
    console.log('  - window.debugMenu.createFallback()  // 강제 생성');
    console.log('  - window.debugMenu.getState()        // 상태 확인');
  }
});

// ─── 🔥 추가 안전장치: 페이지 로드 후에도 재시도 ───
window.addEventListener('load', () => {
  setTimeout(() => {
    if (window.debugMenu && !window.debugMenu.hamburger()) {
      console.log('🔄 Retrying hamburger initialization after window load...');
      window.debugMenu.reinitialize();
    } else if (window.debugMenu && window.debugMenu.hamburger()) {
      // 존재하지만 안보이는 경우 강제 표시
      window.debugMenu.showHamburger();
    }
  }, 1000);
});

// ─── 🔥 최후의 수단: 직접 CSS 조작 및 강제 생성 ───
function forceHamburgerFix() {
  console.log('🚨 Applying emergency hamburger fix...');
  
  let hamburger = document.getElementById('hamburger') || document.querySelector('.hamburger');
  
  // 햄버거가 아예 없으면 생성
  if (!hamburger) {
    hamburger = document.createElement('button');
    hamburger.id = 'hamburger';
    hamburger.className = 'hamburger';
    hamburger.style.cssText = `
      position: fixed !important;
      top: 1.5rem !important;
      right: 1.5rem !important;
      width: 28px !important;
      height: 28px !important;
      z-index: 10001 !important;
      cursor: pointer !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: center !important;
      align-items: center !important;
      background: transparent !important;
      border: none !important;
      padding: 0 !important;
      visibility: visible !important;
      opacity: 1 !important;
    `;
    document.body.appendChild(hamburger);
    console.log('🔧 Emergency hamburger created');
  }
  
  // span이 없으면 생성
  if (hamburger.querySelectorAll('span').length < 2) {
    hamburger.innerHTML = '<span></span><span></span>';
  }
  
  // 강제로 표시
  hamburger.style.display = 'flex';
  hamburger.style.visibility = 'visible';
  hamburger.style.opacity = '1';
  
  // 강제로 CSS 적용
  const style = document.createElement('style');
  style.innerHTML = `
    .hamburger {
      position: fixed !important;
      top: 1.5rem !important;
      right: 1.5rem !important;
      width: 28px !important;
      height: 28px !important;
      z-index: 10001 !important;
      cursor: pointer !important;
      display: flex !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
    .hamburger span {
      position: absolute !important;
      display: block !important;
      width: 20px !important;
      height: 2px !important;
      background: white !important;
      left: 50% !important;
      top: 50% !important;
    }
    .hamburger span:nth-child(1) {
      transform: translate(-50%, -50%) translateY(-6px) !important;
    }
    .hamburger span:nth-child(2) {
      transform: translate(-50%, -50%) translateY(6px) !important;
    }
    .hamburger.active span:nth-child(1) {
      transform: translate(-50%, -50%) rotate(45deg) !important;
      background: white !important;
    }
    .hamburger.active span:nth-child(2) {
      transform: translate(-50%, -50%) rotate(-45deg) !important;
      background: white !important;
    }
  `;
  document.head.appendChild(style);
  
  // 메뉴 오버레이도 확인
  let menuOverlay = document.getElementById('menu-overlay') || document.querySelector('.menu-overlay');
  if (!menuOverlay) {
    menuOverlay = document.createElement('div');
    menuOverlay.id = 'menu-overlay';
    menuOverlay.className = 'menu-overlay';
    menuOverlay.innerHTML = `
      <div class="menu-content">
        <a href="index.html">Home</a>
        <a href="about.html">About</a>
        <a href="portfolio.html">Portfolio</a>
        <a href="contact.html">Contact</a>
        <a href="mailto:hello@kauzcorp.com">E-mail</a>
      </div>
    `;
    document.body.appendChild(menuOverlay);
    console.log('🔧 Emergency menu overlay created');
  }
  
  // 강제로 이벤트 추가
  hamburger.onclick = function() {
    this.classList.toggle('active');
    menuOverlay.classList.toggle('active');
    
    if (menuOverlay.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };
  
  console.log('🔧 Emergency fix applied');
}

// 3초 후에도 작동하지 않으면 응급 수정
setTimeout(() => {
  if (!window.debugMenu || !window.debugMenu.hamburger()) {
    console.log('🚨 Applying emergency fix...');
    forceHamburgerFix();
  }
}, 3000);

// 5초 후 최종 체크
setTimeout(() => {
  const hamburger = document.getElementById('hamburger') || document.querySelector('.hamburger');
  if (hamburger) {
    console.log('✅ Final check: Hamburger exists and is', 
      hamburger.style.display === 'none' ? 'HIDDEN' : 'VISIBLE');
    
    if (hamburger.style.display === 'none' || 
        hamburger.style.visibility === 'hidden' || 
        hamburger.style.opacity === '0') {
      console.log('🔧 Forcing hamburger to be visible...');
      hamburger.style.display = 'flex';
      hamburger.style.visibility = 'visible';
      hamburger.style.opacity = '1';
    }
  } else {
    console.log('❌ Final check: No hamburger found, creating emergency fallback');
    forceHamburgerFix();
  }
}, 5000);
