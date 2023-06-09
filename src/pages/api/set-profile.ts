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
    const { role, tweetContent, tweetStyle } = req.body;

    try {
      // Update the user with the provided role, tweetContent and tweetStyle
      await prisma.user.update({
        where: { id: userId },
        data: {
          role: role,
          tweetContent: tweetContent,
          tweetStyle: tweetStyle,
        },
      });

      res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error updating profile", details: error });
    }
  } else {
    console.log("No session information");
    res.status(401).json({ error: "Not authenticated" });
  }
};
