import { useGame } from "../context/GameContext";
import Button from "../components/ui/Button";
import { ArrowLeft, Trash2, Calendar, Shield, Swords } from "lucide-react";
import { motion } from "motion/react";

interface ContinueProps {
  onNavigate: (screen: "home" | "create" | "continue" | "settings" | "game") => void;
}

export default function Continue({ onNavigate }: ContinueProps) {
  const { savedGames, loadGame, deleteGame, isLoading } = useGame();

  const handleSelectGame = async (gameId: string) => {
    try {
      await loadGame(gameId);
      onNavigate("game");
    } catch (e) {
      console.error(e);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="flex-1 max-w-2xl mx-auto p-4 md:p-8 select-none">
      {/* Back Header */}
      <div className="flex items-center justify-between mb-8 border-b border-[#333333] pb-4">
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white focus:outline-none cursor-pointer transition-all"
        >
          <ArrowLeft size={14} />
          <span>BACK TO MENU</span>
        </button>
        <span className="text-xs font-mono text-gray-500 tracking-widest uppercase">
          LOAD ADVENTURE
        </span>
      </div>

      <h2 className="text-xl font-serif font-black tracking-widest text-center text-[#EAB308] mb-8 uppercase">
        [ SELECT YOUR ADVENTURER ]
      </h2>

      {savedGames.length === 0 ? (
        <div className="bg-[#1E1E1E] border border-[#333333] rounded-2xl p-12 text-center shadow-xl">
          <p className="text-sm font-mono text-gray-500 italic mb-6">
            No existing adventures found on this machine.
          </p>
          <Button
            variant="primary-yellow"
            size="md"
            onClick={() => onNavigate("create")}
            className="mx-auto"
          >
            CREATE NEW CHARACTER
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {savedGames.map((game, i) => (
            <motion.div
              key={game.id}
              whileHover={{ scale: 1.01 }}
              className="bg-[#1E1E1E] border border-[#333333] hover:border-[#EAB308]/50 p-5 rounded-xl flex items-center justify-between gap-4 transition-all shadow-lg"
            >
              <div
                onClick={() => handleSelectGame(game.id)}
                className="flex-1 cursor-pointer space-y-2"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-serif font-bold text-white">
                    {game.player.name}
                  </span>
                  <span className="text-[10px] bg-[#EAB308]/10 border border-[#EAB308]/20 text-[#EAB308] font-mono font-bold px-2 py-0.5 rounded uppercase">
                    LVL {game.player.level} {game.player.class}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-mono text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Swords size={12} className="text-gray-600" />
                    <span>WORLD: {game.world.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield size={12} className="text-gray-600" />
                    <span>DIFFICULTY: {game.world.difficulty}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-1.5 mt-1 text-[10px] text-gray-500">
                    <Calendar size={10} />
                    <span>SAVED: {formatDate(game.gameStatus.saveTime)}</span>
                  </div>
                </div>
              </div>

              {/* Action columns */}
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary-yellow"
                  size="sm"
                  disabled={isLoading}
                  onClick={() => handleSelectGame(game.id)}
                >
                  LOAD
                </Button>
                <button
                  disabled={isLoading}
                  onClick={() => deleteGame(game.id)}
                  className="p-2.5 rounded-xl border border-transparent text-gray-500 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 focus:outline-none transition-all cursor-pointer disabled:opacity-35"
                  title="Delete Save File"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
