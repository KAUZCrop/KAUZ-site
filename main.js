document.addEventListener('DOMContentLoaded', () => {
  // ─── Loading Overlay Progress & Hamburger Toggle ───
  const loadingScreen = document.getElementById('loading-screen');
  const progressFill  = document.querySelector('.progress-fill');
  const hamburger     = document.getElementById('hamburger');
  const menuOverlay   = document.getElementById('menu-overlay');

  // Body mobile class toggle
  function setBodyMobileClass() {
    if (window.innerWidth <= 768) {
      document.body.classList.add('mobile');
    } else {
      document.body.classList.remove('mobile');
    }
  }
  setBodyMobileClass();
  window.addEventListener('resize', setBodyMobileClass);

  // ─── Typing Animation Function ───
  function startTypingAnimation() {
    const line1 = "Your brand's journey —";
    const line2 = "from insight in the Mind to impact that leaves a Mark.";
    const target1 = document.getElementById('typing-line1');
    const target2 = document.getElementById('typing-line2');
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

  // Initialize loading progress to 50%
  if (progressFill) progressFill.style.width = '50%';

  // On full load: fill to 100%, fade out overlay, show hamburger, start typing
  window.addEventListener('load', () => {
    if (progressFill) progressFill.style.width = '100%';

    setTimeout(() => {
      // Fade out overlay
      loadingScreen.style.transition = 'opacity .5s ease';
      loadingScreen.style.opacity    = '0';

      // Show hamburger menu
      if (hamburger) {
        hamburger.style.display    = 'flex';
        hamburger.style.visibility = 'visible';
        hamburger.style.opacity    = '1';
      }

      // Unlock scroll & remove loading class
      document.body.style.overflow = '';
      document.body.classList.remove('loading');

      // After fade-out, remove overlay and start typing
      setTimeout(() => {
        loadingScreen.style.display = 'none';
        startTypingAnimation();
      }, 500);
    }, 500);
  });

  if (hamburger && menuOverlay) {
  hamburger.addEventListener('click', () => {
    menuOverlay.classList.toggle('active');
    hamburger.classList.toggle('active'); // 햄버거 X 애니메이션
    document.body.style.overflow = menuOverlay.classList.contains('active') ? 'hidden' : '';
  });

  // ESC키로 오버레이 닫기 + 햄버거 복귀
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOverlay.classList.contains('active')) {
      menuOverlay.classList.remove('active');
      hamburger.classList.remove('active');
      document.body.style.overflow = '';
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
    .then(response => response.json())
    .then(data => {
      // Sort by createdTime and take latest 4
      const records = data.records
        .sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime))
        .slice(0, 4);
      const sliderContainer = document.getElementById('PortfolioSliderList');

      // Optional toggle-more button logic
      const toggleBtn = document.getElementById('toggle-more');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          const hiddenCards = document.querySelectorAll('.hidden-card');
          const isExpanded = toggleBtn.innerText === 'Show Less';
          hiddenCards.forEach(card => {
            card.style.display = isExpanded ? 'none' : 'block';
          });
          toggleBtn.innerText = isExpanded ? '+ More' : 'Show Less';
        });
      }

      // Create slides
      records.forEach(record => {
        const fields      = record.fields;
        const title       = fields.Title || '제목 없음';
        const attachments = fields.ImageURL;
        const imageUrl    = Array.isArray(attachments) && attachments.length > 0
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
      });
    })
    .catch(err => console.error(err));

  // ─── Scroll-Fade Animations ───
  // fade-up elements
  const fadeEls = document.querySelectorAll('.fade-up');
  const fadeObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  fadeEls.forEach(el => fadeObserver.observe(el));

  // ─── Portfolio 이웃 카드 축소 제어 ───
const slides = document.querySelectorAll('.portfolio-slide');
slides.forEach((slide, idx) => {
  slide.addEventListener('mouseenter', () => {
    // 호버된 카드 제외 나머지 전체 축소 룰은 CSS가 이미 적용
    // 대신 “이웃 하나”만 flex-basis 줄이기 위해 강제 클래스 토글
    slides.forEach(s => s.classList.remove('neighbor-shrink'));
    let neighbor;
    if (idx === 0) neighbor = 1;      // 1호버→2
    if (idx === 1) neighbor = 2;      // 2호버→3
    if (idx === 2) neighbor = 1;      // 3호버→2
    if (idx === 3) neighbor = 2;      // 4호버→3
    if (neighbor !== undefined) {
      slides[neighbor].classList.add('neighbor-shrink');
    }
  });
  slide.addEventListener('mouseleave', () => {
    slides.forEach(s => s.classList.remove('neighbor-shrink'));
  });
});

  // Portfolio slides
  const portfolioCards = document.querySelectorAll('.portfolio-slide');
  const portfolioObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  portfolioCards.forEach(card => portfolioObserver.observe(card));

  // about-card elements
  const aboutCards = document.querySelectorAll('.about-card');
  const cardObserver = new IntersectionObserver((entries, obs2) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs2.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  aboutCards.forEach(card => cardObserver.observe(card));
});
