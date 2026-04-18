// Управление состоянием аутентификации (sessionStorage)
export class AuthManager {
    static isAuthenticated() {
        return !!sessionStorage.getItem('user_id');
    }
    
    static getUserId() {
        return sessionStorage.getItem('user_id');
    }
    
    static setUser(userData) {
        sessionStorage.setItem('user_id', userData.user_id);
        
        if (userData.user) {
            sessionStorage.setItem('user_login', userData.user.login || userData.user.email || '');
            sessionStorage.setItem('user_role', userData.user.role || 'user');
            sessionStorage.setItem('user_profile', JSON.stringify(userData.user));
        }
    }
    
    static logout() {
        sessionStorage.clear();
    }
    
    static getUserLogin() {
        return sessionStorage.getItem('user_login');
    }
    
    static getUserRole() {
        return sessionStorage.getItem('user_role');
    }
    
    static getUserProfile() {
        const profile = sessionStorage.getItem('user_profile');
        return profile ? JSON.parse(profile) : null;
    }
}