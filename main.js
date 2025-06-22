document.addEventListener('DOMContentLoaded', () => {
  // ─── 🔥 새로고침 시 페이지 상단으로 이동 ───
  try {
    if (performance.getEntriesByType('navigation')[0].type === 'reload') {
      console.log('🔄 Main page refresh detected, scrolling to top...');
      window.scrollTo(0, 0);
    }
  } catch (e) {
    console.log('⚠️ Navigation API not supported, continuing...');
  }

  // ─── 전역 변수 선언 ───
  const loadingScreen = document.getElementById('loading-screen');
  const progressFill = document.querySelector('.progress-fill');
  const hamburger = document.getElementById('hamburger');
  const menuOverlay = document.getElementById('menu-overlay');
  const scrollIndicator = document.querySelector('.scroll-indicator');
  const contactSection = document.getElementById('contact');

  console.log('Elements found:', { loadingScreen, progressFill, hamburger, menuOverlay, scrollIndicator });

  // ─── 스크롤 제어 함수들 ───
  function disableScroll() {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.classList.add('loading', 'no-scroll');
    
    document.addEventListener('wheel', preventDefault, { passive: false });
    document.addEventListener('touchmove', preventDefault, { passive: false });
    document.addEventListener('keydown', preventDefaultForScrollKeys, false);
    
    console.log('🚫 Scroll completely disabled');
  }

  function enableScroll() {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.height = '';
    document.body.classList.remove('loading', 'no-scroll');
    
    document.removeEventListener('wheel', preventDefault, { passive: false });
    document.removeEventListener('touchmove', preventDefault, { passive: false });
    document.removeEventListener('keydown', preventDefaultForScrollKeys, false);
    
    console.log('✅ Scroll enabled');
  }

  function preventDefault(e) {
    e.preventDefault();
  }

  function preventDefaultForScrollKeys(e) {
    const scrollKeys = [32, 33, 34, 35, 36, 37, 38, 39, 40];
    if (scrollKeys.includes(e.keyCode)) {
      preventDefault(e);
      return false;
    }
  }

  // 페이지 로드 시 즉시 스크롤 차단
  disableScroll();

  // ─── 한글 검색어 대응 시스템 ───
  const jamoToKey = {
    'ㅂ': 'q', 'ㅈ': 'w', 'ㄷ': 'e', 'ㄱ': 'r', 'ㅅ': 't',
    'ㅛ': 'y', 'ㅕ': 'u', 'ㅑ': 'i', 'ㅐ': 'o', 'ㅔ': 'p',
    'ㅁ': 'a', 'ㄴ': 's', 'ㅇ': 'd', 'ㄹ': 'f', 'ㅎ': 'g',
    'ㅗ': 'h', 'ㅓ': 'j', 'ㅏ': 'k', 'ㅣ': 'l',
    'ㅋ': 'z', 'ㅌ': 'x', 'ㅊ': 'c', 'ㅍ': 'v', 'ㅠ': 'b',
    'ㅜ': 'n', 'ㅡ': 'm',
    'ㅃ': 'Q', 'ㅉ': 'W', 'ㄸ': 'E', 'ㄲ': 'R', 'ㅆ': 'T',
    'ㅒ': 'O', 'ㅖ': 'P'
  };

  function transliterateKoreanToQwerty(input) {
    if (!input || typeof input !== 'string') return input;
    return input.split('').map(char => jamoToKey[char] || char).join('');
  }

  function isKauzSearch(input) {
    if (!input) return false;
    
    const cleanInput = input.trim().toLowerCase();
    
    const koreanVariants = [
      '카우즈', '카우스', '까우즈', '까우스', '가우즈', '가우스',
      'kauz corp', '카우즈 광고', '카우즈 광고대행사',
      '카우즈코프', '카우즈크롭',
    ];
    
    const englishVariants = [
      'kauz', 'kauzcorp', 'kauz corp', 'kauz crop', 'kauzcrop',
      'kaus', 'kause', 'kawz', 'kauzs',
    ];
    
    const jamoTypos = ['ㅏ몈', 'ㅏ묜', 'ㅏ뭊'];
    
    if (koreanVariants.includes(cleanInput) || 
        englishVariants.includes(cleanInput) || 
        jamoTypos.includes(cleanInput)) {
      return true;
    }
    
    const transliterated = transliterateKoreanToQwerty(cleanInput);
    if (englishVariants.includes(transliterated)) {
      return true;
    }
    
    const partialMatches = ['kauz', '카우즈', '카우스'];
    return partialMatches.some(pattern => 
      cleanInput.includes(pattern) || 
      transliterated.includes(pattern)
    );
  }

  function checkUrlForKauzSearch() {
    try {
      const params = new URLSearchParams(window.location.search);
      const searchParams = ['q', 'query', 'search', 's', 'keyword', 'k', 'term', 'find', 'lookup', '검색', 'wd'];
      
      let searchQuery = null;
      for (const param of searchParams) {
        searchQuery = params.get(param);
        if (searchQuery) break;
      }
      
      if (searchQuery && isKauzSearch(searchQuery)) {
        console.log(`🔄 KAUZ 검색어 감지: "${searchQuery}" → 홈페이지로 이동`);
        
        if (window.gtag) {
          window.gtag('event', 'kauz_search_redirect', {
            'search_term': searchQuery,
            'redirect_source': 'url_param'
          });
        }
        
        document.body.style.opacity = '0.8';
        document.body.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
          if (window.history.replaceState) {
            window.history.replaceState({}, document.title, '/');
          }
          window.location.href = '/';
        }, 300);
        
        return true;
      }
    } catch (error) {
      console.warn('URL 파라미터 체크 중 오류:', error);
    }
    
    return false;
  }

  function initKoreanSearchHandler() {
    const redirected = checkUrlForKauzSearch();
    
    if (!redirected) {
      window.checkKauzSearch = isKauzSearch;
      window.convertKoreanTypo = transliterateKoreanToQwerty;
    }
    
    console.log('🔍 한글 검색어 대응 시스템 초기화 완료');
  }

  initKoreanSearchHandler();

  // ─── Body mobile class toggle ───
  function setBodyMobileClass() {
    if (window.innerWidth <= 768) {
      document.body.classList.add('mobile');
    } else {
      document.body.classList.remove('mobile');
    }
  }
  setBodyMobileClass();
  window.addEventListener('resize', setBodyMobileClass);

  // ─── 메뉴 닫기 함수 ───
  function closeMenu() {
    console.log('Closing menu...');
    if (menuOverlay) {
      menuOverlay.classList.remove('active');
    }
    if (hamburger) {
      hamburger.classList.remove('active');
    }
    if (!loadingScreen || loadingScreen.style.display === 'none') {
      enableScroll();
    } else {
      disableScroll();
    }
    document.body.classList.remove('menu-open');
  }

  // ─── SCROLL 인디케이터 클릭 이벤트 ───
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      const aboutSection = document.getElementById('about');
      if (aboutSection) {
        aboutSection.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
    console.log('✅ SCROLL 인디케이터 클릭 이벤트 추가됨');
  }

  // ─── Contact 섹션 클릭 처리 ───
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
        performSafeNavigation('contact.html');
      }
      
      setTimeout(() => {
        touchStarted = false;
      }, 100);
    });

    contactSection.addEventListener('click', (e) => {
      if (!touchStarted && !isScrolling) {
        e.preventDefault();
        performSafeNavigation('contact.html');
      }
    });

    function performSafeNavigation(url) {
      console.log('🔗 Navigating to:', url);
      
      document.body.style.opacity = '0.9';
      document.body.style.transition = 'opacity 0.2s ease';
      
      setTimeout(() => {
        window.location.href = url;
      }, 100);
    }
  }

  // ─── About 섹션 클릭 이벤트 + 확장 커서 애니메이션 ───
  const aboutSection = document.querySelector('.about-custom');

  if (aboutSection) {
    console.log('About section found, initializing interaction...');
    
    const customCursor = document.createElement('div');
    
    customCursor.innerHTML = `
      <div class="cursor-circle"></div>
      <div class="cursor-text">
        <div class="cursor-line1">Go To</div>
        <div class="cursor-line2">Page →</div>
      </div>
    `;
    
    customCursor.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      transition: opacity 0.15s ease-out;
      opacity: 0;
    `;
    
    const cursorStyle = document.createElement('style');
    cursorStyle.textContent = `
      .cursor-circle {
        width: 20px;
        height: 20px;
        border: 2px solid rgba(255, 255, 255, 0.8);
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        transition: all 0.15s ease-out;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .cursor-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        opacity: 0;
        transition: opacity 0.15s ease-out;
        pointer-events: none;
        font-family: 'Pretendard', sans-serif;
        text-align: center;
        z-index: 10;
      }
      
      .cursor-line1, .cursor-line2 {
        font-size: 11px;
        color: white;
        font-weight: 600;
        white-space: nowrap;
        letter-spacing: 0.3px;
        display: block;
        width: 40px;
        text-align: center;
        line-height: 1.2;
      }
      
      .cursor-expanded .cursor-circle {
        width: 80px;
        height: 80px;
        border: 1px solid rgba(255, 255, 255, 0.6);
        background: rgba(0, 0, 0, 0.8);
      }
      
      .cursor-expanded .cursor-text {
        opacity: 1;
      }
    `;
    document.head.appendChild(cursorStyle);
    
    document.body.appendChild(customCursor);
    
    aboutSection.addEventListener('mouseenter', function() {
      if (window.innerWidth > 768) {
        customCursor.style.opacity = '1';
        customCursor.classList.add('cursor-expanded');
      }
    });
    
    aboutSection.addEventListener('mouseleave', function() {
      customCursor.style.opacity = '0';
      customCursor.classList.remove('cursor-expanded');
    });
    
    aboutSection.addEventListener('mousemove', function(e) {
      if (window.innerWidth > 768) {
        const x = e.clientX;
        const y = e.clientY;
        
        customCursor.style.left = x + 'px';
        customCursor.style.top = y + 'px';
      }
    });
    
    aboutSection.addEventListener('click', function(e) {
      console.log('About section clicked');
      
      customCursor.style.transform = 'translate(-50%, -50%) scale(1.1)';
      setTimeout(() => {
        customCursor.style.transform = 'translate(-50%, -50%) scale(1)';
      }, 150);
      
      document.body.style.opacity = '0.8';
      document.body.style.transition = 'opacity 0.3s ease';
      
      setTimeout(() => {
        window.location.href = 'about.html';
      }, 200);
    });
    
    console.log('About section expandable cursor initialized');
  }

  // ─── 타이핑 애니메이션 함수 ───
  function startTypingAnimation() {
    const target1 = document.getElementById('typing-line1');
    
    console.log('Starting typing animation...', { target1 });
    
    if (!target1) {
      console.error('Typing target not found');
      return;
    }

    const line1 = "Knowledge Artistry Understanding Zenith";
    const cursor = '<span class="typing-cursor">|</span>';
    const totalDuration = 2000;
    const interval = totalDuration / line1.length;
    let i1 = 0;

    function type1() {
      if (i1 < line1.length) {
        target1.innerHTML = line1.slice(0, i1) + cursor;
        i1++;
        setTimeout(type1, interval);
      } else {
        target1.textContent = line1;
      }
    }
    
    type1();
  }

  // ─── 로딩 스크린 처리 ───
  function hideLoadingScreen() {
    console.log('Hiding loading screen...');
    
    if (loadingScreen) {
      loadingScreen.style.transition = 'opacity 0.8s ease';
      loadingScreen.style.opacity = '0';
    }

    if (hamburger) {
      hamburger.style.display = 'flex';
      hamburger.style.visibility = 'visible';
      hamburger.style.opacity = '1';
    }

    const backgroundLine = document.querySelector('.background-animation-line');
    if (backgroundLine) {
      backgroundLine.classList.add('active');
      console.log('✅ Background animation line activated');
    }

    enableScroll();

    setTimeout(() => {
      if (loadingScreen) {
        loadingScreen.style.display = 'none';
      }
      startTypingAnimation();
    }, 800);
  }

  // 초기 로딩 진행률 설정
  if (progressFill) {
    progressFill.style.width = '50%';
  }

  // 페이지 로드 완료 시
  window.addEventListener('load', () => {
    console.log('Window loaded');
    
    if (progressFill) {
      progressFill.style.width = '100%';
    }

    setTimeout(hideLoadingScreen, 500);
  });

  // 폴백: 3초 후에도 로딩 화면이 남아있으면 강제로 숨기기
  setTimeout(() => {
    if (loadingScreen && loadingScreen.style.display !== 'none') {
      console.warn('Forcing loading screen removal');
      hideLoadingScreen();
    }
  }, 3000);

  // ─── 햄버거 메뉴 토글 ───
  if (hamburger && menuOverlay) {
    hamburger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const isMenuOpen = menuOverlay.classList.contains('active');
      console.log('Hamburger clicked, menu open:', isMenuOpen);
      
      if (isMenuOpen) {
        closeMenu();
      } else {
        menuOverlay.classList.add('active');
        hamburger.classList.add('active');
        disableScroll();
        document.body.classList.add('menu-open');
        console.log('Menu opened');
      }
    });

    const menuLinks = document.querySelectorAll('#menu-overlay .menu-content a');
    console.log('Menu links found:', menuLinks.length);
    
    menuLinks.forEach((link, index) => {
      link.addEventListener('click', (e) => {
        console.log(`Menu link ${index} clicked`);
        closeMenu();
      });
    });
  } else {
    console.error('Hamburger or menu overlay not found!');
  }

  // ─── ESC키로 메뉴 닫기 ───
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      console.log('ESC key pressed');
      if (menuOverlay && menuOverlay.classList.contains('active')) {
        closeMenu();
      }
    }
  });

  // ─── 메뉴 오버레이 배경 클릭 시 닫기 ───
  if (menuOverlay) {
    menuOverlay.addEventListener('click', (e) => {
      if (e.target === menuOverlay) {
        console.log('Menu overlay background clicked');
        closeMenu();
      }
    });
  }

  // ─── Airtable Portfolio Loading ───
  const token = 'patouGO5iPVpIxbRf.e4bdbe02fe59cbe69f201edaa32b4b63f8e05dbbfcae34173f0f40c985b811d9';
  const baseId = 'appglO0MOXGY7CITU';
  const tableName = 'Table%201';

  function loadPortfolio() {
    fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Airtable data loaded:', data);
      
      const records = data.records
        .sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime))
        .slice(0, 4);
      
      const container = document.getElementById('PortfolioSliderList');
      
      if (!container) {
        console.error('Portfolio container not found!');
        return;
      }

      container.innerHTML = '';

      for (let i = 0; i < 4; i++) {
        const record = records[i];
        const slide = document.createElement('div');
        slide.className = 'portfolio-slide';
        
        if (record) {
          const fields = record.fields;
          const title = fields.Title || '제목 없음';
          const attachments = fields.ImageURL;
          const hasImage = Array.isArray(attachments) && attachments.length > 0;
          
          if (hasImage) {
            slide.innerHTML = `
              <div class="portfolio-image-container">
                <img src="${attachments[0].url}" alt="${title}" loading="lazy" />
              </div>
              <div class="portfolio-slide-title">
                <span class="portfolio-brand-name">${title}</span>
                <span class="portfolio-slide-category">Digital Campaign</span>
              </div>
            `;
          } else {
            slide.innerHTML = `
              <div class="portfolio-image-container">
                <div class="portfolio-placeholder">No Image</div>
              </div>
              <div class="portfolio-slide-title">
                <span class="portfolio-brand-name">${title}</span>
                <span class="portfolio-slide-category">Portfolio</span>
              </div>
            `;
          }
        } else {
          slide.innerHTML = `
            <div class="portfolio-image-container">
              <div class="portfolio-placeholder">No Content</div>
            </div>
            <div class="portfolio-slide-title">
              <span class="portfolio-brand-name">제목 없음</span>
              <span class="portfolio-slide-category">Coming Soon</span>
            </div>
          `;
        }
        
        container.appendChild(slide);
      }

      const isMobile = window.innerWidth <= 768;
      const slides = container.querySelectorAll('.portfolio-slide');
      
      if (!isMobile) {
        slides.forEach((slide, index) => {
          slide.addEventListener('mouseenter', () => {
            handleSlideHover(slides, index);
          });
        });

        container.addEventListener('mouseleave', () => {
          resetSlides(slides);
        });
      }

      slides.forEach((slide, index) => {
        slide.addEventListener('click', (e) => {
          console.log(`Portfolio item ${index + 1} clicked`);
          
          document.body.style.opacity = '0.9';
          document.body.style.transition = 'opacity 0.2s ease';
          
          setTimeout(() => {
            window.location.href = 'portfolio.html';
          }, 100);
        });
        
        slide.style.cursor = 'pointer';
      });

      function handleSlideHover(slides, activeIndex) {
        slides.forEach((slide, index) => {
          slide.classList.remove('portfolio-expanded', 'portfolio-shrunk');
        });
        
        requestAnimationFrame(() => {
          slides[activeIndex].classList.add('portfolio-expanded');
          
          slides.forEach((slide, index) => {
            if (index !== activeIndex) {
              slide.classList.add('portfolio-shrunk');
            }
          });
        });
      }

      function resetSlides(slides) {
        slides.forEach(slide => {
          slide.classList.remove('portfolio-expanded', 'portfolio-shrunk');
        });
      }

      console.log('Portfolio with expansion animation and click events created successfully');
    })
    .catch(err => {
      console.error('Airtable fetch error:', err);
      displayDefaultPortfolio();
    });
  }

  function displayDefaultPortfolio() {
    const container = document.getElementById('PortfolioSliderList');
    if (!container) return;

    container.innerHTML = `
      <div class="portfolio-slide">
        <div class="portfolio-image-container">
          <div class="portfolio-placeholder">Portfolio 1</div>
        </div>
        <div class="portfolio-slide-title">
          <span class="portfolio-brand-name">샘플 프로젝트 1</span>
          <span class="portfolio-slide-category">Portfolio</span>
        </div>
      </div>
      <div class="portfolio-slide">
        <div class="portfolio-image-container">
          <div class="portfolio-placeholder">Portfolio 2</div>
        </div>
        <div class="portfolio-slide-title">
          <span class="portfolio-brand-name">샘플 프로젝트 2</span>
          <span class="portfolio-slide-category">Portfolio</span>
        </div>
      </div>
      <div class="portfolio-slide">
        <div class="portfolio-image-container">
          <div class="portfolio-placeholder">Portfolio 3</div>
        </div>
        <div class="portfolio-slide-title">
          <span class="portfolio-brand-name">샘플 프로젝트 3</span>
          <span class="portfolio-slide-category">Portfolio</span>
        </div>
      </div>
      <div class="portfolio-slide">
        <div class="portfolio-image-container">
          <div class="portfolio-placeholder">Portfolio 4</div>
        </div>
        <div class="portfolio-slide-title">
          <span class="portfolio-brand-name">샘플 프로젝트 4</span>
          <span class="portfolio-slide-category">Portfolio</span>
        </div>
      </div>
    `;
    
    const defaultSlides = container.querySelectorAll('.portfolio-slide');
    defaultSlides.forEach((slide, index) => {
      slide.addEventListener('click', (e) => {
        console.log(`Default portfolio item ${index + 1} clicked`);
        
        document.body.style.opacity = '0.9';
        document.body.style.transition = 'opacity 0.2s ease';
        
        setTimeout(() => {
          window.location.href = 'portfolio.html';
        }, 100);
      });
      
      slide.style.cursor = 'pointer';
    });
  }

  loadPortfolio();
  
  // ─── Scroll-Fade Animations ───
  const fadeEls = document.querySelectorAll('.fade-up');
  if (fadeEls.length > 0) {
    const fadeObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    fadeEls.forEach(el => fadeObserver.observe(el));
    console.log('Fade-up elements initialized:', fadeEls.length);
  }

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

  // ─── 🔥 Contact 섹션 텍스트 기반 무한롤링 초기화 ───
  function initTextBasedContactInfiniteScroll() {
    const marqueeInner = document.querySelector('#contact .marquee-inner');
    const marqueeWrapper = document.querySelector('#contact .marquee-wrapper');
    
    if (!marqueeInner || !marqueeWrapper) {
      console.warn('Contact marquee elements not found');
      return;
    }
    
    // 색상 웨이브 딜레이 적용
    const allTextElements = marqueeInner.querySelectorAll('.text-item, .text-divider');
    allTextElements.forEach((element, index) => {
      const delay = (index * 0.3) % 4;
      element.style.animationDelay = `${delay}s`;
    });
    
    console.log('✅ Text-based contact infinite scroll initialized with', allTextElements.length, 'elements');
    console.log('✅ No SVG viewBox issues, stable text rendering!');
  }

  // ─── 추가 이벤트들 ───
  window.addEventListener('popstate', checkUrlForKauzSearch);

  function testKoreanSearchHandler() {
    const testCases = [
      'ㅏ몈', 'KAUZ', 'kauz', 'ㅏ몈 ', ' ㅏ몈',
      '카우즈', '카우스', 'kaus', 'hello', ''
    ];
    
    console.log('🧪 한글 검색어 대응 테스트:');
    testCases.forEach(test => {
      const result = isKauzSearch(test);
      const converted = transliterateKoreanToQwerty(test);
      console.log(`"${test}" → 변환: "${converted}" | KAUZ 검색어?: ${result}`);
    });
  }

  // 개발 모드에서만 테스트 실행
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.testKoreanSearch = testKoreanSearchHandler;
    console.log('🛠️ 개발 모드: window.testKoreanSearch() 로 테스트 가능');
  }

  // 페이지 나가기 전 스크롤 차단
  window.addEventListener('beforeunload', () => {
    disableScroll();
  });

  // 페이지 포커스/블러 처리 (탭 전환 시)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (menuOverlay && menuOverlay.classList.contains('active')) {
        closeMenu();
      }
    }
  });

  // Contact 섹션 텍스트 기반 무한롤링 초기화 (로딩 완료 후)
  setTimeout(() => {
    initTextBasedContactInfiniteScroll();
  }, 1200);

  console.log('✅ Main.js initialization complete');
});

// ─── 전역 스코프 함수들 ───
window.addEventListener('load', () => {
  if (typeof window.checkKauzSearch === 'function') {
    console.log('✅ 한글 검색어 대응 시스템 전역 함수 준비 완료');
  }
});
