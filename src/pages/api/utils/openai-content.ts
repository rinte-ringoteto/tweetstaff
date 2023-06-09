import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openAI = new OpenAIApi(configuration);

export const generateContent = async (
  tweets: { date: Date; title: string }[],
  role: string,
  tweetContent: string,
  tweetStyle: string
) => {
  const newContents = [];
  console.log(role);

  for (let tweet of tweets) {
    const { date, title } = tweet;
    console.log(tweet);

    let success = false;
    do {
      try {
        const prompt =
          `You are the account of ${role}\n` +
          `You always tweet about ${tweetContent}\n ` +
          `Your tweet style is like that ${tweetStyle}\n` +
          `Generate a content for the tweet titled "${title}" on ${date}.\n` +
          " Answer in Japanese and in 140 letters.\n" +
          'Format is {"content":"content that you generate"}';
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

        // レスポンスをパースし、date と title を追加
        const parsedRes = JSON.parse(res);
        const contentWithDateAndTitle = { ...parsedRes, date, title };

        // 新しいオブジェクトを newContents 配列にプッシュ
        newContents.push(contentWithDateAndTitle);
        success = true;
      } catch (error) {
        console.error("Error occurred:", error);
        success = false;
      }
    } while (!success);
  }

  console.log(newContents);
  return newContents;
};
