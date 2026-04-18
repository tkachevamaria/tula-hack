import { authAPI, accountAPI, petsAPI, apiRequest } from './api.js';
import { AuthManager } from './auth.js';

class App {
    constructor() {
        this.currentScreen = 'welcome';
        this.currentPage = 'main';
        this.currentRole = 'user';
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
        
        this.roleUserBtn = document.getElementById('role-user');
        this.roleOrgBtn = document.getElementById('role-org');
        this.loginInput = document.getElementById('login');
        this.loginLabel = document.getElementById('login-label');
        this.passwordInput = document.getElementById('password');
        
        this.navBtns = document.querySelectorAll('.nav-btn');
        this.pages = {
            main: document.getElementById('main-page'),
            swipe: document.getElementById('swipe-page'),
            chats: document.getElementById('chats-page'),
            profile: document.getElementById('profile-page')
        };
        
        this.authError = document.getElementById('auth-error');
        this.profileLogin = document.getElementById('profile-email');
        this.profileId = document.getElementById('profile-id');
    }
    
    bindEvents() {
        if (this.startBtn) {
            this.startBtn.addEventListener('click', () => this.showScreen('auth'));
        }
        
        if (this.backToWelcome) {
            this.backToWelcome.addEventListener('click', () => this.showScreen('welcome'));
        }
        
        if (this.authForm) {
            this.authForm.addEventListener('submit', (e) => this.handleAuth(e));
        }
        
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', () => this.handleLogout());
        }
        
        if (this.roleUserBtn) {
            this.roleUserBtn.addEventListener('click', () => this.switchRole('user'));
        }
        
        if (this.roleOrgBtn) {
            this.roleOrgBtn.addEventListener('click', () => this.switchRole('shelter'));
        }
        
        this.navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchPage(btn.dataset.page);
            });
        });
        
        if (this.filterBtn) {
            this.filterBtn.addEventListener('click', () => {
                alert('Фильтры будут здесь (в разработке)');
            });
        }
    }
    
    switchRole(role) {
        this.currentRole = role;
        
        if (this.roleUserBtn) {
            this.roleUserBtn.classList.toggle('active', role === 'user');
        }
        if (this.roleOrgBtn) {
            this.roleOrgBtn.classList.toggle('active', role === 'shelter');
        }
        
        if (role === 'user') {
            if (this.loginLabel) this.loginLabel.textContent = 'Логин';
            if (this.loginInput) this.loginInput.placeholder = 'Введите логин';
        } else {
            if (this.loginLabel) this.loginLabel.textContent = 'Название организации';
            if (this.loginInput) this.loginInput.placeholder = 'Введите название организации';
        }
    }
    
    checkAuth() {
        if (AuthManager.isAuthenticated()) {
            this.showScreen('app');
            this.updateProfileInfo();
        } else {
            this.showScreen('welcome');
        }
    }
    
    showScreen(screenName) {
        if (this.welcomeScreen) this.welcomeScreen.classList.remove('active');
        if (this.authScreen) this.authScreen.classList.remove('active');
        if (this.appScreen) this.appScreen.classList.remove('active');
        
        switch(screenName) {
            case 'welcome':
                if (this.welcomeScreen) this.welcomeScreen.classList.add('active');
                break;
            case 'auth':
                if (this.authScreen) this.authScreen.classList.add('active');
                this.switchRole('user');
                break;
            case 'app':
                if (this.appScreen) this.appScreen.classList.add('active');
                break;
        }
        
        this.currentScreen = screenName;
    }
    
    switchPage(pageName) {
        this.navBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.page === pageName);
        });
        
        Object.values(this.pages).forEach(page => {
            if (page) page.classList.remove('active');
        });
        
        if (this.pages[pageName]) {
            this.pages[pageName].classList.add('active');
        }
        
        this.currentPage = pageName;
        this.loadPageData(pageName);
    }
    
    async handleAuth(e) {
        e.preventDefault();
        
        const login = this.loginInput?.value.trim() || '';
        const password = this.passwordInput?.value.trim() || '';
        
        if (!login || !password) {
            if (this.authError) this.authError.textContent = 'Заполните все поля';
            return;
        }
        
        if (this.authError) this.authError.textContent = '';
        const submitBtn = this.authForm?.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Загрузка...';
        }
        
        try {
            let response;
            
            // Пробуем залогиниться — отправляем login как email (подстройка под бэк)
            try {
                response = await authAPI.auth(login, password, this.currentRole);
                console.log('Login success:', response);
            } catch (loginError) {
                console.log('Login failed, trying register:', loginError);
                
                // Регистрация — отправляем login как email и display_name
                response = await apiRequest('/auth/register', 'POST', {
                    email: login,
                    password: password,
                    display_name: login,
                    role: this.currentRole
                });
                console.log('Register success:', response);
            }
            
            AuthManager.setUser(response);
            
            this.showScreen('app');
            this.switchPage('main');
            await this.loadUserProfile();
            
            if (this.authForm) this.authForm.reset();
            
        } catch (error) {
            console.error('Auth error:', error);
            if (this.authError) {
                this.authError.textContent = `Ошибка: ${error.message || 'Неверный логин или пароль'}`;
            }
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Продолжить';
            }
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
            AuthManager.setUser({ user_id: profile.id, user: profile });
            this.updateProfileInfo();
        } catch (error) {
            console.error('Failed to load profile:', error);
            this.updateProfileInfo();
        }
    }
    
    updateProfileInfo() {
        const profile = AuthManager.getUserProfile();
        
        if (this.profileLogin) {
            this.profileLogin.textContent = profile?.email || profile?.login || AuthManager.getUserLogin() || '—';
        }
        if (this.profileId) {
            this.profileId.textContent = AuthManager.getUserId() || '—';
        }
    }
    
    async loadPageData(pageName) {
        switch(pageName) {
            case 'main':
                await this.loadFeed();
                break;
            case 'profile':
                await this.loadUserProfile();
                break;
        }
    }
    
    async loadFeed() {
        try {
            const feed = await petsAPI.getFeed();
            console.log('Feed loaded:', feed);
            if (feed.pets?.length) {
                this.renderPetsFeed(feed.pets);
            }
        } catch (error) {
            console.log('Using mock feed');
        }
    }
    
    renderPetsFeed(pets) {
        const container = document.getElementById('pets-feed');
        if (!container) return;
        
        container.innerHTML = pets.map(pet => `
            <div class="pet-card" data-pet-id="${pet.id}">
                <div class="pet-image-placeholder">${pet.type === 'dog' ? '🐕' : '🐈'}</div>
                <div class="pet-info">
                    <h3>${pet.name}</h3>
                    <p>${pet.breed || pet.type}, ${pet.age} ${this.getAgeSuffix(pet.age)}</p>
                </div>
            </div>
        `).join('');
    }
    
    getAgeSuffix(age) {
        if (age === 1) return 'год';
        if (age >= 2 && age <= 4) return 'года';
        return 'лет';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});