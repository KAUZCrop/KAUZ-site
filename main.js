document.addEventListener('DOMContentLoaded', () => {
  // ─── 전역 변수 선언 (요소 존재 확인) ───
  const loadingScreen = document.getElementById('loading-screen');
  const progressFill  = document.querySelector('.progress-fill');
  const hamburger     = document.getElementById('hamburger');
  const menuOverlay   = document.getElementById('menu-overlay');
  const scrollIndicator = document.querySelector('.scroll-indicator'); // 🔥 추가
  const contactSection = document.getElementById('contact');

  console.log('Elements found:', { loadingScreen, progressFill, hamburger, menuOverlay, scrollIndicator });

  // 🔥 로딩 중 스크롤 비활성화
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';

  // ═══════════════════════════════════════════════════════════════
  // 🔥 한글 검색어 대응 시스템 (기존 코드 유지)
  // ═══════════════════════════════════════════════════════════════

  // 1) 한글 자모 → QWERTY 라틴 알파벳 매핑 테이블
  const jamoToKey = {
    // 한글 자음 (위쪽 줄)
    'ㅂ': 'q', 'ㅈ': 'w', 'ㄷ': 'e', 'ㄱ': 'r', 'ㅅ': 't',
    'ㅛ': 'y', 'ㅕ': 'u', 'ㅑ': 'i', 'ㅐ': 'o', 'ㅔ': 'p',
    
    // 한글 자음/모음 (가운데 줄)
    'ㅁ': 'a', 'ㄴ': 's', 'ㅇ': 'd', 'ㄹ': 'f', 'ㅎ': 'g',
    'ㅗ': 'h', 'ㅓ': 'j', 'ㅏ': 'k', 'ㅣ': 'l',
    
    // 한글 자음 (아래쪽 줄)
    'ㅋ': 'z', 'ㅌ': 'x', 'ㅊ': 'c', 'ㅍ': 'v', 'ㅠ': 'b',
    'ㅜ': 'n', 'ㅡ': 'm',
    
    // 쌍자음 및 복합모음
    'ㅃ': 'Q', 'ㅉ': 'W', 'ㄸ': 'E', 'ㄲ': 'R', 'ㅆ': 'T',
    'ㅒ': 'O', 'ㅖ': 'P'
  };

  // 2) 한글 자모를 QWERTY 문자로 변환하는 함수
  function transliterateKoreanToQwerty(input) {
    if (!input || typeof input !== 'string') return input;
    
    return input
      .split('')
      .map(char => jamoToKey[char] || char)
      .join('');
  }

  // 3) 🔥 KAUZ 관련 검색어 패턴 검사 함수 - 대폭 확장
  function isKauzSearch(input) {
    if (!input) return false;
    
    // 입력값 정리 (공백 제거, 소문자 변환)
    const cleanInput = input.trim().toLowerCase();
    
    // 🔥 직접적인 한글 검색어들
    const koreanVariants = [
      '카우즈', '카우스', '까우즈', '까우스', '가우즈', '가우스',
      'kauz corp', '카우즈 광고', '카우즈 광고대행사',
      '카우즈코프', '카우즈크롭',
    ];
    
    // 🔥 영어 검색어들
    const englishVariants = [
      'kauz', 'kauzcorp', 'kauz corp', 'kauz crop', 'kauzcrop',
      'kaus', 'kause', 'kawz', 'kauzs',
    ];
    
    // 🔥 자모 분리 오타들
    const jamoTypos = ['ㅏ몈', 'ㅏ묜', 'ㅏ뭊'];
    
    // 직접 매칭 체크
    if (koreanVariants.includes(cleanInput) || 
        englishVariants.includes(cleanInput) || 
        jamoTypos.includes(cleanInput)) {
      return true;
    }
    
    // 자모 분리 → QWERTY 변환 체크
    const transliterated = transliterateKoreanToQwerty(cleanInput);
    if (englishVariants.includes(transliterated)) {
      return true;
    }
    
    // 부분 포함 체크
    const partialMatches = ['kauz', '카우즈', '카우스'];
    return partialMatches.some(pattern => 
      cleanInput.includes(pattern) || 
      transliterated.includes(pattern)
    );
  }

  // 4) 🔥 URL 쿼리 파라미터 체크 및 리다이렉트
  function checkUrlForKauzSearch() {
    try {
      const params = new URLSearchParams(window.location.search);
      
      const searchParams = [
        'q', 'query', 'search', 's', 'keyword', 'k', 
        'term', 'find', 'lookup', '검색', 'wd'
      ];
      
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

  // 5) 메인 초기화 함수
  function initKoreanSearchHandler() {
    const redirected = checkUrlForKauzSearch();
    
    if (!redirected) {
      // 전역 함수로 노출 (디버깅용)
      window.checkKauzSearch = isKauzSearch;
      window.convertKoreanTypo = transliterateKoreanToQwerty;
    }
    
    console.log('🔍 한글 검색어 대응 시스템 초기화 완료');
  }

  // 한글 검색어 대응 시스템 초기화
  initKoreanSearchHandler();

  // ═══════════════════════════════════════════════════════════════
  // 🔥 기존 main.js 코드 계속...
  // ═══════════════════════════════════════════════════════════════

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

  // ─── 메뉴 닫기 함수 (강화된 버전) ───
  function closeMenu() {
    console.log('Closing menu...');
    if (menuOverlay) {
      menuOverlay.classList.remove('active');
    }
    if (hamburger) {
      hamburger.classList.remove('active');
    }
    // 메뉴 닫을 때는 로딩이 끝났다면 스크롤 허용
    if (!loadingScreen || loadingScreen.style.display === 'none') {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    document.body.classList.remove('menu-open');
  }

  // ─── 🔥 SCROLL 인디케이터 클릭 이벤트 ───
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

  // ─── Contact 섹션 클릭 처리 (스크롤 방해 없이) ───
  if (contactSection) {
    let isScrolling = false;
    let scrollTimeout;
    let startY = 0;
    let startTime = 0;

    // 터치/마우스 시작 지점 기록
    contactSection.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
      startTime = Date.now();
      isScrolling = false;
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 150);
    }, { passive: true });

    contactSection.addEventListener('mousedown', (e) => {
      startY = e.clientY;
      startTime = Date.now();
      isScrolling = false;
    });

    // 스크롤 감지
    contactSection.addEventListener('touchmove', (e) => {
      const currentY = e.touches[0].clientY;
      const deltaY = Math.abs(currentY - startY);
      
      if (deltaY > 10) { // 10px 이상 움직이면 스크롤로 간주
        isScrolling = true;
      }
    }, { passive: true });

    contactSection.addEventListener('mousemove', (e) => {
      const currentY = e.clientY;
      const deltaY = Math.abs(currentY - startY);
      
      if (deltaY > 10) {
        isScrolling = true;
      }
    });

    // 클릭/터치 종료 시 처리
    contactSection.addEventListener('touchend', (e) => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 스크롤이 아니고, 짧은 터치(300ms 이하)면 클릭으로 간주
      if (!isScrolling && duration < 300) {
        e.preventDefault();
        window.location.href = 'contact.html';
      }
    });

    contactSection.addEventListener('click', (e) => {
      if (!isScrolling) {
        e.preventDefault();
        window.location.href = 'contact.html';
      }
    });
  }

  // ─── About 섹션 클릭 이벤트 + 확장 커서 애니메이션 ───
  const aboutSection = document.querySelector('.about-custom');

  if (aboutSection) {
    console.log('About section found, initializing interaction...');
    
    // 커스텀 커서 요소 생성
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
    
    // 커서 스타일 CSS 추가
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
    
    // 마우스가 About 섹션에 진입할 때
    aboutSection.addEventListener('mouseenter', function() {
      if (window.innerWidth > 768) {
        customCursor.style.opacity = '1';
        customCursor.classList.add('cursor-expanded');
      }
    });
    
    // 마우스가 About 섹션을 벗어날 때
    aboutSection.addEventListener('mouseleave', function() {
      customCursor.style.opacity = '0';
      customCursor.classList.remove('cursor-expanded');
    });
    
    // 마우스 움직임 추적 (About 섹션 내에서만)
    aboutSection.addEventListener('mousemove', function(e) {
      if (window.innerWidth > 768) {
        const x = e.clientX;
        const y = e.clientY;
        
        customCursor.style.left = x + 'px';
        customCursor.style.top = y + 'px';
      }
    });
    
    // 클릭 시 About 페이지로 이동
    aboutSection.addEventListener('click', function(e) {
      console.log('About section clicked');
      
      // 클릭 시 커서 펄스 효과
      customCursor.style.transform = 'translate(-50%, -50%) scale(1.1)';
      setTimeout(() => {
        customCursor.style.transform = 'translate(-50%, -50%) scale(1)';
      }, 150);
      
      // 부드러운 페이지 전환 효과
      document.body.style.opacity = '0.8';
      document.body.style.transition = 'opacity 0.3s ease';
      
      setTimeout(() => {
        window.location.href = 'about.html';
      }, 200);
    });
    
    console.log('About section expandable cursor initialized');
  }

  // ─── 🔥 수정된 Typing Animation Function ───
  function startTypingAnimation() {
    const target1 = document.getElementById('typing-line1');
    
    console.log('Starting typing animation...', { target1 });
    
    if (!target1) {
      console.error('Typing target not found');
      return;
    }

    const line1 = "Knowledge Artistry Understanding Zenith";
    const cursor  = '<span class="typing-cursor">|</span>';
    const totalDuration = 2000; // 2초 동안 타이핑
    const interval = totalDuration / line1.length;
    let i1 = 0;

    function type1() {
      if (i1 < line1.length) {
        target1.innerHTML = line1.slice(0, i1) + cursor;
        i1++;
        setTimeout(type1, interval);
      } else {
        target1.textContent = line1; // 타이핑 완료 후 커서 제거
      }
    }
    
    type1();
  }

  // ─── 로딩 스크린 처리 (수정된 버전) ───
  function hideLoadingScreen() {
    console.log('Hiding loading screen...');
    
    // 로딩 스크린 페이드 아웃
    if (loadingScreen) {
      loadingScreen.style.transition = 'opacity 0.8s ease';
      loadingScreen.style.opacity = '0';
    }

    // 햄버거 메뉴 표시
    if (hamburger) {
      hamburger.style.display = 'flex';
      hamburger.style.visibility = 'visible';
      hamburger.style.opacity = '1';
    }

    // 🔥 배경 애니메이션 라인 활성화
    const backgroundLine = document.querySelector('.background-animation-line');
    if (backgroundLine) {
      backgroundLine.classList.add('active');
      console.log('✅ Background animation line activated');
    }

    // 🔥 로딩 완료 후 스크롤 활성화
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.body.classList.remove('loading');

    // 로딩 스크린 완전 제거 및 타이핑 시작
    setTimeout(() => {
      if (loadingScreen) {
        loadingScreen.style.display = 'none';
      }
      startTypingAnimation();
    }, 800); // 🔥 배경 라인 전환 시간에 맞춤
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

    // 로딩 화면 숨기기
    setTimeout(hideLoadingScreen, 500);
  });

  // 폴백: 3초 후에도 로딩 화면이 남아있으면 강제로 숨기기
  setTimeout(() => {
    if (loadingScreen && loadingScreen.style.display !== 'none') {
      console.warn('Forcing loading screen removal');
      hideLoadingScreen();
    }
  }, 3000);

  // ─── 햄버거 메뉴 토글 (디버깅 강화) ───
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
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        document.body.classList.add('menu-open');
        console.log('Menu opened');
      }
    });

    // 메뉴 링크 클릭 시 닫기
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

  // ─── Airtable Portfolio Loading (와이드 확장 애니메이션) ───
  const token = 'patouGO5iPVpIxbRf.e4bdbe02fe59cbe69f201edaa32b4b63f8e05dbbfcae34173f0f40c985b811d9';
  const baseId = 'appglO0MOXGY7CITU';
  const tableName = 'Table%201';

  // 포트폴리오 로딩 함수
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
      
      // 최신 4개만 가져오기
      const records = data.records
        .sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime))
        .slice(0, 4);
      
      const container = document.getElementById('PortfolioSliderList');
      
      if (!container) {
        console.error('Portfolio container not found!');
        return;
      }

      // 기존 내용 제거
      container.innerHTML = '';

      // 정확히 4개 항목 생성 (빈 슬롯도 포함)
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
            // 이미지가 있는 경우
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
            // 이미지가 없는 경우 - 흰색 박스
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
          // 데이터가 없는 경우 - 빈 흰색 박스
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

      // 모바일이 아닐 때만 호버 효과 적용
      const isMobile = window.innerWidth <= 768;
      const slides = container.querySelectorAll('.portfolio-slide');
      
      if (!isMobile) {
        slides.forEach((slide, index) => {
          // 마우스 이벤트 (데스크톱만)
          slide.addEventListener('mouseenter', () => {
            handleSlideHover(slides, index);
          });
        });

        // 컨테이너에서 마우스가 벗어나면 초기화
        container.addEventListener('mouseleave', () => {
          resetSlides(slides);
        });
      }

      // 🔥 포트폴리오 클릭 이벤트 추가 (모든 디바이스에서 작동)
      slides.forEach((slide, index) => {
        slide.addEventListener('click', (e) => {
          console.log(`Portfolio item ${index + 1} clicked`);
          
          // 부드러운 페이지 전환 효과
          document.body.style.opacity = '0.9';
          document.body.style.transition = 'opacity 0.2s ease';
          
          // 포트폴리오 페이지로 이동
          setTimeout(() => {
            window.location.href = 'portfolio.html';
          }, 100);
        });
        
        // 클릭 가능하다는 시각적 피드백 추가
        slide.style.cursor = 'pointer';
      });

      // 확장 효과 처리 함수 - 수정된 버전
      function handleSlideHover(slides, activeIndex) {
        // 애니메이션 딜레이 제거하여 즉각 반응
        slides.forEach((slide, index) => {
          // 모든 클래스 즉시 제거
          slide.classList.remove('portfolio-expanded', 'portfolio-shrunk');
        });
        
        // requestAnimationFrame으로 부드러운 전환
        requestAnimationFrame(() => {
          // 활성화된 슬라이드 확장
          slides[activeIndex].classList.add('portfolio-expanded');
          
          // 나머지 슬라이드 축소
          slides.forEach((slide, index) => {
            if (index !== activeIndex) {
              slide.classList.add('portfolio-shrunk');
            }
          });
        });
      }

      // 슬라이드 초기화 함수 - 수정된 버전
      function resetSlides(slides) {
        // 모든 클래스 즉시 제거하여 원상복구
        slides.forEach(slide => {
          slide.classList.remove('portfolio-expanded', 'portfolio-shrunk');
        });
      }

      console.log('Portfolio with expansion animation and click events created successfully');
    })
    .catch(err => {
      console.error('Airtable fetch error:', err);
      // 에러 발생시 기본 포트폴리오 표시
      displayDefaultPortfolio();
    });
  }

  // 기본 포트폴리오 표시 함수 (Airtable 로드 실패시)
  function displayDefaultPortfolio() {
    const container = document.getElementById('PortfolioSliderList');
    if (!container) return;

    container.innerHTML = `
      <div class="portfolio-slide">
        <div class="portfolio-image-container">
          <div class="portfolio-placeholder">Portfolio 1</div>
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
    
    // 기본 포트폴리오에도 클릭 이벤트 추가
    const defaultSlides = container.querySelectorAll('.portfolio-slide');
    defaultSlides.forEach((slide, index) => {
      slide.addEventListener('click', (e) => {
        console.log(`Default portfolio item ${index + 1} clicked`);
        
        // 부드러운 페이지 전환 효과
        document.body.style.opacity = '0.9';
        document.body.style.transition = 'opacity 0.2s ease';
        
        // 포트폴리오 페이지로 이동
        setTimeout(() => {
          window.location.href = 'portfolio.html';
        }, 100);
      });
      
      // 클릭 가능하다는 시각적 피드백 추가
      slide.style.cursor = 'pointer';
    });
  }

  // 포트폴리오 로드 실행
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

  // about-card elements
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

  // ─── 🔥 이중 레이어 스트로크 무한 롤링 설정 (기존 롤링 텍스트 대체) ───
  const strokeText = document.querySelector('.stroke-text');
  if (strokeText) {
    // 🔥 기존 롤링 텍스트 관련 요소들 제거 (충돌 방지)
    const oldScrollingElements = document.querySelectorAll('.scrolling-container, .scrolling-text:not(.stroke-text), .scrolling-text-clone');
    oldScrollingElements.forEach(el => {
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
        console.log('🗑️ Removed old scrolling element:', el.className);
      }
    });

    // 🔥 끊김 없는 무한 롤링을 위한 복제본 생성
    const clone = strokeText.cloneNode(true);
    clone.style.position = 'absolute';
    clone.style.left = '100%';
    clone.style.top = '0';
    clone.style.animationDelay = '0s'; // 메인과 동기화
    strokeText.parentNode.appendChild(clone);
    
    console.log('✅ Stroke text infinite rolling initialized');
  } else {
    console.warn('⚠️ Stroke text element not found - check HTML structure');
  }

  // ═══════════════════════════════════════════════════════════════
  // 🔥 한글 검색어 대응 테스트 및 추가 이벤트
  // ═══════════════════════════════════════════════════════════════

  // URL 변경 감지 (뒤로가기/앞으로가기)
  window.addEventListener('popstate', checkUrlForKauzSearch);

  // 테스트 함수 (개발 중에만 사용)
  function testKoreanSearchHandler() {
    const testCases = [
      'ㅏ몈',      // 한글 오타
      'KAUZ',      // 정상
      'kauz',      // 소문자
      'ㅏ몈 ',     // 공백 포함
      ' ㅏ몈',     // 앞 공백
      '카우즈',    // 한글명
      '카우스',    // 한글 변형
      'kaus',      // 영어 변형
      'hello',     // 다른 단어
      '',          // 빈 문자열
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

  console.log('✅ Main.js initialization complete');
});

// ═══════════════════════════════════════════════════════════════
// 🔥 전역 스코프 함수들 (필요시)
// ═══════════════════════════════════════════════════════════════

// 외부에서 한글 검색어 체크가 필요한 경우를 위한 전역 함수
window.addEventListener('load', () => {
  // 한글 검색어 관련 전역 함수들이 설정되었는지 확인
  if (typeof window.checkKauzSearch === 'function') {
    console.log('✅ 한글 검색어 대응 시스템 전역 함수 준비 완료');
    
    // 예시: 외부 스크립트에서 사용 가능
    // if (window.checkKauzSearch(someUserInput)) { /* 처리 로직 */ }
  }
}
