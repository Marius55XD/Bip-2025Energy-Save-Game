
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
    correctAnswer: 0,
    hint: "More wind means more power. Place turbines where it's windy!",
    explanations: [
      "Correct! Wind speed directly determines how much kinetic energy the turbine can convert into electricity.",
      "Incorrect. Air humidity has almost no effect on wind energy production compared to wind speed.",
      "Incorrect. Rain does not significantly affect wind energy output; wind speed is the key factor."
    ]
  },
  {
    id: 2,
    question: "Why are batteries important in a system with wind and solar energy?",
    options: ["They increase wind speed", "They provide stable energy during peaks and drops", "They make energy cheaper"],
    correctAnswer: 1,
    hint: "Batteries keep your lights on when the sun or wind stops.",
    explanations: [
      "Incorrect. Batteries do not affect wind speed.",
      "Correct! Batteries store excess energy and release it during low production periods, ensuring stability.",
      "Incorrect. Batteries do not directly make energy cheaper, they improve reliability."
    ]
  },
  {
    id: 3,
    question: "What happens if you place too many wind turbines close together?",
    options: ["Production increases", "No effect", "Turbulence reduces production"],
    correctAnswer: 2,
    hint: "Spread turbines out so they don't block each other.",
    explanations: [
      "Incorrect. Placing turbines too close causes turbulence, reducing efficiency.",
      "Incorrect. There is an effect: turbulence reduces production.",
      "Correct! Turbulence between turbines reduces wind speed and energy output."
    ]
  },
  {
    id: 4,
    question: "Which option reduces CO2 emissions the most?",
    options: ["Reducing the distances between cities and energy production", "Installing wind turbines", "Removing batteries from green energy generation"],
    correctAnswer: 1,
    hint: "Renewable energy like wind and solar cuts CO2 the most.",
    explanations: [
      "Incorrect. While reducing distances helps, installing renewable sources like wind turbines has a bigger impact.",
      "Correct! Wind turbines generate clean energy, significantly reducing CO2 emissions.",
      "Incorrect. Removing batteries would harm stability, not reduce emissions."
    ]
  },
  {
    id: 5,
    question: "What happens if you overload battery clusters?",
    options: ["Efficiency drops", "Efficiency increases", "No effect"],
    correctAnswer: 0,
    hint: "Don't push batteries too hard.",
    explanations: [
      "Correct! Overloading batteries reduces efficiency and can damage them.",
      "Incorrect. Overloading does not increase efficiency; it causes problems.",
      "Incorrect. Overloading has a negative effect on performance."
    ]
  },
  {
    id: 6,
    question: "Which type of energy is the most suitable as a constant power source?",
    options: ["Solar energy", "Wind energy", "Hydro energy", "Geothermal energy"],
    correctAnswer: 3,
    hint: "Geothermal is steady, it works day and night.",
    explanations: [
      "Incorrect. Solar is intermittent and depends on sunlight.",
      "Incorrect. Wind is variable and unpredictable.",
      "Incorrect. Hydro is stable but depends on water availability.",
      "Correct! Geothermal provides constant base power all year round."
    ]
  },
  {
    id: 7,
    question: "What is the biggest challenge with wind power?",
    options: ["Wind is unpredictable", "It requires tall buildings", "It doesn't work at night"],
    correctAnswer: 0,
    hint: "Wind changes a lot, sometimes strong, sometimes weak.",
    explanations: [
      "Correct! Wind variability makes it hard to guarantee constant output.",
      "Incorrect. Wind turbines require towers, not tall buildings.",
      "Incorrect. Wind can blow at night; unpredictability is the real issue."
    ]
  },
  {
    id: 8,
    question: "What is a negative synergy for wind turbines?",
    options: ["Placing them in open spaces", "Placing them too close together", "Combining them with batteries"],
    correctAnswer: 1,
    hint: "Give turbines space, they need room to catch the wind.",
    explanations: [
      "Incorrect. Open spaces are ideal for wind turbines.",
      "Correct! Too close causes turbulence and reduces efficiency.",
      "Incorrect. Batteries complement wind energy, not harm it."
    ]
  },
  {
    id: 9,
    question: "Which factor has the greatest impact on solar energy output?",
    options: ["Wind speed", "Cloud cover", "Soil temperature"],
    correctAnswer: 1,
    hint: "Sunny days means more solar power.",
    explanations: [
      "Incorrect. Wind speed does not affect solar panels.",
      "Correct! Clouds block sunlight, reducing solar output.",
      "Incorrect. Soil temperature has no direct effect on solar panels."
    ]
  },
  {
    id: 10,
    question: "Wind turbines always produce the same amount of energy, no matter the wind speed",
    options: ["True", "False"],
    correctAnswer: 1,
    hint: "More wind means more energy.",
    explanations: [
      "Incorrect. Wind speed directly affects energy production.",
      "Correct! Wind speed determines how much energy turbines produce."
    ]
  },
  {
    id: 11,
    question: "Solar panels work better when it is extremely hot.",
    options: ["True", "False"],
    correctAnswer: 1,
    hint: "Cool and sunny is perfect for solar panels.",
    explanations: [
      "Incorrect. High temperatures reduce solar panel efficiency.",
      "Correct! Solar panels work best in cool, sunny conditions."
    ]
  },
  {
    id: 12,
    question: "Which battery statement is incorrect?",
    options: ["Batteries can store energy for later use", "Batteries lose some energy during charging/discharging", "Batteries return 100% of the energy you put in"],
    correctAnswer: 2,
    hint: "Batteries lose a little energy when charging and discharging.",
    explanations: [
      "Incorrect. Batteries can store energy for later use.",
      "Incorrect. Batteries do lose some energy during charging/discharging.",
      "Correct! Batteries never return 100% of the energy you put in."
    ]
  },
  {
    id: 13,
    question: "Which of the following sources of energy is the most economical option to generate energy on a large scale?",
    options: ["Geothermal", "Solar", "Wind", "Hydro"],
    correctAnswer: 3,
    hint: "Hydro is usually the cheapest for big projects.",
    explanations: [
      "Incorrect. Geothermal is reliable but costly to install.",
      "Incorrect. Solar is economical but less so than hydro for large scale.",
      "Incorrect. Wind is cost-effective but hydro beats it for large scale.",
      "Correct! Hydroelectric power is generally the most cost-effective for large-scale generation."
    ]
  },
  {
    id: 14,
    question: "In a photovoltaic solar energy system, what is the main limiting factor that forces the use of batteries to maintain a constant supply?",
    options: ["The cost of silicon", "Panel maintenance", "Excessive heat in summer", "The day/night cycle"],
    correctAnswer: 3,
    hint: "Solar stops at night, batteries keep power flowing.",
    explanations: [
      "Incorrect. Silicon cost does not force battery use.",
      "Incorrect. Maintenance is not the main limiting factor.",
      "Incorrect. Heat affects efficiency but not battery necessity.",
      "Correct! Solar panels only produce energy during the day, so batteries are needed for nighttime supply."
    ]
  },
  {
    id: 15,
    question: "What key advantage does geothermal energy offer over solar and wind energy in a game strategy?",
    options: ["It requires no maintenance", "It is the cheapest to build", "Provides constant base power all year", "It produces more energy in winter"],
    correctAnswer: 2,
    hint: "Geothermal works all the time, no matter the weather.",
    explanations: [
      "Incorrect. Geothermal still requires maintenance.",
      "Incorrect. It is not the cheapest to build.",
      "Correct! Geothermal provides constant base power all year.",
      "Incorrect. It does not produce more energy in winter specifically."
    ]
  },
  {
    id: 16,
    question: "How does winter generally affect solar energy production compared to summer?",
    options: ["It is completely cancelled", "It remains the same", "It decreases significantly", "It increases due to low temperatures"],
    correctAnswer: 2,
    hint: "Winter means less sunlight, so less solar power.",
    explanations: [
      "Incorrect. Solar does not stop completely in winter.",
      "Incorrect. It does not remain the same; it decreases.",
      "Correct! Shorter days and more clouds reduce solar output significantly.",
      "Incorrect. Cold does not increase solar production."
    ]
  },
  {
    id: 17,
    question: "Why is energy mix important?",
    options: ["It balances reliability and sustainability, avoiding instability penalties", "It gives you extra money", "It removes the need for batteries"],
    correctAnswer: 0,
    hint: "Mixing energy sources makes your grid stronger.",
    explanations: [
      "Correct! Combining sources ensures stability and avoids penalties for outages.",
      "Incorrect. It does not give extra money directly.",
      "Incorrect. Batteries are still needed even with a mix."
    ]
  },
  {
    id: 18,
    question: "What is the main function of batteries in a grid that relies primarily on wind power?",
    options: ["Increase the power of the turbines", "Smoothing wind variability", "Generate extra electricity", "Reducing the noise from the mills"],
    correctAnswer: 1,
    hint: "Batteries help when the wind slows down.",
    explanations: [
      "Incorrect. Batteries do not increase turbine power.",
      "Correct! Batteries store excess energy and release it when wind drops, stabilizing the grid.",
      "Incorrect. Batteries do not generate extra electricity.",
      "Incorrect. Batteries do not reduce noise."
    ]
  },
  {
    id: 19,
    question: "What characteristic best defines hydroelectric power compared to solar and wind power?",
    options: ["It has the lowest energy efficiency", "It is very cheap to install anywhere", "It does not require water storage", "High stability and controllability"],
    correctAnswer: 3,
    hint: "Hydro is steady and easy to control.",
    explanations: [
      "Incorrect. Hydro has high efficiency.",
      "Incorrect. It is not cheap to install anywhere.",
      "Incorrect. Hydro requires water storage.",
      "Correct! Hydro provides high stability and controllability."
    ]
  },
  {
    id: 20,
    question: "While planning your electrical grid in the game, what is the risk of relying exclusively on intermittent renewable sources (solar/wind) without sufficient storage?",
    options: ["Too much base generation", "Very high fuel costs", "Excessive pollution", "Instability and supply interruptions"],
    correctAnswer: 3,
    hint: "Without batteries, your power can stop suddenly.",
    explanations: [
      "Incorrect. Base generation is not the issue.",
      "Incorrect. Fuel costs are irrelevant for renewables.",
      "Incorrect. Pollution is not the problem here.",
      "Correct! Without storage, you risk instability and supply interruptions."
    ]
  },
  {
    id: 21,
    question: "What metric would you use to decide which energy source is most cost-effective in the long run for your game?",
    options: ["Levelized Cost of Energy (LCOE)", "Maximum (Peak) Power", "Construction cost only"],
    correctAnswer: 0,
    hint: "LCOE shows the real cost over time.",
    explanations: [
      "Correct! LCOE measures total lifetime cost per unit of energy.",
      "Incorrect. Peak power does not reflect long-term cost.",
      "Incorrect. Construction cost alone ignores maintenance and lifetime output."
    ]
  },
  {
    id: 22,
    question: "Where is geothermal energy derived from?",
    options: ["Sunlight", "Wind", "Rain", "Earth's internal heat"],
    correctAnswer: 3,
    hint: "Geothermal comes from heat deep underground.",
    explanations: [
      "Incorrect. Geothermal does not come from sunlight.",
      "Incorrect. It does not come from wind.",
      "Incorrect. Rain is not the source of geothermal energy.",
      "Correct! Geothermal taps into heat from the Earth's core."
    ]
  },
  {
    id: 23,
    question: "Wind turbines generate energy from the wind. What is their main disadvantage compared to other energy sources?",
    options: ["They only work in the summer", "They consume a lot of water", "The wind is unpredictable: sometimes it blows, sometimes it doesn't"],
    correctAnswer: 2,
    hint: "Wind can change quickly, sometimes strong and sometimes weak.",
    explanations: [
      "Incorrect. Wind works in all seasons.",
      "Incorrect. Wind turbines do not consume water.",
      "Correct! Wind is unpredictable: sometimes it blows, sometimes it doesn't."
    ]
  },
  {
    id: 24,
    question: "Geothermal energy extracts heat from the Earth's interior. What is its great 'superpower' compared to solar energy?",
    options: ["It can be placed anywhere, even in the air", "It's free to build", "It works 24 hours a day, whatever the weather"],
    correctAnswer: 2,
    hint: "Geothermal never stops, it works day and night.",
    explanations: [
      "Incorrect. Geothermal cannot be placed anywhere.",
      "Incorrect. It is not free to build.",
      "Correct! Geothermal works 24 hours a day, whatever the weather."
    ]
  },
  {
    id: 25,
    question: "Which energy source becomes more efficient at colder temperatures?",
    options: ["Solar panels", "Wind turbines", "Geothermal"],
    correctAnswer: 0,
    hint: "Solar likes cool weather, not heat.",
    explanations: [
      "Correct! Solar panels perform better in cooler conditions.",
      "Incorrect. Wind efficiency does not depend on temperature.",
      "Incorrect. Geothermal efficiency is not affected by cold."
    ]
  },
  {
    id: 26,
    question: "How does energy efficiency impact energy use?",
    options: ["Increases energy use", "Only affects renewable energy", "Reduces energy consumption without reducing output"],
    correctAnswer: 2,
    hint: "Efficiency means doing more with less energy.",
    explanations: [
      "Incorrect. Efficiency reduces energy use, not increases it.",
      "Incorrect. Efficiency affects all energy types, not just renewables.",
      "Correct! Efficiency reduces energy consumption without reducing output."
    ]
  },
  {
    id: 27,
    question: "What is a smart grid?",
    options: ["An electricity network that optimizes distribution", "Grid powered only by nuclear energy", "Simple power lines without sensors", "Grid disconnected from renewable sources"],
    correctAnswer: 0,
    hint: "Smart grids help balance energy and avoid waste.",
    explanations: [
      "Correct! A smart grid optimizes electricity distribution using sensors and automation.",
      "Incorrect. It is not limited to nuclear energy.",
      "Incorrect. Simple power lines without sensors are not smart grids.",
      "Incorrect. Smart grids integrate renewables, not disconnect them."
    ]
  },
  {
    id: 28,
    question: "If it's winter and cloudy in your game, what will happen to your solar panels?",
    options: ["They will produce twice as much energy", "They will produce much less energy than in summer", "They will stop working because of the cold"],
    correctAnswer: 1,
    hint: "Clouds and short days mean less solar power.",
    explanations: [
      "Incorrect. Solar panels will not produce twice as much energy.",
      "Correct! They will produce much less energy than in summer.",
      "Incorrect. Cold does not stop solar panels from working."
    ]
  },
  {
    id: 29,
    question: "How does shading affect solar panel performance?",
    options: ["Reduces electricity output", "Increases efficiency", "Improves panel lifespan"],
    correctAnswer: 0,
    hint: "Keep panels in the sun for best results.",
    explanations: [
      "Correct! Shade blocks sunlight, reducing power generation.",
      "Incorrect. Shade does not increase efficiency.",
      "Incorrect. Shade does not improve lifespan."
    ]
  },
  {
    id: 30,
    question: "What's the best strategy to never run out of light in the game?",
    options: ["Combine different energy sources (Solar, Wind, Batteries…)", "Building only Geothermal plants", "Build a different grid for each season"],
    correctAnswer: 0,
    hint: "Mix solar, wind, and batteries for a strong grid.",
    explanations: [
      "Correct! Combining different energy sources ensures reliability and avoids outages.",
      "Incorrect. Relying only on geothermal is risky and expensive.",
      "Incorrect. Building separate grids for each season is inefficient."
    ]
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
