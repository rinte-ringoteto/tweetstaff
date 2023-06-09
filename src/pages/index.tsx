import type { NextPage } from "next";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DateFilter from "../components/DateFilter";
import ContentTable from "../components/ContentTable";
import OverlaySpinner from "../components/OverlaySpinner";

const Home: NextPage = () => {
  interface Tweet {
    date: string;
    title: string;
    content: string;
    status: string;
  }
  const { data: session, status: loading } = useSession();

  const [allContents, setAllContents] = useState<Tweet[]>([]);
  const [filteredContents, setFilteredContents] = useState<Tweet[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    filterCurrentMonthContents();
  }, [allContents]);

  const filterCurrentMonthContents = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

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

  const handleFilter = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);

    const filtered = allContents.filter((content) => {
      const contentDate = new Date(content.date);
      return (
        contentDate.getFullYear() === year &&
        contentDate.getMonth() + 1 === month
      );
    });
    setFilteredContents(filtered);

    // Reset selected rows and contents
    setSelectedRows([]);
    setSelectedContents([]);
  };

  const handleCreateSchedule = async (
    year: number,
    month: number,
    theme: string
  ) => {
    // Create a new schedule with the given theme
    setIsLoading(true);
    try {
      const response = await fetch("/api/create-schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ year, month, theme }),
      });

      if (response.ok) {
        alert("スケジュールが作成されました");
        getContents();
      } else {
        const error = await response.json();
        alert(`エラー: ${error.error}`);
      }
    } catch (error) {
      alert(`エラー: ${error}`);
    }
    setIsLoading(false);
  };

  const [selectedContents, setSelectedContents] = useState<Tweet[]>([]);

  const handleContentSelectionChange = (index: number, isSelected: boolean) => {
    if (isSelected) {
      setSelectedRows((prevSelectedRows) => {
        const newSelectedRows = [...prevSelectedRows, index];
        const newSelectedContents = newSelectedRows.map(
          (rowIndex) => filteredContents[rowIndex]
        );
        console.log(newSelectedContents);
        setSelectedContents(newSelectedContents);
        return newSelectedRows;
      });
    } else {
      setSelectedRows((prevSelectedRows) => {
        const newSelectedRows = prevSelectedRows.filter(
          (rowIndex) => rowIndex !== index
        );
        const newSelectedContents = newSelectedRows.map(
          (rowIndex) => filteredContents[rowIndex]
        );
        setSelectedContents(newSelectedContents);
        return newSelectedRows;
      });
    }
  };

  const handleAllRowsSelectionChange = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedRows((prevSelectedRows) => {
        // map to get the indexes
        const newSelectedRowsIndexes = filteredContents.map(
          (_, index) => index
        );
        // merge previous selected rows with the new ones
        const mergedSelectedRowsIndexes = [
          ...prevSelectedRows,
          ...newSelectedRowsIndexes,
        ];
        // remove duplicates
        const uniqueSelectedRowsIndexes = [
          ...new Set(mergedSelectedRowsIndexes),
        ];

        const newSelectedContents = uniqueSelectedRowsIndexes.map(
          (rowIndex) => filteredContents[rowIndex]
        );
        setSelectedContents(newSelectedContents);

        // return the new selected rows indexes
        return uniqueSelectedRowsIndexes;
      });
    } else {
      setSelectedRows([]);
      setSelectedContents([]);
    }
  };

  const handleCreateContent = async (year: number, month: number) => {
    const selectedDates = selectedContents.map((content) => content.date);
    // console.log(selectedDates);
    setIsLoading(true);
    try {
      const response = await fetch("/api/create-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ year, month, dates: selectedDates }),
      });

      if (response.ok) {
        alert("コンテンツが作成されました");
        getContents();
      } else {
        const error = await response.json();
        alert(`エラー: ${error.error}`);
      }
    } catch (error) {
      alert(`エラー: ${error}`);
    }
    setIsLoading(false);
  };

  const handleTimeChange = (index: number, date: Date) => {
    const updatedContents = filteredContents.map((content, idx) => {
      if (index === idx) {
        return { ...content, date: date.toISOString() };
      }
      return content;
    });
    setFilteredContents(updatedContents);
  };

  const handleTitleChange = (index: number, title: string) => {
    const updatedContents = filteredContents.map((content, idx) => {
      if (index === idx) {
        return { ...content, title: title };
      }
      return content;
    });
    setFilteredContents(updatedContents);
  };

  const handleContentChange = (index: number, newContent: string) => {
    const updatedContents = filteredContents.map((content, idx) => {
      if (index === idx) {
        return { ...content, content: newContent };
      }
      return content;
    });
    setFilteredContents(updatedContents);
  };

  const saveContentUpdates = async () => {
    try {
      const response = await fetch("/api/update-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          year: selectedYear,
          month: selectedMonth,
          updatedContents: filteredContents,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(`Error saving contents: ${data.error}`);
        return;
      }
      alert("All contents saved successfully");
    } catch (error) {
      alert(`Error saving contents: ${error}`);
    }
  };

  const handlePostConfirm = () => {
    const nonEmptyContents = filteredContents.filter(
      (content) => content.title && content.content
    );
    // ここで nonEmptyContents をどのように表示するかは、アプリケーションの要件によります。
    // とりあえず、コンソールに表示します。
    console.log(nonEmptyContents);
  };

  return (
    <div className="container mx-auto p-4">
      {isLoading && <OverlaySpinner loading={isLoading} />}
      <h1 className="text-2xl font-bold mb-4">コンテンツ一覧</h1>
      <DateFilter
        contents={filteredContents}
        themes={session?.user.themes ?? ""}
        onFilter={handleFilter}
        onCreateSchedule={handleCreateSchedule}
        onCreateContent={handleCreateContent}
        onPostConfirm={handlePostConfirm}
      />
      <div className="mt-4">
        <ContentTable
          contents={filteredContents}
          onTimeChange={handleTimeChange}
          onTitleChange={handleTitleChange}
          onContentChange={handleContentChange}
          onRowSelectionChange={handleContentSelectionChange}
          onAllRowsSelectionChange={handleAllRowsSelectionChange}
        />
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4 fixed bottom-4 right-4"
          onClick={saveContentUpdates}
        >
          保存
        </button>
      </div>
    </div>
  );
};

export default Home;
