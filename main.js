document.addEventListener('DOMContentLoaded', () => {
  // ─── 전역 변수 선언 (요소 존재 확인) ───
  const loadingScreen = document.getElementById('loading-screen');
  const progressFill  = document.querySelector('.progress-fill');
  const hamburger     = document.getElementById('hamburger');
  const menuOverlay   = document.getElementById('menu-overlay');

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

  // ─── 로딩 스크린 처리 (강화된 버전) ───
  if (progressFill) {
    progressFill.style.width = '50%';
    console.log('Loading progress initialized');
  }

  // 페이지 로드 완료 시
  window.addEventListener('load', () => {
    console.log('Page loaded, starting animations...');
    
    if (progressFill) {
      progressFill.style.width = '100%';
    }

    setTimeout(() => {
      // 로딩 스크린 페이드 아웃
      if (loadingScreen) {
        loadingScreen.style.transition = 'opacity .5s ease';
        loadingScreen.style.opacity = '0';
        console.log('Loading screen fading out...');
      }

      // 햄버거 메뉴 표시
      if (hamburger) {
        hamburger.style.display = 'flex';
        hamburger.style.visibility = 'visible';
        hamburger.style.opacity = '1';
        console.log('Hamburger menu shown');
      }

      // 스크롤 잠금 해제
      document.body.style.overflow = '';
      document.body.classList.remove('loading');

      // 로딩 스크린 완전 제거 및 타이핑 시작
      setTimeout(() => {
        if (loadingScreen) {
          loadingScreen.style.display = 'none';
          console.log('Loading screen removed');
        }
        startTypingAnimation();
      }, 500);
    }, 500);
  });

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

  // ─── Airtable Portfolio Slide Loading ───
  const token = 'patouGO5iPVpIxbRf.e4bdbe02fe59cbe69f201edaa32b4b63f8e05dbbfcae34173f0f40c985b811d9';
  const baseId = 'appglO0MOXGY7CITU';
  const tableName = 'Table%201';

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
      
      const sliderContainer = document.getElementById('PortfolioSliderList');
      
      if (!sliderContainer) {
        console.error('Portfolio slider container not found!');
        return;
      }

      // Create slides
      records.forEach((record, index) => {
        const fields = record.fields;
        const title = fields.Title || '제목 없음';
        const attachments = fields.ImageURL;
        const imageUrl = Array.isArray(attachments) && attachments.length > 0
          ? attachments[0].url
          : null;

        const slide = document.createElement('div');
        slide.className = 'portfolio-slide';
        slide.innerHTML = imageUrl
          ? `
            <div class="portfolio-image-container">
              <img src="${imageUrl}" alt="${title}" loading="lazy" />
            </div>
            <div class="portfolio-slide-title">${title}</div>
          `
          : `
            <div class="portfolio-placeholder"></div>
            <div class="portfolio-slide-title">${title}</div>
          `;
        
        sliderContainer.appendChild(slide);
        console.log(`Portfolio slide ${index + 1} created: ${title}`);
      });

      // ─── Portfolio 이웃 카드 축소 제어 ───
      const portfolioSlides = document.querySelectorAll('.portfolio-slide');
      console.log('Portfolio slides found:', portfolioSlides.length);
      
      portfolioSlides.forEach((slide, idx) => {
        slide.addEventListener('mouseenter', () => {
          portfolioSlides.forEach(s => s.classList.remove('neighbor-shrink'));
          
          let neighbor;
          if (idx === 0) neighbor = 1;
          if (idx === 1) neighbor = 2;
          if (idx === 2) neighbor = 1;
          if (idx === 3) neighbor = 2;
          
          if (neighbor !== undefined && portfolioSlides[neighbor]) {
            portfolioSlides[neighbor].classList.add('neighbor-shrink');
          }
        });
        
        slide.addEventListener('mouseleave', () => {
          portfolioSlides.forEach(s => s.classList.remove('neighbor-shrink'));
        });
      });

      // Portfolio slides intersection observer
      const portfolioObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.2 });
      
      portfolioSlides.forEach(card => portfolioObserver.observe(card));
    })
    .catch(err => {
      console.error('Airtable fetch error:', err);
    });

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
});
