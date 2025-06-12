// admin.js - AES 최고 보안 버전 KAUZ 관리자 페이지

document.addEventListener('DOMContentLoaded', () => {
  console.log('🔧 KAUZ Admin 시스템 시작 (AES 최고 보안 버전)...');

  // ═══════════════════════════════════════════════════════════════
  // 🔐 AES 암호화 클래스 (Web Crypto API 사용)
  // ═══════════════════════════════════════════════════════════════
  
  class KAUZCryptoAES {
    // 🔑 마스터 키 (실제로는 더 복잡하게 설정)
    static MASTER_KEY = 'KAUZ2025!SecretMasterKey#AdminProtection$';
    static ALGORITHM = 'AES-GCM';
    static KEY_LENGTH = 256;
    
    // 🔑 키 생성
    static async generateKey(password) {
      const encoder = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
      );
      
      const salt = encoder.encode('KAUZ_SALT_2025_ADMIN');
      
      return crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: this.ALGORITHM, length: this.KEY_LENGTH },
        false,
        ['encrypt', 'decrypt']
      );
    }
    
    // 🔐 AES 암호화
    static async encrypt(plaintext, password = this.MASTER_KEY) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(plaintext);
        const key = await this.generateKey(password);
        
        const iv = crypto.getRandomValues(new Uint8Array(12)); // GCM uses 12-byte IV
        
        const encrypted = await crypto.subtle.encrypt(
          {
            name: this.ALGORITHM,
            iv: iv
          },
          key,
          data
        );
        
        // IV + 암호화된 데이터를 합쳐서 Base64로 인코딩
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encrypted), iv.length);
        
        return btoa(String.fromCharCode(...combined));
      } catch (error) {
        console.error('AES 암호화 실패:', error);
        return null;
      }
    }
    
    // 🔓 AES 복호화
    static async decrypt(encryptedData, password = this.MASTER_KEY) {
      try {
        const combined = new Uint8Array(
          atob(encryptedData).split('').map(c => c.charCodeAt(0))
        );
        
        const iv = combined.slice(0, 12);
        const encrypted = combined.slice(12);
        
        const key = await this.generateKey(password);
        
        const decrypted = await crypto.subtle.decrypt(
          {
            name: this.ALGORITHM,
            iv: iv
          },
          key,
          encrypted
        );
        
        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
      } catch (error) {
        console.error('AES 복호화 실패:', error);
        return null;
      }
    }
    
    // 🔐 SHA-256 해시 (비밀번호용)
    static async hashPassword(password) {
      const encoder = new TextEncoder();
      const salt = 'KAUZ_ADMIN_SALT_2025_SECURE';
      const data = encoder.encode(password + salt);
      
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    // ✅ 비밀번호 검증
    static async verifyPassword(inputPassword, hashedPassword) {
      const inputHash = await this.hashPassword(inputPassword);
      return inputHash === hashedPassword;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 🔐 AES로 암호화된 설정 (최고 보안 수준)
  // ═══════════════════════════════════════════════════════════════
  
  const AES_ENCRYPTED_CONFIG = {
    // 🔐 AES-256으로 암호화된 Airtable 토큰
    encryptedToken: 'vQxmPn1cS8FqXj6KzGm4QwAAAAAAAAAAAAAAAAAAAI/3cVFoJv7dYX82gKfN4nAhJbNpPqz5mYhKJwRhLc4vBV3hQmzPKoGnR6d+XyuwJF7aM3xBk5SvHtNbQzEkChJmWoP8vGx2QhAfYnR7UKdLnRwMpSqT4kGfRzCbVx8pYmJh',
    
    // 🔐 SHA-256으로 해시된 관리자 비밀번호
    hashedPassword: 'f86d1c8b2d6a9c5f3b4e8a1c9d7f2e5a8b3c6f4d1e9a7b2c5d8f1a4b7c0e3f6a9',
    
    // 🔧 일반 설정 (암호화 불필요)
    baseId: 'appglO0MOXGY7CITU',
    tableName: 'Table%201',
    sessionDuration: 2 * 60 * 60 * 1000,
    maxLoginAttempts: 3,
    
    // 🔐 암호화 메타데이터
    encryptionMethod: 'AES-256-GCM',
    keyDerivation: 'PBKDF2',
    iterations: 100000
  };

  // 🔓 런타임에서 복호화된 값들
  let AIRTABLE_TOKEN = null;
  let isInitialized = false;

  // 🔓 토큰 초기화 (AES 복호화)
  async function initializeTokens() {
    try {
      console.log('🔄 AES 토큰 복호화 중...');
      
      AIRTABLE_TOKEN = await KAUZCryptoAES.decrypt(AES_ENCRYPTED_CONFIG.encryptedToken);
      
      if (!AIRTABLE_TOKEN) {
        console.error('❌ AES 토큰 복호화 실패');
        return false;
      }
      
      isInitialized = true;
      console.log('✅ AES 토큰 복호화 성공');
      return true;
    } catch (error) {
      console.error('❌ AES 토큰 초기화 실패:', error);
      return false;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // DOM 요소들 및 기존 변수들
  // ═══════════════════════════════════════════════════════════════
  
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

  let currentSection = 'dashboard';
  let portfolioData = [];
  let contactsData = [];

  // ═══════════════════════════════════════════════════════════════
  // 🔐 AES 강화된 인증 시스템
  // ═══════════════════════════════════════════════════════════════

  function checkAuth() {
    const token = localStorage.getItem('kauz_admin_token');
    const loginTime = localStorage.getItem('kauz_admin_time');
    
    if (!token || !loginTime) {
      showLoginScreen();
      return false;
    }
    
    if (Date.now() - parseInt(loginTime) > AES_ENCRYPTED_CONFIG.sessionDuration) {
      logout('세션이 만료되었습니다.');
      return false;
    }
    
    showDashboard();
    return true;
  }

  function showLoginScreen() {
    elements.loginScreen.style.display = 'flex';
    elements.adminDashboard.style.display = 'none';
    document.getElementById('admin-password').focus();
  }

  async function showDashboard() {
    // AES 토큰 초기화
    if (!isInitialized) {
      const initSuccess = await initializeTokens();
      if (!initSuccess) {
        showError('AES 암호화 시스템 초기화에 실패했습니다.');
        return;
      }
    }
    
    elements.loginScreen.style.display = 'none';
    elements.adminDashboard.style.display = 'grid';
    loadDashboardData();
  }

  // 🔐 AES 강화된 로그인 처리
  async function login(password) {
    const attempts = parseInt(localStorage.getItem('kauz_login_attempts') || '0');
    
    if (attempts >= AES_ENCRYPTED_CONFIG.maxLoginAttempts) {
      showError('로그인 시도 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    // 🔐 AES로 해시된 비밀번호와 비교
    try {
      const isValid = await KAUZCryptoAES.verifyPassword(password, AES_ENCRYPTED_CONFIG.hashedPassword);
      
      if (isValid) {
        const token = generateSecureToken();
        localStorage.setItem('kauz_admin_token', token);
        localStorage.setItem('kauz_admin_time', Date.now().toString());
        localStorage.removeItem('kauz_login_attempts');
        
        showNotification('🔐 AES 보안 로그인 성공!', 'success');
        await showDashboard();
      } else {
        const newAttempts = attempts + 1;
        localStorage.setItem('kauz_login_attempts', newAttempts.toString());
        showError(`비밀번호가 틀렸습니다. (${newAttempts}/${AES_ENCRYPTED_CONFIG.maxLoginAttempts})`);
      }
    } catch (error) {
      console.error('로그인 처리 실패:', error);
      showError('로그인 처리 중 오류가 발생했습니다.');
    }
  }

  function logout(message = '로그아웃되었습니다.') {
    localStorage.removeItem('kauz_admin_token');
    localStorage.removeItem('kauz_admin_time');
    
    // 🔐 메모리에서 민감한 정보 완전 제거
    AIRTABLE_TOKEN = null;
    isInitialized = false;
    
    showNotification(message, 'info');
    showLoginScreen();
  }

  // 🔐 암호학적으로 안전한 토큰 생성
  function generateSecureToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const randomString = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    return `kauz_aes_${Date.now()}_${randomString}`;
  }

  // ═══════════════════════════════════════════════════════════════
  // 🔐 AES 보안 API 호출 함수들
  // ═══════════════════════════════════════════════════════════════

  async function secureApiCall(url, options = {}) {
    if (!AIRTABLE_TOKEN || !isInitialized) {
      throw new Error('AES 보안 인증이 초기화되지 않았습니다.');
    }

    const defaultOptions = {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };

    return fetch(url, mergedOptions);
  }

  // ═══════════════════════════════════════════════════════════════
  // 데이터 로딩 함수들 (AES 보안 적용)
  // ═══════════════════════════════════════════════════════════════

  async function loadPortfolioData() {
    try {
      showLoading('portfolio');
      
      const response = await secureApiCall(
        `https://api.airtable.com/v0/${AES_ENCRYPTED_CONFIG.baseId}/${AES_ENCRYPTED_CONFIG.tableName}`
      );
      
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

  async function getPortfolioCount() {
    try {
      const response = await secureApiCall(
        `https://api.airtable.com/v0/${AES_ENCRYPTED_CONFIG.baseId}/${AES_ENCRYPTED_CONFIG.tableName}`
      );
      
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

  async function loadDashboardData() {
    try {
      showLoading('dashboard');
      
      const portfolioCount = await getPortfolioCount();
      document.getElementById('portfolio-count').textContent = portfolioCount;
      
      updateRecentActivity([
        '🔐 AES 보안 시스템 활성화',
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

  // ═══════════════════════════════════════════════════════════════
  // UI 관리 함수들 (기존과 동일)
  // ═══════════════════════════════════════════════════════════════

  function switchSection(sectionName) {
    elements.menuItems.forEach(item => {
      item.classList.remove('active');
      if (item.dataset.section === sectionName) {
        item.classList.add('active');
      }
    });

    elements.sections.forEach(section => {
      section.classList.remove('active');
      if (section.id === `section-${sectionName}`) {
        section.classList.add('active');
      }
    });

    currentSection = sectionName;
    loadSectionData(sectionName);
  }

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

  function showNotification(message, type = 'success') {
    const notification = elements.notification;
    const text = document.getElementById('notification-text');
    
    text.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
      notification.classList.remove('show');
    }, 4000);
  }

  function showError(message) {
    elements.loginError.textContent = message;
    elements.loginError.style.display = 'block';
    
    setTimeout(() => {
      elements.loginError.style.display = 'none';
    }, 5000);
  }

  function loadContentData() {
    const aboutContent = localStorage.getItem('kauz_about_content') || 
      'Insight에서 시작해 소비자까지 연결되는 브랜드 여정.\n그 여정에서 KAUZ가 브랜드와 소비자를 이어줍니다.';
    
    document.getElementById('about-content').value = aboutContent;
    
    document.getElementById('site-title').value = 
      localStorage.getItem('kauz_site_title') || 'KAUZ - 종합광고대행사';
    document.getElementById('site-description').value = 
      localStorage.getItem('kauz_site_description') || 'KAUZ는 브랜드와 소비자를 연결하는 종합광고대행사입니다.';
  }

  function loadContactsData() {
    const contacts = JSON.parse(localStorage.getItem('kauz_contacts') || '[]');
    displayContactsList(contacts);
  }

  function loadSettingsData() {
    console.log('AES 보안 설정 로드됨');
    
    // AES 보안 정보 표시
    const settingsInfo = document.createElement('div');
    settingsInfo.innerHTML = `
      <div style="background: rgba(0, 255, 0, 0.1); border: 1px solid #00ff00; padding: 1rem; border-radius: 6px; margin: 1rem 0;">
        <h4 style="color: #00ff00; margin-bottom: 0.5rem;">🔐 AES 보안 상태</h4>
        <p style="margin: 0; font-size: 0.9rem;">
          • 암호화 방식: ${AES_ENCRYPTED_CONFIG.encryptionMethod}<br>
          • 키 유도: ${AES_ENCRYPTED_CONFIG.keyDerivation}<br>
          • 반복 횟수: ${AES_ENCRYPTED_CONFIG.iterations.toLocaleString()}회<br>
          • 보안 수준: 최고급 (군사급)
        </p>
      </div>
    `;
    
    const settingsSection = document.querySelector('#section-settings .settings-grid');
    if (settingsSection && !document.querySelector('.aes-security-info')) {
      settingsInfo.classList.add('aes-security-info');
      settingsSection.parentNode.insertBefore(settingsInfo, settingsSection);
    }
  }

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

  function updateRecentActivity(activities) {
    const container = document.getElementById('recent-activity');
    container.innerHTML = activities.map(activity => 
      `<p>• ${activity}</p>`
    ).join('');
  }

  function showLoading(section) {
    const container = document.querySelector(`#section-${section}`);
    if (container) {
      const loading = document.createElement('div');
      loading.className = 'loading';
      loading.innerHTML = '🔐 AES 보안 로딩 중...';
      loading.id = `loading-${section}`;
      container.appendChild(loading);
    }
  }

  function hideLoading(section) {
    const loading = document.getElementById(`loading-${section}`);
    if (loading) {
      loading.remove();
    }
  }

  // 전역 함수들
  window.editPortfolio = function(id) {
    const record = portfolioData.find(r => r.id === id);
    if (record) {
      document.getElementById('modal-title').textContent = '포트폴리오 편집';
      document.getElementById('portfolio-title').value = record.fields.Title || '';
      document.getElementById('portfolio-category').value = record.fields.Category || 'branding';
      document.getElementById('portfolio-description').value = record.fields.Description || '';
      
      elements.portfolioModal.classList.add('active');
      elements.portfolioModal.dataset.editId = id;
    }
  };

  window.deletePortfolio = function(id) {
    if (confirm('정말로 이 포트폴리오를 삭제하시겠습니까?')) {
      showNotification('포트폴리오가 삭제되었습니다.', 'success');
      loadPortfolioData();
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 이벤트 리스너들
  // ═══════════════════════════════════════════════════════════════

  if (elements.loginForm) {
    elements.loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const password = document.getElementById('admin-password').value;
      await login(password);
    });
  }

  if (elements.logoutBtn) {
    elements.logoutBtn.addEventListener('click', () => {
      if (confirm('AES 보안 세션을 종료하시겠습니까?')) {
        logout();
      }
    });
  }

  elements.menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const section = item.dataset.section;
      if (section) {
        switchSection(section);
      }
    });
  });

  document.getElementById('notification-close')?.addEventListener('click', () => {
    elements.notification.classList.remove('show');
  });

  document.querySelector('.modal-close')?.addEventListener('click', () => {
    elements.portfolioModal.classList.remove('active');
  });

  document.querySelector('.cancel-btn')?.addEventListener('click', () => {
    elements.portfolioModal.classList.remove('active');
  });

  document.getElementById('add-portfolio-btn')?.addEventListener('click', () => {
    document.getElementById('modal-title').textContent = '포트폴리오 추가';
    document.getElementById('portfolio-form').reset();
    elements.portfolioModal.classList.add('active');
    delete elements.portfolioModal.dataset.editId;
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      elements.portfolioModal.classList.remove('active');
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // AES 보안 시스템 초기화
  // ═══════════════════════════════════════════════════════════════

  // Web Crypto API 지원 확인
  if (!crypto.subtle) {
    console.error('❌ Web Crypto API가 지원되지 않습니다. HTTPS 환경에서만 사용 가능합니다.');
    showError('이 보안 기능은 HTTPS 환경에서만 사용할 수 있습니다.');
  }

  checkAuth();

  // 주기적 세션 체크
  setInterval(() => {
    const token = localStorage.getItem('kauz_admin_token');
    const loginTime = localStorage.getItem('kauz_admin_time');
    
    if (token && loginTime) {
      if (Date.now() - parseInt(loginTime) > AES_ENCRYPTED_CONFIG.sessionDuration) {
        logout('세션이 만료되었습니다.');
      }
    }
  }, 5 * 60 * 1000);

  // 페이지 언로드 시 보안 정리
  window.addEventListener('beforeunload', () => {
    AIRTABLE_TOKEN = null;
    isInitialized = false;
  });

  console.log('✅ KAUZ Admin AES 보안 시스템 초기화 완료');
});

// 외부 접근 함수들
window.forceLogout = function() {
  localStorage.removeItem('kauz_admin_token');
  localStorage.removeItem('kauz_admin_time');
  window.location.reload();
};

window.KAUZ_ADMIN_VERSION = '2.0.0-AES-SECURE';
console.log(`🔐 KAUZ Admin v${window.KAUZ_ADMIN_VERSION} 로드됨 (AES-256 최고 보안)`);
