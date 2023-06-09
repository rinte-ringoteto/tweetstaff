import React, { useState, useEffect } from "react";

interface Tweet {
  date: string;
  title: string;
  content: string;
  status: string;
  tableType: "作成中" | "投稿予約完了" | "投稿済み";
}

interface ContentTableProps {
  contents: Tweet[];
}

const ContentTableConfirmation: React.FC<ContentTableProps> = ({
  contents,
}) => {
  const [editableContents, setEditableContents] = useState(contents);

  useEffect(() => {
    setEditableContents(contents);
  }, [contents]);

  const tableTypes = ["作成中", "投稿予約完了", "投稿済み"];

  return (
    <div>
      {contents.length === 0 ? (
        <p className="text-center text-lg mt-4">表示可能なデータがありません</p>
      ) : (
        tableTypes.map((tableType, index) => {
          const filteredContents = editableContents.filter(
            (content) =>
              content.title.trim() !== "" &&
              content.content.trim() !== "" &&
              content.status == tableType
          );
          return (
            <div key={index}>
              <div>
                <h1 className="text-xl font-bold text-gray-600 m-4">
                  {tableType}のツイート
                </h1>
                <table className="table-auto w-full mt-4">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="border px-4 py-2 w-36 text-gray-600">
                        ステータス
                      </th>
                      <th className="border px-4 py-2 w-24 text-gray-600">
                        日付
                      </th>
                      <th className="border px-4 py-2 w-24 text-gray-600">
                        時刻
                      </th>
                      <th className="border px-4 py-2 w-48 text-gray-600">
                        タイトル
                      </th>
                      <th className="border px-4 py-2 w-60 text-gray-600">
                        投稿内容
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContents.map((content, index) => {
                      const contentDate = new Date(content.date);
                      const formattedDate = contentDate
                        .toISOString()
                        .split("T")[0];
                      const formattedTime = contentDate
                        .toTimeString()
                        .split(" ")[0]
                        .substring(0, 5);
                      const [hour, minute] = formattedTime.split(":");

                      return (
                        <tr
                          key={index}
                          className={index % 2 === 0 ? "bg-gray-100" : ""}
                        >
                          <td className="border px-4 py-2 w-1/8">
                            {content.status}
                          </td>
                          <td className="border px-4 py-2 w-1/8">
                            {formattedDate}
                          </td>
                          <td className="border px-4 py-2 w-1/8">
                            <span>{hour}</span>
                            <span>:</span>
                            <span>{minute}</span>
                          </td>
                          <td className="border px-4 py-2 w-1/8">
                            <span>{content.title || ""}</span>
                          </td>
                          <td className="border px-4 py-2 w-3/8">
                            <span>{content.content || ""}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ContentTableConfirmation;
