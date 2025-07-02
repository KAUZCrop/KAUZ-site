// ═══════════════════════════════════════════════════════════════
// KAUZ Admin Managers Module v4.2.0
// 🔧 성능관리자, 차트관리자, Formspree관리자 등
// ═══════════════════════════════════════════════════════════════

// 모듈 의존성 체크
if (!window.KAUZ_ADMIN) {
  throw new Error('❌ admin-core.js가 먼저 로드되어야 합니다.');
}

// ═══════════════════════════════════════════════════════════════
// 📦 성능 관리자
// ═══════════════════════════════════════════════════════════════

window.KAUZ_ADMIN.PerformanceManager = class {
  constructor() {
    this.cache = new Map();
    this.loadingStates = new Set();
    this.metrics = { apiCalls: 0, cacheHits: 0, avgResponseTime: 0 };
    
    // 5분마다 캐시 정리
    setInterval(() => this.cleanupCache(), 300000);
  }

  async cachedApiCall(url, options = {}, cacheDuration = 30000) {
    const cacheKey = `${url}_${JSON.stringify(options)}`;
    
    // 캐시 확인
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < cacheDuration) {
        this.metrics.cacheHits++;
        return cached.data;
      } else {
        this.cache.delete(cacheKey);
      }
    }

    // 중복 요청 방지
    if (this.loadingStates.has(cacheKey)) {
      return new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (!this.loadingStates.has(cacheKey)) {
            clearInterval(checkInterval);
            if (this.cache.has(cacheKey)) {
              resolve(this.cache.get(cacheKey).data);
            }
          }
        }, 100);
      });
    }

    this.loadingStates.add(cacheKey);
    
    try {
      const startTime = Date.now();
      const response = await window.KAUZ_ADMIN.secureApiCall(url, options);
      const data = await response.json();
      
      // 캐시 저장
      this.cache.set(cacheKey, { data: data, timestamp: Date.now() });
      this.metrics.apiCalls++;
      this.metrics.avgResponseTime = (this.metrics.avgResponseTime + (Date.now() - startTime)) / 2;
      
      return data;
    } finally {
      this.loadingStates.delete(cacheKey);
    }
  }

  cleanupCache() {
    const now = Date.now();
    let cleaned = 0;
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > 300000) { // 5분 이상된 캐시 삭제
        this.cache.delete(key);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      console.log(`🧹 캐시 정리: ${cleaned}개 항목 삭제`);
    }
  }

  clearCache() {
    this.cache.clear();
    console.log('🧹 전체 캐시 정리 완료');
  }

  getPerformanceReport() {
    return {
      ...this.metrics,
      cacheSize: this.cache.size,
      cacheHitRate: this.metrics.apiCalls > 0 ? 
        `${Math.round((this.metrics.cacheHits / this.metrics.apiCalls) * 100)}%` : '0%'
    };
  }
};

// ═══════════════════════════════════════════════════════════════
// 🔥 데이터 제한 관리자
// ═══════════════════════════════════════════════════════════════

window.KAUZ_ADMIN.DataLimiter = class {
  constructor() {
    this.limits = {
      chartLabels: 12,
      chartData: 12,
      analytics: 50,
      contacts: 30,
      portfolio: 30,
      realtimeData: 10
    };
  }

  enforceLimit(array, limitType) {
    const limit = this.limits[limitType];
    if (!Array.isArray(array)) return [];
    
    if (array.length > limit) {
      const result = array.slice(-limit);
      console.log(`⚡ 데이터 제한 적용: ${array.length} → ${result.length} (${limitType})`);
      return result;
    }
    return array;
  }

  cleanupSystemData(systemData) {
    if (!systemData) return;

    if (systemData.analytics) {
      systemData.analytics = this.enforceLimit(systemData.analytics, 'analytics');
    }
    if (systemData.contacts) {
      systemData.contacts = this.enforceLimit(systemData.contacts, 'contacts');
    }
    if (systemData.portfolio) {
      if (systemData.portfolio.main) {
        systemData.portfolio.main = this.enforceLimit(systemData.portfolio.main, 'portfolio');
      }
      if (systemData.portfolio.work) {
        systemData.portfolio.work = this.enforceLimit(systemData.portfolio.work, 'portfolio');
      }
    }
    console.log('🧹 시스템 데이터 정리 완료');
  }
};

// ═══════════════════════════════════════════════════════════════
// 🔧 방문자 카운트 관리자
// ═══════════════════════════════════════════════════════════════

window.KAUZ_ADMIN.VisitorCountManager = class {
  constructor() {
    this.dailyVisitorCount = 0;
    this.lastResetDate = new Date().toISOString().split('T')[0];
    this.maxDailyIncrement = 100;
    this.recentVisitors = new Set();
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem('kauz_visitor_count');
      if (stored) {
        const data = JSON.parse(stored);
        const today = new Date().toISOString().split('T')[0];
        
        if (data.date === today) {
          this.dailyVisitorCount = Math.min(data.count || 0, this.maxDailyIncrement);
        } else {
          this.dailyVisitorCount = 0;
          this.lastResetDate = today;
          this.saveToStorage();
        }
      }
    } catch (error) {
      console.error('방문자 카운트 로드 실패:', error);
      this.dailyVisitorCount = 0;
    }
  }

  saveToStorage() {
    try {
      const data = { count: this.dailyVisitorCount, date: this.lastResetDate };
      localStorage.setItem('kauz_visitor_count', JSON.stringify(data));
    } catch (error) {
      console.error('방문자 카운트 저장 실패:', error);
    }
  }

  incrementVisitor(sessionId = null) {
    const today = new Date().toISOString().split('T')[0];
    
    if (today !== this.lastResetDate) {
      this.dailyVisitorCount = 0;
      this.lastResetDate = today;
      this.recentVisitors.clear();
    }

    if (sessionId && this.recentVisitors.has(sessionId)) {
      return this.dailyVisitorCount;
    }

    if (this.dailyVisitorCount >= this.maxDailyIncrement) {
      console.log('⚠️ 일일 최대 방문자 수 도달');
      return this.dailyVisitorCount;
    }

    this.dailyVisitorCount++;
    
    if (sessionId) {
      this.recentVisitors.add(sessionId);
      if (this.recentVisitors.size > 1000) {
        const oldestEntries = Array.from(this.recentVisitors).slice(0, 500);
        oldestEntries.forEach(entry => this.recentVisitors.delete(entry));
      }
    }

    this.saveToStorage();
    return this.dailyVisitorCount;
  }

  getTodayVisitors() {
    const today = new Date().toISOString().split('T')[0];
    if (today !== this.lastResetDate) {
      return 0;
    }
    return this.dailyVisitorCount;
  }

  setVisitorCount(count) {
    this.dailyVisitorCount = Math.min(Math.max(count, 0), this.maxDailyIncrement);
    this.saveToStorage();
    return this.dailyVisitorCount;
  }
};

// ═══════════════════════════════════════════════════════════════
// 🚀 Google Charts 관리자
// ═══════════════════════════════════════════════════════════════

window.KAUZ_ADMIN.GoogleChartsManager = class {
  constructor() {
    this.charts = {};
    this.dataLimiter = new window.KAUZ_ADMIN.DataLimiter();
    this.lastUpdateTime = {};
    this.updateInterval = 30000;
    this.isGoogleChartsLoaded = false;
    this.loadGoogleCharts();
  }

  async loadGoogleCharts() {
    return new Promise((resolve) => {
      if (typeof google !== 'undefined' && google.charts) {
        google.charts.load('current', {
          packages: ['corechart', 'line', 'bar'],
          callback: () => {
            this.isGoogleChartsLoaded = true;
            console.log('✅ Google Charts 로드 완료');
            resolve();
          }
        });
      } else {
        // Google Charts 라이브러리가 없으면 스크립트 로드
        const script = document.createElement('script');
        script.src = 'https://www.gstatic.com/charts/loader.js';
        script.onload = () => {
          setTimeout(() => this.loadGoogleCharts().then(resolve), 100);
        };
        document.head.appendChild(script);
      }
    });
  }

  shouldUpdateChart(chartId) {
    const now = Date.now();
    const lastUpdate = this.lastUpdateTime[chartId] || 0;
    return (now - lastUpdate) > this.updateInterval;
  }

  drawChart(chartId, chartType, data, options) {
    if (!this.isGoogleChartsLoaded) {
      console.log('⏳ Google Charts 로딩 중...');
      return;
    }

    const container = document.getElementById(chartId);
    if (!container) {
      console.error(`❌ 차트 컨테이너를 찾을 수 없음: ${chartId}`);
      return;
    }

    try {
      let chart;
      
      switch(chartType) {
        case 'LineChart':
          chart = new google.visualization.LineChart(container);
          break;
        case 'ColumnChart':
          chart = new google.visualization.ColumnChart(container);
          break;
        case 'PieChart':
          chart = new google.visualization.PieChart(container);
          break;
        case 'AreaChart':
          chart = new google.visualization.AreaChart(container);
          break;
        default:
          chart = new google.visualization.LineChart(container);
      }

      chart.draw(data, options);
      this.charts[chartId] = chart;
      this.lastUpdateTime[chartId] = Date.now();
      
      console.log(`📊 Google Charts 차트 생성 완료: ${chartId}`);
      
    } catch (error) {
      console.error(`❌ 차트 생성 실패 (${chartId}):`, error);
    }
  }

  createVisitorTrendChart(chartId, data) {
    if (!this.shouldUpdateChart(chartId)) return;

    const chartData = new google.visualization.DataTable();
    chartData.addColumn('string', '시간');
    chartData.addColumn('number', '방문자');

    const limitedData = this.dataLimiter.enforceLimit(data.visitors || [], 'chartData');
    const labels = this.generateTimeLabels(limitedData.length);
    
    const rows = labels.map((label, index) => [label, limitedData[index] || 0]);
    chartData.addRows(rows);

    const options = {
      title: '실시간 방문자 추이',
      backgroundColor: 'transparent',
      titleTextStyle: { color: '#E37031', fontSize: 16 },
      hAxis: { textStyle: { color: '#cccccc' }, gridlines: { color: '#333333' } },
      vAxis: { textStyle: { color: '#cccccc' }, gridlines: { color: '#333333' } },
      legend: { textStyle: { color: '#cccccc' } },
      colors: ['#E37031'],
      lineWidth: 3,
      pointSize: 0,
      areaOpacity: 0.1
    };

    this.drawChart(chartId, 'AreaChart', chartData, options);
  }

  createUserBehaviorChart(chartId, data) {
    if (!this.shouldUpdateChart(chartId)) return;

    const chartData = new google.visualization.DataTable();
    chartData.addColumn('string', '페이지');
    chartData.addColumn('number', '방문수');

    const pageViews = data.pageViews || [0, 0, 0, 0];
    const pages = ['포트폴리오', 'About', 'Contact', '기타'];
    
    const rows = pages.map((page, index) => [page, pageViews[index] || 0]);
    chartData.addRows(rows);

    const options = {
      title: '방문자 행동 분석',
      backgroundColor: 'transparent',
      titleTextStyle: { color: '#E37031', fontSize: 16 },
      legend: { textStyle: { color: '#cccccc' }, position: 'bottom' },
      colors: ['#E37031', '#28a745', '#17a2b8', '#ffc107'],
      pieSliceText: 'percentage',
      pieSliceTextStyle: { color: '#ffffff', fontSize: 12 }
    };

    this.drawChart(chartId, 'PieChart', chartData, options);
  }

  generateTimeLabels(count) {
    const labels = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - (i * 60 * 60 * 1000));
      labels.push(time.getHours() + ':00');
    }
    return labels;
  }

  generateDateLabels(count) {
    const labels = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
    }
    return labels;
  }

  destroyAllCharts() {
    this.charts = {};
    this.lastUpdateTime = {};
    console.log('🗑️ Google Charts 정리 완료');
  }

  cleanup() {
    console.log('🧹 Google Charts 자동 정리');
  }
};

// ═══════════════════════════════════════════════════════════════
// 📧 Formspree Contact Form 관리자
// ═══════════════════════════════════════════════════════════════

window.KAUZ_ADMIN.FormspreeManager = class {
  constructor() {
    this.formspreeUrl = 'https://formspree.io/f/mkgrljlv';
    this.isInitialized = false;
    this.retryCount = 0;
    this.maxRetries = 5;
    this.init();
  }

  init() {
    this.initializeForm();
    
    // 재시도 간격
    const retryIntervals = [1000, 2000, 3000, 5000, 10000];
    retryIntervals.forEach((delay, index) => {
      setTimeout(() => {
        if (!this.isInitialized && this.retryCount < this.maxRetries) {
          this.initializeForm();
        }
      }, delay);
    });
  }

  initializeForm() {
    const selectors = [
      '#contact-form',
      '.contact-form',
      'form[action*="contact"]',
      'form[name="contact"]',
      'form[data-contact="true"]'
    ];

    let contactForm = null;
    for (const selector of selectors) {
      contactForm = document.querySelector(selector);
      if (contactForm) break;
    }

    if (!contactForm) {
      this.retryCount++;
      console.log(`📧 Contact form 찾기 실패 (${this.retryCount}/${this.maxRetries})`);
      return;
    }

    if (contactForm.dataset.formspreeInitialized === 'true') {
      this.isInitialized = true;
      return;
    }

    try {
      contactForm.action = this.formspreeUrl;
      contactForm.method = 'POST';
      contactForm.dataset.formspreeInitialized = 'true';

      // 기존 이벤트 리스너 제거를 위해 클론
      const newForm = contactForm.cloneNode(true);
      contactForm.parentNode.replaceChild(newForm, contactForm);
      contactForm = newForm;

      contactForm.addEventListener('submit', this.handleSubmit.bind(this));

      this.isInitialized = true;
      console.log('✅ Formspree Contact Form 연동 완료');
      
      // 알림 표시 (UI 모듈이 로드된 후에)
      if (window.KAUZ_ADMIN.showNotification) {
        window.KAUZ_ADMIN.showNotification('📧 Contact Form이 Formspree로 연동되었습니다!', 'success');
      }

    } catch (error) {
      console.error('📧 Contact Form 초기화 실패:', error);
      this.retryCount++;
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]') || form.querySelector('input[type="submit"]');
    const originalText = submitButton?.textContent || submitButton?.value || '전송';
    
    try {
      // 버튼 상태 변경
      if (submitButton) {
        submitButton.disabled = true;
        if (submitButton.textContent !== undefined) {
          submitButton.textContent = '전송 중...';
        } else {
          submitButton.value = '전송 중...';
        }
      }
      
      const formData = new FormData(form);
      
      // 폼 검증
      const validation = this.validateForm(formData);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }
      
      // Formspree로 전송
      const response = await fetch(this.formspreeUrl, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        if (window.KAUZ_ADMIN.showNotification) {
          window.KAUZ_ADMIN.showNotification('✅ 문의가 성공적으로 전송되었습니다!', 'success');
        }
        form.reset();
        await this.saveToAirtable(formData);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || '전송 실패');
      }
      
    } catch (error) {
      console.error('Contact form submission error:', error);
      if (window.KAUZ_ADMIN.showNotification) {
        window.KAUZ_ADMIN.showNotification(`❌ 문의 전송에 실패했습니다: ${error.message}`, 'error');
      }
    } finally {
      // 버튼 상태 복원
      if (submitButton) {
        submitButton.disabled = false;
        if (submitButton.textContent !== undefined) {
          submitButton.textContent = originalText;
        } else {
          submitButton.value = originalText;
        }
      }
    }
  }

  validateForm(formData) {
    const name = formData.get('name') || formData.get('이름') || '';
    const email = formData.get('email') || formData.get('이메일') || '';
    const message = formData.get('message') || formData.get('내용') || formData.get('msg') || '';

    if (!name.trim()) {
      return { isValid: false, message: '이름을 입력해주세요.' };
    }

    if (!email.trim()) {
      return { isValid: false, message: '이메일을 입력해주세요.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, message: '올바른 이메일 형식을 입력해주세요.' };
    }

    if (!message.trim()) {
      return { isValid: false, message: '메시지를 입력해주세요.' };
    }

    return { isValid: true };
  }

  async saveToAirtable(formData) {
    if (!window.KAUZ_ADMIN.STATE.AIRTABLE_TOKEN || !window.KAUZ_ADMIN.STATE.isInitialized) {
      console.log('Airtable 저장 스킵 - 토큰 없음');
      return;
    }

    try {
      const contactData = {
        Name: formData.get('name') || formData.get('이름') || '',
        Email: formData.get('email') || formData.get('이메일') || '',
        Subject: formData.get('subject') || formData.get('제목') || '웹사이트 문의',
        Message: formData.get('message') || formData.get('내용') || formData.get('msg') || '',
        Status: 'new',
        Source: 'Formspree + Website'
      };

      const response = await window.KAUZ_ADMIN.secureApiCall(
        `https://api.airtable.com/v0/${window.KAUZ_ADMIN.CONFIG.baseId}/${window.KAUZ_ADMIN.CONFIG.contactTableName}`,
        {
          method: 'POST',
          body: JSON.stringify({ fields: contactData })
        }
      );

      if (response.ok) {
        console.log('✅ Contact also saved to Airtable for admin tracking');
        const newContact = await response.json();
        window.KAUZ_ADMIN.DATA.contacts.unshift(newContact);
        
        // 데이터 제한 적용
        if (window.KAUZ_ADMIN.managers && window.KAUZ_ADMIN.managers.dataLimiter) {
          window.KAUZ_ADMIN.DATA.contacts = window.KAUZ_ADMIN.managers.dataLimiter.enforceLimit(
            window.KAUZ_ADMIN.DATA.contacts, 
            'contacts'
          );
        }
        
        // 대시보드 업데이트
        if (window.KAUZ_ADMIN.updateDashboardStats) {
          window.KAUZ_ADMIN.updateDashboardStats();
        }
      }
      
    } catch (error) {
      console.log('Airtable 저장 실패 (Formspree는 성공):', error);
    }
  }

  reinitialize() {
    this.isInitialized = false;
    this.retryCount = 0;
    this.init();
  }
};

// ═══════════════════════════════════════════════════════════════
// 📊 실시간 추적 관리자
// ═══════════════════════════════════════════════════════════════

window.KAUZ_ADMIN.RealtimeTracker = class {
  constructor() {
    this.isActive = true;
    this.updateInterval = 30000;
    this.intervalId = null;
    this.isVisible = true;
    this.dataLimiter = new window.KAUZ_ADMIN.DataLimiter();
    this.realtimeDataStore = [];
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.pageViews = 0;
    this.maxSessionDuration = 30 * 60 * 1000; // 30분
    
    document.addEventListener('visibilitychange', () => {
      this.isVisible = !document.hidden;
      if (this.isVisible && this.isActive) {
        this.quickUpdate();
      }
    });
    
    this.init();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  init() {
    this.startTracking();
    this.setupEventListeners();
  }

  startTracking() {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      if (this.isActive && this.isVisible) {
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
    if (!this.isVisible) return;
    
    if (Date.now() - this.startTime > this.maxSessionDuration) {
      console.log('⏰ 최대 세션 시간 도달 - 추적 중지');
      this.stopTracking();
      return;
    }
    
    try {
      if (!window.KAUZ_ADMIN.managers || !window.KAUZ_ADMIN.managers.performanceManager) {
        return;
      }

      const data = await window.KAUZ_ADMIN.managers.performanceManager.cachedApiCall(
        `https://api.airtable.com/v0/${window.KAUZ_ADMIN.CONFIG.baseId}/${window.KAUZ_ADMIN.CONFIG.analyticsTableName}?maxRecords=10&filterByFormula=DATETIME_DIFF(NOW(),{Created},'minutes')<2`,
        {},
        15000
      );

      if (data.records && data.records.length > 0) {
        this.realtimeDataStore = this.dataLimiter.enforceLimit(
          [...data.records].slice(0, 5),
          'realtimeData'
        );
        
        this.processRealtimeData(this.realtimeDataStore);
      }
    } catch (error) {
      console.error('실시간 데이터 가져오기 실패:', error);
    }
  }

  processRealtimeData(records) {
    const now = Date.now();
    const twoMinutesAgo = now - (2 * 60 * 1000);
    
    const recentVisitors = records.filter(record => {
      const recordTime = new Date(record.createdTime).getTime();
      return recordTime > twoMinutesAgo;
    }).slice(0, 5);

    const metrics = {
      liveVisitors: Math.min(recentVisitors.length, 5),
      liveClicks: this.calculateRecentClicks(recentVisitors),
      livePageviews: this.calculateRecentPageviews(recentVisitors),
      avgTimeOnPage: this.calculateAvgTimeOnPage(recentVisitors)
    };

    this.updateRealtimeMetrics(metrics);
    this.updateVisitorsList(recentVisitors.slice(0, 3));
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
    requestAnimationFrame(() => {
      const elements = {
        'live-visitors': metrics.liveVisitors,
        'live-clicks': metrics.liveClicks,
        'live-pageviews': metrics.livePageviews,
        'avg-time-on-page': `${metrics.avgTimeOnPage}s`
      };

      Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element && element.textContent !== value.toString()) {
          element.textContent = value;
        }
      });
    });
  }

  updateVisitorsList(visitors) {
    const container = document.getElementById('realtime-visitors-list');
    if (!container) return;

    if (visitors.length === 0) {
      container.innerHTML = '<div class="no-visitors">현재 활성 방문자가 없습니다.</div>';
      return;
    }

    const fragment = document.createDocumentFragment();
    
    visitors.forEach(visitor => {
      const fields = visitor.fields;
      const duration = Math.round((Date.now() - new Date(visitor.createdTime).getTime()) / 1000);
      
      const visitorElement = document.createElement('div');
      visitorElement.className = 'visitor-item';
      visitorElement.innerHTML = `
        <div class="visitor-info">
          <div class="visitor-page">${fields.Page || '/'}</div>
          <div class="visitor-time">${duration}초 전</div>
        </div>
        <div class="visitor-duration">${fields.Duration || 0}s</div>
      `;
      
      fragment.appendChild(visitorElement);
    });

    container.innerHTML = '';
    container.appendChild(fragment);
  }

  setupEventListeners() {
    const toggleButton = document.getElementById('toggle-tracking');
    if (toggleButton) {
      toggleButton.addEventListener('click', () => this.toggleTracking());
    }
  }

  quickUpdate() {
    this.fetchRealtimeData();
  }

  trackPageView() {
    this.pageViews++;
    
    if (window.KAUZ_ADMIN.managers && window.KAUZ_ADMIN.managers.visitorCountManager) {
      window.KAUZ_ADMIN.managers.visitorCountManager.incrementVisitor(this.sessionId);
    }
    
    if (this.pageViews > 50) {
      console.log('⚠️ 과도한 페이지뷰 감지 - 추적 제한');
      this.stopTracking();
    }
  }

  cleanup() {
    this.realtimeDataStore = this.dataLimiter.enforceLimit(this.realtimeDataStore, 'realtimeData');
  }
};

// ═══════════════════════════════════════════════════════════════
// 🎉 Managers 모듈 로드 완료
// ═══════════════════════════════════════════════════════════════

console.log('✅ KAUZ Admin Managers Module 로드 완료');
console.log('🔧 모든 관리자 클래스 준비 완료');
console.log('📋 다음 모듈: admin-data.js 로드 필요');

// 관리자 인스턴스 저장소 초기화
window.KAUZ_ADMIN.managers = {
  performanceManager: null,
  dataLimiter: null,
  visitorCountManager: null,
  chartManager: null,
  formspreeManager: null,
  realtimeTracker: null
};
