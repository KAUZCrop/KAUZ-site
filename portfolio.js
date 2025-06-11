// DOMContentLoaded 시점에 실행될 이벤트 등록
document.addEventListener('DOMContentLoaded', () => {

  // 1) 모달 열기/닫기 기능
  const modalButtons = document.querySelectorAll('.btn-more');
  const closeButtons = document.querySelectorAll('.close-btn');

  modalButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-modal');
      document.getElementById(modalId).style.display = 'flex';
    });
  });

  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-modal');
      document.getElementById(modalId).style.display = 'none';
    });
  });

  // 2) 모달 바깥 영역 클릭 시 닫기
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
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
      projectCards.forEach(card => {
        // "all"이면 모두 보이기, 아니면 data-filter 속성과 비교
        if (filterValue === 'all' || card.getAttribute('data-filter') === filterValue) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
});
