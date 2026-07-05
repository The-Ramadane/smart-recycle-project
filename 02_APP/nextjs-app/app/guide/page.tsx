"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, BookOpen, ArrowLeft, Leaf } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { WASTE_DATABASE, ALL_CATEGORIES, BIN_CONFIG, WasteCategory, WasteItem } from "@/lib/memotri-data";

// ─── Search + Filter logic ─────────────────────────────────────────────────

function filterItems(query: string, category: WasteCategory | "Tout"): WasteItem[] {
    const q = query.toLowerCase().trim();
    return WASTE_DATABASE.filter((item) => {
        const matchCat = category === "Tout" || item.category === category;
        if (!matchCat) return false;
        if (!q) return true;
        return (
            item.name.toLowerCase().includes(q) ||
            item.keywords.some((k) => k.includes(q)) ||
            item.advice.toLowerCase().includes(q)
        );
    });
}

// ─── Card ──────────────────────────────────────────────────────────────────

function WasteCard({ item, index }: { item: WasteItem; index: number }) {
    const bin = BIN_CONFIG[item.bin];
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
            className="bg-white/70 backdrop-blur-sm border border-white/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex gap-4 group"
        >
            {/* Colored left accent */}
            <div className={clsx("w-1 rounded-full flex-shrink-0", bin.dot)} />

            {/* Icon */}
            <div className="text-3xl flex-shrink-0 leading-none pt-0.5">{item.icon}</div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{item.name}</h3>
                    <span className={clsx(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap",
                        bin.color, bin.bg, bin.border
                    )}>
                        {bin.label}
                    </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{item.advice}</p>
            </div>
        </motion.div>
    );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function GuidePage() {
    const [query, setQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<WasteCategory | "Tout">("Tout");

    const results = useMemo(
        () => filterItems(query, activeCategory),
        [query, activeCategory]
    );

    return (
        <main className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white">

            {/* ── Header ── */}
            <div className="relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-20 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
                    <div className="absolute -top-10 right-10 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-2xl mx-auto px-4 pt-10 pb-8 space-y-6">
                    {/* Back link */}
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Retour au scanner
                    </Link>

                    {/* Title */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black tracking-tight">Mémo<span className="text-emerald-400">tri</span></h1>
                                <p className="text-slate-400 text-sm">L'encyclopédie du tri — {WASTE_DATABASE.length} déchets répertoriés</p>
                            </div>
                        </div>
                    </div>

                    {/* ── Search Bar ── */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Rechercher un déchet... (bouteille, pile, carton...)"
                            className="w-full bg-white/10 border border-white/20 rounded-2xl pl-12 pr-12 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400/60 focus:bg-white/15 transition-all text-sm"
                            autoFocus
                        />
                        {query && (
                            <button
                                onClick={() => setQuery("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* ── Category Filters ── */}
                    <div className="flex flex-wrap gap-2">
                        {(["Tout", ...ALL_CATEGORIES] as const).map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat as WasteCategory | "Tout")}
                                className={clsx(
                                    "text-xs font-semibold px-3 py-1.5 rounded-full border transition-all",
                                    activeCategory === cat
                                        ? "bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/25"
                                        : "bg-white/5 border-white/20 text-slate-400 hover:bg-white/10 hover:text-white"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Results ── */}
            <div className="max-w-2xl mx-auto px-4 pb-16">

                {/* Results count */}
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs text-slate-500 font-mono">
                        {results.length} résultat{results.length > 1 ? "s" : ""}
                        {query && <span> pour « <span className="text-emerald-400">{query}</span> »</span>}
                    </p>
                    {activeCategory !== "Tout" && (
                        <button
                            onClick={() => setActiveCategory("Tout")}
                            className="text-xs text-slate-500 hover:text-emerald-400 transition-colors"
                        >
                            ✕ Effacer le filtre
                        </button>
                    )}
                </div>

                {/* Cards */}
                <AnimatePresence mode="popLayout">
                    {results.length > 0 ? (
                        <motion.div className="grid gap-3">
                            {results.map((item, i) => (
                                <WasteCard key={item.id} item={item} index={i} />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20 space-y-4"
                        >
                            <div className="text-6xl">🤷</div>
                            <h3 className="text-lg font-bold text-slate-300">Déchet non répertorié</h3>
                            <p className="text-sm text-slate-500 max-w-xs mx-auto">
                                Essayez un autre mot-clé ou utilisez le scanner IA pour identifier cet objet.
                            </p>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 text-sm bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-xl transition-colors"
                            >
                                <Leaf className="w-4 h-4" />
                                Utiliser le scanner IA
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
