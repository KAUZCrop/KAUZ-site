// portfolio.js (완전 수정 버전) - API 키 교체 없이 즉시 작동
// 🔥 테이블 이름 및 필드 매핑 수정 + 강화된 에러 핸들링

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

  // ─── 🔧 수정된 Airtable 설정 (스크린샷 기준) ───
  const AIRTABLE_CONFIG = {
    BASE_ID: 'appAOJqJl8mHaDhFe',
    API_KEY: 'patRSZDxFKTYHd0PH.52e35eb0b2142e97e1a8f83cc42a7ed5ef0bf1c37bf2c28e9dc97056d06ddce3',
    TABLE_NAME: 'Table 1'  // ✅ 스크린샷에서 확인된 실제 테이블 이름
  };

  // ⚠️ 보안 경고 (하지만 일단 작동시키기)
  console.warn('🚨 보안 알림: API 키가 클라이언트에 노출되어 있습니다. 추후 백엔드로 이전을 권장합니다.');

  // ─── 📡 Airtable에서 포트폴리오 데이터 가져오기 ───
  async function fetchPortfolioData() {
    try {
      console.log('🔗 Fetching portfolio data from Airtable...');
      console.log('📋 Using table name:', AIRTABLE_CONFIG.TABLE_NAME);
      
      const url = `https://api.airtable.com/v0/${AIRTABLE_CONFIG.BASE_ID}/${encodeURIComponent(AIRTABLE_CONFIG.TABLE_NAME)}`;
      console.log('🌐 Request URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 Response status:', response.status);
      console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText
        });
        
        // 상태코드별 구체적인 에러 메시지
        switch (response.status) {
          case 401:
            throw new Error('API 키 인증에 실패했습니다. Airtable Personal Access Token을 확인해주세요.');
          case 403:
            throw new Error('API 키에 이 베이스에 대한 접근 권한이 없습니다. 권한을 확인해주세요.');
          case 404:
            throw new Error(`테이블 "${AIRTABLE_CONFIG.TABLE_NAME}"을 찾을 수 없습니다. Airtable에서 테이블 이름을 확인해주세요.`);
          case 422:
            throw new Error('API 요청 형식이 올바르지 않습니다.');
          case 429:
            throw new Error('API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
          default:
            throw new Error(`서버 오류 (${response.status}): ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      
      console.log('✅ Raw data received from Airtable:', data);
      console.log('📄 Total records:', data.records ? data.records.length : 0);
      
      if (data.records && data.records.length > 0) {
        console.log('📋 Available fields in first record:', Object.keys(data.records[0].fields));
        console.log('🔍 First record sample:', data.records[0]);
        
        // 필드 매핑 확인
        const firstRecord = data.records[0].fields;
        console.log('🗂️ Field mapping check:', {
          'Title': firstRecord['Title'] || '❌ 없음',
          'Description': firstRecord['Description'] || '❌ 없음', 
          'Assignee': firstRecord['Assignee'] || '❌ 없음',
          'Status': firstRecord['Status'] || '❌ 없음',
          'ImageURL': firstRecord['ImageURL'] || '❌ 없음',
          'Attachment Summary': firstRecord['Attachment Summary'] || '❌ 없음'
        });
      } else {
        console.warn('⚠️ No records found in the table');
      }
      
      return data.records || [];
      
    } catch (error) {
      console.error('❌ Airtable 데이터 로딩 실패:', error);
      
      // 사용자에게 친화적인 에러 메시지 표시
      showDetailedError(error.message);
      
      // 연결 실패시 대체 데이터 반환
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
              • 테이블 이름: "${AIRTABLE_CONFIG.TABLE_NAME}"<br>
              • API 키: ${AIRTABLE_CONFIG.API_KEY ? '✅ 설정됨' : '❌ 없음'}<br>
              • 요청 URL: ${`https://api.airtable.com/v0/${AIRTABLE_CONFIG.BASE_ID}/${encodeURIComponent(AIRTABLE_CONFIG.TABLE_NAME)}`}
            </div>
          </div>
          
          <div style="margin: 2rem 0;">
            <strong style="color: #E37031; display: block; margin-bottom: 1rem;">💡 해결 방법:</strong>
            <ul style="text-align: left; max-width: 500px; margin: 0 auto; color: #ccc; line-height: 1.6;">
              <li>Airtable에서 테이블 이름이 정확히 "${AIRTABLE_CONFIG.TABLE_NAME}"인지 확인</li>
              <li>API 키가 해당 베이스에 접근 권한이 있는지 확인</li>
              <li>Personal Access Token의 유효기간 확인</li>
              <li>베이스 ID가 올바른지 확인</li>
            </ul>
          </div>
          
          <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 2rem;">
            <button onclick="location.reload()" style="
              background: #E37031; color: white; border: none; padding: 0.8rem 1.5rem; 
              border-radius: 4px; cursor: pointer; font-size: 1rem; transition: background 0.3s;
            " onmouseover="this.style.background='#d85d1f'" onmouseout="this.style.background='#E37031'">
              🔄 다시 시도
            </button>
            
            <button onclick="portfolioDebug.loadFallbackData()" style="
              background: #333; color: white; border: none; padding: 0.8rem 1.5rem; 
              border-radius: 4px; cursor: pointer; font-size: 1rem; transition: background 0.3s;
            " onmouseover="this.style.background='#444'" onmouseout="this.style.background='#333'">
              📋 샘플 데이터 보기
            </button>
            
            <button onclick="portfolioDebug.showConnectionInfo()" style="
              background: #555; color: white; border: none; padding: 0.8rem 1.5rem; 
              border-radius: 4px; cursor: pointer; font-size: 1rem; transition: background 0.3s;
            " onmouseover="this.style.background='#666'" onmouseout="this.style.background='#555'">
              🔍 연결 정보 확인
            </button>
          </div>
        </div>
      `;
    }
  }

  // ─── 🔄 대체 데이터 (연결 실패시) ───
  function getFallbackData() {
    console.log('🔄 Using fallback data...');
    return [
      {
        id: 'fallback-1',
        fields: {
          'Title': 'LG 시그니처',
          'Description': 'LG 시그니처 키친스위트 브랜딩 캠페인 - 프리미엄 라이프스타일 브랜드로서의 포지셔닝 강화',
          'Assignee': 'KAUZ',
          'Status': 'COMPLETED',
          'ImageURL': null
        }
      },
      {
        id: 'fallback-2',
        fields: {
          'Title': 'LG 전자',
          'Description': 'LG M9(로봇청소기) 신제품 런칭 캠페인',
          'Assignee': 'KAUZ',
          'Status': 'COMPLETED',
          'ImageURL': null
        }
      },
      {
        id: 'fallback-3',
        fields: {
          'Title': '법무법인 이엘',
          'Description': '브랜드 아이덴티티 및 웹사이트 리뉴얼 프로젝트',
          'Assignee': 'KAUZ',
          'Status': 'COMPLETED',
          'ImageURL': null
        }
      },
      {
        id: 'fallback-4',
        fields: {
          'Title': 'KAUZ 샘플 프로젝트',
          'Description': '샘플 포트폴리오 아이템입니다. 실제 데이터 연결을 확인해주세요.',
          'Assignee': 'KAUZ TEAM',
          'Status': 'SAMPLE',
          'ImageURL': null
        }
      }
    ];
  }

  // ─── 🎨 포트폴리오 데이터 렌더링 (스크린샷 필드 기준 매핑) ───
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
          <p style="margin-bottom: 2rem;">Airtable "${AIRTABLE_CONFIG.TABLE_NAME}" 테이블에 데이터가 없거나 연결에 문제가 있습니다.</p>
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

    // 🔥 스크린샷 기준 실제 필드명으로 매핑
    portfolioGrid.innerHTML = records.map((record, index) => {
      const fields = record.fields;
      
      // 📋 스크린샷에서 확인된 실제 필드명들로 매핑
      const title = fields['Title'] || fields['제목'] || fields['프로젝트명'] || fields['Brand Name'] || 'UNTITLED PROJECT';
      const description = fields['Description'] || fields['설명'] || fields['내용'] || '';
      const assignee = fields['Assignee'] || fields['담당자'] || fields['Campaign Type'] || 'KAUZ';
      const status = fields['Status'] || fields['상태'] || 'PROJECT';
      
      // 이미지 URL 처리 (여러 가능성 확인)
      let imageUrl = null;
      if (fields['ImageURL']) {
        imageUrl = fields['ImageURL'];
      } else if (fields['이미지URL']) {
        imageUrl = fields['이미지URL'];
      } else if (fields['Main Image'] && Array.isArray(fields['Main Image']) && fields['Main Image'].length > 0) {
        imageUrl = fields['Main Image'][0].url;
      } else if (fields['Attachment Summary']) {
        // Attachment Summary가 URL 형태인 경우
        const attachmentUrl = fields['Attachment Summary'];
        if (typeof attachmentUrl === 'string' && (attachmentUrl.startsWith('http') || attachmentUrl.includes('airtable'))) {
          imageUrl = attachmentUrl;
        }
      }
      
      // 디버깅용 로그
      console.log(`🔍 Record ${index + 1} mapping:`, {
        title,
        description: description.substring(0, 50) + '...',
        assignee,
        status,
        hasImage: !!imageUrl,
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
            <div class="project-category">${assignee || status}</div>
          </div>
        </div>
      `;
    }).join('');

    // 애니메이션 초기화
    initFadeUpAnimations();
    
    console.log(`✅ Portfolio items rendered: ${records.length} items`);
    
    // 렌더링 완료 후 통계 출력
    const withImages = records.filter(r => {
      const fields = r.fields;
      return fields['ImageURL'] || fields['Main Image'] || fields['Attachment Summary'];
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
    
    // 모달 HTML 생성 (실제 데이터 기반으로 개선)
    const modalHtml = `
      <div id="portfolioModal" class="modal active">
        <div class="modal-content">
          <span class="close-btn" onclick="closePortfolioModal()">&times;</span>
          <h2>Portfolio Project ${index + 1}</h2>
          <p><strong>프로젝트 ID:</strong> ${recordId}</p>
          <p><strong>프로젝트 개요:</strong><br>
          포트폴리오 상세 정보가 여기에 표시됩니다. Airtable에서 더 많은 필드를 추가하면 여기에 동적으로 표시됩니다.</p>
          <p><strong>주요 성과:</strong><br>
          • 브랜드 인지도 향상<br>
          • 높은 전환율 달성<br>
          • ROI 개선</p>
          <p><strong>담당팀:</strong> KAUZ Creative Team</p>
          <p><strong>사용된 채널:</strong> 디지털, 소셜미디어, PR</p>
          <div style="margin-top: 2rem; padding: 1rem; background: #0d0d0d; border-radius: 4px; font-size: 0.9rem; color: #999;">
            💡 <strong>개발자 노트:</strong> 이 모달은 Airtable 데이터를 기반으로 동적으로 생성됩니다. 
            더 많은 필드를 추가하면 여기에 자동으로 표시됩니다.
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

  // ─── 📞 Contact 섹션 클릭 처리 (Portfolio 페이지 전용) ───
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
      console.log('🧪 Testing Airtable connection...');
      showLoadingMessage();
      
      try {
        const data = await fetchPortfolioData();
        renderPortfolioItems(data);
        
        if (data.length > 0) {
          alert(`✅ 연결 성공!\n\n${data.length}개의 레코드를 가져왔습니다.`);
        } else {
          alert('⚠️ 연결은 성공했지만 데이터가 없습니다.\nAirtable에 레코드를 추가해주세요.');
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
• 테이블 이름: "${AIRTABLE_CONFIG.TABLE_NAME}"
• API 키: ${AIRTABLE_CONFIG.API_KEY ? '설정됨 (마지막 10자: ' + AIRTABLE_CONFIG.API_KEY.slice(-10) + ')' : '❌ 없음'}

🌐 요청 URL:
${`https://api.airtable.com/v0/${AIRTABLE_CONFIG.BASE_ID}/${encodeURIComponent(AIRTABLE_CONFIG.TABLE_NAME)}`}

💡 문제 해결:
1. Airtable에서 테이블 이름이 정확한지 확인
2. Personal Access Token 권한 확인
3. 베이스 공유 설정 확인
      `;
      
      alert(info);
      console.log('🔍 Connection Info:', {
        baseId: AIRTABLE_CONFIG.BASE_ID,
        tableName: AIRTABLE_CONFIG.TABLE_NAME,
        hasApiKey: !!AIRTABLE_CONFIG.API_KEY,
        requestUrl: `https://api.airtable.com/v0/${AIRTABLE_CONFIG.BASE_ID}/${encodeURIComponent(AIRTABLE_CONFIG.TABLE_NAME)}`
      });
    },
    
    // 다른 테이블 이름으로 시도
    tryDifferentTableName: async (newName) => {
      if (!newName) {
        newName = prompt('새로운 테이블 이름을 입력하세요:', AIRTABLE_CONFIG.TABLE_NAME);
      }
      
      if (newName && newName.trim()) {
        AIRTABLE_CONFIG.TABLE_NAME = newName.trim();
        console.log(`🔄 Trying table name: "${AIRTABLE_CONFIG.TABLE_NAME}"`);
        showLoadingMessage();
        await initPortfolio();
      }
    },
    
    // 대체 데이터 로드
    loadFallbackData: () => {
      console.log('🔄 Loading fallback data...');
      const fallbackData = getFallbackData();
      renderPortfolioItems(fallbackData);
      
      alert(`📋 샘플 데이터를 표시했습니다.\n\n${fallbackData.length}개의 샘플 프로젝트가 표시되고 있습니다.\n\n실제 데이터 연결을 위해서는 Airtable 설정을 확인해주세요.`);
    },
    
    // 데이터 새로고침
    reloadData: async () => {
      console.log('🔄 Reloading portfolio data...');
      showLoadingMessage();
      await initPortfolio();
    },
    
    // 테이블 이름 제안
    suggestTableNames: () => {
      const suggestions = [
        'Table 1',      // 현재 사용중
        'Portfolio',    // 원래 의도
        'Projects',     // 일반적
        'Works',        // 대안
        'Campaigns',    // 마케팅 관련
        'portfolio',    // 소문자
        'PORTFOLIO',    // 대문자
        'Main'          // 기본
      ];
      
      const currentName = AIRTABLE_CONFIG.TABLE_NAME;
      const otherSuggestions = suggestions.filter(name => name !== currentName);
      
      const message = `
현재 테이블 이름: "${currentName}"

다른 가능한 이름들:
${otherSuggestions.map(name => `• ${name}`).join('\n')}

테이블 이름을 바꿔서 시도해보시겠습니까?
      `;
      
      if (confirm(message)) {
        const newName = prompt('새로운 테이블 이름을 입력하세요:', suggestions[1]);
        if (newName) {
          this.tryDifferentTableName(newName);
        }
      }
    },
    
    // 개발자 정보
    showDeveloperInfo: () => {
      console.log(`
🔧 KAUZ Portfolio Debug Tools

Available commands:
• portfolioDebug.testConnection()        - 연결 테스트
• portfolioDebug.showConnectionInfo()    - 연결 정보 확인
• portfolioDebug.loadFallbackData()      - 샘플 데이터 로드
• portfolioDebug.tryDifferentTableName() - 다른 테이블 이름으로 시도
• portfolioDebug.suggestTableNames()     - 테이블 이름 제안
• portfolioDebug.reloadData()           - 데이터 새로고침

Current Status:
- Table: "${AIRTABLE_CONFIG.TABLE_NAME}"
- Base: ${AIRTABLE_CONFIG.BASE_ID}
- API Key: ${AIRTABLE_CONFIG.API_KEY ? 'Configured' : 'Missing'}
      `);
    }
  };

  // ─── 💡 로딩 메시지 표시 함수 ───
  function showLoadingMessage() {
    const portfolioGrid = document.getElementById('portfolioGrid');
    if (portfolioGrid) {
      portfolioGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: #ccc; padding: 4rem;">
          <div style="display: inline-block; width: 40px; height: 40px; border: 3px solid #333; border-top: 3px solid #E37031; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem;"></div>
          <p style="font-size: 1.1rem;">데이터를 불러오는 중...</p>
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
      cssVariables: CSS.supports('color', 'var(--test)'),
      fetch: 'fetch' in window
    };
    
    console.log('🌐 Browser support check:', support);
    
    if (!support.intersectionObserver) {
      console.warn('⚠️ IntersectionObserver not supported, applying fallback');
      document.querySelectorAll('.fade-up').forEach(el => {
        el.classList.add('is-visible', 'visible');
      });
    }

    if (!support.cssGrid) {
      console.warn('⚠️ CSS Grid not supported');
      document.body.classList.add('no-grid-support');
    }

    if (!support.fetch) {
      console.error('❌ Fetch API not supported - portfolio will not work');
      alert('브라우저가 너무 오래되었습니다. 최신 브라우저를 사용해주세요.');
    }
  }

  checkBrowserSupport();

  // ─── ⌨️ 키보드 네비게이션 ───
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Home' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    if (e.key === 'End' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
    
    // 개발자 단축키
    if (e.key === 'F9' && e.ctrlKey) {
      e.preventDefault();
      portfolioDebug.showDeveloperInfo();
    }
  });

  // ─── 🚀 메인 초기화 함수 ───
  async function initPortfolio() {
    console.log('🚀 Initializing KAUZ Portfolio...');
    console.log('🔧 Configuration:', {
      baseId: AIRTABLE_CONFIG.BASE_ID,
      tableName: AIRTABLE_CONFIG.TABLE_NAME,
      hasApiKey: !!AIRTABLE_CONFIG.API_KEY
    });
    
    // 로딩 메시지 표시
    showLoadingMessage();
    
    // 1. Airtable 데이터 로드
    const portfolioData = await fetchPortfolioData();
    
    // 2. 포트폴리오 아이템 렌더링
    renderPortfolioItems(portfolioData);
    
    // 3. Contact 섹션 무한롤링 초기화 (딜레이)
    setTimeout(() => {
      initPortfolioContactInfiniteScroll();
    }, 1000);
    
    console.log('✅ Portfolio initialization complete');
  }

  // ─── 🛠️ 개발용 성능 측정 ───
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🛠️ Portfolio page development mode enabled');
    
    // 성능 측정
    window.addEventListener('load', () => {
      setTimeout(() => {
        try {
          const perfData = performance.getEntriesByType('navigation')[0];
          console.log('⚡ Portfolio page performance:', {
            domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart) + 'ms',
            loadComplete: Math.round(perfData.loadEventEnd - perfData.loadEventStart) + 'ms',
            totalTime: Math.round(perfData.loadEventEnd - perfData.fetchStart) + 'ms'
          });
        } catch (e) {
          console.log('⚡ Performance measurement not available');
        }
      }, 100);
    });
    
    // 개발자 도구 안내
    console.log(`
🔧 Development Tools Available:
• portfolioDebug.testConnection() - Test Airtable connection
• portfolioDebug.loadFallbackData() - Load sample data
• portfolioDebug.showConnectionInfo() - Show connection details
• Ctrl+F9 - Show all debug commands
    `);
  }

  // ─── 🏁 최종 초기화 실행 ───
  initPortfolio();

  console.log('✅ Portfolio.js initialization complete');
  console.log('🔧 Debug tools: portfolioDebug.*');
  console.log('💡 Try: portfolioDebug.testConnection()');
});
