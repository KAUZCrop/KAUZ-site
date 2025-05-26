document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loading-screen');
  const hamburger = document.getElementById('hamburger');
  const menuOverlay = document.getElementById('menu-overlay');

  // ✅ 로딩 종료 처리 및 햄버거 표시
  setTimeout(() => {
    loader.style.opacity = 0;
    loader.style.pointerEvents = 'none';
    loader.style.transition = 'opacity 0.4s ease-out';

   setTimeout(() => {
  loader.style.opacity = 0;
  loader.style.pointerEvents = 'none';
  loader.style.transition = 'opacity 0.4s ease-out';

  // ✅ 햄버거 메뉴를 opacity가 줄어드는 동시에 보여주기
  hamburger.style.display = 'flex';
  hamburger.style.visibility = 'visible';
  hamburger.style.opacity = '1';

  // ✅ loader 제거만 약간 늦게 처리
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
    if (isActive) closeMenu();
    else openMenu();
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

  // ✅ 포트폴리오 Airtable 불러오기
  const token = 'patouGO5iPVpIxbRf.e4bdbe02fe59cbe69f201edaa32b4b63f8e05dbbfcae34173f0f40c985b811d9';
  const baseId = 'appglO0MOXGY7CITU';
  const tableName = 'Table%201';
  const MAX_VISIBLE = 6;

  fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(response => response.json())
    .then(data => {
      const container = document.getElementById('PortFolio-list');
      container.innerHTML = '';
      data.records.forEach((record, index) => {
        const fields = record.fields;
        const title = fields.Title || '제목 없음';
        const description = fields.Description || '설명 없음';
        const imageUrl = fields.ImageURL?.[0]?.url || '';
        const item = document.createElement('div');
        item.className = 'PortFolio-card';
        if (index >= MAX_VISIBLE) item.classList.add('hidden-card');
        item.innerHTML = `
          <div class="card-image" style="background-image: url('${imageUrl}')">
            <div class="card-overlay">
              <div class="card-text">
                <h3>${title}</h3>
                <p>${description}</p>
              </div>
            </div>
          </div>`;
        container.appendChild(item);
      });

      const toggleBtn = document.getElementById('toggle-more');
      toggleBtn.addEventListener('click', () => {
        const hiddenCards = document.querySelectorAll('.hidden-card');
        const isExpanded = toggleBtn.innerText === 'Show Less';
        hiddenCards.forEach(card => {
          card.style.display = isExpanded ? 'none' : 'block';
        });
        toggleBtn.innerText = isExpanded ? '+ More' : 'Show Less';
      });
    })
    .catch(error => {
      document.getElementById('PortFolio-list').innerHTML =
        '<p style="color:red;">🚫 데이터를 불러오지 못했습니다.</p>';
      console.error('Airtable fetch error:', error);
    });
});
