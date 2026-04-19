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
        this.createNavigation();
    }
    
    createPages() {
        this.pages.feed = new FeedPage();
        this.pages.profile = new ProfilePage();
        this.pages.addPet = new AddPetPage();
    }
    
    createNavigation() {
        this.navigation = new Navigation((pageName) => this.onPageChange(pageName));
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
                // Переключаем на ленту через навигацию
                if (this.navigation) {
                    this.navigation.switchPage('feed');
                }
                break;
        }
        
        this.currentScreen = screenName;
    }
    
    onPageChange(pageName) {
        this.currentPage = pageName;
        
        // Загружаем данные профиля при переходе на него
        if (pageName === 'profile' && this.pages.profile) {
            this.pages.profile.load();
        }
    }
    
    onAuthSuccess() {
        // Очищаем контейнеры страниц перед пересозданием
        ['feed-page', 'add-pet-page', 'profile-page'].forEach(id => {
            const page = document.getElementById(id);
            if (page) page.innerHTML = '';
        });
        
        // Пересоздаём страницы
        this.createPages();
        
        // Обновляем callback
        this.setupGlobalCallbacks();
        
        // Показываем приложение
        this.showScreen('app');
        
        // Принудительно переключаем на ленту
        if (this.navigation) {
            this.navigation.switchPage('feed');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});