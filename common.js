 // ─── Contact 섹션 클릭 처리 (스크롤 방해 없이) ───
  if (contactSection) {
    let isScrolling = false;
    let scrollTimeout;
    let startY = 0;
    let startTime = 0;

    // 터치/마우스 시작 지점 기록
    contactSection.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
      startTime = Date.now();
      isScrolling = false;
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 150);
    }, { passive: true });

    contactSection.addEventListener('mousedown', (e) => {
      startY = e.clientY;
      startTime = Date.now();
      isScrolling = false;
    });

    // 스크롤 감지
    contactSection.addEventListener('touchmove', (e) => {
      const currentY = e.touches[0].clientY;
      const deltaY = Math.abs(currentY - startY);
      
      if (deltaY > 10) { // 10px 이상 움직이면 스크롤로 간주
        isScrolling = true;
      }
    }, { passive: true });

    contactSection.addEventListener('mousemove', (e) => {
      const currentY = e.clientY;
      const deltaY = Math.abs(currentY - startY);
      
      if (deltaY > 10) {
        isScrolling = true;
      }
    });

    // 클릭/터치 종료 시 처리
    contactSection.addEventListener('touchend', (e) => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 스크롤이 아니고, 짧은 터치(300ms 이하)면 클릭으로 간주
      if (!isScrolling && duration < 300) {
        e.preventDefault();
        window.location.href = 'contact.html';
      }
    });

    contactSection.addEventListener('click', (e) => {
      if (!isScrolling) {
        e.preventDefault();
        window.location.href = 'contact.html';
      }
    });
  }

  // ─── Typing Animation Function ───
  function startTypingAnimation() {
    const target1 = document.getElementById('typing-line1');
    const target2 = document.getElementById('typing-line2');
    
    console.log('Starting typing animation...', { target1, target2 });
    
    if (!target1 || !target2) {
      console.error('Typing targets not found');
      return;
    }

    const line1 = "Your brand's journey —";
    const line2 = "from insight in the Mind to impact that leaves a Mark.";
    const cursor  = '<span class="typing-cursor">|</span>';
    const totalDuration = 1700;
    const interval = totalDuration / (line1.length + line2.length);
    let i1 = 0, i2 = 0;

    function type1() {
      if (i1 < line1.length) {
        target1.innerHTML = line1.slice(0, i1) + cursor;
        i1++;
        setTimeout(type1, interval);
      } else {
        target1.textContent = line1;
        target2.innerHTML = cursor;
        setTimeout(type2, interval);
      }
    }
    
    function type2() {
      if (i2 < line2.length) {
        target2.innerHTML = line2.slice(0, i2) + cursor;
        i2++;
        setTimeout(type2, interval);
      } else {
        target2.textContent = line2;
      }
    }
    
    type1();
  }

  // ─── 로딩 스크린 처리 (수정된 버전) ───
  function hideLoadingScreen() {
    console.log('Hiding loading screen...');
    
    // 로딩 스크린 페이드 아웃
    if (loadingScreen) {
      loadingScreen.style.transition = 'opacity 0.5s ease';
      loadingScreen.style.opacity = '0';
    }

    // 햄버거 메뉴 표시
    if (hamburger) {
      hamburger.style.display = 'flex';
      hamburger.style.visibility = 'visible';
      hamburger.style.opacity = '1';
    }

    // 스크롤 잠금 해제
    document.body.style.overflow = '';
    document.body.classList.remove('loading');

    // 로딩 스크린 완전 제거 및 타이핑 시작
    setTimeout(() => {
      if (loadingScreen) {
        loadingScreen.style.display = 'none';
      }
      startTypingAnimation();
    }, 500);
  }

  // 초기 로딩 진행률 설정
  if (progressFill) {
    progressFill.style.width = '50%';
  }

  // 페이지 로드 완료 시
  window.addEventListener('load', () => {
    console.log('Window loaded');
    
    if (progressFill) {
      progressFill.style.width = '100%';
    }

    // 로딩 화면 숨기기
    setTimeout(hideLoadingScreen, 500);
  });

  // 폴백: 3초 후에도 로딩 화면이 남아있으면 강제로 숨기기
  setTimeout(() => {
    if (loadingScreen && loadingScreen.style.display !== 'none') {
      console.warn('Forcing loading screen removal');
      hideLoadingScreen();
    }
  }, 3000);

  // ─── 햄버거 메뉴 토글 (모든 화면 통일) ───
  if (hamburger && menuOverlay) {
    hamburger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const isMenuOpen = menuOverlay.classList.contains('active');
      console.log('Hamburger clicked, menu open:', isMenuOpen);
      
      if (isMenuOpen) {
        closeMenu();
      } else {
        menuOverlay.classList.add('active');
        hamburger.classList.add('active');
        document.body.style.overflow = 'hidden';
        document.body.classList.add('menu-open');
        console.log('Menu opened');
      }
    });

    // 메뉴 링크 클릭 시 닫기
    const menuLinks = document.querySelectorAll('#menu-overlay .menu-content a');
    console.log('Menu links found:', menuLinks.length);
    
    menuLinks.forEach((link, index) => {
      link.addEventListener('click', (e) => {
        console.log(`Menu link ${index} clicked`);
        closeMenu();
      });
    });
  } else {
    console.error('Hamburger or menu overlay not found!');
  }

  // ─── ESC키로 메뉴 닫기 ───
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      console.log('ESC key pressed');
      if (menuOverlay && menuOverlay.classList.contains('active')) {
        closeMenu();
      }
    }
  });

  // ─── 메뉴 오버레이 배경 클릭 시 닫기 ───
  if (menuOverlay) {
    menuOverlay.addEventListener('click', (e) => {
      if (e.target === menuOverlay) {
        console.log('Menu overlay background clicked');
        closeMenu();
      }
    });
  }

  // 나머지 코드는 동일...
  // (포트폴리오 로딩, fade-up 애니메이션 등)

  console.log('Main.js initialization complete');
});
