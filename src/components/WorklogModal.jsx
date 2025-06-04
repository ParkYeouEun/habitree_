import React, { useState } from "react";
import { ReflectionForm } from "../pages/Write.jsx";

function WorklogModal({ onSave, onCancel, initialData, showToast }) {
  const [saving, setSaving] = useState(false);

  function handleSave(data) {
    if (!data.title || !data.what) {
      alert("업무 제목과 '무엇을 했는가'는 필수 입력입니다.");
      return;
    }
    setSaving(true);
    if (onSave) {
      onSave(data);
      if (showToast) showToast("업무 기록이 저장되었습니다!");
    }
    setSaving(false);
  }

  if (!onCancel) return null; // Modal should only show if onCancel is provided (open state handled by parent)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-[16px] shadow-sm w-full max-w-lg relative flex flex-col max-h-[600px]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b flex-shrink-0">
          <span className="font-semibold text-lg text-center w-full block">
            {initialData ? "업무 기록 수정" : "업무 기록"}
          </span>
          <button
            className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 text-2xl"
            onClick={onCancel}
            aria-label="닫기"
          >
            &times;
          </button>
        </div>
        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 py-4 flex-1 min-h-0">
          <ReflectionForm
            onSave={handleSave}
            onCancel={onCancel}
            initialData={initialData}
          />
        </div>
        {saving && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 z-10">
            <span className="text-gray-600 font-bold">저장 중...</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorklogModal;
