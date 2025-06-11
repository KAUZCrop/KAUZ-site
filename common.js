// common.js - 서브 페이지(About, Portfolio, Contact) 공통 JavaScript
// 🔥 에러 수정: menuOverlay is not defined 해결

document.addEventListener('DOMContentLoaded', () => {
  console.log('🔄 Common.js loading for sub pages...');

  } catch (e) {
    console.log('⚠️ Navigation API not supported, continuing...');
  }

  // ─── 전역 변수 선언 (안전한 방식) ───
  let hamburger = null;
  let menuOverlay = null;
  
  // 요소 찾기 시도 (여러 방법 사용)
  try {
    hamburger = document.getElementById('hamburger') || document.querySelector('.hamburger');
    menuOverlay = document.getElementById('menu-overlay') || document.querySelector('.menu-overlay');
  } catch (e) {
    console.error('❌ Error finding elements:', e);
  }

  console.log('🔍 Elements found:', { 
    hamburger: hamburger ? 'Found' : 'Not found', 
    menuOverlay: menuOverlay ? 'Found' : 'Not found',
    hamburgerTag: hamburger ? hamburger.tagName : 'N/A',
    overlayTag: menuOverlay ? menuOverlay.tagName : 'N/A'
  });

  // ─── 요소가 없으면 에러 메시지 출력 후 종료 ───
  if (!hamburger || !menuOverlay) {
    console.error('❌ Critical elements not found!');
    console.log('🔍 DOM 전체 검사:');
    console.log('- All IDs:', Array.from(document.querySelectorAll('[id]')).map(el => el.id));
    console.log('- All classes:', Array.from(document.querySelectorAll('[class]')).map(el => el.className));
    console.log('- Hamburger selectors tried:', [
      document.getElementById('hamburger') ? '✅ #hamburger' : '❌ #hamburger',
      document.querySelector('.hamburger') ? '✅ .hamburger' : '❌ .hamburger'
    ]);
    console.log('- Menu overlay selectors tried:', [
      document.getElementById('menu-overlay') ? '✅ #menu-overlay' : '❌ #menu-overlay',
      document.querySelector('.menu-overlay') ? '✅ .menu-overlay' : '❌ .menu-overlay'
    ]);
    return;
  }

  // ─── 메뉴 닫기 함수 (안전한 방식) ───
  function closeMenu() {
    console.log('🔴 Closing menu...');
    
    try {
      if (menuOverlay) {
        menuOverlay.classList.remove('active');
      }
      
      if (hamburger) {
        hamburger.classList.remove('active');
      }
      
      // 스크롤 복원
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.classList.remove('menu-open');
    } catch (e) {
      console.error('❌ Error closing menu:', e);
    }
  }

  // ─── 메뉴 열기 함수 (안전한 방식) ───
  function openMenu() {
    console.log('🟢 Opening menu...');
    
    try {
      if (menuOverlay) {
        menuOverlay.classList.add('active');
      }
      
      if (hamburger) {
        hamburger.classList.add('active');
      }
      
      // 배경 스크롤 방지
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.classList.add('menu-open');
    } catch (e) {
      console.error('❌ Error opening menu:', e);
    }
  }

  // ─── 햄버거 메뉴 클릭 이벤트 (안전한 방식) ───
  if (hamburger && menuOverlay) {
    
    function handleHamburgerClick(e) {
      try {
        e.preventDefault();
        e.stopPropagation();

        const isOpen = menuOverlay.classList.contains('active');
        console.log('🍔 Hamburger clicked, current state:', isOpen ? 'Open' : 'Closed');
        
        if (isOpen) {
          closeMenu();
        } else {
          openMenu();
        }
      } catch (e) {
        console.error('❌ Error handling hamburger click:', e);
      }
    }
    
    // 이벤트 리스너 등록 (안전한 방식)
    try {
      hamburger.addEventListener('click', handleHamburgerClick);
      
      // 터치 이벤트도 추가 (모바일 대응)
      if ('ontouchstart' in window) {
        hamburger.addEventListener('touchend', (e) => {
          e.preventDefault();
          handleHamburgerClick(e);
        });
      }

      console.log('✅ Hamburger click event added successfully');
    } catch (e) {
      console.error('❌ Error adding hamburger event:', e);
    }
  } else {
    console.error('❌ Cannot add event listeners - elements missing');
  }

  // ─── 메뉴 링크 클릭 시 메뉴 닫기 ───
  try {
    if (menuOverlay) {
      const menuLinks = menuOverlay.querySelectorAll('.menu-content a');
      console.log('🔗 Menu links found:', menuLinks.length);
      
      menuLinks.forEach((link, index) => {
        link.addEventListener('click', (e) => {
          console.log(`📎 Menu link ${index + 1} clicked:`, link.textContent);
          closeMenu();
        });
      });
    }
  } catch (e) {
    console.error('❌ Error setting up menu links:', e);
  }

  // ─── ESC 키로 메뉴 닫기 ───
  try {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        console.log('⌨️ ESC key pressed');
        if (menuOverlay && menuOverlay.classList.contains('active')) {
          closeMenu();
        }
      }
    });
  } catch (e) {
    console.error('❌ Error setting up ESC key:', e);
  }

  // ─── 메뉴 배경 클릭 시 닫기 ───
  try {
    if (menuOverlay) {
      menuOverlay.addEventListener('click', (e) => {
        // 메뉴 배경을 클릭했는지 확인 (메뉴 내용이 아닌)
        if (e.target === menuOverlay) {
          console.log('🖱️ Menu overlay background clicked');
          closeMenu();
        }
      });
    }
  } catch (e) {
    console.error('❌ Error setting up overlay click:', e);
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
    } else {
      console.log('ℹ️ No fade-up elements found');
    }
  } catch (e) {
    console.error('❌ Error setting up fade-up animation:', e);
  }

  // ─── 윈도우 리사이즈 시 메뉴 상태 확인 ───
  try {
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && menuOverlay && menuOverlay.classList.contains('active')) {
        console.log('📏 Window resized to desktop, closing menu');
        closeMenu();
      }
    });
  } catch (e) {
    console.error('❌ Error setting up resize handler:', e);
  }

  // ─── 페이지 가시성 변경 시 메뉴 닫기 ───
  try {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && menuOverlay && menuOverlay.classList.contains('active')) {
        console.log('👁️‍🗨️ Page hidden, closing menu');
        closeMenu();
      }
    });
  } catch (e) {
    console.error('❌ Error setting up visibility handler:', e);
  }

  // ─── 디버깅용 전역 함수 노출 ───
  try {
    window.debugMenu = {
      openMenu,
      closeMenu,
      hamburger,
      menuOverlay,
      isMenuOpen: () => menuOverlay ? menuOverlay.classList.contains('active') : false,
      testClick: () => {
        if (hamburger) {
          hamburger.click();
        } else {
          console.error('Hamburger element not found');
        }
      }
    };
  } catch (e) {
    console.error('❌ Error setting up debug tools:', e);
  }

  // ─── 초기화 완료 로그 ───
  console.log('✅ Common.js initialization complete');
  
  // 개발 모드 디버깅 정보
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🛠️ Development mode detected');
    console.log('📄 Current page:', window.location.pathname);
    console.log('🎯 Final status:', {
      hamburger: !!hamburger,
      menuOverlay: !!menuOverlay,
      fadeElements: document.querySelectorAll('.fade-up').length,
      pageType: 'Sub',
      debugMenu: !!window.debugMenu
    });
  }
});
