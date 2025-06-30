// contact.js (Contact Us 전용 스크립트) - About 스타일 구조 적용
// 🔥 AJAX 방식으로 메일 전송 + 리다이렉트 방지

document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 Contact.js starting...');

  // ─── 🔥 새로고침 시 페이지 상단으로 이동 (리다이렉트 대신) ───
  try {
    if (performance.getEntriesByType('navigation')[0].type === 'reload') {
      console.log('🔄 Contact page refresh detected, scrolling to top...');
      window.scrollTo(0, 0);
      // 리다이렉트 코드 제거됨
    }
  } catch (e) {
    console.log('⚠️ Navigation API not supported, continuing...');
  }

  // ─── Contact 페이지 전용 기능들만 여기서 처리 ───

  // 1) SCROLL 인디케이터 클릭 이벤트 (About 페이지와 동일)
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      const mainContent = document.querySelector('.main-content') || 
                         document.querySelector('.contact-content-wrapper') ||
                         document.querySelector('.content-section');
      
      if (mainContent) {
        mainContent.scrollIntoView({
          behavior: 'smooth'
        });
        console.log('📜 Smooth scroll to main content initiated');
      }
    });
    console.log('✅ Contact page scroll indicator initialized');
  }

  // 2) Contact 페이지 전용 fade-up 애니메이션 (common.js와 중복 방지)
  const contactFadeElements = document.querySelectorAll('.fade-up:not([data-contact-observed])');
  
  if (contactFadeElements.length > 0) {
    const contactObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          entry.target.classList.add('visible');
          contactObserver.unobserve(entry.target);
        }
      });
    }, { 
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px'
    });
    
    contactFadeElements.forEach((element) => {
      element.setAttribute('data-contact-observed', 'true');
      contactObserver.observe(element);
    });
    
    console.log('✅ Contact page fade-up animations initialized:', contactFadeElements.length);
  }

  // ─── 🔥 폼 관련 기능들 - 메일 전송 오류 해결 ───
  const form = document.getElementById('contactForm');
  const formResponse = document.getElementById('formResponse');
  const submitButton = document.getElementById('submitButton');
  const btnText = submitButton?.querySelector('.btn-text');
  const btnLoading = submitButton?.querySelector('.btn-loading');
  
  if (form) {
    // 🔥 AJAX 방식으로 폼 제출 (리다이렉트 방지)
    form.addEventListener('submit', async (e) => {
      e.preventDefault(); // 기본 제출 방지
      
      // 기본 유효성 검사
      const name = form.querySelector('#name').value.trim();
      const email = form.querySelector('#email').value.trim();
      const message = form.querySelector('#message').value.trim();

      // 필수 필드 검사
      if (name === '' || email === '' || message === '') {
        showFormResponse('필수 항목(이름, 이메일, 메시지)을 모두 입력해주세요.', 'error');
        return;
      }

      // 이메일 형식 검사
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        showFormResponse('올바른 이메일 형식을 입력해주세요.', 'error');
        return;
      }

      // 메시지 길이 검사
      if (message.length > 1000) {
        showFormResponse('메시지는 1000자 이하로 입력해주세요.', 'error');
        return;
      }

      // 로딩 상태 시작
      setSubmitButtonLoading(true);

      try {
        // 🔥 AJAX로 Formspree에 전송
        const formData = new FormData(form);
        
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          // 성공
          showFormResponse('✅ 메시지가 성공적으로 전송되었습니다! 곧 연락드리겠습니다.', 'success');
          form.reset(); // 폼 초기화
          
          // 카운터 리셋
          if (messageCounter && typeof updateMessageCounter === 'function') {
            updateMessageCounter();
          }
          
          console.log('📧 Contact form submitted successfully via AJAX');
        } else {
          // 실패
          const data = await response.json();
          console.error('Form submission failed:', data);
          showFormResponse('❌ 전송 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
        }
      } catch (error) {
        // 네트워크 오류
        console.error('Form submission error:', error);
        showFormResponse('❌ 네트워크 오류가 발생했습니다. 인터넷 연결을 확인하고 다시 시도해주세요.', 'error');
      } finally {
        // 로딩 상태 종료
        setSubmitButtonLoading(false);
      }
    });
    
    console.log('✅ Contact form AJAX handler initialized');
  } else {
    console.warn('⚠️ Contact form not found');
  }

  // 폼 응답 메시지 표시 함수
  function showFormResponse(message, type = 'success') {
    if (formResponse) {
      formResponse.textContent = message;
      formResponse.className = `form-response ${type}`;
      formResponse.style.visibility = 'visible';
      
      // 일정 시간 후 메시지 숨기기
      setTimeout(() => {
        formResponse.style.visibility = 'hidden';
      }, 5000);
    }
  }

  // 제출 버튼 로딩 상태 제어
  function setSubmitButtonLoading(isLoading) {
    if (submitButton && btnText && btnLoading) {
      if (isLoading) {
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        submitButton.disabled = true;
        submitButton.style.opacity = '0.7';
      } else {
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        submitButton.disabled = false;
        submitButton.style.opacity = '1';
      }
    }
  }

  // 3) 입력 필드 포커스 효과 개선
  const inputFields = document.querySelectorAll('input, textarea, select');
  inputFields.forEach(field => {
    field.addEventListener('focus', () => {
      field.style.borderColor = '#E37031';
      field.style.boxShadow = '0 0 0 3px rgba(227, 112, 49, 0.1)';
      field.style.backgroundColor = '#222';
    });
    
    field.addEventListener('blur', () => {
      field.style.borderColor = '#333';
      field.style.boxShadow = 'none';
      field.style.backgroundColor = '#1a1a1a';
    });
  });

  // 4) 실시간 입력 유효성 검사 개선
  const emailField = document.getElementById('email');
  if (emailField) {
    emailField.addEventListener('input', () => {
      const email = emailField.value.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (email && !emailPattern.test(email)) {
        emailField.style.borderColor = '#ff6b6b';
        emailField.style.boxShadow = '0 0 0 3px rgba(255, 107, 107, 0.1)';
      } else {
        emailField.style.borderColor = '#333';
        emailField.style.boxShadow = 'none';
      }
    });
  }

  // 5) 문자 수 카운터 개선 (메시지 필드)
  const messageField = document.getElementById('message');
  const messageCounter = document.getElementById('messageCounter');
  
  if (messageField && messageCounter) {
    function updateMessageCounter() {
      const length = messageField.value.length;
      messageCounter.textContent = length;
      
      if (length > 1000) {
        messageCounter.parentElement.style.color = '#ff6b6b';
        messageField.style.borderColor = '#ff6b6b';
        messageField.style.boxShadow = '0 0 0 3px rgba(255, 107, 107, 0.1)';
      } else if (length > 800) {
        messageCounter.parentElement.style.color = '#E37031';
        messageField.style.borderColor = '#E37031';
        messageField.style.boxShadow = '0 0 0 3px rgba(227, 112, 49, 0.1)';
      } else {
        messageCounter.parentElement.style.color = '#666';
        messageField.style.borderColor = '#333';
        messageField.style.boxShadow = 'none';
      }
    }
    
    messageField.addEventListener('input', updateMessageCounter);
    updateMessageCounter(); // 초기 카운터 설정
    
    console.log('✅ Message character counter initialized');
  }

  // 6) 폼 필드별 실시간 검증
  const nameField = document.getElementById('name');
  if (nameField) {
    nameField.addEventListener('input', () => {
      const name = nameField.value.trim();
      if (name.length > 0 && name.length < 2) {
        nameField.style.borderColor = '#E37031';
      } else {
        nameField.style.borderColor = '#333';
      }
    });
  }

  const phoneField = document.getElementById('phone');
  if (phoneField) {
    phoneField.addEventListener('input', () => {
      const phone = phoneField.value.trim();
      const phonePattern = /^[0-9+\-\s()]+$/;
      
      if (phone && !phonePattern.test(phone)) {
        phoneField.style.borderColor = '#E37031';
      } else {
        phoneField.style.borderColor = '#333';
      }
    });
  }

  // ─── 🔥 푸터 그라디언트 라인 확인 및 초기화 ───
  const footerGradientLine = document.getElementById('footerGradientLine');
  if (footerGradientLine) {
    console.log('✅ Footer gradient line found:', {
      element: footerGradientLine,
      className: footerGradientLine.className,
      computed: window.getComputedStyle(footerGradientLine)
    });
    
    // 그라디언트 라인 가시성 강제 확인
    const lineStyles = window.getComputedStyle(footerGradientLine);
    console.log('🎨 Footer gradient line styles:', {
      width: lineStyles.width,
      height: lineStyles.height,
      background: lineStyles.background,
      opacity: lineStyles.opacity,
      display: lineStyles.display,
      visibility: lineStyles.visibility
    });
    
  } else {
    console.warn('⚠️ Footer gradient line element not found! Adding fallback...');
    
    // 동적으로 그라디언트 라인 생성
    const footer = document.querySelector('.site-footer');
    if (footer) {
      const fallbackLine = document.createElement('div');
      fallbackLine.id = 'footerGradientLine';
      fallbackLine.className = 'footer-gradient-line';
      fallbackLine.style.cssText = `
        width: 100vw;
        height: 3.5px;
        background: linear-gradient(90deg, 
          transparent 0%, 
          #E37031 20%, 
          #ff8c42 50%, 
          #E37031 80%, 
          transparent 100%
        );
        opacity: 0.6;
        margin: 50px 0 0 0;
        position: relative;
        left: 50%;
        transform: translateX(-50%);
      `;
      
      footer.parentNode.insertBefore(fallbackLine, footer);
      console.log('🔧 Fallback footer gradient line created and inserted');
    }
  }

  // 7) 스크롤 진행률 표시 (CSS 변수로 설정)
  function updateScrollProgress() {
    const scrollTop = window.pageYOffset;
    const docHeight = document.body.offsetHeight - window.innerHeight;
    const scrollPercent = Math.min((scrollTop / docHeight) * 100, 100);
    
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

  // 8) 모바일 터치 최적화
  if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
    console.log('📱 Touch device detected, mobile optimizations applied');
  }

  // 9) 브라우저 호환성 체크 및 폴백
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

  // 10) Contact 페이지 전용 키보드 네비게이션
  document.addEventListener('keydown', (e) => {
    // ESC 키 처리는 common.js에서 하므로 여기서는 제외
    if (e.key === 'Home' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    if (e.key === 'End' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }

    // Enter 키로 폼 제출 (textarea에서는 제외)
    if (e.key === 'Enter' && e.ctrlKey && document.activeElement.tagName !== 'TEXTAREA') {
      const submitBtn = document.getElementById('submitButton');
      if (submitBtn && !submitBtn.disabled) {
        submitBtn.click();
      }
    }
  });

  // ─── 🔥 그라디언트 라인 디버깅 도구 추가 ───
  window.contactGradientDebug = {
    // 그라디언트 라인 확인
    checkLine: () => {
      const line = document.getElementById('footerGradientLine');
      if (line) {
        const rect = line.getBoundingClientRect();
        const styles = window.getComputedStyle(line);
        
        console.log('🎨 Footer gradient line status:', {
          element: line,
          visible: rect.height > 0 && styles.opacity > 0,
          position: {
            top: rect.top,
            bottom: rect.bottom,
            left: rect.left,
            right: rect.right,
            width: rect.width,
            height: rect.height
          },
          styles: {
            background: styles.background,
            opacity: styles.opacity,
            display: styles.display,
            visibility: styles.visibility,
            position: styles.position,
            transform: styles.transform
          }
        });
        
        // 라인으로 스크롤
        line.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        return line;
      } else {
        console.error('❌ Footer gradient line not found');
        return null;
      }
    },
    
    // 라인 강제 생성
    createLine: () => {
      const existingLine = document.getElementById('footerGradientLine');
      if (existingLine) {
        existingLine.remove();
      }
      
      const footer = document.querySelector('.site-footer');
      if (footer) {
        const newLine = document.createElement('div');
        newLine.id = 'footerGradientLine';
        newLine.className = 'footer-gradient-line';
        newLine.style.cssText = `
          width: 100vw !important;
          height: 5px !important;
          background: linear-gradient(90deg, 
            transparent 0%, 
            #E37031 20%, 
            #ff8c42 50%, 
            #E37031 80%, 
            transparent 100%
          ) !important;
          opacity: 1 !important;
          margin: 50px 0 0 0 !important;
          position: relative !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          z-index: 9999 !important;
        `;
        
        footer.parentNode.insertBefore(newLine, footer);
        console.log('🔧 New footer gradient line created with enhanced visibility');
        
        // 생성된 라인으로 스크롤
        setTimeout(() => {
          newLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        
        return newLine;
      }
    }
  };

  // 11) 성능 모니터링 (개발용)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🛠️ Contact page development mode');
    console.log('📊 Contact page elements:', {
      fadeUpElements: document.querySelectorAll('.fade-up').length,
      contentSections: document.querySelectorAll('.content-section').length,
      formFields: document.querySelectorAll('input, textarea, select').length,
      scrollIndicator: !!scrollIndicator,
      contactForm: !!form,
      submitButton: !!submitButton,
      footerGradientLine: !!footerGradientLine
    });

    // 성능 측정
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('⚡ Contact page performance:', {
          domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart) + 'ms',
          loadComplete: Math.round(perfData.loadEventEnd - perfData.loadEventStart) + 'ms',
          totalTime: Math.round(perfData.loadEventEnd - perfData.fetchStart) + 'ms'
        });
      }, 100);
    });

    // 디버깅용 전역 함수
    window.contactDebug = {
      scrollToTop: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
      scrollToContent: () => {
        const content = document.querySelector('.main-content');
        if (content) content.scrollIntoView({ behavior: 'smooth' });
      },
      showAllElements: () => {
        document.querySelectorAll('.fade-up').forEach(el => {
          el.classList.add('is-visible');
        });
      },
      testFormSubmit: () => {
        const form = document.getElementById('contactForm');
        if (form) {
          // 테스트 데이터 입력
          form.querySelector('#name').value = 'Test User';
          form.querySelector('#email').value = 'test@example.com';
          form.querySelector('#message').value = 'This is a test message';
          console.log('🧪 Test data filled in form');
        }
      },
      checkFormValidation: () => {
        const form = document.getElementById('contactForm');
        if (form) {
          const isValid = form.checkValidity();
          console.log('✅ Form validation status:', isValid);
          return isValid;
        }
      },
      checkGradientLine: () => {
        return contactGradientDebug.checkLine();
      },
      createGradientLine: () => {
        return contactGradientDebug.createLine();
      }
    };
  }

  // 12) 초기화 완료 후 상태 확인
  setTimeout(() => {
    const isCommonJsLoaded = typeof window.debugMenu !== 'undefined';
    console.log('🔍 Contact page initialization status:', {
      commonJsLoaded: isCommonJsLoaded,
      elementsFound: {
        scrollIndicator: !!scrollIndicator,
        fadeElements: document.querySelectorAll('.fade-up').length,
        contactForm: !!form,
        formFields: document.querySelectorAll('input, textarea, select').length,
        submitButton: !!submitButton,
        footerGradientLine: !!footerGradientLine
      },
      features: {
        formValidation: true,
        characterCounter: !!messageCounter,
        loadingButton: !!(btnText && btnLoading),
        gradientLineAboveFooter: true,
        mailSubmissionFixed: true
      }
    });
    
    // 🎨 푸터 그라디언트 라인 최종 확인
    if (footerGradientLine) {
      console.log('🎨 Footer gradient line check passed ✅');
    } else {
      console.warn('⚠️ Footer gradient line not found in final check');
    }
    
  }, 100);

  console.log('✅ Contact.js initialization complete - Mail submission fixed + Footer gradient line added');
});
