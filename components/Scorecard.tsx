
import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Users, 
  Plus, 
  Trash2, 
  Activity, 
  AlertCircle, 
  Medal, 
  Zap,
  PlayCircle,
  RotateCcw,
  Target,
  ArrowRightLeft
} from 'lucide-react';

// --- Types ---

interface BattingEntry {
  id: string;
  name: string;
  runs: number | '';
  balls: number | '';
  fours: number | '';
  sixes: number | '';
  howOut: string;
}

interface BowlingEntry {
  id: string;
  name: string;
  overs: number | '';
  maidens: number | '';
  runs: number | '';
  wickets: number | '';
  extras: number | '';
}

interface Innings {
  batting: BattingEntry[];
  bowling: BowlingEntry[];
  extras: number | '';
  // Derived / Calculated
  totalRuns: number;
  wickets: number;
  overs: number;
}

interface MatchInfo {
  teamAName: string;
  teamBName: string;
  tossResult: string;
  matchResult: string;
  date: string;
  venue: string;
}

interface ScorecardData {
  matchInfo: MatchInfo;
  innings: [Innings, Innings];
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface LiveState {
  strikerId: string;
  nonStrikerId: string;
  bowlerId: string;
}

const Scorecard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<0 | 1 | 2>(0);
  const [showSummary, setShowSummary] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  
  // Live Scoring State
  const [liveState, setLiveState] = useState<LiveState>({
    strikerId: '',
    nonStrikerId: '',
    bowlerId: ''
  });

  const [data, setData] = useState<ScorecardData>({
    matchInfo: {
      teamAName: 'Indian Strikers',
      teamBName: 'Opponent',
      tossResult: '',
      matchResult: '',
      date: new Date().toISOString().split('T')[0],
      venue: 'RCA-1'
    },
    innings: [
      {
        batting: [{ id: '1', name: '', runs: 0, balls: 0, fours: 0, sixes: 0, howOut: '' }, { id: '2', name: '', runs: 0, balls: 0, fours: 0, sixes: 0, howOut: '' }],
        bowling: [{ id: '1', name: '', overs: 0, maidens: 0, runs: 0, wickets: 0, extras: 0 }],
        extras: 0,
        totalRuns: 0,
        wickets: 0,
        overs: 0
      },
      {
        batting: [{ id: '1', name: '', runs: 0, balls: 0, fours: 0, sixes: 0, howOut: '' }, { id: '2', name: '', runs: 0, balls: 0, fours: 0, sixes: 0, howOut: '' }],
        bowling: [{ id: '1', name: '', overs: 0, maidens: 0, runs: 0, wickets: 0, extras: 0 }],
        extras: 0,
        totalRuns: 0,
        wickets: 0,
        overs: 0
      }
    ]
  });

  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, errors: [] });

  // --- Helpers ---
  const getCurrentInningsIndex = (): 0 | 1 => {
     // If tab 0 (Match Info) is selected, default to 1st innings for live view, else use tab
     if (activeTab === 0) return 0;
     return activeTab === 1 ? 0 : 1;
  };

  const getOversFromBalls = (balls: number) => {
    return Math.floor(balls / 6) + (balls % 6) / 10;
  };

  const addBallsToOvers = (currentOvers: number | '', ballsToAdd: number): number => {
    const ov = Number(currentOvers || 0);
    const totalBalls = Math.floor(ov) * 6 + Math.round((ov % 1) * 10) + ballsToAdd;
    return getOversFromBalls(totalBalls);
  };

  // --- Auto-Calculation Logic ---
  const calculateInningsTotals = (inning: Innings): Innings => {
    // Total Runs = Sum(Batter Runs) + Extras
    const batRuns = inning.batting.reduce((sum, b) => sum + Number(b.runs || 0), 0);
    const extras = Number(inning.extras || 0);
    const totalRuns = batRuns + extras;

    // Wickets = Count of How Out (not empty and not 'not out'/'retired')
    const wickets = inning.batting.filter(b => {
      if (!b.howOut) return false;
      const val = b.howOut.toLowerCase();
      return !val.includes('not out') && !val.includes('retired');
    }).length;

    // Overs = Sum of bowling overs
    const totalBalls = inning.bowling.reduce((sum, b) => {
        const ov = Number(b.overs || 0);
        const integerPart = Math.floor(ov);
        const decimalPart = Math.round((ov - integerPart) * 10);
        return sum + integerPart * 6 + decimalPart;
    }, 0);
    const totalOvers = getOversFromBalls(totalBalls);

    return {
      ...inning,
      totalRuns,
      wickets,
      overs: totalOvers
    };
  };

  const updateData = (newData: ScorecardData) => {
      const updatedInnings = newData.innings.map(ing => calculateInningsTotals(ing)) as [Innings, Innings];
      const validatedData = { ...newData, innings: updatedInnings };
      setData(validatedData);
      validateScorecard(validatedData);
  };

  const validateScorecard = (currentData: ScorecardData) => {
    const errors: string[] = [];
    currentData.innings.forEach((ing, index) => {
       const innName = index === 0 ? '1st Innings' : '2nd Innings';
       const bowlingWickets = ing.bowling.reduce((sum, b) => sum + Number(b.wickets || 0), 0);
       
       if (bowlingWickets > ing.wickets) {
         errors.push(`${innName}: Bowlers credited with ${bowlingWickets} wickets, but only ${ing.wickets} fell.`);
       }
    });

    setValidation({
      isValid: errors.length === 0,
      errors
    });
  };

  // --- Live Scoring Handlers ---
  
  const handleScoreBall = (runs: number, isWide: boolean, isNoBall: boolean, isWicket: boolean) => {
    const innIdx = getCurrentInningsIndex();
    const newInnings = [...data.innings];
    const currentInning = newInnings[innIdx];
    
    // 1. Validate Selections
    if (!liveState.strikerId || !liveState.nonStrikerId || !liveState.bowlerId) {
      alert("Please select Striker, Non-Striker and Bowler first.");
      return;
    }

    const strikerIdx = currentInning.batting.findIndex(p => p.id === liveState.strikerId);
    const bowlerIdx = currentInning.bowling.findIndex(p => p.id === liveState.bowlerId);

    if (strikerIdx === -1 || bowlerIdx === -1) return;

    const striker = { ...currentInning.batting[strikerIdx] };
    const bowler = { ...currentInning.bowling[bowlerIdx] };

    // 2. Update Stats
    let runsScored = runs;
    let extraRuns = 0;
    let validBall = true;

    if (isWide) {
      extraRuns += 1 + runs; // Standard: Wide + any runs run
      validBall = false;
    } else if (isNoBall) {
      extraRuns += 1;
      runsScored = runs; // Runs off bat count for batter in many formats, or just extras. Assuming off bat here for simplicity if runs > 0
      // Actually standard scoring: Runs off bat count to batter, NB extra counts to team.
      validBall = false;
    }

    // Update Striker
    if (!isWide) {
       striker.runs = Number(striker.runs || 0) + runsScored;
       striker.balls = Number(striker.balls || 0) + 1;
       if (runsScored === 4) striker.fours = Number(striker.fours || 0) + 1;
       if (runsScored === 6) striker.sixes = Number(striker.sixes || 0) + 1;
    }

    // Update Bowler
    bowler.runs = Number(bowler.runs || 0) + runsScored + extraRuns;
    if (validBall) {
       bowler.overs = addBallsToOvers(bowler.overs, 1);
    }
    if (isWicket && !isNoBall) { // Run out counts as wicket but not to bowler usually, simplifying here
       bowler.wickets = Number(bowler.wickets || 0) + 1;
    }
    if (extraRuns > 0) {
       bowler.extras = Number(bowler.extras || 0) + extraRuns;
    }

    // Update Extras Total
    if (extraRuns > 0) {
      currentInning.extras = Number(currentInning.extras || 0) + extraRuns;
    }

    // Wicket Logic
    if (isWicket) {
      striker.howOut = "Out"; // Generic, user can edit later
      setLiveState(prev => ({ ...prev, strikerId: '' })); // Deselect striker
    }

    // Apply changes
    currentInning.batting[strikerIdx] = striker;
    currentInning.bowling[bowlerIdx] = bowler;

    // 3. Swap Ends Logic
    // Swap if runs are odd (1, 3, 5) AND it's not the end of an over (unless over + odd runs?)
    // Actually, handling end of over swap is separate.
    // For specific ball:
    if (runsScored % 2 !== 0) {
       setLiveState(prev => ({
         ...prev,
         strikerId: prev.nonStrikerId,
         nonStrikerId: prev.strikerId
       }));
    }

    newInnings[innIdx] = currentInning;
    updateData({ ...data, innings: newInnings as [Innings, Innings] });
  };

  // --- Manual Table Handlers ---
  const handleMatchInfoChange = (field: keyof MatchInfo, value: string) => {
    updateData({ ...data, matchInfo: { ...data.matchInfo, [field]: value } });
  };

  const updateBatting = (innIdx: 0 | 1, pIdx: number, field: keyof BattingEntry, value: string | number) => {
    const newInnings = [...data.innings];
    const newBatting = [...newInnings[innIdx].batting];
    newBatting[pIdx] = { ...newBatting[pIdx], [field]: value };
    newInnings[innIdx] = { ...newInnings[innIdx], batting: newBatting };
    updateData({ ...data, innings: newInnings as [Innings, Innings] });
  };

  const updateBowling = (innIdx: 0 | 1, pIdx: number, field: keyof BowlingEntry, value: string | number) => {
    const newInnings = [...data.innings];
    const newBowling = [...newInnings[innIdx].bowling];
    newBowling[pIdx] = { ...newBowling[pIdx], [field]: value };
    newInnings[innIdx] = { ...newInnings[innIdx], bowling: newBowling };
    updateData({ ...data, innings: newInnings as [Innings, Innings] });
  };

  const updateExtras = (innIdx: 0 | 1, value: string) => {
    const newInnings = [...data.innings];
    newInnings[innIdx] = { ...newInnings[innIdx], extras: Number(value) || '' };
    updateData({ ...data, innings: newInnings as [Innings, Innings] });
  };
  
  const addBatter = (innIdx: 0 | 1) => {
    const newInnings = [...data.innings];
    newInnings[innIdx].batting.push({ 
      id: Date.now().toString(), name: '', runs: '', balls: '', fours: '', sixes: '', howOut: '' 
    });
    updateData({ ...data, innings: newInnings as [Innings, Innings] });
  };

  const addBowler = (innIdx: 0 | 1) => {
    const newInnings = [...data.innings];
    newInnings[innIdx].bowling.push({ 
      id: Date.now().toString(), name: '', overs: '', maidens: '', runs: '', wickets: '', extras: '' 
    });
    updateData({ ...data, innings: newInnings as [Innings, Innings] });
  };

  const deleteBatter = (innIdx: 0 | 1, pIdx: number) => {
    const newInnings = [...data.innings];
    newInnings[innIdx].batting.splice(pIdx, 1);
    updateData({ ...data, innings: newInnings as [Innings, Innings] });
  };

  const deleteBowler = (innIdx: 0 | 1, pIdx: number) => {
    const newInnings = [...data.innings];
    newInnings[innIdx].bowling.splice(pIdx, 1);
    updateData({ ...data, innings: newInnings as [Innings, Innings] });
  };

  // --- Summary Generation ---
  const getSummary = () => {
    let topBatter = { name: 'N/A', runs: -1, label: '' };
    let topBowler = { name: 'N/A', wickets: -1, label: '' };
    let mvp = { name: 'N/A', points: -1 };

    data.innings.forEach(ing => {
      // Batters
      ing.batting.forEach(b => {
        const r = Number(b.runs || 0);
        const balls = Number(b.balls || 0);
        const sr = balls > 0 ? (r / balls) * 100 : 0;
        
        if (r > topBatter.runs || (r === topBatter.runs && sr > 0)) { // Simple tie break
          topBatter = { name: b.name || 'Unknown', runs: r, label: `${r} (${balls})` };
        }

        const pts = r; // Simple points
        if (pts > mvp.points) mvp = { name: b.name || 'Unknown', points: pts };
      });

      // Bowlers
      ing.bowling.forEach(b => {
        const w = Number(b.wickets || 0);
        const r = Number(b.runs || 0);
        const o = Number(b.overs || 0);
        const eco = o > 0 ? r / o : 0;

        if (w > topBowler.wickets || (w === topBowler.wickets && eco < 999)) {
           topBowler = { name: b.name || 'Unknown', wickets: w, label: `${w}/${r}` };
        }

        const pts = w * 20; // 20 pts per wicket
        if (pts > mvp.points) mvp = { name: b.name || 'Unknown', points: pts };
      });
    });

    return { topBatter, topBowler, mvp };
  };

  const summary = getSummary();
  const currentInningsIdx = getCurrentInningsIndex();
  const currentInningsData = data.innings[currentInningsIdx];
  const battingTeamName = currentInningsIdx === 0 ? data.matchInfo.teamAName : data.matchInfo.teamBName;

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Match Scorecard</h2>
          <p className="text-slate-500">Manage live scores and generate reports</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setIsLiveMode(!isLiveMode)}
             className={`px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-lg transition-colors ${isLiveMode ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-600 text-white hover:bg-green-700'}`}
           >
             {isLiveMode ? <RotateCcw size={18} /> : <PlayCircle size={18} />} 
             {isLiveMode ? 'Exit Live Mode' : 'Start Live Scoring'}
           </button>
           <button 
             onClick={() => setShowSummary(true)}
             className="bg-slate-800 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-lg hover:bg-slate-700 transition-colors"
           >
             <Trophy size={18} /> Generate Summary
           </button>
        </div>
      </div>

      {!validation.isValid && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3 animate-fade-in">
           <AlertCircle className="text-red-500 shrink-0 mt-0.5" />
           <div>
             <h4 className="font-bold text-red-700 text-sm">Scorecard Validation Failed</h4>
             <ul className="list-disc list-inside text-xs text-red-600 mt-1">
               {validation.errors.map((err, i) => <li key={i}>{err}</li>)}
             </ul>
           </div>
        </div>
      )}

      {/* Tabs - Hidden in Live Mode for focus */}
      {!isLiveMode && (
        <div className="flex gap-2 p-1 bg-white rounded-xl border border-slate-100 w-full md:w-auto overflow-x-auto">
          <button 
            onClick={() => setActiveTab(0)}
            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 0 ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Match Info
          </button>
          <button 
            onClick={() => setActiveTab(1)}
            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 1 ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            1st Innings
          </button>
          <button 
            onClick={() => setActiveTab(2)}
            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 2 ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            2nd Innings
          </button>
        </div>
      )}

      {/* LIVE SCORING INTERFACE */}
      {isLiveMode ? (
        <div className="animate-fade-in grid gap-6 lg:grid-cols-3">
            {/* Center: Scoreboard & Controls */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Score Header */}
                <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={100} /></div>
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 bg-red-600 text-[10px] font-bold uppercase rounded animate-pulse">Live</span>
                                <h3 className="font-bold text-slate-300 uppercase tracking-widest text-sm">{battingTeamName}</h3>
                            </div>
                            <div className="text-6xl font-black tracking-tighter">
                                {currentInningsData.totalRuns}<span className="text-slate-500 text-4xl">/{currentInningsData.wickets}</span>
                            </div>
                            <p className="text-slate-400 font-mono mt-1">Overs: <span className="text-white font-bold">{currentInningsData.overs}</span></p>
                        </div>
                        <div className="text-right">
                           <div className="mb-4">
                               <p className="text-xs text-slate-400 uppercase">CRR</p>
                               <p className="text-2xl font-bold">{(currentInningsData.totalRuns / (Math.max(0.1, currentInningsData.overs))).toFixed(2)}</p>
                           </div>
                           <div className="bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                               <p className="text-xs text-slate-400 uppercase">Extras</p>
                               <p className="text-xl font-bold">{currentInningsData.extras}</p>
                           </div>
                        </div>
                    </div>
                </div>

                {/* Active Players Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Batters */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-1"><Users size={12}/> Batting</h4>
                        
                        {/* Striker Selector */}
                        <div className={`p-3 rounded-xl border-2 mb-2 transition-all ${liveState.strikerId ? 'border-blue-500 bg-blue-50' : 'border-dashed border-slate-200'}`}>
                           <div className="flex justify-between items-center mb-1">
                               <span className="text-[10px] font-bold uppercase text-blue-600">Striker</span>
                               {liveState.strikerId && <Target size={12} className="text-blue-600" />}
                           </div>
                           <select 
                             className="w-full bg-transparent font-bold text-slate-800 outline-none"
                             value={liveState.strikerId}
                             onChange={(e) => setLiveState(prev => ({ ...prev, strikerId: e.target.value }))}
                           >
                             <option value="">Select Striker...</option>
                             {currentInningsData.batting.map(b => (
                               <option key={b.id} value={b.id} disabled={b.howOut !== '' || b.id === liveState.nonStrikerId}>
                                 {b.name || 'Unknown'} {b.runs !== '' ? `(${b.runs} off ${b.balls})` : '(0 off 0)'}
                               </option>
                             ))}
                           </select>
                           {liveState.strikerId && (
                             <div className="mt-1 flex gap-3 text-xs text-slate-500">
                               <span><b className="text-slate-800">{currentInningsData.batting.find(b => b.id === liveState.strikerId)?.runs || 0}</b> runs</span>
                               <span><b className="text-slate-800">{currentInningsData.batting.find(b => b.id === liveState.strikerId)?.balls || 0}</b> balls</span>
                             </div>
                           )}
                        </div>

                        {/* Non-Striker Selector */}
                        <div className={`p-3 rounded-xl border-2 transition-all ${liveState.nonStrikerId ? 'border-slate-200 bg-slate-50' : 'border-dashed border-slate-200'}`}>
                           <div className="flex justify-between items-center mb-1">
                               <span className="text-[10px] font-bold uppercase text-slate-400">Non-Striker</span>
                           </div>
                           <select 
                             className="w-full bg-transparent font-bold text-slate-600 outline-none"
                             value={liveState.nonStrikerId}
                             onChange={(e) => setLiveState(prev => ({ ...prev, nonStrikerId: e.target.value }))}
                           >
                             <option value="">Select Non-Striker...</option>
                             {currentInningsData.batting.map(b => (
                               <option key={b.id} value={b.id} disabled={b.howOut !== '' || b.id === liveState.strikerId}>
                                 {b.name || 'Unknown'} {b.runs !== '' ? `(${b.runs} off ${b.balls})` : '(0 off 0)'}
                               </option>
                             ))}
                           </select>
                           {liveState.nonStrikerId && (
                             <div className="mt-1 flex gap-3 text-xs text-slate-500">
                               <span><b>{currentInningsData.batting.find(b => b.id === liveState.nonStrikerId)?.runs || 0}</b> runs</span>
                               <span><b>{currentInningsData.batting.find(b => b.id === liveState.nonStrikerId)?.balls || 0}</b> balls</span>
                             </div>
                           )}
                        </div>
                        
                        <button 
                          onClick={() => setLiveState(prev => ({...prev, strikerId: prev.nonStrikerId, nonStrikerId: prev.strikerId}))}
                          className="w-full mt-2 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center gap-1"
                        >
                           <ArrowRightLeft size={12} /> Swap Ends
                        </button>
                    </div>

                    {/* Bowler */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col">
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-1"><Activity size={12}/> Bowling</h4>
                        
                         <div className={`p-3 rounded-xl border-2 flex-1 mb-2 transition-all ${liveState.bowlerId ? 'border-red-500 bg-red-50' : 'border-dashed border-slate-200'}`}>
                           <div className="flex justify-between items-center mb-1">
                               <span className="text-[10px] font-bold uppercase text-red-600">Current Bowler</span>
                           </div>
                           <select 
                             className="w-full bg-transparent font-bold text-slate-800 outline-none"
                             value={liveState.bowlerId}
                             onChange={(e) => setLiveState(prev => ({ ...prev, bowlerId: e.target.value }))}
                           >
                             <option value="">Select Bowler...</option>
                             {currentInningsData.bowling.map(b => (
                               <option key={b.id} value={b.id}>{b.name || 'Unknown'}</option>
                             ))}
                           </select>
                           {liveState.bowlerId && (
                             <div className="mt-2 grid grid-cols-4 gap-1 text-center">
                               <div className="bg-white p-1 rounded border border-red-100">
                                  <div className="text-[8px] uppercase text-slate-400">O</div>
                                  <div className="font-bold text-sm">{currentInningsData.bowling.find(b => b.id === liveState.bowlerId)?.overs}</div>
                               </div>
                               <div className="bg-white p-1 rounded border border-red-100">
                                  <div className="text-[8px] uppercase text-slate-400">M</div>
                                  <div className="font-bold text-sm">{currentInningsData.bowling.find(b => b.id === liveState.bowlerId)?.maidens}</div>
                               </div>
                               <div className="bg-white p-1 rounded border border-red-100">
                                  <div className="text-[8px] uppercase text-slate-400">R</div>
                                  <div className="font-bold text-sm">{currentInningsData.bowling.find(b => b.id === liveState.bowlerId)?.runs}</div>
                               </div>
                               <div className="bg-white p-1 rounded border border-red-100">
                                  <div className="text-[8px] uppercase text-slate-400">W</div>
                                  <div className="font-bold text-sm">{currentInningsData.bowling.find(b => b.id === liveState.bowlerId)?.wickets}</div>
                               </div>
                             </div>
                           )}
                        </div>
                    </div>
                </div>

                {/* Keypad */}
                <div className="grid grid-cols-4 gap-3">
                   {[0, 1, 2, 3].map(run => (
                     <button key={run} onClick={() => handleScoreBall(run, false, false, false)} className="h-16 rounded-xl bg-white border-b-4 border-slate-200 active:border-b-0 active:translate-y-1 font-black text-2xl text-slate-700 hover:bg-slate-50 shadow-sm transition-all">
                       {run}
                     </button>
                   ))}
                   <button onClick={() => handleScoreBall(4, false, false, false)} className="h-16 rounded-xl bg-blue-600 border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 font-black text-2xl text-white shadow-lg shadow-blue-500/30 transition-all">
                     4
                   </button>
                   <button onClick={() => handleScoreBall(6, false, false, false)} className="h-16 rounded-xl bg-purple-600 border-b-4 border-purple-800 active:border-b-0 active:translate-y-1 font-black text-2xl text-white shadow-lg shadow-purple-500/30 transition-all">
                     6
                   </button>
                   <button onClick={() => handleScoreBall(0, false, false, true)} className="col-span-2 h-16 rounded-xl bg-red-600 border-b-4 border-red-800 active:border-b-0 active:translate-y-1 font-black text-xl text-white shadow-lg shadow-red-500/30 transition-all flex items-center justify-center gap-2">
                     OUT <Target size={20}/>
                   </button>
                   
                   <button onClick={() => handleScoreBall(0, true, false, false)} className="h-12 rounded-xl bg-orange-100 text-orange-700 font-bold hover:bg-orange-200">
                     WD
                   </button>
                   <button onClick={() => handleScoreBall(0, false, true, false)} className="h-12 rounded-xl bg-orange-100 text-orange-700 font-bold hover:bg-orange-200">
                     NB
                   </button>
                   <button onClick={() => handleScoreBall(1, true, false, false)} className="h-12 rounded-xl bg-orange-100 text-orange-700 font-bold hover:bg-orange-200 text-xs">
                     WD+1
                   </button>
                   <button onClick={() => handleScoreBall(1, false, true, false)} className="h-12 rounded-xl bg-orange-100 text-orange-700 font-bold hover:bg-orange-200 text-xs">
                     NB+1
                   </button>
                </div>
            </div>

            {/* Right: Roster Management for Live */}
            <div className="space-y-6">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 h-full flex flex-col">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
                       <span>Quick Roster</span>
                       <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Current Innings</span>
                    </h3>
                    
                    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                        <div>
                           <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-bold text-slate-400 uppercase">Batters</span>
                              <button onClick={() => addBatter(currentInningsIdx)} className="p-1 text-blue-600 bg-blue-50 rounded hover:bg-blue-100"><Plus size={14}/></button>
                           </div>
                           <div className="space-y-1">
                              {currentInningsData.batting.map((b, i) => (
                                <div key={b.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg text-sm">
                                   <input 
                                     value={b.name}
                                     onChange={(e) => updateBatting(currentInningsIdx, i, 'name', e.target.value)}
                                     className="bg-transparent w-full outline-none font-medium" 
                                     placeholder="Batter Name"
                                   />
                                   {b.howOut && <span className="text-[10px] text-red-500 font-bold px-1 bg-red-50 rounded">OUT</span>}
                                   <div className="text-right text-xs font-mono text-slate-500 min-w-[40px]">{b.runs}({b.balls})</div>
                                </div>
                              ))}
                           </div>
                        </div>

                        <div>
                           <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-bold text-slate-400 uppercase">Bowlers</span>
                              <button onClick={() => addBowler(currentInningsIdx)} className="p-1 text-blue-600 bg-blue-50 rounded hover:bg-blue-100"><Plus size={14}/></button>
                           </div>
                           <div className="space-y-1">
                              {currentInningsData.bowling.map((b, i) => (
                                <div key={b.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg text-sm">
                                   <input 
                                     value={b.name}
                                     onChange={(e) => updateBowling(currentInningsIdx, i, 'name', e.target.value)}
                                     className="bg-transparent w-full outline-none font-medium" 
                                     placeholder="Bowler Name"
                                   />
                                   <div className="text-right text-xs font-mono text-slate-500 min-w-[50px]">{b.wickets}-{b.runs}</div>
                                </div>
                              ))}
                           </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 min-h-[500px] overflow-hidden">
        
        {/* MATCH INFO TAB */}
        {activeTab === 0 && (
          <div className="p-8 animate-fade-in">
             <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
               <Activity className="text-blue-500" /> Match Details
             </h3>
             <div className="grid md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Home Team</label>
                   <input 
                     value={data.matchInfo.teamAName}
                     onChange={(e) => handleMatchInfoChange('teamAName', e.target.value)}
                     className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:border-blue-500 outline-none transition-colors"
                     placeholder="Team A Name"
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Away Team</label>
                   <input 
                     value={data.matchInfo.teamBName}
                     onChange={(e) => handleMatchInfoChange('teamBName', e.target.value)}
                     className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:border-blue-500 outline-none transition-colors"
                     placeholder="Team B Name"
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Toss Result</label>
                   <input 
                     value={data.matchInfo.tossResult}
                     onChange={(e) => handleMatchInfoChange('tossResult', e.target.value)}
                     className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-blue-500 outline-none"
                     placeholder="e.g. Strikers won toss and elected to bat"
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Venue</label>
                   <input 
                     value={data.matchInfo.venue}
                     onChange={(e) => handleMatchInfoChange('venue', e.target.value)}
                     className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-blue-500 outline-none"
                   />
                </div>
                <div className="md:col-span-2">
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Match Outcome</label>
                   <textarea 
                     value={data.matchInfo.matchResult}
                     onChange={(e) => handleMatchInfoChange('matchResult', e.target.value)}
                     className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-blue-500 outline-none h-24 resize-none"
                     placeholder="e.g. Indian Strikers won by 24 runs"
                   />
                </div>
             </div>
          </div>
        )}

        {/* INNINGS TABS */}
        {(activeTab === 1 || activeTab === 2) && (
          <div className="animate-fade-in">
            {(() => {
              const innIdx = activeTab === 1 ? 0 : 1;
              const inning = data.innings[innIdx];
              const battingTeam = innIdx === 0 ? data.matchInfo.teamAName : data.matchInfo.teamBName;
              
              return (
                <div>
                  {/* Score Header */}
                  <div className="bg-slate-900 text-white p-6 flex justify-between items-end">
                    <div>
                      <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">{battingTeam} Batting</h3>
                      <div className="text-4xl font-black font-mono">
                        {inning.totalRuns}/{inning.wickets}
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Overs</p>
                       <p className="text-2xl font-bold">{inning.overs}</p>
                    </div>
                  </div>

                  <div className="p-6 space-y-8">
                    {/* Batting Table */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                         <h4 className="font-bold text-slate-700 flex items-center gap-2"><Users size={18} /> Batting Card</h4>
                         <button onClick={() => addBatter(innIdx)} className="text-blue-600 text-xs font-bold hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                           <Plus size={14} /> Add Batter
                         </button>
                      </div>
                      <div className="overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                            <tr>
                              <th className="p-3 w-8">#</th>
                              <th className="p-3 min-w-[150px]">Batter</th>
                              <th className="p-3 min-w-[150px]">Dismissal</th>
                              <th className="p-3 w-16 text-center">R</th>
                              <th className="p-3 w-16 text-center">B</th>
                              <th className="p-3 w-16 text-center">4s</th>
                              <th className="p-3 w-16 text-center">6s</th>
                              <th className="p-3 w-10"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {inning.batting.map((b, i) => (
                              <tr key={b.id} className="group hover:bg-slate-50/50">
                                <td className="p-3 text-slate-400 font-mono text-xs">{i + 1}</td>
                                <td className="p-3">
                                  <input 
                                    value={b.name} 
                                    onChange={(e) => updateBatting(innIdx, i, 'name', e.target.value)}
                                    placeholder="Player Name"
                                    className="w-full bg-transparent font-semibold text-slate-800 outline-none placeholder-slate-300"
                                  />
                                </td>
                                <td className="p-3">
                                  <input 
                                    value={b.howOut} 
                                    onChange={(e) => updateBatting(innIdx, i, 'howOut', e.target.value)}
                                    placeholder="not out"
                                    className="w-full bg-transparent text-slate-600 outline-none placeholder-slate-300"
                                  />
                                </td>
                                <td className="p-3"><input type="number" value={b.runs} onChange={(e) => updateBatting(innIdx, i, 'runs', e.target.value)} className="w-full bg-transparent text-center font-bold text-slate-800 outline-none" /></td>
                                <td className="p-3"><input type="number" value={b.balls} onChange={(e) => updateBatting(innIdx, i, 'balls', e.target.value)} className="w-full bg-transparent text-center text-slate-600 outline-none" /></td>
                                <td className="p-3"><input type="number" value={b.fours} onChange={(e) => updateBatting(innIdx, i, 'fours', e.target.value)} className="w-full bg-transparent text-center text-slate-600 outline-none" /></td>
                                <td className="p-3"><input type="number" value={b.sixes} onChange={(e) => updateBatting(innIdx, i, 'sixes', e.target.value)} className="w-full bg-transparent text-center text-slate-600 outline-none" /></td>
                                <td className="p-3 text-center">
                                  <button onClick={() => deleteBatter(innIdx, i)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex justify-end mt-4 items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                         <span className="text-sm font-bold text-slate-500 uppercase">Extras</span>
                         <input 
                           type="number" 
                           value={inning.extras} 
                           onChange={(e) => updateExtras(innIdx, e.target.value)}
                           className="w-20 p-2 bg-white border border-slate-200 rounded-lg text-center font-bold outline-none focus:border-blue-500"
                           placeholder="0"
                         />
                      </div>
                    </div>

                    {/* Bowling Table */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                         <h4 className="font-bold text-slate-700 flex items-center gap-2"><Activity size={18} /> Bowling Card</h4>
                         <button onClick={() => addBowler(innIdx)} className="text-blue-600 text-xs font-bold hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                           <Plus size={14} /> Add Bowler
                         </button>
                      </div>
                      <div className="overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                            <tr>
                              <th className="p-3 min-w-[150px]">Bowler</th>
                              <th className="p-3 w-16 text-center">O</th>
                              <th className="p-3 w-16 text-center">M</th>
                              <th className="p-3 w-16 text-center">R</th>
                              <th className="p-3 w-16 text-center">W</th>
                              <th className="p-3 w-16 text-center">Ex</th>
                              <th className="p-3 w-10"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {inning.bowling.map((b, i) => (
                              <tr key={b.id} className="group hover:bg-slate-50/50">
                                <td className="p-3">
                                  <input 
                                    value={b.name} 
                                    onChange={(e) => updateBowling(innIdx, i, 'name', e.target.value)}
                                    placeholder="Bowler Name"
                                    className="w-full bg-transparent font-semibold text-slate-800 outline-none placeholder-slate-300"
                                  />
                                </td>
                                <td className="p-3"><input type="number" step="0.1" value={b.overs} onChange={(e) => updateBowling(innIdx, i, 'overs', e.target.value)} className="w-full bg-transparent text-center text-slate-600 outline-none" /></td>
                                <td className="p-3"><input type="number" value={b.maidens} onChange={(e) => updateBowling(innIdx, i, 'maidens', e.target.value)} className="w-full bg-transparent text-center text-slate-600 outline-none" /></td>
                                <td className="p-3"><input type="number" value={b.runs} onChange={(e) => updateBowling(innIdx, i, 'runs', e.target.value)} className="w-full bg-transparent text-center font-bold text-slate-800 outline-none" /></td>
                                <td className="p-3"><input type="number" value={b.wickets} onChange={(e) => updateBowling(innIdx, i, 'wickets', e.target.value)} className="w-full bg-transparent text-center font-bold text-blue-600 outline-none" /></td>
                                <td className="p-3"><input type="number" value={b.extras} onChange={(e) => updateBowling(innIdx, i, 'extras', e.target.value)} className="w-full bg-transparent text-center text-slate-600 outline-none" /></td>
                                <td className="p-3 text-center">
                                  <button onClick={() => deleteBowler(innIdx, i)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
        </div>
      )}

      {/* Summary Modal Overlay */}
      {showSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
             
             {/* Background Decoration */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
             
             <div className="relative p-8 text-center text-white">
                <h2 className="text-sm font-bold tracking-[0.3em] uppercase text-blue-300 mb-2">Match Result</h2>
                <h1 className="text-3xl font-black mb-8 leading-tight">
                  {data.matchInfo.matchResult || "Match In Progress"}
                </h1>

                <div className="grid grid-cols-3 gap-4 mb-8">
                   {/* Top Batter */}
                   <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col items-center">
                      <Zap className="text-yellow-400 mb-2" size={24} />
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Top Batter</p>
                      <p className="font-bold text-lg leading-none">{summary.topBatter.name}</p>
                      <p className="text-xs text-blue-300 mt-1">{summary.topBatter.label}</p>
                   </div>

                   {/* MVP - Featured Center */}
                   <div className="bg-gradient-to-b from-blue-600 to-indigo-700 rounded-2xl p-4 border border-blue-400/30 flex flex-col items-center shadow-lg transform scale-110 z-10">
                      <Medal className="text-white mb-2" size={32} />
                      <p className="text-[10px] text-blue-100 uppercase font-bold tracking-wider mb-1">MVP</p>
                      <p className="font-bold text-xl leading-none">{summary.mvp.name}</p>
                      <p className="text-xs text-blue-100 mt-1">{summary.mvp.points} Pts</p>
                   </div>

                   {/* Top Bowler */}
                   <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col items-center">
                      <Activity className="text-red-400 mb-2" size={24} />
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Top Bowler</p>
                      <p className="font-bold text-lg leading-none">{summary.topBowler.name}</p>
                      <p className="text-xs text-red-300 mt-1">{summary.topBowler.label}</p>
                   </div>
                </div>

                <div className="flex flex-col gap-3">
                   <button onClick={() => setShowSummary(false)} className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-colors">
                     Close Summary
                   </button>
                   <p className="text-[10px] text-slate-500 uppercase tracking-widest">Indian Strikers Management System</p>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scorecard;
    