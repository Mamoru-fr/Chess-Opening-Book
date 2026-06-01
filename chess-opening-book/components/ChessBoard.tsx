"use client";

import { useState, useEffect, useRef } from "react";
import { Chess } from "chess.js";
import { Piece, Square } from "../types";

type ChessBoardProps = {
  chess: Chess;
  size: number;
  annotations: {
    arrows: Array<{ from: string; to: string; color: string }>;
    squares: Array<{ square: string; color: string }>;
  };
  setAnnotations: (annotations: any) => void;
  selectedNode: string | null;
};

export default function ChessBoard({
  chess,
  size,
  annotations,
  setAnnotations,
  selectedNode,
}: ChessBoardProps) {
  const internalChessRef = useRef<Chess | null>(null);
  const activeChess = (chess && typeof (chess as any).get === "function")
    ? chess
    : (internalChessRef.current ?? (internalChessRef.current = new Chess()));

  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const boardRef = useRef<HTMLDivElement>(null);

  // debug: log current FEN to help diagnose missing pieces
  useEffect(() => {
    try {
      // eslint-disable-next-line no-console
      console.log("Chess FEN:", (activeChess as any).fen());
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log("Chess fen error", e);
    }
  }, [activeChess]);

  // debug: expose piece objects on window for inspection
  useEffect(() => {
    try {
      const map: Record<string, any> = {};
      for (const r of ranks) {
        for (const f of files) {
          const sq = `${f}${r}` as Square;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (map as any)[sq] = (activeChess as any).get(sq);
        }
      }
      // eslint-disable-next-line no-undef, no-inner-declarations
      // @ts-ignore
      (window as any).__boardPieces = map;
    } catch (e) {
      // ignore
    }
  }, [activeChess]);

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

  const getPieceUnicode = (piece: Piece | null): string => {
    if (!piece) return "";
    const unicodePieces: Record<string, string> = {
      wp: "♙", wn: "♘", wb: "♗", wr: "♖", wq: "♕", wk: "♔",
      bp: "♟", bn: "♞", bb: "♝", br: "♜", bq: "♛", bk: "♚",
    };
    try {
      const colorRaw = String((piece as any).color || "");
      const typeRaw = String((piece as any).type || "");
      const colorChar = colorRaw.length ? (colorRaw[0].toLowerCase() === "w" ? "w" : "b") : "w";
      const t = typeRaw.toLowerCase();
      let typeChar = "";
      if (t.startsWith("p")) typeChar = "p";
      else if (t.startsWith("n") || t.startsWith("kn")) typeChar = "n";
      else if (t.startsWith("b")) typeChar = "b";
      else if (t.startsWith("r")) typeChar = "r";
      else if (t.startsWith("q")) typeChar = "q";
      else if (t.startsWith("k")) typeChar = "k";
      const key = `${colorChar}${typeChar}`;
      return unicodePieces[key] || "";
    } catch (e) {
      return "";
    }
  };

  const handleSquareClick = (square: Square) => {
    if (selectedSquare) {
      const move = { from: selectedSquare, to: square, promotion: "q" };
      try {
        (activeChess as any).move(move);
        setSelectedSquare(null);
        setValidMoves([]);
      } catch (e) {
        setSelectedSquare(null);
        setValidMoves([]);
      }
    } else {
      const piece = (activeChess as any).get(square);
      if (piece && piece.color === (activeChess as any).turn()) {
        setSelectedSquare(square);
        const moves = (activeChess as any).moves({ square, verbose: true }) as any[];
        setValidMoves(moves.map((m) => m.to));
      }
    }
  };

  const handleSquareRightClick = (e: React.MouseEvent, square: Square) => {
    e.preventDefault();
    const color = prompt("Choisir une couleur (green/red/blue/yellow/purple):");
    if (color && ["green", "red", "blue", "yellow", "purple"].includes(color)) {
      const newSquares = [...annotations.squares, { square, color }];
      setAnnotations({ ...annotations, squares: newSquares });
    }
  };

  const handleBoardClick = (e: React.MouseEvent) => {
    if (e.altKey) {
      const rect = boardRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const squareSize = size / 8;
      const file = Math.floor(x / squareSize);
      const rank = 7 - Math.floor(y / squareSize);

      if (file >= 0 && file < 8 && rank >= 0 && rank < 8) {
        const square = `${files[file]}${ranks[rank]}` as Square;
        if (selectedSquare) {
          const color = prompt("Choisir une couleur pour la flèche (green/red/blue/yellow/purple):");
          if (color && ["green", "red", "blue", "yellow", "purple"].includes(color)) {
            const newArrows = [...annotations.arrows, { from: selectedSquare, to: square, color }];
            setAnnotations({ ...annotations, arrows: newArrows });
            setSelectedSquare(null);
          }
        } else {
          setSelectedSquare(square);
        }
      }
    }
  };

  const isSquareHighlighted = (square: string) => {
    return annotations.squares.some((s) => s.square === square);
  };

  const getSquareColor = (square: string) => {
    const file = square[0];
    const rank = parseInt(square[1]);
    const isLight = (file.charCodeAt(0) - 97 + rank) % 2 === 0;
    const highlighted = isSquareHighlighted(square);
    const highlightedColor = annotations.squares.find((s) => s.square === square)?.color;

    if (highlighted && highlightedColor) {
      return `bg-chess-${highlightedColor}`;
    }
    return isLight ? "bg-chess-light" : "bg-chess-dark";
  };

  const isArrowBetween = (from: string, to: string) => {
    return annotations.arrows.some(
      (arrow) =>
        (arrow.from === from && arrow.to === to) ||
        (arrow.from === to && arrow.to === from)
    );
  };

  const getArrowColor = (from: string, to: string) => {
    const arrow = annotations.arrows.find(
      (a) => (a.from === from && a.to === to) || (a.from === to && a.to === from)
    );
    return arrow ? arrow.color : "";
  };

  return (
    <div
      ref={boardRef}
      className="chess-board relative overflow-hidden rounded-2xl"
      style={{ width: size, height: size }}
      onClick={handleBoardClick}
    >
      {ranks.map((rank) =>
        files.map((file) => {
          const square = `${file}${rank}` as Square;
          const piece = (activeChess as any).get(square);
          const isSelected = selectedSquare === square;
          const isValidMove = validMoves.includes(square);
          const isHighlighted = isSquareHighlighted(square);

          return (
            <div
              key={square}
              className={`chess-square ${getSquareColor(square)} ${
                isSelected ? "ring-2 ring-yellow-400" : ""
              } ${isValidMove ? "bg-chess-highlight" : ""}`}
              style={{ width: size / 8, height: size / 8 }}
              onClick={() => handleSquareClick(square)}
              onContextMenu={(e) => handleSquareRightClick(e, square)}
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

      {/* Dessiner les flèches */}
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{ width: size, height: size }}
      >
        {annotations.arrows.map((arrow, index) => {
          const fromFile = arrow.from[0];
          const fromRank = parseInt(arrow.from[1]);
          const toFile = arrow.to[0];
          const toRank = parseInt(arrow.to[1]);

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
          };

          return (
            <defs key={`arrow-def-${index}`}>
              <marker
                id={`arrowhead-${index}`}
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill={colorMap[arrow.color] || "#ffffff"}
                />
              </marker>
            </defs>
          );
        })}

        {annotations.arrows.map((arrow, index) => {
          const fromFile = arrow.from[0];
          const fromRank = parseInt(arrow.from[1]);
          const toFile = arrow.to[0];
          const toRank = parseInt(arrow.to[1]);

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
          };

          return (
            <line
              key={`arrow-${index}`}
              x1={fromX}
              y1={fromY}
              x2={toX}
              y2={toY}
              stroke={colorMap[arrow.color] || "#ffffff"}
              strokeWidth="4"
              markerEnd={`url(#arrowhead-${index})`}
            />
          );
        })}
      </svg>
    </div>
  );
}