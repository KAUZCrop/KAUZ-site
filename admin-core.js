// ═══════════════════════════════════════════════════════════════
// KAUZ Admin Core Module v4.2.0
// 🔐 기본 설정, 암호화, 인증 시스템
// ═══════════════════════════════════════════════════════════════

// 전역 설정
window.KAUZ_ADMIN = window.KAUZ_ADMIN || {};

// 시스템 설정
window.KAUZ_ADMIN.CONFIG = {
  encryptedToken: null,
  hashedPassword: null,
  baseId: 'appglO0MOXGY7CITU',
  mainTableName: 'KAUZ%20main',
  workTableName: 'KAUZ%20Work',
  contactTableName: 'Contact%20Form',
  analyticsTableName: 'Analytics',
  sessionDuration: 2 * 60 * 60 * 1000, // 2시간
  maxLoginAttempts: 5,
  version: '4.2.0-MODULAR'
};

// 전역 상태
window.KAUZ_ADMIN.STATE = {
  AIRTABLE_TOKEN: null,
  isInitialized: false,
  correctPasswordHash: null,
  currentSection: 'dashboard',
  currentPortfolioTab: 'main'
};

// 데이터 저장소
window.KAUZ_ADMIN.DATA = {
  portfolio: { main: [], work: [] },
  contacts: [],
  analytics: [],
  charts: {},
  realtime: { visitors: 0, pageviews: 0, sessions: 0 }
};

// DOM 요소 참조
window.KAUZ_ADMIN.ELEMENTS = {};

// ═══════════════════════════════════════════════════════════════
// 🔐 AES 암호화 클래스
// ═══════════════════════════════════════════════════════════════

window.KAUZ_ADMIN.KAUZCrypto = class {
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
    
    const salt = new Uint8Array([75, 65, 85, 90, 50, 48, 50, 53, 85, 76, 84, 73, 77, 65, 84, 69]);
    
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: salt, iterations: 15000, hash: 'SHA-256' },
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
      const combined = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
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
};

// ═══════════════════════════════════════════════════════════════
// 🚀 시스템 초기화
// ═══════════════════════════════════════════════════════════════

window.KAUZ_ADMIN.initializeSystem = async function() {
  try {
    console.log('🔄 Core 시스템 초기화 중...');
    
    const originalToken = 'patouGO5iPVpIxbRf.e4bdbe02fe59cbe69f201edaa32b4b63f8e05dbbfcae34173f0f40c985b811d9';
    
    this.CONFIG.encryptedToken = await this.KAUZCrypto.encrypt(originalToken);
    this.STATE.correctPasswordHash = await this.KAUZCrypto.hashPassword('kauz2025!admin');
    this.CONFIG.hashedPassword = this.STATE.correctPasswordHash;
    
    console.log('✅ Core 시스템 초기화 완료');
    console.log(`🔐 보안 레벨: AES-256 + ${this.CONFIG.version}`);
    
    return true;
  } catch (error) {
    console.error('❌ Core 시스템 초기화 실패:', error);
    return false;
  }
};

// ═══════════════════════════════════════════════════════════════
// 🔐 인증 관련 함수들
// ═══════════════════════════════════════════════════════════════

window.KAUZ_ADMIN.initializeTokens = async function() {
  try {
    if (!this.CONFIG.encryptedToken) {
      console.error('❌ 암호화된 토큰이 없습니다.');
      return false;
    }
    
    console.log('🔄 AES 토큰 복호화 중...');
    
    this.STATE.AIRTABLE_TOKEN = await this.KAUZCrypto.decrypt(this.CONFIG.encryptedToken);
    
    if (!this.STATE.AIRTABLE_TOKEN) {
      console.error('❌ AES 토큰 복호화 실패');
      return false;
    }
    
    this.STATE.isInitialized = true;
    console.log('✅ AES 토큰 복호화 성공');
    return true;
  } catch (error) {
    console.error('❌ 토큰 초기화 실패:', error);
    return false;
  }
};

window.KAUZ_ADMIN.generateSecureToken = function() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const randomString = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  return `kauz_admin_${Date.now()}_${randomString}`;
};

window.KAUZ_ADMIN.checkAuth = function() {
  const token = localStorage.getItem('kauz_admin_token');
  const loginTime = localStorage.getItem('kauz_admin_time');
  
  if (!token || !loginTime) {
    return false;
  }
  
  if (Date.now() - parseInt(loginTime) > this.CONFIG.sessionDuration) {
    this.logout('세션이 만료되었습니다.');
    return false;
  }
  
  return true;
};

window.KAUZ_ADMIN.login = async function(password) {
  const attempts = parseInt(localStorage.getItem('kauz_login_attempts') || '0');
  
  if (attempts >= this.CONFIG.maxLoginAttempts) {
    throw new Error(`로그인 시도 횟수를 초과했습니다. (최대 ${this.CONFIG.maxLoginAttempts}회)`);
  }

  try {
    if (!this.STATE.correctPasswordHash) {
      this.STATE.correctPasswordHash = await this.KAUZCrypto.hashPassword('kauz2025!admin');
    }
    
    const isValid = await this.KAUZCrypto.verifyPassword(password, this.STATE.correctPasswordHash);
    
    if (isValid) {
      const token = this.generateSecureToken();
      localStorage.setItem('kauz_admin_token', token);
      localStorage.setItem('kauz_admin_time', Date.now().toString());
      localStorage.removeItem('kauz_login_attempts');
      
      return { success: true, message: '🔐 Admin 로그인 성공!' };
    } else {
      const newAttempts = attempts + 1;
      localStorage.setItem('kauz_login_attempts', newAttempts.toString());
      throw new Error(`비밀번호가 틀렸습니다. (${newAttempts}/${this.CONFIG.maxLoginAttempts})`);
    }
  } catch (error) {
    console.error('로그인 처리 실패:', error);
    throw error;
  }
};

window.KAUZ_ADMIN.logout = function(message = '로그아웃되었습니다.') {
  localStorage.removeItem('kauz_admin_token');
  localStorage.removeItem('kauz_admin_time');
  
  this.STATE.AIRTABLE_TOKEN = null;
  this.STATE.isInitialized = false;
  
  console.log('🚪 로그아웃:', message);
  return message;
};

// ═══════════════════════════════════════════════════════════════
// 📡 보안 API 호출
// ═══════════════════════════════════════════════════════════════

window.KAUZ_ADMIN.secureApiCall = async function(url, options = {}) {
  if (!this.STATE.AIRTABLE_TOKEN || !this.STATE.isInitialized) {
    throw new Error('인증이 초기화되지 않았습니다.');
  }

  const defaultOptions = {
    headers: {
      'Authorization': `Bearer ${this.STATE.AIRTABLE_TOKEN}`,
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
    return response;
  } catch (error) {
    console.error('API 호출 실패:', error);
    throw error;
  }
};

// ═══════════════════════════════════════════════════════════════
// 🔧 유틸리티 함수들
// ═══════════════════════════════════════════════════════════════

window.KAUZ_ADMIN.debounce = function(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

window.KAUZ_ADMIN.throttle = function(func, delay) {
  let lastExecution = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastExecution >= delay) {
      func.apply(this, args);
      lastExecution = now;
    }
  };
};

// DOM 요소 초기화
window.KAUZ_ADMIN.initializeElements = function() {
  this.ELEMENTS = {
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
  
  console.log('🎯 DOM 요소 초기화 완료');
};

// ═══════════════════════════════════════════════════════════════
// 🎉 Core 모듈 로드 완료
// ═══════════════════════════════════════════════════════════════

console.log('✅ KAUZ Admin Core Module 로드 완료');
console.log('🔐 AES-256 암호화 시스템 준비 완료');
console.log('📋 다음 모듈: admin-managers.js 로드 필요');

// Core 모듈 자동 초기화
window.KAUZ_ADMIN.initializeSystem().then(success => {
  if (success) {
    console.log('🚀 Core 시스템 자동 초기화 성공!');
  } else {
    console.error('❌ Core 시스템 자동 초기화 실패!');
  }
});
