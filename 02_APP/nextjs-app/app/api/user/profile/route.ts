import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                _count: {
                    select: { scans: true }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
        }

        return NextResponse.json({
            level: user.level,
            totalScans: user._count.scans,
            botName: user.botName || "Éco-Bot",
        });
    } catch (error) {
        console.error("Erreur API /user/profile GET:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
