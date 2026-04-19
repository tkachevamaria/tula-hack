import { petsAPI, swipesAPI, matchesAPI } from '../api.js';
import { AuthManager } from '../auth.js';

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
    
    renderCurrentCard() {
        const stack = document.getElementById('swipe-card-stack');
        if (!stack) return;
        
        if (this.pets.length === 0 || this.currentIndex >= this.pets.length) {
            this.showEmptyMessage();
            return;
        }
        
        const pet = this.pets[this.currentIndex];
        stack.innerHTML = this.createCardHTML(pet);
        
        this.initDragForCurrentCard();
        this.bindCardEvents(pet);
    }
    
    createCardHTML(pet) {
        const petName = pet.Name || pet.name || 'Без имени';
        const petAge = pet.Age || pet.age;
        const petBreed = pet.Breed || pet.breed || pet.Type || pet.type || '';
        const ownerName = pet.OwnerName || pet.owner_name || 'Владелец';
        const ownerId = pet.OwnerID || pet.owner_id;
        
        return `
            <div class="swipe-card" data-pet-id="${pet.ID || pet.id}">
                <div class="swipe-card-owner" data-owner-id="${ownerId}">
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
        
        // Клик по карточке — подробная информация
        card.addEventListener('click', (e) => {
            // Не срабатывает при клике на владельца
            if (!e.target.closest('.swipe-card-owner')) {
                this.showPetModal(pet);
            }
        });
        
        // Клик по владельцу
        const ownerEl = card.querySelector('.swipe-card-owner');
        if (ownerEl) {
            ownerEl.addEventListener('click', (e) => {
                e.stopPropagation();
                const ownerId = ownerEl.dataset.ownerId;
                this.showOwnerProfile(ownerId);
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
            
            // Сначала завершаем анимацию и переходим к следующей карточке
            await this.nextCard();
            
            // Потом показываем мэтч или чат
            if (response.match) {
                this.showMatchModal(pet);
            } else if (isLike && pet.AdoptionMode === 'open') {
                // Если adoption_mode = open, сразу предлагаем чат
                this.showDirectChatModal(pet);
            }
            
        } catch (error) {
            console.error('Swipe error:', error);
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
            // Получаем профиль владельца
            const ownerResponse = await fetch(`http://localhost:8080/users/${ownerId}`, {
                headers: { 'X-User-ID': AuthManager.getUserId() }
            });
            const owner = await ownerResponse.json();
            
            // Получаем питомцев владельца
            const petsResponse = await fetch(`http://localhost:8080/users/${ownerId}/pets`, {
                headers: { 'X-User-ID': AuthManager.getUserId() }
            });
            const pets = await petsResponse.json();
            
            const displayName = owner.DisplayName || owner.display_name || 'Владелец';
            const location = owner.Location || owner.location || '';
            const bio = owner.Bio || owner.bio || '';
            
            // Разбиваем имя на имя и фамилию
            const nameParts = displayName.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            
            const modal = document.createElement('div');
            modal.className = 'pet-modal-overlay';
            modal.innerHTML = `
                <div class="pet-modal owner-full-profile-modal">
                    <button class="pet-modal-close">&times;</button>
                    
                    <div class="owner-full-header">
                        <div class="owner-avatar-huge">👤</div>
                        <div class="owner-full-title">
                            <h2>${firstName} ${lastName}</h2>
                            ${location ? `<p class="owner-location">📍 ${location}</p>` : ''}
                        </div>
                    </div>
                    
                    ${bio ? `
                        <div class="owner-bio-section">
                            <h3>О себе</h3>
                            <p>${bio}</p>
                        </div>
                    ` : ''}
                    
                    <div class="owner-pets-section">
                        <h3>Питомцы ${firstName}</h3>
                        <div class="owner-pets-grid-full">
                            ${pets.length > 0 ? pets.map(p => `
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
            console.error('Failed to load owner profile:', error);
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
        alert('Фильтры будут здесь (в разработке)');
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