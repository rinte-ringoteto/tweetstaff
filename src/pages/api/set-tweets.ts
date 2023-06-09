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

  if (!session) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const userId = session.user.id;
  const tweetIds = req.body;

  try {
    // Update each tweet's status
    for (let tweetId of tweetIds) {
      await prisma.tweet.updateMany({
        where: {
          id: tweetId,
          status: "作成中",
        },
        data: {
          status: "投稿予約完了",
        },
      });
    }

    res.status(200).json({ message: "Tweets updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating tweets", details: error });
  }
};
