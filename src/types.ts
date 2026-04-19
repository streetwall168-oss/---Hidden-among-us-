export type Team = 'CIVILIAN' | 'SPY';

export interface Player {
  id: string;
  name: string;
  avatar: string;
}

export interface GamePlayer extends Player {
  role: Role;
  isSpy: boolean;
  isEliminated: boolean;
  hasUsedAbility: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  team: Team;
  ability?: string;
  isPremium: boolean;
  cost?: number;
}

export interface Category {
  id: string;
  name: string;
  words: string[];
  isPremium: boolean;
  cost?: number;
}

export type MissionPeriod = 'DAILY' | 'MONTHLY' | 'YEARLY';

export interface Mission {
  id: string;
  description: string;
  target: number;
  current: number;
  reward: number;
  isCompleted: boolean;
  isClaimed: boolean;
  period: MissionPeriod;
}

export interface UserData {
  coins: number;
  unlockedRoles: string[];
  unlockedCategories: string[];
  lastWheelSpin: string | null;
  players: Player[];
  lastMissionDate: string;
  lastMonthlyReset: string;
  lastYearlyReset: string;
  missions: Mission[];
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    abilitiesUsed: number;
  };
}

export type GamePhase = 'MENU' | 'SETUP_PLAYERS' | 'SETUP_GAME' | 'ROLE_SELECTION' | 'ROLE_REVEAL' | 'PLAYING' | 'DISCUSSION' | 'VOTING' | 'FINAL_CHANCE' | 'RESULTS' | 'STORE' | 'INSTRUCTIONS' | 'MISSIONS' | 'ABILITIES' | 'LEADERBOARD';
