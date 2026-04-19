import { petsAPI, swipesAPI, matchesAPI } from '../api.js';
import { AuthManager } from '../auth.js';
import { petsAPI, swipesAPI, preferencesAPI } from '../api.js';

export class FeedPage {
    constructor() {
        this.container = document.getElementById('feed-page');
        this.pets = [];
        this.currentIndex = 0;
        this.render();
    }
    
    render() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="page-header">
                <h2>Найди друга</h2>
                <button id="filter-btn" class="btn-icon">⚙️</button>
            </div>
            
            <div class="swipe-container">
                <div id="swipe-card-stack" class="swipe-card-stack"></div>
                
                <div class="swipe-actions">
                    <button id="dislike-btn" class="swipe-btn dislike">✖️</button>
                    <button id="like-btn" class="swipe-btn like">❤️</button>
                </div>
                
                <div id="empty-feed-message" class="empty-feed-message" style="display: none;">
                    <p>🐾 Питомцы закончились</p>
                    <p class="empty-feed-hint">Загляните позже или измените фильтры</p>
                </div>
            </div>
        `;
        
        this.bindEvents();
        this.loadFeed();
    }
    
    bindEvents() {
        const likeBtn = document.getElementById('like-btn');
        const dislikeBtn = document.getElementById('dislike-btn');
        const filterBtn = document.getElementById('filter-btn');
        
        if (likeBtn) likeBtn.addEventListener('click', () => this.handleSwipe(true));
        if (dislikeBtn) dislikeBtn.addEventListener('click', () => this.handleSwipe(false));
        if (filterBtn) filterBtn.addEventListener('click', () => this.showFilters());
    }
    
    async loadFeed() {
        try {
            const data = await petsAPI.getFeed();
            this.pets = Array.isArray(data) ? data : (data.pets || []);
            
            if (this.pets.length === 0) {
                this.showEmptyMessage();
            } else {
                this.renderCurrentCard();
            }
        } catch (error) {
            console.error('Failed to load feed:', error);
            this.showEmptyMessage();
        }
    }
    
    async renderCurrentCard() {
        const stack = document.getElementById('swipe-card-stack');
        if (!stack) return;
        
        if (this.pets.length === 0 || this.currentIndex >= this.pets.length) {
            this.showEmptyMessage();
            return;
        }
        
        const pet = this.pets[this.currentIndex];
        const ownerId = pet.OwnerID;
        
        // По умолчанию
        let ownerName = 'Владелец';
        
        // Делаем отдельный запрос за информацией о владельце
        try {
            const response = await fetch(`http://localhost:8080/users/${ownerId}/pets`, {
                headers: { 'X-User-ID': AuthManager.getUserId() }
            });
            
            if (response.ok) {
                const pets = await response.json();
                // Имя владельца может быть в первом питомце
                if (pets.length > 0) {
                    ownerName = pets[0].OwnerName || pets[0].owner_name || 'Владелец';
                }
            }
        } catch (error) {
            console.log('Не удалось получить имя владельца:', error);
        }
        
        this.currentOwner = {
            id: ownerId,
            displayName: ownerName
        };
        
        stack.innerHTML = this.createCardHTML(pet, this.currentOwner);
        
        this.initDragForCurrentCard();
        this.bindCardEvents(pet);
    }
    
    createCardHTML(pet, owner) {
        const petName = pet.Name || 'Без имени';
        const petAge = pet.Age;
        const petBreed = pet.Breed || pet.Type || '';
        const ownerName = owner.displayName;
        const ownerId = owner.id;
        
        return `
            <div class="swipe-card" data-pet-id="${pet.ID}">
                <div class="swipe-card-owner" data-owner-id="${ownerId}" data-owner-name="${ownerName}">
                    <span class="owner-avatar">👤</span>
                    <span class="owner-name">${ownerName}</span>
                </div>
                
                <div class="swipe-card-photo">
                    ${pet.Type === 'dog' ? '🐕' : pet.Type === 'cat' ? '🐈' : '🐾'}
                </div>
                
                <div class="swipe-card-info">
                    <h3 class="swipe-card-name">${petName}</h3>
                    <p class="swipe-card-details">
                        ${petBreed} ${petAge ? '• ' + petAge + ' ' + this.getAgeSuffix(petAge) : ''}
                    </p>
                </div>
            </div>
        `;
    }
    
    bindCardEvents(pet) {
        const card = document.querySelector('.swipe-card');
        if (!card) return;
        
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.swipe-card-owner')) {
                this.showPetModal(pet);
            }
        });
        
        const ownerEl = card.querySelector('.swipe-card-owner');
        if (ownerEl) {
            ownerEl.addEventListener('click', async (e) => {
                e.stopPropagation();
                
                const ownerId = ownerEl.dataset.ownerId;
                await this.showOwnerProfile(ownerId);
            });
        }
    }
    
    initDragForCurrentCard() {
        const card = document.querySelector('.swipe-card');
        if (!card) return;
        
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        
        const onStart = (e) => {
            startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            isDragging = true;
            card.style.transition = 'none';
        };
        
        const onMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            
            const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            currentX = clientX - startX;
            
            const rotate = currentX * 0.1;
            card.style.transform = `translateX(${currentX}px) rotate(${rotate}deg)`;
            
            // Эффект like/dislike
            if (currentX > 50) {
                card.classList.add('liking');
                card.classList.remove('disliking');
            } else if (currentX < -50) {
                card.classList.add('disliking');
                card.classList.remove('liking');
            } else {
                card.classList.remove('liking', 'disliking');
            }
        };
        
        const onEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            
            card.style.transition = 'transform 0.3s ease';
            
            const threshold = 100;
            
            if (currentX > threshold) {
                this.animateSwipe('right');
                this.handleSwipe(true);
            } else if (currentX < -threshold) {
                this.animateSwipe('left');
                this.handleSwipe(false);
            } else {
                card.style.transform = '';
                card.classList.remove('liking', 'disliking');
            }
        };
        
        card.addEventListener('mousedown', onStart);
        card.addEventListener('mousemove', onMove);
        card.addEventListener('mouseup', onEnd);
        card.addEventListener('mouseleave', onEnd);
        
        card.addEventListener('touchstart', onStart, { passive: false });
        card.addEventListener('touchmove', onMove, { passive: false });
        card.addEventListener('touchend', onEnd);
    }
    
    animateSwipe(direction) {
        const card = document.querySelector('.swipe-card');
        if (!card) return;
        
        const x = direction === 'right' ? 500 : -500;
        card.style.transform = `translateX(${x}px) rotate(${x * 0.1}deg)`;
        card.style.opacity = '0';
    }

    showDirectChatModal(pet) {
        const modal = document.createElement('div');
        modal.className = 'match-modal-overlay';
        modal.innerHTML = `
            <div class="match-modal">
                <h2 class="match-title">💬 Начать общение?</h2>
                <div class="match-photo">
                    <div class="match-photo">${pet.Type === 'dog' ? '🐕' : pet.Type === 'cat' ? '🐈' : '🐾'}</div>
                </div>
                <p class="match-text">Владелец открыт к общению!</p>
                <div class="match-actions">
                    <button class="btn-secondary match-close">Позже</button>
                    <button class="btn-primary match-chat">Перейти в чат</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.match-close').addEventListener('click', () => modal.remove());
        modal.querySelector('.match-chat').addEventListener('click', () => {
            modal.remove();
            document.querySelector('[data-page="chats"]')?.click();
        });
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
    
    async handleSwipe(isLike) {
        const pet = this.pets[this.currentIndex];
        if (!pet) return;
        
        const petId = pet.ID || pet.id;
        
        try {
            const response = await swipesAPI.swipe(petId, isLike);
            console.log('Swipe response:', response);
            
            await this.nextCard();
            
            if (response.match) {
                this.showMatchModal(pet);
            } else if (isLike && pet.AdoptionMode === 'open') {
                this.showDirectChatModal(pet);
            }
            
        } catch (error) {
            console.error('Swipe error:', error);
            // Всё равно переходим к следующей карточке
            this.nextCard();
        }
    }

    async nextCard() {
        return new Promise((resolve) => {
            const card = document.querySelector('.swipe-card');
            if (!card) {
                this.currentIndex++;
                this.renderCurrentCard();
                resolve();
                return;
            }
            
            // Ждём завершения анимации
            card.addEventListener('transitionend', () => {
                this.currentIndex++;
                
                if (this.currentIndex >= this.pets.length) {
                    this.showEmptyMessage();
                } else {
                    this.renderCurrentCard();
                }
                
                resolve();
            }, { once: true });
        });
    }
    
    showEmptyMessage() {
        const stack = document.getElementById('swipe-card-stack');
        const emptyMsg = document.getElementById('empty-feed-message');
        
        if (stack) stack.innerHTML = '';
        if (emptyMsg) emptyMsg.style.display = 'block';
    }
    
    async showPetModal(pet) {
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
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.pet-modal-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
    
    async showOwnerProfile(ownerId) {
        try {
            // Получаем питомцев владельца
            const response = await fetch(`http://localhost:8080/users/${ownerId}/pets`, {
                headers: { 'X-User-ID': AuthManager.getUserId() }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load owner pets');
            }
            
            const pets = await response.json();
            
            const modal = document.createElement('div');
            modal.className = 'pet-modal-overlay';
            modal.innerHTML = `
                <div class="pet-modal owner-full-profile-modal">
                    <button class="pet-modal-close">&times;</button>
                    
                    <div class="owner-full-header">
                        <div class="owner-avatar-huge">👤</div>
                        <div class="owner-full-title">
                            <h2>Владелец #${ownerId}</h2>
                        </div>
                    </div>
                    
                    <div class="owner-pets-section">
                        <h3>Питомцы владельца</h3>
                        <div class="owner-pets-grid-full">
                            ${pets && pets.length > 0 ? pets.map(p => `
                                <div class="owner-pet-card-full">
                                    <div class="owner-pet-photo">${p.Type === 'dog' ? '🐕' : p.Type === 'cat' ? '🐈' : '🐾'}</div>
                                    <h4>${p.Name || 'Без имени'}</h4>
                                    <p>${p.Breed || p.Type || ''} ${p.Age ? p.Age + ' ' + this.getAgeSuffix(p.Age) : ''}</p>
                                </div>
                            `).join('') : '<p class="no-pets-message">У владельца пока нет питомцев</p>'}
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
            console.error('Failed to load owner pets:', error);
            alert('Не удалось загрузить питомцев владельца');
        }
    }
    
    showMatchModal(pet) {
        const modal = document.createElement('div');
        modal.className = 'match-modal-overlay';
        modal.innerHTML = `
            <div class="match-modal">
                <h2 class="match-title">🎉 It's a match!</h2>
                <div class="match-photos">
                    <div class="match-photo">🐾</div>
                    <div class="match-photo">❤️</div>
                </div>
                <p class="match-text">Вы и ${pet.Name || 'питомец'} понравились друг другу!</p>
                <div class="match-actions">
                    <button class="btn-secondary match-close">Продолжить</button>
                    <button class="btn-primary match-chat">Перейти в чат</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.match-close').addEventListener('click', () => modal.remove());
        modal.querySelector('.match-chat').addEventListener('click', () => {
            modal.remove();
            document.querySelector('[data-page="chats"]')?.click();
        });
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
    
    showFilters() {
        this.loadPreferences().then(prefs => {
            const modal = document.createElement('div');
            modal.className = 'pet-modal-overlay';
            modal.innerHTML = `
                <div class="filter-modal">
                    <div class="filter-modal-header">
                        <h2>Фильтры</h2>
                        <button class="filter-modal-close">&times;</button>
                    </div>
                    
                    <div class="filter-modal-body">
                        <div class="form-group">
                            <label for="filter-type">Тип животного</label>
                            <select id="filter-type">
                                <option value="">Любой</option>
                                <option value="dog" ${prefs.preferred_type === 'dog' ? 'selected' : ''}>Собака</option>
                                <option value="cat" ${prefs.preferred_type === 'cat' ? 'selected' : ''}>Кошка</option>
                            </select>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group half">
                                <label for="filter-age-min">Возраст от</label>
                                <input type="number" id="filter-age-min" min="0" max="30" 
                                    value="${prefs.min_age || ''}" placeholder="0">
                            </div>
                            <div class="form-group half">
                                <label for="filter-age-max">Возраст до</label>
                                <input type="number" id="filter-age-max" min="0" max="30" 
                                    value="${prefs.max_age || ''}" placeholder="30">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="filter-breed">Порода</label>
                            <input type="text" id="filter-breed" 
                                value="${prefs.preferred_breed || ''}" placeholder="Например: Лабрадор">
                        </div>
                        
                        <div class="form-group">
                            <label for="filter-location">Город</label>
                            <input type="text" id="filter-location" 
                                value="${prefs.preferred_location || ''}" placeholder="Введите город">
                        </div>
                    </div>
                    
                    <div class="filter-modal-footer">
                        <button id="filter-reset" class="btn-secondary">Сбросить</button>
                        <button id="filter-apply" class="btn-primary">Применить</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            modal.querySelector('.filter-modal-close').addEventListener('click', () => modal.remove());
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.remove();
            });
            
            modal.querySelector('#filter-reset').addEventListener('click', () => {
                document.getElementById('filter-type').value = '';
                document.getElementById('filter-age-min').value = '';
                document.getElementById('filter-age-max').value = '';
                document.getElementById('filter-breed').value = '';
                document.getElementById('filter-location').value = '';
            });
            
            modal.querySelector('#filter-apply').addEventListener('click', async () => {
                const preferences = {
                    preferred_type: document.getElementById('filter-type').value || null,
                    min_age: parseInt(document.getElementById('filter-age-min').value) || null,
                    max_age: parseInt(document.getElementById('filter-age-max').value) || null,
                    preferred_breed: document.getElementById('filter-breed').value || null,
                    preferred_location: document.getElementById('filter-location').value || null
                };
                
                await this.savePreferences(preferences);
                modal.remove();
                
                // Перезагружаем ленту
                this.currentIndex = 0;
                await this.loadFeed();
            });
        });
    }

    async loadPreferences() {
        try {
            const prefs = await preferencesAPI.get();
            return prefs || {};
        } catch {
            return {};
        }
    }

    async savePreferences(prefs) {
        try {
            await preferencesAPI.set(prefs);
            console.log('Preferences saved:', prefs);
        } catch (error) {
            console.error('Failed to save preferences:', error);
        }
    }
    
    getPetTypeText(type) {
        switch(type) {
            case 'dog': return 'Собака';
            case 'cat': return 'Кошка';
            default: return 'Другое';
        }
    }
    
    getAgeSuffix(age) {
        if (age === 1) return 'год';
        if (age >= 2 && age <= 4) return 'года';
        return 'лет';
    }
}