import React from 'react';

// Crisp, high-definition SVG vector chess pieces (standard international tournament vector design)
export const ChessPiece = ({ type, color, className = '' }) => {
  if (!type || !color) return null;
  const key = `${color}${type.toUpperCase()}`;

  switch (key) {
    // WHITE PIECES
    case 'wP':
      return (
        <svg viewBox="0 0 45 45" className={`chess-piece-svg ${className}`}>
          <path
            d="m 22.5,9 c -2.21,0 -4,1.79 -4,4 0,0.89 0.29,1.71 0.78,2.38 C 17.33,16.5 16,18.59 16,21 c 0,2.03 0.94,3.84 2.41,5.03 C 15.41,27.09 11,31.58 11,39.5 l 23,0 c 0,-7.92 -4.41,-12.41 -7.41,-13.47 C 28.06,24.84 29,23.03 29,21 29,18.59 27.67,16.5 25.72,15.38 26.21,14.71 26.5,13.89 26.5,13 c 0,-2.21 -1.79,-4 -4,-4 z"
            style={{
              fill: '#ffffff',
              stroke: '#000000',
              strokeWidth: 1.5,
              strokeLinecap: 'round',
            }}
          />
        </svg>
      );
    case 'wN':
      return (
        <svg viewBox="0 0 45 45" className={`chess-piece-svg ${className}`}>
          <g
            style={{
              fill: 'none',
              stroke: '#000000',
              strokeWidth: 1.5,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
            }}
          >
            <path
              d="m 22,10 c 10.5,1 16.5,8 16,29 L 15,39 C 15,30 11.5,24 6,19 8.5,18.5 12,18 13.5,14 14,11 13.5,9.5 12.5,7 15.5,6.5 19.5,8.5 22,10 z"
              style={{ fill: '#ffffff', stroke: '#000000' }}
            />
            <path
              d="m 24,18 c 0.38,2.91 -5.55,7.37 -8,9 -3,2 -2.82,4.34 -5,4 -1.04,-0.94 -1.48,-2.68 0.5,-4 1.5,-1 3,-1.5 4.5,-4 2.5,-3 4,-6 8,-5 z"
              style={{ fill: '#ffffff', stroke: '#000000' }}
            />
            <circle cx="9.5" cy="25.5" r="1" style={{ fill: '#000000' }} />
            <circle cx="15" cy="14.5" r="1.2" style={{ fill: '#000000' }} />
          </g>
        </svg>
      );
    case 'wB':
      return (
        <svg viewBox="0 0 45 45" className={`chess-piece-svg ${className}`}>
          <g
            style={{
              fill: 'none',
              stroke: '#000000',
              strokeWidth: 1.5,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
            }}
          >
            <g style={{ fill: '#ffffff', stroke: '#000000' }}>
              <path d="m 9,36 c 3.39,-0.97 10.11,0.43 13.5,-2 3.39,2.43 10.11,1.03 13.5,2 0,0 1.65,0.54 3,2 -0.68,0.97 -1.65,0.99 -3,0.5 -3.39,-0.49 -10.11,0.96 -13.5,-1 -3.39,1.96 -10.11,0.51 -13.5,1 -1.35,0.49 -2.32,0.47 -3,-0.5 1.35,-1.46 3,-2 3,-2 z" />
              <path d="m 15,32 c 2.5,2.5 12.5,2.5 15,0 0.5,-1.5 0,-2 0,-2 0,-2.5 -2.5,-4 -2.5,-4 5.5,-1.5 6,-11.5 -5,-15.5 -11,4 -10.5,14 -5,15.5 0,0 -2.5,1.5 -2.5,4 0,0 -0.5,0.5 0,2 z" />
              <path d="m 25,8 a 2.5,2.5 0 1 1 -5,0 2.5,2.5 0 1 1 5,0 z" />
            </g>
            <path d="m 17.5,26 h 10 M 15,30 h 15 m -7.5,-14.5 v 5 m -2.5,-2.5 h 5" />
          </g>
        </svg>
      );
    case 'wR':
      return (
        <svg viewBox="0 0 45 45" className={`chess-piece-svg ${className}`}>
          <g
            style={{
              fill: '#ffffff',
              stroke: '#000000',
              strokeWidth: 1.5,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
            }}
          >
            <path d="m 9,39 h 27 v -3 H 9 v 3 z m 3,-3 v -4 h 21 v 4 H 12 z m -1,-22 1.5,-2.5 h 20 l 1.5,2.5 H 11 z m 0,2.5 h 23 v 11 H 11 V 16.5 z" />
            <path d="m 12,14 h 3 v -4 h -3 v 4 z m 6,0 h 3 v -4 h -3 v 4 z m 6,0 h 3 v -4 h -3 v 4 z m 6,0 h 3 v -4 h -3 v 4 z" />
          </g>
        </svg>
      );
    case 'wQ':
      return (
        <svg viewBox="0 0 45 45" className={`chess-piece-svg ${className}`}>
          <g
            style={{
              fill: '#ffffff',
              stroke: '#000000',
              strokeWidth: 1.5,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
            }}
          >
            <path d="m 8,12 a 2,2 0 1 1 -4,0 2,2 0 1 1 4,0 z m 9.5,-4.5 a 2,2 0 1 1 -4,0 2,2 0 1 1 4,0 z m 9,0 a 2,2 0 1 1 -4,0 2,2 0 1 1 4,0 z m 9.5,4.5 a 2,2 0 1 1 -4,0 2,2 0 1 1 4,0 z M 22.5,6 a 2,2 0 1 1 -4,0 2,2 0 1 1 4,0 z" />
            <path d="m 9,26 c 8.5,-1.5 21,-1.5 27,0 l 2,-12 -7,11 -4,-16 -4.5,16 -7,-11 2.5,12 z" />
            <path d="m 9,26 c 0,2 1.5,2 2.5,4 1,1.5 1,1 0.5,3.5 -1.5,1 -1.5,2.5 -1.5,2.5 -1.5,1.5 0.5,2.5 0.5,2.5 6.5,1 16.5,1 23,0 0,0 1.5,-1 0.5,-2.5 0,0 0,-1.5 -1.5,-2.5 -0.5,-2.5 -0.5,-2 0.5,-3.5 1,-2 2.5,-2 2.5,-4 -8.5,-1.5 -18.5,-1.5 -27,0 z" />
            <path d="m 11,38.5 a 35,35 1 0 0 23,0" style={{ fill: 'none' }} />
          </g>
        </svg>
      );
    case 'wK':
      return (
        <svg viewBox="0 0 45 45" className={`chess-piece-svg ${className}`}>
          <g
            style={{
              fill: 'none',
              stroke: '#000000',
              strokeWidth: 1.5,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
            }}
          >
            <path d="m 22.5,11.63 v 6 M 20,13.5 h 5" style={{ strokeWidth: 1.5 }} />
            <path
              d="m 22.5,25 c 0,0 4.5,-7.5 3,-10.5 0,0 -1,-2.5 -3,-2.5 -2,0 -3,2.5 -3,2.5 -1.5,3 3,10.5 3,10.5"
              style={{ fill: '#ffffff', stroke: '#000000' }}
            />
            <path
              d="m 11.5,37 c 5.5,3.5 15.5,3.5 21,0 v -7 c 0,0 9,-4.5 6,-10.5 -4,-1 -6,2 -6,2 0,0 -2.5,-4 -6.5,-4 -4,0 -6.5,4 -6.5,4 0,0 -2,-3 -6,-2 -3,6 6,10.5 6,10.5 v 7 z"
              style={{ fill: '#ffffff', stroke: '#000000' }}
            />
            <path d="m 11.5,30 c 5.5,-2 15.5,-2 21,0 m -21,3.5 c 5.5,-2 15.5,-2 21,0 m -21,3.5 c 5.5,-2 15.5,-2 21,0" />
          </g>
        </svg>
      );

    // BLACK PIECES
    case 'bP':
      return (
        <svg viewBox="0 0 45 45" className={`chess-piece-svg ${className}`}>
          <path
            d="m 22.5,9 c -2.21,0 -4,1.79 -4,4 0,0.89 0.29,1.71 0.78,2.38 C 17.33,16.5 16,18.59 16,21 c 0,2.03 0.94,3.84 2.41,5.03 C 15.41,27.09 11,31.58 11,39.5 l 23,0 c 0,-7.92 -4.41,-12.41 -7.41,-13.47 C 28.06,24.84 29,23.03 29,21 29,18.59 27.67,16.5 25.72,15.38 26.21,14.71 26.5,13.89 26.5,13 c 0,-2.21 -1.79,-4 -4,-4 z"
            style={{
              fill: '#1e293b',
              stroke: '#f8fafc',
              strokeWidth: 1.5,
              strokeLinecap: 'round',
            }}
          />
        </svg>
      );
    case 'bN':
      return (
        <svg viewBox="0 0 45 45" className={`chess-piece-svg ${className}`}>
          <g
            style={{
              fill: 'none',
              stroke: '#f8fafc',
              strokeWidth: 1.5,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
            }}
          >
            <path
              d="m 22,10 c 10.5,1 16.5,8 16,29 L 15,39 C 15,30 11.5,24 6,19 8.5,18.5 12,18 13.5,14 14,11 13.5,9.5 12.5,7 15.5,6.5 19.5,8.5 22,10 z"
              style={{ fill: '#1e293b', stroke: '#f8fafc' }}
            />
            <path
              d="m 24,18 c 0.38,2.91 -5.55,7.37 -8,9 -3,2 -2.82,4.34 -5,4 -1.04,-0.94 -1.48,-2.68 0.5,-4 1.5,-1 3,-1.5 4.5,-4 2.5,-3 4,-6 8,-5 z"
              style={{ fill: '#1e293b', stroke: '#f8fafc' }}
            />
            <circle cx="9.5" cy="25.5" r="1" style={{ fill: '#f8fafc' }} />
            <circle cx="15" cy="14.5" r="1.2" style={{ fill: '#f8fafc' }} />
          </g>
        </svg>
      );
    case 'bB':
      return (
        <svg viewBox="0 0 45 45" className={`chess-piece-svg ${className}`}>
          <g
            style={{
              fill: 'none',
              stroke: '#f8fafc',
              strokeWidth: 1.5,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
            }}
          >
            <g style={{ fill: '#1e293b', stroke: '#f8fafc' }}>
              <path d="m 9,36 c 3.39,-0.97 10.11,0.43 13.5,-2 3.39,2.43 10.11,1.03 13.5,2 0,0 1.65,0.54 3,2 -0.68,0.97 -1.65,0.99 -3,0.5 -3.39,-0.49 -10.11,0.96 -13.5,-1 -3.39,1.96 -10.11,0.51 -13.5,1 -1.35,0.49 -2.32,0.47 -3,-0.5 1.35,-1.46 3,-2 3,-2 z" />
              <path d="m 15,32 c 2.5,2.5 12.5,2.5 15,0 0.5,-1.5 0,-2 0,-2 0,-2.5 -2.5,-4 -2.5,-4 5.5,-1.5 6,-11.5 -5,-15.5 -11,4 -10.5,14 -5,15.5 0,0 -2.5,1.5 -2.5,4 0,0 -0.5,0.5 0,2 z" />
              <path d="m 25,8 a 2.5,2.5 0 1 1 -5,0 2.5,2.5 0 1 1 5,0 z" />
            </g>
            <path d="m 17.5,26 h 10 M 15,30 h 15 m -7.5,-14.5 v 5 m -2.5,-2.5 h 5" />
          </g>
        </svg>
      );
    case 'bR':
      return (
        <svg viewBox="0 0 45 45" className={`chess-piece-svg ${className}`}>
          <g
            style={{
              fill: '#1e293b',
              stroke: '#f8fafc',
              strokeWidth: 1.5,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
            }}
          >
            <path d="m 9,39 h 27 v -3 H 9 v 3 z m 3,-3 v -4 h 21 v 4 H 12 z m -1,-22 1.5,-2.5 h 20 l 1.5,2.5 H 11 z m 0,2.5 h 23 v 11 H 11 V 16.5 z" />
            <path d="m 12,14 h 3 v -4 h -3 v 4 z m 6,0 h 3 v -4 h -3 v 4 z m 6,0 h 3 v -4 h -3 v 4 z m 6,0 h 3 v -4 h -3 v 4 z" />
          </g>
        </svg>
      );
    case 'bQ':
      return (
        <svg viewBox="0 0 45 45" className={`chess-piece-svg ${className}`}>
          <g
            style={{
              fill: '#1e293b',
              stroke: '#f8fafc',
              strokeWidth: 1.5,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
            }}
          >
            <path d="m 8,12 a 2,2 0 1 1 -4,0 2,2 0 1 1 4,0 z m 9.5,-4.5 a 2,2 0 1 1 -4,0 2,2 0 1 1 4,0 z m 9,0 a 2,2 0 1 1 -4,0 2,2 0 1 1 4,0 z m 9.5,4.5 a 2,2 0 1 1 -4,0 2,2 0 1 1 4,0 z M 22.5,6 a 2,2 0 1 1 -4,0 2,2 0 1 1 4,0 z" />
            <path d="m 9,26 c 8.5,-1.5 21,-1.5 27,0 l 2,-12 -7,11 -4,-16 -4.5,16 -7,-11 2.5,12 z" />
            <path d="m 9,26 c 0,2 1.5,2 2.5,4 1,1.5 1,1 0.5,3.5 -1.5,1 -1.5,2.5 -1.5,2.5 -1.5,1.5 0.5,2.5 0.5,2.5 6.5,1 16.5,1 23,0 0,0 1.5,-1 0.5,-2.5 0,0 0,-1.5 -1.5,-2.5 -0.5,-2.5 -0.5,-2 0.5,-3.5 1,-2 2.5,-2 2.5,-4 -8.5,-1.5 -18.5,-1.5 -27,0 z" />
            <path d="m 11,38.5 a 35,35 1 0 0 23,0" style={{ fill: 'none' }} />
          </g>
        </svg>
      );
    case 'bK':
      return (
        <svg viewBox="0 0 45 45" className={`chess-piece-svg ${className}`}>
          <g
            style={{
              fill: 'none',
              stroke: '#f8fafc',
              strokeWidth: 1.5,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
            }}
          >
            <path d="m 22.5,11.63 v 6 M 20,13.5 h 5" style={{ strokeWidth: 1.5 }} />
            <path
              d="m 22.5,25 c 0,0 4.5,-7.5 3,-10.5 0,0 -1,-2.5 -3,-2.5 -2,0 -3,2.5 -3,2.5 -1.5,3 3,10.5 3,10.5"
              style={{ fill: '#1e293b', stroke: '#f8fafc' }}
            />
            <path
              d="m 11.5,37 c 5.5,3.5 15.5,3.5 21,0 v -7 c 0,0 9,-4.5 6,-10.5 -4,-1 -6,2 -6,2 0,0 -2.5,-4 -6.5,-4 -4,0 -6.5,4 -6.5,4 0,0 -2,-3 -6,-2 -3,6 6,10.5 6,10.5 v 7 z"
              style={{ fill: '#1e293b', stroke: '#f8fafc' }}
            />
            <path d="m 11.5,30 c 5.5,-2 15.5,-2 21,0 m -21,3.5 c 5.5,-2 15.5,-2 21,0 m -21,3.5 c 5.5,-2 15.5,-2 21,0" />
          </g>
        </svg>
      );
    default:
      return null;
  }
};
