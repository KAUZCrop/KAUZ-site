// common.js - 서브 페이지(About, Portfolio, Contact) 공통 JavaScript
// 🔥 강제 리다이렉트 제거 + 새로고침 시 상단 이동 + 햄버거 애니메이션 최적화

document.addEventListener('DOMContentLoaded', () => {
  console.log('🔄 Common.js loading for sub pages...');

  // ─── 🔥 새로고침 시 페이지 상단으로 이동 (리다이렉트 대신) ───
  try {
    if (performance.getEntriesByType('navigation')[0].type === 'reload') {
      console.log('🔄 Page refresh detected, scrolling to top...');
      window.scrollTo(0, 0);
      // 리다이렉트 코드 제거됨
    }
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

  // ─── 🔥 GPU 가속 최적화를 위한 초기 설정 ───
  function optimizeHamburgerForPerformance() {
    if (hamburger) {
      // GPU 레이어 강제 생성
      hamburger.style.willChange = 'transform, opacity';
      hamburger.style.transform = 'translateZ(0)';
      hamburger.style.backfaceVisibility = 'hidden';
      
      // span 요소들도 최적화
      const spans = hamburger.querySelectorAll('span');
      spans.forEach(span => {
        span.style.willChange = 'transform, opacity';
        span.style.transform = 'translateZ(0)';
        span.style.backfaceVisibility = 'hidden';
      });
      
      console.log('✅ Hamburger GPU optimization applied');
    }
    
    if (menuOverlay) {
      menuOverlay.style.willChange = 'transform, opacity';
      menuOverlay.style.transform = 'translateZ(0)';
      menuOverlay.style.backfaceVisibility = 'hidden';
      
      console.log('✅ Menu overlay GPU optimization applied');
    }
  }

  // 초기 성능 최적화 적용
  optimizeHamburgerForPerformance();

  // ─── 🔥 메뉴 닫기 함수 (최적화된 버전) ───
  function closeMenu() {
    console.log('🔴 Closing menu...');
    
    try {
      if (menuOverlay) {
        // 🔥 부드러운 애니메이션을 위한 순차 처리
        menuOverlay.style.willChange = 'opacity, visibility, transform';
        menuOverlay.classList.remove('active');
        
        // 메뉴 닫힌 후 will-change 정리 (성능 최적화)
        setTimeout(() => {
          if (menuOverlay && !menuOverlay.classList.contains('active')) {
            menuOverlay.style.willChange = 'auto';
          }
        }, 400);
      }
      
      if (hamburger) {
        // 🔥 X → 햄버거 변환 최적화
        hamburger.style.willChange = 'transform, opacity';
        hamburger.classList.remove('active');
        
        // 변환 완료 후 will-change 정리
        setTimeout(() => {
          if (hamburger && !hamburger.classList.contains('active')) {
            hamburger.style.willChange = 'transform';
          }
        }, 300);
      }
      
      // 🔥 스크롤 복원 최적화
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

  // ─── 🔥 메뉴 열기 함수 (최적화된 버전) ───
  function openMenu() {
    console.log('🟢 Opening menu...');
    
    try {
      if (menuOverlay) {
        // 🔥 부드러운 애니메이션을 위한 사전 준비
        menuOverlay.style.willChange = 'opacity, visibility, transform';
        
        // 메뉴 열기 시 GPU 가속 활성화
        requestAnimationFrame(() => {
          menuOverlay.classList.add('active');
        });
      }
      
      if (hamburger) {
        // 🔥 햄버거 → X 변환 최적화
        hamburger.style.willChange = 'transform, opacity';
        
        requestAnimationFrame(() => {
          hamburger.classList.add('active');
        });
      }
      
      // 🔥 배경 스크롤 방지 최적화 (모바일 바운스 방지)
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

  // ─── 🔥 최적화된 햄버거 메뉴 클릭 이벤트 ───
  if (hamburger && menuOverlay) {
    
    function handleHamburgerClick(e) {
      try {
        e.preventDefault();
        e.stopPropagation();

        const isOpen = menuOverlay.classList.contains('active');
        console.log('🍔 Hamburger clicked, current state:', isOpen ? 'Open' : 'Closed');
        
        // 🔥 연속 클릭 방지 (디바운싱)
        if (hamburger.dataset.animating === 'true') {
          console.log('⏳ Animation in progress, ignoring click');
          return;
        }
        
        hamburger.dataset.animating = 'true';
        
        if (isOpen) {
          closeMenu();
        } else {
          openMenu();
        }
        
        // 애니메이션 완료 후 디바운스 해제
        setTimeout(() => {
          hamburger.dataset.animating = 'false';
        }, 500);
        
      } catch (e) {
        console.error('❌ Error handling hamburger click:', e);
        // 오류 발생 시 디바운스 해제
        hamburger.dataset.animating = 'false';
      }
    }
    
    // 이벤트 리스너 등록 (안전한 방식)
    try {
      // 초기 디바운스 상태 설정
      hamburger.dataset.animating = 'false';
      
      hamburger.addEventListener('click', handleHamburgerClick);
      
      // 🔥 터치 이벤트 최적화 (모바일 대응)
      if ('ontouchstart' in window) {
        let touchStartTime = 0;
        let touchStarted = false;
        
        hamburger.addEventListener('touchstart', (e) => {
          touchStartTime = Date.now();
          touchStarted = true;
        }, { passive: true });
        
        hamburger.addEventListener('touchend', (e) => {
          const touchDuration = Date.now() - touchStartTime;
          
          // 짧은 터치만 클릭으로 인정 (스크롤과 구분)
          if (touchStarted && touchDuration < 300) {
            e.preventDefault();
            handleHamburgerClick(e);
          }
          
          touchStarted = false;
        });
      }

      console.log('✅ Optimized hamburger events added successfully');
    } catch (e) {
      console.error('❌ Error adding hamburger event:', e);
    }
  } else {
    console.error('❌ Cannot add event listeners - elements missing');
  }

  // ─── 🔥 메뉴 링크 클릭 시 메뉴 닫기 (최적화) ───
  try {
    if (menuOverlay) {
      const menuLinks = menuOverlay.querySelectorAll('.menu-content a');
      console.log('🔗 Menu links found:', menuLinks.length);
      
      menuLinks.forEach((link, index) => {
        link.addEventListener('click', (e) => {
          console.log(`📎 Menu link ${index + 1} clicked:`, link.textContent);
          
          // 🔥 부드러운 페이지 전환을 위한 딜레이
          if (link.href && !link.href.includes('#')) {
            e.preventDefault();
            
            closeMenu();
            
            // 메뉴 닫기 애니메이션 완료 후 페이지 이동
            setTimeout(() => {
              window.location.href = link.href;
            }, 200);
          } else {
            closeMenu();
          }
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

  // ─── 🔥 윈도우 리사이즈 시 메뉴 상태 확인 및 최적화 ───
  try {
    let resizeTimeout;
    
    window.addEventListener('resize', () => {
      // 🔥 리사이즈 이벤트 디바운싱
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        
        // 데스크톱으로 전환 시 메뉴 자동 닫기
        if (window.innerWidth > 768 && menuOverlay && menuOverlay.classList.contains('active')) {
          console.log('📏 Window resized to desktop, closing menu');
          closeMenu();
        }
        
        // 🔥 리사이즈 후 GPU 최적화 재적용
        optimizeHamburgerForPerformance();
        
      }, 250);
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

  // ─── 🔥 페이지 언로드 시 애니메이션 정리 ───
  try {
    window.addEventListener('beforeunload', () => {
      // will-change 속성 정리로 메모리 최적화
      if (hamburger) {
        hamburger.style.willChange = 'auto';
        const spans = hamburger.querySelectorAll('span');
        spans.forEach(span => {
          span.style.willChange = 'auto';
        });
      }
      
      if (menuOverlay) {
        menuOverlay.style.willChange = 'auto';
      }
    });
  } catch (e) {
    console.error('❌ Error setting up unload handler:', e);
  }

  // ─── 🔥 디버깅용 전역 함수 노출 (개선된 버전) ───
  try {
    window.debugMenu = {
      openMenu,
      closeMenu,
      hamburger,
      menuOverlay,
      isMenuOpen: () => menuOverlay ? menuOverlay.classList.contains('active') : false,
      isAnimating: () => hamburger ? hamburger.dataset.animating === 'true' : false,
      testClick: () => {
        if (hamburger && hamburger.dataset.animating !== 'true') {
          hamburger.click();
        } else {
          console.error('Hamburger element not found or animating');
        }
      },
      optimizePerformance: optimizeHamburgerForPerformance,
      getAnimationState: () => ({
        menuActive: menuOverlay ? menuOverlay.classList.contains('active') : false,
        hamburgerActive: hamburger ? hamburger.classList.contains('active') : false,
        isAnimating: hamburger ? hamburger.dataset.animating === 'true' : false,
        willChangeMenu: menuOverlay ? menuOverlay.style.willChange : 'N/A',
        willChangeHamburger: hamburger ? hamburger.style.willChange : 'N/A'
      })
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
      debugMenu: !!window.debugMenu,
      performanceOptimized: true
    });
    
    // 🔥 성능 모니터링 (개발 모드)
    console.log('⚡ Performance status:', {
      hamburgerGPU: hamburger ? hamburger.style.transform.includes('translateZ') : false,
      menuOverlayGPU: menuOverlay ? menuOverlay.style.transform.includes('translateZ') : false,
      willChangeOptimized: hamburger ? hamburger.style.willChange !== '' : false
    });
  }
});
