import { petsAPI } from '../api.js';

export class AddPetPage {
    constructor() {
        this.container = document.getElementById('add-pet-page');
        this.render();
    }
    
    render() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="page-header">
                <h2>Добавить питомца</h2>
            </div>
            <div class="pet-form-container">
                <form id="add-pet-form">
                    <div class="pet-form-header">
                        <div class="photo-section">
                            <div class="photo-placeholder" id="pet-photo-preview">
                                <span>🐾</span>
                                <p>Загрузить фото</p>
                            </div>
                            <input type="file" id="pet-photo" accept="image/*" style="display: none;">
                        </div>
                        
                        <div class="pet-form-fields">
                            <div class="form-group">
                                <label for="pet-type">Тип животного *</label>
                                <select id="pet-type" required>
                                    <option value="">Выберите тип</option>
                                    <option value="dog">Собака</option>
                                    <option value="cat">Кошка</option>
                                    <option value="other">Другое</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="pet-name">Кличка *</label>
                                <input type="text" id="pet-name" placeholder="Введите кличку" required>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="pet-breed">Порода</label>
                        <input type="text" id="pet-breed" placeholder="Например: Лабрадор">
                    </div>
                    
                    <div class="form-group">
                        <label for="pet-age">Возраст (лет)</label>
                        <input type="number" id="pet-age" placeholder="0" min="0" max="30">
                    </div>
                    
                    <div class="form-group">
                        <label for="pet-description">Описание</label>
                        <textarea id="pet-description" rows="3" placeholder="Расскажите о питомце..."></textarea>
                    </div>
                    
                    <button type="submit" class="btn-primary">Добавить питомца</button>
                </form>
                <div id="pet-form-message" class="form-message"></div>
            </div>
        `;
        
        this.bindEvents();
    }
    
    bindEvents() {
        const form = document.getElementById('add-pet-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
        
        const photoPlaceholder = document.getElementById('pet-photo-preview');
        const photoInput = document.getElementById('pet-photo');
        if (photoPlaceholder && photoInput) {
            photoPlaceholder.addEventListener('click', () => photoInput.click());
        }
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const type = document.getElementById('pet-type')?.value;
        const breed = document.getElementById('pet-breed')?.value.trim();
        const name = document.getElementById('pet-name')?.value.trim();
        const age = document.getElementById('pet-age')?.value;
        const description = document.getElementById('pet-description')?.value.trim();
        
        if (!type || !name) {
            this.showMessage('Заполните обязательные поля', 'error');
            return;
        }
        
        const submitBtn = document.querySelector('#add-pet-form button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Добавление...';
        }
        
        try {
            await petsAPI.createPet({
                type: type,
                breed: breed || '',
                name: name,
                age: age ? parseInt(age) : 0,
                description: description || '',
                adoption_mode: 'open'
            });
            
            this.showMessage('Питомец добавлен!', 'success');
            document.getElementById('add-pet-form').reset();
            
            if (window.updatePetsCallback) {
                await window.updatePetsCallback();
            }
            
        } catch (error) {
            this.showMessage(`Ошибка: ${error.message}`, 'error');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Добавить питомца';
            }
        }
    }
    
    showMessage(text, type) {
        const msgEl = document.getElementById('pet-form-message');
        if (msgEl) {
            msgEl.textContent = text;
            msgEl.className = `form-message ${type}`;
        }
        
        if (type === 'success') {
            setTimeout(() => {
                if (msgEl) msgEl.textContent = '';
            }, 2000);
        }
    }
}