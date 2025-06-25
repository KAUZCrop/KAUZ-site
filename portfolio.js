// portfolio.js (최종 수정 - ProjectSummary & ProjectDetail 필드 적용)
// 🔥 데이터 개수와 상관없이 첫 페이지는 무조건 로딩
// 🔥 Contact 배너 클릭시 contact.html로 이동
// 🆕 ProjectSummary & ProjectDetail Airtable 필드 연동

document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 Portfolio.js starting with ProjectSummary & ProjectDetail fields...');

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

  // ─── 🔄 대체 데이터 (ProjectSummary & ProjectDetail 필드 적용) ───
  function getFallbackData() {
    console.log('🔄 Using fallback data with ProjectSummary & ProjectDetail fields...');
    return [
      {
        id: 'fallback-1',
        fields: {
          'Title': 'VALENTINO SS24 COLLECTION',
          'Category': 'Branding Campaign',
          'Client': 'VALENTINO',
          'Description': '럭셔리 브랜드의 프리미엄 브랜딩 전략',
          'ProjectSummary': 'VALENTINO SS24 컬렉션의 럭셔리 브랜딩 전략을 통해 프리미엄 고객층의 브랜드 충성도를 극대화하는 캠페인을 기획했습니다. 이탈리아 장인정신과 현대적 감성을 결합한 독창적인 접근으로 브랜드 가치를 재정립했습니다.',
          'ProjectDetail': '글로벌 럭셔리 시장의 트렌드 분석과 타겟 고객의 심층 인사이트를 바탕으로 전방위적 브랜딩 전략을 실행했습니다. 디지털과 오프라인을 아우르는 통합 캠페인으로 브랜드 인지도와 매출 모두에서 탁월한 성과를 달성했습니다.',
          'SalesGrowth': '45%',
          'Reach': '2.8M',
          'Engagement': '12%',
          'ROAS': '3.2x',
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
          'ProjectSummary': 'ACNE STUDIOS의 브랜드 정체성을 강화하면서도 퍼포먼스 마케팅의 효율성을 극대화하는 통합 캠페인을 기획했습니다. 창의적 콘텐츠와 데이터 분석의 조화로 브랜드 가치와 매출 성장을 동시에 달성했습니다.',
          'ProjectDetail': '타겟 오디언스의 세밀한 세그먼테이션과 개인화된 메시징을 통해 높은 전환율을 기록했습니다. 실시간 데이터 모니터링과 최적화를 통해 캠페인 전반에 걸쳐 지속적인 성과 개선을 이뤄냈습니다.',
          'SalesGrowth': '65%',
          'Reach': '1.2M',
          'Engagement': '8.5%',
          'ROAS': '4.2x',
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
          'ProjectSummary': 'LG전자의 혁신 기술을 감성적 스토리텔링으로 풀어낸 브랜드 필름 캠페인을 기획했습니다. 첨단 기술의 인간적 가치를 부각시켜 소비자의 브랜드 친밀도를 높이는 것이 주요 목표였습니다.',
          'ProjectDetail': '기술과 인간의 조화라는 핵심 메시지를 다양한 채널에서 일관되게 전달하며, 브랜드 스토리의 확장성을 확보했습니다. 감성적 어필과 기능적 우수성을 균형있게 어필하여 브랜드 선호도 향상에 기여했습니다.',
          'SalesGrowth': '28%',
          'Reach': '5.2M',
          'Engagement': '15%',
          'ROAS': '2.5x',
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
          'ProjectSummary': 'AMOREPACIFIC의 프리미엄 뷰티 브랜드를 위한 오감 체험형 BTL 캠페인을 기획했습니다. 브랜드의 헤리티지와 혁신 기술을 동시에 체험할 수 있는 독창적인 이벤트로 고객 만족도를 극대화했습니다.',
          'ProjectDetail': '뷰티 전문가와의 1:1 컨설팅, AR 기술을 활용한 가상 메이크업 체험, 프리미엄 제품 샘플링을 통해 브랜드 가치를 직접적으로 전달했습니다. 참여 고객의 높은 구매 전환율과 브랜드 충성도 향상을 달성했습니다.',
          'SalesGrowth': '52%',
          'Reach': '800K',
          'Engagement': '22%',
          'ROAS': '3.8x',
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
          'ProjectSummary': 'NAVER의 기업 브랜딩을 강화하는 대규모 이벤트를 기획하고 실행했습니다. 기술 혁신과 사회적 가치를 동시에 어필할 수 있는 차별화된 이벤트로 브랜드 인지도와 호감도를 향상시켰습니다.',
          'ProjectDetail': '온라인과 오프라인을 연결하는 하이브리드 이벤트 형태로 더 많은 참여자에게 다가갔습니다. 인터랙티브 체험존과 전문가 강연을 통해 NAVER의 기술력과 비전을 효과적으로 전달했습니다.',
          'SalesGrowth': '35%',
          'Reach': '3.5M',
          'Engagement': '18%',
          'ROAS': '2.8x',
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
          'ProjectSummary': 'COUPANG의 급성장하는 이커머스 플랫폼을 위한 데이터 기반 퍼포먼스 마케팅 캠페인을 설계했습니다. 고객 생애 가치 최대화와 신규 고객 확보를 동시에 달성하는 전략을 실행했습니다.',
          'ProjectDetail': '머신러닝 알고리즘을 활용한 개인화된 광고 집행과 실시간 입찰 최적화를 통해 광고 효율성을 극대화했습니다. 다양한 채널별 성과 분석을 통해 최적의 미디어 믹스를 구성하여 ROI를 지속적으로 개선했습니다.',
          'SalesGrowth': '78%',
          'Reach': '2.1M',
          'Engagement': '11%',
          'ROAS': '4.5x',
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
          'ProjectSummary': 'SAMSUNG GALAXY의 최신 스마트폰 출시를 위한 글로벌 디지털 캠페인을 기획했습니다. 혁신적인 기술력과 사용자 경험의 우수성을 전 세계 소비자에게 효과적으로 전달하는 통합 마케팅 전략을 실행했습니다.',
          'ProjectDetail': '다양한 국가와 문화권의 특성을 고려한 로컬라이제이션 전략을 통해 글로벌 일관성과 지역별 차별화를 동시에 구현했습니다. 인플루언서 마케팅과 소셜 미디어 캠페인을 통해 젊은 소비자층의 높은 참여도를 이끌어냈습니다.',
          'SalesGrowth': '55%',
          'Reach': '8.5M',
          'Engagement': '16%',
          'ROAS': '3.8x',
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
          'ProjectSummary': 'HYUNDAI MOTOR의 미래 모빌리티 비전을 반영한 새로운 브랜드 아이덴티티 구축 프로젝트를 진행했습니다. 전기차와 자율주행 기술의 선도 기업으로서의 브랜드 포지셔닝을 강화하는 전략을 실행했습니다.',
          'ProjectDetail': '지속가능성과 혁신 기술이라는 핵심 가치를 중심으로 브랜드 메시지를 재정립하고, 모든 브랜드 터치포인트에서 일관된 경험을 제공할 수 있는 가이드라인을 수립했습니다. 미래 지향적인 브랜드 이미지 구축을 통해 브랜드 선호도를 크게 향상시켰습니다.',
          'SalesGrowth': '42%',
          'Reach': '12M',
          'Engagement': '14%',
          'ROAS': '2.9x',
          'Image': null
        }
      }
    ];
  }

  // ─── 🎨 Airtable 필드에 맞춘 모달 생성 (ProjectSummary & ProjectDetail 적용) ───
  function generateAllModals(records) {
    console.log('🏗️ Generating modals with ProjectSummary & ProjectDetail fields...');

    // 기존 모달들 제거
    document.querySelectorAll('.modal[id^="modal"]').forEach(modal => modal.remove());

    records.forEach((record, index) => {
      const fields = record.fields;
      const modalId = `modal${index + 1}`;

      // 🔥 Airtable 필드 정확 매핑
      const title = fields['Title'] || 'UNTITLED PROJECT';
      const category = fields['Category'] || 'PROJECT';
      const client = fields['Client'] || 'KAUZ';
      const description = fields['Description'] || '상세한 프로젝트 정보가 추가될 예정입니다.';
      
      // 🆕 새로운 필드들 추가
      const projectSummary = fields['ProjectSummary'] || '프로젝트 요약이 준비 중입니다.';
      const projectDetail = fields['ProjectDetail'] || '프로젝트 상세 내용이 준비 중입니다.';
      
      // 성과 지표 (ROAS 필드 사용)
      const salesGrowth = fields['SalesGrowth'] || 'N/A';
      const reach = fields['Reach'] || 'N/A';
      const engagement = fields['Engagement'] || 'N/A';
      const roas = fields['ROAS'] || 'N/A';

      // 이미지 URL
      let imageUrl = null;
      let hasHeroImage = false;
      if (fields['Image'] && Array.isArray(fields['Image']) && fields['Image'].length > 0) {
        imageUrl = fields['Image'][0].url;
        hasHeroImage = true;
      }

      // 🔥 수정된 모달 HTML (ProjectSummary & ProjectDetail 적용)
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
                    <p>${projectSummary}</p>
                    <p><strong>Client:</strong> ${client}</p>
                  </div>
                  <div class="content-text">
                    <p>${projectDetail}</p>
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
                    <div class="metric-value">${roas}</div>
                    <div class="metric-label">ROAS</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      // DOM에 모달 추가
      document.body.insertAdjacentHTML('beforeend', modalHtml);
      
      console.log(`✅ Modal generated for: ${title} (ID: ${modalId})`);
    });

    modalsGenerated = true;
    console.log(`🏗️ All modals generated: ${records.length} modals created with ProjectSummary & ProjectDetail`);
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
          <p style="font-size: 0.9rem; color: #666; margin-top: 0.5rem;">ProjectSummary & ProjectDetail 필드 연동 🎯</p>
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
          alert(`✅ KAUZ Work 테이블 연결 성공!\n\n${data.length}개의 레코드를 가져왔습니다.\nProjectSummary & ProjectDetail 필드가 연동됩니다.`);
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
🔍 KAUZ Portfolio 연결 정보 (ProjectSummary & ProjectDetail)

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

🆕 새로운 필드:
• ProjectSummary: 프로젝트 요약
• ProjectDetail: 프로젝트 상세 내용
      `;
      
      alert(info);
    },
    
    // 대체 데이터 로드
    loadFallbackData: async () => {
      console.log('🔄 Loading fallback data...');
      const fallbackData = getFallbackData();
      await initPortfolioWithData(fallbackData);
      
      alert(`📋 샘플 데이터를 표시했습니다.\n\n${fallbackData.length}개의 샘플 프로젝트\nProjectSummary & ProjectDetail 필드 포함`);
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
    console.log('🎯 Initializing portfolio with data:', data.length, 'items');
    
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

  // ─── 🔧 Contact 디버깅 도구 추가 ───
  window.portfolioContactDebug = {
    testClick: () => {
      console.log('🧪 Testing contact banner click...');
      const contactBanner = document.getElementById('contact');
      if (contactBanner) {
        contactBanner.click();
      } else {
        console.error('❌ Contact banner not found');
      }
    },
    
    checkElement: () => {
      const contactBanner = document.getElementById('contact');
      console.log('🔍 Contact banner element:', contactBanner);
      console.log('📊 Element info:', {
        exists: !!contactBanner,
        id: contactBanner?.id,
        tagName: contactBanner?.tagName,
        classList: contactBanner?.classList,
        hasClickListener: !!contactBanner?._listeners
      });
    },
    
    forceRedirect: () => {
      console.log('🚀 Force redirecting to contact.html...');
      window.location.href = 'contact.html';
    }
  };

  // ─── 🚀 메인 초기화 함수 ───
  async function initPortfolio() {
    console.log('🚀 Initializing KAUZ Portfolio with ProjectSummary & ProjectDetail fields...');
    console.log('🔧 Configuration:', {
      baseId: AIRTABLE_CONFIG.BASE_ID,
      tableName: 'KAUZ Work',
      hasApiKey: !!AIRTABLE_CONFIG.API_KEY,
      itemsPerPage: ITEMS_PER_PAGE,
      projectSummaryField: true,
      projectDetailField: true,
      contactNavigation: true
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
    
    console.log('✅ Portfolio initialization complete with ProjectSummary & ProjectDetail fields');
    console.log(`🎯 Setup: ${portfolioData.length} total items, ProjectSummary & ProjectDetail enabled, contact navigation enabled`);
  }

  // ─── 🏁 최종 초기화 실행 ───
  initPortfolio();

  console.log('✅ Portfolio.js loaded - ProjectSummary & ProjectDetail Fields Applied');
  console.log('🔧 Debug tools: portfolioDebug.*, portfolioContactDebug.*');
});
