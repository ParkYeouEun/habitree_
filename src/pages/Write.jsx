// 전체 코드 수정: 모달 기반 필터 UI 및 적용 태그 표시 기능 추가

import React, { useState, useEffect } from "react";
import TagSelector from "../components/TagSelector";
import WorklogModal from "../components/WorklogModal.jsx";

/**
 * 업무 회고 작성/수정 폼 (Dashboard 등에서 사용)
 */
function ReflectionForm({ onSave, onCancel, hideButtons, initialData, showToast = true }) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [tags, setTags] = useState(initialData?.tags || []);
  const [projectTags, setProjectTags] = useState(initialData?.projectTags || []);
  const [what, setWhat] = useState(initialData?.what || "");
  const [why, setWhy] = useState(initialData?.why || "");
  const [how, setHow] = useState(initialData?.how || "");
  const [outcome, setOutcome] = useState(initialData?.outcome || "");
  const [reflection, setReflection] = useState(initialData?.reflection || "");
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || 3);
  const [startTime, setStartTime] = useState(initialData?.startTime || "");
  const [endTime, setEndTime] = useState(initialData?.endTime || "");
  const [toast, setToast] = useState(false);

  // 프로젝트 태그 단일 선택 래퍼
  const setProjectTagsSingle = (arr) => {
    if (arr.length === 0) setProjectTags([]);
    else setProjectTags([arr[arr.length - 1]]);
  };

  // Calculate duration
  let duration = "";
  if (startTime && endTime) {
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    let mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins < 0) mins += 24 * 60;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    duration = `${h ? h + "시간 " : ""}${m ? m + "분" : ""}`.trim();
  }

  const handleSave = (e) => {
    e.preventDefault();
    if (!title.trim() || !what.trim()) {
      alert("업무 제목과 '무엇을 했는가'는 필수 입력입니다.");
      return;
    }
    let record;
    if (initialData && initialData.id) {
      // 수정 모드: 기존 id/date 유지, 나머지 갱신
      record = {
        ...initialData,
        title,
        tags,
        projectTags,
        what,
        why,
        how,
        outcome,
        reflection,
        difficulty,
        startTime: startTime || null,
        endTime: endTime || null,
        duration: startTime && endTime ? duration : null,
      };
      const prev = JSON.parse(localStorage.getItem("reflection-records") || "[]");
      localStorage.setItem(
        "reflection-records",
        JSON.stringify([record, ...prev.filter(r => r.id !== initialData.id)])
      );
    } else {
      // 신규 등록
      record = {
        id: Date.now(),
        date: new Date().toISOString().slice(0, 10),
        title,
        tags,
        projectTags,
        what,
        why,
        how,
        outcome,
        reflection,
        difficulty,
        startTime: startTime || null,
        endTime: endTime || null,
        duration: startTime && endTime ? duration : null,
      };
      const prev = JSON.parse(localStorage.getItem("reflection-records") || "[]");
      localStorage.setItem("reflection-records", JSON.stringify([record, ...prev]));
    }
    if (showToast) {
      setToast(true);
      setTimeout(() => {
        setToast(false);
        onSave && onSave(record);
      }, 1200);
    } else {
      onSave && onSave(record);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {/* 날짜 표시 */}
      {initialData?.date && (
        <div className="text-[18px] font-medium mt-2 mb-4 text-gray-800 text-center">
          {initialData.date}
        </div>
      )}
      {/* 1. 업무 제목 */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-[18px] font-bold mb-1">업무 제목 <span className="text-red-500">*</span></label>
        <input
          className="w-full border border-[#E0E0E0] rounded-[12px] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3182F6] transition text-[16px] font-normal"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="예) 사용자 리서치 보고서 작성"
        />
      </div>
      {/* 1.5 태그 */}
      <div className="bg-white rounded-lg shadow p-4">
        <TagSelector
          label="업무 태그"
          description="업무 성격 (복수 선택 가능)"
          tags={tags}
          setTags={setTags}
          tagKey="work"
          placeholder="업무 태그 입력 후 추가"
        />
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <TagSelector
          label="프로젝트 태그 (선택, 단일 선택)"
          description="프로젝트 명 (단일 선택)"
          tags={projectTags}
          setTags={setProjectTagsSingle}
          tagKey="project"
          placeholder="프로젝트 태그 입력 후 추가"
        />
      </div>
      {/* 2. 무엇을 했는가 */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-[18px] font-bold mb-1">무엇을 했는가 (What) <span className="text-red-500">*</span></label>
        <p className="text-xs text-gray-500 mb-2">주요 업무 내용</p>
        <textarea
          className="w-full border border-[#E0E0E0] rounded-[12px] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3182F6] transition text-[16px] font-normal"
          rows={3}
          value={what}
          onChange={(e) => setWhat(e.target.value)}
          required
          placeholder="예) 유저 인터뷰 정리 및 주요 인사이트 3가지 도출"
        />
      </div>
      {/* 3. 왜 했는가 */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-[18px] font-bold mb-1">왜 했는가 (Why)</label>
        <p className="text-xs text-gray-500 mb-2">업무 목적/배경</p>
        <textarea
          className="w-full border border-[#E0E0E0] rounded-[12px] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3182F6] transition text-[16px] font-normal"
          rows={3}
          value={why}
          onChange={(e) => setWhy(e.target.value)}
          placeholder="예) 최근 전환율 감소 이유를 파악하기 위한 리서치"
        />
      </div>
      {/* 4. 어떻게 했는가 */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-[18px] font-bold mb-1">어떻게 했는가 (How)</label>
        <p className="text-xs text-gray-500 mb-2">진행 방식/도구</p>
        <textarea
          className="w-full border border-[#E0E0E0] rounded-[12px] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3182F6] transition text-[16px] font-normal"
          rows={3}
          value={how}
          onChange={(e) => setHow(e.target.value)}
          placeholder="예) Figma로 프로토타입 제작 후 Maze로 사용자 테스트 진행"
        />
      </div>
      {/* 5. 결과는 어땠는가 */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-[18px] font-bold mb-1">결과는 어땠는가 (Outcome)</label>
        <p className="text-xs text-gray-500 mb-2">주요 결과/산출물</p>
        <textarea
          className="w-full border border-[#E0E0E0] rounded-[12px] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3182F6] transition text-[16px] font-normal"
          rows={3}
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
          placeholder="예) 테스트 결과 4명 중 3명이 CTA 위치를 혼동함 → 수정 필요"
        />
      </div>
      {/* 6. 느낀 점 / 배운 점 */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-[18px] font-bold mb-1">느낀 점 / 배운 점 (Reflection)</label>
        <p className="text-xs text-gray-500 mb-2">인사이트/개선점</p>
        <textarea
          className="w-full border border-[#E0E0E0] rounded-[12px] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3182F6] transition text-[16px] font-normal"
          rows={3}
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="예) 처음엔 방향이 모호했지만 테스트 통해 실질적인 개선점을 찾음"
        />
      </div>
      {/* 7. 업무 난이도 (별점) */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block font-semibold mb-1">업무 난이도</label>
        <p className="text-xs text-gray-500 mb-2">난이도 평가</p>
        <div className="flex items-center gap-2 mt-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className="focus:outline-none"
              onClick={() => setDifficulty(n)}
              aria-label={`${n}점`}
            >
              <span className={`text-2xl ${n <= difficulty ? "text-yellow-400" : "text-gray-300"}`}>★</span>
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600">{difficulty}점</span>
        </div>
      </div>
      {/* 8. 소요 시간 */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block font-semibold mb-1">소요 시간</label>
        <p className="text-xs text-gray-500 mb-2">시작/종료 시간</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <label className="block text-xs font-semibold mb-1">시작</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="border border-[#E0E0E0] rounded-[12px] px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#3182F6] transition"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold mb-1">종료</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="border border-[#E0E0E0] rounded-[12px] px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#3182F6] transition"
            />
          </div>
        </div>
        {startTime && endTime && (
          <div className="text-xs text-gray-500 mt-1">소요 시간: {duration}</div>
        )}
      </div>
      {/* 저장/취소 버튼 */}
      {hideButtons !== true && (
        <div className="flex gap-2">
          <button
            type="submit"
            className="btn-primary flex-1 rounded-[12px]"
          >
            기록 저장
          </button>
          <button
            type="button"
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-[12px] font-bold text-base hover:bg-gray-300 transition"
            onClick={onCancel}
          >
            취소
          </button>
        </div>
      )}
      {/* Toast 알림 (showToast가 true일 때만) */}
      {showToast && toast && (
        <div className="fixed left-1/2 top-8 -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded shadow-lg z-50 animate-bounce">
          기록이 저장되었습니다!
        </div>
      )}
    </form>
  );
}

function WorklogListAll() {
  // refreshKey를 통해 리스트 강제 갱신
  const [refreshKey, setRefreshKey] = useState(0);
  const [records, setRecords] = useState([]);
  const [selected, setSelected] = useState(null);

  // 업무 기록 추가 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState("");

  // 필터 상태
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [difficulty, setDifficulty] = useState("");
  const [selectedWorkTags, setSelectedWorkTags] = useState([]);
  const [selectedProjectTag, setSelectedProjectTag] = useState("");
  const [sort, setSort] = useState("latest");
  const [allWorkTags, setAllWorkTags] = useState([]);
  const [allProjectTags, setAllProjectTags] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // 필터 임시 상태 (모달 내)
  const [tempDateRange, setTempDateRange] = useState({ from: "", to: "" });
  const [tempSelectedWorkTags, setTempSelectedWorkTags] = useState([]);
  const [tempSelectedProjectTag, setTempSelectedProjectTag] = useState("");

  // Load records from localStorage whenever refreshKey changes
  useEffect(() => {
    setRecords(JSON.parse(localStorage.getItem("reflection-records") || "[]"));
  }, [refreshKey]);

  // Load tag lists from localStorage
  useEffect(() => {
    try {
      setAllWorkTags(JSON.parse(localStorage.getItem("reflection-taglist-work") || "[]"));
    } catch {
      setAllWorkTags([]);
    }
    try {
      setAllProjectTags(JSON.parse(localStorage.getItem("reflection-taglist-project") || "[]"));
    } catch {
      setAllProjectTags([]);
    }
  }, [showFilterModal, refreshKey]);

  // 필터링
  const filteredRecords = records.filter((rec) => {
    if (dateRange.from && rec.date < dateRange.from) return false;
    if (dateRange.to && rec.date > dateRange.to) return false;
    if (difficulty && String(rec.difficulty) !== String(difficulty)) return false;
    if (selectedWorkTags.length > 0 && !selectedWorkTags.every((tag) => (rec.tags || []).includes(tag))) return false;
    if (selectedProjectTag && (!rec.projectTags || !rec.projectTags.includes(selectedProjectTag))) return false;
    return true;
  });

  // 정렬
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    if (sort === "latest") return b.date.localeCompare(a.date);
    if (sort === "oldest") return a.date.localeCompare(b.date);
    if (sort === "high") return (b.difficulty || 0) - (a.difficulty || 0);
    if (sort === "low") return (a.difficulty || 0) - (b.difficulty || 0);
    return 0;
  });

  const applyFilter = () => {
    setDateRange(tempDateRange);
    setSelectedWorkTags(tempSelectedWorkTags);
    setSelectedProjectTag(tempSelectedProjectTag);
    setShowFilterModal(false);
  };

  const resetFilter = () => {
    setTempDateRange({ from: "", to: "" });
    setTempSelectedWorkTags([]);
    setTempSelectedProjectTag("");
    setDateRange({ from: "", to: "" });
    setSelectedWorkTags([]);
    setSelectedProjectTag("");
    setShowFilterModal(false);
  };

  const handleTempDateChange = (e) => {
    const { name, value } = e.target;
    setTempDateRange((prev) => ({ ...prev, [name]: value }));
  };

  const handleTempWorkTagClick = (tag) => {
    setTempSelectedWorkTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };
  const handleTempProjectTagClick = (tag) => {
    setTempSelectedProjectTag((prev) => (prev === tag ? "" : tag));
  };

  return (
    <>
      {/* 업무 기록 추가 버튼 (Home 탭과 동일 스타일/위치) */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 w-full">
        <div className="font-bold text-[30px] text-[#1E1E1E] w-full md:w-auto text-left">
          업무 기록 목록
        </div>
        <button
          className="btn-primary w-full md:w-auto px-5 py-2.5 text-base font-bold rounded-lg"
          onClick={() => setIsModalOpen(true)}
        >
          업무 기록 추가
        </button>
      </div>
      {/* Toast 알림 */}
      {toast && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded shadow-lg z-50 animate-bounce">
          {toast}
        </div>
      )}
      {/* WorklogModal 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <WorklogModal
            onSave={record => {
              // 신규/수정 저장 로직
              let prev = JSON.parse(localStorage.getItem("reflection-records") || "[]");
              if (record && record.id) {
                // 수정 모드: id가 같으면 갱신, 없으면 추가
                const idx = prev.findIndex(r => r.id === record.id);
                if (idx !== -1) {
                  prev[idx] = { ...prev[idx], ...record };
                } else {
                  prev = [record, ...prev];
                }
              } else {
                // 신규
                record = {
                  ...record,
                  id: Date.now(),
                  date: new Date().toISOString().slice(0, 10),
                };
                prev = [record, ...prev];
              }
              localStorage.setItem("reflection-records", JSON.stringify(prev));
              setIsModalOpen(false);
              setToast("업무 기록이 저장되었습니다!");
              setRefreshKey(k => k + 1);
              setTimeout(() => setToast(""), 2000);
            }}
            onCancel={() => setIsModalOpen(false)}
            initialData={null}
            showToast={msg => {
              setToast(msg);
              setTimeout(() => setToast(""), 2000);
            }}
          />
        </div>
      )}

      {/* 정렬 & 필터 버튼 */}
      <div className="mb-4 flex items-end gap-4 bg-white rounded shadow px-4 py-3">
        <div className="flex flex-col">
          <select
            className="border rounded px-2 py-1"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="latest">최신 순</option>
            <option value="oldest">오래된 순</option>
            <option value="high">난이도 높은 순</option>
            <option value="low">난이도 낮은 순</option>
          </select>
          <span className="text-xs text-gray-500 mt-1">정렬</span>
        </div>
        <div className="flex flex-col justify-end">
<button
            className="bg-transparent border border-[#3EBD93] text-[#3EBD93] font-medium text-[14px] rounded-[12px] h-10 px-4 transition hover:bg-[#E6F4EF] focus:outline-none"
            onClick={() => {
              setTempDateRange(dateRange);
              setTempSelectedTags(selectedTags);
              setShowFilterModal(true);
            }}
          >
            필터
          </button>
        </div>
      </div>

      {/* 필터 모달 */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-2 p-6 relative flex flex-col">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
              onClick={() => setShowFilterModal(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-6 text-center">필터</h2>
            {/* 날짜 범위 필터 (유지) */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">날짜 범위</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  name="from"
                  value={tempDateRange.from}
                  onChange={handleTempDateChange}
                  className="border rounded px-2 py-1"
                />
                <span className="self-center">~</span>
                <input
                  type="date"
                  name="to"
                  value={tempDateRange.to}
                  onChange={handleTempDateChange}
                  className="border rounded px-2 py-1"
                />
              </div>
            </div>
            {/* 업무 태그 필터 */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">업무 태그 <span className="text-xs text-gray-500">(복수 선택)</span></label>
              <div className="flex flex-wrap gap-2">
                {allWorkTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    className={`px-2 py-0.5 rounded-full border text-xs transition
                      ${tempSelectedWorkTags.includes(tag)
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"}
                    `}
                    onClick={() => handleTempWorkTagClick(tag)}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
              <div className="text-xs text-gray-400 mt-1">업무의 성격을 나타내는 태그를 선택하세요.</div>
            </div>
            {/* 프로젝트 태그 필터 */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">프로젝트 태그 <span className="text-xs text-gray-500">(단일 선택)</span></label>
              <div className="flex flex-wrap gap-2">
                {allProjectTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    className={`px-2 py-0.5 rounded-full border text-xs transition
                      ${tempSelectedProjectTag === tag
                        ? "bg-gray-700 text-white border-gray-700"
                        : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"}
                    `}
                    onClick={() => handleTempProjectTagClick(tag)}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
              <div className="text-xs text-gray-400 mt-1">프로젝트명을 기준으로 하나만 선택할 수 있습니다.</div>
            </div>
            {/* 적용/초기화 버튼 */}
            <div className="flex gap-2 mt-6">
              <button
                className="flex-1 bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 transition"
                onClick={applyFilter}
              >
                적용
              </button>
              <button
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded font-bold hover:bg-gray-400 transition"
                onClick={resetFilter}
              >
                초기화
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 업무 기록 리스트 */}
      <div className="space-y-2">
        {sortedRecords.map((rec) => (
          <button
            key={rec.id}
            className="w-full text-left bg-gray-50 border rounded p-3 flex flex-col hover:bg-blue-50 transition"
            onClick={() => setSelected(rec)}
          >
            <div className="font-bold text-blue-700 flex flex-wrap gap-1">
              {rec.tags && rec.tags.map((t) => (
                <span key={t} className="bg-blue-100 px-2 py-0.5 rounded text-xs">#{t}</span>
              ))}
            </div>
            <div className="text-base font-semibold mt-1">{rec.title}</div>
            <div className="text-xs text-gray-500 mt-1">{rec.date}</div>
            <div className="text-sm text-gray-700 mt-1 line-clamp-2">{rec.what}</div>
          </button>
        ))}
      </div>
    </>
  );
}

export default WorklogListAll;

export { ReflectionForm };
