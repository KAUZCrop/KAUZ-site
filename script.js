document.addEventListener('DOMContentLoaded', () => {
  const loadingScreen = document.getElementById('loading-screen');
  const progressFill  = document.querySelector('.progress-fill');
  const hamburger = document.getElementById('hamburger');
  const menuOverlay = document.getElementById('menu-overlay');

  function setBodyMobileClass() {
  if (window.innerWidth <= 768) {
    document.body.classList.add('mobile');
  } else {
    document.body.classList.remove('mobile');
  }
}
setBodyMobileClass();
window.addEventListener('resize', setBodyMobileClass);

  // ─── 로딩 프로그레스 바 연동 + 햄버거 표시 ───
  // 1) DOMContentLoaded 시점에 바 50% 채우기
  if (progressFill) {
    progressFill.style.width = '50%';
  }

  // 2) 모든 리소스(load) 완료 시 100% → 페이드아웃 + 햄버거 노출
  window.addEventListener('load', () => {
    // …progressFill 100% + 오버레이 페이드아웃 + 햄버거 노출…
    setTimeout(() => {
      loadingScreen.style.display = 'none';

     // — 로딩 오버레이 완전 사라진 직후 타이핑 시작
     startTypingAnimation();
    }, 500);
  });

    // CSS 전환(300ms) + 추가 대기(200ms) = 500ms 뒤에 실행
    setTimeout(() => {
      // 로딩 화면 페이드아웃
      loadingScreen.style.transition = 'opacity .5s ease';
      loadingScreen.style.opacity    = '0';

      // 햄버거 메뉴 노출
      if (hamburger) {
        hamburger.style.display    = 'flex';
        hamburger.style.visibility = 'visible';
        hamburger.style.opacity    = '1';
      }

      // 스크롤 잠금 해제 및 로딩 클래스 제거
      document.body.style.overflow      = '';
      document.body.classList.remove('loading');

      // 페이드아웃 완료 후 로딩 엘리먼트 완전 제거
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }, 500);
  });
  
  // ✅ 햄버거 메뉴 토글
  const closeMenu = () => {
    menuOverlay.classList.remove('active');
    hamburger.classList.remove('active');
  };
  const openMenu = () => {
    menuOverlay.classList.add('active');
    hamburger.classList.add('active');
  };
  hamburger.addEventListener('click', () => {
    const isActive = menuOverlay.classList.contains('active');
    isActive ? closeMenu() : openMenu();
  });
  document.querySelectorAll('.menu-content a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });

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
  // ✅ Airtable 슬라이드용 포트폴리오 로딩
  const token = 'patouGO5iPVpIxbRf.e4bdbe02fe59cbe69f201edaa32b4b63f8e05dbbfcae34173f0f40c985b811d9';
  const baseId = 'appglO0MOXGY7CITU';
  const tableName = 'Table%201';

  fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
  headers: { Authorization: `Bearer ${token}` }
})
  .then(response => response.json())
  .then(data => {
    const sliderContainer = document.getElementById('PortfolioSliderList');
    if (!sliderContainer) return;

    const MAX_ITEMS = 4;
    // ✅ 생성 시간 기준으로 오래된 순으로 정렬
    const records = data.records
      .sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime)) // 🔁 순서 반대로!
      .slice(0, MAX_ITEMS);

    records.forEach((record) => {
      const fields = record.fields;
      const title = fields.Title || '제목 없음';
      // (원래) Airtable 필드에서 URL 직접 가져오기
    const attachments = fields.ImageURL;
    const imageUrl = Array.isArray(attachments) && attachments.length > 0
      ? attachments[0].url
     : null;

      const slide = document.createElement('div');
      slide.className = 'portfolio-slide';

   slide.innerHTML = imageUrl
  ? `
    <div class="portfolio-image-container">
      <img src="${imageUrl}" alt="${title}" />
    </div>
  `
  : `
    <div class="portfolio-placeholder"></div>
    <div class="portfolio-slide-title">${title}</div>
  `;
      
  sliderContainer.appendChild(slide);

      // 포트폴리오 슬라이드 마우스 효과
const slider = document.querySelector('.portfolio-slider');
if (slider) {
  slider.addEventListener('mouseleave', () => {
    slider.classList.remove('hover-effect');
  });
}

      sliderContainer.appendChild(slide);
    });
  }) // ✅ ← 이 닫는 괄호가 누락되어 있었음
  .catch(error => {
    console.error('🚫 Airtable fetch error:', error);
  });
  
  // ✅ (에러 방지를 위한 남은 버튼 코드 — 실제 버튼 없으면 무시)
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

  // ─── fade-up 요소 스크롤 트리거 ───
const fadeEls = document.querySelectorAll('.fade-up');
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

fadeEls.forEach(el => fadeObserver.observe(el));

});
