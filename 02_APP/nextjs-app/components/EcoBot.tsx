"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit3, Check, X, Zap } from "lucide-react";
import clsx from "clsx";

// ─── Config by level ─────────────────────────────────────────────────────────

interface BotConfig {
    gradient: string;
    glowColor: string;
    faceEmoji: string;
    title: string;
    titleColor: string;
    borderColor: string;
    idleMessages: string[];
}

function getBotConfig(level: number, name: string): BotConfig {
    if (level <= 2) return {
        gradient: "from-slate-700 via-slate-800 to-slate-900",
        glowColor: "rgba(100,116,139,0.4)",
        faceEmoji: "😔",
        title: "Abîmé",
        titleColor: "text-slate-400",
        borderColor: "border-slate-600",
        idleMessages: [
            `Je suis abîmé... Aidez-moi à guérir 🔧`,
            "Chaque scan me redonne un peu d'énergie...",
            "J'ai besoin de toi pour survivre...",
            "Scan... scan... s'il te plaît...",
        ],
    };
    if (level <= 5) return {
        gradient: "from-orange-600 via-amber-600 to-orange-700",
        glowColor: "rgba(245,158,11,0.45)",
        faceEmoji: "🔧",
        title: "En réparation",
        titleColor: "text-amber-400",
        borderColor: "border-amber-500",
        idleMessages: [
            `Je me répare ! Encore quelques scans... ⚙️`,
            "Je sens que je redeviens normal !",
            `Tu es un bon réparateur, ${name} !`,
            "Presque opérationnel... je le sens !",
        ],
    };
    if (level <= 10) return {
        gradient: "from-cyan-500 via-teal-600 to-cyan-700",
        glowColor: "rgba(20,184,166,0.5)",
        faceEmoji: "😊",
        title: "Opérationnel",
        titleColor: "text-cyan-400",
        borderColor: "border-cyan-400",
        idleMessages: [
            `En pleine forme ! On recycle TOUT ! ♻️`,
            `${name}, ensemble on sauve la planète !`,
            "Chaque geste compte. Je le sais maintenant.",
            "La Terre me remercie et je t'en remercie !",
        ],
    };
    if (level <= 20) return {
        gradient: "from-violet-600 via-purple-700 to-indigo-800",
        glowColor: "rgba(139,92,246,0.6)",
        faceEmoji: "😎",
        title: "Expert",
        titleColor: "text-violet-300",
        borderColor: "border-violet-400",
        idleMessages: [
            `Puissance maximale ! 💜 On est invincibles !`,
            `${name}, tu es une légende du tri !`,
            "Les molécules recyclées chantent pour toi.",
            "Niveau EXPERT. Respect. 🫡",
        ],
    };
    return {
        gradient: "from-yellow-400 via-rose-500 to-purple-600",
        glowColor: "rgba(236,72,153,0.7)",
        faceEmoji: "🌟",
        title: "Légendaire",
        titleColor: "text-pink-300",
        borderColor: "border-pink-400",
        idleMessages: [
            `LÉGENDE ABSOLUE ! 🌍 Je suis... parfait.`,
            `${name}, tu es LE MAÎTRE du recyclage !`,
            "La planète entière te chante une ode.",
            "On a atteint le summum. Ensemble. 🏆",
        ],
    };
}

function getEventMessage(event: EcoBotEvent, botName: string): string {
    switch (event) {
        case "welcome": return `Content de te voir, ${botName} ! 👋`;
        case "correct": return "Excellent ! On devient imbattables ! 🎯";
        case "wrong": return "Pas grave, on apprend ensemble ! 💪";
        case "scan": return "Je sens un nouveau déchet... 🔍";
        case "save": return "Scan sauvegardé ! +XP pour toi ! ⚡";
        default: return "";
    }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type EcoBotEvent = "welcome" | "correct" | "wrong" | "scan" | "save" | null;

interface EcoBotProps {
    level: number;
    totalScans: number;
    initialBotName: string;
    event?: EcoBotEvent;
    /** If true, show the name edit feature */
    editable?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EcoBot({ level, totalScans, initialBotName, event = null, editable = false }: EcoBotProps) {
    const [botName, setBotName] = useState(initialBotName ?? "Éco-Bot");
    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput] = useState(botName);
    const [savingName, setSavingName] = useState(false);
    const [dialogue, setDialogue] = useState<string>("");
    const [showDialogue, setShowDialogue] = useState(false);
    const [showFirstVisit, setShowFirstVisit] = useState(false);

    const config = getBotConfig(level, botName);

    // ── Dialogue system ──────────────────────────────────────────────────────
    const showMessage = useCallback((msg: string, durationMs = 3500) => {
        setDialogue(msg);
        setShowDialogue(true);
        const t = setTimeout(() => setShowDialogue(false), durationMs);
        return () => clearTimeout(t);
    }, []);

    // React to external events (quiz correct/wrong/etc)
    useEffect(() => {
        if (event) {
            showMessage(getEventMessage(event, botName), 3000);
        }
    }, [event, botName, showMessage]);

    // Welcome message on first render
    useEffect(() => {
        const timer = setTimeout(() => {
            showMessage(`Content de te voir, ${botName} ! 👋`, 4000);
        }, 800);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Idle messages every 8 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (!showDialogue) {
                const msgs = config.idleMessages;
                const msg = msgs[Math.floor(Math.random() * msgs.length)];
                showMessage(msg, 3500);
            }
        }, 8000);
        return () => clearInterval(interval);
    }, [config.idleMessages, showDialogue, showMessage]);

    // First visit detection (no custom name set)
    useEffect(() => {
        if (initialBotName === "Éco-Bot" && editable) {
            const timer = setTimeout(() => setShowFirstVisit(true), 4500);
            return () => clearTimeout(timer);
        }
    }, [initialBotName, editable]);

    // ── Name saving ─────────────────────────────────────────────────────────
    const saveNewName = async () => {
        if (!nameInput.trim() || nameInput === botName) {
            setEditingName(false);
            return;
        }
        setSavingName(true);
        try {
            const res = await fetch("/api/bot", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ botName: nameInput.trim() }),
            });
            if (res.ok) {
                const data = await res.json();
                setBotName(data.botName);
                setEditingName(false);
                showMessage(`Super ! Je m'appelle maintenant "${data.botName}" ! 🎉`, 4000);
            }
        } finally {
            setSavingName(false);
        }
    };

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col items-center gap-4 select-none">

            {/* ── Dialogue Bubble ── */}
            <div className="relative min-h-[44px] flex items-end justify-center w-full">
                <AnimatePresence>
                    {showDialogue && (
                        <motion.div
                            key={dialogue}
                            initial={{ opacity: 0, y: 8, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 400, damping: 28 }}
                            className="bg-white/90 backdrop-blur-sm border border-slate-200 shadow-lg rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm font-medium text-slate-700 max-w-[240px] text-center"
                        >
                            {dialogue}
                            {/* Bubble tail */}
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white/90" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Robot Body ── */}
            <div className="relative">
                {/* Glow effect */}
                <div
                    className="absolute inset-0 rounded-3xl blur-2xl opacity-60 scale-110"
                    style={{ background: `radial-gradient(circle, ${config.glowColor}, transparent 70%)` }}
                />

                {/* Floating animation */}
                <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="relative"
                >
                    {/* Antenna */}
                    <div className="flex justify-center mb-1">
                        <div className="w-1 h-4 bg-slate-400 rounded-full" />
                        <div className="absolute -mt-1">
                            <motion.div
                                animate={{ scale: [1, 1.4, 1] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                className={clsx(
                                    "w-3 h-3 rounded-full -mt-2",
                                    level > 10 ? "bg-violet-400" : level > 5 ? "bg-cyan-400" : "bg-slate-400"
                                )}
                            />
                        </div>
                    </div>

                    {/* Head */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className={clsx(
                            "relative w-28 h-28 rounded-3xl border-2 bg-gradient-to-br flex flex-col items-center justify-center gap-1 shadow-2xl cursor-pointer",
                            config.gradient, config.borderColor
                        )}
                        style={{ boxShadow: `0 0 30px ${config.glowColor}` }}
                        onClick={() => showMessage(config.idleMessages[Math.floor(Math.random() * config.idleMessages.length)], 3000)}
                    >
                        {/* Screen scanlines effect */}
                        <div className="absolute inset-0 rounded-3xl overflow-hidden opacity-10">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="w-full h-px bg-white mb-3" />
                            ))}
                        </div>

                        {/* Face */}
                        <div className="text-4xl z-10 drop-shadow-lg">
                            {config.faceEmoji}
                        </div>

                        {/* Level badge on corner */}
                        <div className="absolute -top-2 -right-2 bg-white text-slate-900 font-black text-[10px] w-6 h-6 rounded-full flex items-center justify-center shadow-md border border-slate-200">
                            {level}
                        </div>

                        {/* XP scan count */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20 whitespace-nowrap">
                            <Zap className="w-2.5 h-2.5 text-yellow-400" />
                            {totalScans} scan{totalScans > 1 ? "s" : ""}
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* ── Name + Status ── */}
            <div className="text-center space-y-1">
                {/* Evolution status */}
                <p className={clsx("text-xs font-bold uppercase tracking-widest", config.titleColor)}>
                    {config.title}
                </p>

                {/* Name display / edit */}
                {editingName ? (
                    <div className="flex items-center gap-1">
                        <input
                            autoFocus
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") saveNewName(); if (e.key === "Escape") setEditingName(false); }}
                            maxLength={20}
                            className="text-center font-bold text-white bg-white/10 border border-white/30 rounded-lg px-2 py-1 text-sm w-32 focus:outline-none focus:border-white/60"
                            placeholder="Nom du bot..."
                        />
                        <button onClick={saveNewName} disabled={savingName} className="text-green-400 hover:text-green-300">
                            <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingName(false)} className="text-red-400 hover:text-red-300">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-1.5 group">
                        <p className="text-white font-black text-lg">{botName}</p>
                        {editable && (
                            <button
                                onClick={() => { setNameInput(botName); setEditingName(true); }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ── First visit prompt ── */}
            <AnimatePresence>
                {showFirstVisit && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-indigo-900/80 border border-indigo-500/50 rounded-xl p-3 text-center space-y-2 max-w-[200px]"
                    >
                        <p className="text-xs text-indigo-200 font-medium">Je n'ai pas encore de nom !<br />Donne-m'en un ✏️</p>
                        <button
                            onClick={() => { setShowFirstVisit(false); setNameInput(""); setEditingName(true); }}
                            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1 rounded-lg transition-colors"
                        >
                            Me nommer !
                        </button>
                        <button onClick={() => setShowFirstVisit(false)} className="block text-[10px] text-slate-500 hover:text-slate-400 mx-auto">
                            Plus tard
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
