import './App.css';
import TinderCard from 'react-tinder-card';
import { useState } from 'react';

// Данные для карточек (пока заглушки)
const pets = [
  { name: 'Питомец 1', id: 1 },
  { name: 'Питомец 2', id: 2 },
  { name: 'Питомец 3', id: 3 },
  { name: 'Питомец 4', id: 4 },
  { name: 'Питомец 5', id: 5 },
];

function App() {
  const [lastDirection, setLastDirection] = useState();

  const swiped = (direction, name) => {
    console.log('Свайп: ' + direction + ' на ' + name);
    setLastDirection(direction);
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>Лапа об лапу</h1>
        <p>Сервис для подбора питомцев</p>
      </div>

      <div className="card-container">
        {pets.map((pet) => (
          <TinderCard
            className="tinder-card"
            key={pet.id}
            onSwipe={(dir) => swiped(dir, pet.name)}
            preventSwipe={['up', 'down']}
          >
            <h3>{pet.name}</h3>
          </TinderCard>
        ))}
      </div>

      <div className="controls">
        <button className="btn btn-no">✕</button>
        <button className="btn btn-yes">♥</button>
      </div>
    </div>
  );
}

export default App;