import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, BookOpen, Clock, ArrowRight, MessageSquare, History } from "lucide-react";

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: string[];
  worldName: string;
}

export default function HistorySidebar({ isOpen, onClose, history = [], worldName }: HistorySidebarProps) {
  const logsEndRef = useRef<HTMLDivElement | null>(null);

  let themeHex = "#8B5CF6"; // Default Zombie Apocalypse (Violet)

  if (worldName === "Pirate Ocean") {
    themeHex = "#3B82F6"; // Blue
  } else if (worldName === "Magic Academy") {
    themeHex = "#EC4899"; // Pink
  }

  // Automatically scroll logs to bottom when opening or when new history items are added
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [isOpen, history.length]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (closes sidebar on mobile click) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40 lg:z-30 cursor-pointer"
          />

          {/* Sidebar Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-[420px] max-w-[90vw] bg-[#121212] border-l border-gray-800/80 shadow-[0_0_50px_rgba(0,0,0,0.85)] z-50 lg:z-40 flex flex-col overflow-hidden"
          >
            {/* Ambient visual line accent */}
            <div className="absolute left-0 top-0 bottom-0 w-[1px]" style={{ backgroundImage: `linear-gradient(to bottom, transparent, ${themeHex}4d, transparent)` }} />

            {/* Header */}
            <div className="p-4 border-b border-gray-800 bg-[#161616] flex items-center justify-between shrink-0 relative">
              <div className="absolute top-0 right-0 w-3 h-[2px]" style={{ backgroundColor: themeHex }} />
              <div className="flex items-center gap-2">
                <BookOpen size={16} style={{ color: themeHex }} />
                <div>
                  <h3 className="font-mono text-xs font-bold text-white tracking-widest uppercase">
                    ADVENTURE JOURNAL
                  </h3>
                  <p className="text-[9px] font-mono text-gray-500 uppercase">
                    Chronicles of {worldName}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white font-mono text-xs cursor-pointer p-1.5 border border-gray-800 rounded bg-black/40 hover:bg-black/80 transition-all flex items-center gap-1"
                title="Close Journal"
              >
                <X size={12} />
                <span className="text-[10px] hidden sm:inline">CLOSE</span>
              </button>
            </div>

            {/* Scrollable Log Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <History size={24} className="text-gray-600 animate-pulse" />
                  <p className="text-xs font-mono text-gray-500 italic">
                    The journal is currently empty. Start your journey to write history.
                  </p>
                </div>
              ) : (
                history.map((entry, index) => {
                  const isAction = entry.startsWith("Action: ");
                  const cleanText = isAction ? entry.replace(/^Action:\s*/, "") : entry;

                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(0.2, index * 0.05) }}
                      key={index}
                      className={`flex flex-col ${isAction ? "items-end" : "items-start"}`}
                    >
                      {isAction ? (
                        /* Player Choice/Action Block */
                        <div className="max-w-[85%] bg-[#1c1c1c] border border-gray-800 rounded-xl rounded-tr-none px-3 py-2 space-y-1 shadow-md">
                          <div className="flex items-center gap-1.5 text-[8px] font-mono font-bold" style={{ color: themeHex }}>
                            <ArrowRight size={8} />
                            <span>PLAYER COMMAND</span>
                          </div>
                          <p className="text-xs font-mono text-gray-200 select-all leading-normal">
                            &gt; {cleanText}
                          </p>
                        </div>
                      ) : (
                        /* DM Narrative Response Block */
                        <div className="max-w-[95%] bg-black/40 border border-gray-800/60 rounded-xl rounded-tl-none p-3.5 space-y-2 relative shadow-inner">
                          {/* Top-left tag indicator */}
                          <div className="flex items-center justify-between text-[8px] font-mono text-gray-500 border-b border-gray-900/60 pb-1">
                            <span className="flex items-center gap-1 font-bold text-gray-400">
                              <MessageSquare size={8} />
                              DUNGEON MASTER
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Clock size={8} />
                              <span>TURN {Math.floor(index / 2) + 1}</span>
                            </span>
                          </div>
                          
                          {/* Elegant text body */}
                          <p className="text-[11px] md:text-xs font-serif text-gray-300 leading-relaxed whitespace-pre-line select-all">
                            {cleanText}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}
              {/* Invisible anchor element to auto scroll to */}
              <div ref={logsEndRef} />
            </div>

            {/* Footer summary details */}
            <div className="p-3 bg-[#161616] border-t border-gray-800/80 text-[8.5px] font-mono text-gray-500 flex justify-between shrink-0">
              <span>JOURNAL SIZE: {history.length} ITEMS</span>
              <span>TURNS LOGGED: {Math.max(1, Math.ceil(history.length / 2))}</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
