export interface BallPosition {
  over: number; // Completed overs (e.g. 17)
  ball: number; // Legal ball within the over (1 to 6). 0 means start of over / over break.
  legalBallIndex: number; // Global ball counter = over * 6 + ball
}

export function createBallPosition(over: number, ball: number): BallPosition {
  const normalizedOver = Math.max(0, Math.floor(over));
  const normalizedBall = Math.min(Math.max(0, Math.floor(ball)), 6);
  return {
    over: normalizedOver,
    ball: normalizedBall,
    legalBallIndex: normalizedOver * 6 + normalizedBall,
  };
}

export function parseBallString(str: string): BallPosition {
  const parts = str.split('.');
  const over = parseInt(parts[0], 10) || 0;
  const ball = parseInt(parts[1], 10) || 0;
  return createBallPosition(over, ball);
}

export function formatBall(pos: BallPosition): string {
  return `${pos.over}.${pos.ball}`;
}

export function compareBalls(a: BallPosition, b: BallPosition): number {
  return a.legalBallIndex - b.legalBallIndex;
}

export function ballsDifference(target: BallPosition, current: BallPosition): number {
  return target.legalBallIndex - current.legalBallIndex;
}

export type SyncStatus = 'LIVE' | 'HOLD' | 'UNREADABLE' | 'STALE' | 'REJECTED';

export type CricketFormat = 'T20' | 'ODI';

export interface PlayerStats {
  name: string;
  runs?: number;
  balls?: number;
  fours?: number;
  sixes?: number;
  wickets?: number;
  overs?: string;
  economy?: string;
  isStriker?: boolean;
}

export interface MatchDetails {
  id: string;
  title: string;
  subtitle: string;
  format: CricketFormat;
  venue: string;
  currentInnings: 1 | 2;
  battingTeam: {
    name: string;
    code: string;
    logoColor: string;
  };
  bowlingTeam: {
    name: string;
    code: string;
    logoColor: string;
  };
  score: {
    runs: number;
    wickets: number;
  };
  target: number; // e.g. 186
  requiredRuns: number;
  ballsRemaining: number;
  runRate: string;
  requiredRunRate: string;
  currentPosition: BallPosition;
  recentDeliveries: string[]; // e.g. ['•', '4', '1', 'W', '6', '2']
  striker: PlayerStats;
  nonStriker: PlayerStats;
  currentBowler: PlayerStats;
}

export interface FriendViewer {
  id: string;
  name: string;
  avatar: string;
  streamSource: string; // e.g. 'Star Sports 4K (Fiber)', 'JioCinema', 'Willow Cricket', 'Cable HD'
  currentBall: BallPosition;
  isOnline: boolean;
  status: 'watching' | 'typing' | 'idle';
  isHost?: boolean;
  isSimulated?: boolean;
}

export type MessageReactionType = 'six' | 'four' | 'wicket' | 'appeal' | 'general' | 'dot';

export interface WatchMessage {
  id: string;
  sender: string; // e.g. "Alex (Simulated)"
  senderId?: string;
  senderName: string;
  senderAvatar: string;
  senderColor?: string;
  text: string;
  position: {
    innings: number;
    legalBalls: number;
    runs: number;
    wickets: number;
  };
  ballPosition: BallPosition;
  ballFormatted: string; // "17.4"
  createdAt: number;
  timestamp: number;
  isUser: boolean;
  isLocked: boolean; // Computed dynamically
  reactionType?: MessageReactionType;
  holdReason?: string;
  isSimulated?: boolean;
}

export interface ScoreboardRecognition {
  frame_type?: 'LIVE_SCORE' | 'REPLAY' | 'AD' | 'GRAPHIC' | 'NO_SCOREBOARD' | 'UNREADABLE';
  status: SyncStatus;
  overs: number;
  over: number | null;
  ball: number | null;
  innings?: number | null;
  legalBallPosition: string;
  score: string;
  runs: number | null;
  wickets: number | null;
  teamBatting: string;
  confidence: number;
  visible_score_text?: string | null;
  ambiguity_flags?: string[];
  reason: string;
  timestamp: number;
}
