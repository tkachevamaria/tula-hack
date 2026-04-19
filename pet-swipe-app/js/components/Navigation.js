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
            btn.addEventListener('click', () => {
                const pageName = btn.dataset.page;
                this.switchPage(pageName);
            });
        });
    }
    
    switchPage(pageName) {
        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.page === pageName);
        });
        
        // Hide all pages
        Object.values(this.pages).forEach(page => {
            if (page) page.classList.remove('active');
        });
        
        // Show selected page
        if (this.pages[pageName]) {
            this.pages[pageName].classList.add('active');
        }
        
        this.currentPage = pageName;
        
        if (this.onPageChange) {
            this.onPageChange(pageName);
        }
    }
    
    renderChatsPage() {
        const chatsPage = document.getElementById('chats-page');
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