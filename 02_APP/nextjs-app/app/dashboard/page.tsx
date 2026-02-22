import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Trophy, Home, Medal, Globe, TreePine } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/"); // Redirection à l'accueil si non connecté
    }

    // 1. Récupérer l'utilisateur avec ses statistiques
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            scans: {
                orderBy: { createdAt: "desc" },
            },
            badges: {
                orderBy: { unlockedAt: "desc" },
            }
        },
    });

    if (!user) return <div>Erreur lors du chargement du profil...</div>;

    // 2. Récupérer le TOP 5 des utilisateurs pour le Leaderboard
    const topUsers = await prisma.user.findMany({
        orderBy: { points: "desc" },
        take: 5,
        select: { id: true, name: true, points: true, level: true, image: true },
    });

    const totalScans = user.scans.length;

    // 3. Récupérer le total global des scans pour calculer l'impact environnemental (CO2)
    const totalGlobalScans = await prisma.scan.count();
    const CO2_PER_ITEM_KG = 0.150; // Moyenne: on estime à 150 grammes de CO2 évité par objet recyclé
    const co2SavedTotal = (totalGlobalScans * CO2_PER_ITEM_KG).toFixed(1);

    return (
        <main className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">

            {/* Navigation Rapide */}
            <div className="max-w-4xl mx-auto mb-8">
                <Link href="/">
                    <Button variant="ghost" className="text-slate-500 gap-2 mb-4">
                        <Home className="w-4 h-4" /> Retour au Scanner
                    </Button>
                </Link>
            </div>

            <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-3">

                {/* En-tête / Profil Utilisateur */}
                <Card className="md:col-span-3 border-slate-200 shadow-sm bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-8 flex items-center justify-between">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-extrabold flex items-center gap-3">
                                <Sparkles className="w-8 h-8 text-indigo-500" />
                                Tableau de bord
                            </h1>
                            <p className="text-slate-500">
                                Bienvenue, {user.name || "Écolo' Anonyme"} !
                            </p>
                        </div>
                        {session.user?.image && (
                            <img src={session.user.image} alt="Avatar" className="w-16 h-16 rounded-full shadow-md" />
                        )}
                    </CardContent>
                </Card>

                {/* Stats Globales */}
                <Card className="border-slate-200 shadow-sm bg-indigo-50">
                    <CardContent className="p-6">
                        <div className="text-indigo-600 font-bold uppercase text-xs mb-2">Total Scans</div>
                        <div className="text-4xl font-extrabold text-indigo-900">{totalScans}</div>
                        <div className="text-sm text-indigo-700/80 mt-1">Déchets identifiés</div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm bg-green-50">
                    <CardContent className="p-6">
                        <div className="text-green-600 font-bold uppercase text-xs mb-2 flex items-center gap-2">
                            <Trophy className="w-4 h-4" /> Expérience (XP)
                        </div>
                        <div className="text-4xl font-extrabold text-green-900">{user.points}</div>
                        <div className="text-sm text-green-700/80 mt-1">Niveau {user.level}</div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm bg-amber-50">
                    <CardContent className="p-6">
                        <div className="text-amber-600 font-bold uppercase text-xs mb-2">Série en cours</div>
                        <div className="text-4xl font-extrabold text-amber-900">{user.streaks} <span className="text-2xl">🔥</span></div>
                        <div className="text-sm text-amber-700/80 mt-1">Jours consécutifs</div>
                    </CardContent>
                </Card>

                {/* Impact Communautaire */}
                <Card className="md:col-span-3 border-emerald-200 shadow-sm bg-gradient-to-r from-emerald-50 to-teal-100 overflow-hidden relative">
                    <div className="absolute -right-8 -top-8 text-emerald-500/10">
                        <Globe className="w-48 h-48" />
                    </div>
                    <CardContent className="p-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-2 text-center md:text-left">
                            <h2 className="text-xl font-extrabold text-emerald-900 flex items-center justify-center md:justify-start gap-2">
                                <TreePine className="w-6 h-6 text-emerald-600" />
                                Impact Global de la Communauté
                            </h2>
                            <p className="text-emerald-700 font-medium">
                                Ensemble, nous avons correctement trié <strong className="text-emerald-900">{totalGlobalScans} objets</strong>.
                            </p>
                        </div>
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-sm text-center min-w-[200px]">
                            <div className="text-emerald-600 font-bold uppercase text-[10px] tracking-wider mb-1">CO₂ Estimé Sauvegardé</div>
                            <div className="text-5xl font-black text-emerald-800">{co2SavedTotal} <span className="text-2xl font-bold">kg</span></div>
                        </div>
                    </CardContent>
                </Card>

                {/* Leaderboard (Top Recycleurs) */}
                <Card className="md:col-span-3 border-slate-200 shadow-sm bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Medal className="w-5 h-5 text-indigo-500" /> Top 5 Recycleurs (Classement Général)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-3 mt-4">
                            {topUsers.map((topUser, index) => (
                                <div key={topUser.id} className={`flex items-center justify-between p-3 rounded-lg border ${topUser.id === user.id ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="font-extrabold text-lg text-slate-400 w-6 text-center">
                                            {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                                        </div>
                                        {topUser.image ? (
                                            <img src={topUser.image} alt="Avatar" className="w-10 h-10 rounded-full shadow-sm" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                                                {topUser.name?.charAt(0) || "?"}
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm">
                                                {topUser.name || "Écolo Anonyme"}
                                                {topUser.id === user.id && <span className="ml-2 text-xs text-indigo-600 font-normal">(Vous)</span>}
                                            </h4>
                                            <p className="text-xs text-slate-500">Niveau {topUser.level}</p>
                                        </div>
                                    </div>
                                    <div className="font-black text-indigo-600">
                                        {topUser.points} <span className="text-xs font-normal">XP</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Section Badges */}
                <Card className="md:col-span-3 border-slate-200 shadow-sm bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500" /> Vos Badges
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {user.badges.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <div className="text-4xl opacity-50 grayscale mb-2">🔒</div>
                                <p className="text-sm text-slate-500 text-center">Aucun badge débloqué pour le moment.<br />Continuez à scanner pour en gagner !</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {user.badges.map((badge) => (
                                    <div key={badge.id} className="flex flex-col items-center p-4 bg-gradient-to-b from-slate-50 to-white rounded-xl border border-slate-100 shadow-sm text-center">
                                        <div className="text-4xl mb-3 drop-shadow-sm">{badge.icon}</div>
                                        <h4 className="font-bold text-slate-800 text-sm mb-1">{badge.name}</h4>
                                        <p className="text-xs text-slate-500">{badge.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Historique des Scans */}
                <Card className="md:col-span-3 border-slate-200 shadow-sm bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg">Historique de vos Scans</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {totalScans === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                Vous n'avez pas encore sauvegardé de scan. 🌍
                            </div>
                        ) : (
                            <ScrollArea className="h-[400px] w-full rounded-md pr-4">
                                <div className="space-y-4">
                                    {user.scans.map((scan) => (
                                        <div key={scan.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-100">
                                            <div>
                                                <h4 className="font-bold text-slate-800 capitalize">{scan.label}</h4>
                                                <p className="text-xs text-slate-500">
                                                    Confiance: {(scan.confidence * 100).toFixed(1)}% • Le {scan.createdAt.toLocaleDateString("fr-FR", { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            <div>
                                                <Badge variant="outline" className={`
                            ${scan.binColor === 'green' ? 'bg-green-100 text-green-700 border-green-200' : ''}
                            ${scan.binColor === 'yellow' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : ''}
                            ${scan.binColor === 'blue' ? 'bg-blue-100 text-blue-700 border-blue-200' : ''}
                            ${scan.binColor === 'black' ? 'bg-slate-200 text-slate-700 border-slate-300' : ''}
                          `}>
                                                    Bac {scan.binColor}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
