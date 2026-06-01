import { Chess } from "chess.js";

let stockfish: any = null;

export const initStockfish = async () => {
  if (!stockfish) {
    // @ts-expect-error stockfish.wasm does not ship TypeScript declarations.
    const { Stockfish } = await import("stockfish.wasm");
    stockfish = await Stockfish();
  }
  return stockfish;
};

export const analyzePosition = async (fen: string, depth: number = 20) => {
  const sf = await initStockfish();
  sf.setFen(fen);
  sf.setDepth(depth);
  const result = await sf.calculateBestMove();
  return result;
};

export const getBestMove = async (chess: Chess) => {
  const fen = chess.fen();
  const result = await analyzePosition(fen);
  return result.bestMove;
};