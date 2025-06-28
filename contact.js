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
      
      // 🔥 강화된 유효성 검사
      const name = form.querySelector('#name').value.trim();
      const email = form.querySelector('#email').value.trim();
      const phone = form.querySelector('#phone').value.trim();
      const message = form.querySelector('#message').value.trim();

      // 1. 필수 필드 검사
      if (name === '' || email === '' || message === '') {
        showFormResponse('❌ 필수 항목(이름, 이메일, 메시지)을 모두 입력해주세요.', 'error');
        return;
      }

      // 2. 이름 유효성 검사 (한글/영문만, 최소 2글자)
      const namePattern = /^[가-힣a-zA-Z\s]{2,20}$/;
      if (!namePattern.test(name)) {
        showFormResponse('❌ 이름은 한글 또는 영문으로 2~20자 사이로 입력해주세요.', 'error');
        highlightField('name', true);
        return;
      }

      // 3. 이메일 유효성 검사 (강화된 패턴)
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(email)) {
        showFormResponse('❌ 올바른 이메일 형식을 입력해주세요. (예: example@domain.com)', 'error');
        highlightField('email', true);
        return;
      }

      // 4. 전화번호 유효성 검사 (입력된 경우에만)
      if (phone && phone !== '') {
        const phonePattern = /^(010|011|016|017|018|019)-?\d{3,4}-?\d{4}$|^(02|0[3-9][0-9]?)-?\d{3,4}-?\d{4}$/;
        const cleanPhone = phone.replace(/[\s-]/g, ''); // 공백과 하이픈 제거
        
        if (!phonePattern.test(phone) && !/^01[016789]\d{7,8}$/.test(cleanPhone)) {
          showFormResponse('❌ 올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)', 'error');
          highlightField('phone', true);
          return;
        }
      }

      // 5. 메시지 길이 검사
      if (message.length < 10) {
        showFormResponse('❌ 메시지는 최소 10자 이상 입력해주세요.', 'error');
        highlightField('message', true);
        return;
      }

      if (message.length > 1000) {
        showFormResponse('❌ 메시지는 1000자 이하로 입력해주세요.', 'error');
        highlightField('message', true);
        return;
      }

      // 6. 특수문자/스팸 패턴 검사
      const spamPatterns = [
        /\b(viagra|casino|lottery|winner|congratulations)\b/i,
        /http[s]?:\/\//i,
        /<script|javascript:/i,
        /[^\w\s가-힣@.,!?'"()-]/g
      ];

      for (let pattern of spamPatterns) {
        if (pattern.test(message) || pattern.test(name)) {
          showFormResponse('❌ 부적절한 내용이 포함되어 있습니다. 다시 확인해주세요.', 'error');
          return;
        }
      }

      // 🔥 모든 유효성 검사 통과 - 필드 하이라이트 제거
      clearAllFieldHighlights();

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
          
          // 🔥 Formspree 오류 메시지 파싱
          if (data.errors && data.errors.length > 0) {
            const errorMsg = data.errors.map(err => err.message).join(', ');
            showFormResponse(`❌ 전송 실패: ${errorMsg}`, 'error');
          } else {
            showFormResponse('❌ 전송 중 오류가 발생했습니다. 입력 내용을 확인하고 다시 시도해주세요.', 'error');
          }
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
    
    console.log('✅ Contact form AJAX handler with enhanced validation initialized');
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
      }, 8000); // 오류 메시지는 더 오래 표시
    }
  }

  // 🔥 필드 하이라이트 함수 (오류 표시)
  function highlightField(fieldId, isError) {
    const field = document.getElementById(fieldId);
    if (field) {
      if (isError) {
        field.style.borderColor = '#ff6b6b';
        field.style.boxShadow = '0 0 0 3px rgba(255, 107, 107, 0.2)';
        field.style.backgroundColor = '#2a1a1a';
      } else {
        field.style.borderColor = '#4caf50';
        field.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.2)';
        field.style.backgroundColor = '#1a2a1a';
      }
    }
  }

  // 🔥 모든 필드 하이라이트 제거
  function clearAllFieldHighlights() {
    const fields = ['name', 'email', 'phone', 'message'];
    fields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.style.borderColor = '#333';
        field.style.boxShadow = 'none';
        field.style.backgroundColor = '#1a1a1a';
      }
    });
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

  // 6) 🔥 개선된 입력 필드 포커스 효과
  const inputFields = document.querySelectorAll('input, textarea, select');
  inputFields.forEach(field => {
    field.addEventListener('focus', () => {
      // 포커스 시에는 오류 상태가 아닌 경우에만 하이라이트
      if (!field.style.borderColor.includes('rgb(255, 107, 107)')) {
        field.style.borderColor = '#E37031';
        field.style.boxShadow = '0 0 0 3px rgba(227, 112, 49, 0.1)';
        field.style.backgroundColor = '#222';
      }
    });
    
    field.addEventListener('blur', () => {
      // 블러 시에는 오류/성공 상태가 아닌 경우에만 기본값으로
      if (!field.style.borderColor.includes('rgb(255, 107, 107)') && 
          !field.style.borderColor.includes('rgb(76, 175, 80)')) {
        field.style.borderColor = '#333';
        field.style.boxShadow = 'none';
        field.style.backgroundColor = '#1a1a1a';
      }
    });
  });

  console.log('✅ Enhanced input field focus effects initialized');

  // 4) 🔥 강화된 실시간 입력 유효성 검사
  const emailField = document.getElementById('email');
  if (emailField) {
    emailField.addEventListener('input', () => {
      const email = emailField.value.trim();
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      
      if (email === '') {
        emailField.style.borderColor = '#333';
        emailField.style.boxShadow = 'none';
        emailField.style.backgroundColor = '#1a1a1a';
      } else if (!emailPattern.test(email)) {
        highlightField('email', true);
      } else {
        highlightField('email', false);
      }
    });
  }

  // 🔥 이름 실시간 검증
  const nameField = document.getElementById('name');
  if (nameField) {
    nameField.addEventListener('input', () => {
      const name = nameField.value.trim();
      const namePattern = /^[가-힣a-zA-Z\s]{2,20}$/;
      
      if (name === '') {
        nameField.style.borderColor = '#333';
        nameField.style.boxShadow = 'none';
        nameField.style.backgroundColor = '#1a1a1a';
      } else if (!namePattern.test(name)) {
        highlightField('name', true);
      } else {
        highlightField('name', false);
      }
    });
  }

  // 🔥 전화번호 실시간 검증
  const phoneField = document.getElementById('phone');
  if (phoneField) {
    phoneField.addEventListener('input', () => {
      const phone = phoneField.value.trim();
      
      if (phone === '') {
        phoneField.style.borderColor = '#333';
        phoneField.style.boxShadow = 'none';
        phoneField.style.backgroundColor = '#1a1a1a';
        return;
      }
      
      const phonePattern = /^(010|011|016|017|018|019)-?\d{3,4}-?\d{4}$|^(02|0[3-9][0-9]?)-?\d{3,4}-?\d{4}$/;
      const cleanPhone = phone.replace(/[\s-]/g, '');
      
      if (!phonePattern.test(phone) && !/^01[016789]\d{7,8}$/.test(cleanPhone)) {
        highlightField('phone', true);
      } else {
        highlightField('phone', false);
      }
    });

    // 🔥 전화번호 자동 포맷팅
    phoneField.addEventListener('keyup', () => {
      let value = phoneField.value.replace(/[^0-9]/g, '');
      
      if (value.startsWith('010') || value.startsWith('011') || value.startsWith('016') || 
          value.startsWith('017') || value.startsWith('018') || value.startsWith('019')) {
        if (value.length <= 3) {
          value = value;
        } else if (value.length <= 7) {
          value = value.slice(0, 3) + '-' + value.slice(3);
        } else {
          value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
        }
      } else if (value.startsWith('02')) {
        if (value.length <= 2) {
          value = value;
        } else if (value.length <= 5) {
          value = value.slice(0, 2) + '-' + value.slice(2);
        } else {
          value = value.slice(0, 2) + '-' + value.slice(2, 6) + '-' + value.slice(6, 10);
        }
      } else if (value.length >= 3 && (value.startsWith('03') || value.startsWith('04') || 
                value.startsWith('05') || value.startsWith('06') || value.startsWith('07') || 
                value.startsWith('08') || value.startsWith('09'))) {
        if (value.length <= 3) {
          value = value;
        } else if (value.length <= 6) {
          value = value.slice(0, 3) + '-' + value.slice(3);
        } else {
          value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
        }
      }
      
      phoneField.value = value;
    });
  }

  // 5) 🔥 강화된 문자 수 카운터 및 메시지 검증
  const messageField = document.getElementById('message');
  const messageCounter = document.getElementById('messageCounter');
  
  if (messageField && messageCounter) {
    function updateMessageCounter() {
      const length = messageField.value.length;
      messageCounter.textContent = length;
      
      // 🔥 메시지 길이별 상태 표시
      if (length === 0) {
        messageCounter.parentElement.style.color = '#666';
        messageField.style.borderColor = '#333';
        messageField.style.boxShadow = 'none';
        messageField.style.backgroundColor = '#1a1a1a';
      } else if (length < 10) {
        messageCounter.parentElement.style.color = '#E37031';
        highlightField('message', true);
      } else if (length > 1000) {
        messageCounter.parentElement.style.color = '#ff6b6b';
        highlightField('message', true);
      } else if (length > 800) {
        messageCounter.parentElement.style.color = '#E37031';
        messageField.style.borderColor = '#E37031';
        messageField.style.boxShadow = '0 0 0 3px rgba(227, 112, 49, 0.1)';
        messageField.style.backgroundColor = '#1a1a1a';
      } else {
        messageCounter.parentElement.style.color = '#4caf50';
        highlightField('message', false);
      }

      // 🔥 스팸 패턴 실시간 검사
      const message = messageField.value;
      const spamPatterns = [
        /http[s]?:\/\//i,
        /<script|javascript:/i
      ];

      for (let pattern of spamPatterns) {
        if (pattern.test(message)) {
          messageCounter.parentElement.style.color = '#ff6b6b';
          highlightField('message', true);
          break;
        }
      }
    }
    
    messageField.addEventListener('input', updateMessageCounter);
    updateMessageCounter(); // 초기 카운터 설정
    
    console.log('✅ Enhanced message character counter initialized');
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
      // 🔥 강화된 폼 테스트 기능
      testFormSubmit: () => {
        const form = document.getElementById('contactForm');
        if (form) {
          // 유효한 테스트 데이터 입력
          form.querySelector('#name').value = '김테스트';
          form.querySelector('#email').value = 'test@example.com';
          form.querySelector('#phone').value = '010-1234-5678';
          form.querySelector('#message').value = '이것은 테스트 메시지입니다. 폼 전송 기능을 테스트하고 있습니다.';
          console.log('🧪 Valid test data filled in form');
        }
      },
      // 🔥 잘못된 데이터로 테스트
      testInvalidData: () => {
        const form = document.getElementById('contactForm');
        if (form) {
          form.querySelector('#name').value = '김'; // 너무 짧음
          form.querySelector('#email').value = 'invalid-email'; // 잘못된 이메일
          form.querySelector('#phone').value = '123'; // 잘못된 전화번호
          form.querySelector('#message').value = '짧음'; // 너무 짧은 메시지
          console.log('🧪 Invalid test data filled in form');
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
      // 🔥 개별 필드 검증 테스트
      testFieldValidation: (fieldId, value) => {
        const field = document.getElementById(fieldId);
        if (field) {
          field.value = value;
          field.dispatchEvent(new Event('input'));
          console.log(`🔍 Testing ${fieldId} with value: "${value}"`);
        }
      },
      // 🔥 모든 필드 하이라이트 제거
      clearAllHighlights: () => {
        clearAllFieldHighlights();
        console.log('🧹 All field highlights cleared');
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
        enhancedFormValidation: true,
        realTimeFieldValidation: true,
        characterCounter: !!messageCounter,
        loadingButton: !!(btnText && btnLoading),
        gradientLineAboveFooter: true,
        ajaxMailSubmission: true,
        phoneNumberFormatting: true,
        spamDetection: true,
        fieldHighlighting: true
      }
    });
    
    // 🎨 푸터 그라디언트 라인 최종 확인
    if (footerGradientLine) {
      console.log('🎨 Footer gradient line check passed ✅');
    } else {
      console.warn('⚠️ Footer gradient line not found in final check');
    }
    
  }, 100);

  console.log('✅ Contact.js initialization complete - Enhanced validation + AJAX submission + Field highlighting');
});
