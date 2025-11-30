
export type UserRole = 'admin' | 'member' | 'guest';

export enum PlayerRole {
  BATSMAN = 'Batsman',
  BOWLER = 'Bowler',
  ALL_ROUNDER = 'All-Rounder',
  WICKET_KEEPER = 'Wicket Keeper'
}

export enum BattingStyle {
  RIGHT_HAND = 'Right Handed',
  LEFT_HAND = 'Left Handed'
}

export enum BowlingStyle {
  RIGHT_ARM_FAST = 'Right-Arm Fast',
  RIGHT_ARM_MEDIUM = 'Right-Arm Medium',
  RIGHT_ARM_SPIN = 'Right-Arm Spin',
  LEFT_ARM_FAST = 'Left-Arm Fast',
  LEFT_ARM_SPIN = 'Left-Arm Spin',
  NONE = 'None'
}

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  battingStyle: BattingStyle;
  bowlingStyle: BowlingStyle;
  matchesPlayed: number;
  runsScored: number;
  wicketsTaken: number;
  average: number;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  isAvailable?: boolean;
  avatarUrl?: string;
}

export interface Match {
  id: string;
  opponent: string;
  date: string;
  venue: string; // Ground
  result?: 'Won' | 'Lost' | 'Draw' | 'Pending';
  scoreFor?: string;
  scoreAgainst?: string;
  isUpcoming: boolean;
  tournament?: string;
  tossTime?: string;
}

export interface OpponentPlayer {
  id: string;
  name: string;
}

export interface OpponentTeam {
  id: string;
  name: string;
  logoUrl?: string;
  rank?: number;
  strength?: string;
  weakness?: string;
  players: OpponentPlayer[];
  color?: string; 
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export interface FieldPosition {
  playerId: string;
  left: number; // Percentage 0-100
  top: number; // Percentage 0-100
}

export interface FieldingStrategy {
  id: string;
  name: string;
  batterHand: 'RHB' | 'LHB';
  matchPhase?: 'Powerplay' | 'Middle' | 'Death';
  bowlerId?: string;
  batterId?: string;
  positions: FieldPosition[];
}