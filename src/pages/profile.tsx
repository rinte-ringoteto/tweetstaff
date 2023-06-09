import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const Profile = () => {
  const { data: session, status: loading } = useSession();
  const [role, setRole] = useState("");
  const [tweetContent, setTweetContent] = useState("");
  const [tweetStyle, setTweetStyle] = useState("");

  useEffect(() => {
    if (session) {
      setRole(session.user.role);
      setTweetContent(session.user.tweetContent);
      setTweetStyle(session.user.tweetStyle);
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/set-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role,
          tweetContent,
          tweetStyle,
        }),
      });

      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-2xl font-bold mb-4">アカウント情報</h1>
      <form
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-3/4"
        onSubmit={handleSubmit}
      >
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="role"
          >
            このアカウントは
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline whitespace-normal"
            id="role"
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
          <p>アカウントです</p>
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="tweetContent"
          >
            普段は
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline whitespace-normal"
            id="tweetContent"
            type="text"
            value={tweetContent}
            onChange={(e) => setTweetContent(e.target.value)}
          />
          <p>のツイートをしています</p>
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="tweetStyle"
          >
            ツイートは
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline whitespace-normal"
            id="tweetStyle"
            type="text"
            value={tweetStyle}
            onChange={(e) => setTweetStyle(e.target.value)}
          />
          <p>スタイルです</p>
        </div>
        <div className="flex items-center justify-center">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            保存
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
