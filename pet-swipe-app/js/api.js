const API_BASE_URL = 'http://localhost:8080';

async function apiRequest(endpoint, method = 'GET', body = null) {
    const headers = {
        'Content-Type': 'application/json',
    };
    
    const userId = sessionStorage.getItem('user_id');
    console.log('X-User-ID:', userId);
    
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
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Auth API
export const authAPI = {
    auth: (email, password, role = 'user') => 
        apiRequest('/auth/login', 'POST', { 
            email: email,
            password: password,
            role: role
        }),
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
    getUserPets: (userId) => apiRequest(`/users/${userId}/pets`),
};

// Swipes API
export const swipesAPI = {
    swipe: (petId, isLike) => apiRequest('/swipes', 'POST', { pet_id: petId, is_like: isLike }),
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

export { apiRequest };