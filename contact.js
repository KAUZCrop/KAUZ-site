document.addEventListener('DOMContentLoaded', () => {
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

  console.log('📄 Contact.js initialized');

  const form = document.getElementById('contactForm');
  const formResponse = document.getElementById('formResponse');
  
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // 입력 값 가져오기
      const name = form.querySelector('#name').value.trim();
      const email = form.querySelector('#email').value.trim();
      const company = form.querySelector('#company').value.trim();
      const budget = form.querySelector('#budget').value;
      const message = form.querySelector('#message').value.trim();

      // 간단 유효성 검사
      if (name === '' || email === '' || message === '') {
        if (formResponse) {
          formResponse.textContent = '필수 항목(이름, 이메일, 메시지)을 모두 입력해주세요.';
          formResponse.style.visibility = 'visible';
          formResponse.style.backgroundColor = '#ff6b6b';
        }
        return;
      }

      // 이메일 형식 체크
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        if (formResponse) {
          formResponse.textContent = '올바른 이메일 형식을 입력해주세요.';
          formResponse.style.visibility = 'visible';
          formResponse.style.backgroundColor = '#ff6b6b';
        }
        return;
      }

      // 성공 메시지 표시
      if (formResponse) {
        formResponse.textContent = '메시지가 성공적으로 전송되었습니다! 곧 연락드리겠습니다.';
        formResponse.style.visibility = 'visible';
        formResponse.style.backgroundColor = '#4caf50';
      }

      // 폼 초기화
      form.reset();

      // 일정 시간 후 응답 메시지 숨기기
      setTimeout(() => {
        if (formResponse) {
          formResponse.style.visibility = 'hidden';
        }
      }, 5000);

      console.log('📧 Contact form submitted successfully');
    });
    
    console.log('✅ Contact form initialized');
  } else {
    console.warn('⚠️ Contact form not found');
  }

  // Contact 페이지 전용 추가 기능들
  
  // 입력 필드 포커스 효과
  const inputFields = document.querySelectorAll('input, textarea, select');
  inputFields.forEach(field => {
    field.addEventListener('focus', () => {
      field.style.borderColor = '#E37031';
      field.style.boxShadow = '0 0 5px rgba(227, 112, 49, 0.3)';
    });
    
    field.addEventListener('blur', () => {
      field.style.borderColor = '#333';
      field.style.boxShadow = 'none';
    });
  });

  // 실시간 입력 유효성 검사
  const emailField = document.getElementById('email');
  if (emailField) {
    emailField.addEventListener('input', () => {
      const email = emailField.value.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (email && !emailPattern.test(email)) {
        emailField.style.borderColor = '#ff6b6b';
      } else {
        emailField.style.borderColor = '#333';
      }
    });
  }

  // 문자 수 카운터 (메시지 필드)
  const messageField = document.getElementById('message');
  if (messageField) {
    const counter = document.createElement('div');
    counter.style.cssText = `
      text-align: right;
      font-size: 0.8rem;
      color: #666;
      margin-top: 5px;
    `;
    messageField.parentNode.appendChild(counter);
    
    function updateCounter() {
      const length = messageField.value.length;
      counter.textContent = `${length}/1000 characters`;
      
      if (length > 1000) {
        counter.style.color = '#ff6b6b';
        messageField.style.borderColor = '#ff6b6b';
      } else {
        counter.style.color = '#666';
        messageField.style.borderColor = '#333';
      }
    }
    
    messageField.addEventListener('input', updateCounter);
    updateCounter(); // 초기 카운터 설정
  }

  // 폼 제출 버튼 로딩 상태
  const submitButton = document.querySelector('.btn-submit');
  if (submitButton && form) {
    const originalText = submitButton.textContent;
    
    form.addEventListener('submit', () => {
      submitButton.textContent = 'Sending...';
      submitButton.disabled = true;
      submitButton.style.opacity = '0.7';
      
      setTimeout(() => {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        submitButton.style.opacity = '1';
      }, 2000);
    });
  }
  
  console.log('✅ Contact.js initialization complete');
});
