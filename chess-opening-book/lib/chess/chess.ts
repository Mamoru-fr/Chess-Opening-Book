import { Chess, type Square } from "chess.js";

export const validateMove = (chess: Chess, move: { from: string; to: string }): boolean => {
  try {
    return chess.move(move) !== null;
  } catch (e) {
    return false;
  }
};

export const getLegalMoves = (chess: Chess, square: Square): string[] => {
  return chess.moves({ square, verbose: true }).map((m) => m.to);
};

export const resetBoard = (chess: Chess) => {
  chess.reset();
};