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
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loading-screen');
    loader.style.opacity = 0;
    setTimeout(() => loader.style.display = 'none', 500);
  }, 2000); // 2초 후 로딩 화면 제거
});
