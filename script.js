// Airtable에서 포트폴리오 데이터를 가져와서 동적으로 추가
const token = 'YOUR_AIRTABLE_API_TOKEN';
const baseId = 'YOUR_BASE_ID';
const tableName = 'Portfolio';

fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('portfolio-list');
    data.records.forEach(record => {
      const fields = record.fields;
      const title = fields.Title || '제목 없음';
      const description = fields.Description || '설명 없음';
      const imageUrl = fields.ImageURL || 'default-image.jpg';

      const item = document.createElement('div');
      item.className = 'portfolio-item';
      item.innerHTML = `
        <img src="${imageUrl}" alt="${title}">
        <div class="content">
          <h3>${title}</h3>
          <p>${description}</p>
        </div>
      `;
      container.appendChild(item);
    });
  })
  .catch(error => {
    console.error('Airtable fetch error:', error);
  });
