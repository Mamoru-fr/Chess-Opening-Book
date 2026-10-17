import { Chess } from "chess.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let stockfish: any = null;
let initError = false;

// Only load stockfish on the client side
const isClient = typeof window !== "undefined";

export const initStockfish = async () => {
  if (!isClient || initError) return null;
  
  if (!stockfish) {
    try {
      // @ts-expect-error stockfish.wasm does not ship TypeScript declarations.
      // Dynamic import only happens in browser, not during SSR
      const { Stockfish } = await import("stockfish.wasm");
      stockfish = await Stockfish();
    } catch (e) {
      console.warn("Stockfish initialization failed. Analysis features will be limited.", e);
      initError = true;
      return null;
    }
  }
  return stockfish;
};

export const analyzePosition = async (fen: string, depth: number = 20) => {
  const sf = await initStockfish();
  if (!sf) return { bestMove: null, evaluation: 0 };
  
  try {
    sf.setFen(fen);
    sf.setDepth(depth);
    const result = await sf.calculateBestMove();
    return result;
  } catch (e) {
    console.warn("Analysis failed", e);
    return { bestMove: null, evaluation: 0 };
  }
};

export const getBestMove = async (chess: Chess) => {
  const fen = chess.fen();
  const result = await analyzePosition(fen);
  return result.bestMove;
};