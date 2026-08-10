# ChessPlatform Engineering Journal & Research Log

This document tracks foundational research, architecture decisions, engine algorithms, and protocol specifications.

## 2026-07-01 (Part 1)
- Initialized core chess engine architectural specification.
- Defined 64-square zero-indexed mailbox coordinate mapping (0 = A1, 63 = H8).

## 2026-07-01 (Part 2)
- Explored 64-bit unsigned integer (UInt64) bitboard representations.
- Computed file masks (File A to File H) and rank masks (Rank 1 to Rank 8).

## 2026-07-02 (Part 1)
- Formalized Forsyth-Edwards Notation (FEN) format specification.
- Structured tokenizer grammar for piece placement, active color, castling, en-passant, halfmove, and fullmove numbers.

## 2026-07-02 (Part 2)
- Documented validation bounds for rank counts, square occupancy sums, and invalid pawn ranks (1 and 8).

## 2026-07-03
- Generated precomputed lookup tables for knight leaps (8 directions) and king steps (8 directions).
- Verified boundary wrap-around safety on A-file and H-file.

## 2026-07-04
- Specified raycast attack vectors for orthogonal (Rook) and diagonal (Bishop) sliders.
- Outlined queen attacks as union of orthogonal and diagonal attack sets.

## 2026-07-06 (Part 1)
- Documented king-side and queen-side castling prerequisites.
- Structured transit square safety checks: king cannot castle out of, through, or into check.

## 2026-07-06 (Part 2)
- Documented tracking of rook initial movements and capture-induced castling rights revocation.

## 2026-07-07 (Part 1)
- Formalized en-passant target square assignment on double-pawn push.
- Documented single-ply expiration policy for en-passant targets.

## 2026-07-07 (Part 2)
- Documented rare discovered check scenario where capturing pawn and captured pawn leave 4th/5th rank open to sliding enemy rook.

## 2026-07-08
- Specified pawn advancement to 8th rank (White) or 1st rank (Black).
- Defined candidate promotion pieces: Queen, Rook, Bishop, Knight with tactical underpromotion justifications.

## 2026-07-09 (Part 1)
- Detailed pin detection algorithm using raycasts between king and attacking sliding pieces.
- Implemented legal move filtering restricting pinned pieces along ray of pin.

## 2026-07-09 (Part 2)
- Verified that double-check forces king evasion: no other piece can block two disparate check angles simultaneously.

## 2026-07-10 (Part 1)
- Formalized termination logic: 0 legal moves + in check = Checkmate; 0 legal moves + not in check = Stalemate.

## 2026-07-10 (Part 2)
- Specified FIDE insufficient material rules: K vs K, K+B vs K, K+N vs K, K+B vs K+B (same colored bishops).

## 2026-07-12
- Designed position history buffer comparing board hash, castling rights, and en-passant availability across game tree.

## 2026-07-13 (Part 1)
- Outlined half-move clock counter reset conditions: pawn advance or any piece capture.

## 2026-07-13 (Part 2)
- Documented strict non-claim automatic draw rules per updated FIDE guidelines (75-move and 5-fold repetition).

## 2026-07-14
- Formulated zero-sum two-player game tree evaluation using recursive minimax algorithm.
- Outlined score perspective inversion (negamax formulation).

## 2026-07-15 (Part 1)
- Derived alpha-beta cutoff invariants (beta cutoffs when score >= beta).
- Documented best-case time complexity reduction from O(b^d) to O(b^(d/2)).

## 2026-07-15 (Part 2)
- Contrasted fail-hard vs fail-soft implementations and recorded accuracy advantages of returning unconstrained scores.

## 2026-07-16 (Part 1)
- Formulated Most Valuable Victim - Least Valuable Attacker (MVV-LVA) ranking matrix.
- Prioritized captures by (VictimValue * 10 - AttackerValue).

## 2026-07-16 (Part 2)
- Outlined two killer move slots per ply for quiet moves causing beta cutoffs.
- Structured history heuristic weighting based on ply depth squared.

## 2026-07-17
- Specified quiescence search algorithm extending tactical capture sequences until a quiet position is reached.
- Integrated standing pat evaluation as alpha lower bound.

## 2026-07-18
- Defined piece-square tables for Pawns, Knights, Bishops, Rooks, Queens, and King.
- Separated opening/middlegame tables from endgame tables.

## 2026-07-20 (Part 1)
- Defined penalty calculations for doubled pawns and isolated pawns lacking neighboring file support.

## 2026-07-20 (Part 2)
- Structured progressive bonuses for passed pawns based on rank advancement and proximity to friendly king.

## 2026-07-21 (Part 1)
- Documented king shield penalty for missing f, g, h pawns after castling.
- Analyzed semi-open and open file penalties against enemy rooks.

## 2026-07-21 (Part 2)
- Computed attacking piece weights around the king zone (ring of 8 squares) to predict mating attacks.

## 2026-07-22
- Formulated safe square destination count bonuses for knights and bishops.
- Added occupancy incentives for central squares (d4, d5, e4, e5).

## 2026-07-23 (Part 1)
- Computed dynamic game phase value (0 = pure endgame, 24 = opening) using non-pawn material counts.
- Implemented tapered evaluation: eval = (mg_eval * phase + eg_eval * (24 - phase)) / 24.

## 2026-07-23 (Part 2)
- Documented +35 to +50 centipawn bonus for holding both bishops.
- Structured penalty for bishop hindered by friendly pawns locked on same color.

## 2026-07-24 (Part 1)
- Generated 64x12 pseudo-random 64-bit keys for pieces on squares.
- Added random keys for side-to-move, 4 castling rights, and 8 en-passant files.

## 2026-07-24 (Part 2)
- Verified constant time O(1) hash recalculation per move: hash ^= PieceKey(from) ^ PieceKey(to).

## 2026-07-27 (Part 1)
- Structured 16-byte TT entry: 64-bit key, 16-bit score, 16-bit bestMove, 8-bit depth, 8-bit node flag (Exact, LowerBound, UpperBound), 8-bit age.

## 2026-07-27 (Part 2)
- Specified mate score normalization (mate_score +/- ply) to keep evaluation valid across differing search depths.

## 2026-07-28
- Outlined iterative deepening search from depth 1 to maximum target depth.
- Structured time check interrupt checking elapsed time vs budgeted move time.

## 2026-07-29 (Part 1)
- Formulated zero-window null window search [alpha, alpha + 1] for non-PV nodes.
- Outlined null move heuristic with reduction factor R = 2 or R = 3 (avoiding zugzwang in endgames).

## 2026-07-29 (Part 2)
- Structured logarithmic reduction formula for quiet moves ordered late in the move list.

## 2026-07-31
- Documented standard benchmark positions (Initial position, Kiwipete, Silver Suite).
- Set baseline NPS (nodes per second) target across evaluation kernels.

## 2026-08-01
- Formalized Seven Tag Roster (Event, Site, Date, Round, White, Black, Result).
- Structured SAN (Standard Algebraic Notation) move serialization format.

## 2026-08-03 (Part 1)
- Structured disambiguation precedence: file letter first, rank number second, both if necessary (e.g., Rad1, R1d1, Qh4e1).

## 2026-08-03 (Part 2)
- Documented NAG standards ($1 = !, $2 = ?, $3 = !!, $4 = ??, $14 = White slight advantage).

## 2026-08-04 (Part 1)
- Formulated Fischer increment (time added before or after turn).
- Documented USCF Bronstein delay and simple delay mechanics.

## 2026-08-04 (Part 2)
- Designed server-side timestamp validation buffer (up to 200ms grace period for network jitter).

## 2026-08-05
- Structured Elo rating formula: Expected = 1 / (1 + 10^((R_opponent - R_player)/400)).
- Outlined dynamic K-factor assignment (K=40 for new players, K=20 for regular, K=10 for master level).

## 2026-08-06 (Part 1)
- Documented Glicko-2 RD inflation over player inactivity periods.

## 2026-08-06 (Part 2)
- Designed matchmaking pool expansion algorithm: initial +/- 50 Elo, expanding by 25 Elo every 5 seconds up to +/- 250.

## 2026-08-07 (Part 1)
- Outlined client-to-hub SignalR methods: JoinGame, MakeMove, OfferDraw, Resign, SyncClock.

## 2026-08-07 (Part 2)
- Formulated Hub-to-client events: MoveExecuted, ClockTicked, DrawOffered, GameConcluded, PlayerReconnected.

## 2026-08-09
- Outlined Centipawn Loss (ACPL) computation comparing player moves against Stockfish top-engine choices.

## 2026-08-10 (Part 1)
- Documented statistical variance metrics: human players deliberate on critical moves; engine users exhibit flat standard deviations.

