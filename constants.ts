
import { ElementDef, Weather, Season, GameEvent, UpgradeDef, QuizQuestion, ElementType, LeaderboardEntry } from './types';

export const ELEMENTS: Record<string, ElementDef> = {
  // GENERATORS
  solar: { id: 'solar', name: 'Solar Array', cost: 400, type: 'gen', baseValue: 45, icon: '☀️', description: 'Best in Summer/Clear skies.' },
  wind: { id: 'wind', name: 'Wind Turbine', cost: 800, type: 'gen', baseValue: 70, icon: '🌬️', description: 'Consistent output, great in Winter.' },
  hydro: { id: 'hydro', name: 'Hydro Dam', cost: 1200, type: 'gen', baseValue: 130, icon: '💧', description: 'High output, unaffected by clouds.' },
  thermo: { id: 'thermo', name: 'Thermo Plant', cost: 900, type: 'gen', baseValue: 100, icon: '🔥', description: 'High efficiency solar tech.' },
  geothermal: { id: 'geothermal', name: 'Geothermal', cost: 1500, type: 'gen', baseValue: 90, icon: '🌋', description: 'Expensive but constant power.', width: 2, height: 2 },
  
  // STORAGE
  battery_small: { id: 'battery_small', name: 'Battery (50kWh)', cost: 250, type: 'store', baseValue: 50, icon: '🔋', description: 'Small buffer. Winter cap -10%.' },
  battery_medium: { id: 'battery_medium', name: 'Battery (200kWh)', cost: 900, type: 'store', baseValue: 200, icon: '🔋', description: 'Medium buffer. Winter cap -10%.', width: 1, height: 2 },
  battery_large: { id: 'battery_large', name: 'Battery (500kWh)', cost: 2000, type: 'store', baseValue: 500, icon: '🔋', description: 'Large buffer. Winter cap -10%.', width: 2, height: 2 },

  // CONSUMERS (URBAN)
  apartment: { id: 'apartment', name: 'Apartments', cost: 200, type: 'load', baseValue: 25, icon: '🏢', description: 'Medium density housing.' },
  office: { id: 'office', name: 'Office Tower', cost: 300, type: 'load', baseValue: 40, icon: '🏬', description: 'Commercial load.' },
  factory: { id: 'factory', name: 'Factory', cost: 600, type: 'load', baseValue: 90, icon: '🏭', description: 'Heavy industrial load.' },
  hospital: { id: 'hospital', name: 'Hospital', cost: 1000, type: 'load', baseValue: 60, icon: '🏥', description: 'Critical infrastructure.' },
  
  // CONSUMERS (RURAL)
  house: { id: 'house', name: 'Rural House', cost: 150, type: 'load', baseValue: 15, icon: '🏠', description: 'Low density housing.' },
  barn: { id: 'barn', name: 'Barn', cost: 200, type: 'load', baseValue: 20, icon: '🏚️', description: 'Livestock and storage.' },
  greenhouse: { id: 'greenhouse', name: 'Greenhouse', cost: 350, type: 'load', baseValue: 35, icon: '🌿', description: 'High energy lighting required.' },
  milk_factory: { id: 'milk_factory', name: 'Milk Factory', cost: 600, type: 'load', baseValue: 70, icon: '🥛', description: 'Dairy processing plant.' },
  farm: { id: 'farm', name: 'Farm Field', cost: 250, type: 'load', baseValue: 30, icon: '🚜', description: 'General agriculture.' }, 

  // UTIL
  meter: { id: 'meter', name: 'Grid Ops', cost: 0, type: 'util', baseValue: 0, icon: '📡', description: 'Main connection point.' },
};

// Production Matrix: [Summer, Autumn, Winter, Spring]
// Matches the provided spreadsheet data
export const PRODUCTION_MATRIX: Record<ElementType | string, Record<string, number[]>> = {
  solar: {
    'Clear Skies': [1.0, 0.7, 0.4, 0.8],
    'Rainy':       [0.3, 0.2, 0.1, 0.2],
    'Windy':       [0.9, 0.6, 0.4, 0.7],
    'Cloudy':      [0.5, 0.3, 0.2, 0.4], // mapped 'Clouds' to Cloudy
    'Overcast':    [0.5, 0.3, 0.2, 0.4], // fallback
    'Stormy':      [0.2, 0.1, 0.0, 0.1], // fallback
    'Heatwave':    [1.1, 0.8, 0.5, 0.9], // fallback
  },
  wind: {
    'Clear Skies': [0.4, 0.5, 0.8, 0.6],
    'Rainy':       [0.5, 0.7, 0.8, 0.6],
    'Windy':       [0.8, 0.9, 1.0, 0.8],
    'Cloudy':      [0.5, 0.6, 0.8, 0.6],
    'Overcast':    [0.5, 0.6, 0.8, 0.6],
    'Stormy':      [1.0, 1.1, 1.2, 1.0], 
    'Heatwave':    [0.3, 0.4, 0.6, 0.5],
  },
  hydro: {
    'Clear Skies': [0.4, 0.6, 0.7, 0.8],
    'Rainy':       [0.7, 0.9, 0.8, 0.9],
    'Windy':       [0.4, 0.6, 0.7, 0.7],
    'Cloudy':      [0.5, 0.7, 0.7, 0.8],
    'Overcast':    [0.5, 0.7, 0.7, 0.8],
    'Stormy':      [0.8, 1.0, 0.9, 1.0],
    'Heatwave':    [0.3, 0.5, 0.6, 0.7],
  },
  geothermal: {
    'Clear Skies': [1,1,1,1],
    'Rainy':       [1,1,1,1],
    'Windy':       [1,1,1,1],
    'Cloudy':      [1,1,1,1],
    'Overcast':    [1,1,1,1],
    'Stormy':      [1,1,1,1],
    'Heatwave':    [1,1,1,1],
  }
};

export const UPGRADES: Partial<Record<ElementType, UpgradeDef[]>> = {
  // GENERATORS
  solar: [
    { id: 'coat', name: 'Nano-Coating', cost: 150, multiplier: 1.10, description: '+10% Output. Repels dust.' },
    { id: 'track', name: 'Dual-Axis Tracker', cost: 300, multiplier: 1.25, description: '+25% Output. Follows sun.' },
    { id: 'perov', name: 'Perovskite Cells', cost: 600, multiplier: 1.35, description: '+35% Output. High efficiency.' }
  ],
  wind: [
    { id: 'lub', name: 'Synthetic Lube', cost: 150, multiplier: 1.10, description: '+10% Output. Less friction.' },
    { id: 'aero', name: 'Aero Blades', cost: 350, multiplier: 1.25, description: '+25% Output. Optimized shape.' },
    { id: 'mag', name: 'Mag-Lev Bearings', cost: 700, multiplier: 1.30, description: '+30% Output. Frictionless.' }
  ],
  hydro: [
    { id: 'intake', name: 'Intake Screen', cost: 200, multiplier: 1.10, description: '+10% Flow consistency.' },
    { id: 'turb', name: 'Turbine Tuning', cost: 500, multiplier: 1.20, description: '+20% Output flow.' },
    { id: 'flood', name: 'Auto Floodgates', cost: 900, multiplier: 1.30, description: '+30% Max capacity.' }
  ],
  thermo: [
    { id: 'mirror', name: 'Polished Mirrors', cost: 250, multiplier: 1.15, description: '+15% Reflection.' },
    { id: 'salt', name: 'Molten Salt', cost: 500, multiplier: 1.25, description: '+25% Heat retention.' },
    { id: 'vac', name: 'Vacuum Receivers', cost: 800, multiplier: 1.35, description: '+35% Thermal capture.' }
  ],
  geothermal: [
    { id: 'sensor', name: 'Seismic Sensors', cost: 300, multiplier: 1.15, description: '+15% Safety/Stability.' },
    { id: 'deep', name: 'Deep Drilling', cost: 700, multiplier: 1.30, description: '+30% Access hotter crust.' },
    { id: 'binary', name: 'Binary Cycle', cost: 1000, multiplier: 1.40, description: '+40% Low-temp efficiency.' }
  ],
  
  // STORAGE
  battery_small: [
    { id: 'cool', name: 'Liquid Cooling', cost: 200, multiplier: 1.15, description: '+15% Efficiency.' },
    { id: 'solid', name: 'Solid State', cost: 800, multiplier: 1.60, description: '+60% Density and safety.' }
  ],
  battery_medium: [
    { id: 'cool', name: 'Liquid Cooling', cost: 400, multiplier: 1.15, description: '+15% Efficiency.' },
    { id: 'solid', name: 'Solid State', cost: 1200, multiplier: 1.60, description: '+60% Density and safety.' }
  ],
  battery_large: [
    { id: 'cool', name: 'Liquid Cooling', cost: 800, multiplier: 1.15, description: '+15% Efficiency.' },
    { id: 'solid', name: 'Solid State', cost: 2500, multiplier: 1.60, description: '+60% Density and safety.' }
  ],
  
  // UTILITIES
  meter: [
    { id: 'ai_bal', name: 'AI Load Balance', cost: 400, multiplier: 1.0, description: 'Global -5% Load via smart switching.' },
    { id: 'pred_maint', name: 'Predictive Maint.', cost: 600, multiplier: 1.0, description: 'Global -20% Upkeep costs.' },
    { id: 'super_cond', name: 'Superconductors', cost: 1000, multiplier: 1.0, description: 'Global +5% Generation efficiency.' }
  ],

  // CONSUMERS (URBAN)
  apartment: [
    { id: 'meter', name: 'Smart Meters', cost: 100, multiplier: 0.90, description: '-10% Load.' },
    { id: 'led', name: 'LED Retrofit', cost: 200, multiplier: 0.85, description: '-15% Load.' },
    { id: 'iso', name: 'Triple Glazing', cost: 400, multiplier: 0.75, description: '-25% Load.' }
  ],
  office: [
    { id: 'motion', name: 'Motion Sensors', cost: 150, multiplier: 0.90, description: '-10% Load.' },
    { id: 'smart', name: 'Smart HVAC', cost: 300, multiplier: 0.80, description: '-20% Load.' },
    { id: 'regen', name: 'Elevator Regen', cost: 500, multiplier: 0.75, description: '-25% Load.' }
  ],
  factory: [
    { id: 'grid', name: 'Micro-Grid', cost: 250, multiplier: 0.90, description: '-10% Load.' },
    { id: 'cogen', name: 'Co-Generation', cost: 500, multiplier: 0.80, description: '-20% Load.' },
    { id: 'robot', name: 'Robotics', cost: 900, multiplier: 0.70, description: '-30% Load.' }
  ],
  hospital: [
    { id: 'equip', name: 'Eco-Equipment', cost: 300, multiplier: 0.90, description: '-10% Load.' },
    { id: 'iso', name: 'Wall Insulation', cost: 500, multiplier: 0.85, description: '-15% Load.' },
    { id: 'backup', name: 'Backup Opt.', cost: 800, multiplier: 0.75, description: '-25% Load.' }
  ],
  
  // CONSUMERS (RURAL)
  house: [
    { id: 'led_r', name: 'LED Bulbs', cost: 50, multiplier: 0.95, description: '-5% Load.' },
    { id: 'insul', name: 'Roof Insulation', cost: 150, multiplier: 0.85, description: '-15% Load.' },
    { id: 'pump', name: 'Heat Pump', cost: 300, multiplier: 0.75, description: '-25% Load.' }
  ],
  barn: [
    { id: 'vent', name: 'Auto-Vent', cost: 100, multiplier: 0.90, description: '-10% Load.' },
    { id: 'auto', name: 'Smart Feeders', cost: 250, multiplier: 0.80, description: '-20% Load.' },
    { id: 'digest', name: 'Waste Digester', cost: 450, multiplier: 0.70, description: '-30% Load.' }
  ],
  greenhouse: [
    { id: 'drip', name: 'Drip Irrigation', cost: 150, multiplier: 0.90, description: '-10% Load.' },
    { id: 'therm', name: 'Thermal Screens', cost: 300, multiplier: 0.80, description: '-20% Load.' },
    { id: 'led_g', name: 'Spectrum LEDs', cost: 500, multiplier: 0.70, description: '-30% Load.' }
  ],
  milk_factory: [
    { id: 'cool', name: 'Cold Chain', cost: 250, multiplier: 0.90, description: '-10% Load.' },
    { id: 'eff', name: 'Efficient Motors', cost: 500, multiplier: 0.80, description: '-20% Load.' },
    { id: 'past', name: 'Flash Past.', cost: 800, multiplier: 0.70, description: '-30% Load.' }
  ],
  farm: [
    { id: 'gps', name: 'GPS Tracking', cost: 100, multiplier: 0.90, description: '-10% Load.' },
    { id: 'bio', name: 'Biogas Gen', cost: 300, multiplier: 0.75, description: '-25% Load.' }
  ],
};

export const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  { name: "GridMaster", score: 430, credits: 2100, scenario: "Urban", date: "2025-12-04" },
  { name: "EcoWarrior", score: 410, credits: 1850, scenario: "Rural", date: "2025-12-04" },
  { name: "SolarQueen", score: 380, credits: 1500, scenario: "Urban", date: "2025-12-03" },
  { name: "WindWalker", score: 320, credits: 1200, scenario: "Rural", date: "2025-12-02" },
  { name: "BatteryBoss", score: 290, credits: 900, scenario: "Urban", date: "2025-12-02" },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Which factor affects wind energy production the most?",
    options: ["Wind speed", "Air humidity", "Rain"],
    correctAnswer: 0
  },
  {
    id: 2,
    question: "Why are batteries important in a system with wind and solar energy?",
    options: ["They increase wind speed", "They provide stable energy during peaks and drops", "They make energy cheaper"],
    correctAnswer: 1
  },
  {
    id: 3,
    question: "What happens if you place too many wind turbines close together?",
    options: ["Production increases", "No effect", "Turbulence reduces production"],
    correctAnswer: 2
  },
  {
    id: 4,
    question: "Which option reduces CO2 emissions the most?",
    options: ["Reducing distances between cities and generation", "Installing wind turbines", "Removing batteries"],
    correctAnswer: 1
  },
  {
    id: 5,
    question: "What happens if you overload battery clusters?",
    options: ["Efficiency drops", "Efficiency increases", "No effect"],
    correctAnswer: 0
  },
  {
    id: 6,
    question: "Which type of energy is the most suitable as a constant power source?",
    options: ["Solar energy", "Wind energy", "Hydro energy", "Geothermal energy"],
    correctAnswer: 3
  },
  {
    id: 7,
    question: "What is the biggest challenge with wind power?",
    options: ["Wind is unpredictable", "It requires tall buildings", "It doesn't work at night"],
    correctAnswer: 0
  },
  {
    id: 8,
    question: "What is a negative synergy for wind turbines?",
    options: ["Placing them in open spaces", "Placing them too close together", "Combining them with batteries"],
    correctAnswer: 1
  },
  {
    id: 9,
    question: "Which factor has the greatest impact on solar energy output?",
    options: ["Wind speed", "Cloud cover", "Soil temperature"],
    correctAnswer: 1
  },
  {
    id: 10,
    question: "Wind turbines always produce the same amount of energy, no matter the wind speed.",
    options: ["True", "False"],
    correctAnswer: 1
  },
  {
    id: 11,
    question: "Solar panels work better when it is extremely hot.",
    options: ["True", "False"],
    correctAnswer: 1
  },
  {
    id: 12,
    question: "Which battery statement is incorrect?",
    options: ["Batteries can store energy for later use", "Batteries lose energy during charging", "Batteries return 100% of the energy you put in"],
    correctAnswer: 2
  },
  {
    id: 13,
    question: "Which source is most economical for large scale energy?",
    options: ["Geothermal", "Solar", "Wind", "Hydro"],
    correctAnswer: 2
  },
  {
    id: 14,
    question: "What forces PV Solar systems to use batteries?",
    options: ["Silicon cost", "Maintenance", "Heat", "Day/Night cycle"],
    correctAnswer: 3
  },
  {
    id: 15,
    question: "Game strategy: Key advantage of Geothermal?",
    options: ["No maintenance", "Cheapest to build", "Constant base power", "More winter energy"],
    correctAnswer: 2
  },
  {
    id: 16,
    question: "How does Winter affect Solar production vs Summer?",
    options: ["Cancelled", "Same", "Decreases significantly", "Increases"],
    correctAnswer: 2
  },
  {
    id: 17,
    question: "Why is energy mix important?",
    options: ["Balances reliability/sustainability", "Extra money", "Removes need for batteries"],
    correctAnswer: 0
  },
  {
    id: 18,
    question: "Main function of batteries in a wind-heavy grid?",
    options: ["Increase turbine power", "Smoothing variability", "Generate extra electricity", "Reduce noise"],
    correctAnswer: 1
  },
  {
    id: 19,
    question: "Characteristic of Hydroelectric power?",
    options: ["Lowest efficiency", "Cheap to install anywhere", "No water storage", "High stability/control"],
    correctAnswer: 3
  },
  {
    id: 20,
    question: "Risk of relying only on intermittent sources without storage?",
    options: ["Too much base gen", "High fuel costs", "Pollution", "Instability/Interruptions"],
    correctAnswer: 3
  },
  {
    id: 21,
    question: "Metric for long-term cost effectiveness?",
    options: ["LCOE", "Peak Power", "Construction Cost"],
    correctAnswer: 0
  },
  {
    id: 22,
    question: "Where is Geothermal energy derived from?",
    options: ["Sunlight", "Wind", "Rain", "Earth's internal heat"],
    correctAnswer: 3
  },
  {
    id: 23,
    question: "Main disadvantage of Wind Turbines?",
    options: ["Only work in Summer", "Consume water", "Unpredictable wind"],
    correctAnswer: 2
  },
  {
    id: 24,
    question: "Geothermal's 'superpower' vs Solar?",
    options: ["Anywhere", "Free to build", "Works 24/7"],
    correctAnswer: 2
  },
  {
    id: 25,
    question: "Which source becomes more efficient in cold temps?",
    options: ["Solar panels", "Wind turbines", "Geothermal"],
    correctAnswer: 0
  },
  {
    id: 26,
    question: "How does Energy Efficiency impact usage?",
    options: ["Increases usage", "Only renewable", "Reduces consumption without reducing output"],
    correctAnswer: 2
  },
  {
    id: 27,
    question: "What is a Smart Grid?",
    options: ["Optimizes distribution", "Nuclear only", "No sensors", "Disconnected"],
    correctAnswer: 0
  },
  {
    id: 28,
    question: "Winter + Cloudy: What happens to Solar Panels?",
    options: ["Double energy", "Much less energy", "Stop working"],
    correctAnswer: 1
  },
  {
    id: 29,
    question: "How does shading affect solar panels?",
    options: ["Reduces output", "Increases efficiency", "Improves lifespan"],
    correctAnswer: 0
  },
  {
    id: 30,
    question: "Best strategy to never run out of light?",
    options: ["Combine sources (Solar, Wind, Battery)", "Only Geothermal", "Different grid per season"],
    correctAnswer: 0
  }
];

export const WEATHER_TYPES: Weather[] = [
  { name: 'Clear Skies', solarMod: 1.2, windMod: 0.8, description: 'Perfect day for solar.', tip: 'Maximize Solar output.' },
  { name: 'Rainy', solarMod: 0.3, windMod: 1.1, description: 'Heavy rain, boosts Hydro.', tip: 'Hydro +20% Bonus.' },
  { name: 'Windy', solarMod: 0.9, windMod: 1.4, description: 'High winds.', tip: 'Wind turbines peaking.' },
  { name: 'Cloudy', solarMod: 0.5, windMod: 1.0, description: 'Diffuse light.', tip: 'Solar efficiency drops.' },
];

export const SEASONS: Season[] = [
  { name: 'Spring', solarMod: 1.0, windMod: 1.0, loadMod: 1.0 },
  { name: 'Summer', solarMod: 1.3, windMod: 0.7, loadMod: 1.2 }, // AC usage
  { name: 'Autumn', solarMod: 0.9, windMod: 1.1, loadMod: 1.0 },
  { name: 'Winter', solarMod: 0.6, windMod: 1.4, loadMod: 1.1 }, // Heating usage
];

export const EVENTS: GameEvent[] = [
  {
    id: 'maintenance',
    title: 'Grid Maintenance Required',
    description: 'The main transmission lines are aging. What should we do?',
    options: [
      { 
        label: 'Patch it up ($200)', 
        effect: (s) => ({ credits: s.credits - 200 }), 
        outcomeText: 'Cheap fix applied. Efficiency unaffected.' 
      },
      { 
        label: 'Full Upgrade ($800)', 
        effect: (s) => ({ 
           credits: s.credits - 800, 
           score: s.score + 50,
        }), 
        outcomeText: 'Grid efficiency improved! Global Output +5% permanently.' 
      }
    ]
  },
  {
    id: 'policy',
    title: 'New Green Policy',
    description: 'The city wants to subsidize renewable energy.',
    options: [
      { 
        label: 'Awareness Campaign ($200)', 
        effect: (s) => ({ credits: s.credits - 200, score: s.score + 30 }), 
        outcomeText: 'Residents are conserving energy! Global Load -5% permanently.' 
      },
      { 
        label: 'Ignore', 
        effect: (s) => ({ score: s.score - 20 }), 
        outcomeText: 'Public trust decreased. No change in consumption.' 
      }
    ]
  },
  {
    id: 'disaster',
    title: 'Minor Earthquake',
    description: 'Tremors detected near the sector.',
    options: [
      { 
        label: 'Inspect foundations ($300)', 
        effect: (s) => ({ credits: s.credits - 300 }), 
        outcomeText: 'Inspections complete. All clear.' 
      },
      { 
        label: 'Ignore it', 
        effect: (s) => {
           return { score: s.score - 50 };
        }, 
        outcomeText: 'CRITICAL FAILURE! A random building collapsed due to negligence.' 
      }
    ]
  },
  {
    id: 'blackout',
    title: '⚠️ ROLLING BLACKOUT WARNING',
    description: 'Extreme demand spikes are destabilizing the frequency! We need available stored energy (Charge) to stabilize the grid.',
    options: [
      {
        label: 'Attempt to Stabilize with Batteries',
        effect: (s) => {
          // Logic handled in App.tsx
          return { score: s.score }; 
        },
        outcomeText: (s) => {
           // CHECK ACTUAL CHARGE, NOT CAPACITY
           const charge = s.batteryCharge || 0;
           
           if (charge > 150) {
               return "⚡ GRID STABILIZED! Batteries absorbed the surge.\n\n🏆 REWARD: 'Emergency Preparedness' Buff (-5% Global Load).";
           } else {
               return `❌ FAILURE! Stored Charge (${Math.floor(charge)}kWh) too low (Need 150kWh).\n\n💸 PENALTY: Emergency Repairs (-$600).`;
           }
        }
      }
    ]
  }
];

export const GRID_SIZE_URBAN = 8;
export const GRID_SIZE_RURAL = 11;
export const RURAL_TRANSMISSION_DISTANCE_THRESHOLD = 3; // Cells
export const WIRE_COST_PER_UNIT = 75; // Cost per cell of distance beyond threshold
