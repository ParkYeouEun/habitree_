import React from "react";
import { Link } from "react-router-dom";

function RecordList() {
  const records = JSON.parse(localStorage.getItem("worklog-records") || "[]");
  if (records.length === 0) {
    return (
      <div className="text-center text-gray-400 py-12">
        <div className="text-3xl mb-2">🗒️</div>
        <div>아직 저장된 업무 기록이 없습니다.</div>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {records.slice(0, 5).map((rec) => (
        <div
          key={rec.id}
          className="bg-white rounded shadow p-4 flex flex-col sm:flex-row sm:items-center justify-between"
        >
          <div>
            <div className="font-bold text-blue-700 flex flex-wrap gap-1">
              {rec.projectTags && rec.projectTags.map((t) => (
                <span key={t} className="bg-blue-100 px-2 py-0.5 rounded text-xs">#{t}</span>
              ))}
            </div>
            <div className="text-base font-semibold mt-1">{rec.title}</div>
            <div className="text-xs text-gray-500 mt-1">
              {rec.date} | {rec.typeTags && rec.typeTags.map(t => `#${t}`).join(" ")}
            </div>
            <div className="text-sm text-gray-700 mt-1 line-clamp-2">{rec.content}</div>
          </div>
        </div>
      ))}
      <div className="text-right mt-2">
        <Link to="/search" className="text-blue-500 hover:underline text-sm">더보기 {" >"}</Link>
      </div>
    </div>
  );
}

function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-2">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center mb-6">오늘의 업무 기록</h1>
        <div className="flex justify-center gap-4 mb-6">
          <Link
            to="/write"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold"
          >
            기록하기
          </Link>
          <Link
            to="/insight"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-semibold"
          >
            이번 달 회고 보기
          </Link>
        </div>
        <RecordList />
      </div>
    </div>
  );
}

export default Home;
