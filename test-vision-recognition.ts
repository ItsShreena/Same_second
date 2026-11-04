
import { ScoreboardRecognitionSchema } from './src/types/scoreboard.js';
import {
  validateCricketPosition,
  compareThumbnails,
  computeGrayscaleHash,
} from './src/utils/scoreboardMonitor.js';
import { createBallPosition } from './src/types/cricket.js';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }
}

function runTests(): void {
  console.log('\n==============================================');
  console.log('SAME SECOND - VISION & VALIDATION TESTS');
  console.log('==============================================\n');

  // Test 1: Valid live scoreboard response.
  const liveScore = ScoreboardRecognitionSchema.safeParse({
    frame_type: 'LIVE_SCORE',
    innings: 2,
    runs: 128,
    wickets: 4,
    over: 17,
    ball: 4,
    confidence: 0.95,
    visible_score_text: '128/4',
    ambiguity_flags: [],
  });

  assert(liveScore.success, 'Valid live scoreboard should pass schema validation.');
  console.log('PASS: Test 1 (Live Score Response Schema)');

  // Test 2: Valid unreadable scoreboard response.
  const unreadableScore = ScoreboardRecognitionSchema.safeParse({
    frame_type: 'UNREADABLE',
    innings: null,
    runs: null,
    wickets: null,
    over: null,
    ball: null,
    confidence: 0,
    visible_score_text: null,
    ambiguity_flags: ['AMBIGUOUS_CURRENT_INNINGS'],
  });

  assert(unreadableScore.success, 'Unreadable response should pass schema validation.');
  console.log('PASS: Test 2 (Unreadable Score Response Schema)');

  // Test 3: Continuous legal-ball progression.
  const currentPosition = createBallPosition(17, 4);

  const progression = validateCricketPosition(
    currentPosition,
    17,
    5,
    0.95,
    'LIVE_SCORE',
    [],
  );

  assert(
    progression.isValid && progression.action === 'SYNC',
    'A one-ball forward progression should be SYNC.',
  );
  console.log('PASS: Test 3 (Legal Ball Progression)');

  // Test 4: Backward position must be rejected.
  const backwardResult = validateCricketPosition(
    currentPosition,
    16,
    2,
    0.95,
    'LIVE_SCORE',
    [],
  );

  assert(
    !backwardResult.isValid && backwardResult.action === 'REJECT',
    'A backward position should be REJECT.',
  );
  console.log('PASS: Test 4 (Backward Position Rejection)');

  // Test 5: Implausible forward jump must be held.
  const implausibleResult = validateCricketPosition(
    currentPosition,
    22,
    1,
    0.95,
    'LIVE_SCORE',
    [],
  );

  assert(
    !implausibleResult.isValid && implausibleResult.action === 'HOLD',
    'An implausible forward jump should be HOLD.',
  );
  console.log('PASS: Test 5 (Implausible Position Hold)');

  // Test 6: Replay frames must trigger HOLD.
  const replayResult = validateCricketPosition(
    currentPosition,
    17,
    5,
    0.95,
    'REPLAY',
    [],
  );

  assert(
    !replayResult.isValid && replayResult.action === 'HOLD',
    'Replay frames should trigger HOLD.',
  );
  console.log('PASS: Test 6 (Replay Frame Hold)');

  // Test 7: Low-confidence readings must trigger HOLD.
  const lowConfidenceResult = validateCricketPosition(
    currentPosition,
    17,
    5,
    0.50,
    'LIVE_SCORE',
    [],
  );

  assert(
    !lowConfidenceResult.isValid && lowConfidenceResult.action === 'HOLD',
    'Low-confidence readings should trigger HOLD.',
  );
  console.log('PASS: Test 7 (Low Confidence Hold)');

  // Test 8: Ambiguous readings must trigger HOLD.
  const ambiguousResult = validateCricketPosition(
    currentPosition,
    17,
    5,
    0.95,
    'LIVE_SCORE',
    ['AMBIGUOUS_CURRENT_INNINGS'],
  );

  assert(
    !ambiguousResult.isValid && ambiguousResult.action === 'HOLD',
    'Ambiguous readings should trigger HOLD.',
  );
  console.log('PASS: Test 8 (Ambiguity Hold)');

  // Test 9: Identical grayscale thumbnails should have zero difference.
  const thumbnailA = new Uint8ClampedArray([10, 20, 30, 40]);
  const thumbnailB = new Uint8ClampedArray([10, 20, 30, 40]);

  const comparison = compareThumbnails(thumbnailA, thumbnailB);

  assert(
    comparison === 0,
    'Identical thumbnails should have zero difference.',
  );
  console.log('PASS: Test 9 (Identical Thumbnail Comparison)');

  // Test 10: Different thumbnails should have a positive difference.
  const thumbnailC = new Uint8ClampedArray([10, 20, 30, 40]);
  const thumbnailD = new Uint8ClampedArray([20, 30, 40, 50]);

  const changedComparison = compareThumbnails(thumbnailC, thumbnailD);

  assert(
    changedComparison > 0,
    'Different thumbnails should have a positive difference.',
  );
  console.log('PASS: Test 10 (Changed Thumbnail Detection)');

  // Test 11: Identical grayscale data should produce identical hashes.
  const hashA = computeGrayscaleHash(thumbnailA, 2);
  const hashB = computeGrayscaleHash(thumbnailA, 2);

  assert(hashA === hashB, 'Identical grayscale data should produce identical hashes.');
  console.log('PASS: Test 11 (Grayscale Hash Consistency)');

  console.log('\n==============================================');
  console.log('ALL 11 LOCAL TESTS PASSED');
  console.log('==============================================\n');
}

try {
  runTests();
} catch (error) {
  console.error('\nTest execution failed:', error);
  process.exit(1);
}
