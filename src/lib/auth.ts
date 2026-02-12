import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { NextAuthOptions, User, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authenticateUser } from "@/actions/auths";
import ldap from "ldapjs";

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
    // CredentialsProvider({
    //   name: "LDAP",
    //   credentials: {
    //     username: { label: "DN", type: "text", placeholder: "" },
    //     password: { label: "Password", type: "password" },
    //   },
    //   async authorize(credentials, req) {
    //     // You might want to pull this call out so we're not making a new LDAP client on every login attemp
    //     const client = ldap.createClient({
    //       url: process.env.LDAP_URI,
    //     });

    //     // Essentially promisify the LDAPJS client.bind function
    //     return new Promise((resolve, reject) => {
    //       client.bind(
    //         credentials?.username || "",
    //         credentials?.password || "",
    //         (error: any) => {
    //           if (error) {
    //             console.error("Failed");
    //             reject();
    //           } else {
    //             console.log("Logged in");
    //             resolve({
    //               id: credentials?.username || "",
    //               email: credentials?.username || "",
    //               password: credentials?.password || "",
    //               name: credentials?.username || "",
    //               role: "USER",
    //               roleId: "USER_ID",
    //               departmentId: "DEPARTMENT_ID",
    //               permissions: ["USER_PERMISSIONS"],
    //             } as User);
    //           }
    //         },
    //       );
    //     });
    //   },
    // }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await authenticateUser(
          credentials.email,
          credentials.password,
        );

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role.name,
          roleId: user.role.id,
          departmentId: user.departmentId,
          permissions: user.permissions,
        };
      },
    }),
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
