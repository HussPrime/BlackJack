import { useState } from 'react';
import {
  CHIP_DENOMS, CHIP_COLORS, CHIP_TEXT_COLORS,
  PAYOUTS, getColor, cryptoSpin, resolveAllBets, getHotNumbers,
  streetNums, sixlineNums,
} from '../logic/rouletteRules';

// 12 rows of 3 numbers  row 0 → [1,2,3], row 11 → [34,35,36]
const NUMBER_ROWS = Array.from({ length: 12 }, (_, i) => [i*3+1, i*3+2, i*3+3]);

let _betId = 0;
const uid    = () => String(++_betId);
const betKey = (type, nums) =>
  `${type}:${[...nums].sort((a, b) => a - b).join(',')}`;

// ── Chip on selector bar ────────────────────────────────────────────────────
function Chip({ denom, selected, onClick }) {
  return (
    <button
      className={`r-chip-btn${selected ? ' r-chip-selected' : ''}`}
      style={{
        background: CHIP_COLORS[denom],
        color:      CHIP_TEXT_COLORS[denom],
        border:     selected ? '3px solid gold' : '2px solid rgba(255,255,255,0.4)',
      }}
      onClick={onClick}
      title={`Chip: ${denom}`}
    >
      {denom}
    </button>
  );
}

// Small chip shown on a bet cell
function BetChip({ amount, won }) {
  const denom = CHIP_DENOMS.filter(d => d <= amount).pop() ?? 1;
  return (
    <span
      className={`r-bet-chip${won ? ' r-bet-chip-won' : ''}`}
      style={{ background: CHIP_COLORS[denom], color: CHIP_TEXT_COLORS[denom] }}
    >
      {amount >= 1000 ? `${(amount/1000).toFixed(1)}k` : amount}
    </span>
  );
}

// ── Stats Panel ─────────────────────────────────────────────────────────────
function RouletteStats({ stats, spinHistory, onClose }) {
  const hot     = getHotNumbers(spinHistory, 5);
  const winRate = stats.spins > 0 ? ((stats.wins / stats.spins) * 100).toFixed(1) : '—';
  return (
    <div className="r-stats-panel">
      <div className="r-stats-title">📊 Roulette Stats</div>
      <div className="stats-grid">
        <div className="stats-row"><span className="stats-label">Spins</span><span className="stats-value">{stats.spins}</span></div>
        <div className="stats-row"><span className="stats-label">Wins</span><span className="stats-value green">{stats.wins}</span></div>
        <div className="stats-row"><span className="stats-label">Win Rate</span><span className="stats-value">{winRate}%</span></div>
        <div className="stats-row">
          <span className="stats-label">Net P&amp;L</span>
          <span className={`stats-value ${stats.netPnL >= 0 ? 'green' : 'red'}`}>
            {stats.netPnL >= 0 ? '+' : ''}{stats.netPnL}
          </span>
        </div>
        {hot.length > 0 && (
          <>
            <div className="stats-row" style={{ marginTop: 8 }}>
              <span className="stats-label" style={{ fontWeight: 700 }}>Hot Numbers</span>
            </div>
            {hot.map(({ num, count }) => (
              <div className="stats-row" key={num}>
                <span className="stats-label">
                  <span style={{
                    display: 'inline-block', width: 18, height: 18, borderRadius: '50%',
                    background: getColor(num) === 'red' ? '#b03020' : getColor(num) === 'green' ? '#1b6e1b' : '#222',
                    textAlign: 'center', lineHeight: '18px', fontSize: 10, fontWeight: 700, color: 'white',
                  }}>{num}</span>
                </span>
                <span className="stats-value">{count}×</span>
              </div>
            ))}
          </>
        )}
      </div>
      <button className="stats-reset-btn" onClick={onClose}>CLOSE</button>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function Roulette({ onBack }) {
  const [monney,      setMonney]      = useState(1000);
  const [bets,        setBets]        = useState([]);
  const [lastBets,    setLastBets]    = useState([]);
  const [chipDenom,   setChipDenom]   = useState(100);
  const [spinning,    setSpinning]    = useState(false);
  const [result,      setResult]      = useState(null);
  const [wonIds,      setWonIds]      = useState(new Set());
  const [message,     setMessage]     = useState('Place your bets!');
  const [history,     setHistory]     = useState([]);
  const [spinHistory, setSpinHistory] = useState([]);
  const [stats,       setStats]       = useState({ spins: 0, wins: 0, netPnL: 0 });
  const [showStats,   setShowStats]   = useState(false);

  const totalBet   = bets.reduce((s, b) => s + b.amount, 0);
  const availFunds = monney - totalBet;

  // ── Bet helpers ─────────────────────────────────────────────────────────
  const placeBet = (type, nums) => {
    if (spinning) return;
    if (availFunds < chipDenom) return;
    const k = betKey(type, nums);
    setBets(prev => {
      const idx = prev.findIndex(b => b.key === k);
      if (idx >= 0) return prev.map((b, i) => i === idx ? { ...b, amount: b.amount + chipDenom } : b);
      return [...prev, { id: uid(), type, nums, amount: chipDenom, key: k }];
    });
  };

  const removeBet  = key => { if (!spinning) setBets(prev => prev.filter(b => b.key !== key)); };
  const clearBets  = ()  => { if (!spinning) setBets([]); };
  const rebet      = ()  => {
    if (spinning || lastBets.length === 0) return;
    const needed = lastBets.reduce((s, b) => s + b.amount, 0);
    if (monney < needed) return;
    setBets(lastBets.map(b => ({ ...b, id: uid() })));
  };

  // ── Spin ────────────────────────────────────────────────────────────────
  const doSpin = () => {
    if (spinning || bets.length === 0) return;
    const resultNum = cryptoSpin();
    const snapshot  = [...bets];

    setMonney(m => m - totalBet);
    setSpinning(true);
    setResult(null);
    setWonIds(new Set());
    setLastBets(snapshot);
    setMessage('🎰 Spinning…');

    setTimeout(() => {
      const { returned, wonIds: wIds } = resolveAllBets(snapshot, resultNum);
      if (returned > 0) setMonney(m => m + returned);

      const color = getColor(resultNum);
      const net   = returned - totalBet;

      setResult(resultNum);
      setWonIds(wIds);
      setMessage(
        returned > 0
          ? `${color.toUpperCase()} ${resultNum} — ${net >= 0 ? '+' : ''}${net} chips!`
          : `${color.toUpperCase()} ${resultNum} — No win`
      );
      setHistory(h => [{ num: resultNum, color }, ...h].slice(0, 20));
      setSpinHistory(h => [...h, resultNum].slice(-100));
      setStats(s => ({
        spins:  s.spins  + 1,
        wins:   s.wins   + (returned > totalBet ? 1 : 0),
        netPnL: s.netPnL + net,
      }));
      setSpinning(false);
      setBets([]);

      if (monney - totalBet + returned <= 0) {
        setTimeout(() => { setMonney(1000); setMessage("You're broke! Here's 1 000 chips."); }, 1500);
      }
    }, 4000);
  };

  const getBet = (type, nums) => bets.find(b => b.key === betKey(type, nums));

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="roulette-fullscreen">

      {/* ── 3D model fullscreen ─────────────────────────────────────────── */}
      <iframe
        title="Roulette Table 3D"
        src="https://sketchfab.com/models/344e732688b44432b1a987cc27f2b01f/embed?autostart=1&ui_controls=0&ui_infos=0&ui_stop=0&ui_watermark=0&preload=1&camera=0"
        frameBorder="0"
        allow="autoplay; fullscreen; xr-spatial-tracking"
        className="r-iframe-full"
      />

      {/* ── HUD overlay ────────────────────────────────────────────────── */}
      <div className="roulette-hud-overlay">

        {/* Top bar */}
        <div className="r-hud-top">
          <button className="lobby-back-btn" onClick={onBack} style={{ position: 'static' }}>← LOBBY</button>
          <div className="r-hud-info">
            <span>💸 {availFunds}</span>
            <span>🎯 {totalBet > 0 ? totalBet : '—'}</span>
          </div>
          <button className="stats-toggle-btn r-stats-btn" onClick={() => setShowStats(s => !s)} style={{ position: 'static' }}>
            📊
          </button>
        </div>

        {/* Message + history */}
        <div className="r-hud-message">{message}</div>
        {history.length > 0 && (
          <div className="roulette-history">
            {history.map((h, i) => (
              <span key={i} className={`r-hist-ball r-hist-${h.color}`}>{h.num}</span>
            ))}
          </div>
        )}

        {/* Stats panel */}
        {showStats && (
          <RouletteStats stats={stats} spinHistory={spinHistory} onClose={() => setShowStats(false)} />
        )}

        {/* Chip selector */}
        <div className="r-chip-selector">
          {CHIP_DENOMS.map(d => (
            <Chip key={d} denom={d} selected={chipDenom === d} onClick={() => setChipDenom(d)} />
          ))}
        </div>

        {/* ── Betting table ─────────────────────────────────────────────── */}
        <div className="roulette-table">

          {/* Zero */}
          <div className="r-zero-row">
            {(() => {
              const b = getBet('straight', [0]);
              return (
                <button
                  className={['r-num r-green r-num-zero', result === 0 ? 'r-result' : '', wonIds.has(b?.id) ? 'r-winning' : '', b ? 'r-has-bet' : ''].join(' ')}
                  onClick={() => placeBet('straight', [0])}
                  onContextMenu={e => { e.preventDefault(); if (b) removeBet(b.key); }}
                >
                  0{b && <BetChip amount={b.amount} won={wonIds.has(b.id)} />}
                </button>
              );
            })()}
          </div>

          {/* Number grid: 12 rows × 3 */}
          <div className="r-numbers-grid">
            {NUMBER_ROWS.map((row, ri) => (
              <div key={ri}>
                {ri > 0 && (() => {
                  const slNums = sixlineNums(ri - 1);
                  const b = getBet('sixline', slNums);
                  return (
                    <div
                      className={`r-sixline-zone ${b ? 'r-has-bet' : ''} ${wonIds.has(b?.id) ? 'r-winning-zone' : ''}`}
                      onClick={() => placeBet('sixline', slNums)}
                      onContextMenu={e => { e.preventDefault(); if (b) removeBet(b.key); }}
                      title="Six Line (5:1)"
                    >
                      <span className="r-zone-label">6L</span>
                      {b && <BetChip amount={b.amount} won={wonIds.has(b.id)} />}
                    </div>
                  );
                })()}
                <div className="r-num-row">
                  {row.map(num => {
                    const b   = getBet('straight', [num]);
                    const col = getColor(num);
                    return (
                      <button
                        key={num}
                        className={[`r-num r-${col}`, result === num ? 'r-result' : '', wonIds.has(b?.id) ? 'r-winning' : '', b ? 'r-has-bet' : ''].join(' ')}
                        onClick={() => placeBet('straight', [num])}
                        onContextMenu={e => { e.preventDefault(); if (b) removeBet(b.key); }}
                        title={`${num} (35:1)`}
                      >
                        {num}{b && <BetChip amount={b.amount} won={wonIds.has(b.id)} />}
                      </button>
                    );
                  })}
                  {(() => {
                    const stNums = streetNums(ri);
                    const b = getBet('street', stNums);
                    return (
                      <button
                        className={`r-street-btn ${b ? 'r-has-bet' : ''} ${wonIds.has(b?.id) ? 'r-winning' : ''}`}
                        onClick={() => placeBet('street', stNums)}
                        onContextMenu={e => { e.preventDefault(); if (b) removeBet(b.key); }}
                        title={`Street (11:1)`}
                      >
                        St{b && <BetChip amount={b.amount} won={wonIds.has(b.id)} />}
                      </button>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>

          {/* Column bets */}
          <div className="r-outside-row">
            {[1,2,3].map(col => {
              const b = getBet('column', [col]);
              return (
                <button key={col} className={`r-outside ${b ? 'r-has-bet' : ''} ${wonIds.has(b?.id) ? 'r-winning' : ''}`}
                  onClick={() => placeBet('column', [col])}
                  onContextMenu={e => { e.preventDefault(); if (b) removeBet(b.key); }}
                  title="Column (2:1)"
                >
                  Col {col} 2:1{b && <BetChip amount={b.amount} won={wonIds.has(b.id)} />}
                </button>
              );
            })}
          </div>

          {/* Dozens */}
          <div className="r-outside-row">
            {[[1,'1-12'],[2,'13-24'],[3,'25-36']].map(([d, label]) => {
              const b = getBet('dozen', [d]);
              return (
                <button key={d} className={`r-outside ${b ? 'r-has-bet' : ''} ${wonIds.has(b?.id) ? 'r-winning' : ''}`}
                  onClick={() => placeBet('dozen', [d])}
                  onContextMenu={e => { e.preventDefault(); if (b) removeBet(b.key); }}
                  title="Dozen (2:1)"
                >
                  {label}{b && <BetChip amount={b.amount} won={wonIds.has(b.id)} />}
                </button>
              );
            })}
          </div>

          {/* Even-money outside bets */}
          <div className="r-outside-row">
            {[
              { type: 'low',   nums: [], label: '1-18',  cls: '' },
              { type: 'even',  nums: [], label: 'EVEN',  cls: '' },
              { type: 'red',   nums: [], label: 'RED',   cls: 'r-red-btn' },
              { type: 'black', nums: [], label: 'BLACK', cls: 'r-black-btn' },
              { type: 'odd',   nums: [], label: 'ODD',   cls: '' },
              { type: 'high',  nums: [], label: '19-36', cls: '' },
            ].map(({ type, nums, label, cls }) => {
              const b = getBet(type, nums);
              return (
                <button key={type}
                  className={`r-outside ${cls} ${b ? 'r-has-bet' : ''} ${wonIds.has(b?.id) ? 'r-winning' : ''}`}
                  onClick={() => placeBet(type, nums)}
                  onContextMenu={e => { e.preventDefault(); if (b) removeBet(b.key); }}
                  title={`${label} (1:1)`}
                >
                  {label}{b && <BetChip amount={b.amount} won={wonIds.has(b.id)} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action buttons */}
        <div className="roulette-btns">
          <button className={bets.length > 0 && !spinning ? 'hud-btn bet' : 'hud-btn-disable'}
            onClick={doSpin} disabled={bets.length === 0 || spinning}>
            SPIN
          </button>
          <button className={lastBets.length > 0 && !spinning ? 'hud-btn double' : 'hud-btn-disable'}
            onClick={rebet} disabled={lastBets.length === 0 || spinning}>
            REBET
          </button>
          <button className={bets.length > 0 && !spinning ? 'hud-btn surrender' : 'hud-btn-disable'}
            onClick={clearBets} disabled={bets.length === 0 || spinning}>
            CLEAR
          </button>
        </div>

        <p className="r-hint-text">Clic gauche = placer · Clic droit = retirer</p>

      </div>{/* end roulette-hud-overlay */}
    </div>
  );
}
