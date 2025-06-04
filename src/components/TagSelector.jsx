import React, { useState, useEffect } from "react";

/**
 * Notion-style 태그 선택/입력 컴포넌트
 * 
 * props:
 * - label: string (라벨)
 * - description: string (설명, optional)
 * - tags: string[] (선택된 태그)
 * - setTags: (tags: string[]) => void (선택 상태 업데이트)
 * - tagKey: string (localStorage 키)
 * - placeholder: string (입력창 안내)
 */
function TagSelector({ label, description, tags, setTags, tagKey, placeholder }) {
  const [allTags, setAllTags] = useState([]);
  const [input, setInput] = useState("");

  // Load all tags from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(`reflection-taglist-${tagKey}`) || "[]");
      setAllTags(Array.isArray(stored) ? stored : []);
    } catch {
      setAllTags([]);
    }
  }, [tagKey]);

  // Save all tags to localStorage
  const saveAllTags = (next) => {
    setAllTags(next);
    localStorage.setItem(`reflection-taglist-${tagKey}`, JSON.stringify(next));
  };

  // Add new tag
  const handleAdd = () => {
    const value = input.trim();
    if (!value) return;
    if (!allTags.includes(value)) {
      const next = [...allTags, value];
      saveAllTags(next);
      setTags([...tags, value]);
    } else if (!tags.includes(value)) {
      setTags([...tags, value]);
    }
    setInput("");
  };

  // Toggle tag selection
  const handleToggle = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  // Remove tag from allTags (and from selected)
  const handleRemove = (tag) => {
    const next = allTags.filter((t) => t !== tag);
    saveAllTags(next);
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    }
  };

  return (
    <div className="mb-2">
      <label className="block font-semibold mb-1">{label}</label>
      {description && (
        <div className="text-xs text-gray-500 mb-1">{description}</div>
      )}
      <div className="flex gap-2 mb-2">
        <input
          className="flex-1 border rounded px-2 py-1"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={placeholder}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <button
          type="button"
          className="btn-primary"
          onClick={handleAdd}
        >
          추가
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {allTags.map(tag => (
          <div key={tag} className="flex items-center">
            <button
              type="button"
              className={`px-2 py-0.5 rounded-full border text-xs transition
                ${tags.includes(tag)
                  ? "bg-primary text-white border-primary"
                  : "bg-gray-100 text-primary border-primary hover:bg-primary-light"}
              `}
              onClick={() => handleToggle(tag)}
            >
              #{tag}
            </button>
            <button
              type="button"
              className="ml-1 text-xs text-gray-400 hover:text-red-500 transition"
              onClick={() => handleRemove(tag)}
              aria-label="태그 삭제"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TagSelector;
