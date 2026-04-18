// Управление состоянием аутентификации
export class AuthManager {
    static isAuthenticated() {
        return !!localStorage.getItem('user_id');
    }
    
    static getUserId() {
        return localStorage.getItem('user_id');
    }
    
    static setUser(userId, email) {
        localStorage.setItem('user_id', userId);
        localStorage.setItem('user_email', email);
    }
    
    static logout() {
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_email');
    }
    
    static getUserEmail() {
        return localStorage.getItem('user_email');
    }
}