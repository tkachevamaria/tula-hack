import { authAPI, accountAPI } from './api.js';
import { AuthManager } from './auth.js';

class App {
    constructor() {
        this.currentScreen = 'welcome';
        this.currentPage = 'main';
        this.init();
    }
    
    init() {
        this.bindElements();
        this.bindEvents();
        this.checkAuth();
    }
    
    bindElements() {
        this.welcomeScreen = document.getElementById('welcome-screen');
        this.authScreen = document.getElementById('auth-screen');
        this.appScreen = document.getElementById('app-screen');
        
        this.startBtn = document.getElementById('start-btn');
        this.backToWelcome = document.getElementById('back-to-welcome');
        this.authForm = document.getElementById('auth-form');
        this.logoutBtn = document.getElementById('logout-btn');
        this.filterBtn = document.getElementById('filter-btn');
        
        this.navBtns = document.querySelectorAll('.nav-btn');
        this.pages = {
            main: document.getElementById('main-page'),
            swipe: document.getElementById('swipe-page'),
            chats: document.getElementById('chats-page'),
            profile: document.getElementById('profile-page')
        };
        
        this.authError = document.getElementById('auth-error');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        
        this.profileEmail = document.getElementById('profile-email');
        this.profileId = document.getElementById('profile-id');
    }
    
    bindEvents() {
        // Welcome screen
        this.startBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Start button clicked'); // для отладки
            this.showScreen('auth');
        });
        
        this.backToWelcome.addEventListener('click', () => this.showScreen('welcome'));
        
        // Auth form
        this.authForm.addEventListener('submit', (e) => this.handleAuth(e));
        
        // Navigation
        this.navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const page = btn.dataset.page;
                this.switchPage(page);
            });
        });
        
        // Logout
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', () => this.handleLogout());
        }
        
        // Filter
        if (this.filterBtn) {
            this.filterBtn.addEventListener('click', () => {
                alert('Фильтры будут здесь (в разработке)');
            });
        }
    }
    
    checkAuth() {
        if (AuthManager.isAuthenticated()) {
            this.showScreen('app');
            this.updateProfileInfo();
            this.loadUserProfile(); // загружаем свежие данные с бэка
        } else {
            this.showScreen('welcome');
        }
    }
    
    showScreen(screenName) {
        this.welcomeScreen.classList.remove('active');
        this.authScreen.classList.remove('active');
        this.appScreen.classList.remove('active');
        
        switch(screenName) {
            case 'welcome':
                this.welcomeScreen.classList.add('active');
                break;
            case 'auth':
                this.authScreen.classList.add('active');
                break;
            case 'app':
                this.appScreen.classList.add('active');
                break;
        }
        
        this.currentScreen = screenName;
    }
    
    switchPage(pageName) {
        this.navBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.page === pageName);
        });
        
        Object.values(this.pages).forEach(page => {
            page.classList.remove('active');
        });
        
        this.pages[pageName].classList.add('active');
        this.currentPage = pageName;
        
        this.loadPageData(pageName);
    }
    
    async loadPageData(pageName) {
        switch(pageName) {
            case 'main':
                await this.loadFeed();
                break;
            case 'profile':
                await this.loadUserProfile();
                break;
            case 'swipe':
                await this.loadSwipeCards();
                break;
            case 'chats':
                await this.loadChats();
                break;
        }
    }
    
    async handleAuth(e) {
        e.preventDefault();
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value.trim();
        
        if (!email || !password) {
            this.authError.textContent = 'Заполните все поля';
            return;
        }
        
        this.authError.textContent = '';
        const submitBtn = this.authForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Загрузка...';
        
        try {
            // Пробуем залогиниться
            let response;
            try {
                response = await authAPI.login(email, password);
                console.log('Login success:', response);
            } catch (loginError) {
                console.log('Login failed, trying register:', loginError);
                // Если не получилось — регистрируем
                const displayName = email.split('@')[0]; // временное имя из email
                response = await authAPI.register(email, password, displayName);
                console.log('Register success:', response);
            }
            
            // Сохраняем данные
            AuthManager.setUser(response);
            
            this.showScreen('app');
            this.switchPage('main');
            await this.loadUserProfile();
            
            this.authForm.reset();
            
        } catch (error) {
            console.error('Auth error:', error);
            this.authError.textContent = `Ошибка: ${error.message}`;
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Продолжить';
        }
    }
    
    handleLogout() {
        AuthManager.logout();
        this.showScreen('welcome');
    }
    
    async loadUserProfile() {
        try {
            const profile = await accountAPI.getMe();
            console.log('Profile loaded:', profile);
            
            // Обновляем localStorage актуальными данными
            AuthManager.setUser({
                user_id: profile.id,
                user: profile
            });
            
            this.updateProfileInfo();
        } catch (error) {
            console.error('Failed to load profile:', error);
            // Используем данные из localStorage
            this.updateProfileInfo();
        }
    }
    
    updateProfileInfo() {
        const profile = AuthManager.getUserProfile();
        
        if (this.profileEmail) {
            this.profileEmail.textContent = profile?.email || AuthManager.getUserEmail() || '—';
        }
        if (this.profileId) {
            this.profileId.textContent = AuthManager.getUserId() || '—';
        }
        
        // Можно добавить отображение display_name
        const profileName = document.getElementById('profile-name');
        if (profileName) {
            profileName.textContent = profile?.display_name || 'Пользователь';
        }
    }
    
    async loadFeed() {
        try {
            const feed = await import('./api.js').then(api => api.petsAPI.getFeed());
            console.log('Feed loaded:', feed);
            
            if (feed.pets && feed.pets.length > 0) {
                this.renderPetsFeed(feed.pets);
            }
        } catch (error) {
            console.log('Using mock feed data');
            // Оставляем заглушки из HTML
        }
    }
    
    renderPetsFeed(pets) {
        const feedContainer = document.getElementById('pets-feed');
        if (!feedContainer) return;
        
        feedContainer.innerHTML = pets.map(pet => `
            <div class="pet-card" data-pet-id="${pet.id}">
                <div class="pet-image-placeholder">${pet.type === 'dog' ? '🐕' : '🐈'}</div>
                <div class="pet-info">
                    <h3>${pet.name}</h3>
                    <p>${pet.breed || pet.type}, ${pet.age} ${this.getAgeSuffix(pet.age)}</p>
                </div>
            </div>
        `).join('');
        
        // Добавляем обработчики клика
        feedContainer.querySelectorAll('.pet-card').forEach(card => {
            card.addEventListener('click', () => {
                const petId = card.dataset.petId;
                alert(`Питомец ID: ${petId}\n(Детальная страница в разработке)`);
            });
        });
    }
    
    getAgeSuffix(age) {
        if (age === 1) return 'год';
        if (age >= 2 && age <= 4) return 'года';
        return 'лет';
    }
    
    async loadSwipeCards() {
        try {
            const feed = await import('./api.js').then(api => api.petsAPI.getFeed());
            console.log('Swipe cards loaded:', feed);
            // Здесь будет логика отображения карточек для свайпов
        } catch (error) {
            console.log('Using mock swipe data');
        }
    }
    
    async loadChats() {
        try {
            const matches = await import('./api.js').then(api => api.matchesAPI.getMatches());
            console.log('Matches loaded:', matches);
            // Здесь будет логика отображения чатов
        } catch (error) {
            console.log('Using mock chats data');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});