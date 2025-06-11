// DOMContentLoaded 시점에 실행될 이벤트 등록
document.addEventListener('DOMContentLoaded', () => {
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

  console.log('📄 Portfolio.js initialized');

  // 1) 모달 열기/닫기 기능
  const modalButtons = document.querySelectorAll('.btn-more');
  const closeButtons = document.querySelectorAll('.close-btn');

  modalButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-modal');
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.style.display = 'flex';
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
        document.body.style.overflow = ''; // 스크롤 복원
        console.log(`Modal ${modalId} closed`);
      }
    });
  });

  // 2) 모달 바깥 영역 클릭 시 닫기
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
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
          document.body.style.overflow = '';
          console.log('Modal closed by ESC key');
        }
      });
    }
  });

  // 3) 필터 버튼 클릭 시 카드 필터링 기능
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

  // 4) 프로젝트 카드 호버 효과 강화 (데스크톱만)
  if (window.innerWidth > 768) {
    projectCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px) scale(1.02)';
        card.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
        card.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      });
    });
    
    console.log('✅ Portfolio card hover effects initialized');
  }

  // 5) 로딩 애니메이션 (이미지가 없는 경우 대비)
  const projectImages = document.querySelectorAll('.project-card img');
  projectImages.forEach(img => {
    img.addEventListener('load', () => {
      img.style.opacity = '1';
    });
    
    img.addEventListener('error', () => {
      // 이미지 로딩 실패 시 플레이스홀더 표시
      const placeholder = document.createElement('div');
      placeholder.style.cssText = `
        width: 100%;
        height: 180px;
        background-color: #f0f0f0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
        font-size: 14px;
      `;
      placeholder.textContent = 'Image not available';
      img.parentNode.replaceChild(placeholder, img);
    });
  });

  // 6) 검색 기능 (향후 확장용)
  function addSearchFunctionality() {
    const searchInput = document.getElementById('portfolio-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        projectCards.forEach(card => {
          const title = card.querySelector('h3').textContent.toLowerCase();
          const description = card.querySelector('p').textContent.toLowerCase();
          
          if (title.includes(searchTerm) || description.includes(searchTerm)) {
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

  // 7) 성능 모니터링 (개발용)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🛠️ Portfolio page development mode');
    
    // 디버깅용 전역 함수
    window.portfolioDebug = {
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
          document.body.style.overflow = 'hidden';
        }
      },
      closeAllModals: () => {
        modals.forEach(modal => {
          modal.style.display = 'none';
        });
        document.body.style.overflow = '';
      }
    };
  }

  console.log('✅ Portfolio.js initialization complete:', {
    modalButtons: modalButtons.length,
    closeButtons: closeButtons.length,
    modals: modals.length,
    filterButtons: filterButtons.length,
    projectCards: projectCards.length
  });
});
