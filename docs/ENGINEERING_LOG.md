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

