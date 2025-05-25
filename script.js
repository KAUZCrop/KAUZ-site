console.log("MIND·MARK site loaded.");

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
    const container = document.getElementById('reference-list');
    data.records.forEach(record => {
      const fields = record.fields;
      const title = fields.Title || '제목 없음';
      const description = fields.Description || '설명 없음';
      const url = fields.URL || '#';

      // 이미지 URL
      let imageUrl = '';
      if (fields.ImageURL) {
        imageUrl = fields.ImageURL;
      } else if (fields.Attachments && fields.Attachments.length > 0) {
        imageUrl = fields.Attachments[0].url;
      }

      // 카드 생성
      const card = document.createElement('div');
      card.className = 'reference-card';
      card.innerHTML = `
        <div class="card-image" style="background-image: url('${imageUrl}')">
          <div class="card-overlay">
            <div class="card-text">
              <h3>${title}</h3>
              <p>${description}</p>
              <a href="${url}" target="_blank" class="view-link">VIEW CASE →</a>
            </div>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  })
  .catch(error => {
    document.getElementById('reference-list').innerHTML =
      '<p style="color:red;">🚫 데이터를 불러오지 못했습니다.</p>';
    console.error('Airtable fetch error:', error);
  });
