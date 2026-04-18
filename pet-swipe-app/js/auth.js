export class AuthManager {
    static isAuthenticated() {
        return !!localStorage.getItem('user_id');
    }
    
    static getUserId() {
        return localStorage.getItem('user_id');
    }
    
    static setUser(userData) {
        localStorage.setItem('user_id', userData.user_id || userData.id);
        localStorage.setItem('user_email', userData.user?.email || userData.email);
        localStorage.setItem('user_display_name', userData.user?.display_name || userData.display_name);
        localStorage.setItem('user_role', userData.user?.role || userData.role);
        
        // Сохраняем весь профиль для удобства
        if (userData.user) {
            localStorage.setItem('user_profile', JSON.stringify(userData.user));
        }
    }
    
    static logout() {
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_display_name');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_profile');
    }
    
    static getUserEmail() {
        return localStorage.getItem('user_email');
    }
    
    static getUserProfile() {
        const profile = localStorage.getItem('user_profile');
        return profile ? JSON.parse(profile) : null;
    }
}