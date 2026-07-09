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

