import React, { useState } from "react";
import WorklogModal from "./components/WorklogModal.jsx";
import Header from "./components/Header.jsx";
import './index.css';

// 태그별/업무별 통계 위젯
function TagStats({ records }) {
  const tagCount = {};
  records.forEach((rec) => {
    (rec.tags || []).forEach((tag) => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
  });
  const sorted = Object.entries(tagCount).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) return null;
  return (
    <div className="bg-white rounded shadow p-4 mb-4">
      <div className="font-bold mb-2">태그별 업무 건수</div>
      <div className="flex flex-wrap gap-2">
        {sorted.map(([tag, count]) => (
          <span key={tag} className="bg-primary-light text-primary px-2 py-1 rounded text-sm">
            #{tag} <span className="ml-1 text-xs text-gray-500">{count}건</span>
          </span>
        ))}
      </div>
    </div>
  );
}

import Insight from "./pages/Insight.jsx";
// 인사이트 탭 (정상 동작 버전)
function InsightTab({ records }) {
  // ... (이전과 동일, 생략)
  return <Insight />;
}

// 업무 기록 목록 컴포넌트 (정의 순서 이동)
function DashboardList() {
  const records = JSON.parse(localStorage.getItem("reflection-records") || "[]");
  const [selected, setSelected] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [toast, setToast] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // 필터 모달 상태 및 필터 값
  const [filterOpen, setFilterOpen] = useState(false);
  // 모달 내 임시 상태
  const [filterDate, setFilterDate] = useState({ from: "", to: "" });
  const [filterTags, setFilterTags] = useState([]);
  const [filterProject, setFilterProject] = useState("");
  // 실제 적용된 필터 상태
  const [appliedFilterDate, setAppliedFilterDate] = useState({ from: "", to: "" });
  const [appliedFilterTags, setAppliedFilterTags] = useState([]);
  const [appliedFilterProject, setAppliedFilterProject] = useState("");
  // chips 후보 목록
  const allTags = Array.from(new Set(records.flatMap((rec) => rec.tags || [])));
  const allProjects = Array.from(new Set(records.flatMap((rec) => rec.projectTags || []))).filter(Boolean);

  // 필터 적용
  const filteredRecords = records.filter((rec) => {
    // 날짜
    if (appliedFilterDate.from && rec.date < appliedFilterDate.from) return false;
    if (appliedFilterDate.to && rec.date > appliedFilterDate.to) return false;
    // 업무 태그(AND)
    if (appliedFilterTags.length > 0) {
      if (!appliedFilterTags.every((tag) => (rec.tags || []).includes(tag))) return false;
    }
    // 프로젝트 태그(단일)
    if (appliedFilterProject && !(rec.projectTags || []).includes(appliedFilterProject)) return false;
    return true;
  });

  if (records.length === 0) {
    return (
      <div className="pt-6 md:pt-10 px-5 mx-[20px]">
        <div className="text-center text-gray-400 py-12">
          <div className="text-3xl mb-2">🗒️</div>
          <div>아직 저장된 업무 회고가 없습니다.</div>
        </div>
      </div>
    );
  }

  // 상세 모달 등은 생략 (기존 코드와 동일하게 추가)
  // 상세 모달
  const renderDetailModal = (rec) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl pt-6 pb-6 px-6 font-pretendard relative flex flex-col max-h-[600px]">
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-white text-gray-900 font-semibold text-[18px] pt-4 pb-4 mb-4">
          <h2 className="text-[18px] font-semibold text-gray-900">{rec.title}</h2>
          <button
            className="text-gray-400 hover:text-gray-600 text-xl"
            style={{ fontSize: 20, color: "#888" }}
            onClick={() => setSelected(null)}
            aria-label="닫기"
          >
            &times;
          </button>
        </div>
        {/* Scrollable Content */}
        <div
          className="overflow-y-auto flex-1 min-h-0 flex flex-col"
          style={{ boxSizing: "border-box" }}
        >
          {/* 날짜 */}
          <div className="text-[18px] font-medium text-gray-800 mb-5">{rec.date}</div>
          {/* 태그 chips: 항상 "무엇을 했는가" 위에 표시 */}
          {(rec.projectTags && rec.projectTags.length > 0) && (
            <div className="mb-5">
              <div className="font-semibold text-xs text-gray-500 mb-1">프로젝트 태그</div>
              <div className="flex flex-wrap gap-2">
                {rec.projectTags.map((t) => (
                  <span
                    key={t}
                    className="text-[14px] bg-[#3EBD93] text-white px-[10px] py-[6px] rounded-full font-medium"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}
          {(rec.tags && rec.tags.length > 0) && (
            <div className="mb-5">
              <div className="font-semibold text-xs text-gray-500 mb-1">업무 태그</div>
              <div className="flex flex-wrap gap-2">
                {rec.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[14px] bg-[#A78BFA] text-white px-[10px] py-[6px] rounded-full font-medium"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="mb-5">
            <div className="text-[18px] font-semibold text-gray-900">무엇을 했는가 (What)</div>
            <div className="text-[16px] text-gray-700 leading-relaxed mt-2 whitespace-pre-line">{rec.what}</div>
          </div>
          {rec.why && (
            <div className="mb-5">
              <div className="text-[18px] font-semibold text-gray-900">왜 했는가 (Why)</div>
              <div className="text-[16px] text-gray-700 leading-relaxed mt-2 whitespace-pre-line">{rec.why}</div>
            </div>
          )}
          {rec.how && (
            <div className="mb-5">
              <div className="text-[18px] font-semibold text-gray-900">어떻게 했는가 (How)</div>
              <div className="text-[16px] text-gray-700 leading-relaxed mt-2 whitespace-pre-line">{rec.how}</div>
            </div>
          )}
          {rec.outcome && (
            <div className="mb-5">
              <div className="text-[18px] font-semibold text-gray-900">결과는 어땠는가 (Outcome)</div>
              <div className="text-[16px] text-gray-700 leading-relaxed mt-2 whitespace-pre-line">{rec.outcome}</div>
            </div>
          )}
          {rec.reflection && (
            <div className="mb-5">
              <div className="text-[18px] font-semibold text-gray-900">느낀 점 / 배운 점 (Reflection)</div>
              <div className="text-[16px] text-gray-700 leading-relaxed mt-2 whitespace-pre-line">{rec.reflection}</div>
            </div>
          )}
          {(rec.difficulty || rec.duration) && (
            <div className="mb-6">
              {/* 난이도 별점 + 점수 */}
              <div className="flex items-center text-[16px]">
                <span className="font-semibold mr-2">난이도</span>
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n} className={`text-[16px] ${n <= rec.difficulty ? "text-yellow-400" : "text-gray-300"}`}>★</span>
                ))}
                <span className="ml-2 text-[16px] text-gray-700">{rec.difficulty}점</span>
              </div>
              {/* 소요 시간은 아래 줄에 */}
              {rec.duration && rec.startTime && rec.endTime && (
                <div className="mt-2 text-[16px] text-gray-700">
                  <span className="font-semibold mr-2">소요 시간</span>
                  <span>
                    {rec.duration} ({rec.startTime} ~ {rec.endTime})
                  </span>
                </div>
              )}
              {rec.duration && (!rec.startTime || !rec.endTime) && (
                <div className="mt-2 text-[16px] text-gray-700">
                  <span className="font-semibold mr-2">소요 시간</span>
                  <span>{rec.duration}</span>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Fixed Footer */}
        <div className="flex gap-2 border-t bg-white flex-shrink-0 pt-6 mt-2">
          <button
            className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-[12px] font-bold text-base hover:bg-gray-300 transition"
            onClick={() => setEditModal(rec)}
          >
            수정
          </button>
          <button
            className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-[12px] font-bold text-base hover:bg-gray-300 transition"
            onClick={() => setDeleteModal(rec)}
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );

  // 필터/정렬 상태
  const [sort, setSort] = useState("latest");

  // 정렬만 적용
  const sortedRecords = [...records].sort((a, b) => {
    if (sort === "latest") return b.date.localeCompare(a.date);
    if (sort === "oldest") return a.date.localeCompare(b.date);
    if (sort === "high") return (b.difficulty || 0) - (a.difficulty || 0);
    if (sort === "low") return (a.difficulty || 0) - (b.difficulty || 0);
    return 0;
  });

  // 삭제 재확인 모달
  function renderDeleteModal(rec) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <div
          className="bg-white rounded-2xl w-full max-w-xs p-7 flex flex-col items-center"
          style={{
            boxShadow: "0 4px 24px 0 rgba(0,0,0,0.08)",
            minWidth: 340,
            borderRadius: 20,
          }}
        >
          <div className="font-semibold text-lg mb-6 text-center" style={{ fontWeight: 700, fontSize: 20 }}>
            정말 삭제하시겠습니까?
          </div>
          <div className="flex flex-row gap-[12px] w-full justify-center">
            <button
              style={{
                flex: 1,
                borderRadius: 12,
                padding: "10px 24px",
                background: "#F5F5F5",
                color: "#333",
                fontWeight: 500,
                fontSize: 16,
                boxShadow: "none",
                transition: "background 0.15s",
              }}
              className="hover:bg-[#ebebeb] focus:outline-none"
              onClick={() => setDeleteModal(null)}
            >
              취소
            </button>
            <button
              style={{
                flex: 1,
                borderRadius: 12,
                padding: "10px 24px",
                background: "#3EBD93",
                color: "#fff",
                fontWeight: 500,
                fontSize: 16,
                boxShadow: "none",
                transition: "background 0.15s",
              }}
              className="hover:bg-[#5ED8A9] focus:outline-none"
              onClick={() => {
                // 삭제 로직
                const records = JSON.parse(localStorage.getItem("reflection-records") || "[]");
                const next = records.filter(r => r.id !== rec.id);
                localStorage.setItem("reflection-records", JSON.stringify(next));
                setDeleteModal(null);
                setSelected(null);
                setToast("업무 기록이 삭제되었습니다!");
                setTimeout(() => setToast(""), 2000);
                if (typeof setRefresh === "function") setRefresh(r => (r || 0) + 1);
              }}
            >
              확인
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-6 md:pt-10 mx-[20px]">
      {toast && (
        <div
          className="fixed top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded shadow-lg z-50 text-sm animate-fade-in"
          style={{ minWidth: 220, textAlign: "center" }}
        >
          {toast}
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <span className="font-bold text-[24px] md:text-[30px] text-[#1E1E1E]">업무 기록 목록</span>
        <button
          className="btn-primary px-5 py-2.5 text-base font-bold rounded-lg"
          style={{ minWidth: 0 }}
          onClick={() => setShowAddModal(true)}
        >
          업무 기록 추가
        </button>
      </div>
      <div className="flex items-center gap-2 mb-4 mt-6">
        <button
          className="px-4 py-2 rounded bg-white border border-primary text-primary font-semibold shadow hover:bg-primary-90 transition"
          onClick={() => {
            setFilterDate(appliedFilterDate);
            setFilterTags(appliedFilterTags);
            setFilterProject(appliedFilterProject);
            setFilterOpen(true);
          }}
        >
          필터
        </button>
        <div className="relative ml-auto">
          <select
            className="border border-[#D0D5DD] rounded-[8px] h-9 px-3 pr-8 text-[14px] text-[#1E1E1E] bg-white appearance-none focus:border-[#3EBD93] hover:border-[#3EBD93] transition"
            value={sort}
            onChange={e => setSort(e.target.value)}
            style={{ minWidth: 120 }}
            aria-label="정렬"
          >
            <option value="latest">최신 순</option>
            <option value="oldest">오래된 순</option>
            <option value="high">난이도 높은 순</option>
            <option value="low">난이도 낮은 순</option>
          </select>
          <svg
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-300"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      {/* 적용된 필터 chips */}
      {(appliedFilterTags.length > 0 ||
        appliedFilterProject ||
        appliedFilterDate.from ||
        appliedFilterDate.to) && (
        <div className="flex flex-wrap gap-2 mb-2">
          {appliedFilterTags.map((tag) => (
            <span
              key={tag}
              className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs"
            >
              #{tag}
            </span>
          ))}
          {appliedFilterDate.from || appliedFilterDate.to ? (
            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
              {(appliedFilterDate.from
                ? appliedFilterDate.from.replace(/-/g, ".")
                : "") +
                (appliedFilterDate.from && appliedFilterDate.to ? " ~ " : "") +
                (appliedFilterDate.to ? appliedFilterDate.to.replace(/-/g, ".") : "")}
            </span>
          ) : null}
          {appliedFilterProject && (
            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">
              프로젝트: {appliedFilterProject}
            </span>
          )}
        </div>
      )}
      {/* 필터 모달 */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md relative flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b flex-shrink-0">
              <span className="font-bold text-lg text-center w-full block">필터</span>
              <button
                className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 text-2xl"
                onClick={() => setFilterOpen(false)}
                aria-label="닫기"
              >
                &times;
              </button>
            </div>
            {/* Content */}
            <div className="overflow-y-auto px-6 py-4 flex-1 min-h-0 space-y-6">
              {/* 날짜 범위 */}
              <div>
                <div className="font-semibold mb-1">날짜 범위</div>
                <div className="flex gap-2 items-center">
                  <input
                    type="date"
                    name="from"
                    value={filterDate.from}
                    onChange={e => setFilterDate(r => ({ ...r, from: e.target.value }))}
                    className="border rounded px-2 py-1"
                  />
                  <span className="mx-1">~</span>
                  <input
                    type="date"
                    name="to"
                    value={filterDate.to}
                    onChange={e => setFilterDate(r => ({ ...r, to: e.target.value }))}
                    className="border rounded px-2 py-1"
                  />
                </div>
              </div>
              {/* 업무 태그 (다중 chips) */}
              <div>
                <div className="font-semibold mb-1">업무 태그</div>
                <div className="flex flex-wrap gap-2">
                  {allTags.length === 0 ? (
                    <span className="text-gray-400 text-sm">등록된 태그 없음</span>
                  ) : (
                    allTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className={`px-2 py-1 rounded border text-sm transition ${
                          filterTags.includes(tag)
                            ? "bg-blue-500 text-white border-blue-500"
                            : "bg-white text-gray-700 border-gray-300"
                        }`}
                        onClick={() =>
                          setFilterTags((prev) =>
                            prev.includes(tag)
                              ? prev.filter((t) => t !== tag)
                              : [...prev, tag]
                          )
                        }
                      >
                        {tag}
                      </button>
                    ))
                  )}
                </div>
              </div>
              {/* 프로젝트 태그 (단일 chips) */}
              <div>
                <div className="font-semibold mb-1">프로젝트 태그</div>
                <div className="flex flex-wrap gap-2">
                  {allProjects.length === 0 ? (
                    <span className="text-gray-400 text-sm">등록된 프로젝트 태그 없음</span>
                  ) : (
                    allProjects.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className={`px-2 py-1 rounded border text-sm transition ${
                          filterProject === tag
                            ? "bg-green-500 text-white border-green-500"
                            : "bg-white text-gray-700 border-gray-300"
                        }`}
                        onClick={() =>
                          setFilterProject(prev => prev === tag ? "" : tag)
                        }
                      >
                        {tag}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
            {/* Footer */}
            <div className="flex gap-2 px-6 py-4 border-t bg-white flex-shrink-0">
              <button
                className="flex-1 bg-[#F5F5F5] text-[#1E1E1E] py-3 rounded-[12px] font-bold text-base hover:bg-gray-200 transition"
                onClick={() => {
                  setFilterDate({ from: "", to: "" });
                  setFilterTags([]);
                  setFilterProject("");
                  setAppliedFilterDate({ from: "", to: "" });
                  setAppliedFilterTags([]);
                  setAppliedFilterProject("");
                }}
              >
                초기화
              </button>
              <button
                className="flex-1 bg-[#3EBD93] text-white py-3 rounded-[12px] font-bold text-base hover:bg-[#32a47f] transition"
                onClick={() => {
                  setAppliedFilterDate(filterDate);
                  setAppliedFilterTags(filterTags);
                  setAppliedFilterProject(filterProject);
                  setFilterOpen(false);
                }}
              >
                적용
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-2">
        {sortedRecords
          .filter(rec => filteredRecords.includes(rec))
          .map((rec) => (
            <button
              key={rec.id}
              className="w-full text-left bg-white rounded-[16px] shadow-soft p-5 mb-2 border border-gray-100 flex flex-col gap-2 hover:bg-gray-50 transition"
              onClick={() => setSelected(rec)}
            >
              {/* 프로젝트 태그 + 업무 태그 칩 한 줄에 표시 */}
              {(rec.projectTags?.length > 0 || rec.tags?.length > 0) && (
                <div className="flex flex-wrap gap-1 mb-1">
                  {rec.projectTags && rec.projectTags.map((t) => (
                    <span key={`project-${t}`} className="bg-primary text-white px-2 py-1 rounded text-xs font-semibold">{`#${t}`}</span>
                  ))}
                  {rec.tags && rec.tags.map((t) => (
                    <span key={`tag-${t}`} className="bg-[#a78bfa] text-white px-2 py-1 rounded text-xs font-semibold">{`#${t}`}</span>
                  ))}
                </div>
              )}
              <div className="text-base font-semibold">{rec.title}</div>
              <div className="text-[16px] text-gray-400">{rec.date}</div>
              <div className="text-sm text-gray-500 font-light line-clamp-2">{rec.what}</div>
            </button>
          ))}
      </div>
      {selected && renderDetailModal(selected)}
      {editModal && (
        <WorklogModal
          onSave={data => {
            handleEditSave(data);
          }}
          onCancel={() => setEditModal(null)}
          initialData={editModal}
          showToast={msg => {
            setTimeout(() => setToast(msg), 0);
            setTimeout(() => setToast(""), 2000);
          }}
        />
      )}
      {deleteModal && renderDeleteModal(deleteModal)}
      {showAddModal && (
        <WorklogModal
          onSave={data => {
            setShowAddModal(false);
            setToast("업무 기록이 저장되었습니다!");
            setTimeout(() => setToast(""), 2000);
            // 새 기록 추가
            const records = JSON.parse(localStorage.getItem("reflection-records") || "[]");
            records.push({ ...data, id: Date.now().toString() });
            localStorage.setItem("reflection-records", JSON.stringify(records));
            if (typeof window !== "undefined") window.dispatchEvent(new Event("storage")); // 동기화
          }}
          onCancel={() => setShowAddModal(false)}
          initialData={null}
          showToast={msg => {
            setTimeout(() => setToast(msg), 0);
            setTimeout(() => setToast(""), 2000);
          }}
        />
      )}
    </div>
  );

  // 기록 수정 저장 핸들러
  function handleEditSave(data) {
    // 필수 입력 체크
    if (!data.title || !data.what) {
      alert("업무 제목과 '무엇을 했는가'는 필수 입력입니다.");
      return;
    }
    // localStorage에서 해당 id의 기록을 찾아 갱신
    const records = JSON.parse(localStorage.getItem("reflection-records") || "[]");
    const idx = records.findIndex(r => r.id === data.id);
    if (idx !== -1) {
      records[idx] = { ...records[idx], ...data };
      localStorage.setItem("reflection-records", JSON.stringify(records));
      setEditModal(null);
      setToast("업무 기록이 수정되었습니다!");
      setTimeout(() => setToast(""), 2000);
      if (typeof setRefresh === "function") setRefresh(r => (r || 0) + 1);
    }
  }
  }


function MonthlySummaryCard({ records }) {
  if (!records || records.length === 0) {
    return (
      <div className="bg-white rounded-[20px] shadow-sm p-6 flex flex-col h-full w-full justify-center items-center min-h-[180px] border border-gray-100 text-left">
        <div className="mb-2">
          <svg width="48" height="48" fill="none"><circle cx="24" cy="24" r="22" fill="#E0E7FF"/><path d="M16 24h16M24 16v16" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round"/></svg>
        </div>
        <div className="text-gray-400 text-base font-semibold mb-1">이번 달 기록이 없습니다.</div>
      </div>
    );
  }

  // 태그 카운트
  const tagCount = {};
  records.forEach((rec) => {
    (rec.tags || []).forEach((tag) => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
  });
  let maxCount = 0;
  let mostUsedTags = [];
  Object.entries(tagCount).forEach(([tag, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostUsedTags = [tag];
    } else if (count === maxCount && count > 0) {
      mostUsedTags.push(tag);
    }
  });

  // 총 소요 시간 계산 (분 단위 -> 시:분)
  const totalMinutes = records.reduce((sum, rec) => sum + (typeof rec.time === "number" ? rec.time : 0), 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const totalTimeStr =
    totalMinutes > 0
      ? `총 소요 시간: ${hours > 0 ? `${hours}시간 ` : ""}${minutes}분`
      : "총 소요 시간: 0분";

  return (
    <div className="bg-white rounded-[20px] shadow-sm p-6 flex flex-col items-start min-h-[180px] border border-gray-100 text-left">
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 bg-indigo-200 rounded-full flex items-center justify-center mr-3">
          <svg width="28" height="28" fill="none"><circle cx="14" cy="14" r="12" fill="#6366F1" fillOpacity="0.18"/><path d="M14 8v6l4 2" stroke="#4F46E5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div className="font-bold text-indigo-700 text-lg">이번 달 업무 요약</div>
      </div>
      {/* 두 개의 카드로 분리 */}
      <div className="w-full">
        {/* 첫 번째 줄: 총 업무, 총 소요 시간 */}
        <div className="flex flex-row gap-4 w-full mb-2 mt-1 flex-wrap">
          {/* 총 업무 카드 */}
          <div
            className="flex-1 min-w-[120px] rounded-xl p-4 flex flex-col justify-center text-left"
            style={{ background: "#F7F7F8" }}
          >
            <div className="text-xs text-gray-500 font-semibold">이번 달 기록된 총 업무</div>
            <div className="flex items-end gap-1 mt-2">
              <span className="text-2xl font-extrabold text-indigo-700">{records.length}</span>
              <span className="text-base font-semibold text-indigo-600">건</span>
            </div>
          </div>
          {/* 총 소요 시간 카드 */}
          <div
            className="flex-1 min-w-[120px] rounded-xl p-4 flex flex-col justify-center text-left"
            style={{ background: "#F7F7F8" }}
          >
            <div className="text-xs text-gray-500 font-semibold">총 소요 시간</div>
            <div className="inline-flex items-center gap-1 text-gray-700 text-base font-semibold mt-2">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" />
                <path d="M10 6v4l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {hours > 0 ? `${hours}시간 ` : ""}
              {minutes}분
            </div>
          </div>
        </div>
        {/* 두 번째 줄: 가장 많이 사용된 태그 */}
        <div className="w-full flex flex-row gap-4">
          <div
            className="flex-1 min-w-[120px] rounded-xl p-4 flex flex-col justify-center text-left"
            style={{ background: "#F7F7F8" }}
          >
            <div className="text-xs text-gray-500 font-semibold">가장 많이 사용된 태그</div>
            <div className="flex flex-wrap gap-2 mt-2">
              {mostUsedTags.length > 0 ? (
                mostUsedTags.map((tag) => (
                  <span key={tag} className="bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded text-xs font-bold shadow-sm">#{tag}</span>
                ))
              ) : (
                <span className="text-gray-400 text-sm">태그 없음</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MonthSelector({ selectedYearMonth, setSelectedYearMonth, openMonthPicker }) {
  const { year, month } = selectedYearMonth;
  function prevMonth() {
    if (month === 0) setSelectedYearMonth({ year: year - 1, month: 11 });
    else setSelectedYearMonth({ year, month: month - 1 });
  }
  function nextMonth() {
    if (month === 11) setSelectedYearMonth({ year: year + 1, month: 0 });
    else setSelectedYearMonth({ year, month: month + 1 });
  }
  function handleInput(e) {
    const [yyyy, mm] = e.target.value.split("-");
    setSelectedYearMonth({ year: Number(yyyy), month: Number(mm) - 1 });
  }
  const display = `${year}년 ${String(month + 1).padStart(2, "0")}월`;
  return (
    <div className="flex flex-row items-center gap-3 w-full">
      <button
        className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
        onClick={prevMonth}
        aria-label="이전 달"
        type="button"
      >
        <svg width="28" height="28" fill="none"><path d="M17 21l-6-7 6-7" stroke="#222" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <span className="text-[1.35rem] font-bold text-[#222] select-none">{display}</span>
      <button
        className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
        onClick={openMonthPicker}
        aria-label="달력에서 월 선택"
        type="button"
      >
        <svg width="28" height="28" fill="none" viewBox="0 0 28 28">
          <rect x="4" y="7" width="20" height="15" rx="3" fill="#E5E8EB"/>
          <rect x="4" y="7" width="20" height="15" rx="3" stroke="#222" strokeWidth="1.5"/>
          <rect x="8" y="3" width="2" height="4" rx="1" fill="#222"/>
          <rect x="18" y="3" width="2" height="4" rx="1" fill="#222"/>
        </svg>
      </button>
      <button
        className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
        onClick={nextMonth}
        aria-label="다음 달"
        type="button"
      >
        <svg width="28" height="28" fill="none"><path d="M11 7l6 7-6 7" stroke="#222" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    </div>
  );
}

// Dashboard 컴포넌트
function Dashboard() {
  const [refresh, setRefresh] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const records = JSON.parse(localStorage.getItem("reflection-records") || "[]");

  // 연/월 상태 (객체로 관리)
  const now = new Date();
  const [selectedYearMonth, setSelectedYearMonth] = useState({
    year: now.getFullYear(),
    month: now.getMonth()
  });

  // Month Picker 모달 상태
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // 선택된 연월에 해당하는 기록만 필터링
  const [filteredRecords, setFilteredRecords] = useState([]);
  React.useEffect(() => {
    const allRecords = JSON.parse(localStorage.getItem("reflection-records") || "[]");
    const ymStr = `${selectedYearMonth.year}-${String(selectedYearMonth.month + 1).padStart(2, "0")}`;
    setFilteredRecords(
      allRecords.filter(r => r.date && r.date.startsWith(ymStr))
    );
  }, [selectedYearMonth]);

  return (
    <>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="min-h-screen bg-gray-50 flex flex-row">
        {/* LNB */}
        <aside className="hidden md:flex flex-col w-[212px] min-h-screen bg-white border-r px-4 fixed left-0 top-0 z-40">
        {/* Logo Area */}
        <div className="flex items-center gap-[2px] py-4 mb-6">
          <img
            src="/ic_habitree.png"
            alt="Habitree Logo"
            className="w-7 h-7"
            style={{ width: 28, height: 28 }}
          />
          <span
            className="select-none"
            style={{
              fontFamily: "'Montserrat Alternates', sans-serif",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: '-0.05em',
              color: '#000000',
              lineHeight: '32px'
            }}
          >
            Habitree
          </span>
        </div>
        {[
          {
            key: "home",
            label: "홈",
            icon: (active) => (
              // Toss style home icon
              <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                <path
                  d="M3.5 8.8 10 3l6.5 5.8"
                  stroke={active ? "#009967" : "#777777"}
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect
                  x="6"
                  y="11"
                  width="8"
                  height="6"
                  rx="1.5"
                  stroke={active ? "#009967" : "#777777"}
                  strokeWidth="1.7"
                />
              </svg>
            ),
          },
          {
            key: "list",
            label: "업무내역",
            icon: (active) => (
              // Toss style list icon
              <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                <rect
                  x="4"
                  y="5.5"
                  width="12"
                  height="2"
                  rx="1"
                  fill={active ? "#009967" : "#777777"}
                />
                <rect
                  x="4"
                  y="9"
                  width="12"
                  height="2"
                  rx="1"
                  fill={active ? "#009967" : "#777777"}
                />
                <rect
                  x="4"
                  y="12.5"
                  width="12"
                  height="2"
                  rx="1"
                  fill={active ? "#009967" : "#777777"}
                />
              </svg>
            ),
          },
          {
            key: "insight",
            label: "인사이트",
            icon: (active) => (
              // Toss style graph icon
              <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                <rect
                  x="4"
                  y="11"
                  width="2.5"
                  height="5"
                  rx="1.25"
                  fill={active ? "#009967" : "#777777"}
                />
                <rect
                  x="8.75"
                  y="7"
                  width="2.5"
                  height="9"
                  rx="1.25"
                  fill={active ? "#009967" : "#777777"}
                />
                <rect
                  x="13.5"
                  y="4"
                  width="2.5"
                  height="12"
                  rx="1.25"
                  fill={active ? "#009967" : "#777777"}
                />
              </svg>
            ),
          },
        ].map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              className={`flex flex-row items-center gap-3 w-full py-2.5 px-3 rounded-lg font-semibold text-[16px] transition
                ${isActive
                  ? "bg-[#F2FCF7] text-[#009967]"
                  : "bg-transparent text-[#222] hover:bg-gray-50"}
              `}
              style={{
                marginBottom: "2px",
                outline: isActive ? "2px solid #009967" : "none",
                outlineOffset: isActive ? "0px" : undefined,
                boxShadow: isActive ? "0 0 0 2px #E0F7EF" : undefined,
              }}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="flex items-center justify-center" style={{ width: 20, height: 20 }}>
                {tab.icon(isActive)}
              </span>
              <span className="flex-1 text-left">{tab.label}</span>
            </button>
          );
        })}
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-8 px-2 md:ml-[212px] w-full pt-[68px] md:pt-0">
        <div>
          {activeTab === "home" && (
            <div className="w-full max-w-[1200px] mx-auto px-5 pt-6 md:pt-10" style={{ boxSizing: "border-box" }}>
              {/* 상단 타이틀/버튼 */}
              <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 w-full">
                <div className="text-2xl md:text-3xl font-bold text-gray-800 text-left w-full md:w-auto">
                  하루의 기록이,<br className="hidden md:block" /> 성장의 밑거름이 됩니다.
                </div>
<button
  className="bg-[#3EBD93] text-white font-bold rounded-[12px] px-5 py-2.5 text-base shadow hover:bg-[#34b183] transition w-full md:w-auto"
  style={{ minWidth: 140 }}
  onClick={() => {
    setActiveTab("list");
    setShowModal(true);
  }}
>
  업무 기록 추가
</button>
              </div>
              {/* 연/월 선택 카드 UI */}
              <div className="bg-white rounded-2xl shadow p-4 flex items-center justify-center mb-8 w-full border border-gray-100">
                <MonthSelector
                  selectedYearMonth={selectedYearMonth}
                  setSelectedYearMonth={setSelectedYearMonth}
                  openMonthPicker={() => setShowMonthPicker(true)}
                />
              </div>
              {/* Month Picker 모달 (구현 필요시 여기에 추가) */}
              {showMonthPicker && (
                <MonthPicker
                  onSelect={(year, month) => {
                    setSelectedYearMonth({ year, month });
                    setShowMonthPicker(false);
                  }}
                  onClose={() => setShowMonthPicker(false)}
                  selectedYearMonth={selectedYearMonth}
                />
              )}
              {/* 2x2 대시보드 카드 그리드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 w-full min-h-[400px]">
                {/* MonthlySummaryCard */}
                <MonthlySummaryCard records={filteredRecords} />
                {/* WorkCalendar */}
                <WorkCalendar records={filteredRecords} />
                {/* TagDistributionChart */}
                <TagDistributionChart records={filteredRecords} />
                {/* WeeklyAISummary */}
                <WeeklyAISummary records={filteredRecords} />
              </div>
            </div>
          )}
          {activeTab === "list" && (
            <DashboardList key={refresh} />
          )}
          {activeTab === "insight" && (
            <Insight />
          )}
        </div>
        {showModal && (
          <WorklogModal
            onSave={data => {
              setShowModal(false);
              setRefresh(r => r + 1);
            }}
            onCancel={() => setShowModal(false)}
            initialData={null}
            showToast={msg => {
              setTimeout(() => setToast(msg), 0);
              setTimeout(() => setToast(""), 2000);
            }}
          />
        )}
      </main>
    </div>
    </>
  );
}

// MonthPicker 모달 컴포넌트 (간단 버전)
function MonthPicker({ onSelect, onClose, selectedYearMonth }) {
  // 연/월 선택용 상태
  const [year, setYear] = useState(selectedYearMonth.year);
  const [month, setMonth] = useState(selectedYearMonth.month);

  // 연도 범위 (예시: 5년 전 ~ 2년 후)
  const yearOptions = [];
  for (let y = year - 5; y <= year + 2; y++) yearOptions.push(y);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xs p-6 flex flex-col items-center">
        <div className="font-bold text-lg mb-4">월 선택</div>
        <div className="flex gap-2 mb-4">
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {yearOptions.map(y => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
          <select
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i} value={i}>{i + 1}월</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 w-full">
          <button
            className="flex-1 bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 transition"
            onClick={() => { onSelect(year, month); }}
          >
            선택
          </button>
          <button
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded font-bold hover:bg-gray-300 transition"
            onClick={onClose}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

function WorkCalendar({ records }) {
  // 날짜별 기록 맵
  const dateMap = {};
  records.forEach((rec) => {
    if (rec.date) {
      if (!dateMap[rec.date]) dateMap[rec.date] = [];
      dateMap[rec.date].push(rec);
    }
  });

  // 달력 그리드용 배열 생성 (기록이 없으면 오늘 기준으로 달력만 생성)
  const now = new Date();
  const year = records[0]?.date ? Number(records[0].date.slice(0, 4)) : now.getFullYear();
  const month = records[0]?.date ? Number(records[0].date.slice(5, 7)) - 1 : now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay();
  const calendar = [];
  let day = 1;
  for (let i = 0; i < 6; i++) {
    const week = [];
    for (let j = 0; j < 7; j++) {
      if ((i === 0 && j < startWeekday) || day > daysInMonth) {
        week.push(null);
      } else {
        week.push(day);
        day++;
      }
    }
    calendar.push(week);
  }

  // 모달 상태
  const [modalDate, setModalDate] = useState(null);

  // 기록이 하나도 없을 때
  if (!records || records.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow p-6 flex flex-col h-full w-full justify-center items-center min-h-[180px] border border-gray-100">
        <div className="mb-2">
          <svg width="48" height="48" fill="none"><rect x="4" y="8" width="40" height="32" rx="8" fill="#DBEAFE"/><rect x="4" y="8" width="40" height="32" rx="8" stroke="#3B82F6" strokeWidth="2"/><rect x="16" y="4" width="4" height="8" rx="2" fill="#3B82F6"/><rect x="28" y="4" width="4" height="8" rx="2" fill="#3B82F6"/></svg>
        </div>
        <div className="text-gray-400 text-base font-semibold mb-1">기록된 날짜가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[20px] shadow-sm p-6 flex flex-col min-h-[180px] border border-gray-100 text-left">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <svg width="20" height="20" fill="none"><rect x="2" y="4" width="16" height="14" rx="3" fill="#3B82F6" fillOpacity="0.15"/><rect x="2" y="4" width="16" height="14" rx="3" stroke="#2563EB" strokeWidth="1.5"/><rect x="6" y="2" width="2" height="4" rx="1" fill="#2563EB"/><rect x="12" y="2" width="2" height="4" rx="1" fill="#2563EB"/></svg>
        </div>
        <div className="font-bold text-blue-700 text-lg">이번 달 업무 캘린더</div>
      </div>
      <div className="w-full">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold text-gray-700">{year}년 {String(month + 1).padStart(2, "0")}월</span>
          <span className="text-xs text-gray-400">기록 있는 날짜 ● 표시</span>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-sm font-semibold text-gray-500 mb-1">
          {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendar.flat().map((d, idx) => {
            if (!d) return <div key={idx} className="h-9" />;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const hasRecord = !!dateMap[dateStr];
            return (
              <button
                key={idx}
                className={`relative h-9 w-full rounded-lg flex flex-col items-center justify-center transition
                  ${hasRecord
                    ? "bg-blue-50 border border-blue-300 font-bold text-blue-700 hover:bg-blue-100"
                    : "bg-gray-50 border border-gray-100 text-gray-700 hover:bg-gray-100"
                  }`}
                onClick={() => hasRecord && setModalDate(dateStr)}
                disabled={!hasRecord}
                style={{ cursor: hasRecord ? "pointer" : "default" }}
              >
                <span>{d}</span>
                {hasRecord && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-blue-500"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      {/* 날짜별 기록 모달 */}
      {modalDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md relative flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b flex-shrink-0">
              <span className="font-bold text-lg text-center w-full block">
                {modalDate} 업무 기록
              </span>
              <button
                className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 text-2xl"
                onClick={() => setModalDate(null)}
                aria-label="닫기"
              >
                &times;
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-4 flex-1 min-h-0">
              {dateMap[modalDate] && dateMap[modalDate].length > 0 ? (
                <ul className="space-y-3">
                  {dateMap[modalDate].map((rec) => (
                    <li key={rec.id} className="p-3 rounded bg-blue-50 border border-blue-100">
                      <div className="font-bold text-blue-700">{rec.title}</div>
                      <div className="text-xs text-gray-500 mb-1">{rec.what}</div>
                      <div className="flex flex-wrap gap-1">
                        {(rec.tags || []).map((tag) => (
                          <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">#{tag}</span>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-400 text-center py-8">해당 날짜에 기록된 업무가 없습니다.</div>
              )}
            </div>
            <div className="flex gap-2 px-6 py-4 border-t bg-white flex-shrink-0">
              <button
                className="flex-1 bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 transition"
                onClick={() => setModalDate(null)}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
Chart.register(ArcElement, Tooltip, Legend);

function TagDistributionChart({ records }) {
  if (!records || records.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow p-6 flex flex-col h-full w-full justify-center items-center min-h-[180px] border border-gray-100">
        <div className="mb-2">
          <svg width="48" height="48" fill="none"><circle cx="24" cy="24" r="22" fill="#FEF3C7"/><path d="M24 16v8l6 4" stroke="#F59E42" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div className="text-gray-400 text-base font-semibold mb-1">이번 달 기록이 없습니다.</div>
      </div>
    );
  }

  // 태그별 카운트
  const tagCount = {};
  records.forEach((rec) => {
    (rec.tags || []).forEach((tag) => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
  });
  const tags = Object.keys(tagCount);
  const total = Object.values(tagCount).reduce((a, b) => a + b, 0);

  // 파스텔톤 색상 팔레트 (연보라, 민트, 연주황 등)
  const palette = [
    "#B5B8FF", // 연보라
    "#A7F3D0", // 민트
    "#FFD6A5", // 연주황
    "#BDE0FE", // 연하늘
    "#FFC6FF", // 연핑크
    "#C3F8FF", // 밝은 민트
    "#FFFACD", // 연노랑
    "#D0F4DE", // 연초록
    "#E2E2FF", // 밝은 보라
    "#FFE5EC", // 연핑크2
  ];

  // Chart.js 데이터 및 옵션
  const data = {
    labels: tags,
    datasets: [
      {
        data: tags.map((tag) => tagCount[tag]),
        backgroundColor: tags.map((_, i) => palette[i % palette.length]),
        borderWidth: 0,
        borderRadius: 24, // 둥근 끝
        spacing: 6, // 각 조각 사이의 간격 (Chart.js 4.x)
        // segmentSpacing: 6, // Chart.js 4.x 이상에서만 지원
      },
    ],
  };

  const options = {
    cutout: "75%", // 도넛 두께(중앙 빈 공간을 넓혀서 더 날렵하게)
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.parsed || 0;
            return `#${label}: ${value}건`;
          },
        },
      },
    },
    elements: {
      arc: {
        borderWidth: 0,
        borderRadius: 24,
        spacing: 6,
      },
    },
    // maintainAspectRatio: false,
  };

  return (
    <div className="bg-white rounded-[20px] shadow-sm p-6 flex flex-col min-h-[180px] border border-gray-100 text-left">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
          <svg width="20" height="20" fill="none"><circle cx="10" cy="10" r="8" fill="#FFD6A5" fillOpacity="0.15"/><circle cx="10" cy="10" r="7" stroke="#FFD6A5" strokeWidth="1.5"/></svg>
        </div>
        <div className="font-bold text-yellow-700 text-lg">업무 태그별 분포</div>
      </div>
      <div className="flex flex-row items-center w-full justify-center gap-8">
        {/* 도넛 그래프 */}
        <div style={{ width: 180, height: 180, position: "relative" }}>
          <Doughnut data={data} options={options} />
          {/* 중앙에 총 건수 표시 (absolute overlay) */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              fontSize: 22,
              fontWeight: "bold",
              color: "#222",
              zIndex: 1,
            }}
          >
            {`총 ${total}건`}
          </div>
        </div>
        {/* 범례: 그래프 오른쪽에 세로 정렬 */}
        <div className="flex flex-col gap-2 ml-2">
          {tags.map((tag, i) => (
            <div key={tag + "-legend"} className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full" style={{ background: palette[i % palette.length] }}></span>
              <span className="text-sm font-semibold text-gray-700">
                {tag} <span className="text-xs text-gray-400">({tagCount[tag]})</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WeeklyAISummary({ records }) {
  // 선택된 월의 '무엇을 했는가 (What)' 필드만 추출한 배열
  const whatArray = (records || []).map(r => r.what).filter(Boolean);

  // OpenAI GPT API 연동
  const [aiSummary, setAISummary] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // 실제 서비스에서는 환경변수 등으로 관리 필요
  const OPENAI_API_KEY = "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"; // 여기에 본인의 OpenAI API 키 입력

  // 프롬프트 생성 함수
  function buildPrompt(whatArr) {
    // 더 이상 사용하지 않음 (직접 messages로 전달)
    return whatArr.join("\n");
  }

  // 월/records 변경 시 자동 요약
  React.useEffect(() => {
    let ignore = false;
    if (whatArray.length === 0) {
      setAISummary("");
      setError("");
      setLoading(false);
      return;
    }
    async function fetchAISummary() {
      if (!OPENAI_API_KEY) {
        setAISummary("");
        setError("");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      setAISummary("");
      try {
        const userContent = whatArray.join("\n");
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content:
                  "당신은 사용자의 업무 인사이트를 요약하는 전문가입니다. 아래 사용자의 업무 활동 내용을 바탕으로 해당 월의 핵심적인 업무 흐름을 요약해 주세요. 하나의 문장으로만, 100자 이내로 작성해주세요.",
              },
              { role: "user", content: userContent },
            ],
            max_tokens: 200,
            temperature: 0.5,
          }),
        });
        if (!res.ok) throw new Error("OpenAI API 호출 실패");
        const data = await res.json();
        const summary = data.choices?.[0]?.message?.content?.trim() || "";
        if (!ignore) {
          setAISummary(summary);
          // (옵션) localStorage 저장
          localStorage.setItem("ai-monthly-summary", JSON.stringify({ summary, date: new Date().toISOString() }));
        }
      } catch (e) {
        if (!ignore) setError("AI 요약 생성에 실패했습니다.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchAISummary();
    return () => { ignore = true; };
    // eslint-disable-next-line
  }, [OPENAI_API_KEY, whatArray.map(w => w).join("|")]);

  // 기록이 없으면 엠티 스테이트
  if (!records || whatArray.length === 0) {
    return (
      <div className="bg-white rounded-[20px] shadow-sm p-6 flex flex-col h-full w-full justify-center items-center min-h-[180px] border border-gray-100 text-center">
        <div className="text-4xl mb-3">😶‍🌫️</div>
        <div className="text-gray-400 text-base font-semibold">작성된 업무 기록이 없습니다.</div>
      </div>
    );
  }

  // 예시: localStorage에 "ai-weekly-summary" 또는 "weekly-ai-summary" 등으로 저장되어 있다고 가정
  let summaryData = null;
  try {
    summaryData =
      JSON.parse(localStorage.getItem("ai-weekly-summary")) ||
      JSON.parse(localStorage.getItem("weekly-ai-summary")) ||
      null;
  } catch {
    summaryData = null;
  }

  const hasData = summaryData && (
    summaryData.summary ||
    (Array.isArray(summaryData.growthPoints) && summaryData.growthPoints.length > 0) ||
    (Array.isArray(summaryData.improvement) && summaryData.improvement.length > 0) ||
    (Array.isArray(summaryData.nextSteps) && summaryData.nextSteps.length > 0)
  );

  return (
    <div className="bg-white rounded-[20px] shadow-sm p-6 flex flex-col min-h-[180px] border border-gray-100 text-left">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
          <svg width="22" height="22" fill="none"><circle cx="11" cy="11" r="9" fill="#A78BFA" fillOpacity="0.18"/><path d="M7 11.5l2.5 2L15 8.5" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div className="font-bold text-purple-700 text-lg">월간 AI 요약</div>
      </div>
      <div className="flex flex-col gap-2 items-center justify-center flex-1 min-h-[80px]">
        {aiSummary && (
          <div className="text-gray-800 text-base font-semibold mb-2 text-left">{aiSummary}</div>
        )}
        {error && (
          <div className="text-red-500 text-sm mb-2">{error}</div>
        )}
        {loading && (
          <div className="text-gray-500 text-sm">AI 요약 생성 중...</div>
        )}
        {!OPENAI_API_KEY && (
          <div className="text-xs text-gray-400 mt-2">OpenAI API 키를 코드에 입력해야 정상 동작합니다.</div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
