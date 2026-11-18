import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 dias
        updateAge: 24 * 60 * 60,   // renova token a cada 24h
    },
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "E-mail", type: "email" },
                password: { label: "Senha", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const cleanEmail = credentials.email.trim().toLowerCase();
                if (!cleanEmail) return null;

                const user =
                    (await prisma.usuario.findUnique({ where: { email: cleanEmail } })) ??
                    (await prisma.usuario.findFirst({
                        where: { email: { equals: cleanEmail, mode: "insensitive" } },
                    }));

                if (!user || !user.ativo) return null;

                const trimmedPassword = credentials.password.trim();
                const senhaOk =
                    (await bcrypt.compare(credentials.password, user.senha)) ||
                    (trimmedPassword !== credentials.password &&
                        (await bcrypt.compare(trimmedPassword, user.senha)));
                if (!senhaOk) return null;

                return {
                    id: user.id,
                    name: user.nome,
                    email: user.email,
                    role: user.perfil,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) token.role = (user as unknown as { role: string }).role;
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as { id: string; role: string }).id = token.sub!;
                (session.user as { id: string; role: string }).role = token.role as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/admin/login",
        error: "/admin/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
