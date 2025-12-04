import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ELEMENTS, EVENTS, GRID_SIZE_RURAL, GRID_SIZE_URBAN, RURAL_TRANSMISSION_DISTANCE_THRESHOLD, WIRE_COST_PER_UNIT, SEASONS, WEATHER_TYPES, UPGRADES, QUIZ_QUESTIONS, DEFAULT_LEADERBOARD, PRODUCTION_MATRIX } from './constants';
import { GameState, GridItem, ElementType, QuizQuestion, LeaderboardEntry, ElementDef } from './types';
import { Plus, Trash2, Info, AlertTriangle, Wind, Sun, DollarSign, Activity, Settings, CheckCircle, XCircle, Volume2, VolumeX, BookOpen, Star, HelpCircle, ArrowRight, Home, Cloud, CloudLightning, ThermometerSun, Fan, Flame, Droplets, Leaf, Radio, Zap, Trophy, Save, RotateCcw, Battery, BatteryCharging } from 'lucide-react';

// --- AUDIO SYSTEM (Web Audio API) ---
const useAudio = () => {
  const [enabled, setEnabled] = useState(true);
  const ctxRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playSound = (type: 'click' | 'build' | 'error' | 'cash' | 'success' | 'fail' | 'hover' | 'win') => {
    if (!enabled) return;
    initAudio();
    const ctx = ctxRef.current!;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case 'click':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      case 'hover':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, now);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.03);
        break;
      case 'build':
        osc.type = 'square';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(440, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      case 'error':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.15);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      case 'cash':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.setValueAtTime(1200, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      case 'success':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554, now + 0.1); // C#
        osc.frequency.setValueAtTime(659, now + 0.2); // E
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      case 'win':
        osc.type = 'square';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.2);
        osc.frequency.setValueAtTime(783.99, now + 0.4);
        osc.frequency.setValueAtTime(1046.50, now + 0.6);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 1.0);
        osc.start(now);
        osc.stop(now + 1.0);
        break;
      case 'fail':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.5);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        break;
    }
  };

  return { enabled, setEnabled, playSound };
};

// --- COMPONENT: HELP MODAL ---
const HelpModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
    <div className="bg-slate-900 border border-slate-600 rounded-xl p-6 max-w-lg w-full shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-tech text-yellow-400">Field Manual</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
      </div>
      <div className="space-y-4 text-gray-300 text-sm overflow-y-auto max-h-[60vh]">
        <section>
          <h3 className="text-white font-bold mb-1">Mission Goal</h3>
          <p>Maintain a stable energy grid for 12 months. Do not run out of credits!</p>
        </section>

        <section>
          <h3 className="text-white font-bold mb-2">Grid Legend</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2 bg-slate-800 rounded border border-green-500/30">
              <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]"></div>
              <span><strong className="text-green-400">Generator</strong> (Solar, Wind)</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-slate-800 rounded border border-red-500/30">
              <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_5px_#ef4444]"></div>
              <span><strong className="text-red-400">Consumer</strong> (Housing, Ind.)</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-slate-800 rounded border border-blue-500/30">
              <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_5px_#3b82f6]"></div>
              <span><strong className="text-blue-400">Storage</strong> (Batteries)</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-slate-800 rounded border border-yellow-500/30">
              <span className="text-yellow-400">📡</span>
              <span><strong className="text-yellow-400">Utility</strong> (Grid Ops)</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-slate-800 rounded border border-gray-600">
              <span className="text-sm">🔒</span>
              <span><strong className="text-gray-400">Locked</strong> (City Property)</span>
            </div>
          </div>
        </section>
        
        <section>
          <h3 className="text-white font-bold mb-1">Strategies</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Keep <span className="text-green-400">Generation</span> higher than <span className="text-red-400">Load</span>.</li>
            <li><strong>Batteries:</strong> These provide a constant reduction in Load, regardless of weather. Crucial for Blackout events!</li>
            <li><strong>Synergy Bonus:</strong> Build Solar + Wind together for +10% Efficiency.</li>
            <li><strong>Rural Transmission:</strong> Building far from the center costs extra for wiring.</li>
            <li><strong>Grid Ops Upgrades:</strong> Don't forget to upgrade the main dish for global bonuses!</li>
          </ul>
        </section>
      </div>
      <button onClick={onClose} className="mt-6 w-full bg-blue-600 hover:bg-blue-500 py-2 rounded font-bold transition-colors">CLOSE</button>
    </div>
  </div>
);

// --- COMPONENT: TUTORIAL OVERLAY ---
const TutorialOverlay = ({ step, onNext }: { step: number, onNext: () => void }) => {
  const content = [
    {
      title: "Welcome, Director!",
      text: "You have been hired to manage the energy grid. Your goal is to keep the lights on and the budget positive for 12 months.",
      pos: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    },
    {
      title: "The Power Grid",
      text: "The city consumes power (Red Buildings). You must generate it (Green Buildings). You cannot remove the city's infrastructure.",
      pos: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" 
    },
    {
      title: "Balancing Act",
      text: "Check the sidebar gauges. Keep the Green bar (Gen) higher than the Red bar (Load) to stay stable. If Load exceeds Gen, you lose money!",
      pos: "top-1/4 left-10"
    },
    {
      title: "Construction & Batteries",
      text: "Solar/Wind generate power. Batteries are CRITICAL: they store Energy and save you during Blackout events. Don't neglect them!",
      pos: "top-1/3 right-10"
    },
    {
      title: "Time is Money",
      text: "When you are ready, click 'Next Month' to collect income, pay upkeep, and face new weather challenges.",
      pos: "bottom-20 right-10"
    }
  ];

  const current = content[step - 1];
  if (!current) return null;

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none">
      <div className="absolute inset-0 bg-black/50" />
      <div className={`absolute ${current.pos} pointer-events-auto bg-slate-900 border-2 border-yellow-400 p-6 rounded-xl shadow-[0_0_50px_rgba(250,204,21,0.3)] max-w-sm animate-bounce-slight`}>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-yellow-400">{current.title}</h3>
          <span className="text-xs text-gray-900 bg-yellow-400 px-2 py-1 rounded font-bold">Step {step}/5</span>
        </div>
        <p className="text-gray-300 mb-6 leading-relaxed">{current.text}</p>
        <button 
          onClick={onNext}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded shadow transition-transform active:scale-95 flex items-center justify-center gap-2"
        >
          {step === 5 ? "START SIMULATION" : "NEXT"} <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

// --- COMPONENT: QUIZ MODAL ---
const QuizModal = ({ question, onAnswer, playSound }: { question: QuizQuestion, onAnswer: (correct: boolean) => void, playSound: any }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);
    const correct = selected === question.correctAnswer;
    if(correct) playSound('success');
    else playSound('error');
  };

  const handleContinue = () => {
    onAnswer(selected === question.correctAnswer);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
      <div className="bg-slate-800 border-2 border-purple-500/50 rounded-2xl max-w-lg w-full p-8 shadow-[0_0_50px_rgba(168,85,247,0.2)]">
        <h2 className="text-center text-purple-400 font-tech text-xl mb-6 tracking-widest">MONTHLY KNOWLEDGE CHECK</h2>
        
        <p className="text-white text-lg font-semibold mb-6">{question.question}</p>
        
        <div className="space-y-3 mb-6">
          {question.options.map((opt, idx) => {
            let btnClass = "w-full text-left p-4 rounded-lg border transition-all ";
            if (submitted) {
               if (idx === question.correctAnswer) btnClass += "bg-green-900/50 border-green-500 text-green-200";
               else if (idx === selected) btnClass += "bg-red-900/50 border-red-500 text-red-200";
               else btnClass += "bg-slate-700/50 border-transparent opacity-50";
            } else {
               if (idx === selected) btnClass += "bg-purple-600 border-purple-400 text-white";
               else btnClass += "bg-slate-700 hover:bg-slate-600 border-slate-600 text-gray-200";
            }

            return (
              <button 
                key={idx} 
                onClick={() => {
                  if(!submitted) {
                    setSelected(idx);
                    playSound('click');
                  }
                }}
                disabled={submitted}
                className={btnClass}
              >
                <div className="flex items-center justify-between">
                  <span>{opt}</span>
                  {submitted && idx === question.correctAnswer && <CheckCircle size={20} className="text-green-400" />}
                  {submitted && idx === selected && idx !== question.correctAnswer && <XCircle size={20} className="text-red-400" />}
                </div>
              </button>
            );
          })}
        </div>

        {!submitted ? (
          <button 
            onClick={handleSubmit} 
            disabled={selected === null}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg shadow-lg"
          >
            SUBMIT ANSWER
          </button>
        ) : (
          <button 
            onClick={handleContinue}
            className="w-full bg-slate-200 hover:bg-white text-slate-900 font-bold py-3 rounded-lg shadow-lg"
          >
            CONTINUE
          </button>
        )}
      </div>
    </div>
  );
};

// --- COMPONENT: UPGRADE MODAL ---
const UpgradeModal = ({ item, onClose, onUpgrade, onSell, credits, playSound }: { item: GridItem, onClose: () => void, onUpgrade: (upgradeId: string, cost: number) => void, onSell: (upgradeId: string, cost: number) => void, credits: number, playSound: any }) => {
  const def = ELEMENTS[item.type];
  const availableUpgrades = UPGRADES[item.type] || [];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-500 rounded-xl w-full max-w-sm overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <span className="text-2xl">{def.icon}</span>
             <div>
               <h3 className="font-bold text-white">{def.name}</h3>
               <p className="text-xs text-slate-400 uppercase">Level {1 + (item.upgrades?.length || 0)}</p>
             </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        
        <div className="p-4 space-y-4">
          {item.locked && <div className="bg-red-900/20 text-red-400 text-xs p-2 rounded border border-red-900/50">Property of the City. Cannot be demolished, but can be upgraded.</div>}
          
          <div className="space-y-2">
             <h4 className="text-xs font-bold text-slate-500 uppercase">Available Upgrades</h4>
             {availableUpgrades.length === 0 && <p className="text-sm text-gray-500 italic">No upgrades available for this unit.</p>}
             
             {availableUpgrades.map(u => {
               const isOwned = item.upgrades?.includes(u.id);
               const canAfford = credits >= u.cost;
               const refund = Math.floor(u.cost * 0.7);
               
               return (
                 <div key={u.id} className={`p-3 rounded border ${isOwned ? 'bg-green-900/10 border-green-800' : 'bg-slate-800 border-slate-700'} flex justify-between items-center`}>
                    <div>
                      <div className="font-bold text-sm text-gray-200">{u.name} {isOwned && <span className="text-green-500 text-[10px] ml-1">✓ OWNED</span>}</div>
                      <div className="text-xs text-gray-400">{u.description}</div>
                    </div>
                    {!isOwned ? (
                      <button 
                        onClick={() => {
                          if (canAfford) {
                            playSound('build');
                            onUpgrade(u.id, u.cost);
                          } else {
                            playSound('error');
                          }
                        }}
                        disabled={!canAfford}
                        className={`px-3 py-1 rounded text-xs font-bold ${canAfford ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed'} sz-fit min-w-[50px]`}
                      >
                        ${u.cost}
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                           onSell(u.id, u.cost);
                        }}
                        className="px-3 py-1 rounded text-xs font-bold bg-slate-700 hover:bg-orange-700 text-slate-300 hover:text-white border border-slate-600 hover:border-orange-500"
                        title="Sell Upgrade"
                      >
                        Sell (+${refund})
                      </button>
                    )}
                 </div>
               );
             })}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: MONTHLY REPORT ---
const MonthlyReport = ({ state, onContinue, playSound, showToast }: { state: GameState, onContinue: (choiceIndex?: number, outcome?: string) => void, playSound: any, showToast: (msg: string, type?: 'info' | 'success' | 'error') => void }) => {
  if (!state.lastMonthStats) return null;
  const { income, upkeep, rating, isOffGrid, storedEnergy, usedEnergy } = state.lastMonthStats;
  const net = income - upkeep;
  const event = state.pendingEvent;

  useEffect(() => {
    if (!event) playSound('cash');
    else playSound('error'); // Alert sound for event
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-slate-900 border-2 border-blue-500/50 rounded-2xl max-w-md w-full shadow-[0_0_50px_rgba(59,130,246,0.3)] overflow-hidden">
        <div className="bg-slate-800 p-4 border-b border-slate-700">
          <h2 className="text-xl font-tech text-center tracking-widest text-white">MONTH {state.month} REPORT</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-slate-800/50 p-3 rounded">
               <div className="text-xs text-gray-400">Grid Rating</div>
               <div className={`text-xl font-bold ${rating > 80 ? 'text-green-400' : 'text-red-400'}`}>{rating}%</div>
             </div>
             <div className="bg-slate-800/50 p-3 rounded">
               <div className="text-xs text-gray-400">Net Profit</div>
               <div className={`text-xl font-bold ${net >= 0 ? 'text-green-400' : 'text-red-400'}`}>{net >= 0 ? '+' : ''}${net}</div>
             </div>
          </div>
          
          {/* Energy Usage Stats */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-slate-800/50 p-3 rounded">
                <div className="text-xs text-gray-400">Battery Used</div>
                <div className="text-sm font-bold text-blue-400">{Math.round(usedEnergy || 0)} kWh</div>
             </div>
             <div className="bg-slate-800/50 p-3 rounded">
                <div className="text-xs text-gray-400">Stored</div>
                <div className="text-sm font-bold text-green-400">{Math.round(storedEnergy || 0)} kWh</div>
             </div>
          </div>
          
          {/* Grid Status Row */}
          <div className="bg-slate-800/50 p-3 rounded flex justify-between items-center">
             <div className="text-xs text-gray-400">Grid Mode</div>
             <div className={`text-sm font-bold ${isOffGrid ? 'text-green-400' : 'text-yellow-400'}`}>
                {isOffGrid ? 'OFF-GRID (Self-Sufficient)' : 'ON-GRID (Dependent)'}
             </div>
          </div>

          <div className="space-y-2 text-sm border-t border-slate-700 pt-4">
            <div className="flex justify-between"><span>Power Sales</span> <span className="text-green-400">+${income}</span></div>
            <div className="flex justify-between"><span>Maintenance</span> <span className="text-red-400">-${upkeep}</span></div>
            {state.quizResult && (
              <div className="flex justify-between font-bold">
                 <span>Quiz Bonus</span> 
                 <span className={state.quizResult.correct ? 'text-yellow-400' : 'text-gray-500'}>
                    {state.quizResult.correct ? `+$${state.quizResult.reward}` : '$0'}
                 </span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-700 pt-2 text-lg font-bold">
              <span>Ending Balance</span>
              <span className={state.credits + net + (state.quizResult?.reward || 0) < 0 ? "text-red-500" : "text-white"}>
                ${state.credits + net + (state.quizResult?.reward || 0)}
              </span>
            </div>
          </div>

          {event && (
            <div className="mt-6 bg-slate-800 border border-yellow-600/30 p-4 rounded-lg animate-pulse-slow">
              <h3 className="text-yellow-400 font-bold mb-1 flex items-center gap-2">
                 <AlertTriangle size={16} /> {event.title}
              </h3>
              <p className="text-gray-300 text-sm mb-4">{event.description}</p>
              <div className="space-y-2">
                {event.options.map((opt, idx) => (
                  <button 
                    key={idx}
                    onClick={() => {
                        const outcome = typeof opt.outcomeText === 'function' ? opt.outcomeText(state) : opt.outcomeText;
                        const isSuccess = outcome.includes("SAVED") || outcome.includes("SUCCESS") || outcome.includes("STABILIZED");
                        if(isSuccess) playSound('success'); else playSound('click');
                        
                        showToast(outcome, isSuccess ? 'success' : 'info'); 
                        onContinue(idx, outcome);
                    }}
                    className="w-full text-left px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors border-l-4 border-blue-500"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {!event && (
           <div className="p-4 bg-slate-800/50">
             <button onClick={() => { playSound('click'); onContinue(); }} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded shadow-lg transition-transform active:scale-95">
               CONTINUE
             </button>
           </div>
        )}
      </div>
    </div>
  );
};

// --- COMPONENT: GAME OVER / VICTORY ---
const EndGameScreen = ({ type, stats, onSaveScore, onRestart }: { type: 'gameover' | 'victory', stats: { score: number, credits: number, scenario: string }, onSaveScore: (name: string) => void, onRestart: () => void }) => {
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="text-center p-8 max-w-lg w-full animate-fade-in">
        {type === 'victory' ? (
          <>
            <div className="flex justify-center mb-6 text-yellow-400">
               <Star size={64} fill="currentColor" className="animate-pulse" />
            </div>
            <h1 className="text-5xl font-tech text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4">VICTORY</h1>
            <p className="text-xl text-gray-300 mb-8">You successfully managed the grid for a full year!</p>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-6 text-red-500">
               <Activity size={64} className="animate-pulse" />
            </div>
            <h1 className="text-5xl font-tech text-red-600 mb-4">BANKRUPTCY</h1>
            <p className="text-xl text-gray-300 mb-8">The grid has collapsed due to lack of funding.</p>
          </>
        )}

        <div className="grid grid-cols-2 gap-4 mb-8 bg-slate-900 p-6 rounded-xl border border-gray-800">
          <div>
            <div className="text-sm text-gray-500">Final Credits</div>
            <div className="text-2xl font-bold text-green-400">${stats.credits}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Total Score</div>
            <div className="text-2xl font-bold text-blue-400">{stats.score}</div>
          </div>
        </div>

        {!saved ? (
          <div className="mb-8 p-4 bg-slate-800 rounded-xl border border-slate-700">
            <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase">Save High Score</h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                maxLength={12}
                placeholder="Enter Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 uppercase"
              />
              <button 
                onClick={() => {
                  if(name.trim().length > 0) {
                    onSaveScore(name.trim());
                    setSaved(true);
                  }
                }}
                disabled={name.trim().length === 0}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded font-bold"
              >
                SAVE
              </button>
            </div>
          </div>
        ) : (
           <div className="mb-8 p-4 bg-green-900/20 border border-green-500/30 rounded-xl text-green-400 font-bold">
             SCORE SAVED!
           </div>
        )}

        <button 
          onClick={onRestart}
          className="bg-white text-black font-bold py-4 px-12 rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.4)]"
        >
          RETURN TO MENU
        </button>
      </div>
    </div>
  );
};

// --- COMPONENT: LEADERBOARD SCREEN ---
const LeaderboardScreen = ({ data, onBack }: { data: LeaderboardEntry[], onBack: () => void }) => {
  return (
    <div className="flex-1 flex items-center justify-center relative bg-slate-900">
       <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-4xl w-full p-8 shadow-2xl relative">
          <button onClick={onBack} className="absolute top-6 right-6 text-gray-400 hover:text-white flex items-center gap-2">
             <Home size={18} /> BACK
          </button>
          
          <h2 className="text-4xl font-tech text-center text-yellow-400 mb-8 flex items-center justify-center gap-4">
             <Trophy size={40} /> LEADERBOARD
          </h2>

          <div className="overflow-hidden rounded-xl border border-slate-600">
             <table className="w-full text-left">
                <thead className="bg-slate-700 text-gray-300 font-bold uppercase text-xs">
                   <tr>
                      <th className="p-4">Rank</th>
                      <th className="p-4">Name</th>
                      <th className="p-4">Scenario</th>
                      <th className="p-4 text-right">Credits</th>
                      <th className="p-4 text-right">Score</th>
                      <th className="p-4 text-right">Date</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-700 text-sm">
                   {data.map((entry, index) => (
                      <tr key={index} className={`bg-slate-800/50 hover:bg-slate-700/50 transition-colors ${index < 3 ? 'text-yellow-100' : 'text-gray-300'}`}>
                         <td className="p-4 font-mono text-gray-500">#{index + 1}</td>
                         <td className="p-4 font-bold flex items-center gap-2">
                            {index === 0 && <span className="text-yellow-500">🥇</span>}
                            {index === 1 && <span className="text-gray-400">🥈</span>}
                            {index === 2 && <span className="text-orange-500">🥉</span>}
                            {entry.name}
                         </td>
                         <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs ${entry.scenario === 'Urban' ? 'bg-blue-900 text-blue-200' : 'bg-green-900 text-green-200'}`}>
                              {entry.scenario}
                            </span>
                         </td>
                         <td className="p-4 text-right font-mono text-green-400">${entry.credits}</td>
                         <td className="p-4 text-right font-bold text-blue-400 text-lg">{entry.score}</td>
                         <td className="p-4 text-right text-gray-500 text-xs">{entry.date}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );
};

// --- COMPONENT: TOOL PREVIEW CARD ---
const ToolPreviewCard = ({ type, weather, month, globalModifiers, playSound }: { type: ElementType, weather: any, month: number, globalModifiers: any, playSound: any }) => {
  const def = ELEMENTS[type];
  if (!def) return null;

  // Simulate calculating stats for this item (no neighbors)
  // Reuse the logic but stripped down or pass a dummy item
  const dummyItem: GridItem = { id: 'preview', type: type, x: 0, y: 0, upgrades: [], builtMonth: month };
  
  // Calculate value
  let val = def.baseValue;
  const seasonIndex = Math.floor((month - 1) / 3) % 4;
  const season = SEASONS[seasonIndex];

  if (def.type === 'gen' && PRODUCTION_MATRIX[def.id]) {
      const weatherMap = PRODUCTION_MATRIX[def.id];
      const multipliers = weatherMap[weather.name] || weatherMap['Clear Skies'];
      const seasonMod = multipliers ? multipliers[seasonIndex] : 1.0;
      val *= seasonMod;
      val *= globalModifiers.genEfficiency;
  } else if (def.type === 'load') {
      val *= season.loadMod;
      if (weather.name === 'Heatwave') val *= 1.2;
      val *= globalModifiers.loadReduction;
  } else if (def.type === 'store') {
      // Show Max Capacity for preview, not current charge or degradation
      // But maybe apply winter penalty if applicable
      if (season.name === 'Winter') val *= 0.9;
  }

  val = Math.round(val);

  return (
    <div className="absolute bottom-4 right-80 z-40 bg-slate-900/95 backdrop-blur border border-slate-500 rounded-xl p-4 shadow-2xl max-w-xs animate-fade-in-up">
       <div className="flex items-center gap-3 mb-2 border-b border-slate-700 pb-2">
          <span className="text-3xl">{def.icon}</span>
          <div>
             <h3 className="font-bold text-white text-lg leading-tight">{def.name}</h3>
             <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${def.type === 'gen' ? 'bg-green-900 text-green-400' : def.type === 'load' ? 'bg-red-900 text-red-400' : 'bg-blue-900 text-blue-400'}`}>
               {def.type === 'gen' ? 'Generator' : def.type === 'load' ? 'Consumer' : def.type === 'store' ? 'Storage' : 'Utility'}
             </span>
          </div>
       </div>
       <p className="text-xs text-gray-300 mb-3 italic">{def.description}</p>
       <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-slate-800 p-2 rounded">
             <div className="text-xs text-gray-500">Cost</div>
             <div className="font-bold text-green-400">${def.cost}</div>
          </div>
          <div className="bg-slate-800 p-2 rounded">
             <div className="text-xs text-gray-500">{def.type === 'store' ? 'Capacity' : def.type === 'load' ? 'Proj. Load' : 'Est. Output'}</div>
             <div className={`font-bold ${def.type === 'load' ? 'text-red-400' : def.type === 'store' ? 'text-blue-400' : 'text-green-400'}`}>
                {val} {def.type === 'store' ? 'kWh' : 'kW'}
             </div>
          </div>
       </div>
       {def.type === 'gen' && (
         <div className="mt-2 text-[10px] text-yellow-500 flex items-center gap-1">
            <Info size={10} /> Affected by Season & Weather
         </div>
       )}
    </div>
  );
};

// --- MAIN APP ---
export default function App() {
  const { enabled, setEnabled, playSound } = useAudio();
  
  // --- STATE ---
  const [state, setState] = useState<GameState>({
    screen: 'menu',
    scenario: null,
    credits: 0,
    score: 0,
    month: 1,
    gridItems: [],
    weather: WEATHER_TYPES[0],
    selectedTool: null,
    inspectedItemId: null,
    synergyActive: false,
    gridSize: 8,
    batteryCharge: 0,
    lastMonthStats: null,
    pendingEvent: null,
    currentQuiz: null,
    tutorialStep: 0,
    soundEnabled: true,
    usedQuizIds: []
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'info' | 'success' | 'error'} | null>(null);
  const [hoveredTool, setHoveredTool] = useState<ElementType | null>(null);
  
  // Track global modifiers from events
  const [globalModifiers, setGlobalModifiers] = useState({
    genEfficiency: 1.0,
    loadReduction: 1.0
  });

  // Load Leaderboard
  useEffect(() => {
     const stored = localStorage.getItem('eco_leaderboard');
     if (stored) {
        setLeaderboard(JSON.parse(stored));
     } else {
        setLeaderboard(DEFAULT_LEADERBOARD);
     }
  }, []);

  const saveScore = (name: string) => {
     const newEntry: LeaderboardEntry = {
        name,
        score: state.score,
        credits: state.credits,
        scenario: state.scenario === 'urban' ? 'Urban' : 'Rural',
        date: new Date().toISOString().split('T')[0]
     };
     const newBoard = [...leaderboard, newEntry].sort((a, b) => b.score - a.score).slice(0, 10);
     setLeaderboard(newBoard);
     localStorage.setItem('eco_leaderboard', JSON.stringify(newBoard));
     playSound('success');
  };

  // Sync sound state
  useEffect(() => {
    setEnabled(state.soundEnabled);
  }, [state.soundEnabled]);

  // --- HELPERS ---
  const showToast = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000); // 5s toast
  };

  const getNeighbors = (x: number, y: number, w: number, h: number, gridItems: GridItem[]) => {
      // Logic for adjacency of multi-tile items
      // Check perimeter
      const neighbors: GridItem[] = [];
      gridItems.forEach(item => {
         if (item.x === x && item.y === y) return; // self
         
         const iDef = ELEMENTS[item.type];
         const iW = iDef.width || 1;
         const iH = iDef.height || 1;
         
         // Check if bounding boxes touch
         // Horizontal touch
         const touchX = (item.x + iW === x) || (x + w === item.x);
         const overlapY = (item.y < y + h) && (item.y + iH > y);
         
         // Vertical touch
         const touchY = (item.y + iH === y) || (y + h === item.y);
         const overlapX = (item.x < x + w) && (item.x + iW > x);
         
         if ((touchX && overlapY) || (touchY && overlapX)) {
            neighbors.push(item);
         }
      });
      return neighbors;
  };

  const calculateItemStats = (item: GridItem, gridItems: GridItem[], weather: any, month: number, globalModifiers: any) => {
      const def = ELEMENTS[item.type];
      const seasonIndex = Math.floor((month - 1) / 3) % 4;
      const season = SEASONS[seasonIndex];

      // MATRIX LOOKUP FOR GEN
      let val = def.baseValue;
      if (def.type === 'gen' && PRODUCTION_MATRIX[def.id]) {
         const weatherMap = PRODUCTION_MATRIX[def.id];
         // Fallback to Clear Skies if undefined weather
         const multipliers = weatherMap[weather.name] || weatherMap['Clear Skies'];
         // Apply Season Multiplier from Matrix
         const seasonMod = multipliers ? multipliers[seasonIndex] : 1.0;
         val *= seasonMod;
      }

      // If it's load, apply simple seasonal logic (Heating/Cooling)
      if (def.type === 'load') {
          val *= season.loadMod;
          if (weather.name === 'Heatwave') val *= 1.2;
      }
      
      // Upgrades
      if (item.upgrades) {
         const avail = UPGRADES[item.type] || [];
         item.upgrades.forEach(uid => {
            const u = avail.find(x => x.id === uid);
            // Grid Ops handled globally, not per item value display usually, but for internal calc ok
            if(u && item.type !== 'meter') val *= u.multiplier;
         });
      }

      const neighbors = getNeighbors(item.x, item.y, def.width || 1, def.height || 1, gridItems);

      if (def.type === 'gen') {
        if (item.type === 'solar') {
          // Solar Synergy: +10% per adjacent solar
          const solarNeighbors = neighbors.filter(n => n.type === 'solar').length;
          if (solarNeighbors > 0) val *= (1 + (solarNeighbors * 0.1));
          
          // Negative Synergy: Shadow from Apartments/Office
          if (neighbors.some(n => n.type === 'apartment' || n.type === 'office')) val *= 0.9;
        
        } else if (item.type === 'wind') {
          // Positive Synergy: Open Space (No neighbors)
          if (neighbors.length === 0) val *= 1.1;
          
          // Negative Synergy: Turbulence (Adjacent Wind or Apartment)
          if (neighbors.some(n => n.type === 'wind' || n.type === 'apartment')) val *= 0.8;
          
        } else if (item.type === 'hydro') {
          // Hydro Synergy: Rain Boost
          if (weather.name === 'Rainy') val *= 1.2;
        } 
        
        val *= globalModifiers.genEfficiency;
      } else if (def.type === 'load') {
        val *= globalModifiers.loadReduction;
      } else if (def.type === 'store') {
        // Battery Logic
        // 1. Efficiency In/Out factor (0.9 * 0.95 approx 0.85 effective storage of rated capacity?) 
        // Let's just say capacity is reduced by 10% inherent loss
        val *= 0.9; 

        // 2. Winter Penalty
        if (season.name === 'Winter') val *= 0.9;
        
        // 3. Degradation (5% per month)
        const age = month - (item.builtMonth || 1);
        if (age > 0) {
           val *= Math.max(0.1, 1 - (age * 0.05));
        }
      }

      return val;
  };

  const calculateStats = useMemo(() => {
    let totalGen = 0;
    let totalLoad = 0;
    let totalCapacity = 0;
    let upkeep = 0;
    
    state.gridItems.forEach(item => {
      const def = ELEMENTS[item.type];
      upkeep += def.cost * 0.05;

      const val = calculateItemStats(item, state.gridItems, state.weather, state.month, globalModifiers);

      if (def.type === 'gen') totalGen += val;
      else if (def.type === 'load') totalLoad += val;
      else if (def.type === 'store') totalCapacity += val;
    });

    // Grid Ops Global Upgrades
    const gridOps = state.gridItems.find(i => i.type === 'meter');
    if (gridOps && gridOps.upgrades) {
        if (gridOps.upgrades.includes('ai_bal')) totalLoad *= 0.95;
        if (gridOps.upgrades.includes('pred_maint')) upkeep *= 0.80;
        if (gridOps.upgrades.includes('super_cond')) totalGen *= 1.05;
    }

    // Synergy
    const hasSolar = state.gridItems.some(i => i.type === 'solar');
    const hasWind = state.gridItems.some(i => i.type === 'wind');
    if (hasSolar && hasWind) totalGen *= 1.1;

    // Grid Status Logic: Off-Grid if Generation + Battery Charge covers Load
    const potentialPower = totalGen + state.batteryCharge;
    const isOffGrid = potentialPower >= totalLoad;

    return { totalGen, totalLoad, totalCapacity, upkeep, synergyActive: hasSolar && hasWind, isOffGrid };
  }, [state.gridItems, state.weather, state.month, globalModifiers, state.batteryCharge]);

  // Effect to notify synergy
  useEffect(() => {
    if (calculateStats.synergyActive && !state.synergyActive) {
      showToast("⚡ SYNERGY ACTIVE: Wind + Solar Bonus!", 'success');
      playSound('success');
      setState(s => ({...s, synergyActive: true}));
    } else if (!calculateStats.synergyActive && state.synergyActive) {
      setState(s => ({...s, synergyActive: false}));
    }
  }, [calculateStats.synergyActive]);

  // --- ACTIONS ---
  const startGame = (scenario: 'urban' | 'rural', isTutorial = false) => {
    playSound('build');
    const isUrban = scenario === 'urban';
    const size = isUrban ? GRID_SIZE_URBAN : GRID_SIZE_RURAL;
    const center = Math.floor(size / 2);
    
    // Reset Global Modifiers
    setGlobalModifiers({ genEfficiency: 1.0, loadReduction: 1.0 });

    // Initial Items
    const initialItems: GridItem[] = [
      { id: 'meter-main', type: 'meter', x: center, y: center, locked: true, upgrades: [], builtMonth: 1 }
    ];

    if (isUrban) {
      // DENSE URBAN LAYOUT (Challenge: High Load)
      const urbanBuildings: GridItem[] = [
         { id: 'u-fac-1', type: 'factory', x: 0, y: 0, locked: true, upgrades: [], builtMonth: 1 },
         { id: 'u-fac-2', type: 'factory', x: 1, y: 0, locked: true, upgrades: [], builtMonth: 1 },
         { id: 'u-off-1', type: 'office', x: size-1, y: 0, locked: true, upgrades: [], builtMonth: 1 },
         { id: 'u-apt-1', type: 'apartment', x: 0, y: size-1, locked: true, upgrades: [], builtMonth: 1 },
         { id: 'u-apt-2', type: 'apartment', x: 1, y: size-1, locked: true, upgrades: [], builtMonth: 1 },
         { id: 'u-hosp', type: 'hospital', x: size-1, y: size-1, locked: true, upgrades: [], builtMonth: 1 },
         { id: 'u-apt-3', type: 'apartment', x: center-1, y: center-1, locked: true, upgrades: [], builtMonth: 1 },
         { id: 'u-apt-4', type: 'apartment', x: center+1, y: center+1, locked: true, upgrades: [], builtMonth: 1 },
         { id: 'u-off-2', type: 'office', x: size-2, y: 1, locked: true, upgrades: [], builtMonth: 1 },
      ];
      initialItems.push(...urbanBuildings);
    } else {
      // DENSE RURAL LAYOUT (Challenge: Distance + scattered loads)
      // Replaced Apartments with Houses, Barns, Greenhouses and Milk Factory
      const ruralBuildings: GridItem[] = [
        { id: 'r-milk-1', type: 'milk_factory', x: size-2, y: size-2, locked: true, upgrades: [], builtMonth: 1 },
        { id: 'r-barn-1', type: 'barn', x: 1, y: 1, locked: true, upgrades: [], builtMonth: 1 },
        { id: 'r-barn-2', type: 'barn', x: 2, y: 1, locked: true, upgrades: [], builtMonth: 1 },
        { id: 'r-green-1', type: 'greenhouse', x: 1, y: 2, locked: true, upgrades: [], builtMonth: 1 },
        { id: 'r-house-1', type: 'house', x: size-2, y: 2, locked: true, upgrades: [], builtMonth: 1 },
        { id: 'r-house-2', type: 'house', x: size-3, y: 2, locked: true, upgrades: [], builtMonth: 1 },
        { id: 'r-house-3', type: 'house', x: size-2, y: 1, locked: true, upgrades: [], builtMonth: 1 },
        { id: 'r-green-2', type: 'greenhouse', x: 5, y: 8, locked: true, upgrades: [], builtMonth: 1 },
        { id: 'r-barn-3', type: 'barn', x: 6, y: 8, locked: true, upgrades: [], builtMonth: 1 },
      ];
      initialItems.push(...ruralBuildings);
    }

    setState(prev => ({
      ...prev,
      screen: 'game',
      scenario,
      credits: isTutorial ? 3000 : (isUrban ? 2000 : 1800), // Boosted credits slightly for denser start
      score: 0,
      month: 1,
      gridItems: initialItems,
      gridSize: size,
      weather: WEATHER_TYPES[0],
      synergyActive: false,
      inspectedItemId: null,
      tutorialStep: isTutorial ? 1 : 0,
      usedQuizIds: []
    }));
  };

  const handleNextMonth = () => {
    const { totalGen, totalLoad, upkeep, isOffGrid, totalCapacity } = calculateStats;
    let currentCharge = state.batteryCharge;
    
    // ENERGY SIMULATION
    const balance = totalGen - totalLoad;
    let usedEnergy = 0;
    let storedEnergy = 0;
    
    if (balance > 0) {
        // Surplus: Charge Battery
        const chargeSpace = totalCapacity - currentCharge;
        const chargeAmount = Math.min(chargeSpace, balance);
        currentCharge += chargeAmount;
        storedEnergy = chargeAmount;
    } else if (balance < 0) {
        // Deficit: Drain Battery
        const deficit = Math.abs(balance);
        const dischargeAmount = Math.min(currentCharge, deficit);
        currentCharge -= dischargeAmount;
        usedEnergy = dischargeAmount;
    }

    // Ensure battery doesn't exceed cap
    if (currentCharge > totalCapacity) currentCharge = totalCapacity;

    // Financials
    const netSurplus = Math.max(0, balance - storedEnergy);
    const unmetLoad = Math.max(0, Math.abs(balance) - usedEnergy);

    let income = 0;
    let rating = 100;
    
    if (unmetLoad === 0) {
      income = 1200 + (netSurplus * 2.5);
    } else {
      income = 400; 
      const deficitPct = unmetLoad / (totalLoad || 1);
      rating = Math.max(0, 100 - (deficitPct * 150));
    }
    
    const roundedIncome = Math.floor(income);
    const roundedUpkeep = Math.floor(upkeep);
    const roundedRating = Math.floor(rating);

    // Pick Event
    // Blackout logic from Month 5+
    let event: any = null;
    if (state.month >= 5 && Math.random() < 0.3) {
       event = EVENTS.find(e => e.id === 'blackout');
    } else if (Math.random() < 0.3) {
       event = EVENTS.filter(e => e.id !== 'blackout')[Math.floor(Math.random() * (EVENTS.length - 1))];
    }

    // Pick Quiz (Unique)
    const availableQuestions = QUIZ_QUESTIONS.filter(q => !state.usedQuizIds.includes(q.id));
    const quiz = availableQuestions.length > 0 
       ? availableQuestions[Math.floor(Math.random() * availableQuestions.length)]
       : QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)]; // Fallback

    setState(prev => ({
      ...prev,
      screen: 'quiz', // Always go to quiz first
      batteryCharge: currentCharge,
      lastMonthStats: {
        income: roundedIncome,
        upkeep: roundedUpkeep,
        rating: roundedRating,
        isOffGrid,
        storedEnergy,
        usedEnergy
      },
      currentQuiz: quiz,
      pendingEvent: event,
      quizResult: undefined,
      usedQuizIds: [...prev.usedQuizIds, quiz.id]
    }));
  };

  const handleQuizAnswer = (correct: boolean) => {
    setState(prev => ({
      ...prev,
      screen: 'report', // Go to report after quiz
      quizResult: {
        correct,
        reward: correct ? 300 : 0
      }
    }));
  };

  const handleReportContinue = (choiceIndex?: number, outcomeText?: string) => {
    setState(prev => {
      let nextCredits = prev.credits;
      let nextScore = prev.score;
      const { income, upkeep, rating } = prev.lastMonthStats!;

      // 1. Apply Monthly Net
      nextCredits += (income - upkeep);
      nextScore += rating; // Full rating points

      // 2. Apply Quiz Reward
      if (prev.quizResult?.correct) {
        nextCredits += prev.quizResult.reward;
      }

      // 3. Apply Event Choice (Instant Effects)
      let destructionId: string | null = null;
      if (choiceIndex !== undefined && prev.pendingEvent) {
         const evt = prev.pendingEvent;
         const opt = evt.options[choiceIndex];
         const effect = opt.effect(prev);
         
         if (effect.credits !== undefined) nextCredits = effect.credits;
         if (effect.score !== undefined) nextScore = effect.score;

         // Handle Permanent Global Modifiers
         if (evt.id === 'maintenance' && choiceIndex === 1) {
            setGlobalModifiers(gm => ({ ...gm, genEfficiency: gm.genEfficiency + 0.05 }));
         }
         if (evt.id === 'policy' && choiceIndex === 0) {
            setGlobalModifiers(gm => ({ ...gm, loadReduction: gm.loadReduction * 0.95 }));
         }
         
         // Handle Blackout Buff
         if (evt.id === 'blackout' && choiceIndex === 0) {
            // Check if successful (score increase indicates success in effect logic)
            // But effect logic is run above and returns relative changes.
            // Let's re-verify the condition here for the Buff
            let totalStorage = 0;
            prev.gridItems.forEach(item => {
                const def = ELEMENTS[item.type];
                if (def.type === 'store') {
                   // Calculate raw storage value (ignoring weather/decay for the check)
                   let val = def.baseValue;
                   if(item.upgrades?.includes('cap')) val *= 1.4; // Upgrade logic mirror
                   if(item.upgrades?.includes('solid')) val *= 1.6;
                   totalStorage += val;
                }
            });

            if (totalStorage > 150) {
               // SUCCESS! Apply Buff
               setGlobalModifiers(gm => ({ ...gm, loadReduction: gm.loadReduction * 0.95 }));
            }
         }
         
         // Handle Building Destruction (Earthquake Negligence)
         if (evt.id === 'disaster' && choiceIndex === 1) {
             // Destroy a random building (excluding Meter/City Property if possible, but disaster strikes all!)
             // Let's protect the meter though.
             const destructible = prev.gridItems.filter(i => i.type !== 'meter');
             if (destructible.length > 0) {
                 const target = destructible[Math.floor(Math.random() * destructible.length)];
                 destructionId = target.id;
             }
         }
      }

      // Prevent negative score
      nextScore = Math.max(0, nextScore);

      // 4. Check End Game Conditions
      if (nextCredits < 0) {
        playSound('fail');
        return { ...prev, screen: 'gameover', credits: nextCredits, score: nextScore };
      }
      if (prev.month >= 12) {
        playSound('win');
        return { ...prev, screen: 'victory', credits: nextCredits, score: nextScore };
      }

      // 5. Advance Month
      const nextMonth = prev.month + 1;
      const nextWeather = WEATHER_TYPES[Math.floor(Math.random() * WEATHER_TYPES.length)];
      
      let nextGridItems = prev.gridItems;
      if (destructionId) {
          nextGridItems = prev.gridItems.filter(i => i.id !== destructionId);
      }

      return {
        ...prev,
        screen: 'game',
        month: nextMonth,
        credits: nextCredits,
        score: nextScore,
        weather: nextWeather,
        gridItems: nextGridItems,
        pendingEvent: null,
        currentQuiz: null,
        lastMonthStats: null,
        quizResult: undefined,
        tutorialStep: 0 // Ensure tutorial resets if hanging
      };
    });
  };

  const handleMapClick = (x: number, y: number) => {
    // Check bounds
    if (x < 0 || x >= state.gridSize || y < 0 || y >= state.gridSize) return;

    // Check existing (Multi-tile support)
    const existing = state.gridItems.find(i => {
       const def = ELEMENTS[i.type];
       const w = def.width || 1;
       const h = def.height || 1;
       return x >= i.x && x < i.x + w && y >= i.y && y < i.y + h;
    });

    // Tool: Delete
    if (state.selectedTool === 'delete') {
      if (existing) {
        if (existing.locked) {
          showToast("🚫 Cannot demolish city property!", 'error');
          playSound('error');
        } else if (existing.type === 'meter') {
          showToast("🚫 Cannot demolish Grid Ops!", 'error');
          playSound('error');
        } else {
          // Refund 50%
          const cost = ELEMENTS[existing.type].cost;
          setState(prev => ({
            ...prev,
            credits: prev.credits + Math.floor(cost * 0.5),
            gridItems: prev.gridItems.filter(i => i.id !== existing.id)
          }));
          playSound('build'); // Reverse build sound?
        }
      }
      return;
    }

    // Tool: Inspect/Upgrade (No tool selected or clicking existing)
    if (!state.selectedTool || existing) {
      if (existing) {
        setState(prev => ({ ...prev, inspectedItemId: existing.id }));
        playSound('click');
      }
      return;
    }

    // Tool: Build
    if (state.selectedTool && !existing) {
      const def = ELEMENTS[state.selectedTool];
      let cost = def.cost;
      const w = def.width || 1;
      const h = def.height || 1;

      // Check boundary for multi-tile
      if (x + w > state.gridSize || y + h > state.gridSize) {
         showToast("🚫 Too close to edge!", 'error');
         playSound('error');
         return;
      }
      
      // Check collision for multi-tile area
      const collision = state.gridItems.some(i => {
         const iDef = ELEMENTS[i.type];
         const iW = iDef.width || 1;
         const iH = iDef.height || 1;
         
         // AABB Collision
         return (x < i.x + iW && x + w > i.x && y < i.y + iH && y + h > i.y);
      });
      
      if (collision) {
         showToast("🚫 Space occupied!", 'error');
         playSound('error');
         return;
      }

      // Rural Transmission cost logic
      if (state.scenario === 'rural') {
        const center = Math.floor(state.gridSize / 2);
        const dist = Math.sqrt(Math.pow(x - center, 2) + Math.pow(y - center, 2));
        
        if (dist > RURAL_TRANSMISSION_DISTANCE_THRESHOLD) {
          cost += Math.floor((dist - RURAL_TRANSMISSION_DISTANCE_THRESHOLD) * WIRE_COST_PER_UNIT);
        }
      }

      if (state.credits >= cost) {
        const newItem: GridItem = {
          id: `el_${Date.now()}`,
          type: state.selectedTool,
          x,
          y,
          upgrades: [],
          builtMonth: state.month
        };
        setState(prev => ({
          ...prev,
          credits: prev.credits - cost,
          gridItems: [...prev.gridItems, newItem]
        }));
        playSound('build');
      } else {
        showToast("⚠️ Insufficient Credits!", 'error');
        playSound('error');
      }
    }
  };

  const applyUpgrade = (upgradeId: string, cost: number) => {
    if (!state.inspectedItemId) return;
    
    setState(prev => ({
      ...prev,
      credits: prev.credits - cost,
      gridItems: prev.gridItems.map(item => {
        if (item.id === prev.inspectedItemId) {
           return { ...item, upgrades: [...(item.upgrades || []), upgradeId] };
        }
        return item;
      })
    }));
  };

  const sellUpgrade = (upgradeId: string, cost: number) => {
    if (!state.inspectedItemId) return;

    const refund = Math.floor(cost * 0.7);
    
    setState(prev => ({
      ...prev,
      credits: prev.credits + refund,
      gridItems: prev.gridItems.map(item => {
        if (item.id === prev.inspectedItemId && item.upgrades) {
           return { ...item, upgrades: item.upgrades.filter(uid => uid !== upgradeId) };
        }
        return item;
      })
    }));
    playSound('cash');
    showToast(`Upgrade sold for $${refund}`, 'success');
  };

  const renderGridIcon = (type: ElementType) => {
     switch(type) {
        case 'solar': return <Sun className="text-yellow-400 animate-spin-slow" size={32} />;
        case 'wind': return <Fan className="text-gray-200 animate-spin" size={32} />;
        case 'hydro': return <Droplets className="text-blue-400 animate-bounce" size={32} />;
        case 'thermo': return <Flame className="text-orange-500 animate-pulse" size={32} />;
        case 'geothermal': return <div className="relative"><Flame className="text-red-500 animate-pulse" size={48} /><div className="absolute -top-1 left-0 text-sm text-center w-full">🌋</div></div>;
        case 'battery_small': return <div className="relative"><div className="w-5 h-7 border border-blue-400 rounded-sm bg-blue-900/50 flex flex-col justify-end p-0.5"><div className="bg-blue-400 w-full h-1/3 animate-pulse"></div></div></div>;
        case 'battery_medium': return <div className="relative"><div className="w-6 h-8 border-2 border-blue-400 rounded-sm bg-blue-900/50 flex flex-col justify-end p-0.5"><div className="bg-blue-400 w-full h-2/3 animate-pulse"></div></div><div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-blue-400"></div></div>;
        case 'battery_large': return <div className="relative"><div className="w-12 h-16 border-4 border-blue-400 rounded-md bg-blue-900/50 flex flex-col justify-end p-1"><div className="bg-blue-400 w-full h-full animate-pulse"></div></div><div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-2 bg-blue-400"></div></div>;
        case 'meter': return <Radio className="text-yellow-400 animate-pulse" size={32} />;
        case 'apartment': return <span className="text-2xl">🏢</span>;
        case 'office': return <span className="text-2xl">🏬</span>;
        case 'factory': return <span className="text-2xl">🏭</span>;
        case 'hospital': return <span className="text-2xl">🏥</span>;
        case 'house': return <span className="text-2xl">🏠</span>;
        case 'barn': return <span className="text-2xl">🏚️</span>;
        case 'greenhouse': return <span className="text-2xl">🌿</span>;
        case 'milk_factory': return <span className="text-2xl">🥛</span>;
        case 'farm': return <span className="text-2xl">🚜</span>;
        default: return <Zap />;
     }
  };

  const cellSize = 60; 
  const mapSizePx = state.gridSize * cellSize;

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0f172a] text-white overflow-hidden relative selection:bg-yellow-500/30">
      
      {/* GLOBAL TOAST */}
      {toast && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-full shadow-2xl animate-fade-in-up flex items-center gap-3 border transition-all ${
            toast.type === 'success' ? 'bg-green-600/90 border-green-400 scale-105' : 
            toast.type === 'error' ? 'bg-red-600/90 border-red-400' : 
            'bg-slate-800/90 border-yellow-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="text-white" size={24} /> : 
           toast.type === 'error' ? <AlertTriangle className="text-white" size={24} /> : 
           <Info className="text-yellow-400" size={24} />}
          <span className="font-bold text-lg whitespace-pre-wrap text-center">{toast.msg}</span>
        </div>
      )}

      {/* --- MENU SCREEN --- */}
      {state.screen === 'menu' && (
        <div className="flex-1 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80')] bg-cover opacity-20"></div>
          <div className="z-10 text-center space-y-8 p-10 bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-3xl shadow-2xl max-w-2xl w-full">
            <div>
              <h1 className="text-6xl font-tech text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400 mb-2">ECO GRID</h1>
            </div>
            
            <div className="grid grid-cols-1 gap-4 max-w-xs mx-auto">
              <button onClick={() => setState(s => ({...s, screen: 'scenario'}))} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl text-lg transition-transform active:scale-95 shadow-lg shadow-blue-900/20">
                START GAME
              </button>
              <div className="flex gap-4">
                 <button onClick={() => startGame('urban', true)} className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-4 rounded-xl text-lg transition-transform active:scale-95 shadow-lg shadow-yellow-900/20 flex items-center justify-center gap-2">
                   <BookOpen size={20} /> TUTORIAL
                 </button>
                 <button onClick={() => setState(s => ({...s, screen: 'leaderboard'}))} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl text-lg transition-transform active:scale-95 shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2">
                   <Trophy size={20} /> LEADERBOARD
                 </button>
              </div>
              <button onClick={() => setShowHelp(true)} className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-4 rounded-xl text-lg transition-transform active:scale-95">
                HOW TO PLAY
              </button>
            </div>

            <div className="text-xs text-slate-500 pt-4">v2.5.0 • React Engine</div>
          </div>
        </div>
      )}

      {/* --- LEADERBOARD SCREEN --- */}
      {state.screen === 'leaderboard' && (
         <LeaderboardScreen 
            data={leaderboard} 
            onBack={() => setState(s => ({...s, screen: 'menu'}))} 
         />
      )}

      {/* --- SCENARIO SELECT --- */}
      {state.screen === 'scenario' && (
        <div className="flex-1 flex items-center justify-center relative">
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-700 max-w-3xl w-full">
            <h2 className="text-3xl font-tech text-center mb-8">SELECT ENVIRONMENT</h2>
            <div className="grid grid-cols-2 gap-6">
              <button onClick={() => startGame('urban')} className="group relative bg-slate-800 hover:bg-slate-700 border-2 border-transparent hover:border-blue-500 rounded-xl p-6 text-left transition-all">
                <div className="absolute top-4 right-4 bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded">NORMAL</div>
                <div className="text-4xl mb-4">🏙️</div>
                <h3 className="text-xl font-bold mb-2 text-white">Urban Center</h3>
                <p className="text-sm text-gray-400">Dense space. High initial demand. Locked city infrastructure.</p>
              </button>
              
              <button onClick={() => startGame('rural')} className="group relative bg-slate-800 hover:bg-slate-700 border-2 border-transparent hover:border-green-500 rounded-xl p-6 text-left transition-all">
                 <div className="absolute top-4 right-4 bg-orange-900 text-orange-200 text-xs px-2 py-1 rounded">HARD</div>
                <div className="text-4xl mb-4">🚜</div>
                <h3 className="text-xl font-bold mb-2 text-white">Rural Expansion</h3>
                <p className="text-sm text-gray-400">Vast open land. Transmission costs apply for distant buildings.</p>
              </button>
            </div>
            <button onClick={() => setState(s => ({...s, screen: 'menu'}))} className="mt-8 w-full py-3 text-slate-400 hover:text-white">Back to Menu</button>
          </div>
        </div>
      )}

      {/* --- GAME UI --- */}
      {(state.screen === 'game' || state.screen === 'report' || state.screen === 'quiz') && (
        <>
          {/* HEADER */}
          <header className="h-16 bg-slate-900/90 backdrop-blur border-b border-slate-700 flex items-center justify-between px-6 z-20">
            <div className="flex items-center gap-4">
              <div className="font-tech text-xl text-blue-400 flex items-center gap-2">
                <Activity /> ECO GRID
              </div>
              <div className="h-8 w-px bg-slate-700 mx-2"></div>
              <div className="flex items-center gap-6 text-sm font-bold">
                 <div className="flex flex-col">
                    <span className="text-xs text-gray-500">CREDITS</span>
                    <span className={state.credits < 500 ? "text-red-400" : "text-green-400"}>${state.credits}</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-xs text-gray-500">SCORE</span>
                    <span className="text-blue-400">{state.score}</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-xs text-gray-500">DATE</span>
                    <span className="text-white">Month {state.month}/12</span>
                 </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setState(s => ({...s, soundEnabled: !s.soundEnabled}))} 
                className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                title={state.soundEnabled ? "Mute" : "Unmute"}
              >
                {state.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              <button 
                onClick={() => setShowHelp(true)}
                className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
              >
                <HelpCircle size={20} />
              </button>
              <button 
                onClick={() => setState(s => ({...s, screen: 'menu'}))}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-slate-800 rounded-full transition-colors"
                title="Quit to Menu"
              >
                <Home size={20} />
              </button>
            </div>
          </header>

          <main className="flex-1 flex overflow-hidden relative">
            
            {/* FLOATING WEATHER WIDGET OVERLAY */}
            <div className="absolute top-6 left-6 z-30 bg-slate-900/90 backdrop-blur border border-slate-600 p-4 rounded-xl shadow-2xl max-w-xs animate-fade-in pointer-events-none select-none">
              <div className="text-xs font-bold text-blue-400 mb-1 uppercase tracking-widest">
                {SEASONS[Math.floor((state.month - 1) / 3) % 4].name}
              </div>
              
              <div className="flex items-center gap-3 mb-1">
                 {state.weather.name === 'Clear Skies' && <Sun className="text-yellow-400" size={24} />}
                 {state.weather.name === 'Overcast' && <Cloud className="text-gray-400" size={24} />}
                 {state.weather.name === 'Stormy' && <CloudLightning className="text-purple-400" size={24} />}
                 {state.weather.name === 'Heatwave' && <ThermometerSun className="text-orange-500" size={24} />}
                 <h3 className="text-lg font-bold text-white">{state.weather.name}</h3>
              </div>
              <p className="text-sm text-gray-300 italic">"{state.weather.tip}"</p>
            </div>

            {/* TOOL PREVIEW CARD */}
            {(hoveredTool || (state.selectedTool && state.selectedTool !== 'delete')) && (
               <ToolPreviewCard 
                  type={hoveredTool || (state.selectedTool as ElementType)} 
                  weather={state.weather} 
                  month={state.month}
                  globalModifiers={globalModifiers}
                  playSound={playSound}
               />
            )}

            {/* MAP AREA */}
            <div className="flex-1 relative bg-[#0B1120] flex items-center justify-center overflow-auto p-8 cursor-grab active:cursor-grabbing grid-scroll">
               <div 
                 className="relative bg-slate-800/50 shadow-2xl border-2 border-slate-700 transition-all duration-500"
                 style={{ width: mapSizePx, height: mapSizePx }}
               >
                 {/* GRID LINES */}
                 <div className="absolute inset-0 opacity-20 pointer-events-none z-0" 
                      style={{ 
                        backgroundImage: `linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)`, 
                        backgroundSize: `${cellSize}px ${cellSize}px`
                      }} 
                 />
                 
                 {/* WIRES LAYER - Minimum Spanning Tree Logic */}
                 <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-60">
                   {state.gridItems.length > 1 && (() => {
                      // MST Logic for visuals
                      return state.gridItems.map((item, idx) => {
                         if (item.type === 'meter') return null; // Meter doesn't connect 'out'
                         
                         const def = ELEMENTS[item.type];
                         const w = def.width || 1;
                         const h = def.height || 1;
                         const centerX = item.x * cellSize + (w * cellSize) / 2;
                         const centerY = item.y * cellSize + (h * cellSize) / 2;

                         // Find nearest neighbor center
                         let nearest = null;
                         let minDist = Infinity;
                         
                         state.gridItems.forEach((other, otherIdx) => {
                            if (idx === otherIdx) return;
                            const oDef = ELEMENTS[other.type];
                            const oCenterX = other.x * cellSize + (oDef.width||1)*cellSize/2;
                            const oCenterY = other.y * cellSize + (oDef.height||1)*cellSize/2;
                            
                            const d = Math.sqrt(Math.pow(centerX - oCenterX, 2) + Math.pow(centerY - oCenterY, 2));
                            if (d < minDist) {
                               minDist = d;
                               nearest = { x: oCenterX, y: oCenterY };
                            }
                         });

                         if (nearest) {
                            const isRural = state.scenario === 'rural';
                            return (
                               <line 
                                 key={`wire-${item.id}`} 
                                 x1={centerX} y1={centerY} x2={(nearest as any).x} y2={(nearest as any).y} 
                                 stroke={isRural ? "#facc15" : "#06b6d4"} 
                                 strokeWidth="2" 
                                 strokeDasharray={isRural ? "6 4" : undefined}
                               />
                            );
                         }
                         return null;
                      });
                   })()}
                 </svg>
                 
                 {/* CELLS CLICK TARGETS */}
                 {Array.from({ length: state.gridSize * state.gridSize }).map((_, idx) => {
                   const x = idx % state.gridSize;
                   const y = Math.floor(idx / state.gridSize);
                   
                   // Hover logic for Rural cost preview
                   const center = Math.floor(state.gridSize / 2);
                   const dist = Math.sqrt(Math.pow(x - center, 2) + Math.pow(y - center, 2));
                   const isExtraCost = state.scenario === 'rural' && dist > RURAL_TRANSMISSION_DISTANCE_THRESHOLD;

                   return (
                     <div 
                       key={idx}
                       onClick={() => handleMapClick(x, y)}
                       title={isExtraCost ? `Extra Wiring Cost: $${Math.floor((dist - RURAL_TRANSMISSION_DISTANCE_THRESHOLD) * WIRE_COST_PER_UNIT)}` : undefined}
                       className={`absolute hover:bg-white/5 transition-colors z-10 ${isExtraCost && state.selectedTool && state.selectedTool !== 'delete' ? 'hover:bg-yellow-500/20' : ''}`}
                       style={{ 
                         width: cellSize, 
                         height: cellSize, 
                         left: x * cellSize, 
                         top: y * cellSize 
                       }}
                     />
                   );
                 })}

                 {/* ITEMS */}
                 {state.gridItems.map(item => {
                   const def = ELEMENTS[item.type];
                   let borderColor = 'border-gray-600';
                   if (def.type === 'gen') borderColor = 'border-green-500';
                   if (def.type === 'load') borderColor = 'border-red-500';
                   if (def.type === 'store') borderColor = 'border-blue-500';
                   if (def.type === 'util') borderColor = 'border-yellow-500';

                   const kwValue = calculateItemStats(item, state.gridItems, state.weather, state.month, globalModifiers);
                   const w = def.width || 1;
                   const h = def.height || 1;

                   return (
                     <div
                       key={item.id}
                       onClick={(e) => { 
                         e.stopPropagation(); 
                         if (state.selectedTool === 'delete') {
                           // For delete, handle at logic level but pass event
                           handleMapClick(item.x, item.y);
                         } else {
                           setState(s => ({...s, inspectedItemId: item.id})); 
                           playSound('click'); 
                         }
                       }}
                       className={`absolute m-0.5 rounded-md bg-slate-900 border-2 ${borderColor} flex items-center justify-center shadow-lg hover:brightness-110 transition-transform cursor-pointer z-20 overflow-hidden`}
                       style={{ 
                         width: (cellSize * w) - 4, 
                         height: (cellSize * h) - 4, 
                         left: item.x * cellSize, 
                         top: item.y * cellSize 
                       }}
                     >
                       <div className="scale-75">
                         {renderGridIcon(item.type)}
                       </div>
                       
                       {/* KW DISPLAY */}
                       <div className={`absolute bottom-0 left-0 w-full text-[8px] font-bold text-center bg-black/70 backdrop-blur-sm py-0.5 ${def.type === 'gen' ? 'text-green-400' : def.type === 'load' ? 'text-red-400' : 'text-blue-400'}`}>
                          {item.type !== 'meter' ? `${Math.round(kwValue)} kW` : 'OPS'}
                       </div>

                       {item.locked && <span className="absolute top-0 right-0 text-[8px]">🔒</span>}
                       {(item.upgrades?.length || 0) > 0 && (
                         <div className="absolute top-0 left-0 flex p-0.5 gap-0.5">
                            {item.upgrades!.map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-yellow-400 border border-black" />)}
                         </div>
                       )}
                     </div>
                   );
                 })}
               </div>
            </div>

            {/* SIDEBAR */}
            <div className="w-80 bg-slate-900/95 backdrop-blur border-l border-slate-700 flex flex-col z-20">
              
              {/* METRICS */}
              <div className="p-4 border-b border-slate-700 bg-slate-800/30">
                <h3 className="text-xs font-bold text-slate-400 mb-2 uppercase">Real-time Load Balance</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-red-400 font-bold">LOAD</span>
                      <span className="text-green-400 font-bold">GEN</span>
                    </div>
                    <div className="h-4 bg-slate-800 rounded-full overflow-hidden flex relative border border-slate-600">
                      {/* Center Marker */}
                      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/30 z-10"></div>
                      
                      {/* Load Bar */}
                      <div 
                        className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500" 
                        style={{ width: `${Math.min(100, (calculateStats.totalLoad / (calculateStats.totalGen + calculateStats.totalLoad || 1)) * 100)}%` }} 
                      />
                      <div 
                        className="h-full bg-gradient-to-l from-green-600 to-green-400 flex-1 transition-all duration-500" 
                        // The rest is Gen
                      />
                    </div>
                    <div className="flex justify-between text-xs font-mono">
                      <span>{Math.round(calculateStats.totalLoad)} kW</span>
                      <span className={calculateStats.totalGen >= calculateStats.totalLoad ? "text-green-400" : "text-red-400"}>
                        {calculateStats.totalGen >= calculateStats.totalLoad ? "+" : ""}{Math.round(calculateStats.totalGen - calculateStats.totalLoad)} kW
                      </span>
                      <span>{Math.round(calculateStats.totalGen)} kW</span>
                    </div>
                  </div>

                  {/* BATTERY METER */}
                  <div className="space-y-1">
                     <div className="flex justify-between text-xs">
                        <span className="text-blue-300 font-bold flex items-center gap-1"><BatteryCharging size={12} /> STORAGE</span>
                        <span className="text-blue-300">{Math.round(state.batteryCharge)} / {Math.round(calculateStats.totalCapacity)} kWh</span>
                     </div>
                     <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-600">
                        <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${calculateStats.totalCapacity > 0 ? (state.batteryCharge / calculateStats.totalCapacity) * 100 : 0}%` }}></div>
                     </div>
                  </div>

                  {/* GRID STATUS INDICATOR */}
                  <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-bold uppercase">Connection</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded border ${calculateStats.isOffGrid ? 'bg-green-900/30 text-green-400 border-green-500/30' : 'bg-red-900/30 text-red-400 border-red-500/30'}`}>
                          {calculateStats.isOffGrid ? 'OFF-GRID' : 'ON-GRID'}
                      </span>
                  </div>

                  {calculateStats.synergyActive && (
                    <div className="bg-blue-900/30 border border-blue-500/30 p-2 rounded text-xs text-blue-200 text-center animate-pulse">
                      ⚡ Hybrid Synergy Active (+10%)
                    </div>
                  )}
                </div>
              </div>

              {/* TOOLS */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 grid-scroll">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 mb-2 uppercase">Construction</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.values(ELEMENTS) as ElementDef[])
                        // Filter out UTIL and LOAD (Consumers). User can only build Gen/Store.
                        // Allow UTIL construction if any exist (e.g. meter is util but we filter it by ID)
                        .filter(e => e.type !== 'load' && e.id !== 'meter')
                        .map(el => (
                      <button
                        key={el.id}
                        onClick={() => { setState(s => ({...s, selectedTool: el.id as ElementType})); playSound('click'); }}
                        onMouseEnter={() => setHoveredTool(el.id)}
                        onMouseLeave={() => setHoveredTool(null)}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${state.selectedTool === el.id ? 'bg-blue-600 border-blue-400 shadow-lg scale-105' : 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-500'}`}
                      >
                        <span className="text-2xl">{el.icon}</span>
                        <span className="text-xs font-bold text-center">{el.name}</span>
                        <span className="text-[10px] bg-slate-900/50 px-2 py-0.5 rounded text-green-400">${el.cost}</span>
                      </button>
                    ))}
                    
                    <button
                      onClick={() => { setState(s => ({...s, selectedTool: 'delete'})); playSound('click'); }}
                      onMouseEnter={() => setHoveredTool(null)}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${state.selectedTool === 'delete' ? 'bg-red-600 border-red-400 shadow-lg scale-105' : 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-500'}`}
                    >
                      <Trash2 size={24} />
                      <span className="text-xs font-bold">Demolish</span>
                      <span className="text-[10px] text-gray-500">Refund 50%</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ACTION */}
              <div className="p-4 border-t border-slate-700 bg-slate-800/50">
                <button 
                  onClick={() => { playSound('click'); handleNextMonth(); }}
                  className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                  NEXT MONTH <ArrowRight size={20} />
                </button>
              </div>

            </div>
          </main>
        </>
      )}

      {/* --- MODALS & OVERLAYS --- */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      
      {state.screen === 'game' && state.inspectedItemId && (
        <UpgradeModal 
          item={state.gridItems.find(i => i.id === state.inspectedItemId)!} 
          credits={state.credits}
          onClose={() => setState(s => ({...s, inspectedItemId: null}))}
          onUpgrade={applyUpgrade}
          onSell={sellUpgrade}
          playSound={playSound}
        />
      )}

      {state.screen === 'quiz' && state.currentQuiz && (
        <QuizModal 
          question={state.currentQuiz} 
          onAnswer={handleQuizAnswer}
          playSound={playSound}
        />
      )}

      {state.screen === 'report' && (
        <MonthlyReport 
          state={state} 
          onContinue={handleReportContinue} 
          playSound={playSound}
          showToast={showToast}
        />
      )}

      {state.screen === 'gameover' && (
        <EndGameScreen 
          type="gameover" 
          stats={{ score: state.score, credits: state.credits, scenario: state.scenario === 'urban' ? 'Urban' : 'Rural' }} 
          onSaveScore={saveScore}
          onRestart={() => setState(s => ({...s, screen: 'menu'}))} 
        />
      )}

      {state.screen === 'victory' && (
        <EndGameScreen 
          type="victory" 
          stats={{ score: state.score, credits: state.credits, scenario: state.scenario === 'urban' ? 'Urban' : 'Rural' }} 
          onSaveScore={saveScore}
          onRestart={() => setState(s => ({...s, screen: 'menu'}))} 
        />
      )}

      {state.tutorialStep > 0 && (
        <TutorialOverlay 
          step={state.tutorialStep} 
          onNext={() => setState(prev => ({...prev, tutorialStep: prev.tutorialStep + 1 > 5 ? 0 : prev.tutorialStep + 1}))} 
        />
      )}

    </div>
  );
}