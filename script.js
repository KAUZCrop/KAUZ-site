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
  container.innerHTML = '';

  data.records.forEach(record => {
    const fields = record.fields;
    const title = fields.Title || '제목 없음';
    const description = fields.Description || '설명 없음';

    // 이미지 URL 추출
    let imageUrl = '';
    if (fields.ImageURL && fields.ImageURL.length > 0) {
      imageUrl = fields.ImageURL[0].url;
    }

    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
      ${imageUrl ? `<img src="${imageUrl}" alt="${title}" class="reference-img">` : ''}
      <h3>${title}</h3>
      <p>${description}</p>
    `;
    container.appendChild(div);
  });
})
.catch(error => {
  document.getElementById('reference-list').innerHTML =
    '<p style="color:red;">🚫 데이터를 불러오지 못했습니다.</p>';
  console.error('Airtable fetch error:', error);
});

