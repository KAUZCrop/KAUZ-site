// contact.js - Contact Form AJAX 처리 (JSON 방식)
// 🔥 Formspree JSON 방식으로 수정하여 메일 전송 보장

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Contact.js loading...');

  // ─── 🔥 폼 요소들 가져오기 ───
  const contactForm = document.getElementById('contactForm');
  const submitButton = document.getElementById('submitButton');
  const btnText = submitButton?.querySelector('.btn-text');
  const btnLoading = submitButton?.querySelector('.btn-loading');
  const formResponse = document.getElementById('formResponse');
  const messageTextarea = document.getElementById('message');
  const messageCounter = document.getElementById('messageCounter');

  // 필수 요소 확인
  if (!contactForm) {
    console.error('❌ Contact form not found');
    return;
  }

  if (!submitButton) {
    console.error('❌ Submit button not found');
    return;
  }

  console.log('✅ All form elements found');

  // ─── 🔥 메시지 카운터 기능 ───
  if (messageTextarea && messageCounter) {
    messageTextarea.addEventListener('input', () => {
      const currentLength = messageTextarea.value.length;
      messageCounter.textContent = currentLength;
      
      // 1000자 초과 시 경고 색상
      if (currentLength > 1000) {
        messageCounter.style.color = '#ff6b6b';
        messageTextarea.style.borderColor = '#ff6b6b';
      } else {
        messageCounter.style.color = '#666';
        messageTextarea.style.borderColor = '#333';
      }
    });

    // 초기 카운터 설정
    messageCounter.textContent = '0';
  }

  // ─── 🔥 응답 메시지 표시 함수 ───
  function showResponse(message, isError = false) {
    if (!formResponse) return;
    
    formResponse.textContent = message;
    formResponse.className = `form-response ${isError ? 'error' : ''}`;
    formResponse.style.visibility = 'visible';
    formResponse.style.opacity = '1';
    
    // 자동으로 숨기기 (성공 시 7초, 에러 시 5초)
    const hideDelay = isError ? 5000 : 7000;
    setTimeout(() => {
      formResponse.style.opacity = '0';
      setTimeout(() => {
        formResponse.style.visibility = 'hidden';
      }, 300);
    }, hideDelay);
  }

  // ─── 🔥 버튼 상태 변경 함수 ───
  function setButtonLoading(isLoading) {
    if (!submitButton || !btnText || !btnLoading) return;
    
    if (isLoading) {
      submitButton.disabled = true;
      btnText.style.display = 'none';
      btnLoading.style.display = 'inline';
      submitButton.style.opacity = '0.7';
      submitButton.style.cursor = 'not-allowed';
    } else {
      submitButton.disabled = false;
      btnText.style.display = 'inline';
      btnLoading.style.display = 'none';
      submitButton.style.opacity = '1';
      submitButton.style.cursor = 'pointer';
    }
  }

  // ─── 🔥 폼 데이터 검증 함수 ───
  function validateFormData(data) {
    const { name, email, message } = data;

    if (!name || name.trim().length < 2) {
      return '이름을 2글자 이상 입력해주세요.';
    }

    if (!email || !email.includes('@') || !email.includes('.')) {
      return '유효한 이메일 주소를 입력해주세요.';
    }

    if (!message || message.trim().length < 10) {
      return '메시지를 10글자 이상 입력해주세요.';
    }

    if (message.length > 1000) {
      return '메시지는 1000자 이하로 입력해주세요.';
    }

    return null; // 검증 통과
  }

  // ─── 🔥 JSON 방식으로 Formspree에 데이터 전송 ───
  async function submitFormData(formData) {
    try {
      console.log('📤 Sending JSON data to Formspree...');
      console.log('📋 Data to send:', formData);
      
      // 🔥 JSON 방식으로 전송 (Formspree 공식 권장)
      const response = await fetch('https://formspree.io/f/mkgrljlv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      // 응답 텍스트도 확인
      const responseText = await response.text();
      console.log('📥 Response text:', responseText);

      if (response.ok) {
        console.log('✅ Form submitted successfully');
        
        // JSON 파싱 시도
        let responseData = {};
        try {
          responseData = JSON.parse(responseText);
          console.log('📊 Parsed response:', responseData);
        } catch (e) {
          console.log('⚠️ Response is not JSON, but request was successful');
        }

        showResponse(`메시지가 성공적으로 전송되었습니다! 
        이메일이 admin@kauzcrop.com으로 발송되었으며, 
        빠른 시간 내에 연락드리겠습니다.`);
        
        // 폼 초기화
        contactForm.reset();
        if (messageCounter) messageCounter.textContent = '0';
        
        // 성공 시 부드럽게 상단으로 스크롤
        setTimeout(() => {
          window.scrollTo({ 
            top: 0, 
            behavior: 'smooth' 
          });
        }, 1000);
        
        return true;
      } else {
        // Formspree에서 에러 응답을 받은 경우
        let errorMessage = '전송 중 오류가 발생했습니다.';
        
        try {
          const errorData = JSON.parse(responseText);
          console.error('❌ Formspree error:', errorData);
          
          if (errorData.errors && errorData.errors.length > 0) {
            errorMessage = errorData.errors.map(err => err.message || err).join(', ');
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          console.error('❌ Error parsing error response:', e);
          errorMessage = `전송 실패 (HTTP ${response.status}): ${responseText.slice(0, 100)}`;
        }
        
        showResponse(errorMessage + ' 잠시 후 다시 시도해주세요.', true);
        return false;
      }
    } catch (error) {
      console.error('❌ Network/Fetch error:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        showResponse('인터넷 연결을 확인하고 다시 시도해주세요.', true);
      } else if (error.name === 'AbortError') {
        showResponse('요청이 취소되었습니다. 다시 시도해주세요.', true);
      } else {
        showResponse(`전송 중 오류가 발생했습니다: ${error.message}`, true);
      }
      return false;
    }
  }

  // ─── 🔥 폼 제출 이벤트 처리 (JSON 방식) ───
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // 🔥 기본 폼 제출 동작 차단
    e.stopPropagation();
    
    console.log('📝 Form submit triggered (JSON method)');
    
    // 이미 전송 중이면 무시
    if (submitButton.disabled) {
      console.log('⚠️ Form already submitting, ignoring...');
      return;
    }

    // 🔥 FormData 대신 일반 객체로 데이터 수집
    const formInputs = {
      company: document.getElementById('company')?.value || '',
      name: document.getElementById('name')?.value || '',
      email: document.getElementById('email')?.value || '',
      phone: document.getElementById('phone')?.value || '',
      budget: document.getElementById('budget')?.value || '',
      message: document.getElementById('message')?.value || ''
    };

    // 🔥 Formspree에 전송할 JSON 데이터 구성
    const jsonData = {
      email: formInputs.email.trim(),
      name: formInputs.name.trim(),
      company: formInputs.company.trim(),
      phone: formInputs.phone.trim(),
      budget: formInputs.budget.trim(),
      message: formInputs.message.trim(),
      _subject: '[KAUZ 사이트] 새로운 프로젝트 문의',
      _replyto: formInputs.email.trim(),
      _template: 'table'
    };
    
    // 디버깅용 데이터 출력
    console.log('📋 JSON data to send:', jsonData);

    // 클라이언트 사이드 검증
    const validationError = validateFormData(formInputs);
    if (validationError) {
      showResponse(validationError, true);
      return;
    }

    // 로딩 상태 시작
    setButtonLoading(true);
    
    // 이전 응답 메시지 숨기기
    if (formResponse) {
      formResponse.style.visibility = 'hidden';
      formResponse.style.opacity = '0';
    }

    // JSON으로 폼 전송
    const success = await submitFormData(jsonData);
    
    // 로딩 상태 종료
    setButtonLoading(false);
    
    console.log(success ? '✅ Form submission completed successfully' : '❌ Form submission failed');
  });

  // ─── 🔥 입력 필드 실시간 검증 ───
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');

  if (nameInput) {
    nameInput.addEventListener('blur', () => {
      const name = nameInput.value.trim();
      if (name && name.length < 2) {
        nameInput.style.borderColor = '#ff6b6b';
        nameInput.style.boxShadow = '0 0 0 3px rgba(255, 107, 107, 0.1)';
      } else {
        nameInput.style.borderColor = '#333';
        nameInput.style.boxShadow = 'none';
      }
    });

    nameInput.addEventListener('focus', () => {
      nameInput.style.borderColor = '#E37031';
      nameInput.style.boxShadow = '0 0 0 3px rgba(227, 112, 49, 0.1)';
    });
  }

  if (emailInput) {
    emailInput.addEventListener('blur', () => {
      const email = emailInput.value.trim();
      if (email && (!email.includes('@') || !email.includes('.'))) {
        emailInput.style.borderColor = '#ff6b6b';
        emailInput.style.boxShadow = '0 0 0 3px rgba(255, 107, 107, 0.1)';
      } else {
        emailInput.style.borderColor = '#333';
        emailInput.style.boxShadow = 'none';
      }
    });

    emailInput.addEventListener('focus', () => {
      emailInput.style.borderColor = '#E37031';
      emailInput.style.boxShadow = '0 0 0 3px rgba(227, 112, 49, 0.1)';
    });
  }

  // ─── 🔥 전화번호 입력 필드 포맷팅 ───
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/[^0-9]/g, '');
      
      if (value.length > 11) {
        value = value.slice(0, 11);
      }
      
      if (value.length > 6) {
        value = value.replace(/(\d{3})(\d{4})(\d+)/, '$1-$2-$3');
      } else if (value.length > 3) {
        value = value.replace(/(\d{3})(\d+)/, '$1-$2');
      }
      
      e.target.value = value;
    });
  }

  // ─── 🔥 Scroll 인디케이터 클릭 이벤트 ───
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      const firstSection = document.querySelector('.content-section');
      if (firstSection) {
        firstSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  }

  // ─── 🔥 디버깅용 전역 함수 (강화됨) ───
  window.debugContact = {
    testSubmit: async () => {
      console.log('🧪 Testing form submission...');
      const testData = {
        email: 'test@example.com',
        name: '김테스트',
        company: '테스트 회사',
        phone: '010-1234-5678',
        budget: '5천만원',
        message: 'This is a test message from debug function. 테스트 메시지입니다. 브랜딩 및 마케팅 캠페인에 대해 상담받고 싶습니다.',
        _subject: '[KAUZ 사이트] 디버그 테스트 문의',
        _replyto: 'test@example.com',
        _template: 'table'
      };
      
      setButtonLoading(true);
      const result = await submitFormData(testData);
      setButtonLoading(false);
      
      return result;
    },
    
    showSuccessMessage: () => {
      showResponse('테스트 성공 메시지입니다.');
    },
    
    showErrorMessage: () => {
      showResponse('테스트 에러 메시지입니다.', true);
    },
    
    resetForm: () => {
      if (contactForm) {
        contactForm.reset();
        if (messageCounter) messageCounter.textContent = '0';
        console.log('🔄 Form reset');
      }
    },
    
    getFormData: () => {
      if (!contactForm) return null;
      
      return {
        company: document.getElementById('company')?.value || '',
        name: document.getElementById('name')?.value || '',
        email: document.getElementById('email')?.value || '',
        phone: document.getElementById('phone')?.value || '',
        budget: document.getElementById('budget')?.value || '',
        message: document.getElementById('message')?.value || ''
      };
    },
    
    validateCurrentForm: () => {
      if (!contactForm) return null;
      const formData = window.debugContact.getFormData();
      return validateFormData(formData);
    },
    
    fillTestData: () => {
      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const companyInput = document.getElementById('company');
      const phoneInput = document.getElementById('phone');
      const budgetInput = document.getElementById('budget');
      const messageInput = document.getElementById('message');
      
      if (nameInput) nameInput.value = '김테스트';
      if (emailInput) emailInput.value = 'test@example.com';
      if (companyInput) companyInput.value = '테스트 회사';
      if (phoneInput) phoneInput.value = '010-1234-5678';
      if (budgetInput) budgetInput.value = '5천만원';
      if (messageInput) {
        messageInput.value = '테스트 프로젝트 문의입니다. 브랜딩 및 마케팅 캠페인에 대해 상담받고 싶습니다. 예산은 5천만원 정도를 생각하고 있으며, 6개월 내에 진행하고 싶습니다.';
        // 카운터 업데이트
        if (messageCounter) messageCounter.textContent = messageInput.value.length;
      }
      
      console.log('📝 Test data filled');
    },
    
    clearTestData: () => {
      contactForm.reset();
      if (messageCounter) messageCounter.textContent = '0';
      console.log('🧹 Test data cleared');
    },

    // 🔥 Formspree 연결 테스트
    testConnection: async () => {
      try {
        console.log('🔗 Testing Formspree connection...');
        const response = await fetch('https://formspree.io/f/mkgrljlv', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            email: 'connection-test@example.com',
            message: 'Connection test message',
            _subject: '[KAUZ] Connection Test'
          })
        });
        
        console.log('📡 Connection test response:', response.status);
        const text = await response.text();
        console.log('📡 Connection test text:', text);
        
        return { status: response.status, response: text };
      } catch (error) {
        console.error('❌ Connection test failed:', error);
        return { error: error.message };
      }
    }
  };

  console.log('✅ Contact.js initialization complete (JSON method)');
  
  // 개발 모드 정보
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🛠️ Development mode detected');
    console.log('🎯 Debug commands available:');
    console.log('  - window.debugContact.testSubmit()         // 실제 테스트 전송');
    console.log('  - window.debugContact.testConnection()     // 연결 테스트');
    console.log('  - window.debugContact.fillTestData()       // 테스트 데이터 채우기');
    console.log('  - window.debugContact.validateCurrentForm() // 현재 폼 검증');
    console.log('  - window.debugContact.getFormData()        // 현재 폼 데이터');
    console.log('  - window.debugContact.resetForm()          // 폼 초기화');
  }
});
