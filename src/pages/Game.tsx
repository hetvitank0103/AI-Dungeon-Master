import { useState } from "react";
import { useGame } from "../context/GameContext";
import { useAudio } from "../context/AudioContext";
import StoryPanel from "../components/game/StoryPanel";
import LocalMap from "../components/game/LocalMap";
import Inventory from "../components/game/Inventory";
import ExpandablePanel from "../components/game/ExpandablePanel";
import ActionInput from "../components/game/ActionInput";
import HistorySidebar from "../components/game/HistorySidebar";
import Button from "../components/ui/Button";
import { 
  Skull, Swords, Heart, Coins, ShieldAlert, 
  MessageSquare, Users, Volume2, VolumeX, ArrowLeft,
  Sparkles, Award, Compass, LayoutList, Package, BookOpen, Save
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface GameProps {
  onNavigate: (screen: "home" | "create" | "continue" | "settings" | "game") => void;
}

export default function Game({ onNavigate }: GameProps) {
  const { gameState, resetGame, isLoading, showAutoSave } = useGame();
  const { isMuted, toggleMute } = useAudio();

  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  if (!gameState) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none h-[75vh]">
        <p className="text-sm font-mono text-gray-500 italic mb-4">
          No active adventure found. Let's create one.
        </p>
        <Button variant="primary" onClick={() => onNavigate("create")}>
          START NEW GAME
        </Button>
      </div>
    );
  }

  const { player, world, quest, npc, enemy, gameStatus } = gameState;

  // Atmospheric background generator using Pollinations AI based on current location and world
  const bgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
    `${gameState.scene.location} in the world of ${world.name}, dark atmospheric RPG scenery, highly detailed digital fantasy concept art, cinematic lighting, 8k resolution, photorealistic, no text, no logo`
  )}`;

  // Visual cues based on selected reality
  let themeColor = "#8B5CF6"; // Default violet for Zombie Apocalypse
  let glowColor = "border-violet-500/30 text-violet-400";
  let worldThemeBg = "bg-violet-500/10 text-violet-400 border border-violet-500/20";
  let worldIcon = <Skull size={14} className="text-violet-400" />;

  if (world.name === "Pirate Ocean") {
    themeColor = "#3B82F6"; // Blue
    glowColor = "border-blue-500/30 text-blue-400";
    worldThemeBg = "bg-blue-500/10 text-blue-400 border border-blue-500/20";
    worldIcon = <Swords size={14} className="text-blue-400" />;
  } else if (world.name === "Magic Academy") {
    themeColor = "#EC4899"; // Pink
    glowColor = "border-pink-500/30 text-pink-400";
    worldThemeBg = "bg-pink-500/10 text-pink-400 border border-pink-500/20";
    worldIcon = <Sparkles size={14} className="text-pink-400" />;
  }

  // Heart visualization for health
  const maxHearts = 5;
  const activeHearts = Math.ceil((player.health / 100) * maxHearts);

  const handleMainMenuClick = () => {
    resetGame();
    onNavigate("home");
  };

  return (
    <div className="fixed inset-0 h-screen w-screen bg-black overflow-hidden select-none flex flex-row z-0">
      
      {/* 1. LEFT SIDEBAR: Persistent on Desktop, hidden on Mobile */}
      <div className="hidden lg:flex flex-col w-80 shrink-0 border-r border-[#333333] bg-[#121212]/90 backdrop-blur-md p-5 overflow-y-auto gap-5 relative z-10 scrollbar-none h-full">
        <div className="flex items-center gap-2 border-b border-gray-800 pb-2 mb-1">
          <span className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: themeColor }}>ADVENTURER SHEET</span>
        </div>

        {/* Local Minimap */}
        <div className="shrink-0">
          <ExpandablePanel label="Local Minimap" icon={<Compass size={14} />}>
            <LocalMap embedded={true} />
          </ExpandablePanel>
        </div>

        {/* Inventory Items Pack */}
        <div className="shrink-0">
          <ExpandablePanel label="Inventory" icon={<Package size={14} />}>
            <Inventory embedded={true} />
          </ExpandablePanel>
        </div>

        {/* Dynamic Encounters & Enemies */}
        <div className="bg-black/40 border border-gray-800 rounded-xl p-4 shadow-lg min-h-[140px] flex flex-col justify-between shrink-0">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-1.5 mb-2">
            <Users size={14} style={{ color: themeColor }} />
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase" style={{ color: themeColor }}>
              ENCOUNTERS
            </span>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[150px] pr-1">
            {npc && npc.name ? (
              <div className="p-2.5 rounded-lg bg-black border border-gray-800 space-y-1">
                <div className="flex items-center justify-between text-[9px] font-mono">
                  <span className="font-bold flex items-center gap-1" style={{ color: themeColor }}>
                    <MessageSquare size={10} />
                    {npc.name}
                  </span>
                  <span className="text-gray-500 italic">({npc.emotion})</span>
                </div>
                <p className="text-[10px] font-serif italic text-gray-300 leading-normal">
                  "{npc.dialogue}"
                </p>
              </div>
            ) : null}

            {enemy && enemy.name && enemy.health > 0 ? (
              <div className="p-2.5 rounded-lg bg-red-950/20 border border-red-500/30 space-y-1.5">
                <div className="flex items-center justify-between text-[9px] font-mono">
                  <span className="text-red-400 font-bold uppercase tracking-wider">
                    HOSTILE: {enemy.name}
                  </span>
                  <span className="text-red-500 animate-pulse font-bold">{enemy.status}</span>
                </div>
                <div className="space-y-0.5">
                  <div className="w-full bg-black rounded-full h-1 overflow-hidden">
                    <div
                      className="bg-red-500 h-full transition-all duration-300"
                      style={{ width: `${enemy.health}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[8px] font-mono text-gray-500">
                    <span>HP: {enemy.health}/100</span>
                  </div>
                </div>
              </div>
            ) : null}

            {!npc && (!enemy || enemy.health <= 0) && (
              <div className="h-16 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-gray-600 font-mono italic">
                  Area quiet... No threats or allies here.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quest Objectives */}
        <div className="shrink-0">
          <ExpandablePanel label="Objectives" icon={<ShieldAlert size={14} />}>
            <div className="space-y-1.5 flex-1">
              <div className="text-[10px] font-mono font-bold text-white flex items-center justify-between">
                <span>Quest:</span>
                <span className="text-[9px] bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-1 py-0.5 rounded uppercase font-mono">
                  {quest.status}
                </span>
              </div>
              <h4 className="text-xs font-serif font-black" style={{ color: themeColor }}>
                {quest.title}
              </h4>
              <p className="text-[10px] font-sans text-gray-400 leading-normal">
                {quest.description}
              </p>
            </div>
          </ExpandablePanel>
        </div>
      </div>

      {/* 2. MAIN IMMERSIVE CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden p-4 md:p-6 z-10">
        
        {/* Full-screen AI Background Image */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img
            src={`${bgUrl}?width=1920&height=1080&nologo=true`}
            alt={gameState.scene.location}
            className="w-full h-full object-cover filter brightness-[0.75] contrast-[1.05] transition-all duration-1000"
            referrerPolicy="no-referrer"
          />
          {/* Dark atmospheric overlay and vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/60" />
          <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        {/* Top Header / HUD Bar */}
        <div className="bg-[#121212]/80 backdrop-blur-md border border-gray-800/60 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-lg relative z-20">
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l rounded-tl-md" style={{ borderColor: themeColor }} />

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowExitConfirm(true)}
              className="p-2 rounded-lg bg-black/40 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 focus:outline-none transition-all cursor-pointer"
              title="Exit to Main Menu"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black tracking-widest text-sm text-white">
                  [AI DUNGEON MASTER]
                </span>
                <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold ${worldThemeBg} flex items-center gap-1`}>
                  {worldIcon}
                  <span>{world.name}</span>
                </span>
              </div>
              <div className="text-xs text-gray-500 font-mono mt-0.5">
                Adventurer: <span className="text-gray-300 font-semibold">{player.name}</span> (Lvl {player.level} {player.class})
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            {/* Health Bar */}
            <div className="flex items-center gap-2 bg-black/35 px-2.5 py-1.5 rounded-lg border border-gray-800/40">
              <span className="text-gray-500">HP:</span>
              <div className="flex items-center gap-0.5 mr-1" title={`${player.health}/100 HP`}>
                {Array.from({ length: maxHearts }).map((_, i) => (
                  <Heart
                    key={i}
                    size={11}
                    className={i < activeHearts ? "fill-red-500 text-red-500" : "text-gray-700"}
                  />
                ))}
              </div>
              <span className="text-red-400 font-bold">{player.health}/100</span>
            </div>

            {/* Mana */}
            <div className="flex items-center gap-2 bg-black/35 px-2.5 py-1.5 rounded-lg border border-gray-800/40">
              <span className="text-gray-500">MANA:</span>
              <span className="text-purple-400 font-bold">{player.mana}/100</span>
            </div>

            {/* Gold */}
            <div className="flex items-center gap-2 bg-black/35 px-2.5 py-1.5 rounded-lg border border-gray-800/40">
              <Coins size={12} className="text-yellow-500" />
              <span className="text-gray-500 uppercase">{world.name === "Zombie Apocalypse" ? "Scraps" : "Gold"}:</span>
              <span className="text-yellow-400 font-bold">{player.gold}</span>
            </div>

            {/* Mobile Sidebar Toggle */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-black transition-all cursor-pointer flex items-center gap-1.5 text-[11px] font-bold font-mono"
              style={{ backgroundColor: themeColor }}
            >
              <LayoutList size={13} />
              <span>SHEET</span>
            </button>

            {/* Mute Control */}
            <button
              onClick={toggleMute}
              className="p-2 rounded-lg bg-black/40 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 focus:outline-none transition-all cursor-pointer"
              title={isMuted ? "Unmute Ambient Music" : "Mute Ambient Music"}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>

            {/* History Logs Toggle Control */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="p-2 rounded-lg bg-black/40 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 focus:outline-none transition-all cursor-pointer flex items-center gap-1.5 text-[11px] font-bold font-mono"
              title="Open Adventure History Journal"
            >
              <BookOpen size={14} style={{ color: themeColor }} />
              <span className="hidden sm:inline">LOGS</span>
            </button>
          </div>
        </div>

        {/* Floating Location Banner (Aesthetic Central Accent) */}
        <div className="flex-1 flex flex-col justify-center items-center pointer-events-none relative z-10 select-none">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="px-6 py-4 bg-black/70 border border-white/10 backdrop-blur-md rounded-2xl text-center space-y-1"
          >
            <span className="text-[9px] font-mono tracking-widest uppercase" style={{ color: themeColor }}>CURRENT LOCATION</span>
            <h2 className="text-xl md:text-2xl font-serif font-black tracking-wider text-white">
              {gameState.scene.location}
            </h2>
            <span className="inline-block px-2 py-0.5 rounded bg-red-950/40 border border-red-500/20 text-red-400 text-[8px] font-mono tracking-widest uppercase">
              {gameState.scene.type} mode
            </span>
          </motion.div>
        </div>

        {/* 3. STORY NARRATIVE & ACTION INPUT CONTAINER (BOTTOM CENTER) */}
        <div className="max-w-2xl w-full mx-auto mt-auto mb-20 relative z-20">
          <StoryPanel />
        </div>

        {/* 4. FIXED ACTION INPUT AT THE VERY BOTTOM OF THE MAIN IMMERSIVE CONTENT AREA */}
        <div className="absolute bottom-4 left-4 right-4 md:left-6 md:right-6 max-w-2xl mx-auto z-30">
          <ActionInput />
        </div>
      </div>

      {/* 4. MOBILE DRAWER SIDEBAR */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/80"
            />
            
            {/* Drawer Sliding Board */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="relative w-80 max-w-[85vw] h-full bg-[#121212] border-r border-gray-800/80 p-5 overflow-y-auto flex flex-col gap-5 shadow-2xl z-50"
            >
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider" style={{ color: themeColor }}>ADVENTURER SHEET</span>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="text-gray-400 hover:text-white font-mono text-xs cursor-pointer p-1 border border-gray-800 rounded bg-black/20"
                >
                  [CLOSE]
                </button>
              </div>
              
              {/* Objectives */}
              <div className="bg-black/45 p-3 rounded-xl border border-gray-800 space-y-1 shrink-0">
                <div className="text-[10px] font-mono font-bold text-white flex items-center justify-between">
                  <span>QUEST: {quest.title}</span>
                  <span className="text-[8px] bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-1 py-0.5 rounded uppercase">
                    {quest.status}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 font-sans leading-relaxed">{quest.description}</p>
              </div>

              {/* Minimap */}
              <div className="shrink-0">
                <LocalMap />
              </div>
              
              {/* Inventory pack */}
              <div className="shrink-0">
                <Inventory />
              </div>
              
              {/* Encounters */}
              <div className="bg-black/45 p-3 rounded-xl border border-gray-800 space-y-2 shrink-0">
                <span className="text-[10px] font-mono font-bold block border-b border-gray-800/60 pb-1" style={{ color: themeColor }}>ENCOUNTERS</span>
                {npc && npc.name ? (
                  <div className="p-2 rounded bg-black/60 border border-gray-800/80 space-y-1">
                    <span className="text-[10px] font-mono font-bold" style={{ color: themeColor }}>{npc.name} ({npc.emotion})</span>
                    <p className="text-[10px] italic text-gray-300 font-serif leading-tight">"{npc.dialogue}"</p>
                  </div>
                ) : null}
                {enemy && enemy.name && enemy.health > 0 ? (
                  <div className="p-2 rounded bg-red-950/20 border border-red-500/20 space-y-1">
                    <span className="text-red-400 text-[10px] font-mono font-bold">HOSTILE: {enemy.name}</span>
                    <div className="w-full bg-black rounded-full h-1 overflow-hidden">
                      <div className="bg-red-500 h-full" style={{ width: `${enemy.health}%` }} />
                    </div>
                  </div>
                ) : null}
                {!npc && (!enemy || enemy.health <= 0) && (
                  <p className="text-[10px] text-gray-600 font-mono italic">No local entities nearby.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. MODALS (DEATH, VICTORY, EXIT CONFIRMATION) */}
      <AnimatePresence>
        {/* Exit confirmation modal */}
        {showExitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 select-none"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#1E1E1E] border border-gray-800 p-6 md:p-8 rounded-2xl max-w-sm w-full text-center space-y-6 relative shadow-2xl"
            >
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l rounded-tl-md" style={{ borderColor: themeColor }} />
              <h3 className="text-lg font-serif font-bold text-white">
                SUSPEND ADVENTURE?
              </h3>
              <p className="text-xs font-mono text-gray-400 leading-normal">
                Your progress is autosaved locally on this machine. Are you sure you want to suspend and return to the main menu?
              </p>
              <div className="flex gap-4">
                <Button variant="secondary" className="flex-1" onClick={() => setShowExitConfirm(false)}>
                  CONTINUE
                </Button>
                <Button variant="danger" className="flex-1" onClick={handleMainMenuClick}>
                  EXIT GAME
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Game Over Modal */}
        {gameStatus.gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50 select-none"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-[#121212] border-2 border-red-500 p-8 md:p-12 rounded-2xl max-w-md w-full text-center space-y-8 relative shadow-[0_0_30px_rgba(239,68,68,0.3)]"
            >
              <div className="flex justify-center">
                <Skull className="text-red-500 w-16 h-16 animate-bounce" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-serif font-black text-red-500 tracking-widest uppercase">
                  YOU HAVE DEPARTED
                </h2>
                <p className="text-xs font-mono text-gray-500 tracking-wider">
                  - THE STORY REACHES AN END -
                </p>
              </div>
              <p className="text-sm font-serif italic text-gray-400 leading-relaxed border-y border-red-500/20 py-4">
                "{gameState.story.currentText}"
              </p>
              <div className="flex gap-4">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => onNavigate("create")}
                >
                  NEW ADVENTURE
                </Button>
                <Button variant="secondary" className="flex-1" onClick={handleMainMenuClick}>
                  MAIN MENU
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Victory Modal */}
        {gameStatus.victory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50 select-none"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-[#121212] border-2 border-yellow-500 p-8 md:p-12 rounded-2xl max-w-md w-full text-center space-y-8 relative shadow-[0_0_30px_rgba(234,179,8,0.3)]"
            >
              <div className="flex justify-center">
                <Award className="text-yellow-500 w-16 h-16 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-serif font-black text-yellow-500 tracking-widest uppercase">
                  LEGEND SECURED
                </h2>
                <p className="text-xs font-mono text-gray-500 tracking-wider">
                  - VICTORY DECLARED -
                </p>
              </div>
              <p className="text-sm font-serif italic text-gray-300 leading-relaxed border-y border-yellow-500/20 py-4">
                "{gameState.story.currentText}"
              </p>
              <div className="flex gap-4">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => onNavigate("create")}
                >
                  NEW REALITY
                </Button>
                <Button variant="secondary" className="flex-1" onClick={handleMainMenuClick}>
                  MAIN MENU
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed bottom-6 right-6 bg-[#121212] px-5 py-3 rounded-xl text-xs font-mono flex items-center gap-2.5 z-50 shadow-2xl" style={{ borderColor: themeColor, color: themeColor, borderWidth: "1px" }}>
          <span className="inline-block w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: themeColor }} />
          <span>DM is calculating...</span>
        </div>
      )}

      {/* Auto-saving toast overlay */}
      <AnimatePresence>
        {showAutoSave && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-6 right-6 bg-black/90 border border-gray-800 rounded-xl px-4 py-2.5 text-gray-300 font-mono text-xs flex items-center gap-2 z-50 shadow-[0_4px_20px_rgba(0,0,0,0.85)] backdrop-blur-md"
          >
            <div className="relative flex items-center justify-center">
              <span className="absolute inline-flex h-2 w-2 rounded-full opacity-75 animate-ping" style={{ backgroundColor: themeColor }} />
              <Save size={13} className="relative z-10 animate-pulse" style={{ color: themeColor }} />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-200">
              Auto-saved to Realm
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Story History Sidebar Drawer */}
      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={gameState.story.history}
        worldName={world.name}
      />
    </div>
  );
}
