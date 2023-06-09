import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";
import { generateTweets } from "./utils/openai-schedule"; // `generateTweets` をインポート

const prisma = new PrismaClient();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const session = await getServerSession(req, res, authOptions);

  if (session) {
    const userId = session.user.id;
    const { theme, year, month } = req.body;
    console.log("ユーザーID:" + userId);
    console.log("テーマ:" + theme);

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      const existingThemes = user?.themes ? JSON.parse(user?.themes) : {};

      existingThemes[year] = existingThemes[year] || {};
      existingThemes[year][month] = theme;

      await prisma.user.update({
        where: { id: userId },
        data: { themes: JSON.stringify(existingThemes) },
      });

      // OpenAI API を使って投稿プランを生成
      const tweetPlans = await generateTweets(theme, year, month);

      // First day of the month
      const firstDayOfMonth = new Date(year, month - 1);

      // Last day of the month
      const lastDayOfMonth = new Date(year, month, 0);

      // Prismaを使ってユーザーIDと日付が一致するすべてのツイートを取得
      const tweets = await prisma.tweet.findMany({
        where: {
          userId: userId,
          date: {
            gte: firstDayOfMonth,
            lt: new Date(lastDayOfMonth.getTime() + 24 * 60 * 60 * 1000), // Add one day to include the last day of the month
          },
        },
      });

      // Delete all existing tweets in the requested month
      await Promise.all(
        tweets.map((tweet) => prisma.tweet.delete({ where: { id: tweet.id } }))
      );

      // Create new tweets
      for (const plan of tweetPlans) {
        const anyPlan = plan as any;

        // Create new tweet
        await prisma.tweet.create({
          data: {
            date: new Date(anyPlan.date),
            title: anyPlan.title,
            content: "",
            status: "作成中",
            userId,
          },
        });
      }

      res.status(200).json({ message: "Schedule created successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Error creating schedule", details: error });
    }
  } else {
    console.log("セッション情報なし");
    res.status(401).json({ error: "Not authenticated" });
  }
};
