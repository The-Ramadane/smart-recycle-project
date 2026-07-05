
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Upload, X, Loader2, Sparkles, CheckCircle, AlertTriangle, ScanLine, Camera, Trash2, Save, Star, RotateCcw } from "lucide-react";
import { QuizCard, QuizResult, LABEL_FR } from "@/components/QuizCard";
import { EcoBot, EcoBotEvent } from "@/components/EcoBot";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Detection {
  label: string;
  confidence: number;
  box: [number, number, number, number]; // x1, y1, x2, y2
  bin_color: string;
  advice: string;
}

interface PredictionResult {
  filename: string;
  total_objects_detected: number;
  detections: Detection[];
}

// État de la machine applicative
type AppState = "idle" | "choice" | "quiz" | "results" | "summary";

const BIN_COLORS: Record<string, string> = {
  green: "bg-green-500",
  yellow: "bg-yellow-400",
  blue: "bg-blue-500",
  gray: "bg-gray-500",
  black: "bg-black",
  unknown: "bg-red-500",
};

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [earnedXP, setEarnedXP] = useState<number | null>(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });

  // ── États du Quiz ──────────────────────────────────────────────────────────
  const [appState, setAppState] = useState<AppState>("idle");
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [botEvent, setBotEvent] = useState<EcoBotEvent>(null);
  // Détections dédupliquées par label (une question par type d'objet unique)
  const [uniqueDetections, setUniqueDetections] = useState<(Detection & { count: number })[]>([]);

  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    fileInputRef.current!.value = ""; // Reset input
    processFile(file);
  };

  const processFile = async (file: File) => {
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {

      // Simulation d'un délai pour l'effet "scan" si c'est trop rapide
      const [response] = await Promise.all([
        fetch(`http://${window.location.hostname}:8000/classify`, { method: "POST", body: formData }),
        new Promise(resolve => setTimeout(resolve, 800)) // Min 800ms pour l'UX
      ]);

      if (!response.ok) throw new Error("Erreur analyse");

      const data = await response.json();
      setResult(data);

      // ── Déduplication par label (une question par type d'objet) ──
      if (data.total_objects_detected > 0) {
        const groupedMap = new Map<string, Detection & { count: number }>();
        for (const det of data.detections as Detection[]) {
          const existing = groupedMap.get(det.label);
          if (!existing || det.confidence > existing.confidence) {
            // On garde la détection avec la meilleure confiance pour ce label
            groupedMap.set(det.label, { ...det, count: (existing?.count ?? 0) + 1 });
          } else {
            existing.count += 1;
          }
        }
        const deduped = Array.from(groupedMap.values());
        setUniqueDetections(deduped);
        setAppState("choice"); // Afficher le choix quiz/résultats
        setQuizIndex(0);
        setQuizResults([]);
      } else {
        setUniqueDetections([]);
        setAppState("idle"); // Aucune détection : afficher la carte erreur
      }
    } catch (err) {
      setError("Erreur de connexion à l'IA dockerisée.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetScan = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setIsSaved(false);
    setEarnedXP(null);
    setImgDimensions({ width: 0, height: 0 });
    setAppState("idle");
    setQuizIndex(0);
    setQuizResults([]);
    setUniqueDetections([]);
    setBotEvent(null);
  };

  // ── Démarrage du quiz (depuis l'écran de choix) ────────────────────────────────
  const handleStartQuiz = () => {
    setAppState("quiz");
  };

  // ── Passer le quiz : affiche les résultats sans XP ───────────────────────────
  const handleSkipQuiz = () => {
    setAppState("results");
  };

  // ── Réponse à une question du quiz ─────────────────────────────────────────
  const handleQuizAnswer = (qResult: QuizResult) => {
    const newResults = [...quizResults, qResult];
    setQuizResults(newResults);
    // Le bot réagit au résultat de la réponse
    setBotEvent(qResult.correct ? "correct" : "wrong");
    setTimeout(() => setBotEvent(null), 3500);

    if (quizIndex < uniqueDetections.length - 1) {
      setQuizIndex((prev) => prev + 1);
    } else {
      setAppState("summary");
    }
  };

  const handleSaveScan = async () => {
    if (!result) return;

    if (!session) {
      setAuthDialogOpen(true);
      return;
    }

    setIsSaving(true);

    // XP total calculé par le quiz (correctness + confidence)
    const totalEarnedXP = quizResults.reduce((sum, r) => sum + r.earnedXP, 0);
    const correctLabels = quizResults
      .filter((r) => r.correct)
      .map((r) => r.detection.label)
      .join(", ") || "Aucun";

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: result.detections.map((d) => d.label).join(", "),
          binColor: result.detections[0]?.bin_color ?? "gray",
          confidence: result.detections[0]?.confidence ?? 0,
          advice: `Quiz: ${quizResults.filter((r) => r.correct).length}/${quizResults.length} correct(s). Bons tris: ${correctLabels}`,
          forcedXP: totalEarnedXP, // Override server-side XP avec celui du quiz
        }),
      });

      if (!response.ok) throw new Error("Erreur sauvegarde API");

      const data = await response.json();
      setEarnedXP(totalEarnedXP);
      setIsSaved(true);
      setBotEvent("save");
      setTimeout(() => setBotEvent(null), 4000);
    } catch (err) {
      console.error(err);
      setError("Impossible de sauvegarder le scan en base de données.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-8 font-sans text-slate-900">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 space-y-2"
      >
        <div className="inline-flex items-center justify-center p-3 bg-white rounded-full shadow-sm border border-slate-100 mb-2">
          <Sparkles className="w-6 h-6 text-primary mr-2" />
          <span className="font-bold text-lg tracking-tight">Smart Recycle AI</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-slate-900">
          Triez sans hésiter.
        </h1>
        <p className="text-slate-500 max-w-md mx-auto text-lg leading-relaxed">
          Scannez un déchet, testez vos connaissances, gagnez de l'XP !
        </p>

        {/* Mini Éco-Bot dans le header */}
        {session && (
          <div className="pt-2 flex flex-col items-center">
            <EcoBot
              level={1}
              totalScans={0}
              initialBotName="Éco-Bot"
              event={botEvent}
              editable={false}
            />
          </div>
        )}

        {/* Bouton de connexion ou Profil en haut si besoin, très discret */}
        <div className="pt-4">
          {session ? (
            <div className="text-sm font-medium text-slate-600 flex flex-col items-center justify-center gap-2">
              <span className="mb-1">Connecté en tant que {session.user?.name || session.user?.email}</span>
              <div className="flex items-center gap-2">
                <Button variant="default" size="sm" asChild className="h-8 px-4 text-xs bg-indigo-600 hover:bg-indigo-700">
                  <Link href="/dashboard">Mon Profil &amp; XP</Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="h-8 px-3 text-xs">
                  <Link href="/guide">📖 Mémotri</Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => signOut()} className="h-8 px-2 text-xs text-red-500 hover:text-red-700">Déconnexion</Button>
              </div>
            </div>
          ) : (
            <Button variant="link" size="sm" onClick={() => setAuthDialogOpen(true)} className="text-slate-500 hover:text-indigo-600">
              Se connecter / Créer un compte
            </Button>
          )}
        </div>
      </motion.div>

      {/* Main Container */}
      <div className="w-full max-w-md space-y-6">

        {/* Card Principal */}
        <Card className="border-slate-200 shadow-xl overflow-hidden bg-white/80 backdrop-blur-sm">
          <CardContent className="p-0">
            <AnimatePresence mode="wait">
              {!previewUrl ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="p-12 flex flex-col items-center justify-center gap-6 border-b border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="p-6 bg-slate-100 rounded-full group-hover:scale-110 group-hover:bg-indigo-50 transition-all duration-300 shadow-inner">
                    <Camera className="w-10 h-10 text-slate-400 group-hover:text-primary" />
                  </div>
                  <div className="text-center space-y-1">
                    <h3 className="font-bold text-lg text-slate-700">Scanner un déchet</h3>
                    <p className="text-sm text-slate-400">Tous formats : JPG, PNG, HEIC, WEBP...</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button variant="outline" className="mt-4">
                    Choisir une image
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative aspect-square bg-black group"
                >
                  <Image
                    src={previewUrl}
                    alt="Uploaded waste"
                    fill
                    onLoad={(e) => {
                      setImgDimensions({
                        width: e.currentTarget.naturalWidth,
                        height: e.currentTarget.naturalHeight
                      });
                    }}
                    className={clsx(
                      "object-contain transition-opacity duration-500",
                      loading ? "opacity-50 blur-sm scale-110" : "opacity-100"
                    )}
                  />

                  {/* Bounding Boxes YOLO */}
                  {!loading && result && result.detections?.map((det, i) => {
                    if (!imgDimensions.width) return null;
                    const [x1, y1, x2, y2] = det.box;
                    const top = (y1 / imgDimensions.height) * 100;
                    const left = (x1 / imgDimensions.width) * 100;
                    const width = ((x2 - x1) / imgDimensions.width) * 100;
                    const height = ((y2 - y1) / imgDimensions.height) * 100;

                    return (
                      <div
                        key={i}
                        className={clsx(
                          "absolute border-2 z-10 rounded-sm shadow-sm flex flex-col items-start transition-all",
                          BIN_COLORS[det.bin_color] ? BIN_COLORS[det.bin_color].replace('bg-', 'border-') : 'border-red-500'
                        )}
                        style={{ top: `${top}%`, left: `${left}%`, width: `${width}%`, height: `${height}%` }}
                      >
                        <span className={clsx(
                          "text-[10px] md:text-xs font-bold px-1 rounded-br-sm shadow-sm truncate max-w-full text-white",
                          BIN_COLORS[det.bin_color] || 'bg-slate-800'
                        )}>
                          {det.label} ({(det.confidence * 100).toFixed(0)}%)
                        </span>
                      </div>
                    )
                  })}

                  {/* Overlay de chargement "Scanner" */}
                  {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                      <ScanLine className="w-16 h-16 text-white/90 animate-pulse mb-4 drop-shadow-lg" />
                      <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium border border-white/20">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyse par Docker...
                      </div>
                    </div>
                  )}

                  {/* Bouton Reset */}
                  {!loading && (
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-4 right-4 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={resetScan}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>

          {/* ── QUIZ & RÉSULTAT Panel ── */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              >
                <div className="border-t border-slate-100 bg-white">

                  {/* ── CAS 0 : CHOIX QUIZ OU RÉSULTATS ── */}
                  {appState === "choice" && uniqueDetections.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 space-y-4"
                    >
                      <div className="text-center space-y-1">
                        <p className="text-xs text-indigo-500 font-bold uppercase tracking-widest">
                          {result?.total_objects_detected} objet{(result?.total_objects_detected ?? 0) > 1 ? "s" : ""} détecté{(result?.total_objects_detected ?? 0) > 1 ? "s" : ""}
                        </p>
                        <h3 className="text-xl font-black text-slate-900">Que souhaitez-vous faire ?</h3>
                      </div>

                      <Button
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                        size="lg"
                        onClick={handleStartQuiz}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Faire le quiz &amp; gagner des XP
                      </Button>

                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full text-slate-500"
                        onClick={handleSkipQuiz}
                      >
                        <CheckCircle className="w-4 h-4 mr-2 text-slate-400" />
                        Voir les résultats (sans XP)
                      </Button>
                    </motion.div>
                  )}

                  {/* ── CAS A : QUIZ EN COURS ── */}
                  {appState === "quiz" && uniqueDetections.length > 0 && (
                    <AnimatePresence mode="wait">
                      <QuizCard
                        key={quizIndex}
                        detection={uniqueDetections[quizIndex]}
                        detectionCount={uniqueDetections[quizIndex]?.count ?? 1}
                        questionNumber={quizIndex + 1}
                        totalQuestions={uniqueDetections.length}
                        onAnswer={handleQuizAnswer}
                      />
                    </AnimatePresence>
                  )}

                  {/* ── CAS A bis : RÉSULTATS SANS QUIZ ── */}
                  {appState === "results" && uniqueDetections.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 space-y-4"
                    >
                      <div className="space-y-2">
                        {uniqueDetections.map((det, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm">
                            <div className="flex items-center gap-2 font-semibold text-slate-800">
                              <span className={`w-3 h-3 rounded-full flex-shrink-0 ${
                                det.bin_color === "green" ? "bg-green-500" :
                                det.bin_color === "yellow" ? "bg-yellow-400" : "bg-slate-500"
                              }`} />
                              {det.count > 1 && <span className="text-indigo-500 font-bold">{det.count}×</span>}
                              {LABEL_FR[det.label] ?? det.label}
                            </div>
                            <span className="text-xs text-slate-500 font-mono">
                              {det.bin_color === "green" ? "🟢 Verte" : det.bin_color === "yellow" ? "🟡 Jaune" : "⚫ Grise"}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="text-center text-xs text-slate-400">
                        Faites le quiz la prochaine fois pour gagner des XP ! 💡
                      </p>
                      <Button variant="outline" size="lg" className="w-full" onClick={resetScan}>
                        <RotateCcw className="w-4 h-4 mr-2" /> Scanner un autre objet
                      </Button>
                    </motion.div>
                  )}

                  {/* ── CAS B : RÉSUMÉ FINAL ── */}
                  {appState === "summary" && (() => {
                    const correct = quizResults.filter((r) => r.correct).length;
                    const total = quizResults.length;
                    const totalXP = quizResults.reduce((s, r) => s + r.earnedXP, 0);
                    const isPerfect = correct === total;
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 space-y-5"
                      >
                        {/* Score global */}
                        <div className={clsx(
                          "rounded-2xl p-6 border-2 text-center space-y-2",
                          isPerfect ? "bg-green-50 border-green-300" : correct > 0 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200"
                        )}>
                          <div className="text-5xl">{isPerfect ? "🏆" : correct > 0 ? "⭐" : "📚"}</div>
                          <h2 className="text-2xl font-black text-slate-900">
                            {correct}/{total} correct{correct > 1 ? "s" : ""}
                          </h2>
                          <p className={clsx(
                            "text-sm font-semibold",
                            isPerfect ? "text-green-700" : correct > 0 ? "text-amber-700" : "text-red-700"
                          )}>
                            {isPerfect ? "Parfait ! Vous êtes un expert du tri ! 🌿" :
                              correct > 0 ? "Bon travail ! Quelques points à revoir." :
                                "Ne vous découragez pas — apprenez et réessayez !"}
                          </p>
                          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-1.5 text-sm font-black text-indigo-700 shadow-sm">
                            <Star className="w-4 h-4 text-amber-400" />
                            +{totalXP} XP gagnés ce scan
                          </div>
                        </div>

                        {/* Détail par objet */}
                        <div className="space-y-2">
                          {quizResults.map((r, i) => (
                            <div key={i} className={clsx(
                              "flex items-center justify-between p-3 rounded-xl border text-sm",
                              r.correct ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                            )}>
                              <div className="flex items-center gap-2 font-semibold text-slate-800">
                                {r.correct
                                  ? <CheckCircle className="w-4 h-4 text-green-500" />
                                  : <AlertTriangle className="w-4 h-4 text-red-500" />}
                                {LABEL_FR[r.detection.label] ?? r.detection.label}
                              </div>
                              <span className={clsx(
                                "font-black text-xs px-2 py-0.5 rounded-full",
                                r.correct ? "text-green-700 bg-green-100" : "text-red-600 bg-red-100"
                              )}>
                                {r.correct ? `+${r.earnedXP} XP` : "0 XP"}
                              </span>
                            </div>
                          ))}
                        </div>

                        <Separator />

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                          {!isSaved ? (
                            <Button
                              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                              size="lg"
                              onClick={handleSaveScan}
                              disabled={isSaving}
                            >
                              {isSaving
                                ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                : <Save className="w-4 h-4 mr-2" />}
                              Sauvegarder & Valider {totalXP} XP
                            </Button>
                          ) : (
                            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                              <Button className="w-full bg-green-500 hover:bg-green-600 text-white relative" size="lg" disabled>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Scan sauvegardé !
                                {earnedXP !== null && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                    animate={{ opacity: 1, y: -28, scale: 1.1 }}
                                    transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                                    className="absolute right-4 font-black text-sm bg-green-300 text-emerald-900 px-2 py-0.5 rounded-full border-2 border-green-400 z-10"
                                  >
                                    +{earnedXP} XP
                                  </motion.div>
                                )}
                              </Button>
                            </motion.div>
                          )}
                          <Button variant="outline" size="lg" className="w-full" onClick={resetScan}>
                            <RotateCcw className="w-4 h-4 mr-2" /> Scanner un autre objet
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })()}

                  {/* ── CAS C : RIEN DÉTECTÉ ── */}
                  {appState === "idle" && result.total_objects_detected === 0 && (
                    <div className="p-6 space-y-4">
                      <div className="bg-red-50 p-5 rounded-xl border border-red-200 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-6 h-6 text-red-500" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-red-800">Aucun déchet identifié</h3>
                            <p className="text-sm text-red-600">Je ne reconnais rien parmi les 6 catégories connues.</p>
                          </div>
                        </div>
                        <Separator className="bg-red-200" />
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-red-700 uppercase tracking-wider">Conseils pour réessayer :</p>
                          <div className="grid gap-2">
                            {[
                              { icon: "💡", tip: "Améliorez l'éclairage — évitez les ombres ou les contre-jours." },
                              { icon: "🔍", tip: "Rapprochez-vous — l'objet doit occuper au moins 30% de l'image." },
                              { icon: "📐", tip: "Changez l'angle — filmez de face, pas de côté ou en diagonale." },
                            ].map(({ icon, tip }) => (
                              <div key={tip} className="flex items-start gap-2 bg-white border border-red-100 rounded-lg p-2.5">
                                <span className="text-base">{icon}</span>
                                <p className="text-xs text-slate-600 leading-snug">{tip}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <Button className="w-full bg-red-600 hover:bg-red-700 text-white" size="lg" onClick={resetScan}>
                          <ScanLine className="w-4 h-4 mr-2" /> Réessayer avec une nouvelle photo
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="px-6 pb-3">
                    <p className="text-[10px] text-slate-400 font-mono">Moteur: YOLO11 (Ultralytics) — seuil: 40%</p>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Panel */}
          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm font-medium flex items-center justify-center gap-2 border-t border-red-100">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}
        </Card>
      </div>

      <footer className="mt-12 text-slate-400 text-sm font-medium flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
        <span>Smart Recycle Project</span>
        <span className="w-1 h-1 bg-slate-400 rounded-full" />
        <span>v2.0 (Docker Edition)</span>
      </footer>

      {/* Pop-up de Connexion (Lazy Registration) */}
      <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              Rejoignez l'aventure !
            </DialogTitle>
            <DialogDescription className="text-md pt-2">
              Pour sauvegarder ce scan, suivre votre historique et gagner de l'XP environnementale, connectez-vous gratuitement en 1 clic. 🌱
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 py-6">
            <Button
              variant="outline"
              size="lg"
              className="w-full relative justify-center bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
              onClick={() => signIn("google")}
            >
              🚀 Continuer avec Google
            </Button>

          </div>
          <div className="text-center text-xs text-slate-400">
            En vous connectant, vous acceptez nos conditions de protection de l'environnement !
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
