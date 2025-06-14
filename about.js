// about.js (About Us 전용 스크립트) - 수정된 버전
// 🔥 강제 리다이렉트 제거 + 새로고침 시 상단 이동

document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 About.js starting...');

  // ─── 🔥 새로고침 시 페이지 상단으로 이동 (리다이렉트 대신) ───
  try {
    if (performance.getEntriesByType('navigation')[0].type === 'reload') {
      console.log('🔄 About page refresh detected, scrolling to top...');
      window.scrollTo(0, 0);
      // 리다이렉트 코드 제거됨
    }
  } catch (e) {
    console.log('⚠️ Navigation API not supported, continuing...');
  }

  // ─── About 페이지 전용 기능들만 여기서 처리 ───

  // 1) SCROLL 인디케이터 클릭 이벤트 (About 페이지 전용)
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      const mainContent = document.querySelector('.main-content') || 
                         document.querySelector('.about-content-wrapper') ||
                         document.querySelector('.content-section');
      
      if (mainContent) {
        mainContent.scrollIntoView({
          behavior: 'smooth'
        });
        console.log('📜 Smooth scroll to main content initiated');
      }
    });
    console.log('✅ About page scroll indicator initialized');
  }

  // 2) About 페이지 전용 fade-up 애니메이션 (common.js와 중복 방지)
  // 🔥 data-about-observed 속성으로 중복 방지
  const aboutFadeElements = document.querySelectorAll('.fade-up:not([data-about-observed])');
  
  if (aboutFadeElements.length > 0) {
    const aboutObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          entry.target.classList.add('visible'); // 추가 클래스
          aboutObserver.unobserve(entry.target);
        }
      });
    }, { 
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px'
    });
    
    aboutFadeElements.forEach((element) => {
      element.setAttribute('data-about-observed', 'true');
      aboutObserver.observe(element);
    });
    
    console.log('✅ About page fade-up animations initialized:', aboutFadeElements.length);
  }

  // 3) 서비스 리스트 호버 효과 강화 (데스크톱만, About 페이지 전용)
  if (window.innerWidth > 768) {
    const serviceItems = document.querySelectorAll('.services-list li');
    if (serviceItems.length > 0) {
      serviceItems.forEach((item, index) => {
        item.addEventListener('mouseenter', () => {
          item.style.transform = 'translateX(15px)';
          item.style.color = '#E37031';
        });
        
        item.addEventListener('mouseleave', () => {
          item.style.transform = 'translateX(0)';
          item.style.color = '#ccc';
        });
      });
      console.log('✅ Service items hover effects initialized:', serviceItems.length);
    }
  }

  // 🔥 4) 클라이언트 박스 호버 효과 제거
  const clientBoxes = document.querySelectorAll('.client-box');
  if (clientBoxes.length > 0) {
    clientBoxes.forEach((box, index) => {
      // 호버 효과 완전 제거
      box.style.cursor = 'default';
    });
    console.log('✅ Client boxes hover effects removed:', clientBoxes.length);
  }

  // 5) 스크롤 진행률 표시 (CSS 변수로 설정)
  function updateScrollProgress() {
    const scrollTop = window.pageYOffset;
    const docHeight = document.body.offsetHeight - window.innerHeight;
    const scrollPercent = Math.min((scrollTop / docHeight) * 100, 100);
    
    // 스크롤 진행률을 CSS 변수로 설정
    document.documentElement.style.setProperty('--scroll-progress', scrollPercent + '%');
  }

  // 스크롤 이벤트 최적화 (throttle 적용)
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    scrollTimeout = setTimeout(updateScrollProgress, 10);
  }, { passive: true });

  // 6) 모바일 터치 최적화
  if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
    console.log('📱 Touch device detected, mobile optimizations applied');
  }

  // 7) 브라우저 호환성 체크 및 폴백
  function checkBrowserSupport() {
    // IntersectionObserver 지원 체크
    if (!('IntersectionObserver' in window)) {
      console.warn('⚠️ IntersectionObserver not supported, applying fallback');
      document.querySelectorAll('.fade-up').forEach(el => {
        el.classList.add('is-visible', 'visible');
      });
    }

    // CSS Grid 지원 체크
    if (!CSS.supports('display', 'grid')) {
      console.warn('⚠️ CSS Grid not supported');
      document.body.classList.add('no-grid-support');
    }

    // CSS 사용자 정의 속성 지원 체크
    if (!CSS.supports('color', 'var(--test)')) {
      console.warn('⚠️ CSS Custom Properties not supported');
      document.body.classList.add('no-css-vars');
    }
  }

  checkBrowserSupport();

  // 8) About 페이지 전용 키보드 네비게이션
  document.addEventListener('keydown', (e) => {
    // ESC 키 처리는 common.js에서 하므로 여기서는 제외
    if (e.key === 'Home' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    if (e.key === 'End' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  });

  // 9) 성능 모니터링 (개발용)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🛠️ About page development mode');
    console.log('📊 About page elements:', {
      fadeUpElements: document.querySelectorAll('.fade-up').length,
      contentSections: document.querySelectorAll('.content-section').length,
      serviceItems: document.querySelectorAll('.services-list li').length,
      clientBoxes: document.querySelectorAll('.client-box').length,
      scrollIndicator: !!scrollIndicator
    });

    // 성능 측정
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('⚡ About page performance:', {
          domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart) + 'ms',
          loadComplete: Math.round(perfData.loadEventEnd - perfData.loadEventStart) + 'ms',
          totalTime: Math.round(perfData.loadEventEnd - perfData.fetchStart) + 'ms'
        });
      }, 100);
    });

    // 디버깅용 전역 함수
    window.aboutDebug = {
      scrollToTop: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
      scrollToContent: () => {
        const content = document.querySelector('.main-content');
        if (content) content.scrollIntoView({ behavior: 'smooth' });
      },
      showAllElements: () => {
        document.querySelectorAll('.fade-up').forEach(el => {
          el.classList.add('is-visible');
        });
      }
    };
  }

  // 10) 초기화 완료 후 상태 확인
  setTimeout(() => {
    const isCommonJsLoaded = typeof window.debugMenu !== 'undefined';
    console.log('🔍 About page initialization status:', {
      commonJsLoaded: isCommonJsLoaded,
      elementsFound: {
        scrollIndicator: !!scrollIndicator,
        fadeElements: document.querySelectorAll('.fade-up').length,
        serviceItems: document.querySelectorAll('.services-list li').length
      }
    });
  }, 100);

  console.log('✅ About.js initialization complete');
});
