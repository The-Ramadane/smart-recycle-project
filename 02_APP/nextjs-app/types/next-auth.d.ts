import { DefaultSession } from "next-auth";

// Modifie les types internes de NextAuth pour inclure l'ID de l'utilisateur dans la session
declare module "next-auth" {
    interface Session {
        user: {
            id: string; // <-- On ajoute la propriété ID manquante par défaut
        } & DefaultSession["user"];
    }
}
