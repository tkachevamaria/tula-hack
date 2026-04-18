const API_BASE_URL = 'http://localhost:8080';

async function apiRequest(endpoint, method = 'GET', body = null) {
    const headers = {
        'Content-Type': 'application/json',
    };
    
    const userId = localStorage.getItem('user_id');
    if (userId) {
        headers['X-User-ID'] = userId;
    }
    
    const config = {
        method,
        headers,
    };
    
    if (body) {
        config.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        // Пытаемся распарсить JSON
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }
        
        if (!response.ok) {
            throw new Error(data.error || data || 'Request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Auth API — обновлён под новую структуру ответа
export const authAPI = {
    register: (email, password, displayName = '', role = 'user') => 
        apiRequest('/auth/register', 'POST', { 
            email, 
            password, 
            display_name: displayName, 
            role 
        }),
    
    login: (email, password) => 
        apiRequest('/auth/login', 'POST', { email, password }),
};

// Account API
export const accountAPI = {
    getMe: () => apiRequest('/me'),
    updateMe: (data) => apiRequest('/me', 'PUT', data),
};

// Pets API
export const petsAPI = {
    getFeed: () => apiRequest('/pets/feed'),
    getPet: (id) => apiRequest(`/pets/${id}`),
    createPet: (data) => apiRequest('/pets', 'POST', data),
    getMyPets: () => apiRequest('/my-pets'),
    getUserPets: (userId) => apiRequest(`/users/${userId}/pets`), // новый эндпоинт
};

// Swipes API
export const swipesAPI = {
    swipe: (petId, isLike) => apiRequest('/swipes', 'POST', { pet_id: petId, is_like: isLike }),
    ownerSwipe: (userId, petId, isLike) => apiRequest('/owner-swipes', 'POST', { 
        user_id: userId, 
        pet_id: petId, 
        is_like: isLike 
    }),
};

// Matches API
export const matchesAPI = {
    getMatches: () => apiRequest('/matches'),
};

// Messages API
export const messagesAPI = {
    getMessages: (matchId) => apiRequest(`/matches/${matchId}/messages`),
    sendMessage: (data) => apiRequest('/messages', 'POST', data),
};

// Preferences API
export const preferencesAPI = {
    get: () => apiRequest('/preferences'),
    set: (data) => apiRequest('/preferences', 'POST', data),
};