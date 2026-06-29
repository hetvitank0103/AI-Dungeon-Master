import { GoogleGenAI, Type } from "@google/genai";
import { buildSystemPrompt, buildUserPrompt } from "../utils/buildPrompt";
import { GameState } from "../../src/types";

// Initialize Gemini SDK with telemetry header as instructed
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "dummy-key",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

export interface LLMDMResponse {
  story: string;
  scene: {
    type: "exploration" | "combat" | "dialogue" | "village" | "dungeon" | "treasure" | "boss" | "game_over";
    location: string;
    background: string;
    music: string;
  };
  player: {
    health: number;
    mana: number;
    gold: number;
    level: number;
    experience: number;
  };
  inventory: Array<{
    name: string;
    type: string;
    quantity: number;
  }>;
  quest: {
    title: string;
    description: string;
    status: "active" | "completed" | "failed";
    reward: string;
  };
  npc?: {
    name: string;
    emotion: string;
    dialogue: string;
  };
  enemy?: {
    name: string;
    health: number;
    status: "alive" | "defeated";
  };
  randomEvent: {
    triggered: boolean;
    event: string;
  };
  choices: string[];
  game: {
    gameOver: boolean;
    victory: boolean;
  };
}

export async function askDungeonMaster(
  state: GameState,
  playerAction: string,
  worldRules: string,
  matchType: "right" | "similar" | "wrong" = "wrong"
): Promise<LLMDMResponse> {
  const systemPrompt = buildSystemPrompt(state.world.name, worldRules);
  const userPrompt = buildUserPrompt(state, playerAction, matchType);

  // Define structured JSON schema mapping perfectly to response_schema.json
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      story: {
        type: Type.STRING,
        description: "The next 2-3 sentences narrative describing what happened after the player's action.",
      },
      scene: {
        type: Type.OBJECT,
        properties: {
          type: {
            type: Type.STRING,
            description: "Must be one of: exploration, combat, dialogue, village, dungeon, treasure, boss, game_over",
          },
          location: {
            type: Type.STRING,
            description: "The name of the location after this action (e.g., High School, Ship Deck, Forbidden Vault).",
          },
          background: {
            type: Type.STRING,
            description: "A highly descriptive, detailed prompt (10-15 words) to generate an atmospheric RPG background image representing the current scene, location, and story context (e.g. 'A dark overgrown city street with abandoned cars, zombie apocalypse, high fantasy digital painting, cinematic lighting'). Do NOT return filenames like 'forest.jpg'.",
          },
          music: {
            type: Type.STRING,
            description: "Background music track name (e.g., zombie.mp3, pirate.mp3, magic.mp3, battle.mp3, victory.mp3, ambient.mp3).",
          },
        },
        required: ["type", "location", "background", "music"],
      },
      player: {
        type: Type.OBJECT,
        properties: {
          health: { type: Type.INTEGER, description: "Current health of the player (0 to 100)." },
          mana: { type: Type.INTEGER, description: "Current mana of the player (0 to 100)." },
          gold: { type: Type.INTEGER, description: "Current gold count." },
          level: { type: Type.INTEGER, description: "Current player level." },
          experience: { type: Type.INTEGER, description: "Current XP progress (0 to 100)." },
        },
        required: ["health", "mana", "gold", "level", "experience"],
      },
      inventory: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            type: { type: Type.STRING },
            quantity: { type: Type.INTEGER },
          },
          required: ["name", "type", "quantity"],
        },
        description: "The player's complete inventory items after additions or removals.",
      },
      quest: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          status: { type: Type.STRING, description: "Must be: active, completed, failed" },
          reward: { type: Type.STRING },
        },
        required: ["title", "description", "status", "reward"],
      },
      npc: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          emotion: { type: Type.STRING },
          dialogue: { type: Type.STRING, description: "Direct speech spoken by this NPC." },
        },
        required: ["name", "emotion", "dialogue"],
      },
      enemy: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          health: { type: Type.INTEGER },
          status: { type: Type.STRING, description: "Must be: alive, defeated" },
        },
        required: ["name", "health", "status"],
      },
      randomEvent: {
        type: Type.OBJECT,
        properties: {
          triggered: { type: Type.BOOLEAN, description: "True if a random encounter/event occurs." },
          event: { type: Type.STRING, description: "Description of the random event." },
        },
        required: ["triggered", "event"],
      },
      choices: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Exactly 4 suggestive quick commands appropriate for the next turn.",
      },
      game: {
        type: Type.OBJECT,
        properties: {
          gameOver: { type: Type.BOOLEAN },
          victory: { type: Type.BOOLEAN },
        },
        required: ["gameOver", "victory"],
      },
    },
    required: [
      "story",
      "scene",
      "player",
      "inventory",
      "quest",
      "randomEvent",
      "choices",
      "game",
    ],
  };

  const modelsToTry = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  // 1. Try Gemini first (highly stable, modern @google/genai SDK, preferred for Google AI Studio)
  for (let attempt = 0; attempt < modelsToTry.length; attempt++) {
    const modelName = modelsToTry[attempt];
    try {
      if (attempt > 0) {
        console.log(`[DM Status] moving to model ${modelName} on turn`);
        // Introduce simple delay backoff between retries
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }

      console.log(`[DM Status] Querying Gemini with model: ${modelName}`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 0.9,
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("unreachable response");
      }

      const parsed = JSON.parse(text) as LLMDMResponse;
      console.log(`[DM Status] Successfully generated story from Gemini using model: ${modelName}`);
      return parsed;
    } catch (error: any) {
      console.warn(`[DM Status] Gemini model ${modelName} failed/paused:`, error.message || error);
      lastError = error;
    }
  }

  // 2. Fall back to Groq if Gemini fails and Groq API key is present
  if (process.env.GROQ_API_KEY) {
    console.log("[DM Status] Gemini models failed. Trying Groq fallback...");
    const cleanSchemaString = `{
      "story": "string (engaging, descriptive 100-200 words narration, showing progress towards level up, and current level details clearly)",
      "scene": {
        "type": "exploration | combat | dialogue | village | dungeon | treasure | boss | game_over",
        "location": "string",
        "background": "string (high quality prompt for generating scenic background artwork, no filenames)",
        "music": "string (ambient.mp3, battle.mp3, victory.mp3, etc.)"
      },
      "player": {
        "health": number (0 to 100),
        "mana": number (0 to 100),
        "gold": number,
        "level": number (1 to 5),
        "experience": number (0 to 100)
      },
      "inventory": [
        {
          "name": "string",
          "type": "string",
          "quantity": number
        }
      ],
      "quest": {
        "title": "string",
        "description": "string",
        "status": "active | completed | failed",
        "reward": "string"
      },
      "npc": {
        "name": "string",
        "emotion": "string",
        "dialogue": "string"
      },
      "enemy": {
        "name": "string",
        "health": number,
        "status": "alive | defeated"
      },
      "randomEvent": {
        "triggered": boolean,
        "event": "string"
      },
      "choices": ["string", "string", "string", "string"],
      "game": {
        "gameOver": boolean,
        "victory": boolean
      }
    }`;

    const groqModels = ["llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "mixtral-8x7b-32768", "llama3-70b-8192", "llama-3.1-8b-instant"];
    
    for (const gModel of groqModels) {
      try {
        console.log(`[DM Status] Querying Groq with model: ${gModel}`);
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: gModel,
            messages: [
              { 
                role: "system", 
                content: `${systemPrompt}\n\nCRITICAL: You MUST respond with a single valid JSON object that exactly matches this schema format structure:\n${cleanSchemaString}\n\nDo not output any markdown formatting, preambles, or postambles. Only output raw valid JSON.` 
              },
              { 
                role: "user", 
                content: userPrompt 
              }
            ],
            response_format: { type: "json_object" },
            temperature: 0.85,
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Groq API returned status ${response.status}: ${errText}`);
        }

        const resData = await response.json() as any;
        const text = resData.choices?.[0]?.message?.content;
        if (!text) {
          throw new Error("No text response in Groq output choices.");
        }

        const parsed = JSON.parse(text) as LLMDMResponse;
        console.log(`[DM Status] Successfully generated story from Groq using model: ${gModel}`);
        return parsed;
      } catch (err: any) {
        console.warn(`[DM Status] Groq model ${gModel} failed or timed out:`, err.message || err);
        lastError = err;
      }
    }
  }

  // If all models are quiet/paused, log final notice and use procedural fallback DM narrative
  console.log("[DM Status] DM processing on local compute cluster");
  return generateLocalFallback(state, playerAction, matchType);
}

function generateLocalFallback(
  state: GameState,
  playerAction: string,
  matchType: "right" | "similar" | "wrong" = "wrong"
): LLMDMResponse {
  const worldName = state.world.name;
  const currentLoc = state.world.currentLocation;
  const actionLower = playerAction.toLowerCase();

  // 1. Determine world-specific details
  let locations: string[] = [];
  let monsters: string[] = [];
  let boss = "";
  let defaultMusic = "ambient.mp3";

  if (worldName === "Zombie Apocalypse") {
    locations = ["Store", "Hospital", "High School", "Highway", "Bridge"];
    monsters = ["Walker", "Runner", "Bloater", "Rogue Scavenger"];
    boss = "The Alpha Mutated Tank";
    defaultMusic = "zombie.mp3";
  } else if (worldName === "Pirate Ocean") {
    locations = ["Ship Deck", "Smuggler's Cave", "Port Royal Tavern", "Skeleton Island", "Kraken's Abyss"];
    monsters = ["Ghost Sailor", "Scurvy Raider", "Cursed Skeleton", "Giant Reef Shark"];
    boss = "The Kraken";
    defaultMusic = "pirate.mp3";
  } else {
    // Magic Academy
    locations = ["Grand Library", "Arcane Courtyard", "Forbidden Vault", "Floating Spire", "Alchemist's Lab"];
    monsters = ["Rogue Spellbook", "Mischievous Imp", "Mana Wraith", "Gargoyle Sentry"];
    boss = "The Shadow Archmage";
    defaultMusic = "magic.mp3";
  }

  // Override with dynamic campaign/story locations if present
  if (state.world.locations && state.world.locations.length > 0) {
    locations = state.world.locations;
  }

  // 2. Initialize copy of state values to modify safely
  let storyText = "";
  let nextLocation = currentLoc;
  let sceneType = state.scene.type || "exploration";
  let background = state.scene.background;
  let music = state.scene.music || defaultMusic;

  let health = state.player.health;
  let mana = state.player.mana;
  let gold = state.player.gold;
  let level = state.player.level;
  let experience = state.player.experience;
  let inventory = JSON.parse(JSON.stringify(state.inventory)) as typeof state.inventory;
  let quest = { ...state.quest };
  let enemy = state.enemy ? { ...state.enemy } : undefined;
  let npc = state.npc ? { ...state.npc } : undefined;
  let randomEvent = { triggered: false, event: "" };
  let gameOver = false;
  let victory = false;

  // Check if player action requested moving to another location
  for (const loc of locations) {
    if (actionLower.includes(loc.toLowerCase()) || actionLower.includes(`go to ${loc.toLowerCase()}`) || actionLower.includes(`explore ${loc.toLowerCase()}`)) {
      nextLocation = loc;
      break;
    }
  }

  // Smart sequential advance: if general travel is specified, move to the next logical area
  const isMoveAction = actionLower.includes("go") || actionLower.includes("move") || actionLower.includes("travel") || actionLower.includes("advance") || actionLower.includes("head") || actionLower.includes("climb");
  if (isMoveAction && nextLocation === currentLoc) {
    const currentIndex = locations.findIndex(l => l.toLowerCase().trim() === currentLoc.toLowerCase().trim());
    if (currentIndex !== -1 && currentIndex < locations.length - 1) {
      nextLocation = locations[currentIndex + 1];
    }
  }

  // 3. Process action categories
  if (nextLocation !== currentLoc) {
    // Movement transition
    sceneType = "exploration";
    npc = undefined;
    enemy = undefined;
    experience += 15;
    storyText = `You gather your belongings and travel carefully to the ${nextLocation}. The air shifts as you cross boundaries, feeling the tense atmosphere of this new sector. You gain 15 XP.`;
    
    // Chance to trigger an encounter or find supplies
    const roll = Math.random();
    if (roll < 0.4) {
      // Spawn a monster
      const monsterName = monsters[Math.floor(Math.random() * monsters.length)];
      sceneType = "combat";
      enemy = {
        name: monsterName,
        health: 50 + level * 10,
        status: "alive"
      };
      storyText += ` Suddenly, a hostile ${monsterName} emerges from the shadows, blocking your path! Prepare for battle!`;
      music = "battle.mp3";
    } else if (roll < 0.7) {
      // Spawn an NPC
      sceneType = "dialogue";
      if (worldName === "Zombie Apocalypse") {
        npc = {
          name: "Survivor Jack",
          emotion: "apprehensive",
          dialogue: "Thank goodness, another human. Stay quiet, they are attracted to fast movements."
        };
      } else if (worldName === "Pirate Ocean") {
        npc = {
          name: "Old Quartermaster Billy",
          emotion: "grumpy",
          dialogue: "Keep yer cutlass close, matey. Cursed ghosts walk these shores."
        };
      } else {
        npc = {
          name: "Grand Professor Vance",
          emotion: "mysterious",
          dialogue: "Ah, looking for lost spellbooks? Be careful of the floating constructs."
        };
      }
      storyText += ` You encounter ${npc.name}, who looks at you with a ${npc.emotion} expression.`;
    }
  } else if (actionLower.includes("attack") || actionLower.includes("strike") || actionLower.includes("fight") || actionLower.includes("spell") || actionLower.includes("weapon")) {
    // Combat Action
    if (enemy && enemy.status === "alive") {
      const damageToEnemy = Math.floor(Math.random() * 20) + 15 + level * 2;
      const damageToPlayer = Math.floor(Math.random() * 40) + 35; // deals 35-75 damage!

      enemy.health -= damageToEnemy;
      health -= damageToPlayer;

      if (enemy.health <= 0) {
        enemy.health = 0;
        enemy.status = "defeated";
        const gainedGold = Math.floor(Math.random() * 40) + 20;
        const gainedXp = 40;
        gold += gainedGold;
        experience += gainedXp;
        storyText = `You land a decisive strike against the ${enemy.name}, dealing ${damageToEnemy} damage and defeating them! You recover ${gainedGold} gold and gain ${gainedXp} XP from their remains.`;
        sceneType = "exploration";
        enemy = undefined;
        music = defaultMusic;
      } else {
        storyText = `You launch an assault against the ${enemy.name}, dealing ${damageToEnemy} damage. The beast retaliates swiftly, scratching you for ${damageToPlayer} damage!`;
      }
    } else {
      // Spawn a new encounter since player wants a fight
      const monsterName = monsters[Math.floor(Math.random() * monsters.length)];
      sceneType = "combat";
      enemy = {
        name: monsterName,
        health: 50 + level * 10,
        status: "alive"
      };
      storyText = `You draw your weapon, ready for battle. A wild ${monsterName} snarls and jumps forward to attack you!`;
      music = "battle.mp3";
    }
  } else if (actionLower.includes("potion") || actionLower.includes("eat") || actionLower.includes("drink") || actionLower.includes("heal") || actionLower.includes("rest") || actionLower.includes("biscuit") || actionLower.includes("meat")) {
    // Rest & Recover
    let itemIndex = -1;
    if (worldName === "Zombie Apocalypse") {
      itemIndex = inventory.findIndex(item => item.name === "Canned Meat" && item.quantity > 0);
    } else if (worldName === "Pirate Ocean") {
      itemIndex = inventory.findIndex(item => item.name === "Rye Biscuit" && item.quantity > 0);
    } else {
      itemIndex = inventory.findIndex(item => item.name === "Mana Potion" && item.quantity > 0);
    }

    experience += 10;
    if (itemIndex !== -1) {
      inventory[itemIndex].quantity -= 1;
      if (inventory[itemIndex].quantity <= 0) {
        inventory.splice(itemIndex, 1);
      }
      health = Math.min(100, health + 35);
      mana = Math.min(100, mana + 30);
      storyText = `You take a brief moment of respite to consume some supplies. You feel a warm surge of vitality restoring your health and focusing your mind. You gain 10 XP.`;
    } else {
      // Standard rest without consuming item
      health = Math.min(100, health + 15);
      mana = Math.min(100, mana + 10);
      storyText = `You rest quietly against a solid wall, taking deep breaths. You recover a small portion of your health and magical energy. You gain 10 XP.`;
    }
  } else if (actionLower.includes("search") || actionLower.includes("explore") || actionLower.includes("look") || actionLower.includes("examine") || actionLower.includes("loot")) {
    // Search / Investigation
    experience += 15;
    const roll = Math.random();
    if (roll < 0.5) {
      // Found something!
      let foundItemName = "Bandage";
      let foundItemType = "potion";
      if (worldName === "Zombie Apocalypse") {
        const items = ["First Aid Kit", "9mm Pistol", "Canned Meat"];
        foundItemName = items[Math.floor(Math.random() * items.length)];
        foundItemType = foundItemName === "9mm Pistol" ? "weapon" : foundItemName === "Canned Meat" ? "food" : "potion";
      } else if (worldName === "Pirate Ocean") {
        const items = ["Golden Doubloon", "Rye Biscuit", "Rum Bottle"];
        foundItemName = items[Math.floor(Math.random() * items.length)];
        foundItemType = foundItemName === "Golden Doubloon" ? "currency" : foundItemName === "Rye Biscuit" ? "food" : "potion";
      } else {
        const items = ["Mana Potion", "Spell scroll", "Mana Crystal"];
        foundItemName = items[Math.floor(Math.random() * items.length)];
        foundItemType = foundItemName === "Spell scroll" ? "weapon" : foundItemName === "Mana Potion" ? "potion" : "utility";
      }

      // Add to inventory
      const existing = inventory.find(i => i.name === foundItemName);
      if (existing) {
        existing.quantity += 1;
      } else {
        inventory.push({ name: foundItemName, type: foundItemType, quantity: 1 });
      }

      storyText = `You meticulously search the area. Underneath some rubble, you discover a useful item: **${foundItemName}**! You tuck it securely into your pack. You gain 15 XP.`;
    } else {
      // Find gold
      const foundGold = Math.floor(Math.random() * 30) + 10;
      gold += foundGold;
      storyText = `You scan the area carefully. In a hidden crevice, you spot a lost pouch containing **${foundGold} Gold**! Your fortune grows. You gain 15 XP.`;
    }
  } else if (npc && (actionLower.includes("talk") || actionLower.includes("speak") || actionLower.includes("ask") || actionLower.includes("greet") || actionLower.includes("hello"))) {
    // Talk to NPC
    experience += 10;
    storyText = `You step closer to ${npc.name} and strike up a conversation. They share their insights: "${npc.dialogue}". You gain 10 XP.`;
  } else {
    // General fallback description
    experience += 5;
    storyText = `You cautiously decide to: "${playerAction}". You observe your surroundings at the ${currentLoc}, remaining vigilant for any sudden changes. You gain 5 XP.`;
  }

  // Apply exact answer rules
  if (matchType === "right") {
    health = Math.min(100, state.player.health + 20);
    mana = Math.min(100, state.player.mana + 5);
    gold = state.player.gold + 50;
    experience = state.player.experience + 25; // 25 XP reward for perfect answer
    storyText = `[RIGHT ANSWER] You flawlessly executed your action! You gain +1 Heart (+20 Health), +5 Mana, and +50 Gold!\n\n` + storyText;
  } else if (matchType === "similar") {
    health = state.player.health; // +0 heart
    mana = Math.min(100, state.player.mana + 2);
    gold = state.player.gold + 20;
    experience = state.player.experience + 15; // 15 XP reward for similar answer
    storyText = `[SIMILAR ANSWER] You executed a close/similar action with minor variations! You gain +0 Heart (+0 Health), +2 Mana, and +20 Gold!\n\n` + storyText;
  }

  // 4. Handle Level Up check
  if (experience >= 100) {
    level += 1;
    experience = experience % 100;
    storyText += ` \n\n**LEVEL UP!** You have passed the challenges of Level ${level - 1} and advanced to Level ${level}! Your capacities grow stronger, and your health and mana are fully restored.`;
    health = 100;
    mana = 100;
  }

  // Level constraint: check if level has reached 5 (the final level)
  if (level >= 5) {
    level = 5;
    if (!enemy || enemy.name !== boss) {
      sceneType = "boss";
      enemy = {
        name: boss,
        health: 100,
        status: "alive"
      };
      storyText += ` \n\n**THE FINAL LEVEL:** You have reached Level 5, the final level of your journey! The ultimate guardian, **${boss}**, rises before you! Defeat them to conquer the realm, or face eternal defeat!`;
      music = "boss.mp3";
    }
  }

  // Handle battle victory on the final boss at level 5
  if (level === 5 && enemy && enemy.name === boss && enemy.health <= 0) {
    victory = true;
    quest.status = "completed";
    storyText = `\n\n**GLORIOUS VICTORY!** With a final masterstroke, you have defeated ${boss}! You have conquered Level 5, completed your quest, and cemented your name in legend forever!`;
    music = "victory.mp3";
    enemy = undefined;
  }

  // Handle player death
  if (health <= 0) {
    health = 0;
    gameOver = true;
    sceneType = "game_over";
    storyText = `Alas, the perils of this world have overwhelmed you. Your health has dropped to zero. Your journey ends in death at the ${currentLoc}... [Level Reached: ${level}/5]`;
    music = "game_over";
  }

  // Explaining the flow of the story dynamically so the user always understands
  if (!gameOver && !victory) {
    storyText += ` \n\n*[STORY FLOW: You are currently Level ${level}/5 (${experience}/100 XP). Perform actions, defeat enemies, and explore locations to gain XP. Reaching Level 5 unlocks the final boss fight!]*`;
  }

  // Choose 4 smart, interactive quick command choices
  let choices: string[] = [];
  if (gameOver) {
    choices = ["Create a new character", "Restart game", "Main Menu"];
  } else if (enemy && enemy.status === "alive") {
    choices = ["Attack with weapon", "Cast offensive spell", "Check inventory pack", "Retreat to safety"];
  } else {
    choices = ["Search for supplies", "Rest and recover"];
    // Add movement choices to adjacent nodes
    const currentIndex = locations.indexOf(nextLocation);
    if (currentIndex !== -1) {
      if (currentIndex > 0) {
        choices.push(`Go to ${locations[currentIndex - 1]}`);
      }
      if (currentIndex < locations.length - 1) {
        choices.push(`Go to ${locations[currentIndex + 1]}`);
      }
    }
  }

  return {
    story: storyText,
    scene: {
      type: sceneType,
      location: nextLocation,
      background,
      music,
    },
    player: {
      health,
      mana,
      gold,
      level,
      experience,
    },
    inventory,
    quest,
    npc,
    enemy,
    randomEvent,
    choices,
    game: {
      gameOver,
      victory,
    }
  };
}
