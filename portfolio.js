// portfolio.js (Portfolio 전용 스크립트) - About과 동일한 기능 추가
// 🔥 강제 리다이렉트 제거 + 새로고침 시 상단 이동 + 무한롤링 배너 추가

document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 Portfolio.js starting...');

  // ─── 🔥 새로고침 시 페이지 상단으로 이동 (리다이렉트 대신) ───
  try {
    if (performance.getEntriesByType('navigation')[0].type === 'reload') {
      console.log('🔄 Portfolio page refresh detected, scrolling to top...');
      window.scrollTo(0, 0);
      // 리다이렉트 코드 제거됨
    }
  } catch (e) {
    console.log('⚠️ Navigation API not supported, continuing...');
  }

  // ─── Portfolio 페이지 전용 기능들 ───

  // 1) SCROLL 인디케이터 클릭 이벤트 (Portfolio 페이지 전용)
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      const filterSection = document.querySelector('.filter-section') || 
                           document.querySelector('.portfolio-content-wrapper') ||
                           document.querySelector('.portfolio-projects');
      
      if (filterSection) {
        filterSection.scrollIntoView({
          behavior: 'smooth'
        });
        console.log('📜 Smooth scroll to filter section initiated');
      }
    });
    console.log('✅ Portfolio page scroll indicator initialized');
  }

  // 2) Portfolio 페이지 전용 fade-up 애니메이션 (common.js와 중복 방지)
  // 🔥 data-portfolio-observed 속성으로 중복 방지
  const portfolioFadeElements = document.querySelectorAll('.fade-up:not([data-portfolio-observed])');
  
  if (portfolioFadeElements.length > 0) {
    const portfolioObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          entry.target.classList.add('visible'); // 추가 클래스
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
    
    console.log('✅ Portfolio page fade-up animations initialized:', portfolioFadeElements.length);
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
        performSafeNavigation('contact.html'); // 🔥 Portfolio 페이지에서는 contact로 이동
      }
      
      setTimeout(() => {
        touchStarted = false;
      }, 100);
    });

    contactSection.addEventListener('click', (e) => {
      if (!touchStarted && !isScrolling) {
        e.preventDefault();
        performSafeNavigation('contact.html'); // 🔥 Portfolio 페이지에서는 contact로 이동
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

  // ─── 🔥 Contact 섹션 무한롤링 초기화 (Portfolio 페이지 전용) ───
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
    
    console.log('✅ Portfolio page contact infinite scroll initialized with', allTextElements.length, 'elements');
    console.log('✅ No SVG viewBox issues, stable text rendering!');
  }

  // ─── 기존 Portfolio 기능들 (모달, 필터링 등) ───

  // 3) 모달 열기/닫기 기능
  const modalButtons = document.querySelectorAll('.btn-more');
  const closeButtons = document.querySelectorAll('.close-btn');
  const modals = document.querySelectorAll('.modal');

  modalButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // 부모 요소 이벤트 방지
      const modalId = btn.getAttribute('data-modal');
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
        console.log(`Modal ${modalId} opened`);
      }
    });
  });

  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-modal');
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        document.body.style.overflow = ''; // 스크롤 복원
        console.log(`Modal ${modalId} closed`);
      }
    });
  });

  // 4) 모달 바깥 영역 클릭 시 닫기
  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        document.body.style.overflow = ''; // 스크롤 복원
        console.log('Modal closed by background click');
      }
    });
  });

  // ESC 키로 모달 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modals.forEach(modal => {
        if (modal.style.display === 'flex') {
          modal.style.display = 'none';
          modal.classList.remove('active');
          document.body.style.overflow = '';
          console.log('Modal closed by ESC key');
        }
      });
    }
  });

  // 5) 필터 버튼 클릭 시 카드 필터링 기능
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // 버튼 활성화 표시
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const filterValue = button.getAttribute('data-filter');
      console.log(`Filter applied: ${filterValue}`);
      
      projectCards.forEach(card => {
        // "all"이면 모두 보이기, 아니면 data-filter 속성과 비교
        if (filterValue === 'all' || card.getAttribute('data-filter') === filterValue) {
          card.style.display = 'block';
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          
          // 애니메이션 효과
          setTimeout(() => {
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          card.style.opacity = '0';
          card.style.transform = 'translateY(-20px)';
          
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  // 6) 프로젝트 카드 호버 효과 강화 (데스크톱만)
  if (window.innerWidth > 768) {
    projectCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
        card.style.transition = 'transform 0.3s ease';
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
      });
    });
    
    console.log('✅ Portfolio card hover effects initialized');
  }

  // 7) 로딩 애니메이션 (이미지가 없는 경우 대비)
  const projectImages = document.querySelectorAll('.project-card img');
  projectImages.forEach(img => {
    img.addEventListener('load', () => {
      img.style.opacity = '1';
    });
    
    img.addEventListener('error', () => {
      // 이미지 로딩 실패 시 숨김 (CSS ::after로 PLACEHOLDER 표시)
      img.style.display = 'none';
    });
  });

  // 8) 검색 기능 (향후 확장용)
  function addSearchFunctionality() {
    const searchInput = document.getElementById('portfolio-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        projectCards.forEach(card => {
          const title = card.querySelector('.project-title').textContent.toLowerCase();
          const description = card.querySelector('.project-description').textContent.toLowerCase();
          const category = card.querySelector('.project-category').textContent.toLowerCase();
          
          if (title.includes(searchTerm) || description.includes(searchTerm) || category.includes(searchTerm)) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        });
      });
      
      console.log('✅ Portfolio search functionality initialized');
    }
  }
  
  addSearchFunctionality();

  // 9) 스크롤 진행률 표시 (CSS 변수로 설정)
  function updateScrollProgress() {
    const scrollTop = window.pageYOffset;
    const docHeight = document.body.offsetHeight - window.innerHeight;
    const scrollPercent = Math.min((scrollTop / docHeight) * 100, 100);
    
    // 스크롤 진행률을 CSS 변수로 설정
    document.documentElement.style.setProperty('--scroll-progress', scrollPercent + '%');
  }

  // 스크롤 이벤트 최적화 (throttle 적용)
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    scrollTimeout = setTimeout(updateScrollProgress, 10);
  }, { passive: true });

  // 10) 모바일 터치 최적화
  if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
    console.log('📱 Touch device detected, mobile optimizations applied');
  }

  // 11) 브라우저 호환성 체크 및 폴백
  function checkBrowserSupport() {
    // IntersectionObserver 지원 체크
    if (!('IntersectionObserver' in window)) {
      console.warn('⚠️ IntersectionObserver not supported, applying fallback');
      document.querySelectorAll('.fade-up').forEach(el => {
        el.classList.add('is-visible', 'visible');
      });
    }

    // CSS Grid 지원 체크
    if (!CSS.supports('display', 'grid')) {
      console.warn('⚠️ CSS Grid not supported');
      document.body.classList.add('no-grid-support');
    }

    // CSS 사용자 정의 속성 지원 체크
    if (!CSS.supports('color', 'var(--test)')) {
      console.warn('⚠️ CSS Custom Properties not supported');
      document.body.classList.add('no-css-vars');
    }
  }

  checkBrowserSupport();

  // 12) Portfolio 페이지 전용 키보드 네비게이션
  document.addEventListener('keydown', (e) => {
    // ESC 키 처리는 위에서 이미 처리됨
    if (e.key === 'Home' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    if (e.key === 'End' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
    
    // 숫자 키로 필터 선택
    if (e.key >= '1' && e.key <= '4') {
      const filterIndex = parseInt(e.key) - 1;
      const filterBtn = filterButtons[filterIndex];
      if (filterBtn) {
        filterBtn.click();
      }
    }
  });

  // 13) 성능 모니터링 (개발용)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🛠️ Portfolio page development mode');
    console.log('📊 Portfolio page elements:', {
      fadeUpElements: document.querySelectorAll('.fade-up').length,
      projectCards: projectCards.length,
      filterButtons: filterButtons.length,
      modals: modals.length,
      scrollIndicator: !!scrollIndicator,
      contactSection: !!contactSection
    });

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

    // 디버깅용 전역 함수
    window.portfolioDebug = {
      scrollToTop: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
      scrollToFilter: () => {
        const filter = document.querySelector('.filter-section');
        if (filter) filter.scrollIntoView({ behavior: 'smooth' });
      },
      showAllElements: () => {
        document.querySelectorAll('.fade-up').forEach(el => {
          el.classList.add('is-visible');
        });
      },
      showAllCards: () => {
        projectCards.forEach(card => {
          card.style.display = 'block';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        });
      },
      hideAllCards: () => {
        projectCards.forEach(card => {
          card.style.display = 'none';
        });
      },
      openModal: (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.style.display = 'flex';
          modal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      },
      closeAllModals: () => {
        modals.forEach(modal => {
          modal.style.display = 'none';
          modal.classList.remove('active');
        });
        document.body.style.overflow = '';
      },
      testContactClick: () => {
        const contact = document.getElementById('contact');
        if (contact) contact.click();
      },
      applyFilter: (filterValue) => {
        const filterBtn = Array.from(filterButtons).find(btn => 
          btn.getAttribute('data-filter') === filterValue
        );
        if (filterBtn) filterBtn.click();
      }
    };
  }

  // 14) 초기화 완료 후 상태 확인
  setTimeout(() => {
    const isCommonJsLoaded = typeof window.debugMenu !== 'undefined';
    console.log('🔍 Portfolio page initialization status:', {
      commonJsLoaded: isCommonJsLoaded,
      elementsFound: {
        scrollIndicator: !!scrollIndicator,
        fadeElements: document.querySelectorAll('.fade-up').length,
        projectCards: projectCards.length,
        filterButtons: filterButtons.length,
        modals: modals.length,
        contactSection: !!contactSection,
        marqueeElements: document.querySelectorAll('#contact .text-item').length
      }
    });
  }, 100);

  // Contact 섹션 텍스트 기반 무한롤링 초기화 (로딩 완료 후)
  setTimeout(() => {
    initPortfolioContactInfiniteScroll();
  }, 1200);

  console.log('✅ Portfolio.js initialization complete');
});
