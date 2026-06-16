"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

type Question = {
  id: string;
  question: string;
  options: string; // JSON string array
  answer: number;
};

type QuizProps = {
  id: string;
  questions: Question[];
};

export default function ArticleQuizWidget({ quiz }: { quiz: QuizProps }) {
  const { data: session } = useSession();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!quiz || !quiz.questions || quiz.questions.length === 0) return null;

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const options = JSON.parse(currentQuestion.options) as string[];

  const handleSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === currentQuestion.answer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = async () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      if (session) {
        setIsSubmitting(true);
        try {
          // Si le score est parfait, on donne des points
          const isPerfect = score + (selectedOption === currentQuestion.answer ? 1 : 0) === quiz.questions.length;
          await fetch("/api/quiz/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quizId: quiz.id, isPerfect }),
          });
        } catch (e) {
          console.error(e);
        } finally {
          setIsSubmitting(false);
        }
      }
    }
  };

  if (isFinished) {
    const isPerfect = score === quiz.questions.length;
    return (
      <div style={{ margin: "2rem 0", padding: "2rem", backgroundColor: isPerfect ? "#f0fdf4" : "#f8fafc", borderRadius: "12px", border: `1px solid ${isPerfect ? "#bbf7d0" : "var(--border)"}`, textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>{isPerfect ? "🏆" : "👍"}</div>
        <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
          Quiz terminé !
        </h3>
        <p style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
          Votre score : <strong>{score} / {quiz.questions.length}</strong>
        </p>
        {isPerfect ? (
          <p style={{ color: "#166534", fontWeight: "bold" }}>Félicitations ! Vous avez gagné 20 points de fidélité.</p>
        ) : (
          <p style={{ color: "var(--muted)" }}>Bien joué ! Relisez l'article pour essayer d'obtenir le score parfait la prochaine fois.</p>
        )}
      </div>
    );
  }

  return (
    <div style={{ margin: "3rem 0", padding: "2rem", backgroundColor: "var(--card-bg)", borderRadius: "12px", border: "1px solid var(--border)", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", margin: 0, color: "var(--foreground)" }}>🧠 Quiz de compréhension</h3>
        <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: "bold", backgroundColor: "#f1f5f9", padding: "0.2rem 0.6rem", borderRadius: "12px" }}>
          Question {currentQuestionIndex + 1} / {quiz.questions.length}
        </span>
      </div>

      <p style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1.5rem", lineHeight: 1.4 }}>
        {currentQuestion.question}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {options.map((option, index) => {
          let bgColor = "white";
          let borderColor = "var(--border)";
          let color = "var(--foreground)";

          if (isAnswered) {
            if (index === currentQuestion.answer) {
              bgColor = "#dcfce7";
              borderColor = "#22c55e";
              color = "#166534";
            } else if (index === selectedOption) {
              bgColor = "#fee2e2";
              borderColor = "#ef4444";
              color = "#991b1b";
            }
          } else if (selectedOption === index) {
            borderColor = "var(--primary)";
            bgColor = "#f8fafc";
          }

          return (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={isAnswered}
              style={{
                width: "100%",
                padding: "1rem",
                textAlign: "left",
                backgroundColor: bgColor,
                border: `2px solid ${borderColor}`,
                borderRadius: "8px",
                color,
                cursor: isAnswered ? "default" : "pointer",
                transition: "all 0.2s ease",
                fontWeight: isAnswered && (index === currentQuestion.answer || index === selectedOption) ? "bold" : "normal",
                display: "flex",
                justifyContent: "space-between"
              }}
            >
              <span>{option}</span>
              {isAnswered && index === currentQuestion.answer && <span>✓</span>}
              {isAnswered && index === selectedOption && index !== currentQuestion.answer && <span>✗</span>}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ opacity: isSubmitting ? 0.7 : 1 }}
          >
            {isSubmitting ? "Validation..." : (currentQuestionIndex < quiz.questions.length - 1 ? "Question suivante ➔" : "Voir mon score")}
          </button>
        </div>
      )}
    </div>
  );
}
