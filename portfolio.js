// portfolio.js (Portfolio 전용 스크립트) - 최종 적용 버전
// 🔥 Airtable 연동 + 2열 그리드 + 모달 기능

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

  // ─── 🔥 Airtable 설정 (메인페이지와 동일한 토큰 사용) ───
  const AIRTABLE_CONFIG = {
    BASE_ID: 'appAOJqJl8mHaDhFe',  // 메인페이지와 동일
    API_KEY: 'patRSZDxFKTYHd0PH.52e35eb0b2142e97e1a8f83cc42a7ed5ef0bf1c37bf2c28e9dc97056d06ddce3',  // 메인페이지와 동일
    TABLE_NAME: 'Portfolio'  // 포트폴리오 전용 테이블
  };

  // ─── 🔥 Airtable에서 포트폴리오 데이터 가져오기 ───
  async function fetchPortfolioData() {
    try {
      console.log('🔗 Fetching portfolio data from Airtable...');
      
      const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_CONFIG.BASE_ID}/${AIRTABLE_CONFIG.TABLE_NAME}`, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.API_KEY}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Portfolio data loaded:', data.records.length, 'items');
      return data.records;
      
    } catch (error) {
      console.error('❌ Airtable 데이터 로딩 실패:', error);
      return [];
    }
  }

  // ─── 🔥 포트폴리오 데이터 렌더링 (2열 그리드) ───
  function renderPortfolioItems(records) {
    const portfolioGrid = document.getElementById('portfolioGrid');
    if (!portfolioGrid) {
      console.error('❌ Portfolio grid element not found');
      return;
    }

    if (!records || records.length === 0) {
      portfolioGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: #ccc; padding: 4rem;">
          <p>포트폴리오 데이터를 불러오는 중입니다...</p>
        </div>
      `;
      return;
    }

    // 2열 그리드용 HTML 생성
    portfolioGrid.innerHTML = records.map((record, index) => {
      const fields = record.fields;
      const imageUrl = fields['Main Image'] ? fields['Main Image'][0].url : null;
      const brandName = fields['Brand Name'] || 'BRAND NAME';
      const campaignType = fields['Campaign Type'] || 'CAMPAIGN TYPE';
      const projectTitle = fields['Project Title'] || brandName;
      const description = fields['Description'] || '';
      
      return `
        <div class="project-card fade-up" 
             data-index="${index}"
             onclick="openPortfolioModal('${record.id}', ${index})"
             style="animation-delay: ${index * 0.1}s">
          <div class="project-image-container">
            ${imageUrl 
              ? `<img src="${imageUrl}" alt="${brandName} ${campaignType} Campaign" />`
              : ''
            }
          </div>
          <div class="project-info">
            <div class="project-title">${brandName}</div>
            <div class="project-category">${campaignType}</div>
          </div>
        </div>
      `;
    }).join('');

    // 애니메이션 초기화
    initFadeUpAnimations();
    
    console.log('✅ Portfolio items rendered:', records.length);
  }

  // ─── 🔥 페이드업 애니메이션 초기화 ───
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

  // ─── 🔥 포트폴리오 모달 열기 ───
  window.openPortfolioModal = function(recordId, index) {
    console.log('🔍 Opening portfolio modal:', recordId, index);
    
    // 임시 모달 HTML 생성 (실제로는 Airtable 데이터 기반으로)
    const modalHtml = `
      <div id="portfolioModal" class="modal active">
        <div class="modal-content">
          <span class="close-btn" onclick="closePortfolioModal()">&times;</span>
          <h2>Portfolio Project ${index + 1}</h2>
          <p><strong>프로젝트 개요:</strong><br>
          상세한 프로젝트 정보가 여기에 표시됩니다.</p>
          <p><strong>주요 성과:</strong><br>
          • 브랜드 인지도 상승<br>
          • 높은 전환율 달성<br>
          • ROI 향상</p>
          <p><strong>사용된 채널:</strong> 디지털, 소셜미디어, PR</p>
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
  };

  // ─── 🔥 포트폴리오 모달 닫기 ───
  window.closePortfolioModal = function() {
    const modal = document.getElementById('portfolioModal');
    if (modal) {
      modal.remove();
      document.body.style.overflow = '';
      console.log('✅ Portfolio modal closed');
    }
  };

  // ─── ESC 키로 모달 닫기 ───
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closePortfolioModal();
    }
  });

  // ─── 🔥 SCROLL 인디케이터 클릭 이벤트 ───
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

  // ─── 🔥 Contact 섹션 클릭 처리 (Portfolio 페이지 전용) ───
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

  // ─── 🔥 Contact 섹션 무한롤링 초기화 ───
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

  // ─── 🔥 모바일 터치 최적화 ───
  if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
    console.log('📱 Touch device detected, mobile optimizations applied');
  }

  // ─── 🔥 브라우저 호환성 체크 ───
  function checkBrowserSupport() {
    if (!('IntersectionObserver' in window)) {
      console.warn('⚠️ IntersectionObserver not supported, applying fallback');
      document.querySelectorAll('.fade-up').forEach(el => {
        el.classList.add('is-visible', 'visible');
      });
    }

    if (!CSS.supports('display', 'grid')) {
      console.warn('⚠️ CSS Grid not supported');
      document.body.classList.add('no-grid-support');
    }

    if (!CSS.supports('color', 'var(--test)')) {
      console.warn('⚠️ CSS Custom Properties not supported');
      document.body.classList.add('no-css-vars');
    }
  }

  checkBrowserSupport();

  // ─── 🔥 키보드 네비게이션 ───
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Home' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    if (e.key === 'End' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  });

  // ─── 🔥 메인 초기화 함수 ───
  async function initPortfolio() {
    console.log('🚀 Initializing KAUZ Portfolio...');
    
    // 1. Airtable 데이터 로드
    const portfolioData = await fetchPortfolioData();
    
    // 2. 포트폴리오 아이템 렌더링
    renderPortfolioItems(portfolioData);
    
    // 3. Contact 섹션 무한롤링 초기화
    setTimeout(() => {
      initPortfolioContactInfiniteScroll();
    }, 1000);
    
    console.log('✅ Portfolio initialization complete');
  }

  // ─── 🔥 개발용 디버깅 ───
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🛠️ Portfolio page development mode');
    
    window.portfolioDebug = {
      reloadData: () => initPortfolio(),
      scrollToTop: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
      scrollToPortfolio: () => {
        const portfolio = document.querySelector('.portfolio-projects');
        if (portfolio) portfolio.scrollIntoView({ behavior: 'smooth' });
      },
      testContactClick: () => {
        const contact = document.getElementById('contact');
        if (contact) contact.click();
      },
      showGridInfo: () => {
        const grid = document.getElementById('portfolioGrid');
        const items = grid ? grid.children.length : 0;
        console.log('📊 Portfolio Grid Info:', { items, gridElement: !!grid });
      }
    };
    
    // 성능 측정
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('⚡ Portfolio page performance:', {
          domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart) + 'ms',
          loadComplete: Math.round(perfData.loadEventEnd - perfData.loadEventStart) + 'ms',
          totalTime: Math.round(perfData.loadEventEnd - perfData.fetchStart) + 'ms'
        });
      }, 100);
    });
  }

  // ─── 🔥 최종 초기화 실행 ───
  initPortfolio();

  console.log('✅ Portfolio.js initialization complete');
});
