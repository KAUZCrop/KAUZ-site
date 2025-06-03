document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const formResponse = document.getElementById('formResponse');

  form.addEventListener('submit', (e) => {
    e.preventDefault(); // 기본 제출(페이지 리로드) 방지

    // 입력 값 가져오기
    const name = form.querySelector('#name').value.trim();
    const email = form.querySelector('#email').value.trim();
    const company = form.querySelector('#company').value.trim();
    const budget = form.querySelector('#budget').value;
    const message = form.querySelector('#message').value.trim();

    // 간단 유효성 검사 (추가로 더 세부적으로 구현 가능)
    if (name === '' || email === '' || message === '') {
      formResponse.textContent = '필수 항목(이름, 이메일, 메시지)을 모두 입력해주세요.';
      formResponse.style.visibility = 'visible';
      return;
    }

    // 실제로는 여기에 AJAX 요청(예: Formspree, 구글 시트 연동 등)을 넣을 수 있지만,
    // 지금은 예시로 “전송 성공” 메시지만 표시하도록 구현합니다.
    formResponse.textContent = '메시지가 성공적으로 전송되었습니다! 곧 연락드리겠습니다.';
    formResponse.style.visibility = 'visible';

    // 폼 초기화
    form.reset();

    // 일정 시간 후 응답 메시지 숨기기
    setTimeout(() => {
      formResponse.style.visibility = 'hidden';
    }, 5000);
  });

  document
  .getElementById('contactForm')
  .addEventListener('submit', (e) => {
    e.preventDefault();
    // ... AJAX 로직 혹은 다른 처리가 있다면 여기서 중단됨
  });

});
