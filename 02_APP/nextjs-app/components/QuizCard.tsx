"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import clsx from "clsx";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Detection {
    label: string;
    confidence: number;
    box: [number, number, number, number];
    bin_color: string;
    advice: string;
}

export interface QuizResult {
    detection: Detection;
    userAnswer: string;
    correct: boolean;
    earnedXP: number;
}

// ─── Data ────────────────────────────────────────────────────────────────────

export const LABEL_FR: Record<string, string> = {
    PLASTIC: "Plastique",
    GLASS: "Verre",
    METAL: "Métal",
    CARDBOARD: "Carton",
    PAPER: "Papier",
    BIODEGRADABLE: "Biodéchet",
};

const BIN_OPTIONS = [
    {
        id: "yellow",
        label: "Poubelle Jaune",
        emoji: "🟡",
        description: "Emballages, plastiques, cartons, papier, métal",
        bgClass: "bg-amber-400 hover:bg-amber-300 border-amber-300",
        textClass: "text-amber-900",
    },
    {
        id: "green",
        label: "Poubelle Verte",
        emoji: "🟢",
        description: "Verre uniquement (bocaux, bouteilles, pots)",
        bgClass: "bg-emerald-500 hover:bg-emerald-400 border-emerald-400",
        textClass: "text-white",
    },
    {
        id: "gray",
        label: "Ordures Ménagères",
        emoji: "⚫",
        description: "Déchets non recyclables, restes alimentaires",
        bgClass: "bg-slate-600 hover:bg-slate-500 border-slate-400",
        textClass: "text-white",
    },
];

// bin_color normalization (API returns 'green', 'yellow', 'gray' or 'black')
function normalizeBin(bin: string): string {
    if (bin === "black") return "gray";
    return bin;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface QuizCardProps {
    detection: Detection;
    detectionCount?: number;  // Nombre d'objets du même type détectés
    questionNumber: number;
    totalQuestions: number;
    onAnswer: (result: QuizResult) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function QuizCard({ detection, detectionCount = 1, questionNumber, totalQuestions, onAnswer }: QuizCardProps) {
    const [answered, setAnswered] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);

    const labelFR = LABEL_FR[detection.label] ?? detection.label;
    const correctBin = normalizeBin(detection.bin_color);

    const handleAnswer = (binId: string) => {
        if (answered) return;

        const isCorrect = binId === correctBin;

        setAnswered(binId);
        setFeedback(isCorrect ? "correct" : "incorrect");

        // XP based on correctness + confidence
        let earnedXP = 0;
        if (isCorrect) {
            const conf = detection.confidence;
            earnedXP = conf >= 0.75 ? 10 : 5; // 40-74% → 5 XP, ≥75% → 10 XP
        }

        // Auto-advance after 2 seconds
        setTimeout(() => {
            onAnswer({ detection, userAnswer: binId, correct: isCorrect, earnedXP });
        }, 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="p-6 space-y-5"
        >
            {/* ── Progress Bar ── */}
            <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>Question {questionNumber} / {totalQuestions}</span>
                    <span>{questionNumber - 1} répondu{questionNumber > 2 ? "s" : ""}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-indigo-500 rounded-full"
                        initial={{ width: `${((questionNumber - 1) / totalQuestions) * 100}%` }}
                        animate={{ width: `${((questionNumber - 1) / totalQuestions) * 100}%` }}
                    />
                </div>
            </div>

            {/* ── Question ── */}
            <div className="bg-gradient-to-br from-indigo-50 to-slate-50 rounded-2xl p-5 border border-indigo-100 text-center space-y-2">
                <p className="text-xs text-indigo-500 font-bold uppercase tracking-widest">L'IA a détecté</p>
                <h3 className="text-3xl font-black text-slate-900">
                    {detectionCount > 1 && (
                        <span className="text-indigo-400 mr-1">{detectionCount}×</span>
                    )}
                    {labelFR}
                </h3>
                {detectionCount > 1 && (
                    <p className="text-xs text-indigo-400 font-semibold">
                        ({detectionCount} exemplaires sur l'image — une seule question !)
                    </p>
                )}
                <p className="text-sm text-slate-500 font-medium">
                    Dans quelle poubelle le jetez-vous ?
                </p>
                <div className="inline-block bg-white border border-indigo-100 rounded-full px-3 py-1 text-xs text-indigo-600 font-semibold mt-1">
                    Confiance IA : {(detection.confidence * 100).toFixed(0)}%
                </div>
            </div>

            {/* ── Boutons ou Feedback ── */}
            <AnimatePresence mode="wait">
                {!feedback ? (
                    <motion.div key="buttons" className="grid gap-3">
                        {BIN_OPTIONS.map((bin) => (
                            <motion.button
                                key={bin.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => handleAnswer(bin.id)}
                                className={clsx(
                                    "w-full p-4 rounded-xl border-2 font-bold transition-all flex items-center gap-4 cursor-pointer",
                                    bin.bgClass, bin.textClass
                                )}
                            >
                                <span className="text-3xl flex-shrink-0">{bin.emoji}</span>
                                <div className="text-left">
                                    <div className="text-sm font-bold">{bin.label}</div>
                                    <div className="text-xs opacity-75 font-normal">{bin.description}</div>
                                </div>
                            </motion.button>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="feedback"
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className={clsx(
                            "p-6 rounded-2xl border-2 text-center space-y-3",
                            feedback === "correct"
                                ? "bg-green-50 border-green-300"
                                : "bg-red-50 border-red-300"
                        )}
                    >
                        {feedback === "correct" ? (
                            <>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.1 }}
                                >
                                    <CheckCircle className="w-14 h-14 text-green-500 mx-auto" />
                                </motion.div>
                                <h4 className="text-xl font-black text-green-700">Bravo ! 🎉</h4>
                                <p className="text-sm text-green-600">C'est la bonne réponse !</p>
                                <div className="inline-block bg-green-100 border border-green-300 rounded-full px-4 py-1 text-green-800 font-black text-sm">
                                    +{detection.confidence >= 0.75 ? 10 : 5} XP gagnés !
                                </div>
                            </>
                        ) : (
                            <>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.1 }}
                                >
                                    <XCircle className="w-14 h-14 text-red-500 mx-auto" />
                                </motion.div>
                                <h4 className="text-xl font-black text-red-700">Pas tout à fait... 😅</h4>
                                <p className="text-sm text-red-600 leading-snug">
                                    {detection.advice}
                                </p>
                                <div className="inline-block bg-red-100 border border-red-200 rounded-full px-4 py-1 text-red-700 font-bold text-xs">
                                    0 XP — Réessayez la prochaine fois !
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
