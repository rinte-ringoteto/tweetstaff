import NextAuth from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { NextAuthOptions } from "next-auth";

const prisma = new PrismaClient();

const authOptions = {
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_API_KEY,
      clientSecret: process.env.TWITTER_API_SECRET_KEY,
      version: "2.0",
      authorization: {
        params: { scope: "users.read tweet.write tweet.read offline.access" },
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async signIn(user, account, profile) {
      const { access_token, refresh_token, expires_at } = user.account;
      console.log(user.account);
      console.log(user.user.id);
      await prisma.account.update({
        data: {
          access_token: access_token,
          expires_at: expires_at,
          refresh_token: refresh_token,
        },
        where: { userId: user.user.id },
      });

      return true;
    },
    async session({ session, user, token }) {
      // console.log(session);
      // console.log(user);
      // console.log(token);
      const additionalData = await prisma.account.findUnique({
        where: { userId: user.id },
      });
      if (additionalData.expires_at * 1000 > Date.now()) {
        // console.log(additionalData.expires_at * 1000);
        // console.log(Date.now());
      }

      if (additionalData.expires_at * 1000 < Date.now()) {
        const clientId = process.env.TWITTER_API_KEY;
        const clientSecret = process.env.TWITTER_API_SECRET_KEY;

        try {
          const response = await fetch(
            "https://api.twitter.com/2/oauth2/token",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization:
                  "Basic " +
                  Buffer.from(clientId + ":" + clientSecret).toString("base64"),
              },
              body: new URLSearchParams({
                refresh_token: additionalData.refresh_token,
                grant_type: "refresh_token",
                client_id: process.env.TWITTER_API_KEY,
                // client_secret: process.env.TWITTER_API_SECRET_KEY,
              }),
            }
          );

          const tokens = await response.json();

          if (!response.ok) throw tokens;

          await prisma.account.update({
            data: {
              access_token: tokens.access_token,
              expires_at: Math.floor(Date.now() / 1000 + tokens.expires_in),
              refresh_token:
                tokens.refresh_token ?? additionalData.refresh_token,
            },
            where: { userId: user.id },
          });
        } catch (error) {
          console.error("Error refreshing access token", error);
          session.error = "RefreshAccessTokenError";
        }
      }

      session.user.id = user.id;
      session.user.themes = user.themes;
      session.user.role = user.role;
      session.user.tweetContent = user.tweetContent;
      session.user.tweetStyle = user.tweetStyle;
      session.user.access_token = additionalData.access_token;

      return Promise.resolve(session);
    },
  },
};

export default NextAuth(authOptions);
export { authOptions };
