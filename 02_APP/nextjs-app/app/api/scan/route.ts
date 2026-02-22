import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { label, binColor, confidence, advice } = body;

        // 1. Validation basique des données
        if (!label || !binColor || confidence === undefined) {
            return NextResponse.json(
                { error: "Données incomplètes pour sauvegarder le scan." },
                { status: 400 }
            );
        }

        // 2. Gestion de la Session utilisateur
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id || null;

        // 3. Sauvegarde du Scan en Base de Données
        const newScan = await prisma.scan.create({
            data: {
                label,
                binColor,
                confidence,
                advice,
                userId, // Enregistre l'ID si connecté, sinon null
            },
        });

        // 4. GAMIFICATION (Moteur d'XP) - Seulement si l'utilisateur est connecté !
        let earnedXP = 0;
        let newLevel = 1;

        if (userId) {
            // A. Calcul des points à donner
            const BASE_XP = 10;
            const PRECISION_BONUS = confidence >= 0.90 ? 5 : 0; // +5 points si l'IA est très sûre
            earnedXP = BASE_XP + PRECISION_BONUS;

            // B. Récupération de l'utilisateur actuel pour mettre à jour
            const user = await prisma.user.findUnique({ where: { id: userId } });

            if (user) {
                const newTotalXP = user.points + earnedXP;

                // C. Logique de Niveau (Niveau = Total Points / 100) -> ex: 250pts = Lvl 3
                newLevel = Math.floor(newTotalXP / 100) + 1;

                // D. Logique de "Streaks" (Séries de jours consécutifs)
                let newStreaks = user.streaks;
                const now = new Date();

                if (!user.lastScanDate) {
                    // Premier scan de l'utilisateur !
                    newStreaks = 1;
                } else {
                    const lastScan = new Date(user.lastScanDate);
                    // On efface les heures pour ne comparer que les "jours calendaires"
                    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    const lastDate = new Date(lastScan.getFullYear(), lastScan.getMonth(), lastScan.getDate());

                    const timeDiff = today.getTime() - lastDate.getTime();
                    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

                    if (daysDiff === 1) {
                        // Scan le jour suivant : la série continue !
                        newStreaks += 1;
                    } else if (daysDiff > 1) {
                        // Scan après plus d'un jour : la série est brisée :(
                        newStreaks = 1;
                    }
                    // Si daysDiff === 0, c'est le même jour, on ne touche pas au streak.
                }

                // E. Mise à jour en Base de Données
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        points: newTotalXP,
                        level: Number(newLevel),
                        streaks: newStreaks,
                        lastScanDate: now,
                    }
                });

                // -----------------------------------------------------------------
                // 🏆 F. MOTEUR DE BADGES (Vérification et Attribution)
                // -----------------------------------------------------------------
                const earnedBadges: { name: string, icon: string, description: string }[] = [];

                // On récupère tous les scans et badges de l'utilisateur pour vérifier les conditions
                const userWithHistory = await prisma.user.findUnique({
                    where: { id: userId },
                    include: { scans: true, badges: true }
                });

                if (userWithHistory) {
                    const totalUserScans = userWithHistory.scans.length;
                    const existingBadgeNames = userWithHistory.badges.map(b => b.name);

                    // --- Badge 1: Le Premier Pas ("First Blood")
                    if (totalUserScans === 1 && !existingBadgeNames.includes("Premier Pas")) {
                        earnedBadges.push({
                            name: "Premier Pas",
                            icon: "🌱",
                            description: "Vous avez effectué votre tout premier scan. Le chemin commence ici !"
                        });
                    }

                    // --- Badge 2: L'Éco-Guerrier (5 scans réguliers)
                    if (totalUserScans >= 5 && !existingBadgeNames.includes("Éco-Guerrier")) {
                        earnedBadges.push({
                            name: "Éco-Guerrier",
                            icon: "🛡️",
                            description: "5 déchets triés correctement. Vous défendez la planète !"
                        });
                    }

                    // --- Badge 3: L'Œil de Lynx (Un scan incertain détecté quand même)
                    if (confidence < 0.60 && !existingBadgeNames.includes("Œil de Lynx")) {
                        earnedBadges.push({
                            name: "Œil de Lynx",
                            icon: "👁️",
                            description: "Vous avez aidé l'IA sur un scan extrêmement difficile (<60%)."
                        });
                    }

                    // Sauvegarde des nouveaux badges en BDD
                    for (const badge of earnedBadges) {
                        await prisma.badge.create({
                            data: {
                                name: badge.name,
                                icon: badge.icon,
                                description: badge.description,
                                userId: userId
                            }
                        });
                    }
                }

                // Fin du bloc Gamification (user authentifié uniquement)
                return NextResponse.json(
                    {
                        message: "Scan sauvegardé avec succès !",
                        scan: newScan,
                        gamification: { earnedXP, newLevel, newBadges: earnedBadges }
                    },
                    { status: 201 }
                );
            }
        }

        // Cas : Utilisateur non connecté (Scanner Anonyme - Pas de Gamification)
        return NextResponse.json(
            {
                message: "Scan sauvegardé de manière anonyme.",
                scan: newScan,
                gamification: null
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Erreur API /scan POST :", error);
        return NextResponse.json(
            { error: "Erreur interne du serveur lors de la sauvegarde." },
            { status: 500 }
        );
    }
}
