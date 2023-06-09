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

  if (session) {
    const userId = session.user.id;
    const { year, month, updatedContents } = req.body;

    try {
      // Iterate through each updatedContent
      for (const content of updatedContents) {
        const contentDate = new Date(content.date);
        if (
          contentDate.getFullYear() === year &&
          contentDate.getMonth() === month - 1 // JavaScriptの月は0から始まる
        ) {
          const existingTweet = await prisma.tweet.findFirst({
            where: {
              userId: userId,
              date: content.date,
            },
          });

          if (existingTweet) {
            // Update existing tweet
            await prisma.tweet.update({
              where: { id: existingTweet.id },
              data: {
                title: content.title,
                content: content.content,
              },
            });
          } else {
            // Create new tweet if it doesn't exist
            await prisma.tweet.create({
              data: {
                date: new Date(content.date),
                title: content.title,
                content: content.content,
                userId,
              },
            });
          }
        }
      }

      res.status(200).json({ message: "Contents updated successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Error updating contents", details: error });
    }
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
};
