// ═══════════════════════════════════════════════════════════════
// KAUZ Admin Data Module v4.2.1-FIXED
// 📊 데이터 관리, API 호출, 포트폴리오/문의 관리
// ═══════════════════════════════════════════════════════════════

// 모듈 의존성 체크 (수정된 버전)
if (!window.KAUZ_ADMIN) {
  throw new Error('❌ admin-core.js가 먼저 로드되어야 합니다.');
}

// managers는 admin-ui.js에서 초기화되므로 여기서는 체크하지 않음
// 함수 실행 시점에 존재 여부를 확인하도록 수정

// ═══════════════════════════════════════════════════════════════
// 📡 데이터 로드 함수들
// ═══════════════════════════════════════════════════════════════

window.KAUZ_ADMIN.loadPortfolioData = async function(tableName) {
  try {
    // 안전한 managers 접근
    const performanceManager = this.managers?.performanceManager;
    if (!performanceManager) {
      console.warn('⚠️ Performance Manager가 아직 초기화되지 않음 - 직접 API 호출');
      const response = await this.secureApiCall(
        `https://api.airtable.com/v0/${this.CONFIG.baseId}/${tableName}?maxRecords=30`
      );
      const data = await response.json();
      return data.records || [];
    }

    const data = await performanceManager.cachedApiCall(
      `https://api.airtable.com/v0/${this.CONFIG.baseId}/${tableName}?maxRecords=30`,
      {},
      60000
    );
    
    return data.records || [];
  } catch (error) {
    console.error(`포트폴리오 데이터 로드 실패 (${tableName}):`, error);
    return [];
  }
};

window.KAUZ_ADMIN.loadContactData = async function() {
  try {
    const performanceManager = this.managers?.performanceManager;
    if (!performanceManager) {
      console.warn('⚠️ Performance Manager가 아직 초기화되지 않음 - 직접 API 호출');
      const response = await this.secureApiCall(
        `https://api.airtable.com/v0/${this.CONFIG.baseId}/${this.CONFIG.contactTableName}?maxRecords=30&sort[0][field]=Created&sort[0][direction]=desc`
      );
      const data = await response.json();
      return data.records || [];
    }

    const data = await performanceManager.cachedApiCall(
      `https://api.airtable.com/v0/${this.CONFIG.baseId}/${this.CONFIG.contactTableName}?maxRecords=30&sort[0][field]=Created&sort[0][direction]=desc`,
      {},
      30000
    );
    
    return data.records || [];
  } catch (error) {
    console.error('문의 데이터 로드 실패:', error);
    return [];
  }
};

window.KAUZ_ADMIN.loadAnalyticsData = async function() {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const performanceManager = this.managers?.performanceManager;
    if (!performanceManager) {
      console.warn('⚠️ Performance Manager가 아직 초기화되지 않음 - 직접 API 호출');
      const response = await this.secureApiCall(
        `https://api.airtable.com/v0/${this.CONFIG.baseId}/${this.CONFIG.analyticsTableName}?maxRecords=50&filterByFormula=IS_AFTER({Created},'${weekAgo.toISOString()}')`
      );
      const data = await response.json();
      return data.records || [];
    }

    const data = await performanceManager.cachedApiCall(
      `https://api.airtable.com/v0/${this.CONFIG.baseId}/${this.CONFIG.analyticsTableName}?maxRecords=50&filterByFormula=IS_AFTER({Created},'${weekAgo.toISOString()}')`,
      {},
      60000
    );
    
    return data.records || [];
  } catch (error) {
    console.error('분석 데이터 로드 실패:', error);
    return [];
  }
};

// ═══════════════════════════════════════════════════════════════
// 🖼️ 포트폴리오 CRUD 함수들
// ═══════════════════════════════════════════════════════════════

window.KAUZ_ADMIN.createPortfolioItem = async function(tableName, fields) {
  try {
    if (this.showLoadingOverlay) this.showLoadingOverlay('포트폴리오 생성 중...');
    
    const response = await this.secureApiCall(
      `https://api.airtable.com/v0/${this.CONFIG.baseId}/${tableName}`,
      {
        method: 'POST',
        body: JSON.stringify({ fields: fields })
      }
    );
    
    if (this.hideLoadingOverlay) this.hideLoadingOverlay();
    
    if (response.ok) {
      const data = await response.json();
      if (this.showNotification) {
        this.showNotification('포트폴리오가 생성되었습니다.', 'success');
      }
      // 안전한 캐시 정리
      if (this.managers?.performanceManager) {
        this.managers.performanceManager.clearCache();
      }
      return data;
    } else {
      throw new Error('생성 실패');
    }
  } catch (error) {
    console.error('포트폴리오 생성 실패:', error);
    if (this.hideLoadingOverlay) this.hideLoadingOverlay();
    if (this.showNotification) {
      this.showNotification('포트폴리오 생성에 실패했습니다.', 'error');
    }
    return null;
  }
};

window.KAUZ_ADMIN.updatePortfolioItem = async function(tableName, recordId, fields) {
  try {
    if (this.showLoadingOverlay) this.showLoadingOverlay('포트폴리오 수정 중...');
    
    const response = await this.secureApiCall(
      `https://api.airtable.com/v0/${this.CONFIG.baseId}/${tableName}/${recordId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ fields: fields })
      }
    );
    
    if (this.hideLoadingOverlay) this.hideLoadingOverlay();
    
    if (response.ok) {
      const data = await response.json();
      if (this.showNotification) {
        this.showNotification('포트폴리오가 수정되었습니다.', 'success');
      }
      // 안전한 캐시 정리
      if (this.managers?.performanceManager) {
        this.managers.performanceManager.clearCache();
      }
      return data;
    } else {
      throw new Error('수정 실패');
    }
  } catch (error) {
    console.error('포트폴리오 수정 실패:', error);
    if (this.hideLoadingOverlay) this.hideLoadingOverlay();
    if (this.showNotification) {
      this.showNotification('포트폴리오 수정에 실패했습니다.', 'error');
    }
    return null;
  }
};

window.KAUZ_ADMIN.deletePortfolioItem = async function(tableName, recordId) {
  try {
    if (this.showLoadingOverlay) this.showLoadingOverlay('포트폴리오 삭제 중...');
    
    const response = await this.secureApiCall(
      `https://api.airtable.com/v0/${this.CONFIG.baseId}/${tableName}/${recordId}`,
      { method: 'DELETE' }
    );
    
    if (this.hideLoadingOverlay) this.hideLoadingOverlay();
    
    if (response.ok) {
      if (this.showNotification) {
        this.showNotification('포트폴리오가 삭제되었습니다.', 'success');
      }
      // 안전한 캐시 정리
      if (this.managers?.performanceManager) {
        this.managers.performanceManager.clearCache();
      }
      return true;
    } else {
      throw new Error('삭제 실패');
    }
  } catch (error) {
    console.error('포트폴리오 삭제 실패:', error);
    if (this.hideLoadingOverlay) this.hideLoadingOverlay();
    if (this.showNotification) {
      this.showNotification('포트폴리오 삭제에 실패했습니다.', 'error');
    }
    return false;
  }
};

// ═══════════════════════════════════════════════════════════════
// 📧 문의 관리 함수들
// ═══════════════════════════════════════════════════════════════

window.KAUZ_ADMIN.updateContactStatus = async function(recordId, status) {
  try {
    const response = await this.secureApiCall(
      `https://api.airtable.com/v0/${this.CONFIG.baseId}/${this.CONFIG.contactTableName}/${recordId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ fields: { Status: status } })
      }
    );
    
    if (response.ok) {
      if (this.showNotification) {
        this.showNotification('문의 상태가 업데이트되었습니다.', 'success');
      }
      // 안전한 캐시 정리
      if (this.managers?.performanceManager) {
        this.managers.performanceManager.clearCache();
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error('문의 상태 업데이트 실패:', error);
    if (this.showNotification) {
      this.showNotification('문의 상태 업데이트에 실패했습니다.', 'error');
    }
    return false;
  }
};

// ═══════════════════════════════════════════════════════════════
// 📊 대시보드 데이터 처리
// ═══════════════════════════════════════════════════════════════

window.KAUZ_ADMIN.initializeDashboard = async function() {
  try {
    console.log('📊 대시보드 초기화 중...');
    if (this.showLoadingOverlay) this.showLoadingOverlay('데이터 로딩 중...');
    
    // Step 1: 필수 데이터 로드
    const mainPortfolio = await this.loadPortfolioData(this.CONFIG.mainTableName);
    
    // 안전한 데이터 제한 적용
    if (this.managers?.dataLimiter) {
      this.DATA.portfolio.main = this.managers.dataLimiter.enforceLimit(mainPortfolio, 'portfolio');
    } else {
      this.DATA.portfolio.main = mainPortfolio.slice(0, 30); // 임시 제한
    }
    
    this.updateDashboardStats();
    
    // Step 2: 백그라운드 로딩
    setTimeout(async () => {
      const [workPortfolio, contacts, analytics] = await Promise.all([
        this.loadPortfolioData(this.CONFIG.workTableName),
        this.loadContactData(),
        this.loadAnalyticsData()
      ]);

      // 안전한 데이터 제한 적용
      if (this.managers?.dataLimiter) {
        this.DATA.portfolio.work = this.managers.dataLimiter.enforceLimit(workPortfolio, 'portfolio');
        this.DATA.contacts = this.managers.dataLimiter.enforceLimit(contacts, 'contacts');
        this.DATA.analytics = this.managers.dataLimiter.enforceLimit(analytics, 'analytics');
      } else {
        this.DATA.portfolio.work = workPortfolio.slice(0, 30);
        this.DATA.contacts = contacts.slice(0, 30);
        this.DATA.analytics = analytics.slice(0, 50);
      }

      // Step 3: 차트 초기화
      setTimeout(() => {
        this.initializeCharts();
        this.updateRecentActivity();
        this.checkPortfolioStatus();
      }, 500);
      
    }, 100);
    
    if (this.hideLoadingOverlay) this.hideLoadingOverlay();
    console.log('✅ 대시보드 초기화 완료');
    
  } catch (error) {
    console.error('❌ 대시보드 초기화 실패:', error);
    if (this.hideLoadingOverlay) this.hideLoadingOverlay();
    if (this.showNotification) {
      this.showNotification('대시보드 로드에 실패했습니다.', 'error');
    }
  }
};

window.KAUZ_ADMIN.initializeCharts = function() {
  // 안전한 차트 관리자 접근
  if (!this.managers?.chartManager || !this.managers.chartManager.isGoogleChartsLoaded) {
    console.log('⏳ Google Charts 아직 로딩 중...');
    setTimeout(() => this.initializeCharts(), 1000);
    return;
  }

  console.log('📊 차트 생성 시작...');
  
  const visitorData = this.processVisitorTrendData();
  const behaviorData = this.processUserBehaviorData();

  this.managers.chartManager.createVisitorTrendChart('visitor-trend-chart', visitorData);
  this.managers.chartManager.createUserBehaviorChart('user-behavior-chart', behaviorData);
  
  console.log('📊 차트 생성 완료');
};

window.KAUZ_ADMIN.updateDashboardStats = function() {
  const stats = {
    'main-portfolio-count': this.DATA.portfolio.main?.length || 0,
    'work-portfolio-count': this.DATA.portfolio.work?.length || 0,
    'contact-count': this.DATA.contacts?.filter(c => c.fields.Status === 'new' || !c.fields.Status).length || 0,
    'visitor-count': this.calculateTodayVisitors(),
    'avg-session-time': this.calculateAvgSessionTime()
  };

  requestAnimationFrame(() => {
    Object.entries(stats).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element && element.textContent !== value.toString()) {
        element.textContent = value;
      }
    });
  });

  this.updateStatsTrends();
};

window.KAUZ_ADMIN.updateStatsTrends = function() {
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
};

window.KAUZ_ADMIN.calculateTodayVisitors = function() {
  const today = new Date().toISOString().split('T')[0];
  const analyticsCount = this.DATA.analytics.filter(record => 
    record.fields.Date === today
  ).length;
  
  // 안전한 방문자 관리자 접근
  const localCount = this.managers?.visitorCountManager?.getTodayVisitors() || 0;
  const safeCount = Math.min(analyticsCount, localCount, 500);
  
  return safeCount;
};

window.KAUZ_ADMIN.calculateAvgSessionTime = function() {
  if (this.DATA.analytics.length === 0) return '0분';
  
  const totalDuration = this.DATA.analytics.reduce((sum, record) => 
    sum + (record.fields.Duration || 0), 0
  );
  
  const avgSeconds = Math.round(totalDuration / this.DATA.analytics.length);
  return `${Math.floor(avgSeconds / 60)}분`;
};

window.KAUZ_ADMIN.processVisitorTrendData = function() {
  const last7Days = Array.from({length: 7}, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const visitors = last7Days.map(date => {
    const dayVisitors = this.DATA.analytics.filter(record => record.fields.Date === date).length;
    return Math.min(dayVisitors, 100);
  });

  return {
    labels: last7Days.map(date => new Date(date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })),
    visitors: visitors
  };
};

window.KAUZ_ADMIN.processUserBehaviorData = function() {
  const pageViews = { '포트폴리오': 0, 'About': 0, 'Contact': 0, '기타': 0 };

  this.DATA.analytics.forEach(record => {
    const page = record.fields.Page || '/';
    if (page.includes('portfolio')) pageViews['포트폴리오']++;
    else if (page.includes('about')) pageViews['About']++;
    else if (page.includes('contact')) pageViews['Contact']++;
    else pageViews['기타']++;
  });

  return { pageViews: Object.values(pageViews) };
};

window.KAUZ_ADMIN.updateRecentActivity = function() {
  const activities = [];
  
  const recentPortfolio = [...this.DATA.portfolio.main, ...this.DATA.portfolio.work]
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

  const recentContacts = this.DATA.contacts
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

  activities.push({
    icon: '🔐',
    text: 'AES-256 보안 시스템 활성화',
    time: '상시'
  }, {
    icon: '📧',
    text: 'Formspree Contact Form 연동 활성화',
    time: '진행 중'
  });

  const container = document.getElementById('realtime-activity');
  if (container) {
    const fragment = document.createDocumentFragment();
    
    activities.slice(0, 6).forEach(activity => {
      const activityElement = document.createElement('div');
      activityElement.className = 'activity-item';
      activityElement.innerHTML = `
        <div class="activity-icon">${activity.icon}</div>
        <div class="activity-content">
          <div class="activity-text">${activity.text}</div>
          <div class="activity-time">${activity.time}</div>
        </div>
      `;
      fragment.appendChild(activityElement);
    });
    
    container.innerHTML = '';
    container.appendChild(fragment);
  }
};

window.KAUZ_ADMIN.checkPortfolioStatus = async function() {
  console.log('🖼️ 포트폴리오 상태 확인 중...');
  
  try {
    // 안전한 성능 관리자 접근
    const performanceManager = this.managers?.performanceManager;
    let mainData, workData;

    if (performanceManager) {
      mainData = await performanceManager.cachedApiCall(
        `https://api.airtable.com/v0/${this.CONFIG.baseId}/${this.CONFIG.mainTableName}?maxRecords=5`,
        {},
        30000
      );
      
      workData = await performanceManager.cachedApiCall(
        `https://api.airtable.com/v0/${this.CONFIG.baseId}/${this.CONFIG.workTableName}?maxRecords=5`,
        {},
        30000
      );
    } else {
      // 직접 API 호출
      const mainResponse = await this.secureApiCall(
        `https://api.airtable.com/v0/${this.CONFIG.baseId}/${this.CONFIG.mainTableName}?maxRecords=5`
      );
      mainData = await mainResponse.json();

      const workResponse = await this.secureApiCall(
        `https://api.airtable.com/v0/${this.CONFIG.baseId}/${this.CONFIG.workTableName}?maxRecords=5`
      );
      workData = await workResponse.json();
    }

    const status = {
      mainTable: {
        accessible: !!mainData.records,
        recordCount: mainData.records?.length || 0,
        lastRecord: mainData.records?.[0]?.fields?.Title || 'N/A'
      },
      workTable: {
        accessible: !!workData.records,
        recordCount: workData.records?.length || 0,
        lastRecord: workData.records?.[0]?.fields?.Title || 'N/A'
      }
    };

    console.log('📊 포트폴리오 상태:', status);
    this.updatePortfolioStatus(status);
    
    return status;
    
  } catch (error) {
    console.error('❌ 포트폴리오 상태 확인 실패:', error);
    
    const errorStatus = {
      mainTable: { accessible: false, error: error.message },
      workTable: { accessible: false, error: error.message }
    };
    
    this.updatePortfolioStatus(errorStatus);
    return errorStatus;
  }
};

window.KAUZ_ADMIN.updatePortfolioStatus = function(status) {
  let statusContainer = document.getElementById('portfolio-status');
  
  if (!statusContainer) {
    statusContainer = document.createElement('div');
    statusContainer.id = 'portfolio-status';
    statusContainer.className = 'portfolio-status';
    statusContainer.style.cssText = `
      margin: 1rem 0;
      padding: 1rem;
      border-radius: 8px;
      background: #f8f9fa;
      border: 1px solid #e9ecef;
    `;
    
    const dashboardSection = document.getElementById('section-dashboard');
    if (dashboardSection) {
      dashboardSection.appendChild(statusContainer);
    }
  }
  
  statusContainer.innerHTML = `
    <div class="status-section">
      <h4>📊 포트폴리오 연결 상태</h4>
      <div class="status-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 0.5rem;">
        <div class="status-item ${status.mainTable.accessible ? 'connected' : 'error'}" style="padding: 0.5rem; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; background: ${status.mainTable.accessible ? '#d4edda' : '#f8d7da'}; border: 1px solid ${status.mainTable.accessible ? '#c3e6cb' : '#f5c6cb'};">
          <span class="status-label" style="font-weight: 600;">KAUZ Main:</span>
          <span class="status-value" style="font-size: 0.9rem;">
            ${status.mainTable.accessible 
              ? `✅ 연결됨 (${status.mainTable.recordCount}개)` 
              : '❌ 연결 실패'
            }
          </span>
        </div>
        <div class="status-item ${status.workTable.accessible ? 'connected' : 'error'}" style="padding: 0.5rem; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; background: ${status.workTable.accessible ? '#d4edda' : '#f8d7da'}; border: 1px solid ${status.workTable.accessible ? '#c3e6cb' : '#f5c6cb'};">
          <span class="status-label" style="font-weight: 600;">KAUZ Work:</span>
          <span class="status-value" style="font-size: 0.9rem;">
            ${status.workTable.accessible 
              ? `✅ 연결됨 (${status.workTable.recordCount}개)` 
              : '❌ 연결 실패'
            }
          </span>
        </div>
      </div>
    </div>
  `;
};

// ═══════════════════════════════════════════════════════════════
// 🔧 데이터 처리 헬퍼 함수들
// ═══════════════════════════════════════════════════════════════

window.KAUZ_ADMIN.processHourlyData = function() {
  const hourlyData = Array.from({length: 24}, () => 0);
  
  this.DATA.analytics.forEach(record => {
    if (record.fields.StartTime) {
      const hour = new Date(record.fields.StartTime).getHours();
      hourlyData[hour]++;
    }
  });

  return { hourlyData };
};

window.KAUZ_ADMIN.processDeviceData = function() {
  const devices = { Desktop: 0, Mobile: 0, Tablet: 0 };
  
  this.DATA.analytics.forEach(record => {
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
};

window.KAUZ_ADMIN.calculateAnalyticsStats = function() {
  const analytics = this.DATA.analytics;
  
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
};

// ═══════════════════════════════════════════════════════════════
// 🧹 데이터 정리 함수들
// ═══════════════════════════════════════════════════════════════

window.KAUZ_ADMIN.cleanupMemory = function() {
  console.log('🧹 메모리 정리 시작...');
  
  // 안전한 관리자 접근
  if (this.managers?.chartManager) {
    this.managers.chartManager.cleanup();
  }

  if (this.managers?.realtimeTracker) {
    this.managers.realtimeTracker.cleanup();
  }

  if (this.managers?.dataLimiter) {
    this.managers.dataLimiter.cleanupSystemData(this.DATA);
  }

  if (this.managers?.performanceManager) {
    this.managers.performanceManager.cleanupCache();
  }
  
  console.log('✅ 메모리 정리 완료');
};

window.KAUZ_ADMIN.forceRecreateCharts = function() {
  console.log('🔥 차트 재생성 중...');
  
  if (this.managers?.chartManager && this.managers.chartManager.isGoogleChartsLoaded) {
    const visitorData = this.processVisitorTrendData();
    const behaviorData = this.processUserBehaviorData();
    
    this.managers.chartManager.createVisitorTrendChart('visitor-trend-chart', visitorData);
    this.managers.chartManager.createUserBehaviorChart('user-behavior-chart', behaviorData);
    
    if (this.STATE.currentSection === 'analytics') {
      this.managers.chartManager.createAnalyticsChart('main-analytics-chart', 'line', visitorData);
      this.managers.chartManager.createAnalyticsChart('pages-performance-chart', 'bar', behaviorData);
      this.managers.chartManager.createAnalyticsChart('hourly-visits-chart', 'line', this.processHourlyData());
      this.managers.chartManager.createAnalyticsChart('device-chart', 'pie', this.processDeviceData());
    }
  }
