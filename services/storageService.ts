
import { Player, Match, PlayerRole, BattingStyle, BowlingStyle, OpponentTeam, FieldingStrategy } from '../types';

const PLAYERS_KEY = 'indian_strikers_players';
const MATCHES_KEY = 'indian_strikers_matches';
const OPPONENTS_KEY = 'indian_strikers_opponents';
const STRATEGIES_KEY = 'indian_strikers_strategies';

const SEED_PLAYERS: Player[] = [
  {
    id: '2259634984',
    name: 'Anees Abdul Ahad',
    role: PlayerRole.ALL_ROUNDER,
    battingStyle: BattingStyle.RIGHT_HAND,
    bowlingStyle: BowlingStyle.RIGHT_ARM_FAST,
    matchesPlayed: 45,
    runsScored: 1250,
    wicketsTaken: 32,
    average: 35.5,
    isCaptain: true,
    isAvailable: true,
    avatarUrl: 'https://ui-avatars.com/api/?name=Anees+Abdul+Ahad&background=0D8ABC&color=fff'
  },
  {
    id: '2142162607',
    name: 'Shaik Faizullah',
    role: PlayerRole.ALL_ROUNDER,
    battingStyle: BattingStyle.RIGHT_HAND,
    bowlingStyle: BowlingStyle.RIGHT_ARM_SPIN,
    matchesPlayed: 38,
    runsScored: 980,
    wicketsTaken: 25,
    average: 28.4,
    isViceCaptain: false,
    isAvailable: true,
    avatarUrl: 'https://ui-avatars.com/api/?name=Shaik+Faizullah&background=0D8ABC&color=fff'
  },
  {
    id: '2005292374',
    name: 'Akhil Raju',
    role: PlayerRole.ALL_ROUNDER,
    battingStyle: BattingStyle.RIGHT_HAND,
    bowlingStyle: BowlingStyle.RIGHT_ARM_FAST,
    matchesPlayed: 12,
    runsScored: 150,
    wicketsTaken: 5,
    average: 15.2,
    isAvailable: true,
    avatarUrl: 'https://ui-avatars.com/api/?name=Akhil+Raju&background=1e293b&color=fff'
  },
  {
    id: '2480491766',
    name: 'Amal G Pillai',
    role: PlayerRole.ALL_ROUNDER,
    battingStyle: BattingStyle.RIGHT_HAND,
    bowlingStyle: BowlingStyle.RIGHT_ARM_MEDIUM,
    matchesPlayed: 8,
    runsScored: 85,
    wicketsTaken: 2,
    average: 12.1,
    isAvailable: true,
    avatarUrl: 'https://ui-avatars.com/api/?name=Amal+G+Pillai&background=1e293b&color=fff'
  },
  {
    id: '2273034187',
    name: 'Anas Ummer',
    role: PlayerRole.ALL_ROUNDER,
    battingStyle: BattingStyle.RIGHT_HAND,
    bowlingStyle: BowlingStyle.RIGHT_ARM_SPIN,
    matchesPlayed: 22,
    runsScored: 450,
    wicketsTaken: 12,
    average: 24.5,
    isAvailable: true,
    avatarUrl: 'https://ui-avatars.com/api/?name=Anas+Ummer&background=1e293b&color=fff'
  },
  {
    id: '2338785203',
    name: 'Aneesh Ashokan',
    role: PlayerRole.ALL_ROUNDER,
    battingStyle: BattingStyle.RIGHT_HAND,
    bowlingStyle: BowlingStyle.RIGHT_ARM_FAST,
    matchesPlayed: 15,
    runsScored: 210,
    wicketsTaken: 8,
    average: 18.2,
    isAvailable: true,
    avatarUrl: 'https://ui-avatars.com/api/?name=Aneesh+Ashokan&background=1e293b&color=fff'
  },
  {
    id: '2536396514',
    name: 'Asif Habdulla',
    role: PlayerRole.ALL_ROUNDER,
    battingStyle: BattingStyle.LEFT_HAND,
    bowlingStyle: BowlingStyle.LEFT_ARM_SPIN,
    matchesPlayed: 30,
    runsScored: 620,
    wicketsTaken: 18,
    average: 26.8,
    isAvailable: true,
    avatarUrl: 'https://ui-avatars.com/api/?name=Asif+Habdulla&background=1e293b&color=fff'
  },
  {
    id: '2565227588',
    name: 'Bibin Punnurpilly',
    role: PlayerRole.ALL_ROUNDER,
    battingStyle: BattingStyle.RIGHT_HAND,
    bowlingStyle: BowlingStyle.RIGHT_ARM_MEDIUM,
    matchesPlayed: 5,
    runsScored: 45,
    wicketsTaken: 1,
    average: 9.0,
    isAvailable: true,
    avatarUrl: 'https://ui-avatars.com/api/?name=Bibin+Punnurpilly&background=1e293b&color=fff'
  },
  {
    id: '2591055542',
    name: 'Bibish Mohanan',
    role: PlayerRole.BOWLER,
    battingStyle: BattingStyle.RIGHT_HAND,
    bowlingStyle: BowlingStyle.RIGHT_ARM_FAST,
    matchesPlayed: 55,
    runsScored: 120,
    wicketsTaken: 89,
    average: 8.5,
    isAvailable: true,
    avatarUrl: 'https://ui-avatars.com/api/?name=Bibish+Mohanan&background=1e293b&color=fff'
  },
  {
    id: '2539624680',
    name: 'Mohammad Salman',
    role: PlayerRole.ALL_ROUNDER,
    battingStyle: BattingStyle.RIGHT_HAND,
    bowlingStyle: BowlingStyle.RIGHT_ARM_SPIN,
    matchesPlayed: 18,
    runsScored: 310,
    wicketsTaken: 6,
    average: 21.4,
    isAvailable: true,
    avatarUrl: 'https://ui-avatars.com/api/?name=Mohammad+Salman&background=1e293b&color=fff'
  },
  {
    id: '2532063027',
    name: 'Mohammed Khalander',
    role: PlayerRole.ALL_ROUNDER,
    battingStyle: BattingStyle.RIGHT_HAND,
    bowlingStyle: BowlingStyle.RIGHT_ARM_MEDIUM,
    matchesPlayed: 10,
    runsScored: 180,
    wicketsTaken: 4,
    average: 19.5,
    isAvailable: true,
    avatarUrl: 'https://ui-avatars.com/api/?name=Mohammed+Khalander&background=1e293b&color=fff'
  },
  {
    id: '2259417273',
    name: 'Nastar Puthen Purayil',
    role: PlayerRole.ALL_ROUNDER,
    battingStyle: BattingStyle.RIGHT_HAND,
    bowlingStyle: BowlingStyle.RIGHT_ARM_FAST,
    matchesPlayed: 25,
    runsScored: 410,
    wicketsTaken: 15,
    average: 22.1,
    isAvailable: true,
    avatarUrl: 'https://ui-avatars.com/api/?name=Nastar+Puthen+Purayil&background=1e293b&color=fff'
  },
  {
    id: '2469993741',
    name: 'Prasanth Padmanabhan',
    role: PlayerRole.ALL_ROUNDER,
    battingStyle: BattingStyle.RIGHT_HAND,
    bowlingStyle: BowlingStyle.RIGHT_ARM_SPIN,
    matchesPlayed: 40,
    runsScored: 890,
    wicketsTaken: 22,
    average: 31.2,
    isAvailable: true,
    avatarUrl: 'https://ui-avatars.com/api/?name=Prasanth+Padmanabhan&background=1e293b&color=fff'
  },
  {
    id: '2572967242',
    name: 'Qamruddin Ansari',
    role: PlayerRole.ALL_ROUNDER,
    battingStyle: BattingStyle.RIGHT_HAND,
    bowlingStyle: BowlingStyle.RIGHT_ARM_MEDIUM,
    matchesPlayed: 14,
    runsScored: 195,
    wicketsTaken: 7,
    average: 16.8,
    isAvailable: true,
    avatarUrl: 'https://ui-avatars.com/api/?name=Qamruddin+Ansari&background=1e293b&color=fff'
  },
  {
    id: '2468269531',
    name: 'Sebin Baby',
    role: PlayerRole.WICKET_KEEPER,
    battingStyle: BattingStyle.RIGHT_HAND,
    bowlingStyle: BowlingStyle.NONE,
    matchesPlayed: 65,
    runsScored: 1850,
    wicketsTaken: 0,
    average: 38.6,
    isAvailable: true,
    avatarUrl: 'https://ui-avatars.com/api/?name=Sebin+Baby&background=1e293b&color=fff'
  },
  {
    id: '2487676161',
    name: 'Shymon Shihabudeen',
    role: PlayerRole.ALL_ROUNDER,
    battingStyle: BattingStyle.RIGHT_HAND,
    bowlingStyle: BowlingStyle.RIGHT_ARM_FAST,
    matchesPlayed: 28,
    runsScored: 520,
    wicketsTaken: 19,
    average: 24.1,
    isAvailable: true,
    avatarUrl: 'https://ui-avatars.com/api/?name=Shymon+Shihabudeen&background=1e293b&color=fff'
  }
];

const SEED_MATCHES: Match[] = [
  {
    id: 'm1',
    opponent: 'Australia',
    date: '2023-11-19',
    venue: 'RCA-1',
    result: 'Lost',
    scoreFor: '240/10',
    scoreAgainst: '241/4',
    isUpcoming: false,
    tournament: 'World Cup',
    tossTime: '13:30'
  },
  {
    id: 'm2',
    opponent: 'South Africa',
    date: '2024-01-15',
    venue: 'RCA-5',
    result: 'Won',
    scoreFor: '320/5',
    scoreAgainst: '210/10',
    isUpcoming: false,
    tournament: 'Freedom Series',
    tossTime: '14:00'
  },
  {
    id: 'm3',
    opponent: 'England',
    date: '2024-06-20',
    venue: 'RCA-12',
    isUpcoming: true,
    tournament: 'Summer Bash',
    tossTime: '10:00'
  },
  {
    id: 'm4',
    opponent: 'Pakistan',
    date: '2024-07-05',
    venue: 'RCA-3',
    isUpcoming: true,
    tournament: 'Champions Trophy',
    tossTime: '18:30'
  }
];

const SEED_OPPONENTS: OpponentTeam[] = [
  { 
    id: '1', 
    name: 'Australia', 
    rank: 1, 
    strength: 'Pace Bowling', 
    weakness: 'Spin', 
    players: [{id: '1', name: 'Pat Cummins'}, {id: '2', name: 'David Warner'}],
    color: 'bg-yellow-400' 
  },
  { 
    id: '2', 
    name: 'England', 
    rank: 3, 
    strength: 'Batting Depth', 
    weakness: 'Death Bowling', 
    players: [{id: '1', name: 'Jos Buttler'}, {id: '2', name: 'Joe Root'}],
    color: 'bg-blue-600' 
  },
  { 
    id: '3', 
    name: 'South Africa', 
    rank: 4, 
    strength: 'Fielding', 
    weakness: 'Chasing', 
    players: [{id: '1', name: 'Kagiso Rabada'}],
    color: 'bg-green-600' 
  },
];

const SEED_STRATEGIES: FieldingStrategy[] = [
  {
    id: '1',
    name: 'Powerplay (Aggressive)',
    batterHand: 'RHB',
    matchPhase: 'Powerplay',
    bowlerId: '3',
    batterId: '1',
    positions: [
       { playerId: '5', left: 48, top: 15 }, // WK
       { playerId: '3', left: 52, top: 65 }, // Bowler
    ]
  }
];

export const getPlayers = (): Player[] => {
  const stored = localStorage.getItem(PLAYERS_KEY);
  if (!stored) {
    localStorage.setItem(PLAYERS_KEY, JSON.stringify(SEED_PLAYERS));
    return SEED_PLAYERS;
  }
  return JSON.parse(stored);
};

export const savePlayers = (players: Player[]) => {
  localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
};

export const getMatches = (): Match[] => {
  const stored = localStorage.getItem(MATCHES_KEY);
  if (!stored) {
    localStorage.setItem(MATCHES_KEY, JSON.stringify(SEED_MATCHES));
    return SEED_MATCHES;
  }
  return JSON.parse(stored);
};

export const saveMatches = (matches: Match[]) => {
  localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
};

export const getOpponents = (): OpponentTeam[] => {
  const stored = localStorage.getItem(OPPONENTS_KEY);
  if (!stored) {
    localStorage.setItem(OPPONENTS_KEY, JSON.stringify(SEED_OPPONENTS));
    return SEED_OPPONENTS;
  }
  return JSON.parse(stored);
};

export const saveOpponents = (teams: OpponentTeam[]) => {
  localStorage.setItem(OPPONENTS_KEY, JSON.stringify(teams));
};

export const getStrategies = (): FieldingStrategy[] => {
  const stored = localStorage.getItem(STRATEGIES_KEY);
  if (!stored) {
    localStorage.setItem(STRATEGIES_KEY, JSON.stringify(SEED_STRATEGIES));
    return SEED_STRATEGIES;
  }
  return JSON.parse(stored);
};

export const saveStrategies = (strategies: FieldingStrategy[]) => {
  localStorage.setItem(STRATEGIES_KEY, JSON.stringify(strategies));
};