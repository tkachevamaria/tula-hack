import { accountAPI, petsAPI } from '../api.js';
import { AuthManager } from '../auth.js';

export class ProfilePage {
    constructor() {
        this.container = document.getElementById('profile-page');
        this.isEditing = false;
        this.adoptionMode = 'open'; // по умолчанию
        this.render();
    }
    
    render() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="page-header">
                <h2>Профиль</h2>
                <button id="edit-profile-btn" class="btn-icon">✏️</button>
            </div>
            
            <div id="profile-view-mode" class="profile-container">
                <div class="profile-header">
                    <div class="profile-photo-section">
                        <div class="profile-photo-placeholder" id="profile-photo-preview">
                            <span>👤</span>
                            <p>Загрузить фото</p>
                        </div>
                        <input type="file" id="profile-photo" accept="image/*" style="display: none;">
                    </div>
                    <div id="profile-info-display" class="profile-info-display"></div>
                </div>
                
                <div class="profile-pets-section">
                    <div class="profile-pets-header">
                        <h3>Мои питомцы</h3>
                        <div class="adoption-mode-switch">
                            <span>Режим:</span>
                            <button id="adoption-open-btn" class="mode-btn ${this.adoptionMode === 'open' ? 'active' : ''}">Открытый</button>
                            <button id="adoption-strict-btn" class="mode-btn ${this.adoptionMode === 'strict' ? 'active' : ''}">Строгий</button>
                        </div>
                    </div>
                    <div id="my-pets-list" class="my-pets-grid"></div>
                </div>
                
                <button id="logout-btn" class="btn-secondary">Выйти</button>
            </div>
            
            <div id="profile-edit-mode" class="profile-container" style="display: none;">
                <div class="profile-edit-header">
                    <div class="profile-photo-section">
                        <div class="profile-photo-placeholder" id="profile-photo-preview-edit">
                            <span>👤</span>
                            <p>Загрузить фото</p>
                        </div>
                    </div>
                </div>
                
                <form id="profile-form">
                    <div id="profile-fields"></div>
                    <div class="form-actions">
                        <button type="button" id="cancel-edit-btn" class="btn-secondary">Отмена</button>
                        <button type="submit" class="btn-primary">Сохранить</button>
                    </div>
                </form>
                <div id="profile-form-message" class="form-message"></div>
            </div>
        `;
        
        this.bindEvents();
    }
    
    bindEvents() {
        const editBtn = document.getElementById('edit-profile-btn');
        const cancelBtn = document.getElementById('cancel-edit-btn');
        const profileForm = document.getElementById('profile-form');
        const logoutBtn = document.getElementById('logout-btn');
        
        if (editBtn) editBtn.addEventListener('click', () => this.toggleEdit(true));
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.toggleEdit(false));
        if (profileForm) profileForm.addEventListener('submit', (e) => this.handleUpdate(e));
        if (logoutBtn) logoutBtn.addEventListener('click', () => this.handleLogout());
        
        const photoPlaceholder = document.getElementById('profile-photo-preview');
        const photoInput = document.getElementById('profile-photo');
        if (photoPlaceholder && photoInput) {
            photoPlaceholder.addEventListener('click', () => photoInput.click());
        }
        
        // Переключатели режима
        const openBtn = document.getElementById('adoption-open-btn');
        const strictBtn = document.getElementById('adoption-strict-btn');
        
        if (openBtn) {
            openBtn.addEventListener('click', () => this.switchAdoptionMode('open'));
        }
        if (strictBtn) {
            strictBtn.addEventListener('click', () => this.switchAdoptionMode('strict'));
        }
    }
    
    switchAdoptionMode(mode) {
        this.adoptionMode = mode;
        
        const openBtn = document.getElementById('adoption-open-btn');
        const strictBtn = document.getElementById('adoption-strict-btn');
        
        if (openBtn) openBtn.classList.toggle('active', mode === 'open');
        if (strictBtn) strictBtn.classList.toggle('active', mode === 'strict');
        
        // Здесь можно сохранить режим для всех питомцев или глобально
        console.log('Adoption mode switched to:', mode);
    }
    
    async load() {
        await this.loadProfile();
        await this.loadMyPets();
    }
    
    async loadProfile() {
        try {
            const profile = await accountAPI.getMe();
            AuthManager.setUser({ user_id: profile.id || profile.ID, user: profile });
            this.renderProfileInfo(profile);
            this.renderProfileForm(profile);
        } catch (error) {
            console.error('Failed to load profile:', error);
        }
    }
    
    renderProfileInfo(profile) {
        const container = document.getElementById('profile-info-display');
        if (!container) return;
        
        const role = profile.role || profile.Role || AuthManager.getUserRole();
        const displayName = profile.display_name || profile.DisplayName || '—';
        const location = profile.location || profile.Location || '—';
        const bio = profile.bio || profile.Bio || '—';
        
        let html = '';
        
        if (role === 'user') {
            const nameParts = displayName.split(' ');
            const firstName = nameParts[0] || '—';
            const lastName = nameParts.slice(1).join(' ') || '—';
            
            html = `
                <div class="profile-info-row"><span class="profile-info-label">Имя:</span> <span class="profile-info-value">${firstName}</span></div>
                <div class="profile-info-row"><span class="profile-info-label">Фамилия:</span> <span class="profile-info-value">${lastName}</span></div>
                <div class="profile-info-row"><span class="profile-info-label">Город:</span> <span class="profile-info-value">${location}</span></div>
                <div class="profile-info-row"><span class="profile-info-label">О себе:</span> <span class="profile-info-value">${bio}</span></div>
            `;
        } else {
            html = `
                <div class="profile-info-row"><span class="profile-info-label">Название:</span> <span class="profile-info-value">${displayName}</span></div>
                <div class="profile-info-row"><span class="profile-info-label">Город и адрес:</span> <span class="profile-info-value">${location}</span></div>
                <div class="profile-info-row"><span class="profile-info-label">Описание:</span> <span class="profile-info-value">${bio}</span></div>
            `;
        }
        
        container.innerHTML = html;
    }
    
    renderProfileForm(profile) {
        const container = document.getElementById('profile-fields');
        if (!container) return;
        
        const role = profile.role || profile.Role || AuthManager.getUserRole();
        const displayName = profile.display_name || profile.DisplayName || '';
        const location = profile.location || profile.Location || '';
        const bio = profile.bio || profile.Bio || '';
        
        let html = '';
        
        if (role === 'user') {
            const nameParts = displayName.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            
            html = `
                <div class="form-group">
                    <label for="edit-first-name">Имя</label>
                    <input type="text" id="edit-first-name" value="${firstName}" placeholder="Введите имя">
                </div>
                <div class="form-group">
                    <label for="edit-last-name">Фамилия</label>
                    <input type="text" id="edit-last-name" value="${lastName}" placeholder="Введите фамилию">
                </div>
                <div class="form-group">
                    <label for="edit-location">Город</label>
                    <input type="text" id="edit-location" value="${location}" placeholder="Введите город">
                </div>
                <div class="form-group">
                    <label for="edit-bio">О себе</label>
                    <textarea id="edit-bio" rows="3" placeholder="Расскажите о себе">${bio}</textarea>
                </div>
            `;
        } else {
            html = `
                <div class="form-group">
                    <label for="edit-display-name">Название организации</label>
                    <input type="text" id="edit-display-name" value="${displayName}" placeholder="Введите название">
                </div>
                <div class="form-group">
                    <label for="edit-location">Город и точный адрес</label>
                    <input type="text" id="edit-location" value="${location}" placeholder="Введите город и адрес">
                </div>
                <div class="form-group">
                    <label for="edit-bio">Описание</label>
                    <textarea id="edit-bio" rows="3" placeholder="Опишите вашу организацию">${bio}</textarea>
                </div>
            `;
        }
        
        container.innerHTML = html;
    }
    
    toggleEdit(edit) {
        this.isEditing = edit;
        
        const viewMode = document.getElementById('profile-view-mode');
        const editMode = document.getElementById('profile-edit-mode');
        
        if (viewMode) viewMode.style.display = edit ? 'none' : 'block';
        if (editMode) editMode.style.display = edit ? 'block' : 'none';
        
        const msgEl = document.getElementById('profile-form-message');
        if (msgEl) msgEl.textContent = '';
    }
    
    async handleUpdate(e) {
        e.preventDefault();
        
        const role = AuthManager.getUserRole();
        let displayName, location, bio;
        
        if (role === 'user') {
            const firstName = document.getElementById('edit-first-name')?.value.trim() || '';
            const lastName = document.getElementById('edit-last-name')?.value.trim() || '';
            displayName = `${firstName} ${lastName}`.trim();
            location = document.getElementById('edit-location')?.value.trim() || '';
            bio = document.getElementById('edit-bio')?.value.trim() || '';
        } else {
            displayName = document.getElementById('edit-display-name')?.value.trim() || '';
            location = document.getElementById('edit-location')?.value.trim() || '';
            bio = document.getElementById('edit-bio')?.value.trim() || '';
        }
        
        try {
            await accountAPI.updateMe({
                display_name: displayName,
                location: location,
                bio: bio
            });
            
            this.showMessage('Профиль обновлён', 'success');
            await this.loadProfile();
            
            setTimeout(() => this.toggleEdit(false), 1000);
            
        } catch (error) {
            this.showMessage(`Ошибка: ${error.message}`, 'error');
        }
    }
    
    showMessage(text, type) {
        const msgEl = document.getElementById('profile-form-message');
        if (msgEl) {
            msgEl.textContent = text;
            msgEl.className = `form-message ${type}`;
        }
    }
    
    async loadMyPets() {
        const container = document.getElementById('my-pets-list');
        if (!container) return;
        
        try {
            const data = await petsAPI.getMyPets();
            console.log('Получены питомцы:', data);
            
            const pets = Array.isArray(data) ? data : (data.pets || []);
            
            if (pets.length === 0) {
                container.innerHTML = '<div class="empty-pets-message">У вас пока нет питомцев</div>';
                return;
            }
            
            container.innerHTML = pets.map(pet => {
                const petId = pet.ID;
                const petName = pet.Name || 'Без имени';
                const petType = pet.Type || 'other';
                const petBreed = pet.Breed || '';
                const petAge = pet.Age;
                
                return `
                    <div class="my-pet-card" data-pet-id="${petId}">
                        <div class="my-pet-photo">${petType === 'dog' ? '🐕' : petType === 'cat' ? '🐈' : '🐾'}</div>
                        <div class="my-pet-info">
                            <h4>${petName}</h4>
                            <p>${petBreed || petType || ''} ${petAge ? petAge + ' ' + this.getAgeSuffix(petAge) : ''}</p>
                        </div>
                    </div>
                `;
            }).join('');
            
            container.querySelectorAll('.my-pet-card').forEach(card => {
                card.addEventListener('click', () => {
                    const petId = card.dataset.petId;
                    this.showPetModal(petId);
                });
            });
            
        } catch (error) {
            console.error('Ошибка загрузки питомцев:', error);
            container.innerHTML = '<div class="empty-pets-message">Не удалось загрузить питомцев</div>';
        }
    }
    
    async showPetModal(petId) {
        if (!petId) return;
        
        try {
            const pet = await petsAPI.getPet(petId);
            
            const petData = {
                id: pet.ID || pet.id,
                name: pet.Name || pet.name || 'Без имени',
                type: pet.Type || pet.type || 'other',
                breed: pet.Breed || pet.breed,
                age: pet.Age || pet.age,
                description: pet.Description || pet.description,
                status: pet.Status || pet.status || 'available'
            };
            
            const modal = document.createElement('div');
            modal.className = 'pet-modal-overlay';
            modal.innerHTML = `
                <div class="pet-modal">
                    <button class="pet-modal-close">&times;</button>
                    <div class="pet-modal-header">
                        <div class="pet-modal-photo">
                            ${petData.type === 'dog' ? '🐕' : petData.type === 'cat' ? '🐈' : '🐾'}
                        </div>
                        <div class="pet-modal-title">
                            <h2>${petData.name}</h2>
                            <p class="pet-modal-type">${this.getPetTypeText(petData.type)}</p>
                        </div>
                    </div>
                    <div class="pet-modal-info">
                        <div class="pet-info-row">
                            <span class="pet-info-label">Порода:</span>
                            <span class="pet-info-value">${petData.breed || 'Не указана'}</span>
                        </div>
                        <div class="pet-info-row">
                            <span class="pet-info-label">Возраст:</span>
                            <span class="pet-info-value">${petData.age ? petData.age + ' ' + this.getAgeSuffix(petData.age) : 'Не указан'}</span>
                        </div>
                        <div class="pet-info-row pet-info-description">
                            <span class="pet-info-label">Описание:</span>
                            <span class="pet-info-value">${petData.description || 'Нет описания'}</span>
                        </div>
                        <div class="pet-info-row">
                            <span class="pet-info-label">Статус:</span>
                            <span class="pet-info-value">${petData.status === 'available' ? 'Доступен' : 'Недоступен'}</span>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            modal.querySelector('.pet-modal-close').addEventListener('click', () => modal.remove());
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.remove();
            });
            
        } catch (error) {
            console.error('Ошибка загрузки питомца:', error);
        }
    }
    
    getPetTypeText(type) {
        switch(type) {
            case 'dog': return 'Собака';
            case 'cat': return 'Кошка';
            case 'other': return 'Другое';
            default: return type || 'Не указан';
        }
    }
    
    getAgeSuffix(age) {
        if (age === 1) return 'год';
        if (age >= 2 && age <= 4) return 'года';
        return 'лет';
    }
    
    handleLogout() {
        AuthManager.logout();
        document.getElementById('app-screen').classList.remove('active');
        document.getElementById('welcome-screen').classList.add('active');
    }
}