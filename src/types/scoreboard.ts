import { z } from 'zod';

export const FrameTypeEnum = z.enum([
  'LIVE_SCORE',
  'REPLAY',
  'AD',
  'GRAPHIC',
  'NO_SCOREBOARD',
  'UNREADABLE',
]);

export type FrameType = z.infer<typeof FrameTypeEnum>;

export const ScoreboardRecognitionSchema = z.object({
  frame_type: FrameTypeEnum,
  innings: z.number().int().min(1).max(2).nullable(),
  runs: z.number().int().min(0).max(999).nullable(),
  wickets: z.number().int().min(0).max(10).nullable(),
  over: z.number().int().min(0).max(500).nullable(),
  ball: z.number().int().min(0).max(6).nullable(),
  confidence: z.number().min(0).max(1),
  visible_score_text: z.string().nullable(),
  ambiguity_flags: z.array(z.string()),
});

export type ScoreboardRecognitionResult = z.infer<typeof ScoreboardRecognitionSchema>;

export interface RecognitionApiResponse {
  success: boolean;
  data?: ScoreboardRecognitionResult;
  error?: string;
  source?: 'gemini-3.8-flash' | 'fallback-analyzer';
  latencyMs?: number;
}
