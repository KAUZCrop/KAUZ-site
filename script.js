document.addEventListener("DOMContentLoaded", () => {
  const token = 'patouGO5iPVpIxbRf.e4bdbe02fe59cbe69f201edaa32b4b63f8e05dbbfcae34173f0f40c985b811d9';
  const baseId = 'appglO0MOXGY7CITU';
  const tableName = 'Table%201';
  const MAX_VISIBLE = 6;

  fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(response => response.json())
    .then(data => {
      const container = document.getElementById('PortFolio-list');
      container.innerHTML = '';

      data.records.forEach((record, index) => {
        const fields = record.fields;
        const title = fields.Title || '제목 없음';
        const description = fields.Description || '설명 없음';
        const imageUrl =
          fields.ImageURL &&
          Array.isArray(fields.ImageURL) &&
          fields.ImageURL.length > 0 &&
          fields.ImageURL[0].url
            ? fields.ImageURL[0].url
            : '';

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
          </div>
        `;

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

// 로딩 화면 제거
window.addEventListener('DOMContentLoaded', () => {
  // 2초 동안 progress bar 애니메이션
  setTimeout(() => {
    const loader = document.getElementById('loading-screen');

    // 애니메이션 트랜지션: 페이드아웃
    loader.style.opacity = 0;

    // 완전히 사라지게 만듦
    loader.style.pointerEvents = 'none';
    loader.style.transition = 'opacity 0.4s ease-out';

    setTimeout(() => {
      loader.style.display = 'none';
    }, 400); // fade-out과 동일 시간
  }, 2000); // 2초 후 실행
});

document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const menuOverlay = document.getElementById('menu-overlay');

  // ✅ 로딩 이후 햄버거 표시
  setTimeout(() => {
    hamburger.style.display = 'flex';
  }, 2000); // 로딩 끝나는 타이밍에 맞춰 조절

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
    if (isActive) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  document.querySelectorAll('.menu-content a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // ESC 키로 메뉴 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu();
    }
  });
});

// 로딩이 끝난 후 실행되는 타이핑 애니메이션
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const line1 = "Your brand's journey —";
    const line2 = "from insight in the Mind to impact that leaves a Mark.";
    const target1 = document.getElementById('typing-line1');
    const target2 = document.getElementById('typing-line2');

    const fullText = line1 + line2;
    const totalDuration = 2000;
    const interval = totalDuration / fullText.length;

    let index1 = 0;
    let index2 = 0;

    function typeLine1() {
      if (index1 < line1.length) {
        target1.innerHTML = line1.slice(0, index1) + '<span class="typing-cursor">|</span>';
        index1++;
        setTimeout(typeLine1, interval);
      } else {
        setTimeout(typeLine2, interval);
      }
    }

    function typeLine2() {
      if (index2 < line2.length) {
        target2.innerHTML = line2.slice(0, index2) + '<span class="typing-cursor">|</span>';
        index2++;
        setTimeout(typeLine2, interval);
      } else {
        // 최종 완성 시 커서 제거
        target2.innerHTML = line2;
      }
    }

    typeLine1();
  }, 2000); // 로딩 끝난 뒤 시작
});

