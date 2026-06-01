import type { Square as ChessSquare } from "chess.js";

export type Square = ChessSquare;
export type Piece = {
  type: "p" | "n" | "b" | "r" | "q" | "k";
  color: "w" | "b";
};

export type Move = {
  from: Square;
  to: Square;
  promotion?: string;
};

export type Annotation = {
  arrows: Array<{ from: Square; to: Square; color: string }>;
  squares: Array<{ square: Square; color: string }>;
};