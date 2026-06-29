import { useState } from "react";
import { AudioProvider } from "./context/AudioContext";
import { GameProvider } from "./context/GameContext";
import Home from "./pages/Home";
import CharacterCreation from "./pages/CharacterCreation";
import Continue from "./pages/Continue";
import SettingsPage from "./pages/Settings";
import Game from "./pages/Game";
import { motion, AnimatePresence } from "motion/react";

function GameContainer() {
  const [activeScreen, setActiveScreen] = useState<
    "home" | "create" | "continue" | "settings" | "game"
  >("home");

  const handleNavigation = (screen: "home" | "create" | "continue" | "settings" | "game") => {
    setActiveScreen(screen);
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case "home":
        return <Home onNavigate={handleNavigation} />;
      case "create":
        return <CharacterCreation onNavigate={handleNavigation} />;
      case "continue":
        return <Continue onNavigate={handleNavigation} />;
      case "settings":
        return <SettingsPage onNavigate={handleNavigation} />;
      case "game":
        return <Game onNavigate={handleNavigation} />;
      default:
        return <Home onNavigate={handleNavigation} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 flex flex-col justify-between overflow-x-hidden relative">
      {/* Decorative cyber line across top of screen */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#F97316] to-transparent opacity-60 absolute top-0 left-0" />

      {/* Main Stage */}
      <main className="flex-1 flex flex-col py-4 md:py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScreen}
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer credits bar */}
      <footer className="py-3 bg-[#121212] border-t border-[#333333] text-center text-[10px] font-mono text-gray-500 select-none flex items-center justify-center gap-2">
        <span>© 2026 AI DUNGEON MASTER CO.</span>
        <span className="text-gray-800">•</span>
        <span>GOOGLE AI STUDIO BUILD</span>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AudioProvider>
      <GameProvider>
        <GameContainer />
      </GameProvider>
    </AudioProvider>
  );
}
