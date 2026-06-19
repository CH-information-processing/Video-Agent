import { useState } from "react";
import VideoScholarWorkspaceExpanded from "@/imports/VideoScholarWorkspaceExpanded/index";
import VideoScholarAiChatOpen from "@/imports/VideoScholarAiChatOpen/index";
import VideoScholarLeftSidebarCollapsed from "@/imports/VideoScholarLeftSidebarCollapsed/index";
import VideoScholarRightSidebarCollapsed from "@/imports/VideoScholarRightSidebarCollapsed/index";

type ViewState = "expanded" | "leftCollapsed" | "rightCollapsed" | "aiChat";

const views: { id: ViewState; label: string }[] = [
  { id: "expanded", label: "Both Expanded" },
  { id: "leftCollapsed", label: "Left Collapsed" },
  { id: "rightCollapsed", label: "Right Collapsed" },
  { id: "aiChat", label: "AI Chat Open" },
];

export default function App() {
  const [view, setView] = useState<ViewState>("expanded");

  return (
    <div className="size-full flex flex-col bg-[#f7f9fb]">
      {/* State switcher bar */}
      <div className="shrink-0 flex items-center gap-2 px-4 py-2 bg-white border-b border-[#c6c6cd] z-50">
        <span className="text-[11px] font-semibold text-[#515f74] tracking-[0.6px] uppercase mr-2">
          View State
        </span>
        {views.map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={[
              "px-3 py-1 text-[11px] font-semibold tracking-[0.4px] rounded-[4px] transition-colors",
              view === v.id
                ? "bg-black text-white"
                : "bg-[#eceef0] text-[#515f74] hover:bg-[#e0e3e5]",
            ].join(" ")}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Design frame */}
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="relative w-[1280px] h-[1024px]">
          {view === "expanded" && <VideoScholarWorkspaceExpanded />}
          {view === "leftCollapsed" && <VideoScholarLeftSidebarCollapsed />}
          {view === "rightCollapsed" && <VideoScholarRightSidebarCollapsed />}
          {view === "aiChat" && <VideoScholarAiChatOpen />}
        </div>
      </div>
    </div>
  );
}
