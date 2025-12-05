# ECO GRID - AI Assistant Context Instructions

## PROJECT OVERVIEW

**Eco Grid** is a strategic energy management tycoon/simulation web game built with React 19 + TypeScript + Vite. Players manage a renewable energy grid for 12 months, balancing power generation vs. consumption while maintaining positive cash flow.

**Core Objective:** Survive 12 months without bankruptcy by building solar/wind/hydro/geothermal generators, battery storage, and managing consumer buildings across urban or rural scenarios.

**Tech Stack:**
- React 19.2.0 with TypeScript 5.8.2
- Vite 6.2.0 (build tool)
- Tailwind CSS (via CDN)
- Lucide React 0.555.0 (icons)
- Web Audio API (procedural sound synthesis)
- No backend (fully client-side, localStorage for leaderboard)

---

## FILE STRUCTURE & ARCHITECTURE

### **Entry Points:**
- `index.html` - Loads Tailwind CSS, fonts, React via importmap CDN
- `index.tsx` - React root render (mounts `<App />` to `#root`)
- `App.tsx` - **MAIN GAME COMPONENT** (1742 lines, all game logic + UI)

### **Core Files:**
- `types.ts` - TypeScript interfaces (GameState, GridItem, ElementDef, Weather, Season, GameEvent, QuizQuestion, LeaderboardEntry)
- `constants.ts` - Game data (33 ELEMENTS, PRODUCTION_MATRIX, 70+ UPGRADES, 4 WEATHER_TYPES, 4 SEASONS, 4 EVENTS, 30 QUIZ_QUESTIONS)
- `style.css` - Custom CSS (577 lines, glass morphism, animations, grid styling)

### **Config Files:**
- `vite.config.ts` - Dev server on port 3000, path alias `@` → root, env vars for GEMINI_API_KEY (unused)
- `tsconfig.json` - ES2022 target, React JSX, ESNext module
- `package.json` - Scripts: `dev`, `build`, `preview`

### **Deprecated/Unused:**
- `script.js` - Legacy vanilla JS version (IGNORE, not used in React build)
- `src/` folder - Duplicate App.tsx/constants.ts (organizational artifact)

---

## GAME STATE MANAGEMENT

### **Primary State (`useState<GameState>`):**
```typescript
{
  screen: 'menu' | 'scenario' | 'game' | 'quiz' | 'report' | 'gameover' | 'victory' | 'leaderboard'
  scenario: 'urban' | 'rural' | null
  credits: number              // Starting: $4000 (urban) / $2800 (rural)
  score: number                // Sum of monthly grid ratings
  month: number                // 1-12
  gridItems: GridItem[]        // All placed buildings
  weather: Weather             // Current weather (randomized monthly)
  selectedTool: ElementType | 'delete' | null
  inspectedItemId: string | null
  synergyActive: boolean       // Solar + wind both present
  gridSize: number             // 8 (urban) / 11 (rural)
  batteryCharge: number        // Current kWh stored
  lastMonthStats: { income, upkeep, rating, isOffGrid, storedEnergy, usedEnergy } | null
  pendingEvent: GameEvent | null
  currentQuiz: QuizQuestion | null
  quizResult: { correct: boolean, reward: number } | undefined
  tutorialStep: number         // 0 = off, 1-5 = active tutorial
  soundEnabled: boolean
  usedQuizIds: number[]        // Prevent duplicate quizzes
}
```

### **Secondary State:**
- `globalModifiers` - Event-based permanent buffs (`genEfficiency`, `loadReduction`)
- `leaderboard` - Top 10 scores (persisted to `localStorage`)
- `showHelp`, `toast` - UI toggles

### **Derived State (`useMemo`):**
- `calculateStats` - Aggregates all grid items into: `totalGen`, `totalLoad`, `upkeep`, `synergyActive`, `isOffGrid`, `totalCapacity`

---

## CRITICAL GAME MECHANICS

### **1. Power Balance System**
- **Generation (kW):** Sum of all solar/wind/hydro/thermo/geothermal output
- **Load (kW):** Sum of all apartments/offices/factories/farms/houses consumption
- **Balance:** `totalGen - totalLoad`
  - Positive balance (surplus) → Charge batteries
  - Negative balance (deficit) → Discharge batteries
  - Effective balance after battery = used for income calculation

### **2. Battery Mechanics (COMPLEX)**
- **Charging:** Surplus energy fills battery up to `totalCapacity` kWh
- **Discharging:** Deficit draws from battery (prevents blackout if sufficient charge)
- **Degradation:**
  - New batteries: 100% capacity
  - After 1 month: 90% capacity (permanent wear-in)
  - Winter: Additional 90% multiplier (cold impact)
  - After 12 months: 2% degradation per month (aging)
- **Blackout Event:** Requires 150+ kWh **stored charge** (NOT just capacity!)

### **3. Weather/Season System**
- **Production Matrix:** `PRODUCTION_MATRIX[elementType][weatherIndex][seasonIndex]`
- Weather changes randomly each month (Clear, Rainy, Windy, Cloudy)
- Seasons cycle: Spring (0-2), Summer (3-5), Autumn (6-8), Winter (9-11)
- Example: Solar in summer + clear skies = 1.4x multiplier
- Example: Wind in winter + windy = 1.3x multiplier

### **4. Synergy Bonuses**
- **Solar Panel:** +10% per adjacent solar, -10% if near apartments/offices (shadow)
- **Wind Turbine:** +10% if isolated (no neighbors), -20% if near other wind/apartments (turbulence)
- **Hydro Turbine:** +20% during rainy weather
- **Global Synergy:** If grid has both solar AND wind, `synergyActive = true` (visual indicator)

### **5. Rural Transmission Costs**
- Buildings placed >3 cells from center incur wiring costs
- Formula: `(distance - threshold) × $75 per cell`
- Example: Building at distance 5 = (5-3) × $75 = $150 extra cost
- Displayed on hover in rural scenario

### **6. Financial System**
- **Income Calculation (Monthly):**
  - If `effectiveBalance >= 0`: `$1500 + (balance × $3.0)`
  - If deficit: `$500` (penalty)
- **Upkeep:** 5% of building cost per month (reduced by `pred_maint` upgrade)
- **Quiz Bonus:** $300 for correct answers
- **Event Costs:** Variable per event choice
- **Net Monthly:** `credits += (income - upkeep + quizBonus ± eventEffect)`

### **7. Grid Rating System**
- Formula: `Math.min(100, Math.max(0, (totalGen / totalLoad) × 100))`
- Capped at 100%, minimum 0%
- Accumulated as `score` each month
- Used for leaderboard ranking

### **8. Event System (30% Monthly Chance)**
```typescript
EVENTS = [
  Grid Maintenance → Patch ($200, +rating) vs. Upgrade ($500, +5% gen efficiency PERMANENT)
  Policy → Awareness ($400, -5% load PERMANENT) vs. Ignore (no effect)
  Disaster → Inspect ($300, safe) vs. Ignore (risk building collapse)
  Blackout → Emergency Protocol (requires 150+ kWh stored, -5% load PERMANENT) vs. Emergency Purchase (auto-fail)
]
```
- Events apply **global modifiers** (permanent buffs/debuffs)
- Some events destroy buildings (earthquake negligence)
- Blackout check uses `batteryCharge` state (current stored energy)

### **9. Quiz System**
- 30 unique energy education questions
- Randomly selected each month (no repeats via `usedQuizIds`)
- Multiple choice format
- $300 reward for correct answers
- Educational content reinforces game mechanics (battery chemistry, solar physics, grid management)

---

## KEY FUNCTIONS REFERENCE

### **`calculateItemStats(item, gridItems, weather, month, globalModifiers)`**
**Purpose:** Calculate real-time kW/kWh for a single grid item.
**Logic:**
1. Get base value from `ELEMENTS[type].baseValue`
2. Apply weather/season multiplier from `PRODUCTION_MATRIX`
3. Apply upgrade multipliers (stacking)
4. Calculate synergies (neighbors via `getNeighbors()`)
5. Apply global modifiers (`genEfficiency`, `loadReduction`)
6. Handle battery degradation (based on `builtMonth`)
7. Return final value

### **`calculateStats` (useMemo)**
**Purpose:** Aggregate all grid items into totals.
**Dependencies:** `[gridItems, weather, month, globalModifiers]`
**Returns:** `{ totalGen, totalLoad, upkeep, synergyActive, isOffGrid, totalCapacity }`

### **`handleNextMonth()`**
**Purpose:** Advance to next month, process battery logic, trigger quiz/report.
**Flow:**
1. Calculate balance = `totalGen - totalLoad`
2. Update `batteryCharge` (charge/discharge logic)
3. Calculate income based on effective balance
4. Select random event (30% chance)
5. Select random unused quiz
6. Store `lastMonthStats`
7. Transition to `'quiz'` screen

### **`handleReportContinue(choiceIndex?, outcomeText?)`**
**Purpose:** Finalize monthly report, apply event effects, check win/loss.
**Flow:**
1. Apply net financial change: `credits += (income - upkeep + quizBonus)`
2. Execute event choice effect (update global modifiers, destroy buildings)
3. Check blackout condition (150+ kWh stored charge required)
4. **End Game Checks:**
   - `credits < 0` → Game Over
   - `month >= 12` → Victory
5. Advance month, randomize weather, transition to `'game'`

### **`handleMapClick(x, y)`**
**Purpose:** Handle grid cell clicks for building/deleting.
**Logic:**
- Delete tool → Remove building (50% refund), prevent locked/meter deletion
- No tool/existing → Open upgrade modal
- Build tool → Check bounds, collision, cost, add to `gridItems`

### **`applyUpgrade(upgradeId, cost)` / `sellUpgrade(upgradeId, cost)`**
**Purpose:** Purchase/sell upgrades (70% refund on sell).

### **`getNeighbors(x, y, w, h, gridItems)`**
**Purpose:** Find adjacent buildings for synergy calculations (AABB collision).

### **`renderGridIcon(type)`**
**Purpose:** Render Lucide React icons or emojis for building types.

---

## UI COMPONENTS

### **Main Screens:**
- `HelpModal` - Game rules, strategy tips, legend
- `TutorialOverlay` - 5-step guided tutorial
- `QuizScreen` - 30 energy questions, multiple choice
- `MonthlyReport` - Income/upkeep, battery stats, rating, events
- `EndGameScreen` - Victory/bankruptcy, name input, leaderboard save
- `LeaderboardScreen` - Top 10 scores, sortable

### **Gameplay UI:**
- **Header:** Credits, Score, Month, Sound toggle, Help, Quit
- **Left Panel:** Scrollable grid map (60px cells, pan/zoom)
- **Right Sidebar:** 
  - Real-time metrics (load balance gauge, battery meter)
  - Tool palette (build/delete buttons)
  - Next Month button
- **Floating Widget:** Weather/season display (top-left overlay)

### **Grid Rendering:**
- **Cell Size:** 60px × 60px
- **Multi-tile Support:** 1×1, 1×2, 2×2 buildings
- **Visual Feedback:**
  - Color-coded borders (gen=green, load=red, store=blue, util=yellow)
  - Glow effects (box-shadow)
  - Lock icons (city-owned buildings)
  - Upgrade dots (yellow circles)
  - kW/kWh labels at bottom
- **Wiring:** SVG lines (minimum spanning tree visualization)

---

## STYLING GUIDELINES

### **CSS Variables:**
```css
--bg-dark: #0f172a
--bg-panel: #1a1a1a
--gen-color: #00e676 (green)
--load-color: #ff5252 (red)
--store-color: #2979ff (blue)
--util-color: #ffea00 (yellow)
```

### **Glass Morphism:**
- `backdrop-filter: blur(10px)` on panels
- Semi-transparent backgrounds (`bg-slate-900/80`)

### **Animations:**
- Pulse (battery charging)
- Bounce (UI elements)
- Fade-in (screen transitions)
- Spin (loading states)

---

## DEVELOPMENT BEST PRACTICES

### **When Adding Features:**
1. **State Changes:** Always use `setState((prev) => ({ ...prev, newKey: value }))`
2. **Grid Operations:** Validate bounds, check collisions (multi-tile support)
3. **Financial Transactions:** Deduct cost BEFORE adding building (prevent overdraft)
4. **Event Effects:** Return partial `GameState` from choice functions
5. **Battery Logic:** Track `builtMonth` for degradation calculations
6. **Quiz System:** Add to `usedQuizIds` after selection, reset when all used

### **When Modifying Mechanics:**
- **Generation/Load:** Edit `PRODUCTION_MATRIX` in `constants.ts`
- **Upgrades:** Add to `UPGRADES` array with type-safe IDs
- **Events:** Add to `EVENTS` array with effect functions
- **Quizzes:** Append to `QUIZ_QUESTIONS` (max 30, expand carefully)

### **Performance Considerations:**
- Use `useMemo` for expensive calculations (already done for `calculateStats`)
- Avoid inline function definitions in map/render (use `useCallback` if needed)
- Grid re-renders are optimized (React batches state updates)

### **Testing Checklist:**
- [ ] Test urban + rural scenarios separately
- [ ] Verify battery charge/discharge logic (surplus/deficit)
- [ ] Confirm blackout event requires 150+ kWh **stored** (not capacity)
- [ ] Check synergy calculations (solar shadow, wind turbulence)
- [ ] Validate rural transmission cost display/calculation
- [ ] Test month 12 victory condition
- [ ] Test bankruptcy (credits < 0) game over
- [ ] Verify leaderboard persistence (localStorage)

---

## COMMON PITFALLS

### **Battery System:**
- ❌ Confusing `totalCapacity` (kWh max) with `batteryCharge` (kWh current)
- ❌ Forgetting winter/aging degradation multipliers
- ✅ Always use `batteryCharge` for blackout checks (150+ kWh stored)

### **Synergy Calculations:**
- ❌ Applying synergies globally instead of per-building
- ✅ Call `getNeighbors()` for EACH item individually

### **Event Effects:**
- ❌ Mutating state directly in event functions
- ✅ Return partial state objects from choice effects

### **Grid Sizing:**
- ❌ Hardcoding 8×8 grid (breaks rural mode)
- ✅ Use `gameState.gridSize` dynamically

### **Multi-tile Buildings:**
- ❌ Only checking origin cell (x, y) for collisions
- ✅ Check all cells occupied by width × height

---

## DATA CONSTANTS REFERENCE

### **Element Types (33 total):**
**Generators:** `solar`, `wind`, `hydro`, `thermo`, `geothermal`  
**Storage:** `battery_small`, `battery_medium`, `battery_large`  
**Urban Consumers:** `apartment`, `office`, `factory`, `hospital`  
**Rural Consumers:** `house`, `barn`, `greenhouse`, `milk_factory`, `farm`  
**Utility:** `meter` (Grid Ops, locked, center placement)

### **Upgrade Categories:**
- **Solar:** `solar_eff_1/2/3`, `dual_axis`, `cooling`
- **Wind:** `wind_eff_1/2/3`, `blade_ext`, `turb_cool`
- **Hydro:** `hydro_eff_1/2/3`, `turb_blade`, `runner_opt`
- **Geothermal:** `geo_eff_1/2/3`, `heat_exch`, `drill_deep`
- **Batteries:** `bat_cool_1/2/3`, `chem_stab`, `capacity`
- **Consumers:** `insul_1/2/3`, `led_light`, `smart_heat`, `hvac_opt`, `solar_panel_roof`
- **Grid Ops:** `ai_bal`, `pred_maint`, `super_cond`

### **Weather Effects:**
- **Clear Skies:** Solar +40%, Wind -20%
- **Rainy:** Solar -30%, Wind +10%, Hydro +20%
- **Windy:** Solar -10%, Wind +30%
- **Cloudy:** Solar -20%, Wind +5%

### **Season Effects:**
- **Spring:** Balanced (1.0x gen, 1.0x load)
- **Summer:** Solar +10%, Load +20% (AC demand)
- **Autumn:** Balanced (1.0x gen, 1.0x load)
- **Winter:** Solar -10%, Wind +10%, Load +30% (heating), Battery -10%

---

## DEPLOYMENT NOTES

### **Vercel Build Fix:**
- **Issue:** `Index.html` (capital I) not found on Linux servers
- **Solution:** Rename to `index.html` (lowercase)
- **Command:** `Move-Item -Path "Index.html" -Destination "index.html"` (PowerShell)

### **Build Process:**
1. `npm install` - Install dependencies
2. `npm run build` - Vite production build
3. Output → `dist/` folder
4. Entry: `dist/index.html`

### **Environment Variables:**
- `GEMINI_API_KEY` defined in `vite.config.ts` but **UNUSED** in current code
- Potential future AI feature (energy optimization assistant?)

---

## FUTURE ENHANCEMENT IDEAS

- [ ] Mobile responsive design (touch controls)
- [ ] Save/load game state (localStorage/cloud sync)
- [ ] More scenarios (island, desert, arctic)
- [ ] Achievements system
- [ ] Multiplayer leaderboard (backend integration)
- [ ] Sound effects library (replace Web Audio synth)
- [ ] Accessibility (keyboard navigation, ARIA labels, screen readers)
- [ ] Tutorial depth (explain synergies, advanced strategies)
- [ ] Code cleanup (remove unused `script.js`)

---

## AI ASSISTANT GUIDELINES

When helping with this project:

1. **Prioritize Game Balance:** Changes to costs, production values, or events should maintain 12-month playability
2. **Preserve Educational Value:** Quiz questions and mechanics should teach real energy concepts
3. **Respect Type Safety:** Always use TypeScript interfaces, avoid `any` types
4. **Maintain Immutability:** Never mutate state directly, use spread operators
5. **Test Edge Cases:** Battery charge limits, grid bounds, bankruptcy conditions
6. **Explain Trade-offs:** When suggesting features, note performance/complexity impact
7. **Reference Constants:** Point to specific lines in `constants.ts` when discussing game data
8. **Consider Scenarios:** Test changes work for both urban AND rural modes

---

**Last Updated:** December 2025  
**Total Lines of Code:** ~3,500+ (excluding node_modules)  
**Code Quality:** Production-ready, fully typed, optimized React patterns