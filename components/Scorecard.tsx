
import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Users, 
  Plus, 
  Trash2, 
  Activity, 
  AlertCircle, 
  Zap,
  Target,
  ArrowRightLeft,
  X,
  Save,
  Search,
  Check,
  Calendar
} from 'lucide-react';
import { OpponentTeam, Player, Match } from '../types';
import { useLocation } from 'react-router-dom';

// --- Types ---

const DISMISSAL_TYPES = [
  "Not Out",
  "Bowled",
  "Caught",
  "LBW",
  "Run Out",
  "Stumped",
  "Hit Wicket",
  "Retired Hurt",
  "Obstructing Field",
  "Timed Out"
];

interface BattingEntry {
  id: string;
  name: string;
  runs: number | '';
  balls: number | '';
  fours: number | '';
  sixes: number | '';
  howOut: string;
  fielder?: string;
  bowler?: string;
}

interface BowlingEntry {
  id: string;
  name: string;
  overs: number | '';
  maidens: number | '';
  runs: number | '';
  wickets: number | '';
  wides: number | '';
  noBalls: number | '';
  legByes: number | '';
  dots: number | '';
}

interface Innings {
  batting: BattingEntry[];
  bowling: BowlingEntry[];
  byeRuns: number; // Manual entry for Byes
  // Derived / Calculated
  extras: number;
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
  tournament: string;
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

interface ScorecardProps {
  opponents?: OpponentTeam[];
  players?: Player[];
  matches?: Match[];
}

const Scorecard: React.FC<ScorecardProps> = ({ opponents = [], players = [], matches = [] }) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<0 | 1 | 2>(0);
  const [showSummary, setShowSummary] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [playerSelector, setPlayerSelector] = useState<{ inningIdx: 0 | 1, type: 'batsman' | 'bowler' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Live Scoring State
  const [liveState, setLiveState] = useState<LiveState>({
    strikerId: '',
    nonStrikerId: '',
    bowlerId: ''
  });

  const [data, setData] = useState<ScorecardData>({
    matchInfo: {
      teamAName: 'Indian Strikers',
      teamBName: opponents.length > 0 ? opponents[0].name : 'Opponent',
      tossResult: '',
      matchResult: '',
      date: new Date().toISOString().split('T')[0],
      venue: 'RCA-1',
      tournament: ''
    },
    innings: [
      {
        batting: [{ id: '1', name: '', runs: 0, balls: 0, fours: 0, sixes: 0, howOut: '', fielder: '', bowler: '' }, { id: '2', name: '', runs: 0, balls: 0, fours: 0, sixes: 0, howOut: '', fielder: '', bowler: '' }],
        bowling: [{ id: '1', name: '', overs: 0, maidens: 0, runs: 0, wickets: 0, wides: 0, noBalls: 0, legByes: 0, dots: 0 }],
        byeRuns: 0,
        extras: 0,
        totalRuns: 0,
        wickets: 0,
        overs: 0
      },
      {
        batting: [{ id: '1', name: '', runs: 0, balls: 0, fours: 0, sixes: 0, howOut: '', fielder: '', bowler: '' }, { id: '2', name: '', runs: 0, balls: 0, fours: 0, sixes: 0, howOut: '', fielder: '', bowler: '' }],
        bowling: [{ id: '1', name: '', overs: 0, maidens: 0, runs: 0, wickets: 0, wides: 0, noBalls: 0, legByes: 0, dots: 0 }],
        byeRuns: 0,
        extras: 0,
        totalRuns: 0,
        wickets: 0,
        overs: 0
      }
    ]
  });

  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, errors: [] });

  useEffect(() => {
    // Check if a match was passed via navigation
    if (location.state && location.state.match) {
        loadMatchData(location.state.match);
        setActiveTab(2); // Switch to Match Info tab
    }
  }, [location.state]);

  const loadMatchData = (match: Match) => {
    setData(prev => ({
        ...prev,
        matchInfo: {
            ...prev.matchInfo,
            teamAName: 'Indian Strikers',
            teamBName: match.opponent,
            venue: match.venue,
            date: match.date,
            tournament: match.tournament || '',
        }
    }));
  };

  const handleSelectScheduledMatch = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const matchId = e.target.value;
      if (!matchId) return;
      
      const match = matches.find(m => m.id === matchId);
      if (match) {
          loadMatchData(match);
      }
  };

  // Ground options RCA-1 to RCA-15
  const groundOptions = Array.from({ length: 15 }, (_, i) => `RCA-${i + 1}`);

  // --- Helpers ---
  const getCurrentInningsIndex = (): 0 | 1 => {
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

  const getStrikeRate = (runs: number | '', balls: number | '') => {
    const r = Number(runs || 0);
    const b = Number(balls || 0);
    if (b === 0) return '0.00';
    return ((r / b) * 100).toFixed(2);
  };

  const getEconomy = (runs: number | '', overs: number | '') => {
    const r = Number(runs || 0);
    const o = Number(overs || 0);
    if (o === 0) return '0.00';
    const totalBalls = Math.floor(o) * 6 + Math.round((o % 1) * 10);
    if (totalBalls === 0) return '0.00';
    const trueOvers = totalBalls / 6;
    return (r / trueOvers).toFixed(2);
  };

  // --- Helper to get team players ---
  const getTeamPlayers = (teamName: string) => {
    // Check if it's our team
    if (teamName === 'Indian Strikers') {
      return players.map(p => ({ id: p.id, name: p.name }));
    }
    // Check if it's an opponent
    const opponent = opponents.find(op => op.name === teamName);
    if (opponent) {
      return opponent.players.map(p => ({ id: p.id, name: p.name }));
    }
    return [];
  };

  const getBattingTeamPlayers = (inningIdx: 0 | 1) => {
     if (inningIdx === 0) return getTeamPlayers(data.matchInfo.teamAName);
     return getTeamPlayers(data.matchInfo.teamBName);
  };

  const getBowlingTeamPlayers = (inningIdx: 0 | 1) => {
    if (inningIdx === 0) return getTeamPlayers(data.matchInfo.teamBName);
    return getTeamPlayers(data.matchInfo.teamAName);
  };

  // --- Auto-Calculation Logic ---
  const calculateInningsTotals = (inning: Innings): Innings => {
    const batRuns = inning.batting.reduce((sum, b) => sum + Number(b.runs || 0), 0);
    
    // Calculate Extras
    // Wides (From Bowling Card)
    const wides = inning.bowling.reduce((sum, b) => sum + Number(b.wides || 0), 0);
    // No Balls (From Bowling Card)
    const noBalls = inning.bowling.reduce((sum, b) => sum + Number(b.noBalls || 0), 0);
    // Leg Byes (From Bowling Card)
    const legByes = inning.bowling.reduce((sum, b) => sum + Number(b.legByes || 0), 0);
    // Byes (Manual Input in Extras Box)
    const byes = Number(inning.byeRuns || 0);
    
    const calculatedExtras = wides + noBalls + legByes + byes;
    const totalRuns = batRuns + calculatedExtras;

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
      extras: calculatedExtras,
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
  
  const handleScoreBall = (runs: number, isWide: boolean, isNoBall: boolean, isWicket: boolean, isBye: boolean = false, isLegBye: boolean = false) => {
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
    let validBall = true;
    let isDot = runs === 0 && !isWide && !isNoBall && !isBye && !isLegBye;

    if (isWide) {
      bowler.wides = Number(bowler.wides || 0) + 1 + runs; 
      bowler.runs = Number(bowler.runs || 0) + 1 + runs;
      validBall = false;
      isDot = false;
    } else if (isNoBall) {
      bowler.noBalls = Number(bowler.noBalls || 0) + 1;
      bowler.runs = Number(bowler.runs || 0) + 1 + runs;
      
      striker.runs = Number(striker.runs || 0) + runs;
      striker.balls = Number(striker.balls || 0) + 1; 
      if (runs === 4) striker.fours = Number(striker.fours || 0) + 1;
      if (runs === 6) striker.sixes = Number(striker.sixes || 0) + 1;
      validBall = false;
      isDot = false;
    } else if (isBye) {
      currentInning.byeRuns = Number(currentInning.byeRuns || 0) + runs;
      striker.balls = Number(striker.balls || 0) + 1;
      isDot = true; 
    } else if (isLegBye) {
      bowler.legByes = Number(bowler.legByes || 0) + runs;
      striker.balls = Number(striker.balls || 0) + 1;
      isDot = true;
    } else {
      striker.runs = Number(striker.runs || 0) + runs;
      striker.balls = Number(striker.balls || 0) + 1;
      if (runs === 4) striker.fours = Number(striker.fours || 0) + 1;
      if (runs === 6) striker.sixes = Number(striker.sixes || 0) + 1;
      
      bowler.runs = Number(bowler.runs || 0) + runs;
    }

    if (validBall) {
      bowler.overs = addBallsToOvers(bowler.overs, 1);
      if (isDot) bowler.dots = Number(bowler.dots || 0) + 1;
    }

    if (isWicket && !isNoBall && !isWide) {
        striker.howOut = 'Caught'; 
        bowler.wickets = Number(bowler.wickets || 0) + 1;
        setLiveState(prev => ({ ...prev, strikerId: '' }));
    }

    // 3. Update Arrays
    currentInning.batting[strikerIdx] = striker;
    currentInning.bowling[bowlerIdx] = bowler;
    newInnings[innIdx] = calculateInningsTotals(currentInning); 

    // 4. Swap Ends logic
    if (runs % 2 !== 0 && validBall) {
        setLiveState(prev => ({ ...prev, strikerId: prev.nonStrikerId, nonStrikerId: prev.strikerId }));
    }
    
    // Check over completion (simplified)
    const newOvers = Number(bowler.overs);
    if (validBall && Math.round((newOvers % 1) * 10) === 0 && newOvers > 0) {
        // Over complete
        setLiveState(prev => ({ ...prev, strikerId: prev.nonStrikerId, nonStrikerId: prev.strikerId, bowlerId: '' }));
    }

    updateData({ ...data, innings: newInnings as [Innings, Innings] });
  };

  // --- Handlers for Inputs ---

  const handleMatchInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setData({
      ...data,
      matchInfo: { ...data.matchInfo, [e.target.name]: e.target.value }
    });
  };

  const handleBattingChange = (innIdx: number, id: string, field: keyof BattingEntry, value: any) => {
    const newInnings = [...data.innings];
    const index = newInnings[innIdx].batting.findIndex(b => b.id === id);
    if (index !== -1) {
      newInnings[innIdx].batting[index] = { ...newInnings[innIdx].batting[index], [field]: value };
      updateData({ ...data, innings: newInnings as [Innings, Innings] });
    }
  };

  const handleBowlingChange = (innIdx: number, id: string, field: keyof BowlingEntry, value: any) => {
    const newInnings = [...data.innings];
    const index = newInnings[innIdx].bowling.findIndex(b => b.id === id);
    if (index !== -1) {
      newInnings[innIdx].bowling[index] = { ...newInnings[innIdx].bowling[index], [field]: value };
      updateData({ ...data, innings: newInnings as [Innings, Innings] });
    }
  };

  const addRow = (type: 'batting' | 'bowling', innIdx: number) => {
    setPlayerSelector({ inningIdx: innIdx as 0|1, type: type === 'batting' ? 'batsman' : 'bowler' });
  };

  const handleAddPlayerFromModal = (player: { id: string, name: string }) => {
     if (!playerSelector) return;
     const { inningIdx, type } = playerSelector;
     const newInnings = [...data.innings];
     
     if (type === 'batsman') {
        newInnings[inningIdx].batting.push({
           id: player.id || Date.now().toString(),
           name: player.name,
           runs: 0,
           balls: 0,
           fours: 0,
           sixes: 0,
           howOut: 'Not Out',
           fielder: '',
           bowler: ''
        });
     } else {
        newInnings[inningIdx].bowling.push({
           id: player.id || Date.now().toString(),
           name: player.name,
           overs: 0,
           maidens: 0,
           runs: 0,
           wickets: 0,
           wides: 0,
           noBalls: 0,
           legByes: 0,
           dots: 0
        });
     }
     
     updateData({ ...data, innings: newInnings as [Innings, Innings] });
     setPlayerSelector(null);
     setSearchQuery('');
  };

  const removeRow = (type: 'batting' | 'bowling', innIdx: number, id: string) => {
    const newInnings = [...data.innings];
    if (type === 'batting') {
      newInnings[innIdx].batting = newInnings[innIdx].batting.filter(b => b.id !== id);
    } else {
      newInnings[innIdx].bowling = newInnings[innIdx].bowling.filter(b => b.id !== id);
    }
    updateData({ ...data, innings: newInnings as [Innings, Innings] });
  };

  const renderTabContent = () => {
    if (activeTab === 2) {
      return (
        <div className="space-y-6 animate-fade-in">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Target size={24} className="text-blue-500" />
            Match Info
          </h3>
          
          {/* Match Selection Dropdown */}
          <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
             <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
               <Calendar size={14} /> Select Scheduled Fixture (Auto-fill)
             </label>
             <select 
               className="w-full p-3 bg-white border border-slate-300 rounded-xl text-slate-800 font-medium"
               onChange={handleSelectScheduledMatch}
               defaultValue=""
             >
                <option value="" disabled>Select a match to score...</option>
                {matches.filter(m => m.isUpcoming).map(m => (
                    <option key={m.id} value={m.id}>
                       VS {m.opponent} ({new Date(m.date).toLocaleDateString()}) - {m.tournament}
                    </option>
                ))}
             </select>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
             <div className="space-y-4">
               <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">League / Tournament</label>
                  <input 
                    name="tournament"
                    value={data.matchInfo.tournament}
                    onChange={handleMatchInfoChange}
                    placeholder="e.g. Winter Cup 2024"
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                  />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Team A (Batting 1st?)</label>
                  <input 
                    name="teamAName"
                    value={data.matchInfo.teamAName}
                    onChange={handleMatchInfoChange}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                  />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Team B (Batting 2nd?)</label>
                  <select 
                    name="teamBName"
                    value={data.matchInfo.teamBName}
                    onChange={handleMatchInfoChange}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-800"
                  >
                    <option value="">Select Opponent</option>
                    {opponents.map(team => (
                      <option key={team.id} value={team.name}>{team.name}</option>
                    ))}
                    <option value="Opponent">Custom / Unknown</option>
                  </select>
               </div>
             </div>
             <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Venue</label>
                  <select 
                    name="venue"
                    value={data.matchInfo.venue}
                    onChange={handleMatchInfoChange}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-800"
                  >
                    {groundOptions.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Date</label>
                  <input 
                    type="date"
                    name="date"
                    value={data.matchInfo.date}
                    onChange={handleMatchInfoChange}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-800"
                  />
               </div>
             </div>
          </div>
          <div className="flex gap-4 p-4 bg-slate-100 rounded-xl">
            <div className="flex-1">
               <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Toss Result</label>
               <input 
                    name="tossResult"
                    value={data.matchInfo.tossResult}
                    onChange={handleMatchInfoChange}
                    placeholder="e.g. Team A won and elected to bat"
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-800"
                  />
            </div>
            <div className="flex-1">
               <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Match Result</label>
               <input 
                    name="matchResult"
                    value={data.matchInfo.matchResult}
                    onChange={handleMatchInfoChange}
                    placeholder="e.g. Team A won by 20 runs"
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-800"
                  />
            </div>
          </div>
        </div>
      );
    }

    const inningIdx = activeTab === 0 ? 0 : 1;
    const inning = data.innings[inningIdx];
    const teamName = inningIdx === 0 ? data.matchInfo.teamAName : data.matchInfo.teamBName;
    const bowlingTeamName = inningIdx === 0 ? data.matchInfo.teamBName : data.matchInfo.teamAName;
    
    // Dropdown Data Sources
    const fieldingPlayers = getBowlingTeamPlayers(inningIdx as 0 | 1);

    return (
      <div className="space-y-8 animate-fade-in">
        {/* Header Summary */}
        <div className="flex justify-between items-end border-b border-slate-200 pb-4">
           <div>
             <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{teamName}</h3>
             <p className="text-slate-500 font-medium">Innings {inningIdx + 1} {data.matchInfo.tournament && `• ${data.matchInfo.tournament}`}</p>
           </div>
           <div className="text-right">
              <span className="text-4xl font-black text-slate-800">{inning.totalRuns}/{inning.wickets}</span>
              <span className="text-lg text-slate-600 font-bold ml-2">({inning.overs} ov)</span>
           </div>
        </div>

        {/* Live Scoring Panel */}
        {isLiveMode && (
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-2xl border border-slate-700">
             <div className="flex justify-between items-center mb-6">
                <h4 className="font-bold flex items-center gap-2"><Zap className="text-yellow-400 fill-yellow-400" /> Live Scoring Control</h4>
                <div className="flex gap-2">
                   <select 
                      className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm text-white"
                      value={liveState.strikerId}
                      onChange={(e) => setLiveState({...liveState, strikerId: e.target.value})}
                   >
                     <option value="">Striker</option>
                     {inning.batting.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                   </select>
                   <select 
                      className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm text-white"
                      value={liveState.nonStrikerId}
                      onChange={(e) => setLiveState({...liveState, nonStrikerId: e.target.value})}
                   >
                     <option value="">Non-Striker</option>
                     {inning.batting.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                   </select>
                   <select 
                      className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm text-white"
                      value={liveState.bowlerId}
                      onChange={(e) => setLiveState({...liveState, bowlerId: e.target.value})}
                   >
                     <option value="">Bowler</option>
                     {inning.bowling.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                   </select>
                </div>
             </div>
             
             <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-4">
                {[0, 1, 2, 3, 4, 6].map(run => (
                  <button 
                    key={run} 
                    onClick={() => handleScoreBall(run, false, false, false)}
                    className="py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-black text-xl border border-slate-700 transition-all hover:-translate-y-1 text-white"
                  >
                    {run}
                  </button>
                ))}
                <button onClick={() => handleScoreBall(0, false, false, true)} className="py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold border border-red-500 text-white">WKT</button>
                <button onClick={() => handleScoreBall(5, false, false, false)} className="py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold border border-slate-700 text-white">5</button>
             </div>

             <div className="grid grid-cols-4 gap-2">
                <button onClick={() => handleScoreBall(0, true, false, false)} className="py-2 bg-orange-900 hover:bg-orange-800 text-orange-100 rounded-lg font-bold border border-orange-700">Wide</button>
                <button onClick={() => handleScoreBall(1, true, false, false)} className="py-2 bg-orange-900 hover:bg-orange-800 text-orange-100 rounded-lg font-bold border border-orange-700">WD+1</button>
                <button onClick={() => handleScoreBall(0, false, true, false)} className="py-2 bg-yellow-800 hover:bg-yellow-700 text-yellow-100 rounded-lg font-bold border border-yellow-700">No Ball</button>
                <button onClick={() => handleScoreBall(1, false, true, false)} className="py-2 bg-yellow-800 hover:bg-yellow-700 text-yellow-100 rounded-lg font-bold border border-yellow-700">NB+1</button>
                
                <button onClick={() => handleScoreBall(1, false, false, false, true, false)} className="py-2 bg-blue-900 hover:bg-blue-800 text-blue-100 rounded-lg font-bold border border-blue-700">Bye 1</button>
                <button onClick={() => handleScoreBall(4, false, false, false, true, false)} className="py-2 bg-blue-900 hover:bg-blue-800 text-blue-100 rounded-lg font-bold border border-blue-700">Bye 4</button>
                <button onClick={() => handleScoreBall(1, false, false, false, false, true)} className="py-2 bg-purple-900 hover:bg-purple-800 text-purple-100 rounded-lg font-bold border border-purple-700">Leg Bye 1</button>
                <button onClick={() => handleScoreBall(4, false, false, false, false, true)} className="py-2 bg-purple-900 hover:bg-purple-800 text-purple-100 rounded-lg font-bold border border-purple-700">Leg Bye 4</button>
             </div>
          </div>
        )}

        {/* Batting Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
            <h4 className="font-bold text-slate-700 uppercase text-xs tracking-wider">Batting</h4>
            <button onClick={() => addRow('batting', inningIdx)} className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center gap-1">
              <Plus size={14} /> Add Batsman
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-xs uppercase">
                <tr>
                  <th className="p-3">Batsman</th>
                  <th className="p-3 w-32">Dismissal</th>
                  <th className="p-3 w-32">Fielder</th>
                  <th className="p-3 w-32">Bowler</th>
                  <th className="p-3 text-right">R</th>
                  <th className="p-3 text-right">B</th>
                  <th className="p-3 text-right">4s</th>
                  <th className="p-3 text-right">6s</th>
                  <th className="p-3 text-right">SR</th>
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {inning.batting.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3">
                       <input 
                         className="w-full bg-transparent font-bold text-slate-800 outline-none" 
                         value={row.name}
                         onChange={(e) => handleBattingChange(inningIdx, row.id, 'name', e.target.value)}
                         placeholder="Player Name"
                       />
                    </td>
                    <td className="p-3">
                        <select 
                          className="w-full bg-transparent text-slate-700 text-xs outline-none font-medium"
                          value={row.howOut}
                          onChange={(e) => handleBattingChange(inningIdx, row.id, 'howOut', e.target.value)}
                        >
                            <option value="">Select...</option>
                            {DISMISSAL_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </td>
                    <td className="p-3">
                        <select 
                          className="w-full bg-transparent text-slate-700 text-xs outline-none font-medium"
                          value={row.fielder || ''}
                          onChange={(e) => handleBattingChange(inningIdx, row.id, 'fielder', e.target.value)}
                        >
                            <option value="">-</option>
                            {fieldingPlayers.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                        </select>
                    </td>
                    <td className="p-3">
                         <select 
                          className="w-full bg-transparent text-slate-700 text-xs outline-none font-medium"
                          value={row.bowler || ''}
                          onChange={(e) => handleBattingChange(inningIdx, row.id, 'bowler', e.target.value)}
                        >
                            <option value="">-</option>
                            {fieldingPlayers.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                        </select>
                    </td>
                    <td className="p-3 text-right">
                       <input 
                         type="number" className="w-12 text-right bg-transparent outline-none font-bold text-slate-900" 
                         value={row.runs} onChange={(e) => handleBattingChange(inningIdx, row.id, 'runs', Number(e.target.value))}
                       />
                    </td>
                    <td className="p-3 text-right">
                       <input 
                         type="number" className="w-12 text-right bg-transparent outline-none text-slate-800" 
                         value={row.balls} onChange={(e) => handleBattingChange(inningIdx, row.id, 'balls', Number(e.target.value))}
                       />
                    </td>
                    <td className="p-3 text-right">
                       <input 
                         type="number" className="w-12 text-right bg-transparent outline-none text-slate-600 font-medium" 
                         value={row.fours} onChange={(e) => handleBattingChange(inningIdx, row.id, 'fours', Number(e.target.value))}
                       />
                    </td>
                    <td className="p-3 text-right">
                       <input 
                         type="number" className="w-12 text-right bg-transparent outline-none text-slate-600 font-medium" 
                         value={row.sixes} onChange={(e) => handleBattingChange(inningIdx, row.id, 'sixes', Number(e.target.value))}
                       />
                    </td>
                    <td className="p-3 text-right font-mono text-xs text-slate-600 font-medium">
                        {getStrikeRate(row.runs, row.balls)}
                    </td>
                    <td className="p-3 text-center">
                      <button onClick={() => removeRow('batting', inningIdx, row.id)} className="text-slate-300 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Extras Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
             <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                <span className="block text-xs font-bold text-slate-600 uppercase">Wides</span>
                <span className="text-xl font-black text-slate-800">
                  {inning.bowling.reduce((sum, b) => sum + Number(b.wides || 0), 0)}
                </span>
             </div>
             <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                <span className="block text-xs font-bold text-slate-600 uppercase">No Balls</span>
                <span className="text-xl font-black text-slate-800">
                   {inning.bowling.reduce((sum, b) => sum + Number(b.noBalls || 0), 0)}
                </span>
             </div>
             <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                <span className="block text-xs font-bold text-slate-600 uppercase">Leg Byes</span>
                <span className="text-xl font-black text-slate-800">
                   {inning.bowling.reduce((sum, b) => sum + Number(b.legByes || 0), 0)}
                </span>
             </div>
             <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                <span className="block text-xs font-bold text-slate-600 uppercase mb-1">Byes</span>
                <input 
                    type="number"
                    value={inning.byeRuns}
                    onChange={(e) => {
                       const newInnings = [...data.innings];
                       newInnings[inningIdx].byeRuns = Number(e.target.value);
                       updateData({ ...data, innings: newInnings as [Innings, Innings] });
                    }}
                    className="w-full text-center text-xl font-black text-slate-800 bg-slate-50 rounded-lg p-1 outline-none focus:ring-2 focus:ring-blue-500"
                />
             </div>
             <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center text-white">
                <span className="block text-xs font-bold text-slate-300 uppercase">Total Extras</span>
                <span className="text-xl font-black text-white">
                   {inning.extras}
                </span>
             </div>
        </div>

        {/* Bowling Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
            <h4 className="font-bold text-slate-700 uppercase text-xs tracking-wider">Bowling</h4>
            <button onClick={() => addRow('bowling', inningIdx)} className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center gap-1">
              <Plus size={14} /> Add Bowler
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-xs uppercase">
                <tr>
                  <th className="p-3">Bowler</th>
                  <th className="p-3 text-right">O</th>
                  <th className="p-3 text-right">M</th>
                  <th className="p-3 text-right">R</th>
                  <th className="p-3 text-right">W</th>
                  <th className="p-3 text-right">Eco</th>
                  <th className="p-3 text-right">WD</th>
                  <th className="p-3 text-right">NB</th>
                  <th className="p-3 text-right">LB</th>
                  <th className="p-3 text-right">Dot</th>
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {inning.bowling.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3">
                       <input 
                         className="w-full bg-transparent font-bold text-slate-800 outline-none" 
                         value={row.name}
                         onChange={(e) => handleBowlingChange(inningIdx, row.id, 'name', e.target.value)}
                         placeholder="Player Name"
                       />
                    </td>
                    <td className="p-3 text-right">
                       <input 
                         type="number" step="0.1" className="w-12 text-right bg-transparent outline-none font-bold text-slate-900" 
                         value={row.overs} onChange={(e) => handleBowlingChange(inningIdx, row.id, 'overs', Number(e.target.value))}
                       />
                    </td>
                    <td className="p-3 text-right">
                       <input 
                         type="number" className="w-12 text-right bg-transparent outline-none text-slate-800" 
                         value={row.maidens} onChange={(e) => handleBowlingChange(inningIdx, row.id, 'maidens', Number(e.target.value))}
                       />
                    </td>
                    <td className="p-3 text-right">
                       <input 
                         type="number" className="w-12 text-right bg-transparent outline-none text-slate-800" 
                         value={row.runs} onChange={(e) => handleBowlingChange(inningIdx, row.id, 'runs', Number(e.target.value))}
                       />
                    </td>
                    <td className="p-3 text-right">
                       <input 
                         type="number" className="w-12 text-right bg-transparent outline-none text-blue-600 font-black" 
                         value={row.wickets} onChange={(e) => handleBowlingChange(inningIdx, row.id, 'wickets', Number(e.target.value))}
                       />
                    </td>
                    <td className="p-3 text-right font-mono text-xs text-slate-600 font-medium">
                        {getEconomy(row.runs, row.overs)}
                    </td>
                    <td className="p-3 text-right">
                       <input 
                         type="number" className="w-12 text-right bg-transparent outline-none text-slate-600 font-medium" 
                         value={row.wides} onChange={(e) => handleBowlingChange(inningIdx, row.id, 'wides', Number(e.target.value))}
                       />
                    </td>
                    <td className="p-3 text-right">
                       <input 
                         type="number" className="w-12 text-right bg-transparent outline-none text-slate-600 font-medium" 
                         value={row.noBalls} onChange={(e) => handleBowlingChange(inningIdx, row.id, 'noBalls', Number(e.target.value))}
                       />
                    </td>
                    <td className="p-3 text-right">
                       <input 
                         type="number" className="w-12 text-right bg-transparent outline-none text-slate-600 font-medium" 
                         value={row.legByes} onChange={(e) => handleBowlingChange(inningIdx, row.id, 'legByes', Number(e.target.value))}
                       />
                    </td>
                    <td className="p-3 text-right">
                       <input 
                         type="number" className="w-12 text-right bg-transparent outline-none text-slate-600 font-medium" 
                         value={row.dots} onChange={(e) => handleBowlingChange(inningIdx, row.id, 'dots', Number(e.target.value))}
                       />
                    </td>
                    <td className="p-3 text-center">
                      <button onClick={() => removeRow('bowling', inningIdx, row.id)} className="text-slate-300 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Match Scorecard</h2>
          <p className="text-slate-500">Live scoring and result entry</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setIsLiveMode(!isLiveMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all border
                  ${isLiveMode ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
              <Zap size={18} className={isLiveMode ? "fill-red-600" : ""} />
              {isLiveMode ? 'Exit Live Mode' : 'Start Live Scoring'}
            </button>
            <button className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all">
              <Save size={18} /> Save Match
            </button>
        </div>
      </div>

      {!validation.isValid && (
        <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3">
          <AlertCircle className="text-red-500 mt-0.5" size={20} />
          <div>
            <h4 className="text-sm font-bold text-red-700">Validation Errors</h4>
            <ul className="list-disc list-inside text-xs text-red-600 mt-1">
              {validation.errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex p-1 bg-white rounded-xl shadow-sm border border-slate-100 w-full md:w-fit">
        {['Match Info', '1st Innings', '2nd Innings'].map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx === 0 ? 2 : idx === 1 ? 0 : 1)}
            className={`
              flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all
              ${(activeTab === 0 && idx === 1) || (activeTab === 1 && idx === 2) || (activeTab === 2 && idx === 0)
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-500 hover:bg-slate-50'
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100 min-h-[600px]">
        {renderTabContent()}
      </div>

      {/* Player Selector Modal */}
      {playerSelector && (
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                 <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800">Select {playerSelector.type === 'batsman' ? 'Batsman' : 'Bowler'}</h3>
                    <button onClick={() => setPlayerSelector(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                 </div>
                 <div className="p-4">
                     <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                          autoFocus
                          placeholder="Search player..."
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                     </div>
                     <div className="max-h-64 overflow-y-auto space-y-1">
                        {(() => {
                            // Determine which list to show
                            const isBatting = playerSelector.type === 'batsman';
                            const candidates = isBatting 
                                ? getBattingTeamPlayers(playerSelector.inningIdx) 
                                : getBowlingTeamPlayers(playerSelector.inningIdx);

                            const filtered = candidates.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

                            if (filtered.length === 0) return <p className="text-center text-slate-400 text-sm py-4">No players found.</p>;

                            return filtered.map(p => (
                               <button 
                                 key={p.id}
                                 onClick={() => handleAddPlayerFromModal(p)}
                                 className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg group transition-colors text-left"
                               >
                                  <span className="font-bold text-slate-700">{p.name}</span>
                                  <Check size={16} className="text-blue-500 opacity-0 group-hover:opacity-100" />
                               </button>
                            ));
                        })()}
                     </div>
                 </div>
             </div>
         </div>
      )}
    </div>
  );
};

export default Scorecard;
