export class Navigation {
    constructor(onPageChange) {
        this.onPageChange = onPageChange;
        this.currentPage = 'feed';
        this.pages = {
            feed: document.getElementById('feed-page'),
            'add-pet': document.getElementById('add-pet-page'),
            chats: document.getElementById('chats-page'),
            profile: document.getElementById('profile-page')
        };
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.renderChatsPage();
    }
    
    bindEvents() {
        const navBtns = document.querySelectorAll('.nav-btn');
        
        navBtns.forEach(btn => {
            // Удаляем старые обработчики
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
        });
        
        // Добавляем новые
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const pageName = btn.dataset.page;
                this.switchPage(pageName);
            });
        });
    }
    
    switchPage(pageName) {
        if (!pageName) return;
        
        this.currentPage = pageName;
        
        // Обновляем кнопки
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.page === pageName);
        });
        
        // Скрываем все страницы
        Object.values(this.pages).forEach(page => {
            if (page) page.classList.remove('active');
        });
        
        // Показываем выбранную
        const activePage = this.pages[pageName];
        if (activePage) {
            activePage.classList.add('active');
        }
        
        // Вызываем колбэк
        if (this.onPageChange) {
            this.onPageChange(pageName);
        }
    }
    
    renderChatsPage() {
        const chatsPage = this.pages.chats;
        if (!chatsPage) return;
        
        chatsPage.innerHTML = `
            <div class="page-header">
                <h2>Сообщения</h2>
            </div>
            <div class="chats-list">
                <div class="chat-placeholder">
                    <p>💬 Пока нет активных чатов</p>
                    <p class="chat-hint">Свайпайте питомцев, чтобы начать общение</p>
                </div>
            </div>
        `;
    }
}