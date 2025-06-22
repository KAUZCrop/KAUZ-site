// portfolio.js (완전 자동화 + 당신이 준 예시 코드와 동일한 모달 구조)
// 🔥 Airtable 데이터로 전체화면 모달을 자동 생성

document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 Portfolio.js starting with Full Screen Auto Modal Generation...');

  // ─── 🔥 새로고침 시 페이지 상단으로 이동 ───
  try {
    if (performance.getEntriesByType('navigation')[0].type === 'reload') {
      console.log('🔄 Portfolio page refresh detected, scrolling to top...');
      window.scrollTo(0, 0);
    }
  } catch (e) {
    console.log('⚠️ Navigation API not supported, continuing...');
  }

  // ─── 🔧 KAUZ Work 테이블 설정 ───
  const AIRTABLE_CONFIG = {
    BASE_ID: 'appglO0MOXGY7CITU',
    API_KEY: 'patouGO5iPVpIxbRf.e4bdbe02fe59cbe69f201edaa32b4b63f8e05dbbfcae34173f0f40c985b811d9',
    TABLE_NAME: 'KAUZ%20Work'
  };

  console.log('🔧 Using table:', AIRTABLE_CONFIG.TABLE_NAME);

  // 전역 변수
  let portfolioData = [];
  let modalsGenerated = false;

  // ─── 📡 Airtable에서 포트폴리오 데이터 가져오기 ───
  async function fetchPortfolioData() {
    try {
      console.log('🔗 Fetching portfolio data from KAUZ Work table...');
      
      const url = `https://api.airtable.com/v0/${AIRTABLE_CONFIG.BASE_ID}/${AIRTABLE_CONFIG.TABLE_NAME}`;
      console.log('🌐 Request URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText
        });
        
        switch (response.status) {
          case 401:
            throw new Error('API 키 인증에 실패했습니다.');
          case 403:
            throw new Error('API 키에 이 베이스에 대한 접근 권한이 없습니다.');
          case 404:
            throw new Error(`테이블 "KAUZ Work"를 찾을 수 없습니다. 테이블 이름을 확인해주세요.`);
          case 422:
            throw new Error('API 요청 형식이 올바르지 않습니다.');
          case 429:
            throw new Error('API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
          default:
            throw new Error(`서버 오류 (${response.status}): ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      
      console.log('✅ Raw data received from KAUZ Work:', data);
      console.log('📄 Total records:', data.records ? data.records.length : 0);
      
      if (data.records && data.records.length > 0) {
        console.log('📋 Available fields in first record:', Object.keys(data.records[0].fields));
        console.log('🔍 First record sample:', data.records[0]);
      } else {
        console.warn('⚠️ No records found in KAUZ Work table');
      }
      
      return data.records || [];
      
    } catch (error) {
      console.error('❌ KAUZ Work 데이터 로딩 실패:', error);
      showDetailedError(error.message);
      return getFallbackData();
    }
  }

  // ─── 🚨 상세 에러 메시지 표시 함수 ───
  function showDetailedError(errorMessage) {
    const portfolioGrid = document.getElementById('portfolioGrid');
    if (portfolioGrid) {
      portfolioGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; background: #1a1a1a; border-radius: 8px; margin: 2rem 0;">
          <h3 style="color: #E37031; margin-bottom: 1rem; font-size: 1.5rem;">🚨 데이터 로딩 실패</h3>
          <p style="color: #ff6b6b; margin-bottom: 1rem; font-size: 1rem; line-height: 1.5; max-width: 600px; margin-left: auto; margin-right: auto;">
            ${errorMessage}
          </p>
          
          <div style="margin: 2rem 0; padding: 1.5rem; background: #0d0d0d; border-radius: 4px; color: #ccc; font-size: 0.9rem; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto;">
            <strong style="color: #E37031; display: block; margin-bottom: 0.5rem;">📋 현재 설정:</strong>
            <div style="font-family: monospace; line-height: 1.6;">
              • 베이스 ID: ${AIRTABLE_CONFIG.BASE_ID}<br>
              • 테이블 이름: "KAUZ Work"<br>
              • API 키: ${AIRTABLE_CONFIG.API_KEY ? '✅ 설정됨' : '❌ 없음'}<br>
              • 요청 URL: ${`https://api.airtable.com/v0/${AIRTABLE_CONFIG.BASE_ID}/${AIRTABLE_CONFIG.TABLE_NAME}`}
            </div>
          </div>
          
          <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 2rem;">
            <button onclick="location.reload()" style="
              background: #E37031; color: white; border: none; padding: 0.8rem 1.5rem; 
              border-radius: 4px; cursor: pointer; font-size: 1rem;
            ">🔄 다시 시도</button>
            <button onclick="portfolioDebug.loadFallbackData()" style="
              background: #333; color: white; border: none; padding: 0.8rem 1.5rem; 
              border-radius: 4px; cursor: pointer; font-size: 1rem;
            ">📋 샘플 데이터 보기</button>
          </div>
        </div>
      `;
    }
  }

  // ─── 🔄 대체 데이터 (연결 실패시) ───
  function getFallbackData() {
    console.log('🔄 Using fallback data for KAUZ Work...');
    return [
      {
        id: 'fallback-1',
        fields: {
          'Title': 'VALENTINO SS24 COLLECTION',
          'Category': 'Branding Campaign',
          'Client': 'VALENTINO',
          'Description': '럭셔리 브랜드의 프리미엄 브랜딩 전략',
          'Budget': '8억원',
          'Duration': '3개월',
          'Team': '전략 3명, 크리에이티브 5명, 디지털 2명',
          'Channels': 'Digital, Influencer, PR',
          'SalesGrowth': '45%',
          'Reach': '2.8M',
          'Engagement': '12%',
          'ROI': '320%',
          'Image': null
        }
      },
      {
        id: 'fallback-2',
        fields: {
          'Title': 'ACNE STUDIOS',
          'Category': 'Performance Marketing',
          'Client': 'ACNE STUDIOS',
          'Description': '데이터 기반 퍼포먼스 마케팅으로 ROI 극대화',
          'Budget': '3억원',
          'Duration': '4개월',
          'Team': '데이터 분석 2명, 퍼포먼스 마케팅 3명',
          'Channels': 'Google Ads, Meta, 네이버',
          'SalesGrowth': '65%',
          'Reach': '1.2M',
          'Engagement': '8.5%',
          'ROI': '420%',
          'Image': null
        }
      },
      {
        id: 'fallback-3',
        fields: {
          'Title': 'LG ELECTRONICS',
          'Category': 'TVC Brand Film',
          'Client': 'LG',
          'Description': '혁신 기술의 감성적 스토리텔링',
          'Budget': '6억원',
          'Duration': '2개월',
          'Team': '크리에이티브 4명, 제작 6명',
          'Channels': 'TV, Digital, Youtube',
          'SalesGrowth': '28%',
          'Reach': '5.2M',
          'Engagement': '15%',
          'ROI': '250%',
          'Image': null
        }
      },
      {
        id: 'fallback-4',
        fields: {
          'Title': 'AMOREPACIFIC',
          'Category': 'BTL Experiential',
          'Client': 'AMOREPACIFIC',
          'Description': '프리미엄 뷰티의 오감 체험',
          'Budget': '4억원',
          'Duration': '3개월',
          'Team': '기획 3명, 운영 8명, 디자인 2명',
          'Channels': 'Offline Event, Digital PR',
          'SalesGrowth': '52%',
          'Reach': '800K',
          'Engagement': '22%',
          'ROI': '380%',
          'Image': null
        }
      }
    ];
  }

  // ─── 🎨 당신이 준 예시와 동일한 구조로 모달 생성 ───
  function generateAllModals(records) {
    console.log('🏗️ Generating fullscreen modals with your provided structure...');

    records.forEach((record, index) => {
      const fields = record.fields;
      const modalId = `portfolio-modal-${record.id}`;

      // 필드 매핑
      const title = fields['Title'] || 'UNTITLED PROJECT';
      const category = fields['Category'] || 'PROJECT';
      const client = fields['Client'] || 'KAUZ';
      const description = fields['Description'] || '상세한 프로젝트 정보가 추가될 예정입니다.';
      const budget = fields['Budget'] || '예산 정보 없음';
      const duration = fields['Duration'] || '기간 정보 없음';
      const team = fields['Team'] || '팀 정보 없음';
      const channels = fields['Channels'] || '채널 정보 없음';
      
      // 성과 지표
      const salesGrowth = fields['SalesGrowth'] || 'N/A';
      const reach = fields['Reach'] || 'N/A';
      const engagement = fields['Engagement'] || 'N/A';
      const roi = fields['ROI'] || 'N/A';

      // 이미지 URL
      let imageUrl = null;
      let hasHeroImage = false;
      if (fields['Image'] && Array.isArray(fields['Image']) && fields['Image'].length > 0) {
        imageUrl = fields['Image'][0].url;
        hasHeroImage = true;
      }

      // 🔥 당신이 제공한 예시와 정확히 동일한 모달 HTML 구조
      const modalHtml = `
        <div id="${modalId}" class="modal">
          <div class="modal-content">
            <div class="modal-header">
              <div class="modal-logo">KAUZ</div>
              <button class="close-btn" onclick="closeModal('${modalId}')">&times;</button>
            </div>

            <div class="modal-hero">
              ${hasHeroImage 
                ? `<img src="${imageUrl}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.3;" />`
                : `<div class="image-placeholder" style="width: 100%; height: 100%; opacity: 0.3;">HERO IMAGE</div>`
              }
              <div class="modal-hero-content">
                <div class="modal-category">${category}</div>
                <h1 class="modal-title">${title}</h1>
                <p class="modal-subtitle">${description}</p>
                
                <div class="modal-stats">
                  <div class="stat-item">
                    <span class="stat-number">${salesGrowth}</span>
                    <span class="stat-label">Sales Growth</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number">${reach}</span>
                    <span class="stat-label">Reach</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number">${engagement}</span>
                    <span class="stat-label">Engagement</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-body">
              <div class="content-section">
                <h2 class="section-title">Project Overview</h2>
                <div class="content-grid">
                  <div class="content-text">
                    <p><span class="highlight">${title}</span> 프로젝트의 성공적인 실행을 위한 통합 마케팅 캠페인을 기획했습니다.</p>
                    <p>${description}</p>
                  </div>
                  <div class="content-text">
                    <p><strong>Duration:</strong> ${duration}<br>
                    <strong>Budget:</strong> ${budget}<br>
                    <strong>Team:</strong> ${team}<br>
                    <strong>Channels:</strong> ${channels}</p>
                  </div>
                </div>
              </div>

              <div class="content-section">
                <h2 class="section-title">Key Results</h2>
                <div class="metrics-grid">
                  <div class="metric-card">
                    <div class="metric-value">${salesGrowth}</div>
                    <div class="metric-label">Sales Growth</div>
                  </div>
                  <div class="metric-card">
                    <div class="metric-value">${reach}</div>
                    <div class="metric-label">Total Reach</div>
                  </div>
                  <div class="metric-card">
                    <div class="metric-value">${engagement}</div>
                    <div class="metric-label">Engagement Rate</div>
                  </div>
                  <div class="metric-card">
                    <div class="metric-value">${roi}</div>
                    <div class="metric-label">ROI</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      // DOM에 모달 추가
      document.body.insertAdjacentHTML('beforeend', modalHtml);
      
      console.log(`✅ Fullscreen modal generated for: ${title} (ID: ${modalId})`);
    });

    modalsGenerated = true;
    console.log(`🏗️ All fullscreen modals generated: ${records.length} modals created`);
  }

  // ─── 🎨 포트폴리오 데이터 렌더링 ───
  function renderPortfolioItems(records) {
    const portfolioGrid = document.getElementById('portfolioGrid');
    if (!portfolioGrid) {
      console.error('❌ Portfolio grid element not found');
      return;
    }

    if (!records || records.length === 0) {
      portfolioGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: #ccc; padding: 4rem;">
          <h3 style="color: #E37031; margin-bottom: 1rem;">📭 포트폴리오 데이터 없음</h3>
          <p style="margin-bottom: 2rem;">KAUZ Work 테이블에 데이터가 없거나 연결에 문제가 있습니다.</p>
          <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <button onclick="portfolioDebug.testConnection()" style="
              background: #E37031; color: white; border: none; padding: 0.8rem 1.5rem; 
              border-radius: 4px; cursor: pointer; font-size: 1rem;
            ">연결 테스트</button>
            <button onclick="portfolioDebug.loadFallbackData()" style="
              background: #333; color: white; border: none; padding: 0.8rem 1.5rem; 
              border-radius: 4px; cursor: pointer; font-size: 1rem;
            ">샘플 데이터 보기</button>
          </div>
        </div>
      `;
      return;
    }

    // 🔥 수정된 렌더링 로직 - 개별 모달 ID 연결
    portfolioGrid.innerHTML = records.map((record, index) => {
      const fields = record.fields;
      const modalId = `portfolio-modal-${record.id}`;
      
      // 필드 매핑
      const title = fields['Title'] || 'UNTITLED PROJECT';
      const category = fields['Category'] || 'PROJECT';
      
      // 이미지 처리
      let imageUrl = null;
      let hasImage = false;
      
      if (fields['Image'] && Array.isArray(fields['Image']) && fields['Image'].length > 0) {
        imageUrl = fields['Image'][0].url;
        hasImage = true;
      }
      
      console.log(`🔍 Record ${index + 1} mapping:`, {
        title,
        category,
        hasImage,
        modalId,
        recordId: record.id
      });
      
      return `
        <div class="project-card fade-up" 
             data-index="${index}"
             data-record-id="${record.id}"
             data-modal-id="${modalId}"
             onclick="openModal('${modalId}')"
             style="animation-delay: ${index * 0.1}s">
          <div class="project-image-container ${!hasImage ? 'no-image' : ''}">
            ${hasImage 
              ? `<img src="${imageUrl}" alt="${title}" loading="lazy" onerror="handleImageError(this)" />`
              : ''
            }
          </div>
          <div class="project-info">
            <div class="project-title">${title}</div>
            <div class="project-category">${category}</div>
          </div>
        </div>
      `;
    }).join('');

    // 애니메이션 초기화
    initFadeUpAnimations();
    
    console.log(`✅ Portfolio items rendered: ${records.length} items with individual modal IDs`);
  }

  // ─── 🖼️ 이미지 로드 실패 처리 함수 ───
  window.handleImageError = function(img) {
    console.warn('⚠️ Image load failed for:', img.src);
    const container = img.parentElement;
    if (container) {
      container.classList.add('no-image');
      img.style.display = 'none';
    }
  };

  // ─── 🎭 페이드업 애니메이션 초기화 ───
  function initFadeUpAnimations() {
    const portfolioFadeElements = document.querySelectorAll('.fade-up:not([data-portfolio-observed])');
    
    if (portfolioFadeElements.length > 0) {
      const portfolioObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            entry.target.classList.add('visible');
            portfolioObserver.unobserve(entry.target);
          }
        });
      }, { 
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px'
      });
      
      portfolioFadeElements.forEach((element) => {
        element.setAttribute('data-portfolio-observed', 'true');
        portfolioObserver.observe(element);
      });
      
      console.log('✅ Portfolio fade-up animations initialized:', portfolioFadeElements.length);
    }
  }

  // ─── 🔍 당신이 준 예시와 동일한 모달 열기/닫기 함수 ───
  window.openModal = function(modalId) {
    console.log('🔍 Opening fullscreen modal:', modalId);
    
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      console.log('✅ Fullscreen modal opened successfully:', modalId);
    } else {
      console.error('❌ Modal not found:', modalId);
      alert('모달을 찾을 수 없습니다. 페이지를 새로고침해주세요.');
    }
  };

  window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      
      console.log('✅ Modal closed:', modalId);
    }
  };

  // ─── ⌨️ ESC 키로 모달 닫기 ───
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal.active');
      if (activeModal) {
        const modalId = activeModal.id;
        closeModal(modalId);
      }
    }
  });

  // ─── 🔥 모달 배경 클릭으로 닫기 ───
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      const modalId = e.target.id;
      closeModal(modalId);
    }
  });

  // ─── 📜 SCROLL 인디케이터 클릭 이벤트 ───
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      const portfolioSection = document.querySelector('.portfolio-projects') || 
                              document.querySelector('.portfolio-content-wrapper');
      
      if (portfolioSection) {
        portfolioSection.scrollIntoView({
          behavior: 'smooth'
        });
        console.log('📜 Smooth scroll to portfolio section initiated');
      }
    });
    console.log('✅ Portfolio page scroll indicator initialized');
  }

  // ─── 📞 Contact 섹션 클릭 처리 ───
  const contactSection = document.getElementById('contact');
  if (contactSection) {
    let isScrolling = false;
    let scrollTimeout;
    let startY = 0;
    let startTime = 0;
    let touchStarted = false;

    contactSection.addEventListener('touchstart', (e) => {
      touchStarted = true;
      startY = e.touches[0].clientY;
      startTime = Date.now();
      isScrolling = false;
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 150);
    }, { passive: true });

    contactSection.addEventListener('mousedown', (e) => {
      if (!touchStarted) {
        startY = e.clientY;
        startTime = Date.now();
        isScrolling = false;
      }
    });

    contactSection.addEventListener('touchmove', (e) => {
      const currentY = e.touches[0].clientY;
      const deltaY = Math.abs(currentY - startY);
      
      if (deltaY > 10) {
        isScrolling = true;
      }
    }, { passive: true });

    contactSection.addEventListener('mousemove', (e) => {
      if (!touchStarted) {
        const currentY = e.clientY;
        const deltaY = Math.abs(currentY - startY);
        
        if (deltaY > 10) {
          isScrolling = true;
        }
      }
    });

    contactSection.addEventListener('touchend', (e) => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (!isScrolling && duration < 300) {
        e.preventDefault();
        performSafeNavigation('contact.html');
      }
      
      setTimeout(() => {
        touchStarted = false;
      }, 100);
    });

    contactSection.addEventListener('click', (e) => {
      if (!touchStarted && !isScrolling) {
        e.preventDefault();
        performSafeNavigation('contact.html');
      }
    });

    function performSafeNavigation(url) {
      console.log('🔗 Portfolio page navigating to:', url);
      
      document.body.style.opacity = '0.9';
      document.body.style.transition = 'opacity 0.2s ease';
      
      setTimeout(() => {
        window.location.href = url;
      }, 100);
    }

    console.log('✅ Portfolio page contact section click events initialized');
  }

  // ─── 🎠 Contact 섹션 무한롤링 초기화 ───
  function initPortfolioContactInfiniteScroll() {
    const marqueeInner = document.querySelector('#contact .marquee-inner');
    const marqueeWrapper = document.querySelector('#contact .marquee-wrapper');
    
    if (!marqueeInner || !marqueeWrapper) {
      console.warn('Portfolio contact marquee elements not found');
      return;
    }
    
    // 색상 웨이브 딜레이 적용
    const allTextElements = marqueeInner.querySelectorAll('.text-item, .text-divider');
    allTextElements.forEach((element, index) => {
      const delay = (index * 0.3) % 4;
      element.style.animationDelay = `${delay}s`;
    });
    
    console.log('✅ Portfolio contact infinite scroll initialized with', allTextElements.length, 'elements');
  }

  // ─── 🔧 강화된 디버깅 도구 ───
  window.portfolioDebug = {
    // 연결 테스트
    testConnection: async () => {
      console.log('🧪 Testing KAUZ Work table connection...');
      showLoadingMessage();
      
      try {
        const data = await fetchPortfolioData();
        renderPortfolioItems(data);
        generateAllModals(data);
        
        if (data.length > 0) {
          alert(`✅ KAUZ Work 테이블 연결 성공!\n\n${data.length}개의 레코드를 가져왔습니다.\n전체화면 모달이 자동 생성되었습니다.`);
        } else {
          alert('⚠️ 연결은 성공했지만 데이터가 없습니다.\nKAUZ Work 테이블에 레코드를 추가해주세요.');
        }
      } catch (error) {
        alert(`❌ 연결 실패!\n\n오류: ${error.message}`);
      }
    },
    
    // 현재 설정 확인
    showConnectionInfo: () => {
      const info = `
🔍 KAUZ Portfolio 연결 정보 (전체화면 자동 모달 생성)

📋 설정:
• 베이스 ID: ${AIRTABLE_CONFIG.BASE_ID}
• 테이블 이름: "KAUZ Work"
• API 키: ${AIRTABLE_CONFIG.API_KEY ? '설정됨 (마지막 10자: ' + AIRTABLE_CONFIG.API_KEY.slice(-10) + ')' : '❌ 없음'}
• 모달 생성 상태: ${modalsGenerated ? '✅ 완료' : '❌ 미생성'}

🌐 요청 URL:
${`https://api.airtable.com/v0/${AIRTABLE_CONFIG.BASE_ID}/${AIRTABLE_CONFIG.TABLE_NAME}`}

🔥 전체화면 자동 모달 생성:
당신이 제공한 예시 코드와 동일한 구조로 각 프로젝트마다 전체화면 모달이 자동 생성됩니다.
      `;
      
      alert(info);
      console.log('🔍 Fullscreen Auto Modal Generation Info:', {
        baseId: AIRTABLE_CONFIG.BASE_ID,
        tableName: 'KAUZ Work',
        hasApiKey: !!AIRTABLE_CONFIG.API_KEY,
        modalsGenerated: modalsGenerated,
        totalModals: document.querySelectorAll('.modal[id^="portfolio-modal-"]').length
      });
    },
    
    // 대체 데이터 로드
    loadFallbackData: () => {
      console.log('🔄 Loading fallback data for KAUZ Work...');
      const fallbackData = getFallbackData();
      renderPortfolioItems(fallbackData);
      generateAllModals(fallbackData);
      
      alert(`📋 샘플 데이터를 표시했습니다.\n\n${fallbackData.length}개의 샘플 프로젝트와 전체화면 모달이 생성되었습니다.\n\nKAUZ Work 테이블에 실제 데이터를 추가해주세요.`);
    },
    
    // 데이터 새로고침
    reloadData: async () => {
      console.log('🔄 Reloading KAUZ Work data...');
      showLoadingMessage();
      await initPortfolio();
    },

    // 생성된 모달 확인
    checkModals: () => {
      const modals = document.querySelectorAll('.modal[id^="portfolio-modal-"]');
      console.log('📋 Generated fullscreen modals:', modals.length);
      modals.forEach(modal => {
        console.log('  - Modal ID:', modal.id);
      });
      alert(`생성된 전체화면 모달: ${modals.length}개\n\n콘솔에서 자세한 정보를 확인하세요.`);
    },

    // 특정 모달 테스트
    testModal: (modalId) => {
      if (!modalId) {
        const modals = document.querySelectorAll('.modal[id^="portfolio-modal-"]');
        if (modals.length > 0) {
          modalId = modals[0].id;
        } else {
          alert('생성된 모달이 없습니다.');
          return;
        }
      }
      console.log('🧪 Testing fullscreen modal:', modalId);
      openModal(modalId);
    }
  };

  // ─── 💡 로딩 메시지 표시 함수 ───
  function showLoadingMessage() {
    const portfolioGrid = document.getElementById('portfolioGrid');
    if (portfolioGrid) {
      portfolioGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: #ccc; padding: 4rem;">
          <div style="display: inline-block; width: 40px; height: 40px; border: 3px solid #333; border-top: 3px solid #E37031; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem;"></div>
          <p style="font-size: 1.1rem;">KAUZ Work 테이블에서 데이터를 불러오는 중...</p>
          <p style="font-size: 0.9rem; color: #666; margin-top: 0.5rem;">전체화면 모달을 자동 생성합니다</p>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `;
    }
  }

  // ─── 📱 모바일 터치 최적화 ───
  if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
    console.log('📱 Touch device detected, mobile optimizations applied');
  }

  // ─── 🌐 브라우저 호환성 체크 ───
  function checkBrowserSupport() {
    const support = {
      intersectionObserver: 'IntersectionObserver' in window,
      cssGrid: CSS.supports('display', 'grid'),
      fetch: 'fetch' in window
    };
    
    console.log('🌐 Browser support check:', support);
    
    if (!support.intersectionObserver) {
      console.warn('⚠️ IntersectionObserver not supported, applying fallback');
      document.querySelectorAll('.fade-up').forEach(el => {
        el.classList.add('is-visible', 'visible');
      });
    }

    if (!support.fetch) {
      console.error('❌ Fetch API not supported - portfolio will not work');
      alert('브라우저가 너무 오래되었습니다. 최신 브라우저를 사용해주세요.');
    }

    if (!support.cssGrid) {
      console.warn('⚠️ CSS Grid not supported, applying fallback');
      document.body.classList.add('no-grid-support');
    }
  }

  checkBrowserSupport();

  // ─── 🚀 메인 초기화 함수 (완전 자동화) ───
  async function initPortfolio() {
    console.log('🚀 Initializing KAUZ Portfolio with Fullscreen Auto Modal Generation...');
    console.log('🔧 Configuration:', {
      baseId: AIRTABLE_CONFIG.BASE_ID,
      tableName: 'KAUZ Work',
      hasApiKey: !!AIRTABLE_CONFIG.API_KEY,
      fullscreenAutoModalGeneration: true
    });
    
    // 로딩 메시지 표시
    showLoadingMessage();
    
    // 1. KAUZ Work 테이블에서 데이터 로드
    const portfolioData = await fetchPortfolioData();
    
    // 전역 변수에 저장
    window.portfolioData = portfolioData;
    
    // 2. 포트폴리오 아이템 렌더링
    renderPortfolioItems(portfolioData);
    
    // 3. 🔥 당신이 제공한 예시와 동일한 전체화면 모달 자동 생성
    generateAllModals(portfolioData);
    
    // 4. Contact 섹션 무한롤링 초기화 (딜레이)
    setTimeout(() => {
      initPortfolioContactInfiniteScroll();
    }, 1000);
    
    console.log('✅ Portfolio initialization complete with Fullscreen Auto Modal Generation');
    console.log(`🏗️ Total fullscreen modals created: ${portfolioData.length}`);
  }

  // ─── 🏁 최종 초기화 실행 ───
  initPortfolio();

  console.log('✅ Portfolio.js initialization complete - Fullscreen Auto Modal Generation Mode');
  console.log('🔧 Debug tools available:');
  console.log('  - portfolioDebug.testConnection()');
  console.log('  - portfolioDebug.showConnectionInfo()');
  console.log('  - portfolioDebug.loadFallbackData()');
  console.log('  - portfolioDebug.checkModals()');
  console.log('  - portfolioDebug.testModal()');
  console.log('  - portfolioDebug.reloadData()');
  console.log('');
  console.log('🎯 KAUZ Work: 이 프로젝트는 KAUZ의 창의적인 접근 방식과 데이터 기반 전략의 결합으로 탄생했습니다. 클라이언트의 브랜드 가치를 극대화하기 위한 통합적 솔루션을 제공했습니다.');
});
