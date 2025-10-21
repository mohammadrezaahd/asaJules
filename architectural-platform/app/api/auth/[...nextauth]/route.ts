import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { verifyPassword } from "@/lib/auth";
import config from "@/lib/config";
import { AuthOptions } from "next-auth";
import { generateUniqueUsername } from "@/lib/userUtils";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: config.auth.client_id || "",
      clientSecret: config.auth.client_secret || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        emailOrUsername: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }
        await dbConnect();
        console.log("Authorizing user with emailOrUsername:", credentials.emailOrUsername);
        
        // Find user by email or username
        const user = await User.findOne({ 
          $or: [
            { email: credentials.emailOrUsername },
            { username: credentials.emailOrUsername }
          ]
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await verifyPassword(
          credentials.password,
          user.passwordHash
        );
        console.log("Password valid:", isValid);
        if (!isValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          avatarUrl: user.avatarUrl,
          role: user.role,
          provider: user.provider,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await dbConnect();
        let dbUser = await User.findOne({ email: user.email });
        if (!dbUser) {
          // Generate unique username for Google users
          const uniqueUsername = await generateUniqueUsername(user.email || '');
          
          dbUser = new User({
            email: user.email,
            firstName: user.name?.split(" ")[0] || "",
            lastName: user.name?.split(" ")[1] || "",
            username: uniqueUsername,
            avatarUrl: user.image,
            provider: "google",
            providerId: account.providerAccountId,
          });
          await dbUser.save();
        }
        user.id = dbUser._id.toString();
        user.username = dbUser.username;
        user.role = dbUser.role;
        user.avatarUrl = dbUser.avatarUrl;
        user.provider = dbUser.provider;
      }
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
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
