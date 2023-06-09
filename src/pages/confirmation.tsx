import type { NextPage } from "next";
import React, { useState, useEffect } from "react";
import ContentTableConfirmation from "../components/ContentTableConfirmation";
import Link from "next/link";
import { useRouter } from "next/router";

const Confirmation: NextPage = () => {
  interface Tweet {
    id: string;
    date: string;
    title: string;
    content: string;
    status: string;
    tableType: "作成中" | "投稿予約完了" | "投稿済み";
  }

  interface ApiResponse {
    success?: boolean;
    error?: string;
    message?: string;
  }

  const router = useRouter();
  const { year, month } = router.query;

  const [allContents, setAllContents] = useState<Tweet[]>([]);
  const [filteredContents, setFilteredContents] = useState<Tweet[]>([]);

  useEffect(() => {
    filterCurrentMonthContents();
  }, [allContents]);

  const filterCurrentMonthContents = () => {
    const currentYear = Number(year);
    const currentMonth = Number(month);

    const filtered = allContents.filter((content) => {
      const contentDate = new Date(content.date);
      return (
        contentDate.getFullYear() === currentYear &&
        contentDate.getMonth() + 1 === currentMonth
      );
    });

    setFilteredContents(filtered);
  };

  const getContents = async () => {
    try {
      const response = await fetch("/api/tweets");
      const data = await response.json();
      setAllContents(data);
      setFilteredContents(data);
    } catch (error) {
      console.error("Error fetching contents:", error);
    }
  };

  useEffect(() => {
    getContents();
  }, []);

  const setTweets = async (tweetIds: string[]): Promise<ApiResponse> => {
    const response = await fetch("/api/set-tweets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tweetIds),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const jsonResponse: ApiResponse = await response.json();
    getContents();
    return jsonResponse;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl mb-6 text-center font-semibold text-gray-600">
        投稿内容確認
      </h1>
      <div className="flex justify-center items-center space-x-4 mb-4">
        <h3 className="text-xl font-medium text-gray-500">2023年</h3>
        <h3 className="text-xl font-medium text-gray-500">{month}月</h3>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={async () => {
            try {
              const validTweets = filteredContents.filter(
                (tweet) => tweet.title && tweet.content
              );
              const validTweetIds = validTweets.map((tweet) => tweet.id);
              await setTweets(validTweetIds);
              alert("投稿予約が完了しました！");
            } catch (error) {
              alert("Error posting tweets: " + error);
            }
          }}
        >
          投稿予約する
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={async () => {
            try {
              const response = await fetch("/api/post-tweets", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ year, month }),
              });

              if (response.ok) {
                alert("投稿完了しました！");
                getContents();
              } else {
                const error = await response.json();
                alert(`エラー: ${error.error}`);
              }
            } catch (error) {
              alert(`エラー: ${error}`);
            }
          }}
        >
          投稿テスト
        </button>
        <Link
          href="/"
          className="block text-center w-full mb-4 text-blue-500 hover:text-blue-700"
        >
          ホームに戻る
        </Link>
      </div>
      <div className="mt-4">
        <ContentTableConfirmation contents={filteredContents} />
      </div>
    </div>
  );
};

export default Confirmation;
