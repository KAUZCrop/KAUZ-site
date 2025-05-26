<script>
  document.addEventListener("DOMContentLoaded", () => {
    const token = 'patouGO5iPVpIxbRf.e4bdbe02fe59cbe69f201edaa32b4b63f8e05dbbfcae34173f0f40c985b811d9';
    const baseId = 'appglO0MOXGY7CITU';
    const tableName = 'Table%201';
    const container = document.getElementById('PortFolio-list');

    fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(response => {
      if (!response.ok) throw new Error("데이터 요청 실패");
      return response.json();
    })
    .then(data => {
      container.innerHTML = '';
      data.records.forEach(record => {
        const fields = record.fields;
        const title = fields.Title ?? '제목 없음';
        const description = fields.Description ?? '설명 없음';
        const url = fields.URL ?? '#';
        const imageUrl = fields.ImageURL ?? '';

        const item = document.createElement('div');
        item.className = 'PortFolio-card';
        item.innerHTML = `
          <div class="card-image" style="background-image: url('${imageUrl}')">
            <div class="card-overlay">
              <div class="card-text">
                <h3>${title}</h3>
                <p>${description}</p>
                <a href="${url}" class="view-link" target="_blank" rel="noopener noreferrer">VIEW CASE</a>
              </div>
            </div>
          </div>
        `;
        container.appendChild(item);
      });
    })
    .catch(error => {
      container.innerHTML = '<p style="color:red;">🚫 데이터를 불러오지 못했습니다.</p>';
      console.error('[Airtable fetch error]', error);
    });
  });
</script>
