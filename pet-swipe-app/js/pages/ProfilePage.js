import { AuthManager } from '../auth.js';
import { accountAPI } from '../api.js';

export class ProfilePage {
    constructor() {
        this.container = document.getElementById('profile-page');
        this.myPets = [];
        this.render();
    }
    
    render() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="page-header">
                <h2>Профиль</h2>
                <button id="logout-btn" class="btn-icon">🚪</button>
            </div>
            
            <div class="profile-container">
                <div class="profile-card">
                    <div class="profile-avatar">
                        <span>👤</span>
                    </div>
                    <div class="profile-info">
                        <div class="profile-field">
                            <label>Имя</label>
                            <span id="profile-name">Загрузка...</span>
                        </div>
                        <div class="profile-field">
                            <label>Email</label>
                            <span id="profile-email">—</span>
                        </div>
                        <div class="profile-field">
                            <label>Роль</label>
                            <span id="profile-role">—</span>
                        </div>
                        <div class="profile-field">
                            <label>О себе</label>
                            <span id="profile-bio">—</span>
                        </div>
                        <div class="profile-field">
                            <label>Город</label>
                            <span id="profile-location">—</span>
                        </div>
                    </div>
                    <button id="edit-profile-btn" class="btn-secondary">Редактировать</button>
                </div>
                
                <div class="my-pets-section">
                    <div class="section-header">
                        <h3>Мои питомцы</h3>
                        <button id="add-pet-btn" class="btn-primary">➕ Добавить</button>
                    </div>
                    <div id="my-pets-list" class="my-pets-list">
                        <p class="loading-text">Загрузка питомцев...</p>
                    </div>
                </div>
            </div>
        `;
        
        this.bindEvents();
        this.loadProfile();
        this.loadMyPets();
    }
    
    bindEvents() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
        
        const editBtn = document.getElementById('edit-profile-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.showEditProfileModal());
        }
        
        const addPetBtn = document.getElementById('add-pet-btn');
        if (addPetBtn) {
            addPetBtn.addEventListener('click', () => {
                // Переключение на страницу добавления питомца
                document.querySelector('[data-page="add-pet"]')?.click();
            });
        }
    }
    
    async loadProfile() {
        const userId = AuthManager.getUserId();
        if (!userId) return;
        
        try {
            const user = await accountAPI.getMe();
            this.updateProfileUI(user);
        } catch (error) {
            console.error('Failed to load profile:', error);
        }
    }
    
    updateProfileUI(user) {
        const nameEl = document.getElementById('profile-name');
        const emailEl = document.getElementById('profile-email');
        const roleEl = document.getElementById('profile-role');
        const bioEl = document.getElementById('profile-bio');
        const locationEl = document.getElementById('profile-location');
        
        if (nameEl) nameEl.textContent = user.display_name || 'Не указано';
        if (emailEl) emailEl.textContent = user.email || '—';
        if (roleEl) roleEl.textContent = user.role === 'shelter' ? 'Приют' : 'Пользователь';
        if (bioEl) bioEl.textContent = user.bio || '—';
        if (locationEl) locationEl.textContent = user.location || '—';
    }
    
    async loadMyPets() {
        const userId = AuthManager.getUserId();
        if (!userId) return;
        
        try {
            const response = await fetch('http://localhost:8080/my-pets', {
                headers: { 'X-User-ID': userId }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load my pets');
            }
            
            const pets = await response.json();
            
            // Для каждого питомца получаем фото через отдельный запрос
            const petsWithPhotos = await Promise.all(pets.map(async (pet) => {
                try {
                    const photoResp = await fetch(`http://localhost:8080/pets/${pet.ID || pet.id}`, {
                        headers: { 'X-User-ID': userId }
                    });
                    if (photoResp.ok) {
                        const data = await photoResp.json();
                        return {
                            ...pet,
                            photos: data.photos || []
                        };
                    }
                } catch (e) {
                    console.warn('Failed to fetch photos for pet', pet.ID, e);
                }
                return { ...pet, photos: [] };
            }));
            
            this.myPets = petsWithPhotos;
            this.renderMyPets();
        } catch (error) {
            console.error('Failed to load my pets:', error);
            const listEl = document.getElementById('my-pets-list');
            if (listEl) listEl.innerHTML = '<p class="error-text">Не удалось загрузить питомцев</p>';
        }
    }
    
    renderMyPets() {
        const listEl = document.getElementById('my-pets-list');
        if (!listEl) return;
        
        if (this.myPets.length === 0) {
            listEl.innerHTML = '<p class="empty-text">У вас пока нет питомцев</p>';
            return;
        }
        
        const html = this.myPets.map(pet => {
            const petId = pet.ID || pet.id;
            const petName = pet.Name || pet.name || 'Без имени';
            const petType = pet.Type || pet.type;
            const petBreed = pet.Breed || pet.breed || '';
            const petAge = pet.Age || pet.age;
            const photos = pet.photos || [];
            
            let photoHtml = '';
            if (photos.length > 0) {
                photoHtml = `<img src="${photos[0]}" alt="${petName}" style="width:100%; height:100%; object-fit:cover;">`;
            } else {
                photoHtml = petType === 'dog' ? '🐕' : petType === 'cat' ? '🐈' : '🐾';
            }
            
            return `
                <div class="pet-card" data-pet-id="${petId}">
                    <div class="pet-card-photo">
                        ${photoHtml}
                    </div>
                    <div class="pet-card-info">
                        <h4>${petName}</h4>
                        <p>${petBreed} ${petAge ? '• ' + petAge + ' ' + this.getAgeSuffix(petAge) : ''}</p>
                    </div>
                    <div class="pet-card-actions">
                        <button class="btn-icon edit-pet" data-id="${petId}">✏️</button>
                        <button class="btn-icon delete-pet" data-id="${petId}">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
        
        listEl.innerHTML = html;
        
        // Привязываем события для кнопок редактирования/удаления
        listEl.querySelectorAll('.edit-pet').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const petId = e.currentTarget.dataset.id;
                this.editPet(petId);
            });
        });
        
        listEl.querySelectorAll('.delete-pet').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const petId = e.currentTarget.dataset.id;
                this.deletePet(petId);
            });
        });
    }
    
    getAgeSuffix(age) {
        if (age === 1) return 'год';
        if (age >= 2 && age <= 4) return 'года';
        return 'лет';
    }
    
    editPet(petId) {
        // TODO: реализовать редактирование питомца
        console.log('Edit pet', petId);
    }
    
    async deletePet(petId) {
        if (!confirm('Удалить питомца?')) return;
        
        try {
            const userId = AuthManager.getUserId();
            const response = await fetch(`http://localhost:8080/pets/${petId}`, {
                method: 'DELETE',
                headers: { 'X-User-ID': userId }
            });
            
            if (!response.ok) {
                throw new Error('Delete failed');
            }
            
            // Обновляем список
            await this.loadMyPets();
            
            // Также обновляем callback для других страниц
            if (window.updatePetsCallback) {
                await window.updatePetsCallback();
            }
        } catch (error) {
            console.error('Failed to delete pet:', error);
            alert('Не удалось удалить питомца');
        }
    }
    
    async showEditProfileModal() {
        const userId = AuthManager.getUserId();
        let user;
        try {
            user = await accountAPI.getMe();
        } catch (error) {
            console.error('Failed to load profile for editing:', error);
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'pet-modal-overlay';
        modal.innerHTML = `
            <div class="filter-modal">
                <div class="filter-modal-header">
                    <h2>Редактировать профиль</h2>
                    <button class="filter-modal-close">&times;</button>
                </div>
                
                <div class="filter-modal-body">
                    <div class="form-group">
                        <label for="edit-display-name">Имя</label>
                        <input type="text" id="edit-display-name" value="${user.display_name || ''}" placeholder="Ваше имя">
                    </div>
                    <div class="form-group">
                        <label for="edit-bio">О себе</label>
                        <textarea id="edit-bio" rows="3" placeholder="Расскажите о себе">${user.bio || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="edit-location">Город</label>
                        <input type="text" id="edit-location" value="${user.location || ''}" placeholder="Ваш город">
                    </div>
                </div>
                
                <div class="filter-modal-footer">
                    <button id="cancel-edit" class="btn-secondary">Отмена</button>
                    <button id="save-profile" class="btn-primary">Сохранить</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.filter-modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('#cancel-edit').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        modal.querySelector('#save-profile').addEventListener('click', async () => {
            const displayName = document.getElementById('edit-display-name').value.trim();
            const bio = document.getElementById('edit-bio').value.trim();
            const location = document.getElementById('edit-location').value.trim();
            
            try {
                await accountAPI.updateMe({ display_name: displayName, bio, location });
                await this.loadProfile();
                modal.remove();
            } catch (error) {
                console.error('Failed to update profile:', error);
                alert('Не удалось обновить профиль');
            }
        });
    }
    
    logout() {
        AuthManager.logout();
        window.location.reload();
    }
    
    // Этот метод вызывается извне при переключении на страницу профиля
    async load() {
        await this.loadProfile();
        await this.loadMyPets();
    }
}