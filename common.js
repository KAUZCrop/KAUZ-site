console.log('🛠️ Development mode detected');
    console.log('📄 Current page:', window.location.pathname);
    console.log('🎯 Available elements:', {
      hamburger: !!hamburger,
      menuOverlay: !!menuOverlay,
      fadeElements: fadeUpElements.length,
      pageType: 'Sub'
    });// common.js - 서브 페이지(About, Portfolio, Contact) 공통 JavaScript
// 햄버거 메뉴, ESC 키, 배경 클릭, fade-up 애니메이션 등을 서브 페이지에서 처리
// (메인 페이지는 main.js에서 별도 관리)

document.addEventListener('DOMContentLoaded', () => {
  console.log('🔄 Common.js loading for sub pages...');

  // ─── 서브페이지 새로고침 방지 ───
  if (performance.getEntriesByType('navigation')[0].type === 'reload') {
    console.log('🔄 Page refresh detected, redirecting to main...');
    window.location.href = 'index.html';
    return;
  }

  // ─── 전역 변수 선언 ───
  const hamburger = document.getElementById('hamburger');
  const menuOverlay = document.getElementById('menu-overlay');

  console.log('🔍 Elements found:', { 
    hamburger: hamburger ? 'Found' : 'Not found', 
    menuOverlay: menuOverlay ? 'Found' : 'Not found' 
  });

  // ─── 메뉴 닫기 함수 (서브 페이지 공통) ───
  function closeMenu() {
    console.log('🔴 Closing menu...');
    
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
  }

  // ─── 메뉴 열기 함수 (서브 페이지 공통) ───
  function openMenu() {
    console.log('🟢 Opening menu...');
    
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
  }

  // ─── 햄버거 메뉴 클릭 이벤트 (서브 페이지 공통) ───
  if (hamburger && menuOverlay) {
    hamburger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isOpen = menuOverlay.classList.contains('active');
      console.log('🍔 Hamburger clicked, current state:', isOpen ? 'Open' : 'Closed');
      
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    console.log('✅ Hamburger click event added');
  } else {
    console.error('❌ Hamburger or menu overlay element not found!');
  }

  // ─── 메뉴 링크 클릭 시 메뉴 닫기 (서브 페이지 공통) ───
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

  // ─── ESC 키로 메뉴 닫기 (서브 페이지 공통) ───
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      console.log('⌨️ ESC key pressed');
      if (menuOverlay && menuOverlay.classList.contains('active')) {
        closeMenu();
      }
    }
  });

  // ─── 메뉴 배경 클릭 시 닫기 (서브 페이지 공통) ───
  if (menuOverlay) {
    menuOverlay.addEventListener('click', (e) => {
      // 메뉴 배경을 클릭했는지 확인 (메뉴 내용이 아닌)
      if (e.target === menuOverlay) {
        console.log('🖱️ Menu overlay background clicked');
        closeMenu();
      }
    });
  }

  // ─── Fade-up 애니메이션 처리 (서브 페이지 공통) ───
  const fadeUpElements = document.querySelectorAll('.fade-up');
  
  if (fadeUpElements.length > 0) {
    console.log('🎭 Fade-up elements found:', fadeUpElements.length);
    
    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // 한 번 보이면 더 이상 관찰하지 않음 (성능 최적화)
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { 
      threshold: 0.1,  // 10% 보이면 트리거
      rootMargin: '0px 0px -50px 0px'  // 하단에서 50px 전에 트리거
    });
    
    // 모든 fade-up 요소 관찰 시작
    fadeUpElements.forEach((element) => {
      fadeObserver.observe(element);
    });
  } else {
    console.log('ℹ️ No fade-up elements found');
  }

  // ─── 모바일 터치 이벤트 최적화 (서브 페이지 공통) ───
  if ('ontouchstart' in window) {
    console.log('📱 Touch device detected');
    
    // 모바일에서 터치 시작/끝 시 햄버거 메뉴 반응성 개선
    if (hamburger) {
      hamburger.addEventListener('touchstart', (e) => {
        e.preventDefault();
      }, { passive: false });
    }
  }

  // ─── 윈도우 리사이즈 시 메뉴 상태 확인 (서브 페이지 공통) ───
  window.addEventListener('resize', () => {
    // 화면 크기가 변경될 때 메뉴가 열려있으면 닫기
    if (window.innerWidth > 768 && menuOverlay && menuOverlay.classList.contains('active')) {
      console.log('📏 Window resized to desktop, closing menu');
      closeMenu();
    }
  });

  // ─── 페이지 가시성 변경 시 메뉴 닫기 (탭 변경 등) ───
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && menuOverlay && menuOverlay.classList.contains('active')) {
      console.log('👁️‍🗨️ Page hidden, closing menu');
      closeMenu();
    }
  });

  // ─── 서브페이지 새로고침 방지 (메인 제외) ───
  if (!isMainPage) {
    if (performance.getEntriesByType('navigation')[0].type === 'reload') {
      console.log('🔄 Page refresh detected, redirecting to main...');
      window.location.href = 'index.html';
      return;
    }
  }

  // ─── 메인 페이지 전용 함수들 노출 ───
  if (isMainPage) {
    // 메인 페이지에서 햄버거 표시 함수를 전역으로 노출
    window.showHamburger = showHamburger;
  }

  // ─── 초기화 완료 로그 ───
  console.log('✅ Common.js initialization complete');
  
  // 개발 모드에서만 실행되는 디버깅 정보
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🛠️ Development mode detected');
    console.log('📄 Current page:', window.location.pathname);
    console.log('🎯 Available elements:', {
      hamburger: !!hamburger,
      menuOverlay: !!menuOverlay,
      fadeElements: fadeUpElements.length,
      pageType: isMainPage ? 'Main' : 'Sub'
    });
  }
});
