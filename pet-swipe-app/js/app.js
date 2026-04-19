import { AuthManager } from './auth.js';
import { AuthPage } from './pages/AuthPage.js';
import { FeedPage } from './pages/FeedPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { AddPetPage } from './pages/AddPetPage.js';
import { Navigation } from './components/Navigation.js';

class App {
    constructor() {
        this.currentScreen = 'welcome';
        this.currentPage = 'feed';
        this.pages = {};
        this.init();
    }
    
    init() {
        this.bindElements();
        this.bindEvents();
        this.initPages();
        this.setupGlobalCallbacks();
        this.checkAuth();
    }
    
    bindElements() {
        this.welcomeScreen = document.getElementById('welcome-screen');
        this.authScreen = document.getElementById('auth-screen');
        this.appScreen = document.getElementById('app-screen');
        this.startBtn = document.getElementById('start-btn');
    }
    
    bindEvents() {
        if (this.startBtn) {
            this.startBtn.addEventListener('click', () => this.showScreen('auth'));
        }
    }
    
    initPages() {
        this.createPages();
        this.authPage = new AuthPage(() => this.onAuthSuccess());
        this.navigation = new Navigation((pageName) => this.switchPage(pageName));
    }
    
    createPages() {
        this.pages.feed = new FeedPage();
        this.pages.profile = new ProfilePage();
        this.pages.addPet = new AddPetPage();
    }

    setupGlobalCallbacks() {
        window.updatePetsCallback = () => {
            if (this.pages.profile) {
                return this.pages.profile.loadMyPets();
            }
            return Promise.resolve();
        };
    }

    checkAuth() {
        if (AuthManager.isAuthenticated()) {
            this.showScreen('app');
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
                break;
            case 'app':
                if (this.appScreen) this.appScreen.classList.add('active');
                // ВСЕГДА переходим на ленту при открытии приложения
                this.switchPage('feed');
                break;
        }
        
        this.currentScreen = screenName;
    }
    
    switchPage(pageName) {
        this.currentPage = pageName;
        
        // Обновляем активную кнопку в навигации
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.page === pageName);
        });
        
        // Если перешли на профиль — загружаем данные
        if (pageName === 'profile' && this.pages.profile) {
            this.pages.profile.load();
        }
    }
    
    onAuthSuccess() {
        // Пересоздаём страницы, чтобы сбросить кэш старых данных
        this.createPages();
        this.setupGlobalCallbacks();
        this.showScreen('app');
        // Принудительно переходим на ленту
        this.switchPage('feed');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});