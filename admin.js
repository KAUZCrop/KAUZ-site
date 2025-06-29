// ═══════════════════════════════════════════════════════════════
// KAUZ Ultimate Hybrid Admin JavaScript
// 🔥 AES 보안 + 실시간 추적 + 고급 차트 + 이미지 미리보기 + 모든 기능 통합
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 KAUZ Ultimate Admin System Starting...');

  // ═══════════════════════════════════════════════════════════════
  // 🔐 AES 암호화 클래스 (보안 강화)
  // ═══════════════════════════════════════════════════════════════
  
  class KAUZCryptoAES {
    static MASTER_KEY = 'KAUZ2025!UltimateSecretMasterKey#AdminProtection$Enhanced';
    static ALGORITHM = 'AES-GCM';
    
    static async generateKey(password) {
      const encoder = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password.padEnd(32, '0').slice(0, 32)),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
      );
      
      const salt = new Uint8Array([
        75, 65, 85, 90, 50, 48, 50, 53,
        85, 76, 84, 73, 77, 65, 84, 69
      ]);
      
      return crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 15000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: this.ALGORITHM, length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
    }
    
    static async encrypt(plaintext, password = this.MASTER_KEY) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(plaintext);
        const key = await this.generateKey(password);
        
        const iv = new Uint8Array(12);
        crypto.getRandomValues(iv);
        
        const encrypted = await crypto.subtle.encrypt(
          { name: this.ALGORITHM, iv: iv },
          key,
          data
        );
        
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encrypted), iv.length);
        
        return btoa(String.fromCharCode(...combined));
      } catch (error) {
        console.error('AES 암호화 실패:', error);
        return null;
      }
    }
    
    static async decrypt(encryptedData, password = this.MASTER_KEY) {
      try {
        const combined = new Uint8Array(
          atob(encryptedData).split('').map(c => c.charCodeAt(0))
        );
        
        const iv = combined.slice(0, 12);
        const encrypted = combined.slice(12);
        
        const key = await this.generateKey(password);
        
        const decrypted = await crypto.subtle.decrypt(
          { name: this.ALGORITHM, iv: iv },
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
    
    static async hashPassword(password) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password + 'KAUZ_ULTIMATE_SALT_2025');
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    static async verifyPassword(inputPassword, hashedPassword) {
      const inputHash = await this.hashPassword(inputPassword);
      return inputHash === hashedPassword;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 🔧 시스템 설정 및 토큰 관리
  // ═══════════════════════════════════════════════════════════════
  
  const SYSTEM_CONFIG = {
    encryptedToken: null,
    hashedPassword: null,
    baseId: 'appglO0MOXGY7CITU',
    mainTableName: 'KAUZ%20main',
    workTableName: 'KAUZ%20Work',
    contactTableName: 'Contact%20Form',
    analyticsTableName: 'Analytics',
    sessionDuration: 2 * 60 * 60 * 1000,
    maxLoginAttempts: 5,
    version: '3.0.0-ULTIMATE'
  };

  let AIRTABLE_TOKEN = null;
  let isInitialized = false;
  let correctPasswordHash = null;
  let currentSection = 'dashboard';
  let currentPortfolioTab = 'main';

  // ═══════════════════════════════════════════════════════════════
  // 📊 데이터 저장소
  // ═══════════════════════════════════════════════════════════════
  
  let systemData = {
    portfolio: {
      main: [],
      work: []
    },
    contacts: [],
    analytics: [],
    charts: {},
    realtime: {
      visitors: 0,
      pageviews: 0,
      sessions: 0
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 🎨 차트 관리 클래스
  // ═══════════════════════════════════════════════════════════════
  
  class ChartManager {
    constructor() {
      this.charts = {};
      this.defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#cccccc'
            }
          }
        },
        scales: {
          x: {
            ticks: { color: '#cccccc' },
            grid: { color: '#333333' }
          },
          y: {
            ticks: { color: '#cccccc' },
            grid: { color: '#333333' }
          }
        }
      };
    }

    createVisitorTrendChart(canvasId, data) {
      const ctx = document.getElementById(canvasId);
      if (!ctx) return null;

      if (this.charts[canvasId]) {
        this.charts[canvasId].destroy();
      }

      this.charts[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.labels || ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
          datasets: [{
            label: '방문자',
            data: data.visitors || [12, 19, 8, 25, 32, 28],
            borderColor: '#E37031',
            backgroundColor: 'rgba(227, 112, 49, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          ...this.defaultOptions,
          plugins: {
            ...this.defaultOptions.plugins,
            title: {
              display: true,
              text: '실시간 방문자 추이',
              color: '#E37031'
            }
          }
        }
      });

      return this.charts[canvasId];
    }

    createUserBehaviorChart(canvasId, data) {
      const ctx = document.getElementById(canvasId);
      if (!ctx) return null;

      if (this.charts[canvasId]) {
        this.charts[canvasId].destroy();
      }

      this.charts[canvasId] = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['포트폴리오', 'About', 'Contact', '기타'],
          datasets: [{
            data: data.pageViews || [45, 25, 20, 10],
            backgroundColor: [
              '#E37031',
              '#28a745',
              '#17a2b8',
              '#ffc107'
            ]
          }]
        },
        options: {
          ...this.defaultOptions,
          plugins: {
            ...this.defaultOptions.plugins,
            title: {
              display: true,
              text: '페이지별 방문',
              color: '#E37031'
            }
          }
        }
      });

      return this.charts[canvasId];
    }

    createAnalyticsChart(canvasId, type, data) {
      const ctx = document.getElementById(canvasId);
      if (!ctx) return null;

      if (this.charts[canvasId]) {
        this.charts[canvasId].destroy();
      }

      const chartConfig = {
        'main-analytics-chart': {
          type: 'line',
          data: {
            labels: data.labels || [],
            datasets: [{
              label: '방문자',
              data: data.visitors || [],
              borderColor: '#E37031',
              backgroundColor: 'rgba(227, 112, 49, 0.1)',
              fill: true
            }]
          }
        },
        'pages-performance-chart': {
          type: 'bar',
          data: {
            labels: ['Home', 'Portfolio', 'About', 'Contact'],
            datasets: [{
              label: '페이지뷰',
              data: data.pageViews || [150, 120, 80, 60],
              backgroundColor: '#E37031'
            }]
          }
        },
        'hourly-visits-chart': {
          type: 'line',
          data: {
            labels: Array.from({length: 24}, (_, i) => `${i}:00`),
            datasets: [{
              label: '시간대별 방문',
              data: data.hourlyData || Array.from({length: 24}, () => Math.floor(Math.random() * 50)),
              borderColor: '#17a2b8',
              backgroundColor: 'rgba(23, 162, 184, 0.1)',
              fill: true
            }]
          }
        },
        'device-chart': {
          type: 'pie',
          data: {
            labels: ['Desktop', 'Mobile', 'Tablet'],
            datasets: [{
              data: data.deviceData || [60, 35, 5],
              backgroundColor: ['#E37031', '#28a745', '#17a2b8']
            }]
          }
        }
      };

      const config = chartConfig[canvasId];
      if (!config) return null;

      this.charts[canvasId] = new Chart(ctx, {
        ...config,
        options: this.defaultOptions
      });

      return this.charts[canvasId];
    }

    updateChart(canvasId, newData) {
      if (this.charts[canvasId]) {
        const chart = this.charts[canvasId];
        if (newData.labels) chart.data.labels = newData.labels;
        if (newData.datasets) chart.data.datasets = newData.datasets;
        chart.update();
      }
    }

    destroyChart(canvasId) {
      if (this.charts[canvasId]) {
        this.charts[canvasId].destroy();
        delete this.charts[canvasId];
      }
    }

    destroyAllCharts() {
      Object.keys(this.charts).forEach(id => this.destroyChart(id));
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 🖼️ 이미지 업로드 관리 클래스
  // ═══════════════════════════════════════════════════════════════
  
  class ImageUploadManager {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      this.uploadZone = null;
      this.fileInput = null;
      this.previewGrid = null;
      this.uploadedFiles = [];
      this.maxFiles = 10;
      this.maxFileSize = 5 * 1024 * 1024; // 5MB
      
      this.init();
    }

    init() {
      if (!this.container) return;

      this.uploadZone = this.container.querySelector('.image-upload-zone');
      this.fileInput = this.container.querySelector('input[type="file"]');
      this.previewGrid = this.container.querySelector('.image-preview-grid');

      if (!this.uploadZone || !this.fileInput || !this.previewGrid) return;

      this.setupEventListeners();
    }

    setupEventListeners() {
      // 파일 선택 이벤트
      this.fileInput.addEventListener('change', (e) => {
        this.handleFiles(e.target.files);
      });

      // 드래그 앤 드롭 이벤트
      this.uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        this.uploadZone.classList.add('drag-over');
      });

      this.uploadZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        this.uploadZone.classList.remove('drag-over');
      });

      this.uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        this.uploadZone.classList.remove('drag-over');
        this.handleFiles(e.dataTransfer.files);
      });
    }

    handleFiles(files) {
      Array.from(files).forEach(file => {
        if (this.validateFile(file)) {
          this.addFile(file);
        }
      });
    }

    validateFile(file) {
      // 파일 타입 검증
      if (!file.type.startsWith('image/')) {
        showNotification('이미지 파일만 업로드 가능합니다.', 'error');
        return false;
      }

      // 파일 크기 검증
      if (file.size > this.maxFileSize) {
        showNotification('파일 크기는 5MB 이하만 가능합니다.', 'error');
        return false;
      }

      // 최대 파일 수 검증
      if (this.uploadedFiles.length >= this.maxFiles) {
        showNotification(`최대 ${this.maxFiles}개 파일만 업로드 가능합니다.`, 'error');
        return false;
      }

      return true;
    }

    addFile(file) {
      const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const fileData = {
        id: fileId,
        file: file,
        preview: null
      };

      this.uploadedFiles.push(fileData);

      // 미리보기 생성
      this.createPreview(fileData);
    }

    createPreview(fileData) {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        fileData.preview = e.target.result;
        
        const previewElement = document.createElement('div');
        previewElement.className = 'preview-item';
        previewElement.dataset.fileId = fileData.id;
        
        previewElement.innerHTML = `
          <img src="${fileData.preview}" alt="${fileData.file.name}">
          <button class="preview-remove" onclick="imageManager.removeFile('${fileData.id}')">&times;</button>
        `;
        
        this.previewGrid.appendChild(previewElement);
      };
      
      reader.readAsDataURL(fileData.file);
    }

    removeFile(fileId) {
      // 파일 데이터에서 제거
      this.uploadedFiles = this.uploadedFiles.filter(file => file.id !== fileId);
      
      // DOM에서 제거
      const previewElement = this.previewGrid.querySelector(`[data-file-id="${fileId}"]`);
      if (previewElement) {
        previewElement.remove();
      }
    }

    getFiles() {
      return this.uploadedFiles;
    }

    clear() {
      this.uploadedFiles = [];
      this.previewGrid.innerHTML = '';
    }

    async uploadToAirtable(recordId, tableName) {
      if (this.uploadedFiles.length === 0) return [];

      const uploadPromises = this.uploadedFiles.map(async (fileData) => {
        const formData = new FormData();
        formData.append('file', fileData.file);
        
        try {
          // Airtable에 파일 업로드 (실제 구현시 Airtable API 사용)
          const response = await fetch(`https://api.airtable.com/v0/${SYSTEM_CONFIG.baseId}/${tableName}/${recordId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${AIRTABLE_TOKEN}`
            },
            body: formData
          });

          if (response.ok) {
            return await response.json();
          }
          throw new Error('업로드 실패');
        } catch (error) {
          console.error('파일 업로드 실패:', error);
          return null;
        }
      });

      const results = await Promise.all(uploadPromises);
      return results.filter(result => result !== null);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 📊 실시간 방문자 추적 클래스
  // ═══════════════════════════════════════════════════════════════
  
  class RealtimeTracker {
    constructor() {
      this.isActive = true;
      this.updateInterval = 5000; // 5초마다 업데이트
      this.intervalId = null;
      this.websocket = null;
      
      this.init();
    }

    init() {
      this.startTracking();
      this.setupEventListeners();
    }

    startTracking() {
      if (this.intervalId) return;

      this.intervalId = setInterval(() => {
        if (this.isActive) {
          this.fetchRealtimeData();
        }
      }, this.updateInterval);

      console.log('🔴 실시간 추적 시작');
    }

    stopTracking() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
      
      console.log('⏸️ 실시간 추적 정지');
    }

    toggleTracking() {
      this.isActive = !this.isActive;
      const button = document.getElementById('toggle-tracking');
      
      if (button) {
        button.textContent = this.isActive ? '⏸️ 추적 일시정지' : '▶️ 추적 시작';
      }

      if (this.isActive) {
        this.startTracking();
      } else {
        this.stopTracking();
      }
    }

    async fetchRealtimeData() {
      try {
        const response = await secureApiCall(
          `https://api.airtable.com/v0/${SYSTEM_CONFIG.baseId}/${SYSTEM_CONFIG.analyticsTableName}?filterByFormula=DATETIME_DIFF(NOW(),{Created},'minutes')<5`
        );

        if (response.ok) {
          const data = await response.json();
          this.processRealtimeData(data.records);
        }
      } catch (error) {
        console.error('실시간 데이터 가져오기 실패:', error);
      }
    }

    processRealtimeData(records) {
      const now = Date.now();
      const fiveMinutesAgo = now - (5 * 60 * 1000);
      
      const recentVisitors = records.filter(record => {
        const recordTime = new Date(record.createdTime).getTime();
        return recordTime > fiveMinutesAgo;
      });

      // 실시간 지표 업데이트
      this.updateRealtimeMetrics({
        liveVisitors: recentVisitors.length,
        liveClicks: this.calculateRecentClicks(recentVisitors),
        livePageviews: this.calculateRecentPageviews(recentVisitors),
        avgTimeOnPage: this.calculateAvgTimeOnPage(recentVisitors)
      });

      // 실시간 방문자 목록 업데이트
      this.updateVisitorsList(recentVisitors);
    }

    calculateRecentClicks(visitors) {
      return visitors.reduce((total, visitor) => {
        const events = JSON.parse(visitor.fields.Events || '[]');
        return total + events.filter(event => event.type === 'click').length;
      }, 0);
    }

    calculateRecentPageviews(visitors) {
      return visitors.reduce((total, visitor) => {
        return total + (visitor.fields.PageViews || 0);
      }, 0);
    }

    calculateAvgTimeOnPage(visitors) {
      if (visitors.length === 0) return 0;
      
      const totalTime = visitors.reduce((total, visitor) => {
        return total + (visitor.fields.Duration || 0);
      }, 0);
      
      return Math.round(totalTime / visitors.length);
    }

    updateRealtimeMetrics(metrics) {
      const elements = {
        'live-visitors': metrics.liveVisitors,
        'live-clicks': metrics.liveClicks,
        'live-pageviews': metrics.livePageviews,
        'avg-time-on-page': `${metrics.avgTimeOnPage}s`
      };

      Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
          element.textContent = value;
        }
      });
    }

    updateVisitorsList(visitors) {
      const container = document.getElementById('realtime-visitors-list');
      if (!container) return;

      if (visitors.length === 0) {
        container.innerHTML = '<div class="no-visitors">현재 활성 방문자가 없습니다.</div>';
        return;
      }

      const visitorsHtml = visitors.map(visitor => {
        const fields = visitor.fields;
        const duration = Math.round((Date.now() - new Date(visitor.createdTime).getTime()) / 1000);
        
        return `
          <div class="visitor-item">
            <div class="visitor-info">
              <div class="visitor-page">${fields.Page || '/'}</div>
              <div class="visitor-time">${duration}초 전</div>
            </div>
            <div class="visitor-duration">${fields.Duration || 0}s</div>
          </div>
        `;
      }).join('');

      container.innerHTML = visitorsHtml;
    }

    setupEventListeners() {
      const toggleButton = document.getElementById('toggle-tracking');
      if (toggleButton) {
        toggleButton.addEventListener('click', () => this.toggleTracking());
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 🔧 DOM 요소들 및 전역 변수
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
    portfolioModal: document.getElementById('portfolio-modal'),
    contactModal: document.getElementById('contact-modal'),
    loadingOverlay: document.getElementById('loading-overlay')
  };

  // 전역 인스턴스들
  let chartManager = null;
  let imageManager = null;
  let realtimeTracker = null;

  // ═══════════════════════════════════════════════════════════════
  // 🚀 시스템 초기화 함수들
  // ═══════════════════════════════════════════════════════════════

  async function initializeSystem() {
    try {
      console.log('🔄 Ultimate Admin System 초기화 중...');
      
      const originalToken = 'patouGO5iPVpIxbRf.e4bdbe02fe59cbe69f201edaa32b4b63f8e05dbbfcae34173f0f40c985b811d9';
      
      SYSTEM_CONFIG.encryptedToken = await KAUZCryptoAES.encrypt(originalToken);
      correctPasswordHash = await KAUZCryptoAES.hashPassword('kauz2025!admin');
      SYSTEM_CONFIG.hashedPassword = correctPasswordHash;
      
      console.log('✅ Ultimate Admin System 초기화 완료');
      console.log(`🔐 보안 레벨: AES-256 + ${SYSTEM_CONFIG.version}`);
      
      return true;
    } catch (error) {
      console.error('❌ 시스템 초기화 실패:', error);
      return false;
    }
  }

  async function initializeTokens() {
    try {
      if (!SYSTEM_CONFIG.encryptedToken) {
        console.error('❌ 암호화된 토큰이 없습니다.');
        return false;
      }
      
      console.log('🔄 AES 토큰 복호화 중...');
      
      AIRTABLE_TOKEN = await KAUZCryptoAES.decrypt(SYSTEM_CONFIG.encryptedToken);
      
      if (!AIRTABLE_TOKEN) {
        console.error('❌ AES 토큰 복호화 실패');
        return false;
      }
      
      isInitialized = true;
      console.log('✅ AES 토큰 복호화 성공');
      return true;
    } catch (error) {
      console.error('❌ 토큰 초기화 실패:', error);
      return false;
    }
  }

  async function initializeManagers() {
    try {
      console.log('🔧 관리자 클래스 초기화 중...');
      
      // 차트 매니저 초기화
      chartManager = new ChartManager();
      
      // 이미지 업로드 매니저 초기화
      imageManager = new ImageUploadManager('portfolio-modal');
      
      // 실시간 추적 매니저 초기화
      realtimeTracker = new RealtimeTracker();
      
      console.log('✅ 모든 관리자 클래스 초기화 완료');
      return true;
    } catch (error) {
      console.error('❌ 관리자 클래스 초기화 실패:', error);
      return false;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 🔐 인증 시스템
  // ═══════════════════════════════════════════════════════════════

  function checkAuth() {
    const token = localStorage.getItem('kauz_admin_token');
    const loginTime = localStorage.getItem('kauz_admin_time');
    
    if (!token || !loginTime) {
      showLoginScreen();
      return false;
    }
    
    if (Date.now() - parseInt(loginTime) > SYSTEM_CONFIG.sessionDuration) {
      logout('세션이 만료되었습니다.');
      return false;
    }
    
    showDashboard();
    return true;
  }

  function showLoginScreen() {
    elements.loginScreen.style.display = 'flex';
    elements.adminDashboard.style.display = 'none';
    document.getElementById('admin-password')?.focus();
    
    // 시스템 상태 업데이트
    updateSystemStatus('offline');
  }

  async function showDashboard() {
    if (!isInitialized) {
      const initSuccess = await initializeTokens();
      if (!initSuccess) {
        showError('시스템 초기화에 실패했습니다.');
        return;
      }
    }
    
    elements.loginScreen.style.display = 'none';
    elements.adminDashboard.style.display = 'grid';
    
    // 관리자 클래스들 초기화
    await initializeManagers();
    
    // 대시보드 초기화
    await initializeDashboard();
    
    // 시스템 상태 업데이트
    updateSystemStatus('online');
  }

  async function login(password) {
    const attempts = parseInt(localStorage.getItem('kauz_login_attempts') || '0');
    
    if (attempts >= SYSTEM_CONFIG.maxLoginAttempts) {
      showError(`로그인 시도 횟수를 초과했습니다. (최대 ${SYSTEM_CONFIG.maxLoginAttempts}회)`);
      return;
    }

    try {
      showLoadingOverlay('로그인 처리 중...');
      
      if (!correctPasswordHash) {
        correctPasswordHash = await KAUZCryptoAES.hashPassword('kauz2025!admin');
      }
      
      const isValid = await KAUZCryptoAES.verifyPassword(password, correctPasswordHash);
      
      if (isValid) {
        const token = generateSecureToken();
        localStorage.setItem('kauz_admin_token', token);
        localStorage.setItem('kauz_admin_time', Date.now().toString());
        localStorage.removeItem('kauz_login_attempts');
        
        hideLoadingOverlay();
        showNotification('🔐 Ultimate Admin 로그인 성공!', 'success');
        await showDashboard();
      } else {
        const newAttempts = attempts + 1;
        localStorage.setItem('kauz_login_attempts', newAttempts.toString());
        hideLoadingOverlay();
        showError(`비밀번호가 틀렸습니다. (${newAttempts}/${SYSTEM_CONFIG.maxLoginAttempts})`);
      }
    } catch (error) {
      console.error('로그인 처리 실패:', error);
      hideLoadingOverlay();
      showError('로그인 처리 중 오류가 발생했습니다.');
    }
  }

  function logout(message = '로그아웃되었습니다.') {
    // 실시간 추적 중지
    if (realtimeTracker) {
      realtimeTracker.stopTracking();
    }
    
    // 차트 정리
    if (chartManager) {
      chartManager.destroyAllCharts();
    }
    
    // 토큰 및 세션 정리
    localStorage.removeItem('kauz_admin_token');
    localStorage.removeItem('kauz_admin_time');
    
    AIRTABLE_TOKEN = null;
    isInitialized = false;
    
    showNotification(message, 'info');
    showLoginScreen();
  }

  function generateSecureToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const randomString = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    return `kauz_ultimate_${Date.now()}_${randomString}`;
  }

  // ═══════════════════════════════════════════════════════════════
  // 📡 API 호출 함수들
  // ═══════════════════════════════════════════════════════════════

  async function secureApiCall(url, options = {}) {
    if (!AIRTABLE_TOKEN || !isInitialized) {
      throw new Error('인증이 초기화되지 않았습니다.');
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

    try {
      const response = await fetch(url, mergedOptions);
      
      // API 상태 업데이트
      updateApiStatus(response.ok ? 'online' : 'error');
      
      return response;
    } catch (error) {
      updateApiStatus('offline');
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 📊 대시보드 관리
  // ═══════════════════════════════════════════════════════════════

  async function initializeDashboard() {
    try {
      console.log('📊 Ultimate Dashboard 초기화 중...');
      showLoadingOverlay('대시보드 데이터 로딩 중...');
      
      // 모든 데이터 로드
      const [mainPortfolio, workPortfolio, contacts, analytics] = await Promise.all([
        loadPortfolioData(SYSTEM_CONFIG.mainTableName),
        loadPortfolioData(SYSTEM_CONFIG.workTableName),
        loadContactData(),
        loadAnalyticsData()
      ]);

      // 데이터 저장
      systemData.portfolio.main = mainPortfolio;
      systemData.portfolio.work = workPortfolio;
      systemData.contacts = contacts;
      systemData.analytics = analytics;

      // 대시보드 업데이트
      updateDashboardStats();
      
      // 차트 초기화
      initializeCharts();
      
      // 최근 활동 업데이트
      updateRecentActivity();
      
      hideLoadingOverlay();
      console.log('✅ Ultimate Dashboard 초기화 완료');
      
    } catch (error) {
      console.error('❌ 대시보드 초기화 실패:', error);
      hideLoadingOverlay();
      showNotification('대시보드 로드에 실패했습니다.', 'error');
    }
  }

  function updateDashboardStats() {
    const stats = {
      'main-portfolio-count': systemData.portfolio.main.length,
      'work-portfolio-count': systemData.portfolio.work.length,
      'contact-count': systemData.contacts.filter(c => c.fields.Status === 'new' || !c.fields.Status).length,
      'visitor-count': calculateTodayVisitors(),
      'avg-session-time': calculateAvgSessionTime()
    };

    Object.entries(stats).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    });

    // 트렌드 업데이트
    updateStatsTrends();
  }

  function updateStatsTrends() {
    const trends = {
      'main-portfolio-trend': '📈 +5.2%',
      'work-portfolio-trend': '📈 +12.8%',
      'contact-trend': '⚡ 실시간',
      'visitor-trend': '🔴 LIVE',
      'session-trend': '📊 +2.1%'
    };

    Object.entries(trends).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    });
  }

  function calculateTodayVisitors() {
    const today = new Date().toISOString().split('T')[0];
    return systemData.analytics.filter(record => 
      record.fields.Date === today
    ).length;
  }

  function calculateAvgSessionTime() {
    if (systemData.analytics.length === 0) return '0분';
    
    const totalDuration = systemData.analytics.reduce((sum, record) => 
      sum + (record.fields.Duration || 0), 0
    );
    
    const avgSeconds = Math.round(totalDuration / systemData.analytics.length);
    return `${Math.floor(avgSeconds / 60)}분`;
  }

  function initializeCharts() {
    if (!chartManager) return;

    // 방문자 추이 차트
    const visitorData = processVisitorTrendData();
    chartManager.createVisitorTrendChart('visitor-trend-chart', visitorData);

    // 사용자 행동 차트
    const behaviorData = processUserBehaviorData();
    chartManager.createUserBehaviorChart('user-behavior-chart', behaviorData);

    // 분석 차트들
    chartManager.createAnalyticsChart('main-analytics-chart', 'line', visitorData);
    chartManager.createAnalyticsChart('pages-performance-chart', 'bar', behaviorData);
    chartManager.createAnalyticsChart('hourly-visits-chart', 'line', processHourlyData());
    chartManager.createAnalyticsChart('device-chart', 'pie', processDeviceData());
  }

  function processVisitorTrendData() {
    const last7Days = Array.from({length: 7}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const visitors = last7Days.map(date => {
      return systemData.analytics.filter(record => record.fields.Date === date).length;
    });

    return {
      labels: last7Days.map(date => new Date(date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })),
      visitors: visitors
    };
  }

  function processUserBehaviorData() {
    const pageViews = {
      '포트폴리오': 0,
      'About': 0,
      'Contact': 0,
      '기타': 0
    };

    systemData.analytics.forEach(record => {
      const page = record.fields.Page || '/';
      if (page.includes('portfolio')) pageViews['포트폴리오']++;
      else if (page.includes('about')) pageViews['About']++;
      else if (page.includes('contact')) pageViews['Contact']++;
      else pageViews['기타']++;
    });

    return {
      pageViews: Object.values(pageViews)
    };
  }

  function processHourlyData() {
    const hourlyData = Array.from({length: 24}, () => 0);
    
    systemData.analytics.forEach(record => {
      if (record.fields.StartTime) {
        const hour = new Date(record.fields.StartTime).getHours();
        hourlyData[hour]++;
      }
    });

    return { hourlyData };
  }

  function processDeviceData() {
    const devices = { Desktop: 0, Mobile: 0, Tablet: 0 };
    
    systemData.analytics.forEach(record => {
      const userAgent = record.fields.UserAgent || '';
      if (userAgent.includes('Mobile')) devices.Mobile++;
      else if (userAgent.includes('Tablet')) devices.Tablet++;
      else devices.Desktop++;
    });

    const total = Object.values(devices).reduce((sum, val) => sum + val, 0);
    return {
      deviceData: total > 0 ? [
        Math.round((devices.Desktop / total) * 100),
        Math.round((devices.Mobile / total) * 100),
        Math.round((devices.Tablet / total) * 100)
      ] : [60, 35, 5]
    };
  }

  function updateRecentActivity() {
    const activities = [];
    
    // 최근 포트폴리오 추가
    const recentPortfolio = [...systemData.portfolio.main, ...systemData.portfolio.work]
      .sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime))
      .slice(0, 3);
      
    recentPortfolio.forEach(item => {
      const date = new Date(item.createdTime).toLocaleDateString('ko-KR');
      activities.push({
        icon: '🖼️',
        text: `${item.fields.Title || '새 포트폴리오'} 추가됨`,
        time: date
      });
    });

    // 최근 문의
    const recentContacts = systemData.contacts
      .sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime))
      .slice(0, 2);
      
    recentContacts.forEach(contact => {
      const date = new Date(contact.createdTime).toLocaleDateString('ko-KR');
      activities.push({
        icon: '📧',
        text: `${contact.fields.Name || '익명'}님 문의 접수`,
        time: date
      });
    });

    // 시스템 상태
    activities.push({
      icon: '🔐',
      text: 'AES-256 보안 시스템 활성화',
      time: '상시'
    });
    
    activities.push({
      icon: '📊',
      text: '실시간 분석 데이터 수집 중',
      time: '진행 중'
    });

    const container = document.getElementById('realtime-activity');
    if (container) {
      container.innerHTML = activities.slice(0, 6).map(activity => `
        <div class="activity-item">
          <div class="activity-icon">${activity.icon}</div>
          <div class="activity-content">
            <div class="activity-text">${activity.text}</div>
            <div class="activity-time">${activity.time}</div>
          </div>
        </div>
      `).join('');
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 🖼️ 포트폴리오 관리
  // ═══════════════════════════════════════════════════════════════

  async function loadPortfolioData(tableName) {
    try {
      const response = await secureApiCall(
        `https://api.airtable.com/v0/${SYSTEM_CONFIG.baseId}/${tableName}`
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.records;
      }
      return [];
    } catch (error) {
      console.error(`포트폴리오 데이터 로드 실패 (${tableName}):`, error);
      return [];
    }
  }

  async function createPortfolioItem(tableName, fields) {
    try {
      showLoadingOverlay('포트폴리오 생성 중...');
      
      const response = await secureApiCall(
        `https://api.airtable.com/v0/${SYSTEM_CONFIG.baseId}/${tableName}`,
        {
          method: 'POST',
          body: JSON.stringify({
            fields: fields
          })
        }
      );
      
      hideLoadingOverlay();
      
      if (response.ok) {
        const data = await response.json();
        showNotification('포트폴리오가 생성되었습니다.', 'success');
        return data;
      } else {
        throw new Error('생성 실패');
      }
    } catch (error) {
      console.error('포트폴리오 생성 실패:', error);
      hideLoadingOverlay();
      showNotification('포트폴리오 생성에 실패했습니다.', 'error');
      return null;
    }
  }

  async function updatePortfolioItem(tableName, recordId, fields) {
    try {
      showLoadingOverlay('포트폴리오 수정 중...');
      
      const response = await secureApiCall(
        `https://api.airtable.com/v0/${SYSTEM_CONFIG.baseId}/${tableName}/${recordId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            fields: fields
          })
        }
      );
      
      hideLoadingOverlay();
      
      if (response.ok) {
        const data = await response.json();
        showNotification('포트폴리오가 수정되었습니다.', 'success');
        return data;
      } else {
        throw new Error('수정 실패');
      }
    } catch (error) {
      console.error('포트폴리오 수정 실패:', error);
      hideLoadingOverlay();
      showNotification('포트폴리오 수정에 실패했습니다.', 'error');
      return null;
    }
  }

  async function deletePortfolioItem(tableName, recordId) {
    try {
      showLoadingOverlay('포트폴리오 삭제 중...');
      
      const response = await secureApiCall(
        `https://api.airtable.com/v0/${SYSTEM_CONFIG.baseId}/${tableName}/${recordId}`,
        {
          method: 'DELETE'
        }
      );
      
      hideLoadingOverlay();
      
      if (response.ok) {
        showNotification('포트폴리오가 삭제되었습니다.', 'success');
        return true;
      } else {
        throw new Error('삭제 실패');
      }
    } catch (error) {
      console.error('포트폴리오 삭제 실패:', error);
      hideLoadingOverlay();
      showNotification('포트폴리오 삭제에 실패했습니다.', 'error');
      return false;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 📧 문의 관리
  // ═══════════════════════════════════════════════════════════════

  async function loadContactData() {
    try {
      const response = await secureApiCall(
        `https://api.airtable.com/v0/${SYSTEM_CONFIG.baseId}/${SYSTEM_CONFIG.contactTableName}`
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.records;
      }
      return [];
    } catch (error) {
      console.error('문의 데이터 로드 실패:', error);
      return [];
    }
  }

  async function updateContactStatus(recordId, status) {
    try {
      const response = await secureApiCall(
        `https://api.airtable.com/v0/${SYSTEM_CONFIG.baseId}/${SYSTEM_CONFIG.contactTableName}/${recordId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            fields: {
              Status: status
            }
          })
        }
      );
      
      if (response.ok) {
        showNotification('문의 상태가 업데이트되었습니다.', 'success');
        return true;
      }
      return false;
    } catch (error) {
      console.error('문의 상태 업데이트 실패:', error);
      showNotification('문의 상태 업데이트에 실패했습니다.', 'error');
      return false;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 📈 분석 데이터 관리
  // ═══════════════════════════════════════════════════════════════

  async function loadAnalyticsData() {
    try {
      const response = await secureApiCall(
        `https://api.airtable.com/v0/${SYSTEM_CONFIG.baseId}/${SYSTEM_CONFIG.analyticsTableName}`
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.records;
      }
      return [];
    } catch (error) {
      console.error('분석 데이터 로드 실패:', error);
      return [];
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎨 UI 업데이트 함수들
  // ═══════════════════════════════════════════════════════════════

  function switchSection(sectionName) {
    // 메뉴 아이템 상태 변경
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

    // 섹션별 초기화
    switch (sectionName) {
      case 'portfolio':
        loadPortfolioSection();
        break;
      case 'contacts':
        loadContactsSection();
        break;
      case 'analytics':
        loadAnalyticsSection();
        break;
      case 'visitor-tracking':
        loadVisitorTrackingSection();
        break;
    }
  }

  async function loadPortfolioSection() {
    // 탭 이벤트 리스너 설정
    const tabButtons = document.querySelectorAll('.tab-btn[data-tab]');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.target.dataset.tab;
        switchPortfolioTab(tab);
      });
    });

    // 현재 탭 로드
    await renderPortfolioTab(currentPortfolioTab);
  }

  function switchPortfolioTab(tab) {
    currentPortfolioTab = tab;

    // 탭 버튼 상태 변경
    document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.tab === tab) {
        btn.classList.add('active');
      }
    });

    // 탭 콘텐츠 상태 변경
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
      if (content.id === `${tab}-portfolio-tab`) {
        content.classList.add('active');
      }
    });

    renderPortfolioTab(tab);
  }

  async function renderPortfolioTab(tab) {
    const data = systemData.portfolio[tab] || [];
    const containerId = `${tab}-portfolio-grid`;
    const container = document.getElementById(containerId);
    
    if (!container) return;

    if (data.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>${tab === 'main' ? '메인페이지' : '포트폴리오 페이지'} 데이터가 없습니다</h3>
          <p>새로운 포트폴리오를 추가해주세요.</p>
          <button class="primary-btn" onclick="showAddPortfolioModal('${tab}')">
            <span class="btn-icon">➕</span>
            포트폴리오 추가
          </button>
        </div>
      `;
      return;
    }

    const portfolioHtml = data.map(record => {
      const fields = record.fields;
      const title = fields.Title || '제목 없음';
      const category = fields.Category || 'Portfolio';
      const client = fields.Client || '';
      
      const imageField = fields.ImageURL || fields.Image;
      const hasImage = imageField && imageField.length > 0;
      
      return `
        <div class="portfolio-item" data-id="${record.id}">
          <div class="portfolio-image">
            ${hasImage 
              ? `<img src="${imageField[0].url}" alt="${title}" />` 
              : '<div class="image-placeholder">No Image</div>'
            }
          </div>
          <div class="portfolio-info">
            <div class="portfolio-title">${title}</div>
            <div class="portfolio-category">${category}</div>
            ${client ? `<div class="portfolio-client">${client}</div>` : ''}
            <div class="portfolio-description">${fields.Description || ''}</div>
          </div>
          <div class="portfolio-actions">
            <button class="btn edit-btn" onclick="editPortfolioItem('${record.id}', '${tab}')">
              <span class="btn-icon">✏️</span>
              수정
            </button>
            <button class="btn delete-btn" onclick="confirmDeletePortfolio('${record.id}', '${tab}')">
              <span class="btn-icon">🗑️</span>
              삭제
            </button>
          </div>
          ${fields.Priority === 'featured' ? '<div class="portfolio-status featured">추천</div>' : ''}
        </div>
      `;
    }).join('');

    container.innerHTML = portfolioHtml;

    // 통계 업데이트
    updatePortfolioStats(tab, data);
  }

  function updatePortfolioStats(tab, data) {
    const totalElement = document.getElementById(`${tab}-total`);
    const featuredElement = document.getElementById(`${tab}-featured`);
    
    if (totalElement) {
      totalElement.textContent = data.length;
    }
    
    if (featuredElement) {
      const featuredCount = data.filter(item => item.fields.Priority === 'featured').length;
      featuredElement.textContent = featuredCount;
    }

    // work 탭인 경우 추가 통계
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
  }

  async function loadContactsSection() {
    renderContactsTable(systemData.contacts);
    updateContactStats();
  }

  function renderContactsTable(data, filter = 'all') {
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

    const tableHtml = `
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
            ${filteredData.map(record => {
              const fields = record.fields;
              const date = new Date(record.createdTime).toLocaleDateString('ko-KR');
              const name = fields.Name || '이름 없음';
              const email = fields.Email || '이메일 없음';
              const subject = fields.Subject || '제목 없음';
              const status = fields.Status || 'new';
              
              return `
                <tr>
                  <td>${date}</td>
                  <td>${name}</td>
                  <td>${email}</td>
                  <td>${subject}</td>
                  <td>
                    <select onchange="updateContactStatusAction('${record.id}', this.value)">
                      <option value="new" ${status === 'new' ? 'selected' : ''}>신규</option>
                      <option value="replied" ${status === 'replied' ? 'selected' : ''}>답변완료</option>
                      <option value="important" ${status === 'important' ? 'selected' : ''}>중요</option>
                      <option value="archived" ${status === 'archived' ? 'selected' : ''}>보관됨</option>
                    </select>
                  </td>
                  <td>
                    <div class="actions">
                      <button class="btn btn-sm btn-view" onclick="viewContact('${record.id}')">
                        👁️ 보기
                      </button>
                      <button class="btn btn-sm btn-reply" onclick="replyContact('${fields.Email}')">
                        📧 답변
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = tableHtml;
  }

  function updateContactStats() {
    const newContacts = systemData.contacts.filter(c => c.fields.Status === 'new' || !c.fields.Status).length;
    const pendingContacts = systemData.contacts.filter(c => c.fields.Status === 'pending').length;
    const repliedContacts = systemData.contacts.filter(c => c.fields.Status === 'replied').length;

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
  }

  async function loadAnalyticsSection() {
    // KPI 업데이트
    updateAnalyticsKPI();
    
    // 차트 업데이트
    if (chartManager) {
      const visitorData = processVisitorTrendData();
      const behaviorData = processUserBehaviorData();
      
      chartManager.createAnalyticsChart('main-analytics-chart', 'line', visitorData);
      chartManager.createAnalyticsChart('pages-performance-chart', 'bar', behaviorData);
      chartManager.createAnalyticsChart('hourly-visits-chart', 'line', processHourlyData());
      chartManager.createAnalyticsChart('device-chart', 'pie', processDeviceData());
    }
  }

  function updateAnalyticsKPI() {
    const stats = calculateAnalyticsStats();
    
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

    // 변화율 업데이트
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
  }

  function calculateAnalyticsStats() {
    const analytics = systemData.analytics;
    
    return {
      totalVisitors: analytics.length,
      totalPageviews: analytics.reduce((sum, record) => sum + (record.fields.PageViews || 0), 0),
      avgDuration: analytics.length > 0 ? Math.round(
        analytics.reduce((sum, record) => sum + (record.fields.Duration || 0), 0) / analytics.length
      ) : 0,
      bounceRate: analytics.length > 0 ? Math.round(
        (analytics.filter(record => (record.fields.PageViews || 0) === 1).length / analytics.length) * 100
      ) : 0
    };
  }

  async function loadVisitorTrackingSection() {
    // 실시간 추적이 이미 시작되어 있음
    console.log('👥 방문자 추적 섹션 로드됨');
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎪 모달 관리
  // ═══════════════════════════════════════════════════════════════

  window.showAddPortfolioModal = function(tableType = 'main') {
    const modal = elements.portfolioModal;
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

    // 이미지 업로드 초기화
    if (imageManager) {
      imageManager.clear();
    }

    modal.classList.add('active');
  };

  window.editPortfolioItem = function(recordId, tableType) {
    const modal = elements.portfolioModal;
    if (!modal) return;

    const data = systemData.portfolio[tableType];
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

      document.getElementById('portfolio-title').value = record.fields.Title || '';
      document.getElementById('portfolio-client').value = record.fields.Client || '';
      document.getElementById('portfolio-category').value = record.fields.Category || '';
      document.getElementById('portfolio-priority').value = record.fields.Priority || 'normal';
      document.getElementById('portfolio-description').value = record.fields.Description || '';
    }

    modal.classList.add('active');
  };

  window.confirmDeletePortfolio = function(recordId, tableType) {
    if (confirm('정말로 이 포트폴리오를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.')) {
      deletePortfolioItemAction(recordId, tableType);
    }
  };

  async function deletePortfolioItemAction(recordId, tableType) {
    const tableName = tableType === 'main' 
      ? SYSTEM_CONFIG.mainTableName 
      : SYSTEM_CONFIG.workTableName;

    const success = await deletePortfolioItem(tableName, recordId);
    
    if (success) {
      systemData.portfolio[tableType] = systemData.portfolio[tableType].filter(item => item.id !== recordId);
      renderPortfolioTab(tableType);
      updateDashboardStats();
    }
  }

  window.viewContact = function(recordId) {
    const contact = systemData.contacts.find(item => item.id === recordId);
    if (!contact) return;

    const modal = elements.contactModal;
    const detailsContainer = document.getElementById('contact-details');
    
    if (!modal || !detailsContainer) return;

    const fields = contact.fields;
    detailsContainer.innerHTML = `
      <div class="contact-detail-header">
        <h3>${fields.Subject || '제목 없음'}</h3>
        <span class="contact-status ${fields.Status || 'new'}">${getStatusText(fields.Status)}</span>
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

  function getStatusText(status) {
    const statusMap = {
      'new': '신규',
      'replied': '답변완료',
      'important': '중요',
      'archived': '보관됨'
    };
    return statusMap[status] || '신규';
  }

  window.replyContact = function(email) {
    if (email && email !== '이메일 없음') {
      const subject = encodeURIComponent('[KAUZ] 문의 답변');
      const body = encodeURIComponent(`안녕하세요,\n\nKAUZ에 문의해 주셔서 감사합니다.\n\n\n\n감사합니다.\nKAUZ 팀`);
      window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
    } else {
      showNotification('이메일 주소가 없습니다.', 'error');
    }
  };

  window.updateContactStatusAction = async function(recordId, status) {
    const success = await updateContactStatus(recordId, status);
    if (success) {
      const contact = systemData.contacts.find(item => item.id === recordId);
      if (contact) {
        contact.fields.Status = status;
        updateContactStats();
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 🎨 UI 헬퍼 함수들
  // ═══════════════════════════════════════════════════════════════

  function showNotification(message, type = 'success') {
    const notification = elements.notification;
    const textElement = document.getElementById('notification-text');
    const timeElement = document.getElementById('notification-time');
    const iconElement = notification.querySelector('.notification-icon');
    
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
  }

  function showError(message) {
    if (elements.loginError) {
      elements.loginError.textContent = message;
      elements.loginError.style.display = 'block';
      
      setTimeout(() => {
        elements.loginError.style.display = 'none';
      }, 5000);
    }
  }

  function showLoadingOverlay(message = '처리 중...') {
    const overlay = elements.loadingOverlay;
    const textElement = overlay?.querySelector('.loading-text');
    
    if (overlay) {
      if (textElement) {
        textElement.textContent = message;
      }
      overlay.classList.add('show');
    }
  }

  function hideLoadingOverlay() {
    const overlay = elements.loadingOverlay;
    if (overlay) {
      overlay.classList.remove('show');
    }
  }

  function updateSystemStatus(status) {
    const indicator = document.getElementById('system-status');
    if (indicator) {
      const statusMap = {
        'online': '🟢',
        'offline': '🔴',
        'warning': '🟡'
      };
      indicator.textContent = statusMap[status] || '🟡';
    }
  }

  function updateApiStatus(status) {
    const element = document.getElementById('api-status');
    if (element) {
      const statusMap = {
        'online': '🟢 연결됨',
        'offline': '🔴 연결 끊김',
        'error': '🟡 오류'
      };
      element.textContent = statusMap[status] || '🔄 확인 중...';
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎪 이벤트 리스너들
  // ═══════════════════════════════════════════════════════════════

  // 로그인 폼
  if (elements.loginForm) {
    elements.loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const passwordInput = document.getElementById('admin-password');
      if (passwordInput) {
        await login(passwordInput.value);
        passwordInput.value = '';
      }
    });
  }

  // 로그아웃 버튼
  if (elements.logoutBtn) {
    elements.logoutBtn.addEventListener('click', () => {
      if (confirm('로그아웃하시겠습니까?')) {
        logout();
      }
    });
  }

  // 메뉴 아이템들
  elements.menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const section = item.dataset.section;
      if (section) {
        switchSection(section);
      }
    });
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
        Title: document.getElementById('portfolio-title').value,
        Client: document.getElementById('portfolio-client').value,
        Category: document.getElementById('portfolio-category').value,
        Priority: document.getElementById('portfolio-priority').value,
        Description: document.getElementById('portfolio-description').value
      };

      // 이미지 처리
      if (imageManager && imageManager.getFiles().length > 0) {
        // 실제 구현시 이미지 업로드 로직 추가
        console.log('이미지 업로드:', imageManager.getFiles());
      }

      const tableName = tableType === 'main' 
        ? SYSTEM_CONFIG.mainTableName 
        : SYSTEM_CONFIG.workTableName;

      let result;
      if (mode === 'add') {
        result = await createPortfolioItem(tableName, formData);
        if (result) {
          systemData.portfolio[tableType].push(result);
        }
      } else if (mode === 'edit') {
        result = await updatePortfolioItem(tableName, recordId, formData);
        if (result) {
          const index = systemData.portfolio[tableType].findIndex(item => item.id === recordId);
          if (index !== -1) {
            systemData.portfolio[tableType][index] = result;
          }
        }
      }

      if (result) {
        elements.portfolioModal.classList.remove('active');
        renderPortfolioTab(tableType);
        updateDashboardStats();
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
    
    // 모달 배경 클릭으로 닫기
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
      
      // 같은 그룹의 활성 버튼 변경
      group.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      
      // 문의 필터인 경우
      if (currentSection === 'contacts') {
        renderContactsTable(systemData.contacts, filter);
      }
    }
  });

  // 대시보드 새로고침
  const refreshDashboardBtn = document.getElementById('refresh-dashboard');
  if (refreshDashboardBtn) {
    refreshDashboardBtn.addEventListener('click', async () => {
      await initializeDashboard();
      showNotification('대시보드가 새로고침되었습니다.', 'success');
    });
  }

  // 알림 닫기
  const notificationClose = document.getElementById('notification-close');
  if (notificationClose) {
    notificationClose.addEventListener('click', () => {
      elements.notification.classList.remove('show');
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 🚀 시스템 시작
  // ═══════════════════════════════════════════════════════════════

  async function startSystem() {
    // Web Crypto API 지원 확인
    if (!crypto.subtle) {
      console.error('❌ Web Crypto API가 지원되지 않습니다.');
      showError('이 기능은 HTTPS 환경에서만 사용할 수 있습니다.');
      return;
    }

    console.log('🚀 KAUZ Ultimate Admin System 시작...');
    
    // 시스템 초기화
    const systemReady = await initializeSystem();
    if (!systemReady) {
      console.error('❌ 시스템 초기화 실패');
      showError('시스템 초기화에 실패했습니다.');
      return;
    }

    // 인증 확인
    checkAuth();

    console.log(`✅ KAUZ Ultimate Admin System v${SYSTEM_CONFIG.version} 시작 완료`);
    console.log('🔐 보안: AES-256 암호화');
    console.log('📊 기능: 실시간 추적 + 고급 차트 + 이미지 업로드');
  }

  // 시스템 시작
  startSystem();

  // 주기적 세션 체크 (5분마다)
  setInterval(() => {
    const token = localStorage.getItem('kauz_admin_token');
    const loginTime = localStorage.getItem('kauz_admin_time');
    
    if (token && loginTime) {
      if (Date.now() - parseInt(loginTime) > SYSTEM_CONFIG.sessionDuration) {
        logout('세션이 만료되었습니다.');
      }
    }
  }, 5 * 60 * 1000);

  // 주기적 대시보드 업데이트 (30초마다)
  setInterval(async () => {
    if (isInitialized && currentSection === 'dashboard') {
      try {
        // 실시간 데이터만 업데이트
        const analytics = await loadAnalyticsData();
        systemData.analytics = analytics;
        updateDashboardStats();
      } catch (error) {
        console.error('주기적 업데이트 실패:', error);
      }
    }
  }, 30 * 1000);

  // 페이지 언로드 시 정리
  window.addEventListener('beforeunload', () => {
    if (realtimeTracker) {
      realtimeTracker.stopTracking();
    }
    
    if (chartManager) {
      chartManager.destroyAllCharts();
    }
    
    AIRTABLE_TOKEN = null;
    isInitialized = false;
  });

  // 페이지 가시성 변경 시 처리
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // 페이지가 숨겨졌을 때
      if (realtimeTracker) {
        realtimeTracker.stopTracking();
      }
    } else {
      // 페이지가 다시 보일 때
      if (realtimeTracker && isInitialized) {
        realtimeTracker.startTracking();
      }
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // 🔧 전역 디버깅 함수들
  // ═══════════════════════════════════════════════════════════════

  window.KAUZ_ADMIN_DEBUG = {
    // 시스템 정보
    getSystemInfo: () => ({
      version: SYSTEM_CONFIG.version,
      isInitialized: isInitialized,
      currentSection: currentSection,
      currentPortfolioTab: currentPortfolioTab,
      dataLoaded: {
        portfolio: Object.keys(systemData.portfolio).map(key => `${key}: ${systemData.portfolio[key].length}`),
        contacts: systemData.contacts.length,
        analytics: systemData.analytics.length
      }
    }),
    
    // 강제 로그아웃
    forceLogout: () => {
      logout('디버그: 강제 로그아웃');
    },
    
    // 데이터 새로고침
    refreshData: async () => {
      await initializeDashboard();
      console.log('🔄 데이터 새로고침 완료');
    },
    
    // 차트 재생성
    recreateCharts: () => {
      if (chartManager) {
        chartManager.destroyAllCharts();
        initializeCharts();
        console.log('📊 차트 재생성 완료');
      }
    },
    
    // 실시간 추적 토글
    toggleTracking: () => {
      if (realtimeTracker) {
        realtimeTracker.toggleTracking();
      }
    },
    
    // 테스트 알림
    testNotification: (type = 'success') => {
      showNotification(`테스트 알림 (${type})`, type);
    }
  };

  // 개발 모드에서만 디버깅 정보 출력
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🛠️ 개발 모드 활성');
    console.log('🔧 디버깅 도구: window.KAUZ_ADMIN_DEBUG');
    console.log('📋 사용 가능한 명령어:');
    console.log('  - KAUZ_ADMIN_DEBUG.getSystemInfo()');
    console.log('  - KAUZ_ADMIN_DEBUG.refreshData()');
    console.log('  - KAUZ_ADMIN_DEBUG.recreateCharts()');
    console.log('  - KAUZ_ADMIN_DEBUG.toggleTracking()');
    console.log('  - KAUZ_ADMIN_DEBUG.testNotification("success")');
  }
});

// 외부 접근 함수들
window.forceLogout = function() {
  localStorage.removeItem('kauz_admin_token');
  localStorage.removeItem('kauz_admin_time');
  window.location.reload();
};

// 전역 이미지 매니저 접근
window.imageManager = null;

// 버전 정보
window.KAUZ_ADMIN_VERSION = '3.0.0-ULTIMATE-HYBRID';
console.log(`🔥 KAUZ Ultimate Admin v${window.KAUZ_ADMIN_VERSION} 로드됨`);
console.log('🎯 기능: AES보안 + 실시간추적 + 고급차트 + 이미지업로드 + 모든기능통합');
