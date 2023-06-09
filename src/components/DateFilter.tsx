import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Tweet {
  date: string;
  title: string;
  content: string;
}

interface DateFilterProps {
  onFilter: (year: number, month: number) => void;
  onCreateSchedule: (
    year: number,
    month: number,
    theme: string
  ) => Promise<void>;
  onCreateContent: (year: number, month: number) => Promise<void>; // 追加
  themes: string;
  contents: Tweet[];
  onPostConfirm: () => void;
}

const DateFilter: React.FC<DateFilterProps> = ({
  onFilter,
  onCreateSchedule,
  onCreateContent,
  themes,
  contents,
}) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [theme, setTheme] = useState("");

  useEffect(() => {
    updateTheme();
  }, [themes, year, month]);

  const updateTheme = () => {
    if (themes && themes !== "undefined") {
      const themesObj = JSON.parse(themes);
      if (themesObj[year] && themesObj[year][month]) {
        setTheme(themesObj[year][month]);
      } else {
        setTheme("");
      }
    }
  };

  const handleMonthFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value);
    setMonth(newMonth);
    onFilter(year, newMonth);
    updateTheme();
  };

  const handleCreateScheduleClick = async () => {
    await onCreateSchedule(year, month, theme);
    setTheme("");
  };

  const handleCreateContentClick = async () => {
    await onCreateContent(year, month);
  };

  const handlePostConfirmClick = () => {};

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <h3 className="text-xl">2023年</h3>
        <select
          className="rounded border"
          value={month}
          onChange={handleMonthFilter}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {m}月
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center space-x-4">
        <input
          className="rounded border py-2 px-3"
          type="text"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          placeholder="テーマを入力"
        />
        {contents[0]?.title === undefined ? (
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleCreateScheduleClick}
          >
            ① スケジュール作成
          </button>
        ) : (
          <button
            className="text-blue-500 underline hover:text-blue-700"
            onClick={handleCreateScheduleClick}
          >
            ① スケジュール再作成
          </button>
        )}
        {contents.length === 0 ? null : contents[0]?.content === "" ? (
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleCreateContentClick}
          >
            ② コンテンツ作成
          </button>
        ) : (
          <button
            className="text-blue-500 underline hover:text-blue-700"
            onClick={handleCreateContentClick}
          >
            ② コンテンツ作成
          </button>
        )}
        {contents.length === 0 ? null : (
          <Link
            href={{
              pathname: "/confirmation",
              query: { year: year, month: month },
            }}
          >
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              ③ 投稿確認
            </button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default DateFilter;
