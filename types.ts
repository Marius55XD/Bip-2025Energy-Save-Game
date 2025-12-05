
export type ElementType = 
  | 'solar' | 'wind' | 'hydro' | 'thermo' | 'geothermal' // Generators
  | 'battery_small' | 'battery_medium' | 'battery_large' // Storage
  | 'apartment' | 'office' | 'factory' | 'farm' | 'hospital' // Urban Consumers
  | 'house' | 'barn' | 'greenhouse' | 'milk_factory' // Rural Consumers
  | 'meter'; // Utility

export interface ElementDef {
  id: ElementType;
  name: string;
  cost: number;
  type: 'gen' | 'load' | 'store' | 'util';
  baseValue: number; // Generation or Load amount
  icon: string;
  description: string;
  width?: number; // Default 1
  height?: number; // Default 1
}

export interface UpgradeDef {
  id: string;
  name: string;
  cost: number;
  multiplier: number;
  description: string;
}

export interface GridItem {
  id: string; // Unique instance ID
  type: ElementType;
  x: number;
  y: number;
  locked?: boolean; // Cannot be deleted (Scenario specific)
  upgrades?: string[]; // IDs of applied upgrades
  builtMonth?: number;
}

export interface Weather {
  name: string;
  solarMod: number;
  windMod: number;
  description: string;
  tip: string;
}

export interface Season {
  name: string;
  solarMod: number;
  windMod: number;
  loadMod: number;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  options: {
    label: string;
    effect: (state: any) => Partial<any>; // Returns state updates
    outcomeText: string | ((state: any) => string); // Can be dynamic based on state
  }[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  credits: number;
  scenario: string;
  date: string;
}

export interface GameState {
  screen: 'menu' | 'scenario' | 'game' | 'quiz' | 'report' | 'gameover' | 'victory' | 'leaderboard';
  scenario: 'urban' | 'rural' | null;
  credits: number;
  score: number;
  month: number; // 0 to 11
  gridItems: GridItem[];
  weather: Weather;
  selectedTool: ElementType | 'delete' | null;
  inspectedItemId: string | null; // For upgrade modal
  synergyActive: boolean;
  gridSize: number; // Width/Height in cells
  
  // Battery State
  batteryCharge: number; // Current kWh stored globally
  
  lastMonthStats: {
    income: number;
    upkeep: number;
    rating: number;
    isOffGrid?: boolean;
    storedEnergy?: number;
    usedEnergy?: number;
  } | null;
  pendingEvent: GameEvent | null;
  currentQuiz: QuizQuestion | null;
  quizResult?: {
    correct: boolean;
    reward: number;
  };
  // New props
  tutorialStep: number; // 0 = off, 1+ = active steps
  soundEnabled: boolean;
  usedQuizIds: number[];
  
  // Loan System
  activeLoan: {
    amount: number;
    interestRate: number;
    monthlyPayment: number;
    remainingMonths: number;
  } | null;
  availableLoans: number; // Max 3 loans per game
}
