
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  ScoreboardRecognitionSchema,
  ScoreboardRecognitionResult,
} from './src/types/scoreboard.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Map frame_type to legacy status for UI backward compatibility
function mapFrameTypeToStatus(
  frameType: string
): 'LIVE' | 'HOLD' | 'UNREADABLE' {
  switch (frameType) {
    case 'LIVE_SCORE':
      return 'LIVE';

    case 'REPLAY':
    case 'AD':
    case 'GRAPHIC':
      return 'HOLD';

    case 'NO_SCOREBOARD':
    case 'UNREADABLE':
    default:
      return 'UNREADABLE';
  }
}

// Preset samples for demo and controlled testing
const PRESET_RESULTS: Record<string, ScoreboardRecognitionResult> = {
  frame_17_2: {
    frame_type: 'LIVE_SCORE',
    innings: 2,
    runs: 158,
    wickets: 4,
    over: 17,
    ball: 2,
    confidence: 0.96,
    visible_score_text: 'IND 158/4 (17.2 ov)',
    ambiguity_flags: [],
  },

  frame_17_4_wicket: {
    frame_type: 'LIVE_SCORE',
    innings: 2,
    runs: 128,
    wickets: 4,
    over: 17,
    ball: 4,
    confidence: 0.96,
    visible_score_text: '128/4 17.4',
    ambiguity_flags: [],
  },

  frame_ad_break: {
    frame_type: 'AD',
    innings: null,
    runs: null,
    wickets: null,
    over: null,
    ball: null,
    confidence: 0.92,
    visible_score_text: null,
    ambiguity_flags: ['AD_OVERLAY_ACTIVE', 'SCOREBOARD_MASKED'],
  },

  frame_unreadable: {
    frame_type: 'UNREADABLE',
    innings: null,
    runs: null,
    wickets: null,
    over: null,
    ball: null,
    confidence: 0.22,
    visible_score_text: null,
    ambiguity_flags: ['GLARE_OR_REFLECTION_PRESENT', 'BLURRED_DIGITS'],
  },

  frame_18_1_six: {
    frame_type: 'LIVE_SCORE',
    innings: 2,
    runs: 172,
    wickets: 5,
    over: 18,
    ball: 1,
    confidence: 0.97,
    visible_score_text: 'IND 172/5 (18.1 ov)',
    ambiguity_flags: [],
  },

  frame_no_scoreboard: {
    frame_type: 'NO_SCOREBOARD',
    innings: null,
    runs: null,
    wickets: null,
    over: null,
    ball: null,
    confidence: 0.95,
    visible_score_text: null,
    ambiguity_flags: ['NO_CRICKET_SCOREBOARD_FOUND'],
  },
};

// Vision recognition prompt

const VISION_SCOREBOARD_PROMPT = `You are a precision cricket broadcast vision analyst for the Same Second spoiler prevention app.

Analyze this television or monitor image of a cricket match or cropped scoreboard region.

TASK:
Classify the frame and accurately extract the CURRENT LIVE MATCH STATE.

1. CLASSIFY 'frame_type' strictly as one of:
   - "LIVE_SCORE": Live match scoreboard banner is clearly visible, actively showing the current batting team score and overs/ball.
   - "REPLAY": Broadcast shows a slow-motion replay, DRS tracking replay, or has a visible "REPLAY" / "SLOW MO" indicator.
   - "AD": A commercial advertisement, sponsor bumper, or non-match screen where live match play is paused.
   - "GRAPHIC": Full-screen statistics card, wagon wheel, player profile, bowling figures, or team lineup where the live ball-by-ball ticker is not actively displaying the live delivery.
   - "NO_SCOREBOARD": Stadium crowd shot, pitch view, player close-up, or general non-scoreboard image with NO cricket score overlay.
   - "UNREADABLE": A scoreboard is partially present but obscured by glare, extreme blur, cropped digits, or unreadable quality.

2. CRITICAL: IDENTIFY THE CURRENT INNINGS BEFORE EXTRACTING THE SCORE.

   A scoreboard may display both teams' scores simultaneously. Do NOT automatically select the team with the largest over number, the first score shown, or the leftmost score.

   Determine which team is CURRENTLY BATTING using visible broadcast evidence, in this priority order:
   - An explicit active/current batting indicator or highlighted team.
   - A visible striker/batter indicator that identifies the batting team.
   - A visible target/chase indicator combined with the innings scores.
   - Whether one team's innings is completed (for example, all 10 wickets lost) while the other team's innings is still in progress.
   - Other clear broadcast context identifying the active innings.

   Example:
   IND 125/10 (18.4 ov)  AUS 126/6 (13.2 ov)

   If the broadcast clearly indicates Australia is chasing and currently batting, extract Australia's score and 13.2 overs. Do NOT extract India's completed innings over of 18.4.

   This example is illustrative, not a fixed rule. Never assume a team is batting solely from its name or score.

   If the currently batting team cannot be identified reliably:
   - Set 'innings', 'runs', 'wickets', 'over', and 'ball' to null.
   - Add "AMBIGUOUS_CURRENT_INNINGS" to 'ambiguity_flags'.
   - Reduce confidence appropriately.
   - Do not guess or select a previous innings.

3. RECOGNITION RULES FOR NUMBERS:
   - 'innings': 1 or 2 (or null if not visible or ambiguous).
   - 'runs': Total runs scored by the CURRENTLY BATTING team (integer or null).
   - 'wickets': Wickets fallen by the CURRENTLY BATTING team (0 to 10 or null).
   - 'over': Completed overs number BEFORE the dot (e.g. for "17.4", over is 17).
     CRITICAL: Do NOT interpret 17.4 as a decimal. Over must be an integer (17) or null.
   - 'ball': Legal ball in current over AFTER the dot (1 to 6). For example, for "17.4", ball is 4. If start of over or 0, return 0. If not visible, return null.
   - 'confidence': Floating point value between 0.0 and 1.0. Confidence must reflect certainty about CURRENT innings selection, not just digit recognition.
   - 'visible_score_text': Verbatim string seen on the scoreboard banner or null if none.
   - 'ambiguity_flags': Array of strings flagging uncertainty or multiple readings.

4. ADDITIONAL SAFETY RULES:
   - Distinguish the current score from the target or previous innings.
   - If the graphic displays "Target 186", do NOT extract 186 as runs.
   - Never use a completed first-innings score as the current second-innings position.
   - Never infer a current over from a target, required run rate, or previous innings.
   - If the score is readable but the active innings is uncertain, return an ambiguous result instead of a guessed live score.
   - Never invent missing values. If a field is unknown, unreadable, or not visible, set it to null.

Return one valid JSON object adhering to the required schema. Do not include Markdown fences or explanatory text.`;

// In-memory rate limiting: max 60 requests/minute per client IP
const rateLimitMap = new Map<
  string,
  { count: number; resetTime: number }
>();

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 60;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  entry.count += 1;
  return false;
}

// Safe error response: never invent a score when vision recognition fails
function visionErrorResponse(
  res: Response,
  statusCode: number,
  errorCode: string,
  message: string
) {
  return res.status(statusCode).json({
    frame_type: 'UNREADABLE',
    innings: null,
    runs: null,
    wickets: null,
    over: null,
    ball: null,
    confidence: 0,
    visible_score_text: null,
    ambiguity_flags: [errorCode],
    status: 'UNREADABLE',
    score: '---',
    overs: 0,
    legalBallPosition: '---',
    reason: message,
    error: message,
  });
}

// Scoreboard recognition endpoint
app.post(
  '/api/analyze-scoreboard',
  async (req: Request, res: Response) => {
    const startTime = Date.now();

    try {
      const clientIp =
        (req.headers['x-forwarded-for'] as string)
          ?.split(',')[0]
          .trim() ||
        req.socket.remoteAddress ||
        'unknown-client';

      if (isRateLimited(clientIp)) {
        return visionErrorResponse(
          res,
          429,
          'RATE_LIMIT_EXCEEDED',
          'Rate limit exceeded. Please wait before rescanning.'
        );
      }

      const { imageBase64, sampleId } = req.body;

      // 1. Handle preset demo samples
      if (sampleId && PRESET_RESULTS[sampleId]) {
        const presetData = PRESET_RESULTS[sampleId];
        const status = mapFrameTypeToStatus(presetData.frame_type);

        const legalBallPosition =
          presetData.over !== null && presetData.ball !== null
            ? `${presetData.over}.${presetData.ball}`
            : '---';

        return res.json({
          ...presetData,
          status,
          score:
            presetData.runs !== null &&
            presetData.wickets !== null
              ? `${presetData.runs}/${presetData.wickets}`
              : '---',
          overs:
            presetData.over !== null &&
            presetData.ball !== null
              ? Number(`${presetData.over}.${presetData.ball}`)
              : 0,
          legalBallPosition,
          teamBatting: 'IND',
          reason: `Preset frame analyzed: ${presetData.frame_type}`,
          source: 'preset-sample',
          latencyMs: Date.now() - startTime,
        });
      }

      // 2. Validate image payload
      if (
        !imageBase64 ||
        typeof imageBase64 !== 'string'
      ) {
        return visionErrorResponse(
          res,
          400,
          'NO_IMAGE_DATA_PROVIDED',
          'No image data provided for recognition.'
        );
      }

      if (imageBase64.length > 7 * 1024 * 1024) {
        return visionErrorResponse(
          res,
          413,
          'IMAGE_PAYLOAD_TOO_LARGE',
          'Image exceeds the 5MB size limit. Please crop or reduce its resolution.'
        );
      }

      // 3. Check OpenRouter configuration
      const openRouterApiKey =
        process.env.OPENROUTER_API_KEY;

      if (!openRouterApiKey) {
        return visionErrorResponse(
          res,
          503,
          'VISION_API_KEY_MISSING',
          'Vision API is not configured. Messages remain shielded.'
        );
      }

      // 4. Clean image data and determine MIME type
      const mimeMatch = imageBase64.match(
        /^data:(image\/[a-zA-Z0-9.+-]+);base64,/
      );

      const mimeType = mimeMatch
        ? mimeMatch[1]
        : 'image/jpeg';

      const base64Data = imageBase64.replace(
        /^data:image\/[a-zA-Z0-9.+-]+;base64,/,
        ''
      );

      // 5. Call OpenRouter vision API
      try {
        const model =
          process.env.OPENROUTER_MODEL ||
          'qwen/qwen3.5-flash-02-23';

        const openRouterResponse = await fetch(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${openRouterApiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'http://localhost:3000',
              'X-Title': 'Same Second',
            },
            body: JSON.stringify({
              model,
              temperature: 0.1,
              max_tokens: 3000,
reasoning: {
  effort: "none"
},
              response_format: {
                type: 'json_object',
              },
              messages: [
                {
                  role: 'user',
                  content: [
                    {
                      type: 'text',
                      text: VISION_SCOREBOARD_PROMPT,
                    },
                    {
                      type: 'image_url',
                      image_url: {
                        url: `data:${mimeType};base64,${base64Data}`,
                      },
                    },
                  ],
                },
              ],
            }),
            signal: AbortSignal.timeout(60000),
          }
        );

        // 6. Read the response body safely
        const responseText =
          await openRouterResponse.text();

        let openRouterData: any;

        try {
          openRouterData = JSON.parse(responseText);
        } catch {
          console.error(
            'OpenRouter returned a non-JSON response:',
            {
              httpStatus: openRouterResponse.status,
              responseLength: responseText.length,
            }
          );

          throw new Error('INVALID_OPENROUTER_RESPONSE');
        }

        // 7. Handle HTTP and provider errors
        if (!openRouterResponse.ok) {
          const providerMessage =
            openRouterData?.error?.message ||
            openRouterData?.message ||
            'Unknown provider error';

          console.error('OpenRouter API error:', {
            status: openRouterResponse.status,
            message: providerMessage,
            code: openRouterData?.error?.code,
            model,
          });

          throw new Error(
            `OPENROUTER_HTTP_${openRouterResponse.status}: ${providerMessage}`
          );
        }

        // 8. Extract the first completion
        const choice = openRouterData?.choices?.[0];

        if (!choice) {
          console.error(
            'OpenRouter returned no completion choices:',
            {
              model: openRouterData?.model,
              id: openRouterData?.id,
              usage: openRouterData?.usage,
              keys: Object.keys(openRouterData || {}),
            }
          );

          throw new Error('NO_CHOICES_FROM_OPENROUTER');
        }

        // Handle model refusals
        if (choice?.message?.refusal) {
          throw new Error('MODEL_REFUSED_IMAGE_ANALYSIS');
        }

        // 9. Extract content in supported formats
        const messageContent =
          choice?.message?.content;

        let rawJsonText = '';

        if (typeof messageContent === 'string') {
          rawJsonText = messageContent.trim();
        } else if (Array.isArray(messageContent)) {
          rawJsonText = messageContent
            .map((part: any) => {
              if (typeof part === 'string') {
                return part;
              }

              if (typeof part?.text === 'string') {
                return part.text;
              }

              return '';
            })
            .join('\n')
            .trim();
        }

        if (!rawJsonText) {
          console.error(
            'OpenRouter returned empty model content:',
            {
              model: openRouterData?.model,
              finishReason: choice?.finish_reason,
              usage: openRouterData?.usage,
              messageKeys: Object.keys(
                choice?.message || {}
              ),
            }
          );

          throw new Error(
            `EMPTY_RESPONSE_FROM_OPENROUTER: finish_reason=${choice?.finish_reason || 'unknown'}`
          );
        }

        // 10. Remove optional Markdown code fences
        rawJsonText = rawJsonText
          .replace(/^```(?:json)?\s*/i, '')
          .replace(/\s*```$/, '')
          .trim();

        // 11. Parse model JSON
        let rawParsed: any;

        try {
          rawParsed = JSON.parse(rawJsonText);
        } catch {
          console.error(
            'OpenRouter returned malformed JSON:',
            {
              model: openRouterData?.model,
              responseLength: rawJsonText.length,
              finishReason: choice?.finish_reason,
            }
          );

          throw new Error('MALFORMED_JSON_FROM_MODEL');
        }

        // 12. Normalize confidence if returned as a percentage
        if (
          typeof rawParsed.confidence === 'number' &&
          rawParsed.confidence > 1
        ) {
          rawParsed.confidence = Number(
            (rawParsed.confidence / 100).toFixed(2)
          );
        }

        // 13. Strict Zod validation
        const validation =
          ScoreboardRecognitionSchema.safeParse(
            rawParsed
          );

        if (!validation.success) {
          console.error(
            'OpenRouter output failed schema validation:',
            validation.error.format()
          );

          throw new Error('INVALID_SCOREBOARD_SCHEMA');
        }

        // 14. Only use validated model output
        const validResult = validation.data;

        const status = mapFrameTypeToStatus(
          validResult.frame_type
        );

        const legalBallPosition =
          validResult.over !== null &&
          validResult.ball !== null
            ? `${validResult.over}.${validResult.ball}`
            : '---';

        return res.json({
          ...validResult,
          status,
          score:
            validResult.runs !== null &&
            validResult.wickets !== null
              ? `${validResult.runs}/${validResult.wickets}`
              : '---',
          overs:
            validResult.over !== null &&
            validResult.ball !== null
              ? Number(
                  `${validResult.over}.${validResult.ball}`
                )
              : 0,
          legalBallPosition,
          teamBatting: 'IND',
          reason: `Scoreboard analyzed: ${validResult.frame_type}`,
          source: `openrouter/${model}`,
          latencyMs: Date.now() - startTime,
        });
      } catch (visionError: any) {
        const errorMessage =
          visionError?.message ||
          'Unknown OpenRouter error';

        console.error(
          'OpenRouter vision API execution error:',
          errorMessage
        );

        // Handle timeout
        if (
          visionError?.name === 'TimeoutError' ||
          visionError?.name === 'AbortError'
        ) {
          return visionErrorResponse(
            res,
            504,
            'VISION_REQUEST_TIMEOUT',
            'Scoreboard recognition timed out. Messages remain shielded.'
          );
        }

        // Handle provider rate limits
        if (
          errorMessage.includes('429') ||
          errorMessage.includes('RESOURCE_EXHAUSTED')
        ) {
          return visionErrorResponse(
            res,
            429,
            'VISION_PROVIDER_RATE_LIMITED',
            'Vision recognition is temporarily busy. Messages remain shielded.'
          );
        }

        return visionErrorResponse(
          res,
          503,
          'VISION_PROVIDER_UNAVAILABLE',
          'Vision recognition is unavailable. Messages remain shielded.'
        );
      }
    } catch (err: any) {
      console.error(
        'Server error handling analyze-scoreboard:',
        err?.message || err
      );

      return visionErrorResponse(
        res,
        500,
        'INTERNAL_SERVER_ERROR',
        'Internal error processing image. Messages remain shielded.'
      );
    }
  }
);

// Vite dev server mounting or static file serving
async function startServer() {
  const isProduction =
    process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } =
      await import('vite');

    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');

    app.use(express.static(distPath));

    app.get('*', (_req, res) => {
      res.sendFile(
        path.resolve(distPath, 'index.html')
      );
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `Same Second server listening on http://0.0.0.0:${PORT}`
    );
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
