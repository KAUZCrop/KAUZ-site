// portfolio.js (새로운 모달 구조 적용)
// 🔥 기존 무한스크롤 + Airtable 연동 유지
// 🆕 메인+서브 이미지 구조 적용

document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 Portfolio.js starting with New Modal Structure...');

  // ─── 🔧 KAUZ Work 테이블 설정 ───
  const AIRTABLE_CONFIG = {
    BASE_ID: 'appglO0MOXGY7CITU',
    API_KEY: 'patouGO5iPVpIxbRf.e4bdbe02fe59cbe69f201edaa32b4b63f8e05dbbfcae34173f0f40c985b811d9',
    TABLE_NAME: 'KAUZ%20Work'
  };

  // ─── 📊 무한스크롤 관련 변수들 ───
  const ITEMS_PER_PAGE = 6; // 한 번에 로딩할 아이템 수
  let currentPage = 0;
  let allPortfolioData = []; // 전체 데이터 저장
  let displayedData = []; // 현재 화면에 표시된 데이터
  let isLoading = false;
  let hasMoreData = true;
  let modalsGenerated = false;
  let scrollObserver = null;

  // DOM 요소 참조
  let portfolioGrid = null;
  let loadingIndicator = null;
  let portfolioEndMessage = null;
  let scrollTrigger = null;

  // ─── 🛡️ 안전한 DOM 요소 초기화 ───
  function initializeDOMElements() {
    console.log('🔍 Initializing DOM elements...');
    
    // 포트폴리오 그리드 찾기
    portfolioGrid = document.getElementById('portfolioGrid');
    if (!portfolioGrid) {
      console.error('❌ portfolioGrid not found! Check HTML structure.');
      return false;
    }
    
    // 로딩 인디케이터 찾기/생성
    loadingIndicator = document.getElementById('loadingIndicator');
    if (!loadingIndicator) {
      console.log('🔧 Creating loadingIndicator...');
      loadingIndicator = document.createElement('div');
      loadingIndicator.id = 'loadingIndicator';
      loadingIndicator.className = 'loading-indicator';
      loadingIndicator.style.display = 'none';
      loadingIndicator.innerHTML = `
        <div class="loading-spinner"></div>
        <p>더 많은 작품을 불러오는 중...</p>
      `;
      portfolioGrid.parentNode.appendChild(loadingIndicator);
    }
    
    // 종료 메시지 찾기/생성
    portfolioEndMessage = document.getElementById('portfolioEndMessage');
    if (!portfolioEndMessage) {
      console.log('🔧 Creating portfolioEndMessage...');
      portfolioEndMessage = document.createElement('div');
      portfolioEndMessage.id = 'portfolioEndMessage';
      portfolioEndMessage.className = 'portfolio-end-message';
      portfolioEndMessage.style.cssText = `
        display: none;
        justify-content: center;
        align-items: center;
        padding: 4rem 0;
        margin-top: 3rem;
        text-align: center;
        width: 100%;
      `;
      portfolioEndMessage.innerHTML = `
        <div class="end-message-content" style="
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.8rem;
          padding: 0;
          background: none;
          border: none;
        ">
          <span class="update-icon" style="
            font-size: 1.5rem;
            line-height: 1;
            display: inline-block;
            color: #E37031;
            font-weight: bold;
          ">↺</span>
          <p style="
            color: #ccc;
            font-size: 1.1rem;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            font-weight: 500;
          ">Update our portfolio soon</p>
        </div>
      `;
      portfolioGrid.parentNode.appendChild(portfolioEndMessage);
    }
    
    // 스크롤 트리거 찾기/생성
    scrollTrigger = document.getElementById('scrollTrigger');
    if (!scrollTrigger) {
      console.log('🔧 Creating scrollTrigger...');
      scrollTrigger = document.createElement('div');
      scrollTrigger.id = 'scrollTrigger';
      scrollTrigger.className = 'scroll-trigger';
      scrollTrigger.style.height = '10px';
      scrollTrigger.style.opacity = '0';
      scrollTrigger.style.pointerEvents = 'none';
      portfolioGrid.parentNode.appendChild(scrollTrigger);
    }
    
    console.log('✅ All DOM elements ready:', {
      portfolioGrid: !!portfolioGrid,
      loadingIndicator: !!loadingIndicator,
      portfolioEndMessage: !!portfolioEndMessage,
      scrollTrigger: !!scrollTrigger
    });
    
    return true;
  }

  // ─── 📡 Airtable에서 포트폴리오 데이터 가져오기 ───
  async function fetchPortfolioData() {
    try {
      console.log('🔗 Fetching portfolio data from KAUZ Work table...');
      
      const url = `https://api.airtable.com/v0/${AIRTABLE_CONFIG.BASE_ID}/${AIRTABLE_CONFIG.TABLE_NAME}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Data received:', data.records?.length || 0, 'records');
      
      // 🔍 실제 필드 구조 확인
      if (data.records && data.records.length > 0) {
        console.log('📋 Available fields:', Object.keys(data.records[0].fields));
        console.log('🔍 First record sample:', data.records[0].fields);
      }
      
      return data.records || [];
      
    } catch (error) {
      console.error('❌ Data loading failed:', error);
      return getFallbackData();
    }
  }

  // ─── 🔄 대체 데이터 ───
  function getFallbackData() {
    console.log('🔄 Using fallback data with new modal structure...');
    return [
      {
        id: 'fallback-1',
        fields: {
          'Title': 'VALENTINO SS24 COLLECTION',
          'Category': 'Branding Campaign',
          'Client': 'VALENTINO',
          'Description': '럭셔리 브랜드의 프리미엄 브랜딩 전략',
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
          'Image': null
        }
      },
      {
        id: 'fallback-5',
        fields: {
          'Title': 'NAVER',
          'Category': 'Event Planning',
          'Client': 'NAVER',
          'Description': '브랜드 가치를 높이는 특별한 행사',
          'Image': null
        }
      },
      {
        id: 'fallback-6',
        fields: {
          'Title': 'COUPANG',
          'Category': 'Performance Marketing',
          'Client': 'COUPANG',
          'Description': '데이터 기반 퍼포먼스 최적화',
          'Image': null
        }
      },
      {
        id: 'fallback-7',
        fields: {
          'Title': 'SAMSUNG GALAXY',
          'Category': 'Digital Campaign',
          'Client': 'SAMSUNG',
          'Description': '혁신 모바일 기술의 글로벌 캠페인',
          'Image': null
        }
      },
      {
        id: 'fallback-8',
        fields: {
          'Title': 'HYUNDAI MOTOR',
          'Category': 'Brand Identity',
          'Client': 'HYUNDAI',
          'Description': '미래 모빌리티 브랜드 아이덴티티 구축',
          'Image': null
        }
      }
    ];
  }

  // ─── 🎨 새로운 모달 구조 생성 (메인+서브 이미지) ───
  function generateAllModals(records) {
    console.log('🏗️ Generating new modal structure (main+sub images)...');

    // 기존 모달들 제거
    document.querySelectorAll('.modal[id^="modal"]').forEach(modal => modal.remove());

    records.forEach((record, index) => {
      const fields = record.fields;
      const modalId = `modal${index + 1}`;

      // 🔥 Airtable 필드 정확 매핑
      const title = fields['Title'] || 'UNTITLED PROJECT';
      const category = fields['Category'] || 'CAMPAIGN';
      const client = fields['Client'] || 'BRAND';
      
      // 🔥 이미지 배열 처리
      let images = [];
      if (fields['Image'] && Array.isArray(fields['Image']) && fields['Image'].length > 0) {
        images = fields['Image'];
      }

      // 🔥 메인 이미지 (첫 번째 이미지)
      const mainImage = images.length > 0 ? images[0] : null;
      
      // 🔥 서브 이미지들 (나머지 이미지들, 최대 3개)
      const subImages = images.slice(1, 4); // 2번째부터 4번째까지 (최대 3개)

      console.log(`🎯 Modal ${modalId} images:`, {
        total: images.length,
        mainImage: !!mainImage,
        subImages: subImages.length
      });

      // 🔥 새로운 모달 HTML 구조
      const modalHtml = `
        <div id="${modalId}" class="modal">
          <div class="modal-content">
            
            <!-- 🔥 상단 헤더 (sticky) -->
            <div class="modal-header">
              <div class="modal-header-top">
                <div class="modal-logo">KAUZ</div>
                <button class="modal-close" onclick="closeModal('${modalId}')"></button>
              </div>
              <h1 class="modal-brand-title">${client}</h1>
              <div class="modal-category">${category}</div>
            </div>

            <!-- 🔥 바디 -->
            <div class="modal-body">
              
              <!-- 🔥 메인 이미지 (전체 너비) -->
              <div class="main-image-section">
                ${mainImage 
                  ? `<img src="${mainImage.url}" alt="${title}" class="main-image">`
                  : `<div class="main-image-placeholder">MAIN CAMPAIGN IMAGE</div>`
                }
              </div>
              
              <!-- 🔥 서브 이미지들 (가로 배치) -->
              ${subImages.length > 0 ? `
                <div class="sub-images-container">
                  ${subImages.map((subImg, subIndex) => `
                    <div class="sub-image-section">
                      <img src="${subImg.url}" alt="${title} Detail ${subIndex + 1}" class="sub-image">
                    </div>
                  `).join('')}
                </div>
              ` : ''}
              
            </div>
            
            <!-- 🔥 면책 조항 -->
            <div class="modal-disclaimer">
              *전 직장 근무 시 참여한 프로젝트입니다.
            </div>
            
          </div>
        </div>
      `;

      // DOM에 모달 추가
      document.body.insertAdjacentHTML('beforeend', modalHtml);
      
      console.log(`✅ Modal generated: ${title} (ID: ${modalId}) - Main: ${!!mainImage}, Subs: ${subImages.length}`);
    });

    modalsGenerated = true;
    console.log(`🏗️ All modals generated: ${records.length} modals with new structure`);
  }

  // ─── 🎨 포트폴리오 데이터 렌더링 (무한스크롤용) ───
  function renderPortfolioItems(records, append = false) {
    if (!portfolioGrid) {
      console.error('❌ Portfolio grid element not found');
      return;
    }

    if (!records || records.length === 0) {
      if (!append) {
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
      }
      return;
    }

    // 🔥 HTML 생성 (Airtable 필드 정확 매핑)
    const portfolioHtml = records.map((record, index) => {
      const fields = record.fields;
      const globalIndex = displayedData.length + index; // 전체 인덱스 계산
      const modalId = `modal${globalIndex + 1}`;
      
      // 🔥 Airtable 필드 정확 매핑
      const title = fields['Title'] || 'UNTITLED PROJECT';
      const category = fields['Category'] || 'CAMPAIGN';
      
      // 이미지 처리
      let imageUrl = null;
      let hasImage = false;
      
      if (fields['Image'] && Array.isArray(fields['Image']) && fields['Image'].length > 0) {
        imageUrl = fields['Image'][0].url;
        hasImage = true;
      }
      
      console.log(`🔍 Record ${globalIndex + 1} mapping:`, {
        title,
        category,
        hasImage,
        modalId,
        recordId: record.id
      });
      
      return `
        <div class="project-card fade-in" 
             data-filter="${category.toLowerCase()}" 
             onclick="openModal('${modalId}')"
             style="animation-delay: ${index * 0.1}s">
          <div class="project-image-container">
            ${hasImage 
              ? `<img src="${imageUrl}" alt="${title} Campaign" class="portfolio-image" loading="lazy" onerror="handleImageError(this)" />`
              : `<div class="image-placeholder">CAMPAIGN IMAGE</div>`
            }
          </div>
          <div class="project-info">
            <div class="project-title">${title}</div>
            <div class="project-category">${category}</div>
          </div>
        </div>
      `;
    }).join('');

    // DOM에 추가 (append 모드면 기존 내용에 추가, 아니면 교체)
    if (append) {
      portfolioGrid.insertAdjacentHTML('beforeend', portfolioHtml);
    } else {
      portfolioGrid.innerHTML = portfolioHtml;
    }

    // 표시된 데이터 업데이트
    if (append) {
      displayedData = [...displayedData, ...records];
    } else {
      displayedData = [...records];
    }

    // 애니메이션 초기화
    initFadeUpAnimations();
    
    console.log(`✅ Portfolio items rendered: ${records.length} items (append: ${append})`);
    console.log(`📊 Total displayed items: ${displayedData.length}`);
  }

  // ─── 🔄 다음 페이지 로딩 함수 (수정됨) ───
  async function loadNextPage() {
    // 🔥 첫 페이지는 무조건 로딩하도록 수정
    if (currentPage > 0 && (isLoading || !hasMoreData)) {
      console.log('🚫 Loading blocked:', { currentPage, isLoading, hasMoreData });
      return;
    }

    isLoading = true;
    if (currentPage > 0) {  // 첫 페이지가 아닐 때만 로딩 인디케이터 표시
      showLoadingIndicator();
    }

    console.log(`📄 Loading page ${currentPage + 1}...`);

    try {
      // 다음 페이지 데이터 계산
      const startIndex = currentPage * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const nextPageData = allPortfolioData.slice(startIndex, endIndex);

      console.log(`📊 Page ${currentPage + 1} data:`, {
        startIndex,
        endIndex,
        itemsCount: nextPageData.length,
        totalData: allPortfolioData.length
      });

      if (nextPageData.length === 0) {
        // 더 이상 로딩할 데이터가 없음
        hasMoreData = false;
        hideLoadingIndicator();
        showEndMessage();
        console.log('🏁 No more data to load');
        return;
      }

      // 첫 페이지가 아니면 모달도 추가 생성
      if (currentPage > 0) {
        // 기존 displayedData와 합쳐서 전체 모달 재생성
        const allDisplayedData = [...displayedData, ...nextPageData];
        generateAllModals(allDisplayedData);
      }

      // 포트폴리오 아이템 렌더링 (append 모드)
      renderPortfolioItems(nextPageData, currentPage > 0);

      currentPage++;

      // 🔥 hasMoreData 상태 업데이트 수정
      if (currentPage * ITEMS_PER_PAGE >= allPortfolioData.length) {
        hasMoreData = false;
        // 🎯 항상 종료 메시지 표시 (데이터 개수 상관없이)
        showEndMessage();
        console.log('🏁 All data loaded');
      }

    } catch (error) {
      console.error('❌ Error loading next page:', error);
    } finally {
      isLoading = false;
      hideLoadingIndicator();
    }
  }

  // ─── 🎯 무한스크롤 초기화 함수 ───
  function initInfiniteScroll() {
    if (!scrollTrigger) {
      console.warn('⚠️ Scroll trigger element not found');
      return;
    }

    // 기존 옵저버 정리
    if (scrollObserver) {
      scrollObserver.disconnect();
    }

    // 새로운 Intersection Observer 생성
    scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && hasMoreData && !isLoading) {
          console.log('🎯 Scroll trigger activated - loading next page...');
          loadNextPage();
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '100px 0px'
    });

    scrollObserver.observe(scrollTrigger);
    console.log('✅ Infinite scroll observer initialized');
  }

  // ─── 💫 로딩 인디케이터 관리 함수들 ───
  function showLoadingIndicator() {
    if (loadingIndicator) {
      loadingIndicator.style.display = 'flex';
      console.log('⏳ Loading indicator shown');
    }
  }

  function hideLoadingIndicator() {
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
      console.log('✅ Loading indicator hidden');
    }
  }

  function showEndMessage() {
    if (portfolioEndMessage) {
      portfolioEndMessage.style.display = 'flex';
      // 🎯 확실히 보이도록 추가 스타일 적용
      portfolioEndMessage.style.visibility = 'visible';
      portfolioEndMessage.style.opacity = '1';
      console.log('🏁 End message shown with enhanced visibility');
      
      // 🔥 스크롤해서 메시지 확인할 수 있도록 위치 조정
      setTimeout(() => {
        portfolioEndMessage.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest' 
        });
      }, 500);
    }
  }

  function hideEndMessage() {
    if (portfolioEndMessage) {
      portfolioEndMessage.style.display = 'none';
      console.log('📝 End message hidden');
    }
  }

  // ─── 🖼️ 이미지 로드 실패 처리 함수 ───
  window.handleImageError = function(img) {
    console.warn('⚠️ Image load failed for:', img.src);
    const container = img.parentElement;
    if (container) {
      container.innerHTML = '<div class="image-placeholder">CAMPAIGN IMAGE</div>';
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

  // ─── 🔍 모달 함수들 ───
  window.openModal = function(modalId) {
    console.log('🔍 Opening modal:', modalId);
    
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      console.log('✅ Modal opened successfully:', modalId);
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

  // ─── 💡 로딩 메시지 표시 함수 ───
  function showLoadingMessage() {
    if (portfolioGrid) {
      portfolioGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: #ccc; padding: 4rem;">
          <div style="display: inline-block; width: 40px; height: 40px; border: 3px solid #333; border-top: 3px solid #E37031; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem;"></div>
          <p style="font-size: 1.1rem;">KAUZ Work 테이블에서 데이터를 불러오는 중...</p>
          <p style="font-size: 0.9rem; color: #666; margin-top: 0.5rem;">새로운 모달 구조 적용 🎨</p>
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

  // ─── 🔧 디버깅 도구 ───
  window.portfolioDebug = {
    // 연결 테스트
    testConnection: async () => {
      console.log('🧪 Testing KAUZ Work table connection...');
      showLoadingMessage();
      
      try {
        const data = await fetchPortfolioData();
        await initPortfolioWithData(data);
        
        if (data.length > 0) {
          alert(`✅ KAUZ Work 테이블 연결 성공!\n\n${data.length}개의 레코드를 가져왔습니다.\n새로운 모달 구조가 적용됩니다.`);
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
🔍 KAUZ Portfolio 연결 정보 (새로운 모달)

📋 설정:
• 베이스 ID: ${AIRTABLE_CONFIG.BASE_ID}
• 테이블 이름: "KAUZ Work"
• API 키: ${AIRTABLE_CONFIG.API_KEY ? '설정됨' : '❌ 없음'}
• 한 페이지당 아이템: ${ITEMS_PER_PAGE}개

📊 현재 상태:
• 현재 페이지: ${currentPage}
• 표시된 아이템: ${displayedData.length}개
• 전체 데이터: ${allPortfolioData.length}개
• 더 로딩 가능: ${hasMoreData ? '✅' : '❌'}

🎨 새로운 모달 구조:
• 상단 sticky 헤더
• 메인 이미지 (60vh)
• 서브 이미지들 가로 배치 (25vh)
• 하단 여백 충분히 확보
      `;
      
      alert(info);
    },
    
    // 대체 데이터 로드
    loadFallbackData: async () => {
      console.log('🔄 Loading fallback data...');
      const fallbackData = getFallbackData();
      await initPortfolioWithData(fallbackData);
      
      alert(`📋 샘플 데이터를 표시했습니다.\n\n${fallbackData.length}개의 샘플 프로젝트\n새로운 모달 구조 포함`);
    },
    
    // 🎯 종료 메시지 강제 표시 (테스트용)
    showEndMessage: () => {
      console.log('🧪 Manually showing end message...');
      showEndMessage();
      alert('🏁 "Update our portfolio soon" 메시지를 강제로 표시했습니다.');
    },
    
    // 🔍 DOM 요소 상태 확인
    checkElements: () => {
      const elements = {
        portfolioGrid: !!portfolioGrid,
        loadingIndicator: !!loadingIndicator,
        portfolioEndMessage: !!portfolioEndMessage,
        scrollTrigger: !!scrollTrigger
      };
      console.log('📋 DOM Elements Status:', elements);
      alert(`DOM 요소 상태:\n${Object.entries(elements).map(([key, value]) => `${key}: ${value ? '✅' : '❌'}`).join('\n')}`);
    }
  };

  // ─── 🚀 포트폴리오 데이터로 초기화하는 함수 (수정됨) ───
  async function initPortfolioWithData(data) {
    console.log('🎯 Initializing portfolio with new modal data:', data.length, 'items');
    
    // 전역 데이터 설정
    allPortfolioData = data;
    currentPage = 0;
    displayedData = [];
    // 🔥 hasMoreData 로직 수정 - 첫 페이지는 무조건 로딩
    hasMoreData = true;  // 일단 true로 설정
    isLoading = false;
    modalsGenerated = false;

    // 첫 페이지 로딩 (무조건 실행)
    await loadNextPage();

    // 🔥 첫 페이지 로딩 후 hasMoreData 재설정
    hasMoreData = allPortfolioData.length > ITEMS_PER_PAGE;

    // 🎯 데이터가 6개 이하면 바로 종료 메시지 표시
    if (allPortfolioData.length <= ITEMS_PER_PAGE) {
      setTimeout(() => {
        showEndMessage();
        console.log('🏁 Showing end message for small dataset');
      }, 1000);
    }

    // 무한스크롤 초기화
    initInfiniteScroll();

    console.log(`✅ Portfolio initialized: ${data.length} total items, ${ITEMS_PER_PAGE} per page`);
  }

  // ─── 🔗 Contact 배너 클릭 이벤트 초기화 ───
  function initContactBannerClick() {
    console.log('🔗 Initializing Contact banner click event...');
    
    // Contact 배너 요소 찾기
    const contactBanner = document.getElementById('contact');
    
    if (contactBanner) {
      // 클릭 이벤트 추가
      contactBanner.addEventListener('click', () => {
        console.log('🎯 Contact banner clicked - redirecting to contact.html');
        
        // Contact 페이지로 이동
        window.location.href = 'contact.html';
      });
      
      // 호버 효과 강화
      contactBanner.addEventListener('mouseenter', () => {
        contactBanner.style.cursor = 'pointer';
        console.log('👆 Contact banner hover - cursor pointer activated');
      });
      
      contactBanner.addEventListener('mouseleave', () => {
        contactBanner.style.cursor = 'pointer';
      });
      
      console.log('✅ Contact banner click event successfully added');
      console.log('🎯 Click target: #contact section');
      console.log('📍 Redirect destination: contact.html');
      
    } else {
      console.warn('⚠️ Contact banner element (#contact) not found!');
      console.log('🔍 Will retry after DOM is fully loaded...');
      
      // DOM이 완전히 로드된 후 다시 시도
      setTimeout(() => {
        const retryContactBanner = document.getElementById('contact');
        if (retryContactBanner) {
          retryContactBanner.addEventListener('click', () => {
            console.log('🎯 Contact banner clicked (retry) - redirecting to contact.html');
            window.location.href = 'contact.html';
          });
          console.log('✅ Contact banner click event added (retry success)');
        } else {
          console.error('❌ Contact banner element still not found after retry');
        }
      }, 2000);
    }
  }

  // ─── 🔥 키보드 접근성 추가 (Enter 키로도 이동 가능) ───
  function initContactKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      const contactBanner = document.getElementById('contact');
      
      if (e.key === 'Enter' && document.activeElement === contactBanner) {
        console.log('⌨️ Contact banner activated via Enter key');
        window.location.href = 'contact.html';
      }
    });
    
    console.log('✅ Contact keyboard navigation initialized');
  }

  // ─── 🚀 메인 초기화 함수 ───
  async function initPortfolio() {
    console.log('🚀 Initializing KAUZ Portfolio with New Modal Structure...');
    console.log('🔧 Configuration:', {
      baseId: AIRTABLE_CONFIG.BASE_ID,
      tableName: 'KAUZ Work',
      hasApiKey: !!AIRTABLE_CONFIG.API_KEY,
      itemsPerPage: ITEMS_PER_PAGE,
      modalStructure: 'Main + Sub Images',
      shareButtons: false,
      scrollIndicator: false
    });
    
    // 1. DOM 요소 초기화
    const domReady = initializeDOMElements();
    if (!domReady) {
      console.error('❌ DOM initialization failed');
      return;
    }

    // 2. 로딩 메시지 표시
    showLoadingMessage();
    
    // 3. KAUZ Work 테이블에서 데이터 로드
    const portfolioData = await fetchPortfolioData();
    
    // 4. 데이터로 포트폴리오 초기화
    await initPortfolioWithData(portfolioData);
    
    // 🔥 5. Contact 배너 클릭 이벤트 초기화
    initContactBannerClick();
    
    // 🔥 6. Contact 키보드 네비게이션 초기화
    initContactKeyboardNavigation();
    
    console.log('✅ Portfolio initialization complete with New Modal Structure');
    console.log(`🎯 Setup: ${portfolioData.length} total items, main+sub images, clean design`);
  }

  // ─── 🏁 최종 초기화 실행 ───
  initPortfolio();

  console.log('✅ Portfolio.js loaded - New Modal Structure Applied');
  console.log('🔧 Debug tools: portfolioDebug.*');
});
