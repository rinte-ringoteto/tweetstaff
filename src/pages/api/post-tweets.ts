import { TwitterApi } from "twitter-api-v2";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const session = await getServerSession(req, res, authOptions);
  console.log(session);

  if (!session) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    // 現在の日時を取得
    const now = new Date();

    const contents = await prisma.tweet.findMany({
      orderBy: {
        date: "asc",
      },
      where: {
        userId: session.user.id,
        status: "投稿予約完了",
        date: {
          // 現在の日時より前のデータを取得
          lt: now,
        },
      },
    });
    console.log(contents);

    const client = new TwitterApi(session.user.access_token);

    for (const content of contents) {
      // Post tweet
      const response = await client.v2.tweet(content.content);
      await prisma.tweet.update({
        where: { id: content.id },
        data: { status: "投稿済み" },
      });
    }

    res.status(200).json({ message: "Tweet(s) posted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error posting tweet", details: error });
  }
};
