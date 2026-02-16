import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { NextAuthOptions, User, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authenticateUser, authenticateUserLDAP } from "@/actions/auths";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 60 * 10, // 10 Minutes
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "LDAP",
      credentials: {
        username: { label: "DN", type: "text", placeholder: "" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const result = await authenticateUserLDAP(
          credentials?.username as string,
          credentials?.password as string,
        );

        if (!result) {
          return null;
        }

        return {
          id: result.id,
          email: result.email,
          name: result.name,
          role: result.role.name,
          roleId: result.role.id,
          departmentId: result.departmentId,
          permissions: result.permissions,
        };
      },
    }),
    // CredentialsProvider({
    //   name: "Credentials",
    //   credentials: {
    //     email: { label: "Email", type: "email" },
    //     password: { label: "Password", type: "password" },
    //   },
    //   async authorize(credentials) {
    //     if (!credentials?.email || !credentials?.password) {
    //       return null;
    //     }

    //     const user = await authenticateUser(
    //       credentials.email,
    //       credentials.password,
    //     );

    //     if (!user) {
    //       return null;
    //     }

    //     return {
    //       id: user.id,
    //       email: user.email,
    //       name: user.name,
    //       role: user.role.name,
    //       roleId: user.role.id,
    //       departmentId: user.departmentId,
    //       permissions: user.permissions,
    //     };
    //   },
    // }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as string;
        token.roleId = user.roleId as string;
        token.departmentId = user.departmentId as string;
        token.permissions = user.permissions as string[];
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.roleId = token.roleId;
        session.user.permissions = token.permissions;
        session.user.departmentId = token.departmentId;
      }
      return session;
    },
  },
};

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  return session?.user;
}
