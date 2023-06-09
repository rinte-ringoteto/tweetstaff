import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openAI = new OpenAIApi(configuration);

export const generateTweets = async (
  theme: string,
  year: number,
  month: number
) => {
  const daysInMonth = new Date(year, month - 1, 0).getDate();

  const tweets = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);

    const randomMinutes = Math.floor(Math.random() * 60);
    date.setHours(18);
    date.setMinutes(randomMinutes);
    console.log("date:" + date);

    let success = false;
    do {
      try {
        const prompt =
          `Generate a tweet title about "${theme}" for day ${day} of ${month}/${year}.\n` +
          "Do not include # and information fo the month or date or date number\n" +
          " Answer in Japanese.\n" +
          'Format is {"title":"title that you generate"}';
        const completion = await openAI.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1000,
          n: 1,
          // stop: null,
          temperature: 1.0,
          top_p: 1,
        });
        const res = completion.data!.choices[0]!.message!.content;
        console.log("res:" + res);

        // レスポンスをパースし、date を追加
        const parsedRes = JSON.parse(res);
        const tweetWithDate = { ...parsedRes, date };

        // 新しいオブジェクトを tweets 配列にプッシュ
        tweets.push(tweetWithDate);
        success = true;
      } catch (error) {
        console.error("Error occurred:", error);
        success = false;
      }
    } while (!success);
  }

  return tweets;
};
