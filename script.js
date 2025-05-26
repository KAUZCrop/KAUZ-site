document.addEventListener("DOMContentLoaded", () => {
  const token = 'patouGO5iPVpIxbRf.e4bdbe02fe59cbe69f201edaa32b4b63f8e05dbbfcae34173f0f40c985b811d9';
  const baseId = 'appglO0MOXGY7CITU';
  const tableName = 'Table%201';

  fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(response => response.json())
    .then(data => {
      const container = document.getElementById('PortFolio-list');
      container.innerHTML = '';

      data.records.forEach(record => {
        const fields = record.fields;
        const title = fields.Title || '제목 없음';
        const description = fields.Description || '설명 없음';
        const url = fields.URL || '#';

        // 이미지 URL 추출
        const imageUrl =
          fields.ImageURL && Array.isArray(fields.ImageURL) && fields.ImageURL.length > 0
            ? fields.ImageURL[0].url
            : '';

        const item = document.createElement('div');
        item.className = 'PortFolio-card'; // class명 CSS와 일치

        item.innerHTML = `
          <div class="card-image" style="background-image: url('${imageUrl}')">
            <div class="card-overlay">
              <div class="card-text">
                <h3>${title}</h3>
                <p>${description}</p>
                <a href="${url}" class="view-link" target="_blank">VIEW CASE</a>
              </div>
            </div>
          </div>
        `;

        container.appendChild(item);
      });
    })
    .catch(error => {
      const container = document.getElementById('PortFolio-list');
      container.innerHTML = '<p style="color:red;">🚫 데이터를 불러오지 못했습니다.</p>';
      console.error('Airtable fetch error:', error);
    });
});
