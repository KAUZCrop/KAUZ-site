// ═══════════════════════════════════════════════════════════════
// KAUZ Admin UI Module v4.2.1-FIXED
// 🎨 UI 관리, 모달, 알림, 이벤트 처리
// ═══════════════════════════════════════════════════════════════

// 모듈 의존성 체크 (수정된 버전)
if (!window.KAUZ_ADMIN) {
  throw new Error('❌ admin-core.js가 먼저 로드되어야 합니다.');
}

// ═══════════════════════════════════════════════════════════════
// 🎨 UI 헬퍼 함수들
// ═══════════════════════════════════════════════════════════════

window.KAUZ_ADMIN.showNotification = function(message, type = 'success') {
  const notification = this.ELEMENTS.notification;
  const textElement = document.getElementById('notification-text');
  const timeElement = document.getElementById('notification-time');
  const iconElement = notification?.querySelector('.notification-icon');
  
  if (notification && textElement) {
    textElement.textContent = message;
    
    if (timeElement) {
      timeElement.textContent = new Date().toLocaleTimeString('ko-KR');
    }
    
    if (iconElement) {
      const icons = {
        'success': '✅',
        'error': '❌',
        'warning': '⚠️',
        'info': 'ℹ️'
      };
      iconElement.textContent = icons[type] || '📢';
    }
    
    notification.className = `notification enhanced ${type} show`;
    
    setTimeout(() => {
      notification.classList.remove('show');
    }, 5000);
  }
};

window.KAUZ_ADMIN.showError = function(message) {
  if (this.ELEMENTS.loginError) {
    this.ELEMENTS.loginError.textContent = message;
    this.ELEMENTS.loginError.style.display = 'block';
    
    setTimeout(() => {
      this.ELEMENTS.loginError.style.display = 'none';
    }, 5000);
  }
};

window.KAUZ_ADMIN.showLoadingOverlay = function(message = '처리 중...') {
  const overlay = this.ELEMENTS.loadingOverlay;
  const textElement = overlay?.querySelector('.loading-text');
  
  if (overlay) {
    if (textElement) {
      textElement.textContent = message;
    }
    overlay.classList.add('show');
  }
};

window.KAUZ_ADMIN.hideLoadingOverlay = function() {
  const overlay = this.ELEMENTS.loadingOverlay;
  if (overlay) {
    overlay.classList.remove('show');
  }
};

window.KAUZ_ADMIN.updateSystemStatus = function(status) {
  const indicator = document.getElementById('system-status');
  if (indicator) {
    const statusMap = {
      'online': '🟢',
      'offline': '🔴',
      'warning': '🟡'
    };
    indicator.textContent = statusMap[status] || '🟡';
  }
};

window.KAUZ_ADMIN.updateApiStatus = function(status) {
  const element = document.getElementById('api-status');
  if (element) {
    const statusMap = {
      'online': '🟢 연결됨',
      'offline': '🔴 연결 끊김',
      'error': '🟡 오류'
    };
    element.textContent = statusMap[status] || '🔄 확인 중...';
  }
};

// ═══════════════════════════════════════════════════════════════
// 🎪 화면 전환 함수들
// ═══════════════════════════════════════════════════════════════

window.KAUZ_ADMIN.showLoginScreen = function() {
  if (this.ELEMENTS.loginScreen) this.ELEMENTS.loginScreen.style.display = 'flex';
  if (this.ELEMENTS.adminDashboard) this.ELEMENTS.adminDashboard.style.display = 'none';
  
  const passwordInput = document.getElementById('admin-password');
  if (passwordInput) passwordInput.focus();
  
  this.updateSystemStatus('offline');
};

window.KAUZ_ADMIN.showDashboard = async function() {
  if (!this.STATE.isInitialized) {
    const initSuccess = await this.initializeTokens();
    if (!initSuccess) {
      this.showError('시스템 초기화에 실패했습니다.');
      return;
    }
  }
  
  if (this.ELEMENTS.loginScreen) this.ELEMENTS.loginScreen.style.display = 'none';
  if (this.ELEMENTS.adminDashboard) this.ELEMENTS.adminDashboard.style.display = 'grid';
  
  // 관리자 초기화를 먼저 실행
  await this.initializeManagers();
  
  // 그 다음 대시보드 초기화
  await this.initializeDashboard();
  
  this.updateSystemStatus('online');
};

window.KAUZ_ADMIN.switchSection = function(sectionName) {
  this.ELEMENTS.menuItems.forEach(item => {
    item.classList.remove('active');
    if (item.dataset.section === sectionName) {
      item.classList.add('active');
    }
  });

  this.ELEMENTS.sections.forEach(section => {
    section.classList.remove('active');
    if (section.id === `section-${sectionName}`) {
      section.classList.add('active');
    }
  });

  this.STATE.currentSection = sectionName;

  switch (sectionName) {
    case 'portfolio':
      this.loadPortfolioSection();
      break;
    case 'contacts':
      this.loadContactsSection();
      break;
    case 'analytics':
      this.loadAnalyticsSection();
      break;
    case 'visitor-tracking':
      this.loadVisitorTrackingSection();
      break;
  }
};

// ═══════════════════════════════════════════════════════════════
// 📂 섹션별 로드 함수들
// ═══════════════════════════════════════════════════════════════

window.KAUZ_ADMIN.loadPortfolioSection = async function() {
  const tabButtons = document.querySelectorAll('.tab-btn[data-tab]');
  tabButtons.forEach(btn => {
    btn.removeEventListener('click', this.tabClickHandler);
    btn.addEventListener('click', this.tabClickHandler);
  });

  await this.renderPortfolioTab(this.STATE.currentPortfolioTab);
};

window.KAUZ_ADMIN.tabClickHandler = function(e) {
  const tab = e.target.dataset.tab;
  if (tab) {
    window.KAUZ_ADMIN.switchPortfolioTab(tab);
  }
};

window.KAUZ_ADMIN.switchPortfolioTab = function(tab) {
  this.STATE.currentPortfolioTab = tab;

  document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.tab === tab) {
      btn.classList.add('active');
    }
  });

  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
    if (content.id === `${tab}-portfolio-tab`) {
      content.classList.add('active');
    }
  });

  this.renderPortfolioTab(tab);
};

window.KAUZ_ADMIN.renderPortfolioTab = async function(tab) {
  const data = this.DATA.portfolio[tab] || [];
  const containerId = `${tab}-portfolio-grid`;
  const container = document.getElementById(containerId);
  
  if (!container) return;

  if (data.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>${tab === 'main' ? '메인페이지' : '포트폴리오 페이지'} 데이터가 없습니다</h3>
        <p>새로운 포트폴리오를 추가해주세요.</p>
        <button class="primary-btn portfolio-add-btn" data-tab="${tab}">
          <span class="btn-icon">➕</span>
          포트폴리오 추가
        </button>
      </div>
    `;
    
    const addBtn = container.querySelector('.portfolio-add-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.showAddPortfolioModal(tab);
      });
    }
    
    return;
  }

  const fragment = document.createDocumentFragment();
  const limitedData = data.slice(0, 30);
  
  limitedData.forEach(record => {
    const portfolioElement = document.createElement('div');
    portfolioElement.className = 'portfolio-item';
    portfolioElement.dataset.id = record.id;
    
    const fields = record.fields;
    const title = fields.Title || '제목 없음';
    const category = fields.Category || 'Portfolio';
    const client = fields.Client || '';
    
    const imageField = fields.ImageURL || fields.Image;
    const hasImage = imageField && imageField.length > 0;
    
    portfolioElement.innerHTML = `
      <div class="portfolio-image">
        ${hasImage 
          ? `<img src="${imageField[0].url}" alt="${title}" loading="lazy" />` 
          : '<div class="image-placeholder">No Image</div>'
        }
      </div>
      <div class="portfolio-info">
        <div class="portfolio-title">${title}</div>
        <div class="portfolio-category">${category}</div>
        ${client ? `<div class="portfolio-client">${client}</div>` : ''}
        <div class="portfolio-description">${(fields.Description || '').substring(0, 100)}</div>
      </div>
      <div class="portfolio-actions">
        <button class="btn edit-btn" data-record-id="${record.id}" data-tab="${tab}">
          <span class="btn-icon">✏️</span>
          수정
        </button>
        <button class="btn delete-btn" data-record-id="${record.id}" data-tab="${tab}">
          <span class="btn-icon">🗑️</span>
          삭제
        </button>
      </div>
      ${fields.Priority === 'featured' ? '<div class="portfolio-status featured">추천</div>' : ''}
    `;
    
    const editBtn = portfolioElement.querySelector('.edit-btn');
    const deleteBtn = portfolioElement.querySelector('.delete-btn');
    
    editBtn.addEventListener('click', () => {
      this.editPortfolioItem(record.id, tab);
    });
    
    deleteBtn.addEventListener('click', () => {
      this.confirmDeletePortfolio(record.id, tab);
    });
    
    fragment.appendChild(portfolioElement);
  });

  container.innerHTML = '';
  container.appendChild(fragment);

  this.updatePortfolioStats(tab, data);
};

window.KAUZ_ADMIN.updatePortfolioStats = function(tab, data) {
  const totalElement = document.getElementById(`${tab}-total`);
  const featuredElement = document.getElementById(`${tab}-featured`);
  
  if (totalElement) {
    totalElement.textContent = data.length;
  }
  
  if (featuredElement) {
    const featuredCount = data.filter(item => item.fields.Priority === 'featured').length;
    featuredElement.textContent = featuredCount;
  }

  if (tab === 'work') {
    const categoriesElement = document.getElementById('work-categories');
    const clientsElement = document.getElementById('work-clients');
    
    if (categoriesElement) {
      const categories = new Set(data.map(item => item.fields.Category).filter(Boolean));
      categoriesElement.textContent = categories.size;
    }
    
    if (clientsElement) {
      const clients = new Set(data.map(item => item.fields.Client).filter(Boolean));
      clientsElement.textContent = clients.size;
    }
  }
};

window.KAUZ_ADMIN.loadContactsSection = async function() {
  this.renderContactsTable(this.DATA.contacts);
  this.updateContactStats();
};

window.KAUZ_ADMIN.renderContactsTable = function(data, filter = 'all') {
  const container = document.getElementById('contacts-table');
  if (!container) return;

  let filteredData = data;
  if (filter !== 'all') {
    filteredData = data.filter(record => {
      const status = record.fields.Status || 'new';
      return status === filter;
    });
  }

  if (filteredData.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>문의가 없습니다</h3>
        <p>새로운 문의가 들어오면 여기에 표시됩니다.</p>
      </div>
    `;
    return;
  }

  const tableFragment = document.createDocumentFragment();
  const table = document.createElement('div');
  table.className = 'data-table';
  
  const tableElement = document.createElement('table');
  tableElement.innerHTML = `
    <thead>
      <tr>
        <th>날짜</th>
        <th>이름</th>
        <th>이메일</th>
        <th>제목</th>
        <th>상태</th>
        <th>작업</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  
  const tbody = tableElement.querySelector('tbody');
  
  filteredData.slice(0, 30).forEach(record => {
    const fields = record.fields;
    const date = new Date(record.createdTime).toLocaleDateString('ko-KR');
    const name = fields.Name || '이름 없음';
    const email = fields.Email || '이메일 없음';
    const subject = fields.Subject || '제목 없음';
    const status = fields.Status || 'new';
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${date}</td>
      <td>${name}</td>
      <td>${email}</td>
      <td>${subject}</td>
      <td>
        <select data-record-id="${record.id}">
          <option value="new" ${status === 'new' ? 'selected' : ''}>신규</option>
          <option value="replied" ${status === 'replied' ? 'selected' : ''}>답변완료</option>
          <option value="important" ${status === 'important' ? 'selected' : ''}>중요</option>
          <option value="archived" ${status === 'archived' ? 'selected' : ''}>보관됨</option>
        </select>
      </td>
      <td>
        <div class="actions">
          <button class="btn btn-sm btn-view" data-record-id="${record.id}">
            👁️ 보기
          </button>
          <button class="btn btn-sm btn-reply" data-email="${fields.Email}">
            📧 답변
          </button>
        </div>
      </td>
    `;
    
    const select = row.querySelector('select');
    const viewBtn = row.querySelector('.btn-view');
    const replyBtn = row.querySelector('.btn-reply');
    
    select.addEventListener('change', (e) => {
      this.updateContactStatusAction(record.id, e.target.value);
    });
    
    viewBtn.addEventListener('click', () => {
      this.viewContact(record.id);
    });
    
    replyBtn.addEventListener('click', () => {
      this.replyContact(fields.Email);
    });
    
    tbody.appendChild(row);
  });

  table.appendChild(tableElement);
  tableFragment.appendChild(table);
  
  container.innerHTML = '';
  container.appendChild(tableFragment);
};

window.KAUZ_ADMIN.updateContactStats = function() {
  const newContacts = this.DATA.contacts.filter(c => c.fields.Status === 'new' || !c.fields.Status).length;
  const pendingContacts = this.DATA.contacts.filter(c => c.fields.Status === 'pending').length;
  const repliedContacts = this.DATA.contacts.filter(c => c.fields.Status === 'replied').length;

  const elements = {
    'new-contacts': newContacts,
    'pending-contacts': pendingContacts,
    'replied-contacts': repliedContacts
  };

  Object.entries(elements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  });
};

window.KAUZ_ADMIN.loadAnalyticsSection = async function() {
  this.updateAnalyticsKPI();
  
  // 안전한 차트 관리자 접근
  if (this.managers?.chartManager && this.managers.chartManager.isGoogleChartsLoaded) {
    const visitorData = this.processVisitorTrendData();
    const behaviorData = this.processUserBehaviorData();
    
    this.managers.chartManager.createAnalyticsChart('main-analytics-chart', 'line', visitorData);
    this.managers.chartManager.createAnalyticsChart('pages-performance-chart', 'bar', behaviorData);
    this.managers.chartManager.createAnalyticsChart('hourly-visits-chart', 'line', this.processHourlyData());
    this.managers.chartManager.createAnalyticsChart('device-chart', 'pie', this.processDeviceData());
    
    console.log('📊 분석 페이지 차트 생성 완료');
  }
};

window.KAUZ_ADMIN.updateAnalyticsKPI = function() {
  const stats = this.calculateAnalyticsStats();
  
  const elements = {
    'total-visitors': stats.totalVisitors,
    'total-pageviews': stats.totalPageviews,
    'avg-session-duration': `${Math.floor(stats.avgDuration / 60)}:${String(stats.avgDuration % 60).padStart(2, '0')}`,
    'bounce-rate': `${stats.bounceRate}%`
  };

  Object.entries(elements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  });

  const changes = {
    'visitors-change': '+12.5%',
    'pageviews-change': '+8.3%',
    'session-change': '+0.8%',
    'bounce-change': '-5.2%'
  };

  Object.entries(changes).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
      element.className = `kpi-change ${value.startsWith('+') ? 'positive' : value.startsWith('-') ? 'negative' : 'neutral'}`;
    }
  });
};

window.KAUZ_ADMIN.loadVisitorTrackingSection = async function() {
  console.log('👥 방문자 추적 섹션 로드됨');
};

// ═══════════════════════════════════════════════════════════════
// 🎪 모달 관리 함수들
// ═══════════════════════════════════════════════════════════════

window.KAUZ_ADMIN.showAddPortfolioModal = function(tableType = 'main') {
  const modal = this.ELEMENTS.portfolioModal;
  if (!modal) return;

  const modalTitle = document.getElementById('modal-title');
  if (modalTitle) {
    modalTitle.textContent = `🖼️ 포트폴리오 추가 (${tableType === 'main' ? '메인페이지' : '포트폴리오 페이지'})`;
  }

  const form = document.getElementById('portfolio-form');
  if (form) {
    form.reset();
    form.dataset.tableType = tableType;
    form.dataset.mode = 'add';
  }

  modal.classList.add('active');
  console.log(`📝 포트폴리오 추가 모달 열림: ${tableType}`);
};

window.KAUZ_ADMIN.editPortfolioItem = function(recordId, tableType) {
  const modal = this.ELEMENTS.portfolioModal;
  if (!modal) return;

  const data = this.DATA.portfolio[tableType];
  const record = data.find(item => item.id === recordId);
  
  if (!record) return;

  const modalTitle = document.getElementById('modal-title');
  if (modalTitle) {
    modalTitle.textContent = `🖼️ 포트폴리오 수정 (${tableType === 'main' ? '메인페이지' : '포트폴리오 페이지'})`;
  }

  const form = document.getElementById('portfolio-form');
  if (form) {
    form.dataset.tableType = tableType;
    form.dataset.mode = 'edit';
    form.dataset.recordId = recordId;

    const titleField = document.getElementById('portfolio-title');
    const clientField = document.getElementById('portfolio-client');
    const categoryField = document.getElementById('portfolio-category');
    const priorityField = document.getElementById('portfolio-priority');
    const descriptionField = document.getElementById('portfolio-description');

    if (titleField) titleField.value = record.fields.Title || '';
    if (clientField) clientField.value = record.fields.Client || '';
    if (categoryField) categoryField.value = record.fields.Category || '';
    if (priorityField) priorityField.value = record.fields.Priority || 'normal';
    if (descriptionField) descriptionField.value = record.fields.Description || '';
  }

  modal.classList.add('active');
  console.log(`📝 포트폴리오 수정 모달 열림: ${recordId}`);
};

window.KAUZ_ADMIN.confirmDeletePortfolio = function(recordId, tableType) {
  if (confirm('정말로 이 포트폴리오를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.')) {
    this.deletePortfolioItemAction(recordId, tableType);
  }
};

window.KAUZ_ADMIN.deletePortfolioItemAction = async function(recordId, tableType) {
  const tableName = tableType === 'main' 
    ? this.CONFIG.mainTableName 
    : this.CONFIG.workTableName;

  const success = await this.deletePortfolioItem(tableName, recordId);
  
  if (success) {
    this.DATA.portfolio[tableType] = this.DATA.portfolio[tableType].filter(item => item.id !== recordId);
    this.renderPortfolioTab(tableType);
    this.updateDashboardStats();
  }
};

window.KAUZ_ADMIN.viewContact = function(recordId) {
  const contact = this.DATA.contacts.find(item => item.id === recordId);
  if (!contact) return;

  const modal = this.ELEMENTS.contactModal;
  const detailsContainer = document.getElementById('contact-details');
  
  if (!modal || !detailsContainer) return;

  const fields = contact.fields;
  detailsContainer.innerHTML = `
    <div class="contact-detail-header">
      <h3>${fields.Subject || '제목 없음'}</h3>
      <span class="contact-status ${fields.Status || 'new'}">${this.getStatusText(fields.Status)}</span>
    </div>
    
    <div class="contact-info-grid">
      <div class="contact-info-item">
        <label>이름:</label>
        <span>${fields.Name || '이름 없음'}</span>
      </div>
      <div class="contact-info-item">
        <label>이메일:</label>
        <span>${fields.Email || '이메일 없음'}</span>
      </div>
      <div class="contact-info-item">
        <label>접수일:</label>
        <span>${new Date(contact.createdTime).toLocaleString('ko-KR')}</span>
      </div>
    </div>
    
    <div class="contact-message">
      <label>문의 내용:</label>
      <div class="message-content">${fields.Message || '내용 없음'}</div>
    </div>
  `;

  modal.classList.add('active');
};

window.KAUZ_ADMIN.getStatusText = function(status) {
  const statusMap = {
    'new': '신규',
    'replied': '답변완료',
    'important': '중요',
    'archived': '보관됨'
  };
  return statusMap[status] || '신규';
};

window.KAUZ_ADMIN.replyContact = function(email) {
  if (email && email !== '이메일 없음') {
    const subject = encodeURIComponent('[KAUZ] 문의 답변');
    const body = encodeURIComponent(`안녕하세요,\n\nKAUZ에 문의해 주셔서 감사합니다.\n\n\n\n감사합니다.\nKAUZ 팀`);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
  } else {
    this.showNotification('이메일 주소가 없습니다.', 'error');
  }
};

window.KAUZ_ADMIN.updateContactStatusAction = async function(recordId, status) {
  const success = await this.updateContactStatus(recordId, status);
  if (success) {
    const contact = this.DATA.contacts.find(item => item.id === recordId);
    if (contact) {
      contact.fields.Status = status;
      this.updateContactStats();
    }
  }
};

// ═══════════════════════════════════════════════════════════════
// 🎯 이벤트 리스너 설정
// ═══════════════════════════════════════════════════════════════

window.KAUZ_ADMIN.setupEventListeners = function() {
  // 로그인 폼
  if (this.ELEMENTS.loginForm) {
    this.ELEMENTS.loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const passwordInput = document.getElementById('admin-password');
      if (passwordInput) {
        try {
          this.showLoadingOverlay('로그인 처리 중...');
          const result = await this.login(passwordInput.value);
          this.hideLoadingOverlay();
          this.showNotification(result.message, 'success');
          await this.showDashboard();
        } catch (error) {
          this.hideLoadingOverlay();
          this.showError(error.message);
        }
        passwordInput.value = '';
      }
    });
  }

  // 로그아웃 버튼
  if (this.ELEMENTS.logoutBtn) {
    this.ELEMENTS.logoutBtn.addEventListener('click', () => {
      if (confirm('로그아웃하시겠습니까?')) {
        const message = this.logout();
        this.showNotification(message, 'info');
        this.showLoginScreen();
      }
    });
  }

  // 메뉴 아이템들
  this.ELEMENTS.menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const section = item.dataset.section;
      if (section) {
        this.switchSection(section);
      }
    });
  });

  // 포트폴리오 헤더 버튼들
  document.addEventListener('click', (e) => {
    if (e.target.id === 'add-main-portfolio-btn' || e.target.id === 'add-main-portfolio-btn-2') {
      this.showAddPortfolioModal('main');
    }
    if (e.target.id === 'add-work-portfolio-btn' || e.target.id === 'add-work-portfolio-btn-2') {
      this.showAddPortfolioModal('work');
    }
  });

  // 포트폴리오 폼 제출
  const portfolioForm = document.getElementById('portfolio-form');
  if (portfolioForm) {
    portfolioForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const tableType = portfolioForm.dataset.tableType;
      const mode = portfolioForm.dataset.mode;
      const recordId = portfolioForm.dataset.recordId;

      const formData = {
        Title: document.getElementById('portfolio-title')?.value || '',
        Client: document.getElementById('portfolio-client')?.value || '',
        Category: document.getElementById('portfolio-category')?.value || '',
        Priority: document.getElementById('portfolio-priority')?.value || 'normal',
        Description: document.getElementById('portfolio-description')?.value || ''
      };

      const tableName = tableType === 'main' 
        ? this.CONFIG.mainTableName 
        : this.CONFIG.workTableName;

      let result;
      if (mode === 'add') {
        result = await this.createPortfolioItem(tableName, formData);
        if (result) {
          this.DATA.portfolio[tableType].push(result);
          // 안전한 데이터 제한 적용
          if (this.managers?.dataLimiter) {
            this.DATA.portfolio[tableType] = this.managers.dataLimiter.enforceLimit(
              this.DATA.portfolio[tableType], 
              'portfolio'
            );
          }
        }
      } else if (mode === 'edit') {
        result = await this.updatePortfolioItem(tableName, recordId, formData);
        if (result) {
          const index = this.DATA.portfolio[tableType].findIndex(item => item.id === recordId);
          if (index !== -1) {
            this.DATA.portfolio[tableType][index] = result;
          }
        }
      }

      if (result) {
        this.ELEMENTS.portfolioModal.classList.remove('active');
        this.renderPortfolioTab(tableType);
        this.updateDashboardStats();
        this.showNotification(`포트폴리오가 ${mode === 'add' ? '추가' : '수정'}되었습니다.`, 'success');
      }
    });
  }

  // 모달 닫기
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-close') || e.target.classList.contains('cancel-btn')) {
      const modal = e.target.closest('.modal');
      if (modal) {
        modal.classList.remove('active');
      }
    }
    
    if (e.target.classList.contains('modal')) {
      e.target.classList.remove('active');
    }
  });

  // ESC 키로 모달 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal.active');
      if (activeModal) {
        activeModal.classList.remove('active');
      }
    }
  });

  // 필터 버튼들
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
      const filter = e.target.dataset.filter;
      const group = e.target.parentNode;
      
      group.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      
      if (this.STATE.currentSection === 'contacts') {
        this.renderContactsTable(this.DATA.contacts, filter);
      }
    }
  });

  // 대시보드 새로고침
  const refreshDashboardBtn = document.getElementById('refresh-dashboard');
  if (refreshDashboardBtn) {
    refreshDashboardBtn.addEventListener('click', async () => {
      await this.initializeDashboard();
      this.showNotification('대시보드가 새로고침되었습니다.', 'success');
    });
  }

  // 알림 닫기
  const notificationClose = document.getElementById('notification-close');
  if (notificationClose) {
    notificationClose.addEventListener('click', () => {
      this.ELEMENTS.notification.classList.remove('show');
    });
  }

  console.log('🎯 모든 이벤트 리스너 설정 완료');
};

// ═══════════════════════════════════════════════════════════════
// 🚀 관리자 인스턴스 초기화 (수정된 버전)
// ═══════════════════════════════════════════════════════════════

window.KAUZ_ADMIN.initializeManagers = async function() {
  try {
    console.log('🔧 관리자 클래스 초기화 중...');
    
    // managers 객체가 없으면 생성
    if (!this.managers) {
      this.managers = {
        performanceManager: null,
        dataLimiter: null,
        visitorCountManager: null,
        chartManager: null,
        formspreeManager: null,
        realtimeTracker: null,
        visitorLimitMonitor: null
      };
    }
    
    // 관리자 클래스들 순차적으로 초기화
    this.managers.performanceManager = new this.PerformanceManager();
    this.managers.dataLimiter = new this.DataLimiter();
    this.managers.visitorCountManager = new this.VisitorCountManager();
    this.managers.chartManager = new this.GoogleChartsManager();
    this.managers.formspreeManager = new this.FormspreeManager();
    this.managers.realtimeTracker = new this.RealtimeTracker();
    this.managers.visitorLimitMonitor = new this.VisitorLimitMonitor();
    
    // Google Charts 로딩 대기
    await this.managers.chartManager.loadGoogleCharts();
    
    console.log('✅ 모든 관리자 클래스 초기화 완료');
    return true;
  } catch (error) {
    console.error('❌ 관리자 클래스 초기화 실패:', error);
    return false;
  }
};

// ═══════════════════════════════════════════════════════════════
// 🎉 UI 모듈 로드 완료
// ═══════════════════════════════════════════════════════════════

console.log('✅ KAUZ Admin UI Module 로드 완료');
console.log('🎨 모든 UI 함수 및 이벤트 리스너 준비 완료');
console.log('📋 다음 모듈: admin-main.js 로드 필요');
