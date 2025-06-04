import React, { useState, useRef } from "react";

const MENU = [
  { key: "home", label: "홈" },
  { key: "list", label: "업무내역" },
  { key: "insight", label: "인사이트" },
];

const ANIMATION_DURATION = 250; // ms

const Header = ({ activeTab, setActiveTab }) => {
  const [open, setOpen] = useState(false); // menu visible (for animation)
  const [mounted, setMounted] = useState(false); // menu in DOM
  const closeTimeout = useRef();

  // Open menu: mount, then animate in
  const openMenu = () => {
    setMounted(true);
    setTimeout(() => setOpen(true), 10); // allow DOM mount before animating
  };

  // Close menu: animate out, then unmount after animation
  const closeMenu = () => {
    setOpen(false);
    closeTimeout.current = setTimeout(() => setMounted(false), ANIMATION_DURATION);
  };

  // Clean up timeout on unmount
  React.useEffect(() => {
    return () => clearTimeout(closeTimeout.current);
  }, []);

  const handleMenuClick = (key) => {
    setActiveTab(key);
    closeMenu();
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full h-[68px] bg-white flex items-center justify-between px-4 z-50 md:hidden shadow">
        <div
          className="flex items-center gap-[2px] cursor-pointer select-none"
          onClick={() => {
            setActiveTab("home");
            closeMenu();
          }}
        >
          <img
            src="/ic_habitree.png"
            alt="Habitree Logo"
            className="h-10 w-auto"
            style={{ maxHeight: "44px" }}
          />
          <span
            style={{
              fontFamily: "'Montserrat Alternates', sans-serif",
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "-0.05em",
              color: "#000",
              lineHeight: "28px",
            }}
          >
            Habitree
          </span>
        </div>
        <button
          className="flex flex-col justify-center items-center w-10 h-10"
          aria-label="Open menu"
          onClick={openMenu}
        >
          <span className="block w-6 h-0.5 bg-gray-800 mb-1.5 rounded"></span>
          <span className="block w-6 h-0.5 bg-gray-800 mb-1.5 rounded"></span>
          <span className="block w-6 h-0.5 bg-gray-800 rounded"></span>
        </button>
      </header>
      {/* Overlay & Slide Menu */}
      {mounted && (
        <>
          <div
            className={`fixed inset-0 z-50 transition-opacity duration-250 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            style={{ background: "rgba(0,0,0,0.3)" }}
            onClick={closeMenu}
          />
          <nav
            className={`fixed top-0 right-0 h-full w-64 bg-white z-50 shadow-lg flex flex-col pt-[68px] transition-transform duration-250 ${
              open ? "translate-x-0" : "translate-x-full"
            }`}
            style={{
              transition: `transform ${ANIMATION_DURATION}ms cubic-bezier(0.4,0,0.2,1)`,
            }}
          >
            {MENU.map((item) => (
              <button
                key={item.key}
                className={`w-full text-left px-6 py-5 text-lg font-semibold border-b border-gray-100 transition ${
                  activeTab === item.key
                    ? "bg-gray-100 text-primary"
                    : "text-gray-800 hover:bg-gray-50"
                }`}
                onClick={() => handleMenuClick(item.key)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </>
      )}
    </>
  );
};

export default Header;
