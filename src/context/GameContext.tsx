import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { GameState, GameSettings } from "../types";
import { useAudio } from "./AudioContext";

interface GameContextType {
  gameState: GameState | null;
  savedGames: any[];
  worlds: any[];
  isLoading: boolean;
  settings: GameSettings;
  showAutoSave: boolean;
  fetchSavedGames: () => Promise<void>;
  startNewGame: (name: string, className: string, difficulty: string, worldName: string, storyName?: string, diceRoll?: number) => Promise<GameState>;
  sendAction: (actionText: string) => Promise<void>;
  loadGame: (gameId: string) => Promise<GameState>;
  deleteGame: (gameId: string) => Promise<void>;
  updateSettings: (updates: Partial<GameSettings>) => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const defaultSettings: GameSettings = {
  masterVolume: 60,
  textSpeed: "normal",
  artworkStyle: "oil",
};

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [savedGames, setSavedGames] = useState<any[]>([]);
  const [worlds, setWorlds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAutoSave, setShowAutoSave] = useState(false);
  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem("ai_dm_settings");
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const { playWorldMusic, stopMusic, setVolume, playSfx } = useAudio();

  // Load static configurations
  useEffect(() => {
    async function init() {
      try {
        const res = await axios.get("/api/worlds");
        setWorlds(res.data.worlds || []);
      } catch (err) {
        console.error("Failed to load worlds data:", err);
      }
    }
    init();
    fetchSavedGames();
  }, []);

  // Sync settings with local storage and audio context
  useEffect(() => {
    localStorage.setItem("ai_dm_settings", JSON.stringify(settings));
    setVolume(settings.masterVolume / 100);
  }, [settings]);

  const fetchSavedGames = async () => {
    try {
      const res = await axios.get("/api/games");
      setSavedGames(res.data.games || []);
    } catch (err) {
      console.error("Failed to fetch saved games:", err);
    }
  };

  const startNewGame = async (
    name: string,
    className: string,
    difficulty: string,
    worldName: string,
    storyName?: string,
    diceRoll?: number
  ): Promise<GameState> => {
    setIsLoading(true);
    playSfx("click");
    try {
      const res = await axios.post("/api/new-game", {
        name,
        className,
        difficulty,
        worldName,
        storyName,
        diceRoll,
      });
      const game = res.data.game as GameState;
      setGameState(game);
      playWorldMusic(game.world.name);
      playSfx("levelUp"); // play triumphant start
      await fetchSavedGames();
      setShowAutoSave(true);
      setTimeout(() => setShowAutoSave(false), 2200);
      return game;
    } catch (err) {
      console.error("Failed to start new game:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const sendAction = async (actionText: string) => {
    if (!gameState || isLoading) return;
    setIsLoading(true);
    playSfx("click");
    try {
      // Opt-in audio triggers based on context
      if (actionText.toLowerCase().includes("attack") || actionText.toLowerCase().includes("strike")) {
        playSfx("sword");
      } else if (actionText.toLowerCase().includes("potion") || actionText.toLowerCase().includes("drink")) {
        playSfx("potion");
      } else if (actionText.toLowerCase().includes("gold") || actionText.toLowerCase().includes("chest")) {
        playSfx("gold");
      }

      const res = await axios.post("/api/action", {
        gameId: gameState.id,
        action: actionText,
      });

      const updatedGame = res.data.game as GameState;
      setGameState(updatedGame);

      // Play level up SFX if they level up!
      if (updatedGame.player.level > gameState.player.level) {
        playSfx("levelUp");
      }

      await fetchSavedGames();
      setShowAutoSave(true);
      setTimeout(() => setShowAutoSave(false), 2200);
    } catch (err) {
      console.error("Action transmission failure:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadGame = async (gameId: string): Promise<GameState> => {
    setIsLoading(true);
    playSfx("click");
    try {
      const res = await axios.get(`/api/games/${gameId}`);
      const game = res.data.game as GameState;
      setGameState(game);
      playWorldMusic(game.world.name);
      return game;
    } catch (err) {
      console.error("Failed to load saved game:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteGame = async (gameId: string) => {
    playSfx("click");
    try {
      await axios.delete(`/api/games/${gameId}`);
      if (gameState?.id === gameId) {
        setGameState(null);
        stopMusic();
      }
      await fetchSavedGames();
    } catch (err) {
      console.error("Failed to delete saved game:", err);
    }
  };

  const updateSettings = (updates: Partial<GameSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const resetGame = () => {
    setGameState(null);
    stopMusic();
    playSfx("click");
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        savedGames,
        worlds,
        isLoading,
        settings,
        showAutoSave,
        fetchSavedGames,
        startNewGame,
        sendAction,
        loadGame,
        deleteGame,
        updateSettings,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
