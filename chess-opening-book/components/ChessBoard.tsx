"use client";

import { useState } from "react";
import { Chess } from "chess.js";
import { Piece, Square } from "../types";

type BoardAnnotations = {
  arrows: Array<{ from: string; to: string; color: string }>;
  squares: Array<{ square: string; color: string }>;
};

type ChessBoardProps = {
  initialFen: string;
  size: number;
  annotations: BoardAnnotations;
  setAnnotations: (annotations: BoardAnnotations) => void;
  activeColor: string;
  onMovePlayed?: (san: string, fen: string) => void;
};

export default function ChessBoard({
  initialFen,
  size,
  annotations,
  setAnnotations,
  activeColor,
  onMovePlayed,
}: ChessBoardProps) {
  const [chess, setChess] = useState<Chess>(() => {
    try {
      return new Chess(initialFen);
    } catch {
      return new Chess();
    }
  });
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const [arrowStart, setArrowStart] = useState<Square | null>(null);

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

  const getPieceUnicode = (piece: Piece | null): string => {
    if (!piece) return "";
    const unicodePieces: Record<string, string> = {
      wp: "♙", wn: "♘", wb: "♗", wr: "♖", wq: "♕", wk: "♔",
      bp: "♟", bn: "♞", bb: "♝", br: "♜", bq: "♛", bk: "♚",
    };
    return unicodePieces[`${piece.color}${piece.type}`] || "";
  };

  const toggleSquareAnnotation = (square: Square) => {
    const exists = annotations.squares.some((s) => s.square === square);
    const squares = exists
      ? annotations.squares.filter((s) => s.square !== square)
      : [...annotations.squares, { square, color: activeColor }];
    setAnnotations({ ...annotations, squares });
  };

  const toggleArrowAnnotation = (from: Square, to: Square) => {
    const exists = annotations.arrows.some(
      (a) => a.from === from && a.to === to && a.color === activeColor
    );
    const arrows = exists
      ? annotations.arrows.filter((a) => !(a.from === from && a.to === to && a.color === activeColor))
      : [...annotations.arrows, { from, to, color: activeColor }];
    setAnnotations({ ...annotations, arrows });
  };

  const handleSquareClick = (square: Square, e: React.MouseEvent) => {
    if (e.altKey) {
      if (arrowStart) {
        toggleArrowAnnotation(arrowStart, square);
        setArrowStart(null);
      } else {
        setArrowStart(square);
      }
      return;
    }

    if (e.ctrlKey || e.metaKey) {
      toggleSquareAnnotation(square);
      return;
    }

    if (selectedSquare) {
      try {
        const nextChess = new Chess(chess.fen());
        const played = nextChess.move({ from: selectedSquare, to: square, promotion: "q" as const });
        setChess(nextChess);
        setSelectedSquare(null);
        setValidMoves([]);
        if (played?.san) {
          onMovePlayed?.(played.san, nextChess.fen());
        }
      } catch {
        setSelectedSquare(null);
        setValidMoves([]);
      }
      return;
    }

    const piece = chess.get(square);
    if (piece && piece.color === chess.turn()) {
      setSelectedSquare(square);
      const moves = chess.moves({ square, verbose: true }) as Array<{ to: Square }>;
      setValidMoves(moves.map((m) => m.to));
    }
  };

  const getSquareColor = (square: string) => {
    const file = square[0];
    const rank = parseInt(square[1], 10);
    const isLight = (file.charCodeAt(0) - 97 + rank) % 2 === 0;
    const highlight = annotations.squares.find((s) => s.square === square);

    if (highlight) {
      const colors: Record<string, string> = {
        green: "bg-green-500",
        red: "bg-red-500",
        blue: "bg-blue-500",
        yellow: "bg-yellow-400",
        purple: "bg-purple-500",
        orange: "bg-orange-500",
      };
      return colors[highlight.color] || (isLight ? "light" : "dark");
    }

    return isLight ? "light" : "dark";
  };

  return (
    <div className="chess-board relative overflow-hidden rounded-2xl" style={{ width: size, height: size }}>
      <div className="absolute left-2 top-2 z-10 rounded bg-black/50 px-2 py-1 text-xs text-white">
        Alt+Click: fleches | Ctrl/Cmd+Click: cases
      </div>

      {ranks.map((rank) =>
        files.map((file) => {
          const square = `${file}${rank}` as Square;
          const piece = chess.get(square) as Piece | null;
          const isSelected = selectedSquare === square;
          const isValidMove = validMoves.includes(square);

          return (
            <div
              key={square}
              className={`chess-square ${getSquareColor(square)} ${isSelected ? "ring-2 ring-yellow-400" : ""} ${isValidMove ? "highlight" : ""}`}
              style={{ width: size / 8, height: size / 8 }}
              onClick={(e) => handleSquareClick(square, e)}
              onContextMenu={(e) => e.preventDefault()}
            >
              {piece && (
                <span className="chess-piece text-4xl drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)]">
                  {getPieceUnicode(piece)}
                </span>
              )}
            </div>
          );
        })
      )}

      <svg className="absolute left-0 top-0 h-full w-full pointer-events-none" style={{ width: size, height: size }}>
        {annotations.arrows.map((arrow, index) => {
          const fromFile = arrow.from[0];
          const fromRank = parseInt(arrow.from[1], 10);
          const toFile = arrow.to[0];
          const toRank = parseInt(arrow.to[1], 10);

          const fromX = (fromFile.charCodeAt(0) - 97) * (size / 8) + size / 16;
          const fromY = (8 - fromRank) * (size / 8) - size / 16;
          const toX = (toFile.charCodeAt(0) - 97) * (size / 8) + size / 16;
          const toY = (8 - toRank) * (size / 8) - size / 16;

          const colorMap: Record<string, string> = {
            green: "#4caf50",
            red: "#f44336",
            blue: "#2196f3",
            yellow: "#ffeb3b",
            purple: "#9c27b0",
            orange: "#fb923c",
          };

          return (
            <g key={`arrow-${index}`}>
              <defs>
                <marker id={`arrowhead-${index}`} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill={colorMap[arrow.color] || "#ffffff"} />
                </marker>
              </defs>
              <line
                x1={fromX}
                y1={fromY}
                x2={toX}
                y2={toY}
                stroke={colorMap[arrow.color] || "#ffffff"}
                strokeWidth="4"
                markerEnd={`url(#arrowhead-${index})`}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}