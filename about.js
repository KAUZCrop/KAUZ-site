// ── about.js (About Us 전용 스크립트) ──

document.addEventListener('DOMContentLoaded', () => {
  
  // SCROLL 인디케이터 클릭 시 부드러운 스크롤
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  }

  // fade-up 애니메이션 (HTML에서 옮겨온 스크롤 애니메이션 + 기존 KAUZ 스타일 통합)
  const fadeUpElements = document.querySelectorAll('.fade-up');
  if (fadeUpElements.length) {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1,
    };

    const fadeUpObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // 기존 KAUZ 스타일
          entry.target.classList.add('is-visible');
          // 새로운 스크롤 애니메이션 스타일
          entry.target.classList.add('visible');
          
          // 옵저버에서 제거 (한 번만 실행)
          fadeUpObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    fadeUpElements.forEach((el) => {
      fadeUpObserver.observe(el);
    });

    console.log('About page fade-up elements initialized:', fadeUpElements.length);
  }

  // About Us 페이지 전용 인터랙션
  // 팀원 카드 클릭 시 간단한 안내 팝업
  const teamMembers = document.querySelectorAll('.team-member');
  if (teamMembers.length) {
    teamMembers.forEach((member) => {
      member.addEventListener('click', () => {
        const name = member.querySelector('.team-name').textContent;
        alert(`${name} 님의 상세 프로필은 곧 업데이트됩니다.`);
      });
    });
  }

  // about-card elements (기존 KAUZ 코드)
  const aboutCards = document.querySelectorAll('.about-card');
  if (aboutCards.length > 0) {
    const cardObserver = new IntersectionObserver((entries, obs2) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs2.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    
    aboutCards.forEach(card => cardObserver.observe(card));
    console.log('About cards initialized:', aboutCards.length);
  }

  // 서비스 리스트 호버 효과 강화 (데스크톱만)
  if (window.innerWidth > 768) {
    const serviceItems = document.querySelectorAll('.services-list li');
    if (serviceItems.length) {
      serviceItems.forEach((item) => {
        item.addEventListener('mouseenter', () => {
          item.style.transform = 'translateX(15px)';
        });
        
        item.addEventListener('mouseleave', () => {
          item.style.transform = 'translateX(0)';
        });
      });
      console.log('Service items hover effects initialized:', serviceItems.length);
    }
  }

  // 스크롤 진행률 표시 (CSS 변수로 설정)
  function updateScrollProgress() {
    const scrollTop = window.pageYOffset;
    const docHeight = document.body.offsetHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    
    // 스크롤 진행률을 CSS 변수로 설정 (필요시 사용)
    document.documentElement.style.setProperty('--scroll-progress', scrollPercent + '%');
  }

  window.addEventListener('scroll', updateScrollProgress);

  // 모바일 터치 최적화
  if ('ontouchstart' in window) {
    // 모바일에서 터치 이벤트 최적화
    document.body.classList.add('touch-device');
    
    // 모바일에서 호버 효과 제거
    const hoverElements = document.querySelectorAll('.client-box, .services-list li');
    hoverElements.forEach(el => {
      el.classList.add('no-hover');
    });
  }

  // 브라우저 호환성 체크
  function checkBrowserSupport() {
    // IntersectionObserver 지원 체크
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver not supported, fallback to immediate visibility');
      // 폴백: 모든 fade-up 요소를 즉시 표시
      document.querySelectorAll('.fade-up').forEach(el => {
        el.classList.add('is-visible', 'visible');
      });
    }

    // CSS Grid 지원 체크
    if (!CSS.supports('display', 'grid')) {
      console.warn('CSS Grid not supported');
      document.body.classList.add('no-grid-support');
    }
  }

  checkBrowserSupport();

  // 성능 모니터링 (개발용)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // 개발 모드에서만 실행
    console.log('🛠️ About page development mode');
    console.log('📊 Page elements:', {
      fadeUpElements: document.querySelectorAll('.fade-up').length,
      contentSections: document.querySelectorAll('.content-section').length,
      serviceItems: document.querySelectorAll('.services-list li').length,
      clientBoxes: document.querySelectorAll('.client-box').length
    });

    // 성능 측정
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('⚡ About page load performance:', {
          domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
          loadComplete: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
          totalTime: Math.round(perfData.loadEventEnd - perfData.fetchStart)
        });
      }, 100);
    });
  }

  console.log('✅ About.js initialization complete');
});
