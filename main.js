document.addEventListener('DOMContentLoaded', () => {
  // ─── 전역 변수 선언 (요소 존재 확인) ───
  const loadingScreen = document.getElementById('loading-screen');
  const progressFill  = document.querySelector('.progress-fill');
  const hamburger     = document.getElementById('hamburger');
  const menuOverlay   = document.getElementById('menu-overlay');
  const scrollingContainer = document.querySelector('.scrolling-container');
  const scrollingText = document.querySelector('.scrolling-text');

  console.log('Elements found:', { loadingScreen, progressFill, hamburger, menuOverlay });

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
    document.body.style.overflow = '';
  }

  // ─── Typing Animation Function ───
  function startTypingAnimation() {
    const target1 = document.getElementById('typing-line1');
    const target2 = document.getElementById('typing-line2');
    
    console.log('Starting typing animation...', { target1, target2 });
    
    if (!target1 || !target2) {
      console.error('Typing targets not found');
      return;
    }

    const line1 = "Your brand's journey —";
    const line2 = "from insight in the Mind to impact that leaves a Mark.";
    const cursor  = '<span class="typing-cursor">|</span>';
    const totalDuration = 1700;
    const interval = totalDuration / (line1.length + line2.length);
    let i1 = 0, i2 = 0;

    function type1() {
      if (i1 < line1.length) {
        target1.innerHTML = line1.slice(0, i1) + cursor;
        i1++;
        setTimeout(type1, interval);
      } else {
        target1.textContent = line1;
        target2.innerHTML = cursor;
        setTimeout(type2, interval);
      }
    }
    
    function type2() {
      if (i2 < line2.length) {
        target2.innerHTML = line2.slice(0, i2) + cursor;
        i2++;
        setTimeout(type2, interval);
      } else {
        target2.textContent = line2;
      }
    }
    
    type1();
  }

  // ─── 로딩 스크린 처리 (수정된 버전) ───
  function hideLoadingScreen() {
    console.log('Hiding loading screen...');
    
    // 로딩 스크린 페이드 아웃
    if (loadingScreen) {
      loadingScreen.style.transition = 'opacity 0.5s ease';
      loadingScreen.style.opacity = '0';
    }

    // 햄버거 메뉴 표시
    if (hamburger) {
      hamburger.style.display = 'flex';
      hamburger.style.visibility = 'visible';
      hamburger.style.opacity = '1';
    }

    // 스크롤 잠금 해제
    document.body.style.overflow = '';
    document.body.classList.remove('loading');

    // 로딩 스크린 완전 제거 및 타이핑 시작
    setTimeout(() => {
      if (loadingScreen) {
        loadingScreen.style.display = 'none';
      }
      startTypingAnimation();
    }, 500);
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

 // loadPortfolio 함수 내에서 이벤트 리스너 부분을 다음과 같이 수정:

      // 모바일이 아닐 때만 호버 효과 적용
      const isMobile = window.innerWidth <= 768;
      const slides = container.querySelectorAll('.portfolio-slide');
      
      if (!isMobile) {
        slides.forEach((slide, index) => {
          // 마우스 이벤트 (데스크톱만)
          slide.addEventListener('mouseenter', () => {
            handleSlideHover(slides, index);
          });
          
          // 클릭 이벤트
          slide.addEventListener('click', () => {
            console.log(`Portfolio item ${index + 1} clicked`);
          });
        });

        // 컨테이너에서 마우스가 벗어나면 초기화
        container.addEventListener('mouseleave', () => {
          resetSlides(slides);
        });
      }

      // 개선된 확장 효과 처리 함수
      function handleSlideHover(slides, activeIndex) {
        requestAnimationFrame(() => {
          // 모든 클래스 초기화
          slides.forEach(slide => {
            slide.classList.remove('portfolio-expanded', 'portfolio-shrunk');
          });
          
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
        });
      }

      // 슬라이드 초기화 함수
      function resetSlides(slides) {
        requestAnimationFrame(() => {
          slides.forEach(slide => {
            slide.classList.remove('portfolio-expanded', 'portfolio-shrunk');
          });
        });
      }
      
      // 컨테이너에서 마우스가 벗어나면 초기화
      container.addEventListener('mouseleave', () => {
        resetSlides(slides);
      });

      // 확장 효과 처리 함수 - 안정적인 애니메이션
      function handleSlideHover(slides, activeIndex) {
        // 기존 클래스 제거를 위한 타이머 제거로 더 안정적으로
        requestAnimationFrame(() => {
          slides.forEach((slide, index) => {
            slide.classList.remove('portfolio-expanded', 'portfolio-shrunk');
          });
          
          // 다음 프레임에서 새 클래스 적용
          requestAnimationFrame(() => {
            // 활성화된 슬라이드 확장
            slides[activeIndex].classList.add('portfolio-expanded');
            
            // 각 카드별 축소 패턴 - 부드럽게 적용
            if (activeIndex === 0) {
              // 1번 호버: 2,3,4번 축소
              slides[1]?.classList.add('portfolio-shrunk');
              slides[2]?.classList.add('portfolio-shrunk');
              slides[3]?.classList.add('portfolio-shrunk');
            } else if (activeIndex === 1) {
              // 2번 호버: 3,4번 축소
              slides[2]?.classList.add('portfolio-shrunk');
              slides[3]?.classList.add('portfolio-shrunk');
            } else if (activeIndex === 2) {
              // 3번 호버: 1,2번 축소
              slides[0]?.classList.add('portfolio-shrunk');
              slides[1]?.classList.add('portfolio-shrunk');
            } else if (activeIndex === 3) {
              // 4번 호버: 1,2,3번 축소
              slides[0]?.classList.add('portfolio-shrunk');
              slides[1]?.classList.add('portfolio-shrunk');
              slides[2]?.classList.add('portfolio-shrunk');
            }
          });
        });
      }

      // 슬라이드 초기화 함수 - 더 부드럽게
      function resetSlides(slides) {
        requestAnimationFrame(() => {
          slides.forEach(slide => {
            slide.classList.remove('portfolio-expanded', 'portfolio-shrunk');
          });
        });
      }

      console.log('Portfolio with expansion animation created successfully');
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
        <div class="portfolio-placeholder">Portfolio 1</div>
        <div class="portfolio-slide-title">
          <span class="portfolio-brand-name">샘플 프로젝트 1</span>
        </div>
      </div>
      <div class="portfolio-slide">
        <div class="portfolio-placeholder">Portfolio 2</div>
        <div class="portfolio-slide-title">
          <span class="portfolio-brand-name">샘플 프로젝트 2</span>
        </div>
      </div>
      <div class="portfolio-slide">
        <div class="portfolio-placeholder">Portfolio 3</div>
        <div class="portfolio-slide-title">
          <span class="portfolio-brand-name">샘플 프로젝트 3</span>
        </div>
      </div>
      <div class="portfolio-slide">
        <div class="portfolio-placeholder">Portfolio 4</div>
        <div class="portfolio-slide-title">
          <span class="portfolio-brand-name">샘플 프로젝트 4</span>
        </div>
      </div>
    `;
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

  console.log('Main.js initialization complete');
  // ─── 무한 롤링 텍스트 설정 ───
document.addEventListener('DOMContentLoaded', () => {
  const scrollingContainer = document.querySelector('.scrolling-container');
  const scrollingText = document.querySelector('.scrolling-text');
  
  if (scrollingContainer && scrollingText) {
    // 텍스트 복제하여 끊김 없는 롤링 구현
    const clone = scrollingText.cloneNode(true);
    clone.classList.add('scrolling-text-clone');
    scrollingContainer.appendChild(clone);
    
    // 애니메이션 동기화
    const texts = scrollingContainer.querySelectorAll('.scrolling-text, .scrolling-text-clone');
    texts.forEach((text, index) => {
      text.style.animationDelay = `${index * 10}s`;
    });
  }
});
});
