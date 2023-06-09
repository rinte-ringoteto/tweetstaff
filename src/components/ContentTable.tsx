import React, { useState, useEffect } from "react";

interface Tweet {
  date: string;
  title: string;
  content: string;
  status: string;
}

interface ContentTableProps {
  contents: Tweet[];
  onTimeChange: (index: number, date: Date) => void;
  onTitleChange: (index: number, title: string) => void;
  onContentChange: (index: number, content: string) => void;
  onRowSelectionChange: (index: number, isSelected: boolean) => void;
  onAllRowsSelectionChange: (isSelected: boolean) => void;
}

const ContentTable: React.FC<ContentTableProps> = ({
  contents,
  onTimeChange,
  onTitleChange,
  onContentChange,
  onRowSelectionChange,
  onAllRowsSelectionChange,
}) => {
  const generateOptions = (start: number, end: number) => {
    const options = [];
    for (let i = start; i <= end; i++) {
      const value = i < 10 ? `0${i}` : `${i}`;
      options.push(
        <option value={value} key={value}>
          {value}
        </option>
      );
    }
    return options;
  };

  const [selectedRows, setSelectedRows] = useState<
    { date: string; isSelected: boolean }[]
  >(contents.map((content) => ({ date: content.date, isSelected: false })));

  const handleRowSelection = (index: number, isSelected: boolean) => {
    const updatedSelections = [...selectedRows];
    updatedSelections[index] = { ...updatedSelections[index], isSelected };
    setSelectedRows(updatedSelections);
    onRowSelectionChange(index, isSelected);
  };

  const [isAllRowsSelected, setIsAllRowsSelected] = useState(false);
  const handleAllRowsSelection = (isSelected: boolean) => {
    setIsAllRowsSelected(isSelected);
    const updatedSelections = selectedRows.map((row) => ({
      ...row,
      isSelected,
    }));
    setSelectedRows(updatedSelections);
    onAllRowsSelectionChange(isSelected);
  };

  const handleTimeChange = (
    index: number,
    field: "hour" | "minute",
    value: string
  ) => {
    const updatedContent = { ...contents[index] };
    const date = new Date(updatedContent.date);
    if (field === "hour") {
      date.setHours(parseInt(value, 10));
    } else {
      date.setMinutes(parseInt(value, 10));
    }
    onTimeChange(index, date);
  };

  const [editableContents, setEditableContents] = useState(contents);

  const handleTitleChange = (index: number, value: string) => {
    const updatedContents = [...editableContents];
    updatedContents[index].title = value;
    setEditableContents(updatedContents);
    onTitleChange(index, value);
  };

  const handleContentChange = (index: number, value: string) => {
    const updatedContents = [...editableContents];
    updatedContents[index].content = value;
    setEditableContents(updatedContents);
    onContentChange(index, value);
  };

  useEffect(() => {
    setEditableContents(contents);
    setSelectedRows(
      contents.map((content) => ({ date: content.date, isSelected: false }))
    );
    setIsAllRowsSelected(false);
  }, [contents]);

  return (
    <div>
      {contents.length === 0 ? (
        <p className="text-center text-lg mt-4">表示可能なデータがありません</p>
      ) : (
        <table className="table-auto w-full mt-4">
          <thead>
            <tr className="bg-blue-100">
              <th className="border px-4 py-2 w-1/12">
                <input
                  type="checkbox"
                  checked={isAllRowsSelected}
                  onChange={(e) => handleAllRowsSelection(e.target.checked)}
                />
              </th>
              <th className="border px-4 py-2 w-36">ステータス</th>
              <th className="border px-4 py-2 w-28">日付</th>
              <th className="border px-4 py-2 w-28">時刻</th>
              <th className="border px-4 py-2 w-48">タイトル</th>
              <th className="border px-4 py-2 w-60">投稿内容</th>
            </tr>
          </thead>
          <tbody>
            {contents.map((content, index) => {
              const contentDate = new Date(content.date);
              const formattedDate = contentDate.toISOString().split("T")[0];
              const formattedTime = contentDate
                .toTimeString()
                .split(" ")[0]
                .substring(0, 5);
              const [hour, minute] = formattedTime.split(":");

              return (
                <tr key={index} className="bg-gray-100">
                  <td className="border px-8 py-8 w-1/8">
                    <input
                      type="checkbox"
                      checked={selectedRows[index]?.isSelected || false} // Change here
                      onChange={(e) =>
                        handleRowSelection(index, e.target.checked)
                      }
                    />
                  </td>
                  <td className="border px-4 py-2 w-1/8">{content.status}</td>
                  <td className="border px-4 py-2 w-1/8">{formattedDate}</td>
                  <td className="border px-4 py-2 w-1/8">
                    <select
                      value={hour}
                      onChange={(e) =>
                        handleTimeChange(index, "hour", e.target.value)
                      }
                    >
                      {generateOptions(0, 23)}
                    </select>
                    <span>:</span>
                    <select
                      value={minute}
                      onChange={(e) =>
                        handleTimeChange(index, "minute", e.target.value)
                      }
                    >
                      {generateOptions(0, 59)}
                    </select>
                  </td>
                  <td className="border px-4 py-2 w-2/8">
                    <textarea
                      className="w-full h-24 px-3 py-2 text-base text-gray-700 placeholder-gray-600 border rounded-lg focus:shadow-outline"
                      value={editableContents[index]?.title || ""}
                      onChange={(e) => handleTitleChange(index, e.target.value)}
                    />
                  </td>
                  <td className="border px-4 py-2 w-3/8">
                    <textarea
                      className="w-full h-24 px-3 py-2 text-base text-gray-700 placeholder-gray-600 border rounded-lg focus:shadow-outline"
                      value={editableContents[index]?.content || ""}
                      onChange={(e) =>
                        handleContentChange(index, e.target.value)
                      }
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ContentTable;
