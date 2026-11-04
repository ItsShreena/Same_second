import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  MatchDetails,
  BallPosition,
  FriendViewer,
  WatchMessage,
  SyncStatus,
  ScoreboardRecognition,
  MessageReactionType,
  createBallPosition,
  formatBall,
  compareBalls,
} from '../types/cricket';
import { SAMPLE_MATCHES, INITIAL_FRIENDS, INITIAL_MESSAGES } from '../data/sampleMatches';

interface WatchContextType {
  match: MatchDetails;
  viewerBall: BallPosition;
  syncStatus: SyncStatus;
  isManualHold: boolean;
  confidence: number;
  lastSyncReason: string;
  friends: FriendViewer[];
  messages: WatchMessage[];
  userName: string;
  roomCode: string;
  isDemoMode: boolean;
  demoAutoPlay: boolean;
  isScoreboardModalOpen: boolean;
  isRecalibrationModalOpen: boolean;
  isEvaluationModalOpen: boolean;
  unreadLockedCount: number;
  lastUnlockedMessageId: string | null;

  // Actions
  setViewerBall: (over: number, ball: number) => void;
  advanceBall: () => void;
  rewindBall: () => void;
  jumpToPosition: (over: number, ball: number) => void;
  toggleManualHold: () => void;
  setSyncStatus: (status: SyncStatus, reason?: string, confidence?: number) => void;
  sendMessage: (text: string, reactionType?: MessageReactionType, overrideBall?: BallPosition) => void;
  applyScoreboardDetection: (result: Partial<ScoreboardRecognition>) => void;
  setMatchById: (matchId: string) => void;
  setUserName: (name: string) => void;
  setRoomCode: (code: string) => void;
  setIsDemoMode: (enabled: boolean) => void;
  toggleDemoAutoPlay: () => void;
  triggerDemoAlexSpoiler: () => void;
  triggerDemoAdvanceToAlex: () => void;
  triggerDemoUnreadableHold: () => void;
  triggerDemoSuspiciousRejected: () => void;
  triggerDemoValidRecovery: () => void;
  sendSimulatedAlexMessage: (params?: {
    text?: string;
    over?: number;
    ball?: number;
    reactionType?: MessageReactionType;
  }) => void;
  triggerDemoSpoiler: () => void;
  triggerDemoWicketScenario: () => void;
  triggerDemoAdHold: () => void;
  setIsScoreboardModalOpen: (open: boolean) => void;
  setIsRecalibrationModalOpen: (open: boolean) => void;
  setIsEvaluationModalOpen: (open: boolean) => void;
}

const WatchContext = createContext<WatchContextType | undefined>(undefined);

export const WatchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [match, setMatch] = useState<MatchDetails>(SAMPLE_MATCHES[0]);
  const [viewerBall, setViewerBallState] = useState<BallPosition>(SAMPLE_MATCHES[0].currentPosition);
  const [syncStatus, setSyncStatusState] = useState<SyncStatus>('LIVE');
  const [isManualHold, setIsManualHold] = useState<boolean>(false);
  const [confidence, setConfidence] = useState<number>(96);
  const [lastSyncReason, setLastSyncReason] = useState<string>('Scoreboard tracking active on broadcast ticker.');
  const [friends, setFriends] = useState<FriendViewer[]>(INITIAL_FRIENDS);
  const [rawMessages, setRawMessages] = useState<WatchMessage[]>(INITIAL_MESSAGES);
  const [userName, setUserName] = useState<string>('Cricket Fan');
  const [roomCode, setRoomCode] = useState<string>('IND-AUS-772');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [demoAutoPlay, setDemoAutoPlay] = useState<boolean>(false);
  const [isScoreboardModalOpen, setIsScoreboardModalOpen] = useState<boolean>(false);
  const [isRecalibrationModalOpen, setIsRecalibrationModalOpen] = useState<boolean>(false);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState<boolean>(false);
  const [lastUnlockedMessageId, setLastUnlockedMessageId] = useState<string | null>(null);

  // Initial set of released message IDs based on starting baseline (Over 17.2)
  const [releasedMessageIds, setReleasedMessageIds] = useState<Set<string>>(() => {
    const initialSet = new Set<string>();
    const initInnings = SAMPLE_MATCHES[0].currentInnings;
    const initLegal = SAMPLE_MATCHES[0].currentPosition.legalBallIndex;
    for (const msg of INITIAL_MESSAGES) {
      if (msg.isUser) {
        initialSet.add(msg.id);
        continue;
      }
      const msgInnings = msg.position?.innings ?? 2;
      const msgLegal = msg.position?.legalBalls ?? msg.ballPosition.legalBallIndex;
      if (msgInnings < initInnings || (msgInnings === initInnings && msgLegal <= initLegal)) {
        initialSet.add(msg.id);
      }
    }
    return initialSet;
  });

  // STRICT SPOILER RELEASE ENGINE:
  // 1. Each message is tagged with the sender's match position.
  // 2. The viewer has a committed, validated match position (viewerBall).
  // 3. A message can be displayed as unlocked only when the viewer has caught up to or passed the message's tagged position.
  // 4. Compare innings first, then legalBalls. Never compare decimal overs!
  // 5. If the viewer is in HOLD, STALE, UNREADABLE or REJECTED state, do not unlock pending messages.
  // 6. Use a fresh confirmed position before releasing messages.
  // 7. Do not display locked message contents to the viewer before release.
  useEffect(() => {
    // If the viewer is in an uncertain state, freeze all pending message unlocks
    const isUncertainState =
      syncStatus === 'HOLD' ||
      syncStatus === 'STALE' ||
      syncStatus === 'UNREADABLE' ||
      syncStatus === 'REJECTED' ||
      isManualHold;

    if (isUncertainState) {
      // Freezes release of any pending messages
      return;
    }

    // When status is LIVE and validated, evaluate pending messages for release:
    // Compare innings first, then exact legalBalls (over * 6 + ball). Never compare decimal overs!
    const currentInnings = match.currentInnings;
    const currentLegal = viewerBall.legalBallIndex;

    setReleasedMessageIds((prev) => {
      let changed = false;
      const next = new Set(prev);

      for (const msg of rawMessages) {
        if (msg.isUser) {
          if (!next.has(msg.id)) {
            next.add(msg.id);
            changed = true;
          }
          continue;
        }

        const msgInnings = msg.position?.innings ?? 2;
        const msgLegal = msg.position?.legalBalls ?? msg.ballPosition.legalBallIndex;

        // Check if viewer has caught up to or passed message tagged position
        const hasCaughtUp =
          msgInnings < currentInnings ||
          (msgInnings === currentInnings && msgLegal <= currentLegal);

        if (hasCaughtUp && !next.has(msg.id)) {
          next.add(msg.id);
          changed = true;
          setLastUnlockedMessageId(msg.id);
        }
      }

      return changed ? next : prev;
    });
  }, [viewerBall, syncStatus, isManualHold, rawMessages, match.currentInnings]);

  const computedMessages = rawMessages.map((msg) => {
    // User's own message is visible to themselves immediately
    if (msg.isUser) {
      return { ...msg, isLocked: false };
    }

    const isReleased = releasedMessageIds.has(msg.id);
    const isLocked = !isReleased;

    let holdReason: string | undefined;
    if (isLocked) {
      if (syncStatus === 'HOLD') {
        holdReason = 'Broadcast is in HOLD (commercials/replay). Pending messages remain locked until live play resumes.';
      } else if (syncStatus === 'STALE') {
        holdReason = 'Score ticker has not moved. Status: STALE — pending messages remain locked.';
      } else if (syncStatus === 'UNREADABLE') {
        holdReason = 'Scoreboard unreadable or camera obscured. Pending messages remain locked.';
      } else if (syncStatus === 'REJECTED') {
        holdReason = 'Suspicious backward delivery rejected by Position Engine. Spoilers protected.';
      } else if (isManualHold) {
        holdReason = 'Manual HOLD active — pending messages locked until stream is resumed.';
      } else {
        holdReason = `Tagged at Over ${msg.ballFormatted}. Your stream is at Over ${formatBall(viewerBall)}.`;
      }
    }

    return {
      ...msg,
      isLocked,
      holdReason,
    };
  });

  const unreadLockedCount = computedMessages.filter((m) => m.isLocked).length;

  const setViewerBall = useCallback((over: number, ball: number) => {
    const newPos = createBallPosition(over, ball);
    setViewerBallState(newPos);
  }, []);

  const jumpToPosition = useCallback((over: number, ball: number) => {
    const newPos = createBallPosition(over, ball);
    setViewerBallState(newPos);
    setLastSyncReason(`Manually calibrated stream to Over ${formatBall(newPos)}.`);
    setSyncStatusState('LIVE');
    setIsManualHold(false);
  }, []);

  const advanceBall = useCallback(() => {
    setViewerBallState((prev) => {
      let nextOver = prev.over;
      let nextBall = prev.ball + 1;
      if (nextBall > 6) {
        nextOver += 1;
        nextBall = 1;
      }
      return createBallPosition(nextOver, nextBall);
    });
  }, []);

  const rewindBall = useCallback(() => {
    setViewerBallState((prev) => {
      let nextOver = prev.over;
      let nextBall = prev.ball - 1;
      if (nextBall < 1) {
        if (nextOver > 0) {
          nextOver -= 1;
          nextBall = 6;
        } else {
          nextBall = 0;
        }
      }
      return createBallPosition(nextOver, nextBall);
    });
  }, []);

  const toggleManualHold = useCallback(() => {
    setIsManualHold((prev) => {
      const next = !prev;
      if (next) {
        setSyncStatusState('HOLD');
        setLastSyncReason('Manual HOLD engaged. Messages locked until you resume watching.');
      } else {
        setSyncStatusState('LIVE');
        setLastSyncReason('Stream resumed. Sync active.');
      }
      return next;
    });
  }, []);

  const setSyncStatus = useCallback((status: SyncStatus, reason?: string, conf?: number) => {
    setSyncStatusState(status);
    if (reason) setLastSyncReason(reason);
    if (conf !== undefined) setConfidence(conf);
    if (status === 'HOLD' || status === 'STALE' || status === 'REJECTED') {
      setIsManualHold(true);
    } else if (status === 'LIVE') {
      setIsManualHold(false);
    }
  }, []);

  const sendMessage = useCallback(
    (text: string, reactionType: MessageReactionType = 'general', overrideBall?: BallPosition) => {
      if (!text.trim()) return;

      const targetBall = overrideBall || viewerBall;
      const newMsg: WatchMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        sender: userName || 'You',
        senderId: 'user-self',
        senderName: userName || 'You',
        senderAvatar: 'YOU',
        senderColor: '#ccff00',
        text: text.trim(),
        position: {
          innings: match.currentInnings,
          legalBalls: targetBall.legalBallIndex,
          runs: match.score.runs,
          wickets: match.score.wickets,
        },
        ballPosition: targetBall,
        ballFormatted: formatBall(targetBall),
        createdAt: Date.now(),
        timestamp: Date.now(),
        isUser: true,
        isLocked: false,
        reactionType,
        isSimulated: false,
      };

      setRawMessages((prev) => [...prev, newMsg]);
    },
    [viewerBall, userName, match]
  );

  const applyScoreboardDetection = useCallback((res: Partial<ScoreboardRecognition>) => {
    if (res.confidence !== undefined) {
      const confPct = res.confidence <= 1 ? Math.round(res.confidence * 100) : res.confidence;
      setConfidence(confPct);
    }

    if (
      (res.frame_type === 'LIVE_SCORE' || res.status === 'LIVE') &&
      typeof res.over === 'number' &&
      typeof res.ball === 'number'
    ) {
      const detected = createBallPosition(res.over, res.ball);
      setViewerBallState(detected);
      setSyncStatusState('LIVE');
      setIsManualHold(false);
      setLastSyncReason(res.reason || `Synchronized to Over ${formatBall(detected)} via broadcast recognition.`);
    } else if (
      res.frame_type === 'REPLAY' ||
      res.frame_type === 'AD' ||
      res.frame_type === 'GRAPHIC' ||
      res.status === 'HOLD'
    ) {
      setSyncStatusState('HOLD');
      setIsManualHold(true);
      setLastSyncReason(
        res.reason || `Broadcast is in ${res.frame_type || 'HOLD'} state. Spoilers safely shielded.`
      );
    } else if (res.status === 'REJECTED') {
      setSyncStatusState('REJECTED');
      setIsManualHold(true);
      setLastSyncReason(
        res.reason || 'Suspicious backward delivery rejected by Position Engine. Spoilers protected.'
      );
    } else {
      setSyncStatusState('UNREADABLE');
      setLastSyncReason(
        res.reason || 'No clear scoreboard verified. Spoilers remain locked.'
      );
    }
  }, []);

  const setMatchById = useCallback((matchId: string) => {
    const selected = SAMPLE_MATCHES.find((m) => m.id === matchId) || SAMPLE_MATCHES[0];
    setMatch(selected);
    setViewerBallState(selected.currentPosition);
    setSyncStatusState('LIVE');
    setIsManualHold(false);
  }, []);

  const toggleDemoAutoPlay = useCallback(() => {
    setDemoAutoPlay((prev) => !prev);
  }, []);

  // DEMO ACTIONS: Specifically featuring simulated friend ALEX & failure recovery

  // DEMO ACTIONS: Specifically featuring simulated friend ALEX & failure recovery

  // General simulated message sender for Alex (allows testing any match position)
  const sendSimulatedAlexMessage = useCallback(
    (params?: {
      text?: string;
      over?: number;
      ball?: number;
      reactionType?: MessageReactionType;
    }) => {
      const over = params?.over ?? 17;
      const ball = params?.ball ?? 4;
      const alexBall = createBallPosition(over, ball);
      const text =
        params?.text ??
        `NOOOO! Slower cutter, chipped in the air... Cummins catches it at mid-off! Wicket fallen! ☝️`;
      const reactionType = params?.reactionType ?? 'wicket';

      const alexMsg: WatchMessage = {
        id: `alex-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        sender: 'Alex (Simulated)',
        senderId: 'friend-alex',
        senderName: 'Alex T.',
        senderAvatar: 'AL',
        senderColor: '#38bdf8',
        text,
        position: {
          innings: match.currentInnings,
          legalBalls: alexBall.legalBallIndex,
          runs: 164,
          wickets: 5,
        },
        ballPosition: alexBall,
        ballFormatted: formatBall(alexBall),
        createdAt: Date.now(),
        timestamp: Date.now(),
        isUser: false,
        isLocked: true,
        reactionType,
        isSimulated: true,
      };

      setRawMessages((prev) => [...prev, alexMsg]);
      setLastSyncReason(
        `Alex (Simulated) sent message tagged at Over ${formatBall(alexBall)}.`
      );
    },
    [match.currentInnings]
  );

  // 1. Viewer at 17.2. Alex sends spoiler message tagged at Over 17.4 -> Stays Locked!
  const triggerDemoAlexSpoiler = useCallback(() => {
    // Set viewer position to 17.2
    setViewerBallState(createBallPosition(17, 2));
    setSyncStatusState('LIVE');
    setIsManualHold(false);
    setConfidence(96);

    const alexBall = createBallPosition(17, 4);
    const alexMsg: WatchMessage = {
      id: `alex-spoiler-17-4-${Date.now()}`,
      sender: 'Alex (Simulated)',
      senderId: 'friend-alex',
      senderName: 'Alex T.',
      senderAvatar: 'AL',
      senderColor: '#38bdf8',
      text: 'NOOOO! Slower cutter, chipped in the air... Cummins catches it at mid-off! Wicket fallen! ☝️',
      position: { innings: 2, legalBalls: 17 * 6 + 4, runs: 164, wickets: 5 },
      ballPosition: alexBall,
      ballFormatted: '17.4',
      createdAt: Date.now(),
      timestamp: Date.now(),
      isUser: false,
      isLocked: true,
      reactionType: 'wicket',
      isSimulated: true,
    };

    setRawMessages((prev) => [...prev, alexMsg]);
    setLastSyncReason(
      'Viewer at Over 17.2. Alex (Simulated) sent spoiler tagged at Over 17.4 — Message remains locked behind spoiler shield!'
    );
  }, []);

  // 2. Viewer advances to 17.4 with a valid confirmed reading -> Message unlocks!
  const triggerDemoAdvanceToAlex = useCallback(() => {
    setViewerBallState(createBallPosition(17, 4));
    setSyncStatusState('LIVE');
    setIsManualHold(false);
    setConfidence(98);
    setLastSyncReason(
      'Confirmed position: Over 17.4 via valid reading. Viewer caught up to Alex’s message -> smoothly unlocked!'
    );
  }, []);

  // 3. Viewer enters HOLD (commercial break/replay) -> A pending message stays locked!
  const triggerDemoUnreadableHold = useCallback(() => {
    setSyncStatusState('HOLD');
    setIsManualHold(true);
    setConfidence(35);

    // Send a pending message tagged at Over 17.5
    const nextBall = createBallPosition(17, 5);
    const pendingMsg: WatchMessage = {
      id: `alex-pending-hold-${Date.now()}`,
      sender: 'Alex (Simulated)',
      senderId: 'friend-alex',
      senderName: 'Alex T.',
      senderAvatar: 'AL',
      senderColor: '#38bdf8',
      text: 'Starc steams in with the old ball, reverse swing starting! 🏏',
      position: { innings: 2, legalBalls: 17 * 6 + 5, runs: 165, wickets: 5 },
      ballPosition: nextBall,
      ballFormatted: '17.5',
      createdAt: Date.now(),
      timestamp: Date.now(),
      isUser: false,
      isLocked: true,
      reactionType: 'general',
      isSimulated: true,
    };

    setRawMessages((prev) => [...prev, pendingMsg]);
    setLastSyncReason(
      'TV commercial break / replay. Scoreboard unreadable. Status: HOLD. Pending message at Over 17.5 stays strictly locked!'
    );
  }, []);

  // 4. Position Validation Engine intercepts a suspicious / backward AI reading
  const triggerDemoSuspiciousRejected = useCallback(() => {
    setSyncStatusState('REJECTED');
    setIsManualHold(true);
    setConfidence(42);
    setLastSyncReason(
      'Inconsistent reading (Over 16.2) blocked: replay delivery is behind your current stream. Spoilers protected.'
    );
  }, []);

  // 5. A new valid reading is accepted -> The pending message can then be evaluated for release and unlocks!
  const triggerDemoValidRecovery = useCallback(() => {
    setViewerBallState(createBallPosition(17, 5));
    setSyncStatusState('LIVE');
    setIsManualHold(false);
    setConfidence(98);
    setLastSyncReason(
      'New valid reading accepted (Over 17.5). Status LIVE restored. Pending message evaluated for release and unlocked!'
    );
  }, []);

  const triggerDemoSpoiler = triggerDemoAlexSpoiler;
  const triggerDemoAdHold = triggerDemoUnreadableHold;
  const triggerDemoWicketScenario = useCallback(() => {
    const wicketBall = createBallPosition(viewerBall.over, Math.min(viewerBall.ball + 2, 6));
    const wicketMsg: WatchMessage = {
      id: `spoiler-wicket-${Date.now()}`,
      sender: 'Alex (Simulated)',
      senderId: 'friend-alex',
      senderName: 'Alex T.',
      senderAvatar: 'AL',
      senderColor: '#38bdf8',
      text: 'GONE!! Caught at long on! Huge wicket! Look at the celebration! ☝️💥',
      position: { innings: 2, legalBalls: wicketBall.legalBallIndex, runs: 164, wickets: 5 },
      ballPosition: wicketBall,
      ballFormatted: formatBall(wicketBall),
      createdAt: Date.now(),
      timestamp: Date.now(),
      isUser: false,
      isLocked: true,
      reactionType: 'wicket',
      isSimulated: true,
    };
    setRawMessages((prev) => [...prev, wicketMsg]);
  }, [viewerBall]);

  // Demo auto play timer
  useEffect(() => {
    if (!demoAutoPlay) return;

    const interval = setInterval(() => {
      advanceBall();
    }, 4000);

    return () => clearInterval(interval);
  }, [demoAutoPlay, advanceBall]);

  // Keep match score synchronized with viewer progression
  useEffect(() => {
    setMatch((prev) => ({
      ...prev,
      currentPosition: viewerBall,
    }));
  }, [viewerBall]);

  return (
    <WatchContext.Provider
      value={{
        match,
        viewerBall,
        syncStatus,
        isManualHold,
        confidence,
        lastSyncReason,
        friends,
        messages: computedMessages,
        userName,
        roomCode,
        isDemoMode,
        demoAutoPlay,
        isScoreboardModalOpen,
        isRecalibrationModalOpen,
        isEvaluationModalOpen,
        unreadLockedCount,
        lastUnlockedMessageId,
        setViewerBall,
        advanceBall,
        rewindBall,
        jumpToPosition,
        toggleManualHold,
        setSyncStatus,
        sendMessage,
        applyScoreboardDetection,
        setMatchById,
        setUserName,
        setRoomCode,
        setIsDemoMode,
        toggleDemoAutoPlay,
        triggerDemoAlexSpoiler,
        triggerDemoAdvanceToAlex,
        triggerDemoUnreadableHold,
        triggerDemoSuspiciousRejected,
        triggerDemoValidRecovery,
        sendSimulatedAlexMessage,
        triggerDemoSpoiler,
        triggerDemoWicketScenario,
        triggerDemoAdHold,
        setIsScoreboardModalOpen,
        setIsRecalibrationModalOpen,
        setIsEvaluationModalOpen,
      }}
    >
      {children}
    </WatchContext.Provider>
  );
};

export function useWatch(): WatchContextType {
  const context = useContext(WatchContext);
  if (!context) {
    throw new Error('useWatch must be used within a WatchProvider');
  }
  return context;
}
