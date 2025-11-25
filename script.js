 // --- CORE GAME DATA ---
        let credits = 4000; 
        let score = 0; 
        let month = 0; 
        const maxMonths = 12; 
        let elements = {};
        let nextId = 0;
        let currentSeasonIndex = 0; 
        let currentScenario = null; 
        let activeEvent = null; 
        
        const HOUSE_ID = 'el_building0'; 
        const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const SEASONS = ['Winter', 'Spring', 'Summer', 'Autumn']; 

        // --- STRATEGY SYSTEM DATA ---
        const CATEGORY_WEIGHTS = {
            Consumption: 0.4, 
            Generation: 0.3, 
            Storage: 0.3,     
        };

        const EVENTS = [
            { name: "Heatwave", icon: "🔥", categories: ['building', 'critical'], modifier: 1.25, description: "AC use spikes, +25% Load on Buildings/Critical." },
            { name: "Strong Winds", icon: "💨", categories: ['wind'], modifier: 1.5, description: "High wind generation, +50% Wind output." },
            { name: "Cloudy Skies", icon: "☁️", categories: ['photovoltaic'], modifier: 0.25, description: "Low solar input, -75% Photovoltaic output." },
            { name: "Heavy Rain", icon: "🌧️", categories: ['hydro'], modifier: 1.5, description: "High water levels, +50% Hydro output." },
            { name: "Grid Instability", icon: "🚨", categories: ['all'], modifier: 0.5, description: "System failure, reduces all efficiency gains by 50% this month." },
        ];

        // Load Types and their Unique Upgrades
        const UPGRADE_DATA = {
            building: [{ name: "LED Lights", icon: "lightbulb", cost: 30, save: 0.10 }, { name: "Smart Thermostat", icon: "thermostat", cost: 150, save: 0.40 }],
            warehouse: [{ name: "Smart Lighting", icon: "emoji_objects", cost: 60, save: 0.15 }, { name: "Roof Insulation", icon: "layers", cost: 120, save: 0.30 }],
            charging: [{ name: "Off-Peak Meter", icon: "timer", cost: 50, save: 0.10 }, { name: "Smart Scheduling", icon: "schedule", cost: 100, save: 0.20 }],
            farmsystems: [{ name: "Efficient Pumps", icon: "water", cost: 80, save: 0.20 }, { name: "Smart Irrigation", icon: "local_florist", cost: 180, save: 0.35 }],
            heavy: [{ name: "Process Optimization", icon: "precision_manufacturing", cost: 250, save: 0.35 }],
            critical: [{ name: "Energy Audit", icon: "analytics", cost: 70, save: 0.15 }, { name: "High-Efficiency HVAC", icon: "air", cost: 300, save: 0.45 }],
            batteries: [{ name: "Smart BSM Upgrade", icon: "swap_vert", cost: 100, save: 0.25 }]
        };

        // Base Loads & Complexity
        const BASE_LOADS = {
            building: { day: 25, night: 40, complexity: 5, category: 'Consumption' },
            warehouse: { day: 50, night: 30, complexity: 10, category: 'Consumption' },
            charging: { day: 10, night: 60, complexity: 10, category: 'Consumption' },
            farmsystems: { day: 30, night: 15, complexity: 5, category: 'Consumption' },
            heavy: { day: 80, night: 70, complexity: 15, category: 'Consumption' },
            critical: { day: 60, night: 50, complexity: 10, category: 'Consumption' },
            
            photovoltaic: { day: 50, night: 0, complexity: 0, category: 'Generation' },
            wind: { day: 40, night: 40, complexity: 0, category: 'Generation' },
            hydro: { day: 60, night: 60, complexity: 0, category: 'Generation' },
            
            batteries: { day: 0, night: 0, complexity: 0, category: 'Storage' },
            closecycle: { day: 0, night: 0, complexity: 0, category: 'Storage' },
            meter: { day: 0, night: 0, complexity: 0, category: 'Storage' }
        };

        // Season multipliers
        const MONTH_MULT = {
            photovoltaic: [0.3, 0.4, 0.6, 0.8, 1.2, 1.5, 1.8, 1.5, 1.0, 0.7, 0.5, 0.3], 
            wind: [1.8, 1.5, 1.2, 1.0, 0.8, 0.5, 0.4, 0.6, 1.0, 1.3, 1.6, 1.9], 
            hydro: [1.3, 1.4, 1.5, 1.2, 1.0, 0.9, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3] 
        };

        // Element Icons & Names 
        const ELEMENT_ICONS = {
            photovoltaic: { icon: '☀️', name: 'Photovoltaic' },
            wind: { icon: '🌬️', name: 'Wind Power' },
            hydro: { icon: '🌊', name: 'Hydro Power' },
            powerlines: { icon: '⚡', name: 'Power Lines' },
            meter: { icon: '📟', name: 'Meter' },
            closecycle: { icon: '💧', name: 'Close Cycle' },
            
            building: { icon: '🏠', name: 'Building' },
            warehouse: { icon: '🏭', name: 'Warehouse' },
            charging: { icon: '🔌', name: 'Charging' },
            farmsystems: { icon: '🚜', name: 'Farm Systems' },
            heavy: { icon: '🏗️', name: 'Heavy-Duty' },
            critical: { icon: '🏥', name: 'Critical' },
            
            batteries: { icon: '🔋', name: 'Batteries' }
        };

        // --- CORE GAME LOGIC ---
        let map = document.getElementById('system-map');
        
        // --- SCENARIO & GAME FLOW ---
        function showScenarioSelection() {
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('scenario-selection').classList.remove('hidden');
        }

        function startGame(scenario) {
            currentScenario = scenario;
            document.getElementById('scenario-selection').classList.add('hidden');
            
            currentSeasonIndex = Math.floor(month / 3) % 4; 
            
            // Initial element placement based on scenario
            if (scenario === 'urban') {
                buildElement('building', 30, 30, 40);
                buildElement('warehouse', 150, 350, 50); 
                buildElement('critical', 600, 50, 60); 
                buildElement('photovoltaic', 400, 600, 30); 
                buildElement('batteries', 700, 400, 50); 
                buildElement('charging', 50, 550, 15);
                buildElement('meter', 750, 750, 20); 

            } else if (scenario === 'rural') {
                buildElement('building', 30, 30, 30);
                buildElement('farmsystems', 50, 500, 40);
                buildElement('heavy', 400, 300, 70); 
                buildElement('wind', 700, 30, 60);
                buildElement('hydro', 750, 550, 50); 
                buildElement('closecycle', 150, 300, 30);
                buildElement('meter', 650, 750, 20);
            }

            sparkySay("Welcome, Engineer! Click on the elements (like 🏠) to buy upgrades. When ready, click 'NEXT MONTH' to advance.", 'robot');
            updateUI();
        }

        function buildElement(type, x, y, size) {
            const id = 'el_' + type + nextId++; 
            const el = document.createElement('div');
            el.className = 'placed-element';
            el.id = id;
            el.style.left = x + 'px'; el.style.top = y + 'px';
            
            const elementData = ELEMENT_ICONS[type];
            el.innerHTML = `<div class="icon" style="font-size: 2.5em; line-height: 1;">${elementData.icon}</div><small>${elementData.name.toUpperCase()}</small>`;
            map.appendChild(el);
            
            const baseData = BASE_LOADS[type] || { efficiency: 1.0, complexity: 0, category: 'Utility' };

            elements[id] = { 
                type: type, 
                efficiency: 1.0, 
                size: size, 
                x: x, 
                y: y, 
                upgrades: [],
                complexity: baseData.complexity,
                category: baseData.category
            };
            
            // Set the click handler immediately and permanently
            if(UPGRADE_DATA[type]) {
                el.onclick = () => openUpgrade(id); 
            }
        }
        
        // --- UPGRADE MODAL LOGIC (Tutorial removed) ---
        function openUpgrade(id) {
            const el = elements[id];
            document.getElementById('selectedElementId').value = id;
            document.getElementById('modal-title').innerText = `Upgrade ${ELEMENT_ICONS[el.type].name.toUpperCase()}`;
            document.getElementById('modal-subtitle').innerText = `Current Load: ${Math.round(el.efficiency * 100)}% of Max`;

            const upgradeContainer = document.getElementById('upgrade-buttons');
            upgradeContainer.innerHTML = '';
            
            UPGRADE_DATA[el.type].forEach(up => {
                const isPurchased = el.upgrades.includes(up.name);
                const button = document.createElement('button');
                
                button.className = `upgrade-btn ${isPurchased ? 'disabled' : ''}`;
                button.style.cssText = `display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 10px; margin-top: 8px; border-radius: 8px; background: ${isPurchased ? '#e0e0e0' : '#c8e6c9'}; border: 2px solid ${isPurchased ? '#9e9e9e' : '#66bb6a'}; cursor: pointer; font-weight: bold; font-family:'Poppins', sans-serif; font-size: 0.9em;`;
                button.innerHTML = `<span class="material-icons" style="color:#00695c; font-size: 1.2em;">${up.icon}</span> <div><strong>${up.name}</strong><br><small>Saves ${Math.round(up.save * 100)}% Load</small></div><span class="upgrade-price">${isPurchased ? 'INSTALLED' : '$' + up.cost}</span>`;
                
                button.onclick = isPurchased ? null : () => applyUpgrade(id, up);
                
                upgradeContainer.appendChild(button);
            });
            document.getElementById('upgradeModal').style.display = 'flex';
        }

        function applyUpgrade(id, upgrade) {
            if (credits >= upgrade.cost) {
                credits -= upgrade.cost;
                elements[id].efficiency *= (1 - upgrade.save);
                elements[id].upgrades.push(upgrade.name);
                
                const elDiv = document.getElementById(id);
                if(!elDiv.querySelector('.eco-badge')) { elDiv.innerHTML += `<div class="eco-badge" style="position: absolute; top: -10px; right: -10px; background: #00e676; border-radius: 50%; width: 30px; height: 30px; display: flex; justify-content: center; align-items: center; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-size: 1.2em; transform: rotate(-10deg);">🍃</div>`; }
                
                document.getElementById('upgradeModal').style.display = 'none';
                const targetEl = document.getElementById(id);
                const targetRect = targetEl.getBoundingClientRect();

                playSound('good');
                showFloater(targetRect.left + targetRect.width/2, targetRect.top + targetRect.height/2, "-$"+upgrade.cost, "red");
                sparkySay(`Awesome! ${upgrade.name} installed! Power saved!`, "happy");
                
                updateUI();

            } else {
                playSound('bad');
                sparkySay(`Need $${upgrade.cost} more credits for that!`, "sad");
            }
        }
        
        function closeUpgradeModal() {
            document.getElementById('upgradeModal').style.display = 'none';
        }
        // --- END UPGRADE MODAL LOGIC ---

        // --- GUIDE MODAL FUNCTIONS (Simplified) ---
        function openGuideModal() {
            // No interaction with next-month-btn's disabled state or pointer-events needed.
            const contentDiv = document.getElementById('guide-modal-content');
            contentDiv.innerHTML = `
                <h2>📚 Game Guide & Energy Saving Tips</h2>
                <p>Welcome to the **BIP Eco Grid Challenge**! Your goal is to keep your community financially **Stable** while earning a high **Complexity Score** by implementing efficient and complex sustainable solutions.</p>

                <h4>1. Consumers (The Load) 💡</h4>
                <p>These elements consume power and cost you money, especially when they have high peak or night consumption (e.g., Charging, Heavy-Duty). Every consumer element has **Upgrades** available (click the element) to reduce its power draw.</p>
                <ul>
                    <li>**How to Save Energy:** Buy the available upgrades (like **Smart Thermostats** or **LED Lights**). This lowers your running costs and increases your **Complexity Score** (Reward for saving power!).</li>
                    <li>**Complex Consumers:** The **Heavy-Duty** element offers high rewards because it represents major industrial peak loads, requiring complex solutions to offset.</li>
                </ul>

                <h4>2. Generation (The Supply) ⚡</h4>
                <p>These elements produce power and earn you money, but their output depends on the **Season** and **Time of Day**.</p>
                <ul>
                    <li>**Photovoltaic (☀️):** Output is variable and seasonal.</li>
                    <li>**Wind Power (🌬️):** Output is variable and seasonal.</li>
                    <li>**Hydro Power (🌊):** Generally stable, but can be boosted with the **Close Cycle** system.</li>
                    <li>**Grid Instability:** **Events** can drastically reduce or increase generation/consumption.</li>
                </ul>

                <h4>3. Storage & Utility (Complexity Boost) ⭐</h4>
                <p>These elements don't generate revenue but are essential for stability and greatly increase your **Complexity Score**.</p>
                <ul>
                    <li>**Batteries (🔋):** Pairing with Photovoltaic earns a significant score boost.</li>
                    <li>**Close Cycle (💧):** Pairing with Hydro earns the highest complexity bonus.</li>
                    <li>**Meter (📟):** Required for full grid integration.</li>
                </ul>
                <button onclick="closeGuideModal()" style="margin-top:20px; width:100%; padding:15px; border-radius:10px; background:#2196f3; color:white; border:none; cursor:pointer; font-weight:bold; font-family:'Fredoka', cursive; font-size: 1.1em;">Close Guide</button>
            `;
            document.getElementById('guideModal').classList.add('active');
        }
        
        function closeGuideModal() {
            document.getElementById('guideModal').classList.remove('active');
        }
        // --- END GUIDE MODAL FUNCTIONS ---

        // --- NEW EVENT SYSTEM ---
        function checkForEvent() {
            // 15% chance of an event happening each month
            if (Math.random() < 0.15) {
                activeEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];
                sparkySay(`${activeEvent.icon} EVENT: ${activeEvent.name}! ${activeEvent.description}`, 'sad');
            } else {
                activeEvent = null;
            }
        }
        
        // --- NEW SCORING & GAME LOOP ---
        function calculateCategoryScore() {
            let totalLoad = 0;
            let efficientLoad = 0;
            let generationPotential = 0;
            let storageCapacity = 0;
            let totalComplexityGained = 0;
            
            const hasBatteries = Object.values(elements).some(e => e.type === 'batteries');
            const hasCloseCycle = Object.values(elements).some(e => e.type === 'closecycle');
            const currentMonthMult = MONTH_MULT; 
            
            Object.values(elements).forEach(e => {
                const eType = e.type;

                // 1. Consumption Score Calculation
                if (e.category === 'Consumption') {
                    totalLoad += e.size * ((BASE_LOADS[eType].day + BASE_LOADS[eType].night) / 2);
                    efficientLoad += e.size * ((BASE_LOADS[eType].day + BASE_LOADS[eType].night) / 2) * e.efficiency;
                    
                    // Complexity from upgrades (permanent score)
                    totalComplexityGained += e.complexity * (1.0 - e.efficiency); 

                    // Apply event modifier if applicable
                    if (activeEvent && activeEvent.categories.includes(eType) || activeEvent && activeEvent.categories.includes('all')) {
                         efficientLoad *= activeEvent.modifier;
                    }
                }
                
                // 2. Generation Score Calculation
                if (e.category === 'Generation') {
                    const mult = currentMonthMult[eType] ? currentMonthMult[eType][month] : 1.0;
                    
                    let genValue = e.size * mult * 50; 
                    
                    // Apply event modifier if applicable
                    if (activeEvent && activeEvent.categories.includes(eType) || activeEvent && activeEvent.categories.includes('all')) {
                        genValue *= activeEvent.modifier; 
                    }
                    
                    generationPotential += genValue;

                    // Complexity bonuses for generation
                    if (eType === 'photovoltaic' && hasBatteries) totalComplexityGained += 15;
                    if (eType === 'hydro' && hasCloseCycle) totalComplexityGained += 20; 
                }

                // 3. Storage Score Calculation
                if (e.category === 'Storage') {
                    if (eType === 'batteries' || eType === 'closecycle') {
                        storageCapacity += e.size * 2 + (1.0 - e.efficiency) * 50; 
                    }
                }
            });
            
            // Normalize Consumption: (1 - (Current_Load / Max_Load)) * 100
            const consumptionEfficiency = (totalLoad - efficientLoad) / (totalLoad || 1); 
            const consumptionScore = consumptionEfficiency * 100;
            
            // Normalize Generation: 
            const generationRatio = generationPotential / (efficientLoad || 1);
            const generationScore = Math.min(100, generationRatio * 70 + 30);
            
            // Normalize Storage: 
            const maxStorageTarget = 400; 
            const storageScore = Math.min(100, (storageCapacity / maxStorageTarget) * 100);

            // Apply Weights
            const finalWeightedScore = Math.round(
                consumptionScore * CATEGORY_WEIGHTS.Consumption +
                generationScore * CATEGORY_WEIGHTS.Generation +
                storageScore * CATEGORY_WEIGHTS.Storage
            );

            // Update permanent complexity score
            score += Math.floor(totalComplexityGained); 

            return finalWeightedScore;
        }

        function nextMonth() {
            // Next Month button is now always clickable as the tutorial is removed.

            // --- 1. Advance Time ---
            month++;
            if (month >= maxMonths) {
                document.getElementById('final-score').innerText = score;
                document.getElementById('win-screen').classList.remove('hidden');
                return;
            }
            currentSeasonIndex = Math.floor(month / 3) % 4; 

            // --- 2. Check for Event ---
            checkForEvent();

            // --- 3. Calculate Monthly Score ---
            const finalRating = calculateCategoryScore();
            document.getElementById('final-score-rating').innerText = finalRating;
            
            const gameMain = document.getElementById('game-main');
            gameMain.classList.remove('map-success', 'map-danger');
            
            // --- 4. Determine Credits ---
            let creditsChange = 0;
            
            if (finalRating >= 80) {
                creditsChange = finalRating * 15;
                sparkySay(`EXCELLENT RATING (${finalRating})! Earned +$${creditsChange} credits!`, "happy");
                gameMain.classList.add('map-success');
            } else if (finalRating >= 50) {
                creditsChange = finalRating * 5;
                sparkySay(`GOOD RATING (${finalRating}). Earned +$${creditsChange} credits. Can improve!`, "happy");
                gameMain.classList.add('map-success');
            } else if (finalRating >= 30) {
                creditsChange = finalRating * 1;
                credits -= 150; 
                creditsChange -= 150;
                sparkySay(`POOR RATING (${finalRating}). We lost $150 credits. Time to upgrade!`, "sad");
            } else {
                creditsChange = finalRating * 0;
                credits -= 400; 
                creditsChange -= 400;
                sparkySay(`CRITICAL FAILURE (${finalRating})! We lost $400 credits. Rebalance the grid NOW!`, "sad");
                gameMain.classList.add('map-danger');
            }
            
            credits += creditsChange;
            showFloater(gameMain.offsetWidth/2, gameMain.offsetHeight/2, creditsChange >= 0 ? `+$${creditsChange}` : `-$${Math.abs(creditsChange)}`, creditsChange >= 0 ? "green" : "red");


            if(credits <= 0) { 
                document.getElementById('lose-screen').innerHTML = `<div class="title" style="color:#ff5252; animation: none;">OH NO! POWER OUT!</div>
                    <div class="subtitle">We ran out of credits! The grid failed. Final Score: ${score}</div>
                    <button class="big-btn" onclick="location.reload()">RESTART</button>`;
                document.getElementById('lose-screen').classList.remove('hidden'); 
                return;
            }
            
            updateUI();
        }

        // --- UI & HELPER FUNCTIONS ---
        function updateUI() {
            document.getElementById('credits-display').innerText = "$" + credits;
            document.getElementById('score-display').innerText = score;
            const creditsDisplay = document.getElementById('credits-display');
            creditsDisplay.classList.toggle('danger', credits <= 1000); 

            document.getElementById('month-label').innerText = `Month ${month + 1} / ${maxMonths}`;
            
            const pct = ((month + 1) / maxMonths) * 100;
            document.getElementById('month-fill').style.width = pct + "%";
            
            const currentSeason = SEASONS[currentSeasonIndex];
            const currentMonthName = MONTHS[month];
            
            const icon = (currentSeason === 'Spring') ? '🌸' : (currentSeason === 'Summer') ? '☀️' : (currentSeason === 'Autumn') ? '🍂' : '❄️';
            const iconDiv = document.getElementById('season-icon');
            iconDiv.innerText = icon;
            document.getElementById('season-label').innerText = `${currentMonthName} (${currentSeason})`;

            const eventDisplay = document.getElementById('event-display');
            if (activeEvent) {
                eventDisplay.style.display = 'block';
                eventDisplay.innerHTML = `${activeEvent.icon} **Event:** ${activeEvent.name} (${activeEvent.modifier > 1 ? '+' : '-'}${Math.abs(activeEvent.modifier - 1) * 100}%)`;
            } else {
                eventDisplay.style.display = 'none';
            }
        }

        function sparkySay(text, emotion) {
            const mascotFace = document.getElementById('mascot-face');
            mascotFace.innerText = emotion==='happy' ? '😁' : (emotion==='sad'?'😵':'🤖');
            document.getElementById('mascot-msg').innerText = text;
        }

        function playSound(type) {
             const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const audioCtx = new AudioContext();
            if (audioCtx.state === 'suspended') audioCtx.resume();
            
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain); gain.connect(audioCtx.destination);
            if(type==='good') osc.frequency.value=600; else osc.frequency.value=150;
            osc.start(); gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime+0.3);
            osc.stop(audioCtx.currentTime+0.3);
        }
        
        function showFloater(x, y, text, color) {
            const f = document.createElement('div');
            f.className = 'floater'; 
            
            f.style.left = (x) + 'px'; 
            f.style.top = (y) + 'px'; 
            
            f.style.color=color;
            f.innerText=text; 
            
            f.style.position = 'absolute';
            f.style.fontSize = '1.5em'; 
            f.style.fontWeight = 'bold';
            f.style.textShadow = '1px 1px #000';
            f.style.zIndex = 505;
            f.style.animation = 'fade-up 1.5s forwards';

            document.getElementById('game-main').appendChild(f); 
            setTimeout(()=>f.remove(), 1500);
        }

        updateUI();