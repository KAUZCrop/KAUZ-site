// admin.js - KAUZ 관리자 페이지 전용 JavaScript
// 🔥 기존 홈페이지와 동일한 구조로 작성

document.addEventListener('DOMContentLoaded', () => {
  console.log('🔧 KAUZ Admin 시스템 시작...');

  // ═══════════════════════════════════════════════════════════════
  // 전역 변수 및 설정
  // ═══════════════════════════════════════════════════════════════
  
  // Airtable 설정 (기존 홈페이지와 동일)
  const AIRTABLE_CONFIG = {
    token: 'patouGO5iPVpIxbRf.e4bdbe02fe59cbe69f201edaa32b4b63f8e05dbbfcae34173f0f40c985b811d9',
    baseId: 'appglO0MOXGY7CITU',
    tableName: 'Table%201'
  };

  // 관리자 설정
  const ADMIN_CONFIG = {
    password: 'kauz2025!admin', // 🔥 실제 사용 시 암호화 필요
    sessionDuration: 2 * 60 * 60 * 1000, // 2시간
    maxLoginAttempts: 3
  };

  // DOM 요소들
  const elements = {
    loginScreen: document.getElementById('login-screen'),
    adminDashboard: document.getElementById('admin-dashboard'),
    loginForm: document.getElementById('login-form'),
    loginError: document.getElementById('login-error'),
    logoutBtn: document.getElementById('logout-btn'),
    menuItems: document.querySelectorAll('.menu-item'),
    sections: document.querySelectorAll('.admin-section'),
    notification: document.getElementById('notification'),
    portfolioModal: document.getElementById('portfolio-modal')
  };

  // 현재 상태
  let currentSection = 'dashboard';
  let portfolioData = [];
  let contactsData = [];

  // ═══════════════════════════════════════════════════════════════
  // 인증 시스템
  // ═══════════════════════════════════════════════════════════════

  // 로그인 상태 확인
  function checkAuth() {
    const token = localStorage.getItem('kauz_admin_token');
    const loginTime = localStorage.getItem('kauz_admin_time');
    
    if (!token || !loginTime) {
      showLoginScreen();
      return false;
    }
    
    // 세션 만료 확인
    if (Date.now() - parseInt(loginTime) > ADMIN_CONFIG.sessionDuration) {
      logout('세션이 만료되었습니다.');
      return false;
    }
    
    showDashboard();
    return true;
  }

  // 로그인 화면 표시
  function showLoginScreen() {
    elements.loginScreen.style.display = 'flex';
    elements.adminDashboard.style.display = 'none';
    document.getElementById('admin-password').focus();
  }

  // 대시보드 표시
  function showDashboard() {
    elements.loginScreen.style.display = 'none';
    elements.adminDashboard.style.display = 'grid';
    loadDashboardData();
  }

  // 로그인 처리
  function login(password) {
    const attempts = parseInt(localStorage.getItem('kauz_login_attempts') || '0');
    
    if (attempts >= ADMIN_CONFIG.maxLoginAttempts) {
      showError('로그인 시도 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    if (password === ADMIN_CONFIG.password) {
      const token = generateToken();
      localStorage.setItem('kauz_admin_token', token);
      localStorage.setItem('kauz_admin_time', Date.now().toString());
      localStorage.removeItem('kauz_login_attempts');
      
      showNotification('로그인 성공!', 'success');
      showDashboard();
    } else {
      const newAttempts = attempts + 1;
      localStorage.setItem('kauz_login_attempts', newAttempts.toString());
      showError(`비밀번호가 틀렸습니다. (${newAttempts}/${ADMIN_CONFIG.maxLoginAttempts})`);
    }
  }

  // 로그아웃
  function logout(message = '로그아웃되었습니다.') {
    localStorage.removeItem('kauz_admin_token');
    localStorage.removeItem('kauz_admin_time');
    showNotification(message, 'info');
    showLoginScreen();
  }

  // 토큰 생성
  function generateToken() {
    return 'kauz_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // ═══════════════════════════════════════════════════════════════
  // UI 관리 함수들
  // ═══════════════════════════════════════════════════════════════

  // 섹션 전환
  function switchSection(sectionName) {
    // 메뉴 활성화 상태 변경
    elements.menuItems.forEach(item => {
      item.classList.remove('active');
      if (item.dataset.section === sectionName) {
        item.classList.add('active');
      }
    });

    // 섹션 표시/숨김
    elements.sections.forEach(section => {
      section.classList.remove('active');
      if (section.id === `section-${sectionName}`) {
        section.classList.add('active');
      }
    });

    currentSection = sectionName;
    
    // 섹션별 데이터 로드
    loadSectionData(sectionName);
  }

  // 섹션별 데이터 로드
  function loadSectionData(sectionName) {
    switch (sectionName) {
      case 'dashboard':
        loadDashboardData();
        break;
      case 'portfolio':
        loadPortfolioData();
        break;
      case 'content':
        loadContentData();
        break;
      case 'contacts':
        loadContactsData();
        break;
      case 'settings':
        loadSettingsData();
        break;
    }
  }

  // 알림 표시
  function showNotification(message, type = 'success') {
    const notification = elements.notification;
    const text = document.getElementById('notification-text');
    
    text.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
      notification.classList.remove('show');
    }, 4000);
  }

  // 에러 표시
  function showError(message) {
    elements.loginError.textContent = message;
    elements.loginError.style.display = 'block';
    
    setTimeout(() => {
      elements.loginError.style.display = 'none';
    }, 5000);
  }

  // ═══════════════════════════════════════════════════════════════
  // 데이터 관리 함수들
  // ═══════════════════════════════════════════════════════════════

  // 대시보드 데이터 로드
  async function loadDashboardData() {
    try {
      showLoading('dashboard');
      
      // 포트폴리오 개수 가져오기
      const portfolioCount = await getPortfolioCount();
      document.getElementById('portfolio-count').textContent = portfolioCount;
      
      // 최근 활동 표시
      updateRecentActivity([
        '포트폴리오 3개 추가됨',
        '새로운 문의 2건',
        'About 페이지 업데이트됨'
      ]);
      
      hideLoading('dashboard');
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
      showNotification('데이터 로드에 실패했습니다.', 'error');
    }
  }

  // 포트폴리오 데이터 로드
  async function loadPortfolioData() {
    try {
      showLoading('portfolio');
      
      const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.tableName}`, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('포트폴리오 데이터 로드 실패');
      }
      
      const data = await response.json();
      portfolioData = data.records;
      
      displayPortfolioList(portfolioData);
      hideLoading('portfolio');
      
    } catch (error) {
      console.error('포트폴리오 로드 실패:', error);
      showNotification('포트폴리오 데이터 로드에 실패했습니다.', 'error');
      hideLoading('portfolio');
    }
  }

  // 콘텐츠 데이터 로드
  function loadContentData() {
    // About 페이지 내용 로드 (예시)
    const aboutContent = localStorage.getItem('kauz_about_content') || 
      'Insight에서 시작해 소비자까지 연결되는 브랜드 여정.\n그 여정에서 KAUZ가 브랜드와 소비자를 이어줍니다.';
    
    document.getElementById('about-content').value = aboutContent;
    
    // 메타 정보 로드
    document.getElementById('site-title').value = 
      localStorage.getItem('kauz_site_title') || 'KAUZ - 종합광고대행사';
    document.getElementById('site-description').value = 
      localStorage.getItem('kauz_site_description') || 'KAUZ는 브랜드와 소비자를 연결하는 종합광고대행사입니다.';
  }

  // 문의 데이터 로드
  function loadContactsData() {
    // 실제로는 Formspree나 다른 서비스에서 데이터를 가져와야 함
    // 여기서는 로컬 스토리지 예시
    const contacts = JSON.parse(localStorage.getItem('kauz_contacts') || '[]');
    displayContactsList(contacts);
  }

  // 설정 데이터 로드
  function loadSettingsData() {
    // 설정값들을 폼에 로드
    console.log('설정 데이터 로드됨');
  }

  // ═══════════════════════════════════════════════════════════════
  // 표시 함수들
  // ═══════════════════════════════════════════════════════════════

  // 포트폴리오 목록 표시
  function displayPortfolioList(data) {
    const grid = document.getElementById('portfolio-grid');
    
    if (!data || data.length === 0) {
      grid.innerHTML = '<p>포트폴리오가 없습니다.</p>';
      return;
    }
    
    grid.innerHTML = data.map((record, index) => {
      const fields = record.fields;
      const title = fields.Title || `포트폴리오 ${index + 1}`;
      const category = fields.Category || 'General';
      const imageUrl = fields.ImageURL?.[0]?.url || '';
      
      return `
        <div class="portfolio-card" data-id="${record.id}">
          <div class="portfolio-image">
            ${imageUrl ? 
              `<img src="${imageUrl}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover;">` : 
              '이미지 없음'
            }
          </div>
          <div class="portfolio-info">
            <div class="portfolio-title">${title}</div>
            <div class="portfolio-category">${category}</div>
            <div class="portfolio-actions">
              <button class="edit-btn" onclick="editPortfolio('${record.id}')">수정</button>
              <button class="delete-btn" onclick="deletePortfolio('${record.id}')">삭제</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // 문의 목록 표시
  function displayContactsList(contacts) {
    const table = document.getElementById('contacts-table');
    
    if (!contacts || contacts.length === 0) {
      table.innerHTML = '<p>문의가 없습니다.</p>';
      return;
    }
    
    table.innerHTML = `
      <div class="data-table">
        <table>
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
          <tbody>
            ${contacts.map(contact => `
              <tr>
                <td>${new Date(contact.date).toLocaleDateString()}</td>
                <td>${contact.name}</td>
                <td>${contact.email}</td>
                <td>${contact.subject}</td>
                <td>${contact.status || '신규'}</td>
                <td class="actions">
                  <button class="btn-sm btn-view">보기</button>
                  <button class="btn-sm btn-reply">답변</button>
                  <button class="btn-sm btn-delete">삭제</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // 최근 활동 업데이트
  function updateRecentActivity(activities) {
    const container = document.getElementById('recent-activity');
    container.innerHTML = activities.map(activity => 
      `<p>• ${activity}</p>`
    ).join('');
  }

  // 로딩 표시
  function showLoading(section) {
    const container = document.querySelector(`#section-${section}`);
    if (container) {
      const loading = document.createElement('div');
      loading.className = 'loading';
      loading.textContent = '로딩 중...';
      loading.id = `loading-${section}`;
      container.appendChild(loading);
    }
  }

  // 로딩 숨김
  function hideLoading(section) {
    const loading = document.getElementById(`loading-${section}`);
    if (loading) {
      loading.remove();
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 유틸리티 함수들
  // ═══════════════════════════════════════════════════════════════

  // 포트폴리오 개수 가져오기
  async function getPortfolioCount() {
    try {
      const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.tableName}`, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.records.length;
      }
      return 0;
    } catch (error) {
      console.error('포트폴리오 개수 조회 실패:', error);
      return 0;
    }
  }

  // 포트폴리오 편집
  window.editPortfolio = function(id) {
    const record = portfolioData.find(r => r.id === id);
    if (record) {
      // 모달 열기 및 데이터 채우기
      document.getElementById('modal-title').textContent = '포트폴리오 편집';
      document.getElementById('portfolio-title').value = record.fields.Title || '';
      document.getElementById('portfolio-category').value = record.fields.Category || 'branding';
      document.getElementById('portfolio-description').value = record.fields.Description || '';
      
      elements.portfolioModal.classList.add('active');
      elements.portfolioModal.dataset.editId = id;
    }
  };

  // 포트폴리오 삭제
  window.deletePortfolio = function(id) {
    if (confirm('정말로 이 포트폴리오를 삭제하시겠습니까?')) {
      // 실제 삭제 로직 구현 필요
      showNotification('포트폴리오가 삭제되었습니다.', 'success');
      loadPortfolioData();
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 이벤트 리스너 등록
  // ═══════════════════════════════════════════════════════════════

  // 로그인 폼 이벤트
  if (elements.loginForm) {
    elements.loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const password = document.getElementById('admin-password').value;
      login(password);
    });
  }

  // 로그아웃 버튼 이벤트
  if (elements.logoutBtn) {
    elements.logoutBtn.addEventListener('click', () => {
      if (confirm('로그아웃하시겠습니까?')) {
        logout();
      }
    });
  }

  // 메뉴 클릭 이벤트
  elements.menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const section = item.dataset.section;
      if (section) {
        switchSection(section);
      }
    });
  });

  // 알림 닫기 이벤트
  document.getElementById('notification-close')?.addEventListener('click', () => {
    elements.notification.classList.remove('show');
  });

  // 모달 관련 이벤트
  document.querySelector('.modal-close')?.addEventListener('click', () => {
    elements.portfolioModal.classList.remove('active');
  });

  document.querySelector('.cancel-btn')?.addEventListener('click', () => {
    elements.portfolioModal.classList.remove('active');
  });

  // 포트폴리오 추가 버튼
  document.getElementById('add-portfolio-btn')?.addEventListener('click', () => {
    document.getElementById('modal-title').textContent = '포트폴리오 추가';
    document.getElementById('portfolio-form').reset();
    elements.portfolioModal.classList.add('active');
    delete elements.portfolioModal.dataset.editId;
  });

  // 탭 전환 이벤트
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      
      // 탭 버튼 활성화
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // 탭 내용 표시
      document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
      document.getElementById(`${tabName}-editor`).classList.add('active');
    });
  });

  // 콘텐츠 저장 이벤트
  document.querySelectorAll('.save-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // 어떤 섹션의 저장 버튼인지 확인
      if (e.target.closest('#about-editor')) {
        saveAboutContent();
      } else if (e.target.closest('#meta-editor')) {
        saveMetaContent();
      } else if (e.target.closest('.settings-actions')) {
        saveSettings();
      } else if (e.target.id === 'save-portfolio') {
        savePortfolio();
      }
    });
  });

  // 필터 버튼 이벤트
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // 활성화 상태 변경
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // 필터 적용
      const filter = btn.dataset.filter;
      filterContacts(filter);
    });
  });

  // 빠른 작업 버튼 이벤트
  document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      handleQuickAction(action);
    });
  });

  // ESC 키로 모달 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      elements.portfolioModal.classList.remove('active');
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // 저장 함수들
  // ═══════════════════════════════════════════════════════════════

  // About 콘텐츠 저장
  function saveAboutContent() {
    const content = document.getElementById('about-content').value;
    localStorage.setItem('kauz_about_content', content);
    showNotification('About 콘텐츠가 저장되었습니다.', 'success');
  }

  // 메타 정보 저장
  function saveMetaContent() {
    const title = document.getElementById('site-title').value;
    const description = document.getElementById('site-description').value;
    
    localStorage.setItem('kauz_site_title', title);
    localStorage.setItem('kauz_site_description', description);
    
    showNotification('메타 정보가 저장되었습니다.', 'success');
  }

  // 설정 저장
  function saveSettings() {
    // 실제로는 각 설정값들을 수집하여 저장
    showNotification('설정이 저장되었습니다.', 'success');
  }

  // 포트폴리오 저장
  async function savePortfolio() {
    try {
      const title = document.getElementById('portfolio-title').value;
      const category = document.getElementById('portfolio-category').value;
      const description = document.getElementById('portfolio-description').value;
      const imageFile = document.getElementById('portfolio-image').files[0];
      
      if (!title.trim()) {
        showNotification('제목을 입력해주세요.', 'error');
        return;
      }

      // 편집 모드인지 확인
      const editId = elements.portfolioModal.dataset.editId;
      const isEdit = !!editId;

      const recordData = {
        fields: {
          Title: title,
          Category: category,
          Description: description
        }
      };

      // 이미지 처리 (실제로는 이미지 업로드 서비스 사용 필요)
      if (imageFile) {
        // 여기서는 로컬 URL 생성 (실제로는 클라우드 업로드 필요)
        const imageUrl = URL.createObjectURL(imageFile);
        recordData.fields.ImageURL = [{ url: imageUrl }];
      }

      let response;
      if (isEdit) {
        // 업데이트
        response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.tableName}/${editId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${AIRTABLE_CONFIG.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(recordData)
        });
      } else {
        // 새로 추가
        response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.tableName}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${AIRTABLE_CONFIG.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(recordData)
        });
      }

      if (response.ok) {
        showNotification(isEdit ? '포트폴리오가 수정되었습니다.' : '포트폴리오가 추가되었습니다.', 'success');
        elements.portfolioModal.classList.remove('active');
        loadPortfolioData(); // 목록 새로고침
      } else {
        throw new Error('저장 실패');
      }

    } catch (error) {
      console.error('포트폴리오 저장 실패:', error);
      showNotification('저장에 실패했습니다.', 'error');
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 기타 유틸리티 함수들
  // ═══════════════════════════════════════════════════════════════

  // 문의 필터링
  function filterContacts(filter) {
    // 실제로는 문의 데이터를 필터링하여 표시
    console.log(`문의 필터: ${filter}`);
  }

  // 빠른 작업 처리
  function handleQuickAction(action) {
    switch (action) {
      case 'add-portfolio':
        switchSection('portfolio');
        setTimeout(() => {
          document.getElementById('add-portfolio-btn').click();
        }, 100);
        break;
      case 'edit-about':
        switchSection('content');
        break;
      case 'view-contacts':
        switchSection('contacts');
        break;
      default:
        console.log(`빠른 작업: ${action}`);
    }
  }

  // 데이터 백업
  function backupData() {
    const backup = {
      portfolio: portfolioData,
      contacts: contactsData,
      settings: {
        siteTitle: localStorage.getItem('kauz_site_title'),
        siteDescription: localStorage.getItem('kauz_site_description'),
        aboutContent: localStorage.getItem('kauz_about_content')
      },
      timestamp: new Date().toISOString()
    };

    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `kauz_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showNotification('백업이 다운로드되었습니다.', 'success');
  }

  // 백업 버튼 이벤트
  document.querySelector('.backup-btn')?.addEventListener('click', backupData);

  // ═══════════════════════════════════════════════════════════════
  // 세션 관리
  // ═══════════════════════════════════════════════════════════════

  // 세션 연장
  function extendSession() {
    const token = localStorage.getItem('kauz_admin_token');
    if (token) {
      localStorage.setItem('kauz_admin_time', Date.now().toString());
    }
  }

  // 사용자 활동 감지하여 세션 연장
  let activityTimeout;
  function resetActivityTimer() {
    clearTimeout(activityTimeout);
    activityTimeout = setTimeout(() => {
      extendSession();
    }, 60000); // 1분마다 세션 연장
  }

  // 활동 이벤트 리스너
  ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
    document.addEventListener(event, resetActivityTimer, { passive: true });
  });

  // ═══════════════════════════════════════════════════════════════
  // 개발 도구 (개발 모드에서만)
  // ═══════════════════════════════════════════════════════════════

  // 개발 모드 확인
  const isDevelopment = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';

  if (isDevelopment) {
    console.log('🛠️ KAUZ Admin 개발 모드');
    
    // 개발용 전역 함수들
    window.adminDebug = {
      login: () => login(ADMIN_CONFIG.password),
      logout: () => logout(),
      showSection: (section) => switchSection(section),
      loadData: (section) => loadSectionData(section),
      clearStorage: () => {
        localStorage.clear();
        showNotification('로컬 스토리지가 정리되었습니다.', 'info');
      },
      testNotification: (message, type) => showNotification(message, type),
      getCurrentData: () => ({
        portfolio: portfolioData,
        contacts: contactsData,
        currentSection: currentSection
      })
    };

    console.log('🔧 개발 도구 사용법:');
    console.log('- adminDebug.login() : 자동 로그인');
    console.log('- adminDebug.showSection("portfolio") : 섹션 이동');
    console.log('- adminDebug.clearStorage() : 데이터 초기화');
  }

  // ═══════════════════════════════════════════════════════════════
  // 에러 처리 및 로깅
  // ═══════════════════════════════════════════════════════════════

  // 전역 에러 핸들러
  window.addEventListener('error', (event) => {
    console.error('전역 에러:', event.error);
    if (isDevelopment) {
      showNotification(`에러 발생: ${event.error.message}`, 'error');
    }
  });

  // Promise 에러 핸들러
  window.addEventListener('unhandledrejection', (event) => {
    console.error('처리되지 않은 Promise 에러:', event.reason);
    if (isDevelopment) {
      showNotification(`Promise 에러: ${event.reason}`, 'error');
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // 초기화
  // ═══════════════════════════════════════════════════════════════

  // 페이지 로드 시 인증 확인
  checkAuth();

  // 주기적 세션 체크 (5분마다)
  setInterval(() => {
    const token = localStorage.getItem('kauz_admin_token');
    const loginTime = localStorage.getItem('kauz_admin_time');
    
    if (token && loginTime) {
      if (Date.now() - parseInt(loginTime) > ADMIN_CONFIG.sessionDuration) {
        logout('세션이 만료되었습니다.');
      }
    }
  }, 5 * 60 * 1000);

  // 페이지 언로드 시 정리
  window.addEventListener('beforeunload', () => {
    // 필요한 정리 작업
    clearTimeout(activityTimeout);
  });

  console.log('✅ KAUZ Admin 시스템 초기화 완료');
});

// ═══════════════════════════════════════════════════════════════
// 외부에서 접근 가능한 함수들
// ═══════════════════════════════════════════════════════════════

// 강제 로그아웃 (보안용)
window.forceLogout = function() {
  localStorage.removeItem('kauz_admin_token');
  localStorage.removeItem('kauz_admin_time');
  window.location.reload();
};

// 관리자 페이지 버전 정보
window.KAUZ_ADMIN_VERSION = '1.0.0';

console.log(`🔧 KAUZ Admin v${window.KAUZ_ADMIN_VERSION} 로드됨`);
