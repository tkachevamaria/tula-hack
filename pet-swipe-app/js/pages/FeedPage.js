import { petsAPI } from '../api.js';

export class FeedPage {
    constructor() {
        this.container = document.getElementById('feed-page');
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
                <div class="swipe-card-placeholder">
                    <div class="swipe-emoji">🐶</div>
                    <p>Здесь будут карточки для свайпов</p>
                    <p class="swipe-hint">← Влево | Вправо →</p>
                </div>
            </div>
        `;
        
        const filterBtn = document.getElementById('filter-btn');
        if (filterBtn) {
            filterBtn.addEventListener('click', () => {
                alert('Фильтры будут здесь (в разработке)');
            });
        }
    }
    
    async load() {
        try {
            const feed = await petsAPI.getFeed();
            console.log('Feed loaded:', feed);
        } catch (error) {
            console.log('Feed not available yet');
        }
    }
}