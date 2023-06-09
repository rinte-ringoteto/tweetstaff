import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    session: {
      expires: string;
      user: User;
    };
    user: {
      id: string | null;
      name: string;
      email: string;
      image: string;
      emailVerified: Date | null;
      themes: string;
      role: string;
      tweetContent: string;
      tweetStyle: string;
      oauth_token: string;
      oauth_token_secret: string;
    };
  }
}
