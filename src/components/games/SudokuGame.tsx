"use client";

import { useState, useEffect, useCallback } from "react";
import { getSudoku } from "sudoku-gen";

type Cell = {
  value: string;
  isGiven: boolean;
  isError: boolean;
};

type Difficulty = "easy" | "medium" | "hard" | "expert";

export default function SudokuGame() {
  const [board, setBoard] = useState<Cell[][]>([]);
  const [solutionStr, setSolutionStr] = useState<string>("");
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [isWon, setIsWon] = useState(false);

  const startNewGame = useCallback((diff: Difficulty = difficulty) => {
    const { puzzle, solution } = getSudoku(diff);
    setSolutionStr(solution);
    
    const newBoard: Cell[][] = Array(9).fill(null).map(() => Array(9).fill(null));
    for (let i = 0; i < 81; i++) {
      const row = Math.floor(i / 9);
      const col = i % 9;
      const char = puzzle[i];
      newBoard[row][col] = {
        value: char === "-" ? "" : char,
        isGiven: char !== "-",
        isError: false
      };
    }
    setBoard(newBoard);
    setIsWon(false);
    setSelectedCell(null);
  }, [difficulty]);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const validateBoard = (currentBoard: Cell[][]) => {
    let won = true;
    const updatedBoard = [...currentBoard];

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = updatedBoard[r][c];
        if (!cell.value) {
          won = false;
          cell.isError = false;
          continue;
        }
        
        // Comparer avec la solution
        const index = r * 9 + c;
        const correctValue = solutionStr[index];
        if (cell.value !== correctValue && !cell.isGiven) {
          cell.isError = true;
          won = false;
        } else {
          cell.isError = false;
        }
      }
    }
    setBoard(updatedBoard);
    setIsWon(won);
  };

  const handleInput = (value: string) => {
    if (!selectedCell || isWon) return;
    const [r, c] = selectedCell;
    const cell = board[r][c];
    
    if (cell.isGiven) return;

    const newBoard = board.map(row => row.map(col => ({ ...col })));
    newBoard[r][c].value = value === "Backspace" || value === "Delete" || value === "0" ? "" : value;
    
    // Auto-validate after a short delay or immediately (we do it immediately to show errors red)
    validateBoard(newBoard);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[1-9]$/.test(e.key)) {
        handleInput(e.key);
      } else if (e.key === "Backspace" || e.key === "Delete") {
        handleInput("");
      } else if (e.key === "ArrowUp" && selectedCell) {
        setSelectedCell([Math.max(0, selectedCell[0] - 1), selectedCell[1]]);
      } else if (e.key === "ArrowDown" && selectedCell) {
        setSelectedCell([Math.min(8, selectedCell[0] + 1), selectedCell[1]]);
      } else if (e.key === "ArrowLeft" && selectedCell) {
        setSelectedCell([selectedCell[0], Math.max(0, selectedCell[1] - 1)]);
      } else if (e.key === "ArrowRight" && selectedCell) {
        setSelectedCell([selectedCell[0], Math.min(8, selectedCell[1] + 1)]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCell, isWon, board]);

  if (board.length === 0) return <div>Chargement...</div>;

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", padding: "1rem", backgroundColor: "var(--background)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 900, margin: 0 }}>Sudoku</h2>
        <select 
          value={difficulty} 
          onChange={(e) => { setDifficulty(e.target.value as Difficulty); startNewGame(e.target.value as Difficulty); }}
          style={{ padding: "0.5rem", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--card-bg)" }}
        >
          <option value="easy">Facile</option>
          <option value="medium">Moyen</option>
          <option value="hard">Difficile</option>
          <option value="expert">Expert</option>
        </select>
      </div>

      {isWon && (
        <div style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "1rem", borderRadius: "8px", textAlign: "center", marginBottom: "1rem", fontWeight: "bold" }}>
          🎉 Félicitations ! Vous avez résolu cette grille !
        </div>
      )}

      <div 
        style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(9, 1fr)", 
          gap: "1px", 
          backgroundColor: "var(--border)",
          border: "2px solid var(--foreground)",
          marginBottom: "2rem",
          userSelect: "none"
        }}
      >
        {board.map((row, r) => (
          row.map((cell, c) => {
            const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
            const isSameNumber = cell.value && !isSelected && selectedCell && board[selectedCell[0]][selectedCell[1]].value === cell.value;
            const isRelated = selectedCell && (selectedCell[0] === r || selectedCell[1] === c || (Math.floor(selectedCell[0] / 3) === Math.floor(r / 3) && Math.floor(selectedCell[1] / 3) === Math.floor(c / 3)));
            
            // Calculer les bordures épaisses pour les blocs 3x3
            const borderRight = c % 3 === 2 && c !== 8 ? "2px solid var(--foreground)" : "none";
            const borderBottom = r % 3 === 2 && r !== 8 ? "2px solid var(--foreground)" : "none";

            let bgColor = "var(--card-bg)";
            if (isSelected) bgColor = "var(--primary-light, #bfdbfe)";
            else if (isSameNumber) bgColor = "var(--primary-light, #dbeafe)";
            else if (isRelated) bgColor = "#f1f5f9";

            let color = "var(--foreground)";
            if (cell.isGiven) color = "var(--foreground)";
            else if (cell.isError) color = "#ef4444";
            else color = "var(--primary)";

            return (
              <div 
                key={`${r}-${c}`}
                onClick={() => setSelectedCell([r, c])}
                style={{
                  aspectRatio: "1",
                  backgroundColor: bgColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "clamp(1rem, 5vw, 1.5rem)",
                  fontWeight: cell.isGiven ? 800 : (cell.value ? 600 : 400),
                  color: color,
                  cursor: cell.isGiven ? "default" : "pointer",
                  borderRight,
                  borderBottom,
                  transition: "background-color 0.1s"
                }}
              >
                {cell.value}
              </div>
            );
          })
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.5rem", marginBottom: "1rem" }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button 
            key={num}
            onClick={() => handleInput(num.toString())}
            style={{ 
              padding: "1rem 0", 
              fontSize: "1.2rem", 
              fontWeight: "bold", 
              backgroundColor: "var(--card-bg)", 
              border: "1px solid var(--border)", 
              borderRadius: "8px",
              cursor: "pointer",
              color: "var(--foreground)"
            }}
          >
            {num}
          </button>
        ))}
        <button 
          onClick={() => handleInput("")}
          style={{ 
            padding: "1rem 0", 
            fontSize: "1.2rem", 
            backgroundColor: "#fef2f2", 
            border: "1px solid #fca5a5", 
            borderRadius: "8px",
            cursor: "pointer",
            color: "#ef4444"
          }}
          title="Effacer"
        >
          ⌫
        </button>
      </div>

      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
        <button onClick={() => startNewGame()} className="btn btn-secondary" style={{ width: "100%" }}>Nouvelle grille</button>
      </div>
    </div>
  );
}
