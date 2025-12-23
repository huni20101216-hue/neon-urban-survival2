
import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameScene from './components/GameScene';
import { PlayerState, WeaponType, GameMessage } from './types';
import { WEAPONS } from './constants';
import { getSurvivorMessage } from './services/geminiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [player, setPlayer] = useState<PlayerState>({
    health: 100,
    maxHealth: 100,
    score: 0,
    isDashing: false,
    dashCooldown: 0,
    currentWeapon: WeaponType.PISTOL
  });
  const [ammo, setAmmo] = useState<number>(WEAPONS[WeaponType.PISTOL].ammo);
  const [messages, setMessages] = useState<GameMessage[]>([]);
  const [isLocked, setIsLocked] = useState(false);

  // Sync state from game engine
  const handlePlayerUpdate = useCallback((update: Partial<PlayerState>) => {
    setPlayer(prev => ({ ...prev, ...update }));
  }, []);

  const handleScoreUpdate = useCallback((points: number) => {
    setPlayer(prev => {
      const newScore = prev.score + points;
      // Fetch dynamic message from Gemini every 100 points
      if (Math.floor(newScore / 100) > Math.floor(prev.score / 100)) {
        getSurvivorMessage(newScore).then(msg => {
          setMessages(prevMsgs => [{
            id: Math.random().toString(),
            text: msg,
            timestamp: Date.now()
          }, ...prevMsgs.slice(0, 4)]);
        });
      }
      return { ...prev, score: newScore };
    });
  }, []);

  const handleAmmoUpdate = useCallback((newAmmo: number) => {
    setAmmo(newAmmo);
  }, []);

  const startGame = () => {
    setGameState('PLAYING');
    setPlayer({
      health: 100,
      maxHealth: 100,
      score: 0,
      isDashing: false,
      dashCooldown: 0,
      currentWeapon: WeaponType.PISTOL
    });
    setAmmo(WEAPONS[WeaponType.PISTOL].ammo);
  };

  useEffect(() => {
    const handlePointerLockChange = () => {
      setIsLocked(document.pointerLockElement !== null);
    };
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    return () => document.removeEventListener('pointerlockchange', handlePointerLockChange);
  }, []);

  if (gameState === 'START') {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-zinc-900 text-white z-50">
        <h1 className="text-6xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 animate-pulse">
          NEON URBAN SURVIVAL
        </h1>
        <p className="text-zinc-400 mb-8 max-w-md text-center">
          The city has fallen. Scavenge weapons, use your dash to escape clutches, and survive the neon nightmare.
        </p>
        <button 
          onClick={startGame}
          className="px-8 py-3 bg-fuchsia-600 hover:bg-fuchsia-700 rounded-full font-bold transition-all transform hover:scale-110 active:scale-95 border-2 border-fuchsia-400/50 shadow-[0_0_20px_rgba(192,38,211,0.5)]"
        >
          ENTER THE CITY
        </button>
        <div className="mt-12 grid grid-cols-2 gap-8 text-sm text-zinc-500">
          <div>[WASD] Move</div>
          <div>[SPACE] Jump</div>
          <div>[SHIFT] Dash</div>
          <div>[L-CLICK] Fire</div>
          <div>[1/2/3] Weapons</div>
          <div>[ESC] Unlock Mouse</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      {/* HUD */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-20">
        {/* Top Left: Status */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center border-2 border-fuchsia-500 shadow-lg">
              <span className="text-fuchsia-500 font-bold">HP</span>
            </div>
            <div className="w-64 h-6 bg-zinc-800/80 rounded-full overflow-hidden border border-zinc-700 backdrop-blur-sm">
              <div 
                className="h-full bg-gradient-to-r from-fuchsia-600 to-pink-500 transition-all duration-300 shadow-[0_0_15px_rgba(219,39,119,0.5)]"
                style={{ width: `${player.health}%` }}
              />
            </div>
          </div>
          <div className="text-cyan-400 font-mono text-xl tracking-widest mt-2 bg-black/40 px-3 py-1 rounded inline-block">
            SCORE: {player.score.toString().padStart(6, '0')}
          </div>
        </div>

        {/* Top Right: Weapons Info */}
        <div className="flex flex-col items-end gap-2">
          <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-700 backdrop-blur-md shadow-2xl">
            <div className="text-zinc-400 text-xs uppercase font-bold tracking-widest mb-1">Current Weapon</div>
            <div className="text-3xl font-black text-white italic">{WEAPONS[player.currentWeapon].name}</div>
            <div className="flex items-end gap-2 mt-2">
              <div className="text-5xl font-mono text-cyan-400">{ammo}</div>
              <div className="text-xl font-mono text-zinc-500 pb-1">/ {WEAPONS[player.currentWeapon].maxAmmo}</div>
            </div>
          </div>
          
          {/* Dash Meter */}
          <div className="mt-2 w-48 h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
            <div 
              className={`h-full transition-all duration-100 ${player.dashCooldown > 0 ? 'bg-zinc-600' : 'bg-fuchsia-500 shadow-[0_0_10px_rgba(192,38,211,0.8)]'}`}
              style={{ width: `${Math.max(0, 100 - (player.dashCooldown / 20))} %` }} 
            />
          </div>
        </div>
      </div>

      {/* Radio Messages */}
      <div className="absolute bottom-10 left-10 max-w-sm pointer-events-none z-20">
        {messages.map((m, i) => (
          <div 
            key={m.id} 
            className="mb-2 bg-cyan-950/40 border-l-4 border-cyan-500 p-3 backdrop-blur-sm text-cyan-100 text-sm italic animate-in slide-in-from-left duration-500"
            style={{ opacity: 1 - i * 0.2 }}
          >
            <span className="text-cyan-400 font-bold mr-2">[RADIO]:</span>
            {m.text}
          </div>
        ))}
      </div>

      {/* Pointer Lock Overlay */}
      {!isLocked && gameState === 'PLAYING' && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center pointer-events-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-6">GAME PAUSED</h2>
            <button 
              onClick={() => document.body.requestPointerLock()}
              className="px-10 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-black rounded-lg transition-transform hover:scale-105"
            >
              RESUME SURVIVAL
            </button>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'GAMEOVER' && (
        <div className="absolute inset-0 bg-zinc-950/95 z-50 flex flex-col items-center justify-center">
          <h2 className="text-8xl font-black text-red-600 mb-2 italic tracking-tighter">WASTED</h2>
          <p className="text-2xl text-zinc-400 mb-8">FINAL SCORE: {player.score}</p>
          <button 
            onClick={startGame}
            className="px-12 py-4 bg-white text-black font-black text-xl hover:bg-red-600 hover:text-white transition-colors uppercase"
          >
            Try Again
          </button>
        </div>
      )}

      <GameScene 
        onHealthChange={(health) => handlePlayerUpdate({ health })}
        onAmmoChange={handleAmmoUpdate}
        onScoreChange={handleScoreUpdate}
        onGameStateChange={setGameState}
        onDashUpdate={(isDashing, dashCooldown) => handlePlayerUpdate({ isDashing, dashCooldown })}
        onWeaponChange={(currentWeapon) => handlePlayerUpdate({ currentWeapon })}
      />
    </div>
  );
};

export default App;
