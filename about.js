// about.js (About Us 전용 스크립트) - 최종 수정 버전
// 🔥 More+ 버튼 바로 PORTFOLIO 이동 + 무한롤링 배너 + 그라디언트 라인 (HTML 요소)

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

  // ─── 🔥 More+ 버튼 클릭 시 바로 PORTFOLIO 이동 ───
  const clientsMoreBtn = document.getElementById('clients-more-btn');
  if (clientsMoreBtn) {
    clientsMoreBtn.addEventListener('click', () => {
      console.log('🔗 More+ button clicked, navigating to PORTFOLIO...');
      performSafeNavigation('portfolio.html');
    });
    
    console.log('✅ More+ button initialized - direct navigation to PORTFOLIO');
  }

  // ─── 🔥 Contact 그라디언트 라인 확인 및 초기화 ───
  const contactGradientLine = document.getElementById('contactGradientLine');
  if (contactGradientLine) {
    console.log('✅ Contact gradient line found:', {
      element: contactGradientLine,
      className: contactGradientLine.className,
      computed: window.getComputedStyle(contactGradientLine)
    });
    
    // 그라디언트 라인 가시성 강제 확인
    const lineStyles = window.getComputedStyle(contactGradientLine);
    console.log('🎨 Gradient line styles:', {
      width: lineStyles.width,
      height: lineStyles.height,
      background: lineStyles.background,
      opacity: lineStyles.opacity,
      display: lineStyles.display,
      visibility: lineStyles.visibility
    });
    
    // 스크롤 시 라인 위치 확인
    const checkLinePosition = () => {
      const rect = contactGradientLine.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        console.log('👁️ Gradient line is in viewport:', {
          top: rect.top,
          bottom: rect.bottom,
          height: rect.height,
          width: rect.width
        });
      }
    };
    
    window.addEventListener('scroll', checkLinePosition, { passive: true });
    checkLinePosition(); // 초기 체크
    
  } else {
    console.warn('⚠️ Contact gradient line element not found! Adding fallback...');
    
    // 동적으로 그라디언트 라인 생성
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      const fallbackLine = document.createElement('div');
      fallbackLine.id = 'contactGradientLine';
      fallbackLine.className = 'contact-gradient-line';
      fallbackLine.style.cssText = `
        width: 100vw;
        height: 3.5px;
        background: linear-gradient(90deg, 
          transparent 0%, 
          #E37031 20%, 
          #ff8c42 50%, 
          #E37031 80%, 
          transparent 100%
        );
        opacity: 0.6;
        margin: 50px 0 0 0;
        position: relative;
        left: 50%;
        transform: translateX(-50%);
      `;
      
      contactSection.parentNode.insertBefore(fallbackLine, contactSection);
      console.log('🔧 Fallback gradient line created and inserted');
    }
  }

  // ─── 🔥 Contact 섹션 클릭 처리 (About 페이지 전용) ───
  const contactSection = document.getElementById('contact');
  if (contactSection) {
    let isScrolling = false;
    let scrollTimeout;
    let startY = 0;
    let startTime = 0;
    let touchStarted = false;

    contactSection.addEventListener('touchstart', (e) => {
      touchStarted = true;
      startY = e.touches[0].clientY;
      startTime = Date.now();
      isScrolling = false;
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 150);
    }, { passive: true });

    contactSection.addEventListener('mousedown', (e) => {
      if (!touchStarted) {
        startY = e.clientY;
        startTime = Date.now();
        isScrolling = false;
      }
    });

    contactSection.addEventListener('touchmove', (e) => {
      const currentY = e.touches[0].clientY;
      const deltaY = Math.abs(currentY - startY);
      
      if (deltaY > 10) {
        isScrolling = true;
      }
    }, { passive: true });

    contactSection.addEventListener('mousemove', (e) => {
      if (!touchStarted) {
        const currentY = e.clientY;
        const deltaY = Math.abs(currentY - startY);
        
        if (deltaY > 10) {
          isScrolling = true;
        }
      }
    });

    contactSection.addEventListener('touchend', (e) => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (!isScrolling && duration < 300) {
        e.preventDefault();
        performSafeNavigation('portfolio.html'); // 🔥 About 페이지에서는 portfolio로 이동
      }
      
      setTimeout(() => {
        touchStarted = false;
      }, 100);
    });

    contactSection.addEventListener('click', (e) => {
      if (!touchStarted && !isScrolling) {
        e.preventDefault();
        performSafeNavigation('portfolio.html'); // 🔥 About 페이지에서는 portfolio로 이동
      }
    });

    console.log('✅ About page contact section click events initialized');
  }

  // ─── 🔥 안전한 네비게이션 함수 ───
  function performSafeNavigation(url) {
    console.log('🔗 About page navigating to:', url);
    
    document.body.style.opacity = '0.9';
    document.body.style.transition = 'opacity 0.2s ease';
    
    setTimeout(() => {
      window.location.href = url;
    }, 100);
  }

  // ─── 🔥 Contact 섹션 무한롤링 초기화 (About 페이지 전용) ───
  function initAboutContactInfiniteScroll() {
    const marqueeInner = document.querySelector('#contact .marquee-inner');
    const marqueeWrapper = document.querySelector('#contact .marquee-wrapper');
    
    if (!marqueeInner || !marqueeWrapper) {
      console.warn('About contact marquee elements not found');
      return;
    }
    
    // 색상 웨이브 딜레이 적용
    const allTextElements = marqueeInner.querySelectorAll('.text-item, .text-divider');
    allTextElements.forEach((element, index) => {
      const delay = (index * 0.3) % 4;
      element.style.animationDelay = `${delay}s`;
    });
    
    console.log('✅ About page contact infinite scroll initialized with', allTextElements.length, 'elements');
    console.log('✅ Gradient line above marquee should be visible!');
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

  // ─── 🔥 그라디언트 라인 디버깅 도구 추가 ───
  window.aboutGradientDebug = {
    // 그라디언트 라인 확인
    checkLine: () => {
      const line = document.getElementById('contactGradientLine');
      if (line) {
        const rect = line.getBoundingClientRect();
        const styles = window.getComputedStyle(line);
        
        console.log('🎨 Gradient line status:', {
          element: line,
          visible: rect.height > 0 && styles.opacity > 0,
          position: {
            top: rect.top,
            bottom: rect.bottom,
            left: rect.left,
            right: rect.right,
            width: rect.width,
            height: rect.height
          },
          styles: {
            background: styles.background,
            opacity: styles.opacity,
            display: styles.display,
            visibility: styles.visibility,
            position: styles.position,
            transform: styles.transform
          }
        });
        
        // 라인으로 스크롤
        line.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        return line;
      } else {
        console.error('❌ Gradient line not found');
        return null;
      }
    },
    
    // 라인 강제 생성
    createLine: () => {
      const existingLine = document.getElementById('contactGradientLine');
      if (existingLine) {
        existingLine.remove();
      }
      
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        const newLine = document.createElement('div');
        newLine.id = 'contactGradientLine';
        newLine.className = 'contact-gradient-line';
        newLine.style.cssText = `
          width: 100vw !important;
          height: 5px !important;
          background: linear-gradient(90deg, 
            transparent 0%, 
            #E37031 20%, 
            #ff8c42 50%, 
            #E37031 80%, 
            transparent 100%
          ) !important;
          opacity: 1 !important;
          margin: 50px 0 0 0 !important;
          position: relative !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          z-index: 9999 !important;
        `;
        
        contactSection.parentNode.insertBefore(newLine, contactSection);
        console.log('🔧 New gradient line created with enhanced visibility');
        
        // 생성된 라인으로 스크롤
        setTimeout(() => {
          newLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        
        return newLine;
      }
    },
    
    // 포트폴리오 페이지와 비교
    compareWithPortfolio: () => {
      console.log('🔍 About vs Portfolio gradient line comparison:');
      console.log('📋 About: HTML element approach (.contact-gradient-line)');
      console.log('📋 Portfolio: CSS ::after pseudo-element approach');
      console.log('💡 Recommendation: HTML element is more reliable for cross-browser compatibility');
    }
  };

  // 9) 성능 모니터링 (개발용)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🛠️ About page development mode');
    console.log('📊 About page elements:', {
      fadeUpElements: document.querySelectorAll('.fade-up').length,
      contentSections: document.querySelectorAll('.content-section').length,
      serviceItems: document.querySelectorAll('.services-list li').length,
      clientBoxes: document.querySelectorAll('.client-box').length,
      scrollIndicator: !!scrollIndicator,
      contactSection: !!contactSection,
      moreButton: !!clientsMoreBtn,
      gradientLine: !!contactGradientLine
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
      },
      testContactClick: () => {
        const contact = document.getElementById('contact');
        if (contact) contact.click();
      },
      testMoreButton: () => {
        const moreBtn = document.getElementById('clients-more-btn');
        if (moreBtn) moreBtn.click();
      },
      goToPortfolio: () => {
        performSafeNavigation('portfolio.html');
      },
      checkGradientLine: () => {
        return aboutGradientDebug.checkLine();
      },
      createGradientLine: () => {
        return aboutGradientDebug.createLine();
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
        serviceItems: document.querySelectorAll('.services-list li').length,
        contactSection: !!contactSection,
        marqueeElements: document.querySelectorAll('#contact .text-item').length,
        moreButton: !!clientsMoreBtn,
        clientBoxes: document.querySelectorAll('.client-box').length,
        gradientLine: !!contactGradientLine
      },
      newFeatures: {
        moreButtonDirectNavigation: true,
        gradientLineAboveMarquee: true,
        simplifiedMoreButtonStyle: true,
        htmlElementGradientLine: true
      }
    });
    
    // 🎨 그라디언트 라인 최종 확인
    if (contactGradientLine) {
      console.log('🎨 Final gradient line check passed ✅');
    } else {
      console.warn('⚠️ Gradient line not found in final check');
    }
    
  }, 100);

  // Contact 섹션 텍스트 기반 무한롤링 초기화 (로딩 완료 후)
  setTimeout(() => {
    initAboutContactInfiniteScroll();
  }, 1200);

  console.log('✅ About.js initialization complete - More+ goes direct to PORTFOLIO + HTML Gradient Line');
});
