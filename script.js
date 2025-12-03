// --- CONFIGURATION ---
const GRID_SIZE = 70; 
const MAX_MONTHS = 12;

// DEFINITIONS
const ELEMENTS = {
    // Generators
    photovoltaic: { name: 'Solar Array', cost: 400, type: 'gen', base: 40, icon: '☀️' },
    wind: { name: 'Wind Turbine', cost: 800, type: 'gen', base: 65, icon: '🌬️' },
    hydro: { name: 'Hydro Plant', cost: 1200, type: 'gen', base: 120, icon: '💧' },
    
    // Storage
    batteries: { name: 'Lithium Bank', cost: 500, type: 'store', base: 150, icon: '🔋' },

    // Consumers
    building: { name: 'Apartments', cost: 200, type: 'load', base: 25, icon: '🏢' },
    warehouse: { name: 'Logistics', cost: 300, type: 'load', base: 45, icon: '📦' },
    factory: { name: 'Heavy Factory', cost: 600, type: 'load', base: 90, icon: '🏭' },
    farm: { name: 'Farm Systems', cost: 250, type: 'load', base: 35, icon: '🚜' },
    critical: { name: 'Hospital', cost: 1000, type: 'load', base: 60, icon: '🏥' },
    
    // Utility
    meter: { name: 'Grid Ops', cost: 100, type: 'util', base: 0, icon: '📡' },

    // office

    office: {name: 'Office Tower', cost: 300, type: 'load', base: 40, icon: '🏬'},

        //police station

    police: {name: 'Police Station', cost: 300, type: 'load', base: 30, icon: '🚓'},

    //barn
    barn: {name: 'Barn', cost: 300, type: 'load', base: 35, icon: '🏚️'},    // rural barn-style emoji

    //
    greenhouse: {name: 'Greenhouse', cost: 350, type: 'load', base: 50, icon: '🌿'},

    photovoltaic: {name: 'Solar Panel', cost: 400, type: 'gen', base: 40, icon: '☀️'},

    thermo: {name: 'Thermo Solar Plant', cost: 900, type: 'gen', base: 95, icon: '🔥'},

    geothermal: {name: 'Geothermal Plant', cost: 1500, type: 'gen', base: 110, icon: '🌋'},

    hydrodam: {name: 'Hydro Dam', cost: 2000, type: 'gen', base: 180, icon: '🛠️'}





};

// UPGRADES - Added missing items to ensure EVERYTHING is clickable
const UPGRADES = {
    photovoltaic: [
        { id: 'track', name: 'Dual-Axis Tracker', cost: 250, mod: 1.35, desc: '+35% Output' },
        { id: 'clean', name: 'Self-Cleaning', cost: 100, mod: 1.10, desc: '+10% Output' }
    ],
    wind: [
        { id: 'aero', name: 'Aerodynamic Blades', cost: 300, mod: 1.25, desc: '+25% Output' },
        { id: 'gear', name: 'Gearbox Lube', cost: 150, mod: 1.15, desc: '+15% Output' }
    ],
    hydro: [
        { id: 'turb', name: 'Turbine Tuning', cost: 400, mod: 1.20, desc: '+20% Output' },
        { id: 'flow', name: 'Flow Control', cost: 200, mod: 1.10, desc: '+10% Output' }
    ],
    building: [
        { id: 'led', name: 'LED Retrofit', cost: 100, mod: 0.85, desc: '-15% Load' },
        { id: 'ins', name: 'Wall Insulation', cost: 200, mod: 0.75, desc: '-25% Load' }
    ],
    warehouse: [
        { id: 'motion', name: 'Motion Sensors', cost: 150, mod: 0.80, desc: '-20% Load' },
        { id: 'roof', name: 'Cool Roof', cost: 200, mod: 0.90, desc: '-10% Load' }
    ],
    factory: [
        { id: 'waste', name: 'Waste Heat Recovery', cost: 500, mod: 0.70, desc: '-30% Load' },
        { id: 'motor', name: 'Efficient Motors', cost: 300, mod: 0.85, desc: '-15% Load' }
    ],
    farm: [
        { id: 'auto', name: 'Auto-Irrigation', cost: 150, mod: 0.80, desc: '-20% Load' },
        { id: 'pump', name: 'Solar Pumps', cost: 250, mod: 0.70, desc: '-30% Load' }
    ],
    critical: [
        { id: 'backup', name: 'Backup Gen', cost: 400, mod: 0.80, desc: '-20% Load' },
        { id: 'hvac', name: 'Smart HVAC', cost: 300, mod: 0.75, desc: '-25% Load' }
    ],
    meter: [
        { id: 'ai', name: 'AI Optimization', cost: 1000, mod: 1.0, desc: 'Grid Stability +' }
    ],
    batteries: [
        { id: 'cap', name: 'Capacity Expansion', cost: 400, mod: 1.50, desc: '+50% Capacity' }
    ],

    office: [
        { id: 'insulate', name: 'Insulation Upgrade', cost: 150, mod: 0.85, desc: '-15% Load' },
        { id: 'led', name: 'LED Lighting Upgrade', cost: 120, mod: 0.80, desc: '-20% Load' }
    ],

    police: [
        { id: 'efficientLighting', name: 'Efficient Lighting', cost: 120, mod: 0.85, desc: '-15% Load' },
        { id: 'insulation', name: 'Station Insulation', cost: 180, mod: 0.75, desc: '-25% Load' }
    ],

    barn: [
        { id: 'insulate', name: 'Wall Insulation', cost: 120, mod: 0.85, desc: '-15% Load' },
        { id: 'vent', name: 'Auto Ventilation', cost: 180, mod: 0.75, desc: '-25% Load' }
    ],

    greenhouse: [
        { id: 'heat', name: 'Efficient Heating', cost: 200, mod: 0.85, desc: '-15% Load' },
        { id: 'glass', name: 'Thermal Glass', cost: 300, mod: 0.70, desc: '-30% Load' }
    ],

    thermo: [
        { id: 'mirrors', name: 'Mirror Expansion', cost: 350, mod: 1.25, desc: '+25% Output' },
        { id: 'cooling', name: 'Heat Sink Cooling', cost: 200, mod: 1.15, desc: '+15% Output' }
    ],
    geothermal: [
        { id: 'steamBoost', name: 'Steam Cycle Boost', cost: 400, mod: 1.20, desc: '+20% Output' },
        { id: 'thermalLoop', name: 'Thermal Loop Optimization', cost: 600, mod: 1.35, desc: '+35% Output' }
    ],

    hydrodam: [
        { id: 'turbinePlus', name: 'Advanced Turbines', cost: 500, mod: 1.25, desc: '+25% Output' },
        { id: 'spillway', name: 'Spillway Control', cost: 350, mod: 1.15, desc: '+15% Output' }
    ]






};



const SEASONS = [
    { name: 'Winter', icon: 'ac_unit', solar: 0.5, wind: 1.3 },
    { name: 'Spring', icon: 'local_florist', solar: 0.9, wind: 1.0 },
    { name: 'Summer', icon: 'wb_sunny', solar: 1.4, wind: 0.6 },
    { name: 'Autumn', icon: 'grass', solar: 0.8, wind: 1.1 }
];

// --- RANDOM WEATHER CONDITIONS ---
const WEATHER_TYPES = [
    {
        name: "Clear Skies",
        icon: "☀️",
        solar: 1.0,   // normal
        wind: 1.0,
        hydro: 1.0
    },
    {
        name: "Windy",
        icon: "🌬️",
        solar: 0.9,   // slightly reduced
        wind: 1.35,   // big boost
        hydro: 1.0
    },
    {
        name: "Cloudy",
        icon: "☁️",
        solar: 0.65,  // strong penalty
        wind: 1.0,
        hydro: 1.05   // small rainfall runoff boost
    },
    {
        name: "Rainy",
        icon: "🌧️",
        solar: 0.5,   // very weak solar
        wind: 1.1,    // moderate wind boost
        hydro: 1.25   // strong hydropower boost
    }
];


// STATE
let state = { credits: 0, score: 0, month: 0, grid: [], tool: null, weather:null };

// DOM ELEMENTS
const dom = {
    map: document.getElementById('system-map'),
    layer: document.getElementById('map-elements-layer'),
    credits: document.getElementById('credits-display'),
    score: document.getElementById('score-display'),
    date: document.getElementById('date-display'),
    loadBar: document.getElementById('load-bar'),
    genBar: document.getElementById('gen-bar'),
    balanceText: document.getElementById('balance-text'),
    toolTip: document.getElementById('tool-tip'),


};

// --- GAME LOGIC ---

//grid sizing
function resizeGridToFit()
{
    const container = document.getElementById("system-map");

    let width = container.clientWidth;
    let height = container.clientHeight;


}

function startGame(scenario) {
    document.getElementById('start-screen').classList.remove('active');
    state.month = 0; state.score = 0; state.grid = [];
    dom.layer.innerHTML = '';

    if (scenario === 'urban') {
        state.credits = 5000;
        placeItem('meter', 280, 280, false);
        placeItem('building', 70, 70, true);
        placeItem('building', 140, 70, true);
        placeItem('building', 70, 140, true);
        placeItem('warehouse', 210, 70, false);
        placeItem('critical', 420, 140, false);
        placeItem('office', 210, 210, false);
        placeItem('police', 350, 210, false);

    } else {
        // RURAL
        state.credits = 4500;
        placeItem('meter', 280, 280, true);
        placeItem('hydro', 490, 70, false);
        placeItem('factory', 70, 280, true);
        placeItem('farm', 140, 70, true);
        placeItem('farm', 210, 70, true);
        placeItem('barn', 350, 280, true);
        placeItem('greenhouse', 350, 210, true);
    }

    updateUI();
}

function selectTool(key) {
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    
    if (state.tool === key) {
        state.tool = null;
        dom.map.classList.remove('build-mode');
        dom.toolTip.innerText = "Select a component to build";
    } else {
        state.tool = key;
        dom.map.classList.add('build-mode');
        const btn = document.querySelector(`.tool-btn[onclick="selectTool('${key}')"]`);
        if(btn) btn.classList.add('active');

        if (key === 'delete') {
            dom.toolTip.innerText = "DECONSTRUCT MODE: Click element to remove";
        } else {
            const item = ELEMENTS[key];
            dom.toolTip.innerText = `BUILD ${item.name.toUpperCase()} ($${item.cost})`;
        }
    }
}

// MAP CLICK HANDLER (Fixing the "Click Gap" issue)
dom.map.addEventListener('click', (e) => {
    // Calculate grid coordinates
    const rect = dom.map.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / GRID_SIZE) * GRID_SIZE;
    const y = Math.floor((e.clientY - rect.top) / GRID_SIZE) * GRID_SIZE;

    // Boundary check
    if (x < 0 || y < 0 || x >= rect.width - 10 || y >= rect.height - 10) return;

    // Check if something is here
    const existingIndex = state.grid.findIndex(el => el.x === x && el.y === y);

    if (state.tool === 'delete') {
        // DELETE TOOL LOGIC
        if (existingIndex > -1) {
            const item = state.grid[existingIndex];

            if (item.protected) {
                openProtectedPopup();
                return;
            }

            deleteItem(existingIndex);
        }

    } else if (state.tool) {
        // BUILD TOOL LOGIC
        if (existingIndex > -1) {
            // Occupied? Open upgrade menu instead of alerting!
            openUpgradeModal(state.grid[existingIndex].id);
            state.tool = null; // Deselect tool to prevent confusion
            dom.map.classList.remove('build-mode');
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        } else {
            // Place new item
            const item = ELEMENTS[state.tool];
            if (state.credits >= item.cost) {
                state.credits -= item.cost;
                placeItem(state.tool, x, y);
                updateUI();
            } else {
                openFundsModal();

            }
        }
    } else {
        // NO TOOL - Just clicking the map
        if (existingIndex > -1) {
            // Clicked the square of an item
            openUpgradeModal(state.grid[existingIndex].id);
        }
    }
});

function deleteItem(index) {
    const el = state.grid[index];
    state.credits += Math.floor(ELEMENTS[el.key].cost * 0.5);
    state.grid.splice(index, 1);
    const div = document.getElementById(el.id);
    if(div) div.remove();
    updateUI();
}

function placeItem(key, x, y, protected = false) {
    const id = 'el_' + Date.now() + Math.random().toString(16).slice(2);
    const def = ELEMENTS[key];

    // ALWAYS safe because protected has a default value
    state.grid.push({ id, key, x, y, mods: [], protected });

    const div = document.createElement('div');
    div.className = 'placed-element';
    div.id = id;

    div.style.left = x + 'px';
    div.style.top = y + 'px';
    div.innerHTML = def.icon;

    div.setAttribute(
        "data-cat",
        def.type === 'gen' ? "Generation" :
            def.type === 'load' ? "Consumption" :
                def.type === 'store' ? "Storage" :
                    "Utility"


    );

    div.onclick = (e) => {
        e.stopPropagation();

        const item = state.grid.find(el => el.id === id);

        if (state.tool === 'delete') {
            if (item.protected) {
                openProtectedPopup();
                return;
            }
            deleteItem(state.grid.findIndex(el => el.id === id));
        } else {
            openUpgradeModal(id);
        }
    };

    dom.layer.appendChild(div);
}


// --- CALCS & UI ---
function getMetrics()
{
    let totalGen = 0, totalLoad = 0, upkeep = 0;
    const season = SEASONS[Math.floor(state.month/3)%4];

    state.grid.forEach(el => {
        const def = ELEMENTS[el.key];
        upkeep += 20;

        let val = def.base;
        
        if (UPGRADES[el.key]) {
            el.mods.forEach(modId => {
                const u = UPGRADES[el.key].find(x => x.id === modId);
                if(u) val *= u.mod;
            });
        }

        if (def.type === 'gen') {

            // Weather modifier (Clear / Windy / Cloudy / Rainy)
            const weather = state.weather || { solar: 1, wind: 1, hydro: 1 };

            // Apply seasonal + weather multipliers
            if (el.key === 'photovoltaic') {
                val *= season.solar * weather.solar;
            }
            if (el.key === 'wind') {
                val *= season.wind * weather.wind;
            }
            if (el.key === 'hydro') {
                val *= weather.hydro;
            }
            if (el.key === 'thermo')
            {
                // Thermo solar reacts differently — heat > light
                val *= (weather.solar * 0.8) + 0.2;  // stable output but slightly affected by weather
            }

            if (el.key === 'geothermal') {
                val *= 1.0;  // always stable
            }

            if (el.key === 'hydrodam') {
                val *= 1.0 + ((weather.hydro - 1.0) * 0.5);
                // Example: Rainy hydro (1.25) = +12% instead of +25%
            }





                totalGen += val;
        }


        else if (def.type === 'load') {
            if (season.name === 'Summer') val *= 1.15;
            if (season.name === 'Winter') val *= 1.10;
            totalLoad += val;
        }
    });

    return { totalGen, totalLoad, upkeep };
}

function updateUI() {
    const m = getMetrics();
    
    dom.credits.innerText = `$${Math.floor(state.credits)}`;
    dom.score.innerText = state.score;
    dom.date.innerText = `Month ${state.month + 1}`;

    const seasonIdx = Math.floor(state.month/3)%4;
    document.getElementById('season-name').innerText = SEASONS[seasonIdx].name;
    document.getElementById('weather-icon').innerText = state.weather.icon;

    const max = Math.max(m.totalLoad, m.totalGen, 100) * 1.2;
    dom.loadBar.style.width = (m.totalLoad / max * 50) + '%';
    dom.genBar.style.width = (m.totalGen / max * 50) + '%';

    const bal = m.totalGen - m.totalLoad;
    if (m.totalLoad === 0) {
        dom.balanceText.innerText = "IDLE";
        dom.balanceText.style.color = "#fff";
    } else if (bal >= 0) {
        dom.balanceText.innerText = `+${Math.floor(bal)} kW`;
        dom.balanceText.style.color = "#00e676";
    } else {
        dom.balanceText.innerText = `${Math.floor(bal)} kW`;
        dom.balanceText.style.color = "#ff5252";
    }
}

// --- UPGRADES ---
function openUpgradeModal(id) {
    const el = state.grid.find(e => e.id === id);
    if(!el) return;

    const def = ELEMENTS[el.key];
    const upgrades = UPGRADES[el.key];

    const modal = document.getElementById('upgradeModal');
    document.getElementById('u-title').innerText = def.name.toUpperCase();
    
    let desc = "";
    if(def.type === 'load') desc = `Current Load: ${def.base} kW`;
    else if(def.type === 'gen') desc = `Base Output: ${def.base} kW`;
    else desc = "Utility System";
    
    document.getElementById('u-desc').innerText = desc;
    document.getElementById('selectedElementId').value = id;

    const list = document.getElementById('upgrade-list');
    list.innerHTML = '';

    if (!upgrades || upgrades.length === 0) {
        list.innerHTML = "<p style='color:#777; padding:10px;'>No upgrades available for this unit.</p>";
    } else {
        upgrades.forEach(u => {
            const isOwned = el.mods.includes(u.id);
            const div = document.createElement('div');
            div.className = 'upgrade-item';
            div.innerHTML = `
                <div style="text-align:left;">
                    <span style="font-weight:bold; display:block; font-size:0.9rem;">${u.name}</span>
                    <small style="color:#888;">${u.desc}</small>
                </div>
                <button class="upgrade-btn" ${isOwned || state.credits < u.cost ? 'disabled' : ''} 
                    onclick="buyUpgrade('${id}', '${u.id}', ${u.cost})">
                    ${isOwned ? 'OWNED' : '$'+u.cost}
                </button>
            `;
            list.appendChild(div);
        });
    }

    modal.classList.add('active');
}

window.buyUpgrade = (elId, upgId, cost) => {
    state.credits -= cost;
    const el = state.grid.find(e => e.id === elId);
    el.mods.push(upgId);
    openUpgradeModal(elId);
    updateUI();
};

function closeUpgradeModal() {
    document.getElementById('upgradeModal').classList.remove('active');
}

// --- TURN END ---
function nextMonth() {

    // Pick random weather for the new month
    state.weather = generateRandomWeather();

    showWeatherPopup(state.weather);




    const m = getMetrics();
    const bal = m.totalGen - m.totalLoad;
    
    let income = 0;
    let rating = 100;

    if (bal >= 0) {
        income = 800 + (bal * 1.5);
    } else {
        income = 200;
        rating = Math.max(0, 100 - (Math.abs(bal)/m.totalLoad * 100));
    }

    const net = Math.floor(income - m.upkeep);
    state.credits += net;
    state.score += Math.floor(rating/10);

    document.getElementById('r-rating').innerText = Math.floor(rating) + "%";
    document.getElementById('r-income').innerText = "+$" + Math.floor(income);
    document.getElementById('r-cost').innerText = "-$" + Math.floor(m.upkeep);
    document.getElementById('r-net').innerText = (net>=0?"+":"") + "$" + net;
    document.getElementById('r-net').style.color = net>=0 ? "#00e676" : "#ff5252";
    
    document.getElementById('report-modal').classList.add('active');
}

function closeReport() {
    document.getElementById('report-modal').classList.remove('active');
    state.month++;
    if(state.month >= MAX_MONTHS) {
        openGameOverModal(state.score);
        return;
    }
    updateUI()
    {
        // Display weather condition
        if (!state.weather) state.weather = generateRandomWeather();

        document.getElementById("weather-icon").innerText = state.weather.icon;
        document.getElementById("weather-desc").innerText = state.weather.name;

    }
}

// =====================
// HELP MODAL LOGIC
// =====================
const helpBtn = document.getElementById("helpButton");
const helpModal = document.getElementById("helpModal");
const closeHelp = document.getElementById("closeHelp");

helpBtn.addEventListener("click", () => {
    helpModal.classList.remove("hidden");
});

closeHelp.addEventListener("click", () => {
    helpModal.classList.add("hidden");
});

helpModal.addEventListener("click", (e) => {
    if (e.target === helpModal) {
        helpModal.classList.add("hidden");
    }
});

function openFundsModal() {
    document.getElementById('funds-modal').classList.add('active');
}



function closeFundsModal() {
    document.getElementById('funds-modal').classList.remove('active');
}

function openGameOverModal(finalScore) {
    const metrics = getMetrics(); // reuse existing power calculations

    const gen = Math.floor(metrics.totalGen);
    const load = Math.floor(metrics.totalLoad);
    const net = gen - load;

    document.getElementById('gameover-score').innerText = finalScore;
    document.getElementById('gameover-credits').innerText = `$${Math.floor(state.credits)}`;
    document.getElementById('gameover-gen').innerText = gen;
    document.getElementById('gameover-load').innerText = load;

    const netSpan = document.getElementById('gameover-net');
    netSpan.innerText = net;

    netSpan.style.color = (net >= 0 ? "var(--success)" : "var(--danger)");

    document.getElementById('gameover-modal').classList.add('active');
}



function restartGame()
{
    location.reload();
}

function openSolarChoice() {
    document.getElementById('solar-select-modal').classList.add('active');
}

function closeSolarChoice() {
    document.getElementById('solar-select-modal').classList.remove('active');
}

function selectSolarType(type) {
    state.tool = type;              // 'photovoltaic' or 'thermo'
    closeSolarChoice();             // hide modal
    dom.map.classList.add('build-mode');

    const item = ELEMENTS[type];
    dom.toolTip.innerText = `BUILD ${item.name.toUpperCase()} ($${item.cost})`;

    // highlight correct button
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
}

const WEATHER_DESCRIPTIONS = {
    "Clear Skies": "Normal solar & wind output.",
    "Windy": "Wind turbines boosted. Solar slightly reduced.",
    "Cloudy": "Solar weakened significantly. Hydro slightly boosted.",
    "Rainy": "Solar very weak. Wind boosted. Hydro strongly boosted."
};


function generateRandomWeather()
{
    return WEATHER_TYPES[Math.floor(Math.random() * WEATHER_TYPES.length)];
}

function showWeatherPopup(weather) {
    const popup = document.getElementById("weather-popup");
    const icon = document.getElementById("weather-popup-icon");
    const text = document.getElementById("weather-popup-text");

    icon.innerText = weather.icon;
    text.innerText = WEATHER_DESCRIPTIONS[weather.name] || "";

    popup.classList.remove("hidden");

    // Trigger slide-up animation
    setTimeout(() => popup.classList.add("show"), 10);

    // Auto-hide after 4 seconds
    setTimeout(() => {
        popup.classList.remove("show");
        setTimeout(() => popup.classList.add("hidden"), 400);
    }, 4000);
}

document.getElementById("intro-start-btn").addEventListener("click", () => {
    const intro = document.getElementById("intro-menu");
    intro.classList.remove("active");
    intro.style.display = "none";
});

// =============================
// INTRO MENU LOGIC (Scroll to Reveal Button)
// =============================

// Get scrollable area
const introScroll = document.querySelector(".intro-scroll");

// Get the button wrapper (we recommend adding the ID, but class also works)
const introButtonContainer = document.querySelector(".intro-button-container");

// When user scrolls inside the intro/tutorial panel
introScroll.addEventListener("scroll", () => {

    // How far user has scrolled (top position + visible height)
    const scrollPos = introScroll.scrollTop + introScroll.clientHeight;

    // The full scrollable height (max scroll)
    const scrollEnd = introScroll.scrollHeight - 1;

    // If user reached the bottom → reveal button
    if (scrollPos >= scrollEnd) {
        introButtonContainer.classList.add("show");
    } else {
        introButtonContainer.classList.remove("show");
    }
});

// CLOSE INTRO WHEN BUTTON IS CLICKED
document.getElementById("intro-start-btn").addEventListener("click", () => {
    const intro = document.getElementById("intro-menu");
    intro.classList.remove("active");
    intro.style.display = "none";
});

function openProtectedPopup() {
    document.getElementById('protected-modal').classList.remove('hidden');
}

function closeProtectedPopup() {
    document.getElementById('protected-modal').classList.add('hidden');
}







window.addEventListener("load", resizeGridToFit);
window.addEventListener("resize", resizeGridToFit);






