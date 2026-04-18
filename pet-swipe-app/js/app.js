document.addEventListener('DOMContentLoaded', () => {
  
  // Навигация
  const startBtn = document.getElementById('startBtn');
  const landing = document.getElementById('landing');
  const auth = document.getElementById('auth');

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      landing.classList.remove('active');
      auth.classList.add('active');
    });
  }

  // Логика табов (Регистрация / Вход)
  const tabReg = document.getElementById('tabReg');
  const tabLogin = document.getElementById('tabLogin');
  const submitBtn = document.getElementById('submitBtn');

  function setTab(activeTab, inactiveTab, btnText) {
    activeTab.classList.add('active');
    inactiveTab.classList.remove('active');
    submitBtn.textContent = btnText;
  }

  tabReg.addEventListener('click', () => setTab(tabReg, tabLogin, 'Зарегистрироваться'));
  tabLogin.addEventListener('click', () => setTab(tabLogin, tabReg, 'Войти'));

  // Логика переключателя (Человек / Организация)
  const roleToggle = document.getElementById('roleToggle');
  const labelPerson = document.getElementById('labelPerson');
  const labelOrg = document.getElementById('labelOrg');

  roleToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
      labelPerson.classList.remove('active');
      labelOrg.classList.add('active');
    } else {
      labelOrg.classList.remove('active');
      labelPerson.classList.add('active');
    }
  });
});