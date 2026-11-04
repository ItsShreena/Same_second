import { BallPosition } from '../types/cricket';

export interface PositionValidationResult {
  isValid: boolean;
  action: 'SYNC' | 'HOLD' | 'REJECT';
  reason: string;
  deltaBalls: number;
}

/**
 * Creates a small downscaled grayscale thumbnail (e.g. 32x32) from a canvas region.
 */
export function extractGrayscaleThumbnail(
  sourceCanvas: HTMLCanvasElement,
  cropX: number,
  cropY: number,
  cropW: number,
  cropH: number,
  thumbSize = 32
): Uint8ClampedArray {
  const offscreen = document.createElement('canvas');
  offscreen.width = thumbSize;
  offscreen.height = thumbSize;
  const ctx = offscreen.getContext('2d');
  if (!ctx) return new Uint8ClampedArray(thumbSize * thumbSize);

  // Draw the cropped region scaled down into thumbSize x thumbSize
  ctx.drawImage(sourceCanvas, cropX, cropY, cropW, cropH, 0, 0, thumbSize, thumbSize);
  const imgData = ctx.getImageData(0, 0, thumbSize, thumbSize);
  const data = imgData.data;
  const grayscale = new Uint8ClampedArray(thumbSize * thumbSize);

  for (let i = 0; i < grayscale.length; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    // Standard luminance weights
    grayscale[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  }

  return grayscale;
}

/**
 * Computes a difference hash (dHash) string from grayscale thumbnail
 */
export function computeGrayscaleHash(grayscale: Uint8ClampedArray, size = 32): string {
  let hash = '';
  // Compare adjacent pixels
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size - 1; x++) {
      const idx = y * size + x;
      hash += grayscale[idx] < grayscale[idx + 1] ? '1' : '0';
    }
  }
  return hash;
}

/**
 * Compares two consecutive grayscale thumbnails and returns the mean absolute difference (0.0 to 1.0)
 */
export function compareThumbnails(
  thumbA: Uint8ClampedArray,
  thumbB: Uint8ClampedArray
): number {
  if (thumbA.length !== thumbB.length || thumbA.length === 0) return 1.0;
  let totalDiff = 0;
  for (let i = 0; i < thumbA.length; i++) {
    totalDiff += Math.abs(thumbA[i] - thumbB[i]);
  }
  // Normalized mean difference between 0.0 and 1.0
  return totalDiff / (thumbA.length * 255);
}

/**
 * Position Validation Engine
 * Ensures AI vision readings comply with cricket rules and match continuity
 * before allowing messages to be unlocked.
 */
export function validateCricketPosition(
  currentViewerBall: BallPosition,
  detectedOver: number | null,
  detectedBall: number | null,
  confidence: number,
  frameType: string,
  ambiguityFlags: string[] = []
): PositionValidationResult {
  // Rule 1: Non-live frame types immediately trigger HOLD
  if (frameType === 'REPLAY') {
    return {
      isValid: false,
      action: 'HOLD',
      reason: 'Replay detected on broadcast: holding messages to prevent spoiler desync.',
      deltaBalls: 0,
    };
  }

  if (frameType === 'AD') {
    return {
      isValid: false,
      action: 'HOLD',
      reason: 'Commercial break in progress: score ticker is paused.',
      deltaBalls: 0,
    };
  }

  if (frameType === 'GRAPHIC') {
    return {
      isValid: false,
      action: 'HOLD',
      reason: 'Statistics graphic or wagon wheel active: live ticker obscured.',
      deltaBalls: 0,
    };
  }

  if (frameType === 'NO_SCOREBOARD' || frameType === 'UNREADABLE') {
    return {
      isValid: false,
      action: 'HOLD',
      reason: 'Scoreboard unreadable or missing. Holding incoming messages safely.',
      deltaBalls: 0,
    };
  }

  // Rule 2: Ambiguity flags trigger HOLD
  if (ambiguityFlags.length > 0) {
    return {
      isValid: false,
      action: 'HOLD',
      reason: `Ambiguity detected (${ambiguityFlags.join(', ')}). Holding until verified.`,
      deltaBalls: 0,
    };
  }

  // Rule 3: Missing numerical values
  if (detectedOver === null || detectedBall === null) {
    return {
      isValid: false,
      action: 'HOLD',
      reason: 'Overs or ball number could not be extracted with certainty.',
      deltaBalls: 0,
    };
  }

  // Rule 4: Confidence threshold (minimum 0.70 required for automatic unlock)
  if (confidence < 0.70) {
    return {
      isValid: false,
      action: 'HOLD',
      reason: `Low recognition confidence (${(confidence * 100).toFixed(0)}%). Safe HOLD engaged.`,
      deltaBalls: 0,
    };
  }

  // Rule 5: Continuity and direction validation
  const detectedBallIndex = detectedOver * 6 + detectedBall;
  const currentBallIndex = currentViewerBall.legalBallIndex;
  const deltaBalls = detectedBallIndex - currentBallIndex;

  // Ball went backwards (e.g. camera caught an earlier replay ball or misread)
  if (deltaBalls < 0) {
    return {
      isValid: false,
      action: 'REJECT',
      reason: `Detected ball (${detectedOver}.${detectedBall}) is behind confirmed stream position (${currentViewerBall.over}.${currentViewerBall.ball}). Potential replay rejected.`,
      deltaBalls,
    };
  }

  // Ball jumped forward by more than 8 deliveries in one jump (implausible for a live stream)
  if (deltaBalls > 8) {
    return {
      isValid: false,
      action: 'HOLD',
      reason: `Scoreboard jumped forward by ${deltaBalls} balls unexpectedly. Requires manual confirmation before unlocking.`,
      deltaBalls,
    };
  }

  // Valid continuous progression: 0 to 8 balls ahead
  return {
    isValid: true,
    action: 'SYNC',
    reason: `Position validated: Over ${detectedOver}.${detectedBall} (${deltaBalls >= 0 ? `+${deltaBalls}` : deltaBalls} balls from baseline).`,
    deltaBalls,
  };
}
