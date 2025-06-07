// ── about.js (About Us 전용 스크립트) ──

document.addEventListener('DOMContentLoaded', () => {
  // 🔥 페이지 새로고침 감지 및 메인페이지로 리다이렉트
  if (performance.getEntriesByType('navigation')[0].type === 'reload') {
    window.location.href = 'index.html';
    return;
  }

  // ✔️ 1) 햄버거 메뉴 토글 (common.js에도 동일 코드가 있을 경우 이 부분은 생략 가능)
  const hamburger = document.querySelector('.hamburger');
  const menuOverlay = document.getElementById('menu-overlay');
  if (hamburger && menuOverlay) {
    hamburger.addEventListener('click', () => {
      menuOverlay.classList.toggle('open');
    });
    menuOverlay.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menuOverlay.classList.remove('open');
      });
    });
  }

  // ✔️ 2) fade-up 애니메이션 (common.js에도 동일 코드가 있을 경우 생략 가능)
  const fadeUpElements = document.querySelectorAll('.fade-up');
  if (fadeUpElements.length) {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15,
    };

    const fadeUpObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, observerOptions);

    fadeUpElements.forEach((el) => {
      fadeUpObserver.observe(el);
    });
  }

  // ✔️ 3) About Us 페이지 전용 인터랙션 예시
  //    예: 팀원 카드 클릭 시 간단한 안내 팝업
  const teamMembers = document.querySelectorAll('.team-member');
  if (teamMembers.length) {
    teamMembers.forEach((member) => {
      member.addEventListener('click', () => {
        const name = member.querySelector('.team-name').textContent;
        alert(`${name} 님의 상세 프로필은 곧 업데이트됩니다.`);
      });
    });
  }
});
