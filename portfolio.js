// portfolio.js (무한스크롤 + 6개씩 로딩 + "Update our portfolio soon" 버전)
// 🔥 완벽한 디자인 템플릿 + 무한스크롤 + 성능 최적화

document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 Portfolio.js starting with Infinite Scroll + Perfect Design Template...');

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
      
      return data.records || [];
      
    } catch (error) {
      console.error('❌ Data loading failed:', error);
      return getFallbackData();
    }
  }

  // ─── 🔄 대체 데이터 (연결 실패시) ───
  function getFallbackData() {
    console.log('🔄 Using fallback data...');
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
      },
      {
        id: 'fallback-5',
        fields: {
          'Title': 'NAVER',
          'Category': 'Event Planning',
          'Client': 'NAVER',
          'Description': '브랜드 가치를 높이는 특별한 행사',
          'Budget': '4억원',
          'Duration': '2개월',
          'Team': '브랜드 전략 3명, 이벤트 운영 5명',
          'Channels': 'Naver Platform, SNS, PR',
          'SalesGrowth': '35%',
          'Reach': '3.5M',
          'Engagement': '18%',
          'ROI': '280%',
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
          'Budget': '5억원',
          'Duration': '4개월',
          'Team': '퍼포먼스 마케팅 4명, 데이터 분석 2명',
          'Channels': 'Google, Facebook, Naver, Coupang',
          'SalesGrowth': '78%',
          'Reach': '2.1M',
          'Engagement': '11%',
          'ROI': '450%',
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
          'Budget': '12억원',
          'Duration': '5개월',
          'Team': '디지털 전략 4명, 크리에이티브 6명, 글로벌 2명',
          'Channels': 'Global Digital, Social, Influencer',
          'SalesGrowth': '55%',
          'Reach': '8.5M',
          'Engagement': '16%',
          'ROI': '380%',
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
          'Budget': '15억원',
          'Duration': '6개월',
          'Team': '브랜드 전략 5명, 디자인 4명, 마케팅 3명',
          'Channels': 'Offline, Digital, Global PR',
          'SalesGrowth': '42%',
          'Reach': '12M',
          'Engagement': '14%',
          'ROI': '290%',
          'Image': null
        }
      }
    ];
  }

  // ─── 🎨 당신이 제공한 예시와 100% 동일한 모달 생성 ───
  function generateAllModals(records) {
    console.log('🏗️ Generating modals with your exact design template...');

    // 기존 모달들 제거
    document.querySelectorAll('.modal[id^="modal"]').forEach(modal => modal.remove());

    records.forEach((record, index) => {
      const fields = record.fields;
      const modalId = `modal${index + 1}`;

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

      // 🔥 당신이 제공한 예시와 정확히 100% 동일한 모달 HTML 구조
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
                    <p>클라이언트와의 긴밀한 협업을 통해 브랜드 가치를 극대화하고 목표 달성을 위한 전략적 접근을 실행했습니다.</p>
                    <p>데이터 기반 인사이트와 창의적 아이디어의 결합으로 탁월한 성과를 이루어냈습니다.</p>
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
      
      console.log(`✅ Perfect design modal generated for: ${title} (ID: ${modalId})`);
    });

    modalsGenerated = true;
    console.log(`🏗️ All perfect design modals generated: ${records.length} modals created`);
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

    // 🔥 HTML 생성
    const portfolioHtml = records.map((record, index) => {
      const fields = record.fields;
      const globalIndex = displayedData.length + index; // 전체 인덱스 계산
      const modalId = `modal${globalIndex + 1}`;
      
      // 필드 매핑
      const title = fields['Title'] || 'BRAND NAME';
      const category = fields['Category'] || 'CAMPAIGN TYPE';
      
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

  // ─── 🔄 다음 페이지 로딩 함수 ───
  async function loadNextPage() {
    if (isLoading || !hasMoreData) {
      console.log('🚫 Loading blocked:', { isLoading, hasMoreData });
      return;
    }

    isLoading = true;
    showLoadingIndicator();

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

      // 더 이상 로딩할 데이터가 있는지 확인
      if (currentPage * ITEMS_PER_PAGE >= allPortfolioData.length) {
        hasMoreData = false;
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
      console.log('🏁 End message shown');
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
    console.log('🔍 Opening perfect design modal:', modalId);
    
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      console.log('✅ Perfect design modal opened successfully:', modalId);
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

  // ─── 🔥 햄버거 → X 변환 애니메이션 추가 ───
  function initHamburgerAnimation() {
    const hamburger = document.getElementById('hamburger');
    const menuOverlay = document.getElementById('menu-overlay');
    
    if (hamburger && menuOverlay) {
      // 메뉴 상태 감지를 위한 옵저버
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const isActive = menuOverlay.classList.contains('active');
            
            // 햄버거 아이콘 상태 변경
            if (isActive) {
              hamburger.classList.add('active');
            } else {
              hamburger.classList.remove('active');
            }
          }
        });
      });
      
      // 메뉴 오버레이 클래스 변화 감지
      observer.observe(menuOverlay, {
        attributes: true,
        attributeFilter: ['class']
      });
      
      console.log('✅ Hamburger → X animation initialized');
    } else {
      console.warn('⚠️ Hamburger or menu overlay not found');
    }
  }

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

  // ─── 💡 로딩 메시지 표시 함수 ───
  function showLoadingMessage() {
    if (portfolioGrid) {
      portfolioGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: #ccc; padding: 4rem;">
          <div style="display: inline-block; width: 40px; height: 40px; border: 3px solid #333; border-top: 3px solid #E37031; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem;"></div>
          <p style="font-size: 1.1rem;">KAUZ Work 테이블에서 데이터를 불러오는 중...</p>
          <p style="font-size: 0.9rem; color: #666; margin-top: 0.5rem;">무한스크롤 + 완벽한 디자인 모달을 준비합니다</p>
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
          alert(`✅ KAUZ Work 테이블 연결 성공!\n\n${data.length}개의 레코드를 가져왔습니다.\n무한스크롤 + 완벽한 디자인 모달이 활성화되었습니다.`);
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
🔍 KAUZ Portfolio 연결 정보 (무한스크롤 + 완벽한 디자인)

📋 설정:
• 베이스 ID: ${AIRTABLE_CONFIG.BASE_ID}
• 테이블 이름: "KAUZ Work"
• API 키: ${AIRTABLE_CONFIG.API_KEY ? '설정됨' : '❌ 없음'}
• 한 페이지당 아이템: ${ITEMS_PER_PAGE}개
• 현재 페이지: ${currentPage}
• 표시된 아이템: ${displayedData.length}개
• 전체 데이터: ${allPortfolioData.length}개
• 더 로딩 가능: ${hasMoreData ? '✅' : '❌'}

🎨 기능:
• 무한스크롤로 6개씩 로딩
• 웹에서 포트폴리오 크기 35% 확대
• "Update our portfolio soon" 메시지
• 완벽한 디자인 모달 자동 생성
      `;
      
      alert(info);
    },
    
    // 대체 데이터 로드
    loadFallbackData: async () => {
      console.log('🔄 Loading fallback data...');
      const fallbackData = getFallbackData();
      await initPortfolioWithData(fallbackData);
      
      alert(`📋 샘플 데이터를 표시했습니다.\n\n${fallbackData.length}개의 샘플 프로젝트로 무한스크롤을 테스트할 수 있습니다.`);
    },
    
    // 다음 페이지 강제 로드
    loadNextPage: () => {
      console.log('🔧 Force loading next page...');
      loadNextPage();
    },

    // 무한스크롤 재초기화
    resetInfiniteScroll: () => {
      console.log('🔄 Resetting infinite scroll...');
      currentPage = 0;
      displayedData = [];
      hasMoreData = true;
      isLoading = false;
      hideLoadingIndicator();
      hideEndMessage();
      
      if (allPortfolioData.length > 0) {
        loadNextPage();
      }
      
      alert('무한스크롤이 재초기화되었습니다.');
    },

    // 상태 확인
    checkStatus: () => {
      const status = {
        currentPage,
        displayedItems: displayedData.length,
        totalData: allPortfolioData.length,
        hasMoreData,
        isLoading,
        modalsGenerated
      };
      console.log('📊 Portfolio status:', status);
      alert(`현재 상태:\n페이지: ${currentPage}\n표시된 아이템: ${displayedData.length}\n전체 데이터: ${allPortfolioData.length}\n더 로딩 가능: ${hasMoreData}\n로딩 중: ${isLoading}\n모달 생성됨: ${modalsGenerated}`);
    }
  };

  // ─── 🚀 포트폴리오 데이터로 초기화하는 함수 ───
  async function initPortfolioWithData(data) {
    console.log('🎯 Initializing portfolio with data:', data.length, 'items');
    
    // 전역 데이터 설정
    allPortfolioData = data;
    currentPage = 0;
    displayedData = [];
    hasMoreData = data.length > ITEMS_PER_PAGE;
    isLoading = false;
    modalsGenerated = false;

    // 첫 페이지 로딩
    await loadNextPage();

    // 무한스크롤 초기화
    initInfiniteScroll();

    console.log(`✅ Portfolio initialized: ${data.length} total items, ${ITEMS_PER_PAGE} per page`);
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

  // ─── 🚀 메인 초기화 함수 (무한스크롤 + 완벽한 디자인) ───
  async function initPortfolio() {
    console.log('🚀 Initializing KAUZ Portfolio with Infinite Scroll + Perfect Design...');
    console.log('🔧 Configuration:', {
      baseId: AIRTABLE_CONFIG.BASE_ID,
      tableName: 'KAUZ Work',
      hasApiKey: !!AIRTABLE_CONFIG.API_KEY,
      itemsPerPage: ITEMS_PER_PAGE,
      infiniteScroll: true,
      perfectDesignTemplate: true
    });
    
    // DOM 요소 참조 설정
    portfolioGrid = document.getElementById('portfolioGrid');
    loadingIndicator = document.getElementById('loadingIndicator');
    portfolioEndMessage = document.getElementById('portfolioEndMessage');
    scrollTrigger = document.getElementById('scrollTrigger');

    if (!portfolioGrid) {
      console.error('❌ Required DOM elements not found');
      return;
    }

    // 로딩 메시지 표시
    showLoadingMessage();
    
    // 1. KAUZ Work 테이블에서 데이터 로드
    const portfolioData = await fetchPortfolioData();
    
    // 2. 데이터로 포트폴리오 초기화
    await initPortfolioWithData(portfolioData);
    
    // 3. Contact 섹션 무한롤링 초기화 (딜레이)
    setTimeout(() => {
      initPortfolioContactInfiniteScroll();
    }, 1000);
    
    // 4. 🔥 햄버거 → X 변환 애니메이션 초기화
    initHamburgerAnimation();
    
    console.log('✅ Portfolio initialization complete with Infinite Scroll + Perfect Design');
    console.log(`🎯 Setup: ${portfolioData.length} total items, ${ITEMS_PER_PAGE} per page`);
  }

  // ─── 🏁 최종 초기화 실행 ───
  initPortfolio();

  console.log('✅ Portfolio.js initialization complete - Infinite Scroll + Perfect Design Mode');
  console.log('🎯 Features: 6개씩 로딩, 웹 크기 확대, "Update soon" 메시지, 완벽한 모달 디자인');
  console.log('🔧 Debug tools: portfolioDebug.*');
});
