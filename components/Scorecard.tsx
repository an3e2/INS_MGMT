import React, { useState, useEffect, useRef } from 'react';
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
  Calendar,
  RotateCcw,
  Flame,
  UserX,
  User,
  Shield,
  Sword,
  CircleDot
} from 'lucide-react';
import { OpponentTeam, Player, Match, PlayerRole } from '../types';
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
  "Timed Out",
  "Did not bat"
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
  byeRuns: number;
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

interface BallEvent {
  inning: 0 | 1;
  over: number;
  ballNumber: number; // Ball within the over (1-6+)
  striker: string;
  bowler: string;
  runs: number;
  extrasType?: 'WD' | 'NB' | 'B' | 'LB';
  extrasRuns: number;
  isWicket: boolean;
  description: string;
}

interface PendingWicket {
  runs: number;
  isWide: boolean;
  isNoBall: boolean;
  isBye: boolean;
  isLegBye: boolean;
}

interface HistoryState {
  data: ScorecardData;
  commentary: BallEvent[];
  liveState: LiveState;
}

interface ScorecardProps {
  opponents?: OpponentTeam[];
  players?: Player[];
  matches?: Match[];
}

const Scorecard: React.FC<ScorecardProps> = ({ opponents = [], players = [], matches = [] }) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<0 | 1 | 2>(0);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [playerSelector, setPlayerSelector] = useState<{ inningIdx: 0 | 1, type: 'batsman' | 'bowler', autoTrigger?: boolean } | null>(null);
  const [selectionPreview, setSelectionPreview] = useState<Partial<Player> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Wicket Modal State
  const [wicketModal, setWicketModal] = useState<{ isOpen: boolean, pendingData: PendingWicket | null }>({
    isOpen: false,
    pendingData: null
  });
  const [wicketDetails, setWicketDetails] = useState({
    type: 'Caught',
    fielderName: ''
  });

  // Animation State
  const [celebration, setCelebration] = useState<{ type: '4' | '6' | 'W' | null, visible: boolean }>({ type: null, visible: false });

  // History for Undo
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [ballCommentary, setBallCommentary] = useState<BallEvent[]>([]);

  // Live Scoring State
  const [liveState, setLiveState] = useState<LiveState>({
    strikerId: '',
    nonStrikerId: '',
    bowlerId: ''
  });

  // Initial State: Empty lists
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
        batting: [],
        bowling: [],
        byeRuns: 0,
        extras: 0,
        totalRuns: 0,
        wickets: 0,
        overs: 0
      },
      {
        batting: [],
        bowling: [],
        byeRuns: 0,
        extras: 0,
        totalRuns: 0,
        wickets: 0,
        overs: 0
      }
    ]
  });

  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, errors: [] });
  const commentaryEndRef = useRef<HTMLDivElement>(null);

  // Combine Indian Strikers + Opponents for dropdowns
  const allTeams = [
    { id: 'home', name: 'Indian Strikers' },
    ...opponents
  ];

  useEffect(() => {
    if (location.state && location.state.match) {
        loadMatchData(location.state.match);
        setActiveTab(2);
    }
  }, [location.state]);

  useEffect(() => {
    // Auto-scroll commentary
    if (commentaryEndRef.current) {
        commentaryEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [ballCommentary]);

  const loadMatchData = (match: Match) => {
    setData(prev => ({
        ...prev,
        matchInfo: {
            ...prev.matchInfo,
            teamAName: 'Indian Strikers', // Default, can be changed
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

  const triggerAnimation = (type: '4' | '6' | 'W') => {
      setCelebration({ type, visible: true });
      setTimeout(() => setCelebration(prev => ({ ...prev, visible: false })), 3000);
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

  const getTeamPlayers = (teamName: string) => {
    if (teamName === 'Indian Strikers') {
      return players.map(p => ({ id: p.id, name: p.name }));
    }
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

  const findFullPlayer = (id: string, name: string): Partial<Player> => {
      const player = players.find(p => p.id === id);
      if (player) return player;
      
      // Return a basic structure for opponents or unknown players
      return {
          id,
          name,
          role: PlayerRole.BATSMAN, // Default
          avatarUrl: `https://ui-avatars.com/api/?name=${name}&background=random`,
          matchesPlayed: 0,
          runsScored: 0,
          wicketsTaken: 0,
          average: 0
      };
  };

  const calculateInningsTotals = (inning: Innings): Innings => {
    const batRuns = inning.batting.reduce((sum, b) => sum + Number(b.runs || 0), 0);
    
    const wides = inning.bowling.reduce((sum, b) => sum + Number(b.wides || 0), 0);
    const noBalls = inning.bowling.reduce((sum, b) => sum + Number(b.noBalls || 0), 0);
    const legByes = inning.bowling.reduce((sum, b) => sum + Number(b.legByes || 0), 0);
    const byes = Number(inning.byeRuns || 0);
    
    const calculatedExtras = wides + noBalls + legByes + byes;
    const totalRuns = batRuns + calculatedExtras;

    const wickets = inning.batting.filter(b => {
      if (!b.howOut) return false;
      const val = b.howOut.toLowerCase();
      return !val.includes('not out') && !val.includes('retired') && !val.includes('did not bat');
    }).length;

    const totalBalls = inning.bowling.reduce((sum, b) => {
        const ov = Number(b.overs || 0);
        return sum + Math.floor(ov) * 6 + Math.round((ov % 1) * 10);
    }, 0);

    return {
      ...inning,
      extras: calculatedExtras,
      totalRuns,
      wickets,
      overs: getOversFromBalls(totalBalls)
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

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    
    setData(lastState.data);
    setBallCommentary(lastState.commentary);
    setLiveState(lastState.liveState); // CRITICAL: Restore live state (striker positions)
    setHistory(newHistory);
  };
  
  const handleScoreBall = (runs: number, isWide: boolean, isNoBall: boolean, isWicket: boolean, isBye: boolean = false, isLegBye: boolean = false) => {
    
    // Validate Selections
    if (!liveState.strikerId || !liveState.nonStrikerId || !liveState.bowlerId) {
      alert("Please select Striker, Non-Striker and Bowler first.");
      return;
    }

    // Intercept Wicket for Modal
    if (isWicket) {
        setWicketModal({
            isOpen: true,
            pendingData: { runs, isWide, isNoBall, isBye, isLegBye }
        });
        // Reset details
        setWicketDetails({ type: 'Caught', fielderName: '' });
        return;
    }

    processBall(runs, isWide, isNoBall, false, isBye, isLegBye);
  };

  const handleConfirmWicket = () => {
     if (!wicketModal.pendingData) return;
     
     const { runs, isWide, isNoBall, isBye, isLegBye } = wicketModal.pendingData;
     processBall(runs, isWide, isNoBall, true, isBye, isLegBye, wicketDetails.type, wicketDetails.fielderName);
     setWicketModal({ isOpen: false, pendingData: null });
  };

  const processBall = (
      runs: number, 
      isWide: boolean, 
      isNoBall: boolean, 
      isWicket: boolean, 
      isBye: boolean, 
      isLegBye: boolean,
      dismissalType: string = '',
      fielderName: string = ''
  ) => {
    // 1. Snapshot for Undo
    // Deep copy current state BEFORE mutation
    setHistory(prev => [...prev, JSON.parse(JSON.stringify({ 
        data, 
        commentary: ballCommentary,
        liveState 
    }))]);

    const innIdx = activeTab === 0 ? 0 : activeTab === 1 ? 0 : 1;
    
    // Improved Immutability: Deep copy the specific inning we are modifying
    // to avoid mutating the state that was just snapshotted (although JSON.parse strategy above handles safety, 
    // explicit copying is better practice)
    const newInnings = data.innings.map((ing, idx) => {
        if (idx === innIdx) {
            return {
                ...ing,
                batting: ing.batting.map(b => ({...b})),
                bowling: ing.bowling.map(b => ({...b}))
            };
        }
        return ing;
    }) as [Innings, Innings];

    const currentInning = newInnings[innIdx];

    const strikerIdx = currentInning.batting.findIndex(p => p.id === liveState.strikerId);
    const bowlerIdx = currentInning.bowling.findIndex(p => p.id === liveState.bowlerId);
    
    // Should be found if validations passed
    if (strikerIdx === -1 || bowlerIdx === -1) return;

    const striker = currentInning.batting[strikerIdx];
    const bowler = currentInning.bowling[bowlerIdx];

    // Commentary Data
    let description = "";
    let extrasType: 'WD' | 'NB' | 'B' | 'LB' | undefined;
    let extrasRuns = 0;

    // Logic
    let validBall = true;
    let isDot = runs === 0 && !isWide && !isNoBall && !isBye && !isLegBye;
    let ballRuns = runs; // Runs credited to batsman

    // Wides: Runs arg is EXTRA runs apart from wide (e.g. boundary off wide)
    if (isWide) {
      extrasType = 'WD';
      extrasRuns = 1 + runs;
      bowler.wides = Number(bowler.wides || 0) + extrasRuns; 
      bowler.runs = Number(bowler.runs || 0) + extrasRuns;
      
      description = runs > 0 ? `Wide + ${runs} Runs` : `Wide Ball`;
      validBall = false;
      isDot = false;
      ballRuns = 0; // Batsman gets 0
    } 
    // No Balls
    else if (isNoBall) {
      extrasType = 'NB';
      extrasRuns = 1;
      bowler.noBalls = Number(bowler.noBalls || 0) + 1;
      bowler.runs = Number(bowler.runs || 0) + 1 + runs;
      
      striker.runs = Number(striker.runs || 0) + runs;
      striker.balls = Number(striker.balls || 0) + 1; 
      if (runs === 4) striker.fours = Number(striker.fours || 0) + 1;
      if (runs === 6) striker.sixes = Number(striker.sixes || 0) + 1;

      description = runs > 0 ? `No Ball + ${runs} Runs` : `No Ball`;
      validBall = false; // Doesn't count as ball bowled in over count (usually)
      isDot = false;
    } 
    // Byes
    else if (isBye) {
      extrasType = 'B';
      extrasRuns = runs;
      currentInning.byeRuns = Number(currentInning.byeRuns || 0) + runs;
      striker.balls = Number(striker.balls || 0) + 1;
      description = `${runs} Bye${runs > 1 ? 's' : ''}`;
      isDot = true; // Technically a dot for the bowler stats
      ballRuns = 0;
    } 
    // Leg Byes
    else if (isLegBye) {
      extrasType = 'LB';
      extrasRuns = runs;
      bowler.legByes = Number(bowler.legByes || 0) + runs;
      striker.balls = Number(striker.balls || 0) + 1;
      description = `${runs} Leg Bye${runs > 1 ? 's' : ''}`;
      isDot = true;
      ballRuns = 0;
    } 
    // Standard Delivery
    else {
      striker.runs = Number(striker.runs || 0) + runs;
      striker.balls = Number(striker.balls || 0) + 1;
      if (runs === 4) striker.fours = Number(striker.fours || 0) + 1;
      if (runs === 6) striker.sixes = Number(striker.sixes || 0) + 1;
      
      bowler.runs = Number(bowler.runs || 0) + runs;
      description = runs === 0 ? "Dot Ball" : `${runs} Run${runs !== 1 ? 's' : ''}`;
    }

    // Update Overs
    if (validBall) {
      bowler.overs = addBallsToOvers(bowler.overs, 1);
      if (isDot) bowler.dots = Number(bowler.dots || 0) + 1;
    }

    // Wicket Logic
    if (isWicket && !isNoBall && !isWide) { // Standard wicket
        striker.howOut = dismissalType;
        striker.fielder = fielderName;
        striker.bowler = bowler.name; // Automatically credit current bowler

        // Credit wicket to bowler unless run out (usually)
        if (dismissalType !== 'Run Out' && dismissalType !== 'Timed Out' && dismissalType !== 'Obstructing Field' && dismissalType !== 'Retired Hurt') {
            bowler.wickets = Number(bowler.wickets || 0) + 1;
        }

        description = `WICKET! (${dismissalType}) ` + description;
        triggerAnimation('W');
        setLiveState(prev => ({ ...prev, strikerId: '' }));
        // Trigger batsman select
        setPlayerSelector({ inningIdx: innIdx as 0|1, type: 'batsman', autoTrigger: true });
    }

    // Trigger Animations
    if (runs === 4 && !isBye && !isLegBye) triggerAnimation('4');
    if (runs === 6 && !isBye && !isLegBye) triggerAnimation('6');

    // Commentary Update
    const newEvent: BallEvent = {
        inning: innIdx as 0|1,
        over: Math.floor(calculateInningsTotals(currentInning).overs), // Simple appx
        ballNumber: Math.round((calculateInningsTotals(currentInning).overs % 1) * 10), // Simple appx
        striker: striker.name,
        bowler: bowler.name,
        runs: ballRuns,
        extrasType,
        extrasRuns,
        isWicket,
        description
    };
    setBallCommentary(prev => [...prev, newEvent]);

    // Swap Ends
    if (runs % 2 !== 0 && validBall) {
        setLiveState(prev => ({ ...prev, strikerId: prev.nonStrikerId, nonStrikerId: prev.strikerId }));
    }
    
    // Check Over Complete
    const newOvers = Number(bowler.overs);
    if (validBall && Math.round((newOvers % 1) * 10) === 0 && newOvers > 0) {
        setLiveState(prev => ({ ...prev, strikerId: prev.nonStrikerId, nonStrikerId: prev.strikerId, bowlerId: '' }));
        // Trigger Bowler Select
        if (!isWicket) { 
            setPlayerSelector({ inningIdx: innIdx as 0|1, type: 'bowler', autoTrigger: true });
        }
    }

    updateData({ ...data, innings: newInnings as [Innings, Innings] });
  };

  // --- Input Handlers ---

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

  const handlePreviewPlayer = (partialPlayer: { id: string, name: string }) => {
     const fullDetails = findFullPlayer(partialPlayer.id, partialPlayer.name);
     setSelectionPreview(fullDetails);
  };

  const handleAddPlayerFromPreview = () => {
     if (!playerSelector || !selectionPreview) return;
     const { inningIdx, type, autoTrigger } = playerSelector;
     const newInnings = [...data.innings];
     
     if (type === 'batsman') {
        const newBatsman = {
           id: selectionPreview.id || Date.now().toString(),
           name: selectionPreview.name || 'Unknown',
           runs: 0,
           balls: 0,
           fours: 0,
           sixes: 0,
           howOut: 'Not Out',
           fielder: '',
           bowler: ''
        };
        newInnings[inningIdx].batting.push(newBatsman);
        if (autoTrigger) {
            setLiveState(prev => ({ ...prev, strikerId: newBatsman.id }));
        }
     } else {
        const newBowler = {
           id: selectionPreview.id || Date.now().toString(),
           name: selectionPreview.name || 'Unknown',
           overs: 0,
           maidens: 0,
           runs: 0,
           wickets: 0,
           wides: 0,
           noBalls: 0,
           legByes: 0,
           dots: 0
        };
        newInnings[inningIdx].bowling.push(newBowler);
        if (autoTrigger) {
            setLiveState(prev => ({ ...prev, bowlerId: newBowler.id }));
        }
     }
     
     updateData({ ...data, innings: newInnings as [Innings, Innings] });
     setPlayerSelector(null);
     setSelectionPreview(null);
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
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Team A (Usually Batting 1st)</label>
                  <select 
                    name="teamAName"
                    value={data.matchInfo.teamAName}
                    onChange={handleMatchInfoChange}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    {allTeams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Team B (Usually Batting 2nd)</label>
                  <select 
                    name="teamBName"
                    value={data.matchInfo.teamBName}
                    onChange={handleMatchInfoChange}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-800"
                  >
                    {allTeams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
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
                    {Array.from({ length: 15 }, (_, i) => `RCA-${i + 1}`).map(g => <option key={g} value={g}>{g}</option>)}
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
    const fieldingPlayers = getBowlingTeamPlayers(inningIdx as 0 | 1);

    return (
      <div className="space-y-8 animate-fade-in relative">
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
          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
             
             {/* Live Header & Controls */}
             <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col md:flex-row justify-between gap-4">
                <div className="flex items-center gap-3">
                   <div className="bg-red-600 px-2 py-1 rounded text-xs font-bold text-white animate-pulse flex items-center gap-1">
                     <span className="w-2 h-2 bg-white rounded-full"></span> LIVE
                   </div>
                   <div className="flex gap-2">
                      <select className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm text-white max-w-[120px]" value={liveState.strikerId} onChange={(e) => setLiveState({...liveState, strikerId: e.target.value})}>
                        <option value="">Striker</option>
                        {inning.batting.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                      <select className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm text-white max-w-[120px]" value={liveState.nonStrikerId} onChange={(e) => setLiveState({...liveState, nonStrikerId: e.target.value})}>
                        <option value="">Non-Striker</option>
                        {inning.batting.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                      <select className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm text-white max-w-[120px]" value={liveState.bowlerId} onChange={(e) => setLiveState({...liveState, bowlerId: e.target.value})}>
                        <option value="">Bowler</option>
                        {inning.bowling.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                   </div>
                </div>
                <button 
                  onClick={handleUndo}
                  disabled={history.length === 0}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors text-sm disabled:opacity-50"
                >
                  <RotateCcw size={14} /> Undo Last Ball
                </button>
             </div>

             <div className="flex flex-col md:flex-row">
                {/* Scoring Grid */}
                <div className="flex-1 p-4 md:p-6 border-b md:border-b-0 md:border-r border-slate-800">
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mb-4">
                        {[0, 1, 2, 3, 4, 6].map(run => (
                          <button 
                            key={run} 
                            onClick={() => handleScoreBall(run, false, false, false)}
                            className="py-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-black text-2xl border border-slate-700 transition-all hover:-translate-y-1 text-white shadow-lg active:scale-95"
                          >
                            {run}
                          </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <button onClick={() => handleScoreBall(0, false, false, true)} className="py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold border border-red-500 text-white shadow-lg shadow-red-900/50">WICKET</button>
                        <button onClick={() => handleScoreBall(5, false, false, false)} className="py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold border border-slate-700 text-white">5 Runs</button>
                    </div>

                    <div className="space-y-2">
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Extras</p>
                       <div className="grid grid-cols-5 gap-1.5">
                          {/* Wides */}
                          <button onClick={() => handleScoreBall(0, true, false, false)} className="p-2 bg-orange-900/40 text-orange-200 border border-orange-800 rounded text-xs font-bold hover:bg-orange-900">WD</button>
                          <button onClick={() => handleScoreBall(1, true, false, false)} className="p-2 bg-orange-900/40 text-orange-200 border border-orange-800 rounded text-xs font-bold hover:bg-orange-900">WD+1</button>
                          <button onClick={() => handleScoreBall(2, true, false, false)} className="p-2 bg-orange-900/40 text-orange-200 border border-orange-800 rounded text-xs font-bold hover:bg-orange-900">WD+2</button>
                          <button onClick={() => handleScoreBall(3, true, false, false)} className="p-2 bg-orange-900/40 text-orange-200 border border-orange-800 rounded text-xs font-bold hover:bg-orange-900">WD+3</button>
                          <button onClick={() => handleScoreBall(4, true, false, false)} className="p-2 bg-orange-900/40 text-orange-200 border border-orange-800 rounded text-xs font-bold hover:bg-orange-900">WD+4</button>
                          
                          {/* No Balls */}
                          <button onClick={() => handleScoreBall(0, false, true, false)} className="p-2 bg-yellow-900/40 text-yellow-200 border border-yellow-800 rounded text-xs font-bold hover:bg-yellow-900">NB</button>
                          <button onClick={() => handleScoreBall(1, false, true, false)} className="p-2 bg-yellow-900/40 text-yellow-200 border border-yellow-800 rounded text-xs font-bold hover:bg-yellow-900">NB+1</button>
                          <button onClick={() => handleScoreBall(2, false, true, false)} className="p-2 bg-yellow-900/40 text-yellow-200 border border-yellow-800 rounded text-xs font-bold hover:bg-yellow-900">NB+2</button>
                          <button onClick={() => handleScoreBall(3, false, true, false)} className="p-2 bg-yellow-900/40 text-yellow-200 border border-yellow-800 rounded text-xs font-bold hover:bg-yellow-900">NB+3</button>
                          <button onClick={() => handleScoreBall(4, false, true, false)} className="p-2 bg-yellow-900/40 text-yellow-200 border border-yellow-800 rounded text-xs font-bold hover:bg-yellow-900">NB+4</button>

                          {/* Byes */}
                          <button onClick={() => handleScoreBall(1, false, false, false, true)} className="p-2 bg-blue-900/40 text-blue-200 border border-blue-800 rounded text-xs font-bold hover:bg-blue-900">B+1</button>
                          <button onClick={() => handleScoreBall(2, false, false, false, true)} className="p-2 bg-blue-900/40 text-blue-200 border border-blue-800 rounded text-xs font-bold hover:bg-blue-900">B+2</button>
                          <button onClick={() => handleScoreBall(3, false, false, false, true)} className="p-2 bg-blue-900/40 text-blue-200 border border-blue-800 rounded text-xs font-bold hover:bg-blue-900">B+3</button>
                          <button onClick={() => handleScoreBall(4, false, false, false, true)} className="p-2 bg-blue-900/40 text-blue-200 border border-blue-800 rounded text-xs font-bold hover:bg-blue-900">B+4</button>
                          <div className="p-2"></div> {/* Spacer */}

                          {/* Leg Byes */}
                          <button onClick={() => handleScoreBall(1, false, false, false, false, true)} className="p-2 bg-purple-900/40 text-purple-200 border border-purple-800 rounded text-xs font-bold hover:bg-purple-900">LB+1</button>
                          <button onClick={() => handleScoreBall(2, false, false, false, false, true)} className="p-2 bg-purple-900/40 text-purple-200 border border-purple-800 rounded text-xs font-bold hover:bg-purple-900">LB+2</button>
                          <button onClick={() => handleScoreBall(3, false, false, false, false, true)} className="p-2 bg-purple-900/40 text-purple-200 border border-purple-800 rounded text-xs font-bold hover:bg-purple-900">LB+3</button>
                          <button onClick={() => handleScoreBall(4, false, false, false, false, true)} className="p-2 bg-purple-900/40 text-purple-200 border border-purple-800 rounded text-xs font-bold hover:bg-purple-900">LB+4</button>
                       </div>
                    </div>
                </div>

                {/* Commentary Feed */}
                <div className="w-full md:w-80 bg-slate-950/50 flex flex-col h-64 md:h-auto border-l border-slate-800">
                   <div className="p-3 bg-slate-900 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase">
                      Ball by Ball
                   </div>
                   <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar relative">
                      {ballCommentary.filter(b => b.inning === inningIdx).length === 0 && (
                          <div className="text-center text-slate-600 text-xs mt-10">Match started...</div>
                      )}
                      {ballCommentary.filter(b => b.inning === inningIdx).map((ball, idx) => (
                          <div key={idx} className={`text-sm p-2 rounded-lg border ${ball.isWicket ? 'bg-red-900/20 border-red-800' : 'bg-slate-800/50 border-slate-700/50'}`}>
                             <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono font-bold text-slate-400 text-xs">{ball.over}.{ball.ballNumber}</span>
                                <span className="text-xs text-slate-500">{ball.bowler} to {ball.striker}</span>
                             </div>
                             <div className="flex items-center justify-between">
                                <span className={`font-bold ${ball.isWicket ? 'text-red-400' : 'text-white'}`}>{ball.description}</span>
                                {ball.runs >= 4 && !ball.extrasType && <span className="text-xs font-black bg-white text-slate-900 px-1 rounded">{ball.runs}</span>}
                             </div>
                          </div>
                      ))}
                      <div ref={commentaryEndRef} />
                   </div>
                </div>
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

        {/* Celebration Overlay */}
        {celebration.visible && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"></div>
                <div className="relative z-10 animate-zoom-in">
                    {celebration.type === '4' && (
                        <div className="text-center">
                             <h1 className="text-[150px] md:text-[250px] font-black text-white italic drop-shadow-[0_0_50px_rgba(59,130,246,0.8)] leading-none">4</h1>
                             <p className="text-4xl md:text-6xl font-black text-blue-400 uppercase tracking-widest mt-4 animate-bounce">Boundary!</p>
                        </div>
                    )}
                    {celebration.type === '6' && (
                        <div className="text-center">
                             <h1 className="text-[150px] md:text-[250px] font-black text-white italic drop-shadow-[0_0_50px_rgba(249,115,22,0.8)] leading-none">6</h1>
                             <p className="text-4xl md:text-6xl font-black text-orange-500 uppercase tracking-widest mt-4 animate-bounce">Maximum!</p>
                        </div>
                    )}
                    {celebration.type === 'W' && (
                        <div className="text-center">
                             <div className="w-48 h-48 md:w-64 md:h-64 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_60px_rgba(220,38,38,0.6)] animate-pulse">
                                <Flame size={120} className="text-white" />
                             </div>
                             <p className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter">WICKET</p>
                        </div>
                    )}
                </div>
            </div>
        )}
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

      {/* Wicket Confirmation Modal */}
      {wicketModal.isOpen && (
         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
             <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-zoom-in">
                 <div className="bg-red-600 p-6 text-center">
                    <div className="w-16 h-16 bg-red-700 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
                      <UserX size={32} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Wicket Fall</h3>
                 </div>
                 
                 <div className="p-6 space-y-4">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dismissal Type</label>
                        <select 
                           className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-red-500"
                           value={wicketDetails.type}
                           onChange={(e) => setWicketDetails({...wicketDetails, type: e.target.value})}
                        >
                            {DISMISSAL_TYPES.filter(t => t !== 'Not Out' && t !== 'Did not bat' && t !== 'Retired Hurt').map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                     </div>

                     {['Caught', 'Run Out', 'Stumped'].includes(wicketDetails.type) && (
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fielder Name</label>
                            <select 
                               className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-red-500"
                               value={wicketDetails.fielderName}
                               onChange={(e) => setWicketDetails({...wicketDetails, fielderName: e.target.value})}
                            >
                                <option value="">Select Fielder...</option>
                                {getBowlingTeamPlayers(activeTab === 0 ? 0 : activeTab === 1 ? 0 : 1).map(p => (
                                    <option key={p.id} value={p.name}>{p.name}</option>
                                ))}
                            </select>
                         </div>
                     )}

                     <div className="flex gap-3 pt-2">
                        <button 
                          onClick={() => setWicketModal({ isOpen: false, pendingData: null })}
                          className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleConfirmWicket}
                          className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/20"
                        >
                          Confirm Wicket
                        </button>
                     </div>
                 </div>
             </div>
         </div>
      )}

      {/* Player Selector Modal */}
      {playerSelector && (
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transition-all duration-300">
                 {!selectionPreview ? (
                   // List View
                   <>
                     <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            {playerSelector.autoTrigger && <Zap size={16} className="text-yellow-500 fill-yellow-500" />}
                            Select {playerSelector.type === 'batsman' ? 'Batsman' : 'Bowler'}
                        </h3>
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
                                const isBatting = playerSelector.type === 'batsman';
                                // Filter players already in the list
                                const currentList = isBatting 
                                    ? data.innings[playerSelector.inningIdx].batting 
                                    : data.innings[playerSelector.inningIdx].bowling;
                                const currentIds = new Set(currentList.map(p => p.id));

                                const candidates = isBatting 
                                    ? getBattingTeamPlayers(playerSelector.inningIdx) 
                                    : getBowlingTeamPlayers(playerSelector.inningIdx);

                                // Show only those NOT in the current scorecard
                                const filtered = candidates
                                    .filter(p => !currentIds.has(p.id))
                                    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

                                if (filtered.length === 0) return <p className="text-center text-slate-400 text-sm py-4">No available players found.</p>;

                                return filtered.map(p => (
                                   <button 
                                     key={p.id}
                                     onClick={() => handlePreviewPlayer(p)}
                                     className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg group transition-colors text-left"
                                   >
                                      <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-500">
                                              {p.name.slice(0, 2).toUpperCase()}
                                          </div>
                                          <span className="font-bold text-slate-700">{p.name}</span>
                                      </div>
                                      <ArrowRightLeft size={16} className="text-blue-500 opacity-0 group-hover:opacity-100" />
                                   </button>
                                ));
                            })()}
                         </div>
                     </div>
                   </>
                 ) : (
                   // Preview Card View
                   <div className="relative">
                      {/* Hero Header */}
                      <div className="h-32 bg-slate-900 relative">
                         <button 
                           onClick={() => setSelectionPreview(null)}
                           className="absolute top-4 left-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm transition-colors"
                         >
                            <ArrowRightLeft size={18} />
                         </button>
                         <button 
                           onClick={() => setPlayerSelector(null)}
                           className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm transition-colors"
                         >
                            <X size={18} />
                         </button>
                         <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                            <img 
                              src={selectionPreview.avatarUrl} 
                              alt={selectionPreview.name}
                              className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl object-cover bg-slate-200"
                            />
                         </div>
                      </div>
                      
                      {/* Stats Content */}
                      <div className="pt-16 pb-6 px-6 text-center">
                         <h3 className="text-xl font-black text-slate-800 mb-1">{selectionPreview.name}</h3>
                         <div className="flex items-center justify-center gap-2 mb-6">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded">{selectionPreview.role || 'Player'}</span>
                         </div>
                         
                         <div className="grid grid-cols-4 gap-2 mb-6">
                            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                               <p className="text-[10px] font-bold text-slate-400 uppercase">Mat</p>
                               <p className="text-lg font-black text-slate-800">{selectionPreview.matchesPlayed}</p>
                            </div>
                            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                               <p className="text-[10px] font-bold text-slate-400 uppercase">Runs</p>
                               <p className="text-lg font-black text-slate-800">{selectionPreview.runsScored}</p>
                            </div>
                            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                               <p className="text-[10px] font-bold text-slate-400 uppercase">Wkts</p>
                               <p className="text-lg font-black text-slate-800">{selectionPreview.wicketsTaken}</p>
                            </div>
                            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                               <p className="text-[10px] font-bold text-slate-400 uppercase">Avg</p>
                               <p className="text-lg font-black text-slate-800">{selectionPreview.average}</p>
                            </div>
                         </div>
                         
                         <div className="space-y-3">
                             {selectionPreview.battingStyle && (
                                <div className="flex items-center justify-between text-xs px-2">
                                   <span className="text-slate-500">Batting Style</span>
                                   <span className="font-bold text-slate-800 flex items-center gap-1"><Sword size={12}/> {selectionPreview.battingStyle}</span>
                                </div>
                             )}
                             {selectionPreview.bowlingStyle && (
                                <div className="flex items-center justify-between text-xs px-2">
                                   <span className="text-slate-500">Bowling Style</span>
                                   <span className="font-bold text-slate-800 flex items-center gap-1"><CircleDot size={12}/> {selectionPreview.bowlingStyle}</span>
                                </div>
                             )}
                         </div>

                         <div className="mt-8">
                            <button 
                              onClick={handleAddPlayerFromPreview}
                              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                            >
                               <Check size={18} /> Confirm {playerSelector.type === 'batsman' ? 'Batsman' : 'Bowler'}
                            </button>
                         </div>
                      </div>
                   </div>
                 )}
             </div>
         </div>
      )}
    </div>
  );
};

export default Scorecard;