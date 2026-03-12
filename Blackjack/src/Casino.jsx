import { useState } from 'react';
import BlackJack from './App';
import Roulette from './components/Roulette';

export default function Casino() {
  const [game, setGame] = useState(null);

  if (game === 'blackjack') return <BlackJack onBack={() => setGame(null)} />;
  if (game === 'roulette')  return <Roulette  onBack={() => setGame(null)} />;

  return (
    <div className="casino-lobby">
      <div className="casino-title">CASINO</div>
      <div className="casino-subtitle">Choose your game</div>
      <div className="casino-games">
        <button className="casino-game-btn" onClick={() => setGame('blackjack')}>
          <span className="casino-game-icon">🃏</span>
          BLACKJACK
        </button>
        <button className="casino-game-btn" onClick={() => setGame('roulette')}>
          <span className="casino-game-icon">🎡</span>
          ROULETTE
        </button>
      </div>
    </div>
  );
}
