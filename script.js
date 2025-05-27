document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loading-screen');
  const hamburger = document.getElementById('hamburger');
  const menuOverlay = document.getElementById('menu-overlay');

  // ✅ 로딩 후 햄버거 메뉴 표시
  setTimeout(() => {
    loader.style.opacity = 0;
    loader.style.pointerEvents = 'none';
    loader.style.transition = 'opacity 0.4s ease-out';

    hamburger.style.display = 'flex';
    hamburger.style.visibility = 'visible';
    hamburger.style.opacity = '1';

    setTimeout(() => {
      loader.style.display = 'none';
    }, 400);
  }, 2000);

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

  // ✅ 타이핑 애니메이션
  setTimeout(() => {
    const line1 = "Your brand's journey —";
    const line2 = "from insight in the Mind to impact that leaves a Mark.";
    const target1 = document.getElementById('typing-line1');
    const target2 = document.getElementById('typing-line2');
    const cursorSpan = '<span class="typing-cursor">|</span>';
    const totalDuration = 1700;
    const interval = totalDuration / (line1.length + line2.length);
    let index1 = 0, index2 = 0;

    function typeLine1() {
      if (index1 < line1.length) {
        target1.innerHTML = line1.slice(0, index1) + cursorSpan;
        index1++;
        setTimeout(typeLine1, interval);
      } else {
        target1.textContent = line1;
        target2.innerHTML = cursorSpan;
        setTimeout(typeLine2, interval);
      }
    }
    function typeLine2() {
      if (index2 < line2.length) {
        target2.innerHTML = line2.slice(0, index2) + cursorSpan;
        index2++;
        setTimeout(typeLine2, interval);
      } else {
        target2.textContent = line2;
      }
    }
    typeLine1();
  }, 2000);

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
    const records = data.records.slice(0, MAX_ITEMS);

    records.forEach((record) => {
      const fields = record.fields;
      const title = fields.Title || '제목 없음';
      const imageUrl = fields.ImageURL?.[0]?.url || null;

      const slide = document.createElement('div');
      slide.className = 'portfolio-slide';

      // ✅ 이미지가 없으면 빈 배경 박스 출력
     slide.innerHTML = `
  <div class="portfolio-image-container">
    ${imageUrl 
      ? `<img src="${imageUrl}" alt="${title}">`
      : `<div class="portfolio-placeholder"></div>`}
  </div>
  <div class="portfolio-slide-title">${title}</div>
`;

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
});
