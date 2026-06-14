import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import User from "../../../../models/user.model";
import dbConnect from "@/lib/dbConnect";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials: any): Promise<any> {
        await dbConnect();

        try {
          if (!credentials?.identifier || !credentials?.password) {
            throw new Error("Email/username and password are required");
          }

          const user = await User.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          });

          if (!user) {
            throw new Error("No user found with this email or username");
          }

          if (!user.isVerified) {
            throw new Error("Please verify your account before logging in");
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordCorrect) {
            throw new Error("Incorrect password");
          }

          const now = new Date();
          const lastRefresh = user.lastTokenRefresh || user.createdAt;

          const isDifferentDay =
            now.toDateString() !== new Date(lastRefresh).toDateString();

          if (isDifferentDay || user.tokensRemaining < 10) {
            user.tokensRemaining = 10;
            user.lastTokenRefresh = now;
            await user.save();
          }

          return user;
        } catch (err: any) {
          throw new Error(err.message || "Login failed");
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.username = user.username;
        token.tokensRemaining = user.tokensRemaining;
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.username = token.username;

        await dbConnect();

        const freshUser = await User.findById(token._id).select(
          "tokensRemaining lastTokenRefresh createdAt"
        );

        if (freshUser) {
          const now = new Date();
          const lastRefresh =
            freshUser.lastTokenRefresh || freshUser.createdAt;

          const isDifferentDay =
            now.toDateString() !== new Date(lastRefresh).toDateString();

          if (isDifferentDay || freshUser.tokensRemaining < 10) {
            freshUser.tokensRemaining = 10;
            freshUser.lastTokenRefresh = now;
            await freshUser.save();
          }

          session.user.tokensRemaining = freshUser.tokensRemaining;
        } else {
          session.user.tokensRemaining = 0;
        }
      }

      return session;
    },
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/sign-in",
  },
};