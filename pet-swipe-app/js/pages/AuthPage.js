import { authAPI, apiRequest } from '../api.js';
import { AuthManager } from '../auth.js';

export class AuthPage {
    constructor(onSuccess) {
        this.onSuccess = onSuccess;
        this.currentRole = 'user';
        this.init();
    }
    
    init() {
        this.bindElements();
        this.bindEvents();
    }
    
    bindElements() {
        this.backBtn = document.getElementById('back-to-welcome');
        this.authForm = document.getElementById('auth-form');
        this.roleUserBtn = document.getElementById('role-user');
        this.roleOrgBtn = document.getElementById('role-org');
        this.loginInput = document.getElementById('login');
        this.loginLabel = document.getElementById('login-label');
        this.passwordInput = document.getElementById('password');
        this.authError = document.getElementById('auth-error');
    }
    
    bindEvents() {
        if (this.backBtn) {
            this.backBtn.addEventListener('click', () => this.goBack());
        }
        
        if (this.authForm) {
            this.authForm.addEventListener('submit', (e) => this.handleSubmit(e));
        }
        
        if (this.roleUserBtn) {
            this.roleUserBtn.addEventListener('click', () => this.switchRole('user'));
        }
        
        if (this.roleOrgBtn) {
            this.roleOrgBtn.addEventListener('click', () => this.switchRole('shelter'));
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
    
    goBack() {
        document.getElementById('auth-screen').classList.remove('active');
        document.getElementById('welcome-screen').classList.add('active');
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const login = this.loginInput?.value.trim() || '';
        const password = this.passwordInput?.value.trim() || '';
        
        if (!login || !password) {
            this.showError('Заполните все поля');
            return;
        }
        
        this.clearError();
        const submitBtn = this.authForm?.querySelector('button[type="submit"]');
        this.setLoading(submitBtn, true);
        
        try {
            let response;
            
            try {
                response = await authAPI.auth(login, password, this.currentRole);
            } catch (loginError) {
                response = await apiRequest('/auth/register', 'POST', {
                    email: login,
                    password: password,
                    display_name: login,
                    role: this.currentRole
                });
            }
            
            AuthManager.setUser(response);

            console.log('Вошли как:', AuthManager.getUserId());
            
            if (this.authForm) this.authForm.reset();
            this.switchRole('user');
            
            this.onSuccess();
            
        } catch (error) {
            this.showError(error.message || 'Ошибка авторизации');
        } finally {
            this.setLoading(submitBtn, false);
        }
    }
    
    showError(message) {
        if (this.authError) {
            this.authError.textContent = message;
        }
    }
    
    clearError() {
        if (this.authError) {
            this.authError.textContent = '';
        }
    }
    
    setLoading(btn, isLoading) {
        if (btn) {
            btn.disabled = isLoading;
            btn.textContent = isLoading ? 'Загрузка...' : 'Продолжить';
        }
    }
}