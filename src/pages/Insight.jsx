import React, { useState, useEffect } from "react";

// 카드 섹션 데이터
const gptSections = [
  {
    key: "summary",
    title: "주요 업무 요약",
    color: "bg-blue-100",
    icon: (
      // 문서 아이콘
      <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
        <rect x="4" y="3" width="14" height="16" rx="3" fill="#3B82F6" fillOpacity="0.15"/>
        <rect x="4" y="3" width="14" height="16" rx="3" stroke="#2563EB" strokeWidth="1.5"/>
        <rect x="7" y="6" width="8" height="2" rx="1" fill="#2563EB"/>
        <rect x="7" y="10" width="6" height="2" rx="1" fill="#2563EB"/>
        <rect x="7" y="14" width="4" height="2" rx="1" fill="#2563EB"/>
      </svg>
    ),
  },
  {
    key: "growth",
    title: "성장 포인트",
    color: "bg-purple-100",
    icon: (
      // 상승 그래프 아이콘
      <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
        <rect x="3" y="3" width="16" height="16" rx="4" fill="#A78BFA" fillOpacity="0.15"/>
        <rect x="3" y="3" width="16" height="16" rx="4" stroke="#7C3AED" strokeWidth="1.5"/>
        <path d="M7 13l3-3 2 2 3-4" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="7" cy="13" r="1" fill="#7C3AED"/>
        <circle cx="10" cy="10" r="1" fill="#7C3AED"/>
        <circle cx="12" cy="12" r="1" fill="#7C3AED"/>
        <circle cx="15" cy="8" r="1" fill="#7C3AED"/>
      </svg>
    ),
  },
  {
    key: "improve",
    title: "개선할 점",
    color: "bg-orange-100",
    icon: (
      // 전구(아이디어) 아이콘
      <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
        <rect x="3" y="3" width="16" height="16" rx="4" fill="#FDBA74" fillOpacity="0.15"/>
        <rect x="3" y="3" width="16" height="16" rx="4" stroke="#F59E42" strokeWidth="1.5"/>
        <path d="M11 7a4 4 0 0 1 2 7.5V16a1 1 0 1 1-2 0v-1.5A4 4 0 0 1 11 7z" stroke="#F59E42" strokeWidth="1.5" fill="none"/>
        <rect x="10" y="16" width="2" height="2" rx="1" fill="#F59E42"/>
      </svg>
    ),
  },
  {
    key: "direction",
    title: "발전 방향",
    color: "bg-teal-100",
    icon: (
      // 나침반/화살표 아이콘
      <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
        <rect x="3" y="3" width="16" height="16" rx="4" fill="#5EEAD4" fillOpacity="0.15"/>
        <rect x="3" y="3" width="16" height="16" rx="4" stroke="#14B8A6" strokeWidth="1.5"/>
        <path d="M11 7l3 8-8-3 5-5z" stroke="#14B8A6" strokeWidth="1.5" fill="#14B8A6" fillOpacity="0.2"/>
      </svg>
    ),
  },
];

// 모든 태그 추출 함수
function getAllTags(records) {
  const tags = new Set();
  records.forEach((rec) => (rec.tags || []).forEach((tag) => tags.add(tag)));
  return Array.from(tags);
}

// 필터링 함수
function filterRecords(records, dateRange, selectedTags) {
  return records.filter((rec) => {
    // 날짜 필터
    if (dateRange.from && rec.date < dateRange.from) return false;
    if (dateRange.to && rec.date > dateRange.to) return false;
    // 태그 필터 (AND)
    if (selectedTags.length > 0) {
      if (!selectedTags.every((tag) => (rec.tags || []).includes(tag))) return false;
    }
    return true;
  });
}

// OpenAI API 호출 함수
async function fetchGptSummary(filteredRecords) {
  // 실제로는 환경변수나 안전한 방식으로 API 키를 관리해야 합니다.
  const OPENAI_API_KEY = "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";
  const endpoint = "https://api.openai.com/v1/chat/completions";
  const prompt = `
다음 업무 기록들을 분석해줘.

- 어떤 업무를 주로 했는지
- 반복적으로 수행된 유형이 있는지
- 어려웠던 점은 무엇이었는지
- 이 기록들로부터 사용자의 성장 포인트를 도출하고
- 앞으로 어떤 방향으로 발전할 수 있을지 제안해줘

아래 형식의 JSON으로 답변해줘:
{
  "summary": "...",
  "growth": "...",
  "improve": "...",
  "direction": "..."
}

업무 기록 배열:
${JSON.stringify(filteredRecords, null, 2)}
`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "너는 업무 회고 분석 전문가야." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!res.ok) throw new Error("OpenAI API 호출 실패");
  const data = await res.json();
  // 응답에서 JSON 파싱
  const text = data.choices?.[0]?.message?.content || "";
  try {
    // 응답이 JSON 문자열이면 파싱
    return JSON.parse(text);
  } catch {
    // 응답이 JSON이 아니면 더미로 반환
    return {
      summary: "요약 파싱 실패",
      growth: "성장 파싱 실패",
      improve: "개선 파싱 실패",
      direction: "방향 파싱 실패",
    };
  }
}

function Insight() {
  // 전체 기록
  const [records, setRecords] = useState([]);
  // 필터 상태
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [selectedTags, setSelectedTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  // 필터링된 기록
  const [filtered, setFiltered] = useState([]);
  // GPT 요약 상태
  const [gpt, setGpt] = useState({
    summary: "최근 UI 개선, 신규 서비스 기획 등 다양한 프로젝트를 주도적으로 수행하였습니다.",
    growth: "반복적인 기획 및 온보딩 자료 작성 경험을 통해 문서화 및 커뮤니케이션 역량이 향상되었습니다.",
    improve: "업무 기록에서 구체적인 목표 설정과 회고 작성이 자주 생략되었습니다.",
    direction: "기획 및 UI 개선 경험을 바탕으로 사용자 경험 리서치 분야로 확장할 수 있습니다.",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 필터 모달 상태
  const [showFilterModal, setShowFilterModal] = useState(false);
  // 모달 내 임시 상태
  const [tempDateRange, setTempDateRange] = useState({ from: "", to: "" });
  const [tempSelectedTags, setTempSelectedTags] = useState([]);

  // 필터 모달 열기
  const openFilterModal = () => {
    setTempDateRange(dateRange);
    setTempSelectedTags(selectedTags);
    setShowFilterModal(true);
  };

  // 모달 내 날짜 변경
  const handleTempDateChange = (e) => {
    const { name, value } = e.target;
    setTempDateRange((prev) => ({ ...prev, [name]: value }));
  };

  // 모달 내 태그 선택
  const handleTempTagClick = (tag) => {
    setTempSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  // 필터 적용
  const handleFilterApply = () => {
    setDateRange(tempDateRange);
    setSelectedTags(tempSelectedTags);
    setShowFilterModal(false);
    setTimeout(() => {
      handleGptRefresh();
    }, 0);
  };

  // 필터 초기화
  const handleFilterReset = () => {
    setTempDateRange({ from: "", to: "" });
    setTempSelectedTags([]);
    setDateRange({ from: "", to: "" });
    setSelectedTags([]);
    setShowFilterModal(false);
    setTimeout(() => {
      handleGptRefresh();
    }, 0);
  };

  // 기록 및 태그 목록 로드
  useEffect(() => {
    const recs = JSON.parse(localStorage.getItem("reflection-records") || "[]");
    setRecords(recs);
    setAllTags(getAllTags(recs));
  }, []);

  // 필터링
  useEffect(() => {
    const filteredRecords = filterRecords(records, dateRange, selectedTags);
    setFiltered(filteredRecords);
    // 콘솔에도 출력
    console.log("Filtered records:", filteredRecords);
  }, [records, dateRange, selectedTags]);

  // 날짜 변경 핸들러
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
  };

  // 태그 선택 핸들러
  const handleTagClick = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  // GPT 요약 다시 생성
  const handleGptRefresh = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await fetchGptSummary(filtered);
      setGpt({
        summary: result.summary || "요약 결과 없음",
        growth: result.growth || "성장 결과 없음",
        improve: result.improve || "개선 결과 없음",
        direction: result.direction || "방향 결과 없음",
      });
    } catch (err) {
      setError("OpenAI API 호출에 실패했습니다.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 w-full">
      <div className="w-full max-w-[1200px] px-[20px] mx-auto pt-[24px] box-border">
        <div className="flex flex-col mb-8 gap-2 w-full">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-left w-full">
            나의 업무 인사이트
          </h1>
          <p className="text-[16px] text-[#444444] font-medium text-left w-full mt-2">
            지금까지의 업무 기록을 AI가 분석해 인사이트를 정리했어요.
          </p>
        </div>
        {/* 필터 + GPT 요약 다시 생성 버튼 */}
        <div className="mb-4 flex justify-between items-center w-full" style={{ maxWidth: "100%" }}>
          <button
            className="bg-transparent border border-[#3EBD93] text-[#3EBD93] font-medium text-[14px] rounded-[12px] h-10 px-4 transition hover:bg-[#E6F4EF] focus:outline-none"
            onClick={openFilterModal}
            style={{ minWidth: 64 }}
          >
            필터
          </button>
          <button
            className="ml-auto bg-[#3EBD93] text-white font-bold rounded-[12px] px-5 py-2.5 text-base shadow hover:bg-[#34b183] transition"
            onClick={handleGptRefresh}
            disabled={loading}
            style={{ minWidth: 140 }}
          >
            {loading ? "생성 중..." : "GPT 요약 다시 생성"}
          </button>
        </div>
        {/* 필터 모달 */}
        {showFilterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-2 p-6 relative flex flex-col">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
                onClick={() => setShowFilterModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold mb-6 text-center">필터</h2>
              {/* 날짜 선택 */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">날짜 범위</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="date"
                    name="from"
                    value={tempDateRange.from}
                    onChange={handleTempDateChange}
                    className="border rounded px-2 py-1 w-full"
                  />
                  <span className="mx-1">~</span>
                  <input
                    type="date"
                    name="to"
                    value={tempDateRange.to}
                    onChange={handleTempDateChange}
                    className="border rounded px-2 py-1 w-full"
                  />
                </div>
              </div>
              {/* 태그 선택 */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">태그 (다중 선택)</label>
                <div className="flex flex-wrap gap-2">
                  {allTags.length === 0 ? (
                    <span className="text-gray-400 text-sm">등록된 태그 없음</span>
                  ) : (
                    allTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className={`px-3 py-1 rounded-full border text-sm transition ${
                          tempSelectedTags.includes(tag)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-50"
                        }`}
                        onClick={() => handleTempTagClick(tag)}
                      >
                        {tag}
                      </button>
                    ))
                  )}
                </div>
              </div>
              {/* 버튼 영역 */}
<div className="flex gap-2 mt-6">
  <button
    className="flex-1 bg-[#F5F5F5] text-[#1E1E1E] py-3 rounded-[12px] font-bold text-base hover:bg-gray-200 transition"
    onClick={handleFilterReset}
    disabled={loading}
  >
    초기화
  </button>
  <button
    className="flex-1 bg-[#3EBD93] text-white py-3 rounded-[12px] font-bold text-base hover:bg-[#32a47f] transition"
    onClick={handleFilterApply}
    disabled={loading}
  >
    적용
  </button>
</div>
            </div>
          </div>
        )}
        {/* GPT 요약 카드 영역 */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {gptSections.map((section) => (
            <div
              key={section.key}
              className="bg-white rounded-xl shadow p-6 flex flex-col justify-between min-h-[180px] w-full"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 flex items-center justify-center rounded-full ${section.color}`}>
                  {section.icon}
                </div>
                <h2 className="text-xl font-semibold text-gray-800">{section.title}</h2>
              </div>
              <p className="text-gray-700">
                {loading ? "GPT 요약 생성 중..." : gpt[section.key]}
              </p>
            </div>
          ))}
        </div>
        {error && (
          <div className="w-full flex justify-end mb-4">
            <span className="ml-4 text-red-500 text-sm">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Insight;
