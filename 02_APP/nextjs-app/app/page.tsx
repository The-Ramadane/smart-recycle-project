
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Upload, X, Loader2, Sparkles, CheckCircle, AlertTriangle, ScanLine, Camera, Trash2, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PredictionResult {
  filename: string;
  prediction: string;
  bin_color: string;
  advice: string;
  confidence: number;
}

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
        fetch("http://localhost:8000/classify", { method: "POST", body: formData }),
        new Promise(resolve => setTimeout(resolve, 800)) // Min 800ms pour l'UX
      ]);

      if (!response.ok) throw new Error("Erreur analyse");

      const data = await response.json();
      setResult(data);
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
  };

  const handleSaveScan = async () => {
    if (!result) return;

    // Lazy Registration : On arrête tout et on ouvre le Pop-up si pas de compte !
    if (!session) {
      setAuthDialogOpen(true);
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: result.prediction,
          binColor: result.bin_color,
          confidence: result.confidence,
          advice: result.advice,
        }),
      });

      if (!response.ok) throw new Error("Erreur sauvegarde API");

      const data = await response.json();
      if (data.gamification) {
        setEarnedXP(data.gamification.earnedXP);
      }

      setIsSaved(true);
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
          Uploadez une photo de votre déchet, notre IA Moteur V12 (ResNet50) vous dit où le jeter.
        </p>

        {/* Bouton de connexion ou Profil en haut si besoin, très discret */}
        <div className="pt-4">
          {session ? (
            <div className="text-sm font-medium text-slate-600 flex flex-col items-center justify-center gap-2">
              <span className="mb-1">Connecté en tant que {session.user?.name || session.user?.email}</span>
              <div className="flex items-center gap-2">
                <Button variant="default" size="sm" asChild className="h-8 px-4 text-xs bg-indigo-600 hover:bg-indigo-700">
                  <Link href="/dashboard">Mon Profil & XP</Link>
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
                    className={clsx(
                      "object-cover transition-opacity duration-500",
                      loading ? "opacity-50 blur-sm scale-110" : "opacity-100"
                    )}
                  />

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

          {/* Résultat Panel */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              >
                <div className="border-t border-slate-100 bg-white">
                  <div className="p-6 space-y-6">

                    {/* Logique de Confiance */}
                    {result.confidence >= 0.60 ? (
                      // CAS : Confiant
                      <>
                        <div className="flex items-start justify-between">
                          <div>
                            <Badge variant="outline" className="mb-2 text-xs uppercase tracking-wider text-slate-500">
                              Déchet détecté
                            </Badge>
                            <h2 className="text-3xl font-bold capitalize text-slate-900 flex items-center gap-2">
                              {result.prediction}
                              {result.confidence > 0.8 && (
                                <CheckCircle className="w-6 h-6 text-green-500" />
                              )}
                            </h2>
                          </div>
                          <div className={clsx(
                            "w-16 h-16 rounded-2xl shadow-lg border-4 border-white flex items-center justify-center transform rotate-6",
                            BIN_COLORS[result.bin_color] || "bg-slate-200"
                          )}>
                            <span className="sr-only">Bac {result.bin_color}</span>
                          </div>
                        </div>

                        <Separator />

                        <div className="grid gap-4">
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <h4 className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-2">
                              💡 Conseil de tri
                            </h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                              {result.advice}
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      // CAS : Incertain (< 60%)
                      <div className="bg-amber-50 p-5 rounded-xl border border-amber-100 text-center space-y-3">
                        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
                        <h3 className="text-lg font-bold text-amber-800">Je ne suis pas sûr... 🤔</h3>
                        <p className="text-sm text-amber-700">
                          Il semble que ce soit du <strong>{result.prediction}</strong> ({(result.confidence * 100).toFixed(0)}%),
                          mais je préfère ne pas vous induire en erreur.<br />
                          Essayez de reprendre la photo avec plus de lumière ou sous un autre angle.
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono mt-4">
                      <span>Confiance IA: {(result.confidence * 100).toFixed(1)}%</span>
                      <span>Modèle: ResNet50</span>
                    </div>

                    <div className="flex flex-col gap-3 mt-6">
                      {!isSaved ? (
                        <Button
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                          size="lg"
                          onClick={handleSaveScan}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-5 h-5 mr-2" />
                          )}
                          Sauvegarder ce scan
                        </Button>
                      ) : (
                        <motion.div
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                        >
                          <Button
                            className="w-full bg-green-500 hover:bg-green-600 text-white relative flex justify-center items-center"
                            size="lg"
                            disabled
                          >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Sauvegardé avec succès !

                            {/* Animation flottante des XP */}
                            {earnedXP && (
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                animate={{ opacity: 1, y: -25, scale: 1.1 }}
                                transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                                className="absolute right-4 text-emerald-900 font-black flex items-center gap-1 bg-green-300 px-2 py-0.5 rounded-full border-2 border-green-400 shadow-sm z-10"
                              >
                                +{earnedXP} XP
                              </motion.div>
                            )}
                          </Button>
                        </motion.div>
                      )}

                      <Button variant="outline" className="w-full" size="lg" onClick={resetScan}>
                        Scanner un autre objet
                      </Button>
                    </div>
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
