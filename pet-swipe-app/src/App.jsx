import './App.css';
import TinderCard from 'react-tinder-card';
import { useState, useRef, useCallback } from 'react';

const pets = [
  { name: 'Питомец 1', id: 1 },
  { name: 'Питомец 2', id: 2 },
  { name: 'Питомец 3', id: 3 },
  { name: 'Питомец 4', id: 4 },
  { name: 'Питомец 5', id: 5 },
];

function App() {
  const [lastDirection, setLastDirection] = useState();
  const [goneCards, setGoneCards] = useState(new Set());
  const cardRefs = useRef({});

  const swiped = useCallback((direction, name) => {
    console.log(`Свайп: ${direction} на ${name}`);
    setLastDirection(direction);
  }, []);

  const onCardLeftScreen = useCallback((id) => {
    console.log(`Карточка ${id} ушла`);
    setGoneCards((prev) => new Set(prev).add(id));
  }, []);

  const swipe = useCallback((dir) => {
    // Находим первую карточку, которая ещё НЕ ушла (в порядке отображения)
    const activePet = pets.find((pet) => !goneCards.has(pet.id));
    if (activePet && cardRefs.current[activePet.id]) {
      cardRefs.current[activePet.id].swipe(dir);
    }
  }, [goneCards]);

  return (
    <div className="app-container">
      <div className="header">
        <h1>Лапа об лапу</h1>
        <p>Сервис для подбора питомцев</p>
      </div>

      <div className="card-container">
        {/* Рендерим в обратном порядке, чтобы первый питомец был визуально сверху */}
        {[...pets].reverse().map((pet) => (
          <TinderCard
            ref={(el) => (cardRefs.current[pet.id] = el)}
            className="tinder-card"
            key={pet.id}
            onSwipe={(dir) => swiped(dir, pet.name)}
            onCardLeftScreen={() => onCardLeftScreen(pet.id)}
            preventSwipe={['up', 'down']}
          >
            <h3>{pet.name}</h3>
          </TinderCard>
        ))}
      </div>

      <div className="controls">
        <button className="btn btn-no" onClick={() => swipe('left')}>
          ✕
        </button>
        <button className="btn btn-yes" onClick={() => swipe('right')}>
          ♥
        </button>
      </div>

      {goneCards.size >= pets.length && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          fontSize: '1.5rem',
          color: '#F4EDD2',
          textAlign: 'center'
        }}>
          🎉 Все карточки просмотрены!<br/>
          <small>Скоро здесь будут новые питомцы</small>
        </div>
      )}
    </div>
  );
}

export default App;