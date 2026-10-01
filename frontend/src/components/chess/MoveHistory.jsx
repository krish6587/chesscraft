import React, { useEffect, useRef } from 'react';
import './MoveHistory.css';

export const MoveHistory = ({ history }) => {
  const containerRef = useRef(null);

  // Auto-scroll to bottom on each move
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history]);

  // Group moves into turn pairs: [{ turnNumber: 1, white: 'e4', black: 'e5' }]
  const movePairs = [];
  for (let i = 0; i < history.length; i += 2) {
    movePairs.push({
      turnNumber: Math.floor(i / 2) + 1,
      white: history[i]?.san || '',
      black: history[i + 1]?.san || '',
    });
  }

  return (
    <div className="move-history-card">
      <div className="move-history-header">
        <span className="history-title">Notation & Moves</span>
        <span className="history-total">{history.length} ply</span>
      </div>

      <div className="move-history-scroll" ref={containerRef}>
        {movePairs.length === 0 ? (
          <div className="history-empty-notice">
            <span>No moves played yet. White to open.</span>
          </div>
        ) : (
          <table className="move-history-table">
            <thead>
              <tr>
                <th className="th-turn">#</th>
                <th className="th-white">White</th>
                <th className="th-black">Black</th>
              </tr>
            </thead>
            <tbody>
              {movePairs.map((pair, idx) => (
                <tr
                  key={pair.turnNumber}
                  className={`history-row ${
                    idx === movePairs.length - 1 ? 'latest-row' : ''
                  }`}
                >
                  <td className="cell-num">{pair.turnNumber}.</td>
                  <td
                    className={`cell-move ${
                      idx === movePairs.length - 1 && !pair.black ? 'active-move' : ''
                    }`}
                  >
                    {pair.white}
                  </td>
                  <td
                    className={`cell-move ${
                      idx === movePairs.length - 1 && pair.black ? 'active-move' : ''
                    }`}
                  >
                    {pair.black}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
