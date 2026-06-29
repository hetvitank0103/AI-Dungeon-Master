export interface GameState {
  id: string; // Used for persistence lookup
  player: {
    name: string;
    class: string;
    health: number;
    mana: number;
    gold: number;
    level: number;
    experience: number;
  };
  world: {
    name: string;
    difficulty: "Easy" | "Medium" | "Hard";
    currentLocation: string;
    locations?: string[];
  };
  story: {
    currentText: string;
    history: string[];
  };
  inventory: InventoryItem[];
  quest: Quest;
  npc?: NPC;
  enemy?: Enemy;
  scene: Scene;
  randomEvent?: RandomEvent;
  choices?: string[];
  gameStatus: {
    gameOver: boolean;
    victory: boolean;
    saveTime: string; // ISO date string
  };
}

export interface InventoryItem {
  name: string;
  type: string;
  quantity: number;
}

export interface Quest {
  title: string;
  description: string;
  reward: string;
  status: "active" | "completed" | "failed";
}

export interface NPC {
  name: string;
  emotion: string;
  dialogue: string;
}

export interface Enemy {
  name: string;
  health: number;
  status: "alive" | "defeated";
}

export interface Scene {
  type:
    | "exploration"
    | "combat"
    | "dialogue"
    | "village"
    | "dungeon"
    | "treasure"
    | "boss"
    | "game_over";
  location: string;
  background: string;
  music: string;
}

export interface RandomEvent {
  triggered: boolean;
  event: string;
}

export interface GameSettings {
  masterVolume: number;
  textSpeed: "normal" | "instant";
  artworkStyle: "oil" | "pixel" | "sketch";
}
