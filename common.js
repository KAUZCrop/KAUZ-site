// common.js - 서브 페이지(About, Portfolio, Contact) 공통 JavaScript
// 🔥 중복 이벤트 문제 완전 해결 버전 + 복사 방지 기능 추가

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Common.js loading for sub pages...');

  // ─── 🔥 복사 방지 시스템 초기화 (메인 페이지와 동일) ───
  function initCopyProtection() {
    console.log('🛡️ Initializing copy protection system...');

    // 1. 우클릭 방지
    document.addEventListener('contextmenu', e => {
      e.preventDefault();
      console.log('🚫 Right click blocked');
    });

    // 2. 키보드 단축키 방지
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd 키 조합 차단
      if (e.ctrlKey || e.metaKey) {
        // 복사, 붙여넣기, 전체선택, 저장, 인쇄, 소스보기 차단
        if (['c', 'v', 'a', 's', 'p', 'u'].includes(e.key.toLowerCase())) {
          e.preventDefault();
          console.log(`🚫 Keyboard shortcut blocked: Ctrl+${e.key.toUpperCase()}`);
          return false;
        }
      }

      // 개발자 도구 열기 차단
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
          (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
        console.log('🚫 Developer tools shortcut blocked');
        return false;
      }

      // 기타 차단할 키들
      if (['F1', 'F3', 'F5'].includes(e.key)) {
        if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
          // 새로고침은 허용하되 로그만 남김
          console.log('🔄 Page refresh detected');
        } else {
          e.preventDefault();
          console.log(`🚫 Function key blocked: ${e.key}`);
          return false;
        }
      }
    });

    // 3. 드래그 시작 방지
    document.addEventListener('dragstart', (e) => {
      e.preventDefault();
      console.log('🚫 Drag start blocked');
    });

    // 4. 선택 방지 (추가 보안)
    document.addEventListener('selectstart', (e) => {
      // 폼 요소는 선택 허용
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        return true;
      }
      e.preventDefault();
      console.log('🚫 Text selection blocked');
      return false;
    });

    // 5. 개발자 도구 감지 (간단한 버전)
    let devtools = {open: false, orientation: null};
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > 200 || 
          window.outerWidth - window.innerWidth > 200) {
        if (!devtools.open) {
          devtools.open = true;
          console.log('🚨 Developer tools detected');
          // 심각한 차단을 원한다면 여기에 추가 로직 구현
        }
      } else {
        devtools.open = false;
      }
    }, 500);

    // 6. CSS로 복사 방지 스타일 적용
    const copyProtectionStyle = document.createElement('style');
    copyProtectionStyle.textContent = `
      /* 전체 텍스트 복사 방지 */
      body {
        user-select: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }

      /* 폼 요소는 선택 허용 */
      input, textarea, select {
        user-select: text !important;
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
      }

      /* 이미지 드래그 방지 */
      img {
        -webkit-user-drag: none !important;
        -khtml-user-drag: none !important;
        -moz-user-drag: none !important;
        -o-user-drag: none !important;
        user-drag: none !important;
        pointer-events: none !important;
      }

      /* 링크와 버튼은 클릭 허용하되 드래그 방지 */
      a, button {
        -webkit-user-drag: none !important;
        -khtml-user-drag: none !important;
        -moz-user-drag: none !important;
        -o-user-drag: none !important;
        user-drag: none !important;
        pointer-events: auto !important;
      }

      /* 폼 요소들 클릭/터치 허용 */
      input, textarea, select, button, 
      .hamburger, .scroll-indicator,
      .btn-submit, .contact-form,
      .menu-content a {
        pointer-events: auto !important;
      }
    `;
    document.head.appendChild(copyProtectionStyle);

    // 7. 인쇄 방지 (선택사항)
    window.addEventListener('beforeprint', (e) => {
      e.preventDefault();
      console.log('🚫 Print blocked');
      alert('인쇄 기능은 비활성화되어 있습니다.');
      return false;
    });

    // 8. 페이지 저장 차단 시도
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        console.log('🚫 Save page blocked');
        return false;
      }
    });

    // 9. 콘솔 경고 메시지
    console.log('%c⚠️ 저작권 보호', 'color: red; font-size: 20px; font-weight: bold;');
    console.log('%c이 웹사이트의 모든 콘텐츠는 저작권으로 보호됩니다.', 'color: #ff6b6b; font-size: 14px;');
    console.log('%c무단 복사, 배포, 수정을 금지합니다.', 'color: #ff6b6b; font-size: 14px;');

    console.log('✅ Copy protection system initialized');
  }

  // 복사 방지 시스템 즉시 초기화
  initCopyProtection();

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
  let eventHandlersAttached = false; // 🔥 중복 방지 플래그
  
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

  // ─── 🔥 이벤트 리스너 완전 제거 함수 ───
  function removeAllEventListeners() {
    if (!hamburger) return;

    console.log('🧹 Removing all existing event listeners...');

    // 🔥 새로운 요소를 복제해서 모든 이벤트 리스너 제거
    const newHamburger = hamburger.cloneNode(true);
    hamburger.parentNode.replaceChild(newHamburger, hamburger);
    hamburger = newHamburger;

    console.log('✅ All event listeners removed via cloning');
    return hamburger;
  }

  // ─── 🔥 햄버거 메뉴 이벤트 설정 (완전히 새로 작성) ───
  function setupHamburgerEvents() {
    if (!hamburger || !menuOverlay) {
      console.error('❌ Required elements missing for hamburger events');
      return false;
    }

    // 🔥 이미 이벤트가 등록되어 있으면 중복 방지
    if (eventHandlersAttached) {
      console.log('⚠️ Event handlers already attached, skipping...');
      return true;
    }

    console.log('🎯 Setting up hamburger events (single attachment)...');

    // 🔥 모든 기존 이벤트 리스너 제거
    hamburger = removeAllEventListeners();

    // 🔥 디바이스 감지
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // 🔥 단일 클릭 이벤트 핸들러
    function handleClick(e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation(); // 🔥 즉시 전파 중단
      
      // 🔥 중복 클릭 방지 (짧은 시간 내 다시 클릭 방지)
      if (hamburger.dataset.processing === 'true') {
        console.log('🚫 Click ignored - already processing');
        return;
      }
      
      hamburger.dataset.processing = 'true';
      
      // 🔥 간단한 상태 판별
      const isOpen = menuOverlay.classList.contains('active');
      
      console.log('🍔 Hamburger clicked, current state:', isOpen ? 'Open' : 'Closed');
      
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
      
      // 🔥 처리 완료 후 플래그 해제 (짧은 딜레이)
      setTimeout(() => {
        hamburger.dataset.processing = 'false';
      }, 300);
    }

    // 🔥 터치 디바이스용 이벤트 (터치만)
    if (isTouchDevice) {
      console.log('📱 Touch device detected - using touchend');
      hamburger.addEventListener('touchend', handleClick, { passive: false });
    } else {
      // 🔥 데스크톱용 이벤트 (클릭만)
      console.log('🖥️ Desktop device detected - using click');
      hamburger.addEventListener('click', handleClick);
    }

    // 🔥 이벤트 등록 완료 플래그 설정
    eventHandlersAttached = true;
    console.log('✅ Hamburger events registered successfully (single handler)');

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
        console.log('🎉 Hamburger menu fully initialized (no duplicates)!');
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
  console.log('🔄 Starting hamburger initialization (duplicate prevention)...');
  initializeWhenReady();

  // ─── 🔥 디버깅용 전역 함수 (강화됨) ───
  window.debugMenu = {
    openMenu,
    closeMenu,
    hamburger: () => hamburger,
    menuOverlay: () => menuOverlay,
    isMenuOpen: () => menuOverlay ? menuOverlay.classList.contains('active') : false,
    eventHandlersAttached: () => eventHandlersAttached,
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
      hamburger.dataset.processing = 'false';
      
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
    removeAllListeners: () => {
      if (!hamburger) return false;
      
      hamburger = removeAllEventListeners();
      eventHandlersAttached = false;
      console.log('🧹 All event listeners removed');
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
      eventHandlersAttached = false;
      retryCount = 0;
      initializeWhenReady();
    },
    createFallback: () => {
      createFallbackElements();
    },
    // 🔥 복사 방지 시스템 재초기화
    reinitCopyProtection: () => {
      initCopyProtection();
      console.log('🛡️ Copy protection system reinitialized');
    },
    getState: () => ({
      hamburgerExists: !!hamburger,
      menuOverlayExists: !!menuOverlay,
      eventHandlersAttached: eventHandlersAttached,
      isActive: hamburger ? hamburger.classList.contains('active') : false,
      hasActiveClass: hamburger ? hamburger.classList.contains('active') : false,
      hasIsActiveClass: hamburger ? hamburger.classList.contains('is-active') : false,
      hasMenuOpenClass: hamburger ? hamburger.classList.contains('menu-open') : false,
      dataState: hamburger ? hamburger.getAttribute('data-state') : null,
      spansCount: hamburger ? hamburger.querySelectorAll('span').length : 0,
      processingState: hamburger ? hamburger.dataset.processing : null,
      hamburgerStyle: hamburger ? {
        display: hamburger.style.display,
        visibility: hamburger.style.visibility,
        opacity: hamburger.style.opacity
      } : null,
      retryCount: retryCount,
      maxRetries: maxRetries,
      copyProtectionActive: true // 🔥 복사 방지 상태 표시
    })
  };

  console.log('✅ Common.js initialization complete (duplicate prevention + copy protection active)');
  
  // 개발 모드 정보
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🛠️ Development mode detected');
    console.log('🎯 Debug commands available:');
    console.log('  - window.debugMenu.forceToggle()           // 강제 토글');
    console.log('  - window.debugMenu.testX()                 // 강제 X 모양');
    console.log('  - window.debugMenu.resetHamburger()        // 초기화');
    console.log('  - window.debugMenu.removeAllListeners()    // 이벤트 제거');
    console.log('  - window.debugMenu.reinitCopyProtection()  // 복사 방지 재초기화');
    console.log('  - window.debugMenu.getState()              // 상태 확인');
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
  
  // 🔥 단순한 토글 함수 (중복 방지)
  hamburger.onclick = function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // 🔥 중복 실행 방지
    if (this.dataset.clicking === 'true') return;
    this.dataset.clicking = 'true';
    
    this.classList.toggle('active');
    menuOverlay.classList.toggle('active');
    
    if (menuOverlay.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    // 딜레이 후 플래그 해제
    setTimeout(() => {
      this.dataset.clicking = 'false';
    }, 300);
  };
  
  console.log('🔧 Emergency fix applied with duplicate prevention');
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
