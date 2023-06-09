import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";
import { generateContent } from "./utils/openai-content"; // `generateContent` をインポート

const prisma = new PrismaClient();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const session = await getServerSession(req, res, authOptions);

  if (session) {
    const userId = session.user.id; // ユーザーIDに変更
    const role = session.user.role; // ユーザーIDに変更
    const tweetContent = session.user.tweetContent; // ユーザーIDに変更
    const tweetStyle = session.user.tweetStyle; // ユーザーIDに変更
    const { year, month, dates } = req.body;

    try {
      // 指定した年と月のつぶやきを取得
      const tweets = await prisma.tweet.findMany({
        where: {
          AND: [
            {
              date: {
                in: dates.map((date: string) => new Date(date)),
              },
            },
            { userId: userId },
          ],
        },
        select: {
          date: true,
          title: true,
        },
      });

      // OpenAI API を使ってコンテンツを生成
      const newContent = await generateContent(
        tweets,
        role,
        tweetContent,
        tweetStyle
      ); // tweets を引数に渡す

      for (const content of newContent) {
        const existingTweet = await prisma.tweet.findFirst({
          where: {
            userId: userId,
            date: content.date,
            title: content.title,
          },
        });

        if (existingTweet) {
          await prisma.tweet.update({
            where: { id: existingTweet.id },
            data: {
              date: new Date(content.date),
              title: content.title,
              content: content.content,
            },
          });
        }
      }

      res.status(200).json({ message: "Content created successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error creating content", details: error });
    }
  } else {
    console.log("セッション情報なし");
    res.status(401).json({ error: "Not authenticated" });
  }
};
