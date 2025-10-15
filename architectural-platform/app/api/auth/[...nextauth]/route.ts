import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { verifyPassword } from "@/lib/auth";
import config from "@/lib/config";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: config.auth.client_id || "",
      clientSecret: config.auth.client_secret || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        try {
          await dbConnect();
          const user = await User.findOne({ email: credentials.email });

          if (!user) {
            console.log("User not found:", credentials.email);
            return null;
          }

          if (!user.passwordHash) {
            console.log("User has no password hash (might be Google user)");
            return null;
          }

          const isValid = await verifyPassword(
            credentials.password,
            user.passwordHash
          );
          if (!isValid) {
            console.log("Invalid password for user:", credentials.email);
            return null;
          }

          console.log("User authenticated successfully:", credentials.email);
          return {
            id: String(user._id),
            username: user.username,
            email: user.email,
            avatarUrl: user.avatarUrl,
            role: user.role,
            provider: user.provider,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await dbConnect();
        let dbUser = await User.findOne({ email: user.email });
        if (!dbUser) {
          dbUser = new User({
            email: user.email,
            firstName: user.name?.split(" ")[0] || "",
            lastName: user.name?.split(" ")[1] || "",
            username: user.email?.split("@")[0],
            avatarUrl: user.image,
            provider: "google",
            providerId: account.providerAccountId,
          });
          await dbUser.save();
        }
        user.id = String(dbUser._id);
        user.username = dbUser.username;
        user.role = dbUser.role;
        user.avatarUrl = dbUser.avatarUrl;
        user.provider = dbUser.provider;
      }
      // For credentials provider, user data is already populated from authorize function
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.avatarUrl = user.avatarUrl;
        token.provider = user.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.role = token.role;
        session.user.avatarUrl = token.avatarUrl;
        session.user.provider = token.provider;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: config.nextAuth.secret,
});

export { handler as GET, handler as POST };
