import { useState } from "react";
import { getWinRate, getBustRate, describeStreak, resetStats } from "../logic/statsManager";

/**
 * Collapsible statistics panel.
 * Displays win/loss rates, streaks, bankroll, and theoretical house edge.
 */
export default function StatsPanel({ stats, monney, onReset }) {
  const [confirmReset, setConfirmReset] = useState(false);

  const winRate = getWinRate(stats);
  const lossRate = stats.handsPlayed > 0
    ? ((stats.losses / stats.handsPlayed) * 100).toFixed(1)
    : '0.0';
  const pushRate = stats.handsPlayed > 0
    ? ((stats.pushes / stats.handsPlayed) * 100).toFixed(1)
    : '0.0';
  const bustRate = getBustRate(stats);
  const streak = describeStreak(stats.currentStreak);
  const netColor = stats.netProfit >= 0 ? '#2ecc71' : '#e74c3c';

  const handleReset = () => {
    if (confirmReset) {
      const fresh = resetStats();
      if (onReset) onReset(fresh);
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
    }
  };

  return (
    <div className="stats-panel">
      <h2 className="stats-title">📊 Statistics</h2>

      <div className="stats-grid">
        {/* Volume */}
        <div className="stats-row">
          <span className="stats-label">Hands played</span>
          <span className="stats-value">{stats.handsPlayed}</span>
        </div>

        {/* Win / Loss / Push */}
        <div className="stats-row">
          <span className="stats-label">Wins</span>
          <span className="stats-value green">{stats.wins} ({winRate}%)</span>
        </div>
        <div className="stats-row">
          <span className="stats-label">Losses</span>
          <span className="stats-value red">{stats.losses} ({lossRate}%)</span>
        </div>
        <div className="stats-row">
          <span className="stats-label">Pushes</span>
          <span className="stats-value gold">{stats.pushes} ({pushRate}%)</span>
        </div>

        {/* Special hands */}
        <div className="stats-row">
          <span className="stats-label">Blackjacks</span>
          <span className="stats-value green">{stats.blackjacks}</span>
        </div>
        <div className="stats-row">
          <span className="stats-label">Player busts</span>
          <span className="stats-value red">{stats.busts} ({bustRate}%)</span>
        </div>

        {/* Streaks */}
        <div className="stats-row">
          <span className="stats-label">Current streak</span>
          <span className="stats-value" style={{ color: stats.currentStreak >= 0 ? '#2ecc71' : '#e74c3c' }}>
            {streak}
          </span>
        </div>
        <div className="stats-row">
          <span className="stats-label">Best win streak</span>
          <span className="stats-value green">{stats.longestWinStreak}</span>
        </div>
        <div className="stats-row">
          <span className="stats-label">Worst loss streak</span>
          <span className="stats-value red">{stats.longestLossStreak}</span>
        </div>

        {/* Bankroll */}
        <div className="stats-row">
          <span className="stats-label">Net profit / loss</span>
          <span className="stats-value" style={{ color: netColor }}>
            {stats.netProfit >= 0 ? '+' : ''}{Math.round(stats.netProfit)}
          </span>
        </div>
        <div className="stats-row">
          <span className="stats-label">Current bankroll</span>
          <span className="stats-value gold">{monney}</span>
        </div>

        {/* Theoretical house edge note */}
        <div className="stats-row stats-note">
          <span className="stats-label">Theoretical win rate</span>
          <span className="stats-value">~43% (basic strategy)</span>
        </div>
        <div className="stats-row stats-note">
          <span className="stats-label">House edge</span>
          <span className="stats-value">~0.5% with basic strategy</span>
        </div>
      </div>

      <button
        className={`stats-reset-btn ${confirmReset ? 'confirm' : ''}`}
        onClick={handleReset}
      >
        {confirmReset ? 'Click again to confirm reset' : 'Reset stats'}
      </button>
    </div>
  );
}
