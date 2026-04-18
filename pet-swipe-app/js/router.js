// Навигация между секциями
function navigateTo(sectionId) {
  const target = document.getElementById(sectionId);
  if (!target) {
    console.error(`Section ${sectionId} not found`);
    return;
  }

  // Плавная прокрутка
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  
  // Добавляем класс active для анимации
  setTimeout(() => {
    target.classList.add('active');
  }, 300);

  // Убираем active у других секций (опционально)
  document.querySelectorAll('.section').forEach(section => {
    if (section.id !== sectionId) {
      // section.classList.remove('active'); // раскомментируй, если хочешь скрывать другие секции
    }
  });
}

// Обработчик кнопки "Начать"
document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      navigateTo('auth-section');
    });
  }

  // Проверяем, авторизован ли пользователь
  const userId = localStorage.getItem('user_id');
  if (userId) {
    // Можно сразу перенаправить на свайпы
    // navigateTo('swipe-section');
  }
});