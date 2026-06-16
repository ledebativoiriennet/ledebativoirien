import SudokuGame from "@/components/games/SudokuGame";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sudoku | Le Débat Ivoirien",
  description: "Jouez au Sudoku gratuitement sur Le Débat Ivoirien. Entraînez votre cerveau avec nos grilles illimitées.",
};

export default function SudokuPage() {
  return (
    <div className="portal-container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 className="portal-section-title" style={{ display: "inline-block", fontSize: "2.5rem", borderBottom: "4px solid var(--primary)" }}>
          🧩 Sudoku
        </h1>
        <p style={{ color: "var(--muted)", maxWidth: "600px", margin: "1rem auto 0", fontSize: "1.1rem" }}>
          Un moment de détente ou un défi intellectuel ? Choisissez votre difficulté et complétez la grille. Les nombres de 1 à 9 ne peuvent apparaître qu'une seule fois par ligne, par colonne et par carré.
        </p>
      </div>

      <SudokuGame />
    </div>
  );
}
