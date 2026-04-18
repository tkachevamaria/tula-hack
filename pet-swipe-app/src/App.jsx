import { useState, useRef, useCallback } from 'react';
import './App.css';
import TinderCard from 'react-tinder-card';

// Импорты фото (порядок как на референсе)
import petPuppy from './assets/pet1.jpg';   // щенок (слева сверху)
import petCalico from './assets/pet2.jpg';  // трёхцветная кошка (слева снизу)
import petPoodle from './assets/pet3.jpg';  // пудель (справа снизу)
import petGinger from './assets/pet4.jpg';  // рыжий кот (справа сверху)

const PETS = [
  { id: '1', name: 'Барсик', breed: 'Кот, 2 года' },
  { id: '2', name: 'Рекс', breed: 'Щенок, 4 мес' },
  { id: '3', name: 'Кеша', breed: 'Попугай, 1 год' },
  { id: '4', name: 'Мурка', breed: 'Кошка, 3 года' },
  { id: '5', name: 'Шарик', breed: 'Собака, 5 лет' },
];

function App() {
  const [screen, setScreen] = useState('welcome');
  const [isOrg, setIsOrg] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleStart = () => setScreen('auth');
  const handleAuth = (e) => {
    e.preventDefault();
    console.log('Auth:', { type: isOrg ? 'org' : 'person', email, password });
    setScreen('main');
  };

  return (
    <div className="app">
      {screen === 'welcome' && <WelcomeScreen onStart={handleStart} />}
      {screen === 'auth' && (
        <AuthScreen 
          isOrg={isOrg} setIsOrg={setIsOrg} 
          email={email} setEmail={setEmail}
          password={password} setPassword={setPassword}
          onSubmit={handleAuth} onBack={() => setScreen('welcome')}
        />
      )}
      {screen === 'main' && <SwipeScreen pets={PETS} onLogout={() => setScreen('welcome')} />}
    </div>
  );
}

/* ================= ПРИВЕТСТВИЕ ================= */
function WelcomeScreen({ onStart }) {
  return (
    <div className="screen welcome">
      {/* Логотип с векторными иконками */}
      <div className="logo-block">
        <div className="logo-row">
          <svg className="icon-paw" viewBox="0 0 64 64" fill="#F4EDD2">
            <path d="M18 14c4 0 7 3 7 7s-3 7-7 7-7-3-7-7 3-7 7-7zm28 0c4 0 7 3 7 7s-3 7-7 7-7-3-7-7 3-7 7-7zm-14 8c5 0 9 4 9 9s-4 9-9 9-9-4-9-9 4-9 9-9zm-12 18c3 0 5 2 5 5v4c0 3-2 5-5 5h-2c-3 0-5-2-5-5v-4c0-3 2-5 5-5h2zm24 0c3 0 5 2 5 5v4c0 3-2 5-5 5h-2c-3 0-5-2-5-5v-4c0-3 2-5 5-5h2z"/>
          </svg>
          <h1 className="logo-title">Лапа об лапу</h1>
          <svg className="icon-bone" viewBox="0 0 64 64" fill="#F4EDD2">
            <path d="M12 24c-6 0-10 4-10 10s4 10 10 10c2 0 4-1 5-2l14 14c2 2 5 2 7 0l14-14c1 1 3 2 5 2 6 0 10-4 10-10s-4-10-10-10c-2 0-4 1-5 2L32 12c-2-2-5-2-7 0L17 26c-1-1-3-2-5-2z"/>
          </svg>
        </div>
        <p className="logo-subtitle">сервис для подбора питомцев</p>
      </div>

      {/* Кнопка между логотипом и фото */}
      <button className="btn-start" onClick={onStart}>Начать</button>

      {/* Галерея питомцев */}
      <div className="pets-gallery">
        <img className="pet-img pet-tl" src={petPuppy} alt="puppy" />
        <img className="pet-img pet-bl" src={petCalico} alt="calico cat" />
        <img className="pet-img pet-br" src={petPoodle} alt="poodle" />
        <img className="pet-img pet-tr" src={petGinger} alt="ginger cat" />
      </div>
    </div>
  );
}

/* ================= АВТОРИЗАЦИЯ ================= */
function AuthScreen({ isOrg, setIsOrg, email, setEmail, password, setPassword, onSubmit, onBack }) {
  return (
    <div className="screen auth">
      <div className="logo-block compact">
        <div className="logo-row">
          <svg className="icon-paw" viewBox="0 0 64 64" fill="#F4EDD2">
            <path d="M18 14c4 0 7 3 7 7s-3 7-7 7-7-3-7-7 3-7 7-7zm28 0c4 0 7 3 7 7s-3 7-7 7-7-3-7-7 3-7 7-7zm-14 8c5 0 9 4 9 9s-4 9-9 9-9-4-9-9 4-9 9-9zm-12 18c3 0 5 2 5 5v4c0 3-2 5-5 5h-2c-3 0-5-2-5-5v-4c0-3 2-5 5-5h2zm24 0c3 0 5 2 5 5v4c0 3-2 5-5 5h-2c-3 0-5-2-5-5v-4c0-3 2-5 5-5h2z"/>
          </svg>
          <h1 className="logo-title">Лапа об лапу</h1>
          <svg className="icon-bone" viewBox="0 0 64 64" fill="#F4EDD2">
            <path d="M12 24c-6 0-10 4-10 10s4 10 10 10c2 0 4-1 5-2l14 14c2 2 5 2 7 0l14-14c1 1 3 2 5 2 6 0 10-4 10-10s-4-10-10-10c-2 0-4 1-5 2L32 12c-2-2-5-2-7 0L17 26c-1-1-3-2-5-2z"/>
          </svg>
        </div>
        <p className="logo-subtitle">сервис для подбора питомцев</p>
      </div>

      <div className="auth-card">
        <div className="toggle-wrapper">
          <span className={!isOrg ? 'active-label' : ''}>Я человек</span>
          <label className="switch">
            <input type="checkbox" checked={isOrg} onChange={() => setIsOrg(!isOrg)} />
            <span className="slider"></span>
          </label>
          <span className={isOrg ? 'active-label' : ''}>Я организация</span>
        </div>

        <form onSubmit={onSubmit} className="auth-form">
          <div className="input-group">
            <label>Email</label>
            <input type="email" placeholder="example@mail.ru" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Пароль</label>
            <input type="password" placeholder="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-submit">Зарегистрироваться</button>
        </form>
      </div>
      
      <button className="btn-back" onClick={onBack}>← Назад</button>
    </div>
  );
}

/* ================= СВАЙПЫ ================= */
function SwipeScreen({ pets, onLogout }) {
  const [goneIds, setGoneIds] = useState(new Set());
  const cardRefs = useRef({});

  const swipe = useCallback((dir) => {
    const active = pets.find(p => !goneIds.has(p.id));
    if (active && cardRefs.current[active.id]) cardRefs.current[active.id].swipe(dir);
  }, [goneIds, pets]);

  const onCardLeft = useCallback((id) => setGoneIds(prev => new Set(prev).add(id)), []);

  return (
    <div className="screen main">
      <header className="main-header">
        <h2>Лапа об лапу</h2>
        <button className="btn-logout" onClick={onLogout}>Выйти</button>
      </header>

      <div className="card-stack">
        {[...pets].reverse().map(pet => (
          <TinderCard
            key={pet.id}
            ref={el => cardRefs.current[pet.id] = el}
            className="tinder-card"
            onCardLeftScreen={() => onCardLeft(pet.id)}
            preventSwipe={['up', 'down']}
          >
            <div className="card-inner">
              <h3>{pet.name}</h3>
              <p>{pet.breed}</p>
            </div>
          </TinderCard>
        ))}
      </div>

      <div className="controls">
        <button className="btn-circle no" onClick={() => swipe('left')}></button>
        <button className="btn-circle yes" onClick={() => swipe('right')}>♥</button>
      </div>
    </div>
  );
}

export default App;