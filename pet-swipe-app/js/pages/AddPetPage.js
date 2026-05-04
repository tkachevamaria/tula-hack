import { petsAPI } from '../api.js';

export class AddPetPage {
    constructor() {
        this.container = document.getElementById('add-pet-page');
        this.selectedPhotoFile = null; // ← новое поле для хранения выбранного файла
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
            // Клик по плейсхолдеру открывает выбор файла
            photoPlaceholder.addEventListener('click', () => photoInput.click());
            
            // При выборе файла сохраняем его и показываем превью
            photoInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.selectedPhotoFile = file;
                    
                    // Добавляем класс, чтобы убрать border и background
                    photoPlaceholder.classList.add('has-photo');

                    // Показываем превью
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        photoPlaceholder.innerHTML = `<img src="${ev.target.result}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
                    };
                    reader.readAsDataURL(file);
                } else {
                    this.selectedPhotoFile = null;
                    photoPlaceholder.classList.remove('has-photo');
                    photoPlaceholder.innerHTML = `<span>🐾</span><p>Загрузить фото</p>`;
                }
            });
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
            // 1. Создаём питомца
            const newPet = await petsAPI.createPet({
                type: type,
                breed: breed || '',
                name: name,
                age: age ? parseInt(age) : 0,
                description: description || '',
                adoption_mode: 'open'
            });
            
            const petId = newPet.id; // бэк возвращает { id: ... }
            
            // 2. Если было выбрано фото — загружаем его
            if (this.selectedPhotoFile && petId) {
                try {
                    await this.uploadPetPhoto(petId, this.selectedPhotoFile);
                } catch (photoError) {
                    console.error('Ошибка загрузки фото:', photoError);
                    this.showMessage('Питомец добавлен, но фото не загрузилось', 'warning');
                }
            }
            
            // Успех
            this.showMessage('Питомец добавлен!', 'success');
            
            // Сбрасываем форму
            document.getElementById('add-pet-form').reset();
            this.selectedPhotoFile = null;
            const preview = document.getElementById('pet-photo-preview');
            if (preview){
                preview.classList.remove('has-photo');
                preview.innerHTML = `<span>🐾</span><p>Загрузить фото</p>`;
            }
            
            // Обновляем список питомцев в профиле
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
    
    // Новый метод: загрузка фото питомца
    async uploadPetPhoto(petId, file) {
        const userId = sessionStorage.getItem('user_id');
        if (!userId) throw new Error('Не авторизован');
        
        const formData = new FormData();
        formData.append('photo', file);
        
        const response = await fetch(`http://localhost:8080/pets/${petId}/photos`, {
            method: 'POST',
            headers: {
                'X-User-ID': userId
            },
            body: formData
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload failed: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        return data.url;
    }
    
    showMessage(text, type) {
        const msgEl = document.getElementById('pet-form-message');
        if (msgEl) {
            msgEl.textContent = text;
            msgEl.className = `form-message ${type}`;
        }
        
        if (type === 'success' || type === 'warning') {
            setTimeout(() => {
                if (msgEl) msgEl.textContent = '';
            }, 3000);
        }
    }
}