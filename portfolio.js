// portfolio.js (완전한 KAUZ Work 테이블 연동 버전)
// 🔥 새로운 'KAUZ Work' 테이블과 Image 필드 매핑

document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 Portfolio.js starting...');

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
    TABLE_NAME: 'KAUZ%20Work'  // ✅ 새로운 테이블명 (공백을 %20으로 인코딩)
  };

  console.log('🔧 Using table:', AIRTABLE_CONFIG.TABLE_NAME);

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
          'Title': 'LG 시그니처',
          'Category': 'BRANDING',
          'Client': 'LG',
          'Image': null
        }
      },
      {
        id: 'fallback-2',
        fields: {
          'Title': 'LG 전자',
          'Category': 'DIGITAL',
          'Client': 'LG',
          'Image': null
        }
      },
      {
        id: 'fallback-3',
        fields: {
          'Title': '법무법인 아울',
          'Category': 'BRANDING',
          'Client': 'KAUZ',
          'Image': null
        }
      },
      {
        id: 'fallback-4',
        fields: {
          'Title': 'KAUZ 샘플 프로젝트',
          'Category': 'CAMPAIGN',
          'Client': 'KAUZ TEAM',
          'Image': null
        }
      }
    ];
  }

  // ─── 🎨 포트폴리오 데이터 렌더링 (KAUZ Work 필드 기준) ───
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

    // 🔥 KAUZ Work 테이블 필드에 맞춘 매핑
    portfolioGrid.innerHTML = records.map((record, index) => {
      const fields = record.fields;
      
      // 📋 KAUZ Work 테이블의 실제 필드명으로 매핑
      const title = fields['Title'] || 'UNTITLED PROJECT';
      const category = fields['Category'] || 'PROJECT';
      const client = fields['Client'] || 'KAUZ';
      
      // 🖼️ 이미지 처리 (Attachment 필드)
      let imageUrl = null;
      if (fields['Image'] && Array.isArray(fields['Image']) && fields['Image'].length > 0) {
        imageUrl = fields['Image'][0].url;
      }
      
      // 디버깅용 로그
      console.log(`🔍 Record ${index + 1} mapping:`, {
        title,
        category,
        client,
        hasImage: !!imageUrl,
        imageUrl: imageUrl ? imageUrl.substring(0, 50) + '...' : 'No image',
        availableFields: Object.keys(fields)
      });
      
      return `
        <div class="project-card fade-up" 
             data-index="${index}"
             onclick="openPortfolioModal('${record.id}', ${index})"
             style="animation-delay: ${index * 0.1}s">
          <div class="project-image-container">
            ${imageUrl 
              ? `<img src="${imageUrl}" alt="${title}" loading="lazy" onerror="this.style.display='none'" />`
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
    
    console.log(`✅ Portfolio items rendered: ${records.length} items from KAUZ Work table`);
    
    // 렌더링 완료 후 통계 출력
    const withImages = records.filter(r => {
      const fields = r.fields;
      return fields['Image'] && Array.isArray(fields['Image']) && fields['Image'].length > 0;
    }).length;
    
    console.log('📊 Rendering statistics:', {
      total: records.length,
      withImages: withImages,
      withoutImages: records.length - withImages
    });
  }

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

  // ─── 🔍 포트폴리오 모달 열기 ───
  window.openPortfolioModal = function(recordId, index) {
    console.log('🔍 Opening portfolio modal:', recordId, index);
    
    // 실제 데이터 기반 모달 생성
    const record = portfolioData ? portfolioData.find(r => r.id === recordId) : null;
    const fields = record ? record.fields : {};
    
    const modalHtml = `
      <div id="portfolioModal" class="modal active">
        <div class="modal-content">
          <span class="close-btn" onclick="closePortfolioModal()">&times;</span>
          <h2>${fields['Title'] || 'Portfolio Project'}</h2>
          <p><strong>카테고리:</strong> ${fields['Category'] || 'N/A'}</p>
          <p><strong>클라이언트:</strong> ${fields['Client'] || 'N/A'}</p>
          <p><strong>프로젝트 개요:</strong><br>
          ${fields['Description'] || '상세한 프로젝트 정보가 추가될 예정입니다.'}</p>
          <p><strong>주요 성과:</strong><br>
          • 브랜드 인지도 향상<br>
          • 높은 전환율 달성<br>
          • ROI 개선</p>
          <p><strong>담당팀:</strong> KAUZ Creative Team</p>
          <div style="margin-top: 2rem; padding: 1rem; background: #0d0d0d; border-radius: 4px; font-size: 0.9rem; color: #999;">
            💡 <strong>개발자 노트:</strong> KAUZ Work 테이블에서 자동으로 가져온 데이터입니다.
          </div>
        </div>
      </div>
    `;
    
    // 기존 모달 제거 후 새 모달 추가
    const existingModal = document.getElementById('portfolioModal');
    if (existingModal) {
      existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.style.overflow = 'hidden';
    
    console.log('✅ Portfolio modal opened for record:', recordId);
  };

  // ─── ❌ 포트폴리오 모달 닫기 ───
  window.closePortfolioModal = function() {
    const modal = document.getElementById('portfolioModal');
    if (modal) {
      modal.remove();
      document.body.style.overflow = '';
      console.log('✅ Portfolio modal closed');
    }
  };

  // ─── ⌨️ ESC 키로 모달 닫기 ───
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closePortfolioModal();
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
        
        if (data.length > 0) {
          alert(`✅ KAUZ Work 테이블 연결 성공!\n\n${data.length}개의 레코드를 가져왔습니다.`);
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
🔍 KAUZ Portfolio 연결 정보

📋 설정:
• 베이스 ID: ${AIRTABLE_CONFIG.BASE_ID}
• 테이블 이름: "KAUZ Work"
• API 키: ${AIRTABLE_CONFIG.API_KEY ? '설정됨 (마지막 10자: ' + AIRTABLE_CONFIG.API_KEY.slice(-10) + ')' : '❌ 없음'}

🌐 요청 URL:
${`https://api.airtable.com/v0/${AIRTABLE_CONFIG.BASE_ID}/${AIRTABLE_CONFIG.TABLE_NAME}`}

💡 예상 필드:
• Title (프로젝트 제목)
• Category (카테고리 - 주황색으로 표시)
• Client (클라이언트명)
• Image (첨부파일 - 프로젝트 이미지)
      `;
      
      alert(info);
      console.log('🔍 Connection Info:', {
        baseId: AIRTABLE_CONFIG.BASE_ID,
        tableName: 'KAUZ Work',
        hasApiKey: !!AIRTABLE_CONFIG.API_KEY,
        requestUrl: `https://api.airtable.com/v0/${AIRTABLE_CONFIG.BASE_ID}/${AIRTABLE_CONFIG.TABLE_NAME}`
      });
    },
    
    // 대체 데이터 로드
    loadFallbackData: () => {
      console.log('🔄 Loading fallback data for KAUZ Work...');
      const fallbackData = getFallbackData();
      renderPortfolioItems(fallbackData);
      
      alert(`📋 샘플 데이터를 표시했습니다.\n\n${fallbackData.length}개의 샘플 프로젝트가 표시되고 있습니다.\n\nKAUZ Work 테이블에 실제 데이터를 추가해주세요.`);
    },
    
    // 데이터 새로고침
    reloadData: async () => {
      console.log('🔄 Reloading KAUZ Work data...');
      showLoadingMessage();
      await initPortfolio();
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
  }

  checkBrowserSupport();

  // ─── 🚀 메인 초기화 함수 ───
  async function initPortfolio() {
    console.log('🚀 Initializing KAUZ Portfolio with KAUZ Work table...');
    console.log('🔧 Configuration:', {
      baseId: AIRTABLE_CONFIG.BASE_ID,
      tableName: 'KAUZ Work',
      hasApiKey: !!AIRTABLE_CONFIG.API_KEY
    });
    
    // 로딩 메시지 표시
    showLoadingMessage();
    
    // 1. KAUZ Work 테이블에서 데이터 로드
    const portfolioData = await fetchPortfolioData();
    
    // 전역 변수에 저장 (모달에서 사용)
    window.portfolioData = portfolioData;
    
    // 2. 포트폴리오 아이템 렌더링
    renderPortfolioItems(portfolioData);
    
    // 3. Contact 섹션 무한롤링 초기화 (딜레이)
    setTimeout(() => {
      initPortfolioContactInfiniteScroll();
    }, 1000);
    
    console.log('✅ Portfolio initialization complete with KAUZ Work table');
  }

  // ─── 🏁 최종 초기화 실행 ───
  initPortfolio();

  console.log('✅ Portfolio.js initialization complete for KAUZ Work table');
  console.log('🔧 Debug tools: portfolioDebug.*');
  console.log('💡 Try: portfolioDebug.testConnection()');
});
