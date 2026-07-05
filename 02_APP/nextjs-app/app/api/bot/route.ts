import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { botName } = await req.json();
        if (!botName || botName.trim().length === 0) {
            return NextResponse.json({ error: "Nom invalide" }, { status: 400 });
        }

        // On cherche l'utilisateur par email (fiable avec JWT + PrismaAdapter)
        const updated = await prisma.user.update({
            where: { email: session.user.email },
            data: { botName: botName.trim().slice(0, 20) },
        });

        return NextResponse.json({ botName: updated.botName });
    } catch (error) {
        console.error("Erreur API /bot PATCH:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
