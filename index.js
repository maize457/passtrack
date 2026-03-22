/**
 * PassTrack - Firebase Cloud Functions
 * Gemini API 프록시: API 키를 서버에서만 사용하여 클라이언트에 노출되지 않도록 합니다.
 *
 * 배포 전 반드시 실행:
 *   firebase functions:config:set gemini.key="YOUR_GEMINI_API_KEY"
 * 또는 (Firebase v2 Functions 환경변수):
 *   echo "GEMINI_KEY=YOUR_KEY" > functions/.env
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

admin.initializeApp();

// ─── Gemini API 엔드포인트 ───────────────────────────────────
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// 환경변수에서 키를 읽습니다 (클라이언트에 절대 노출되지 않음)
function getGeminiKey() {
  // Firebase Functions v2: .env 파일 방식
  if (process.env.GEMINI_KEY) return process.env.GEMINI_KEY;
  // Firebase Functions v1: firebase functions:config 방식 (fallback)
  try {
    return functions.config().gemini.key;
  } catch (e) {
    return null;
  }
}

// ─── 공통 CORS 헤더 ─────────────────────────────────────────
function setCORSHeaders(res) {
  // GitHub Pages 도메인 + 로컬 개발 허용
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

// ─── 인증 검증 헬퍼 ─────────────────────────────────────────
async function verifyAuth(req) {
  const authHeader = req.headers.authorization || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return null;
  try {
    return await admin.auth().verifyIdToken(idToken);
  } catch (e) {
    return null;
  }
}

/**
 * geminiText
 * 텍스트 프롬프트를 받아 Gemini 응답을 반환합니다.
 * 사용처: AI 학습 분석, OX 퀴즈 생성
 *
 * Request body: { prompt: string }
 * Response:     { text: string }
 */
exports.geminiText = functions
  .region("asia-northeast3") // 서울 리전
  .https.onRequest(async (req, res) => {
    setCORSHeaders(res);
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    // 로그인 사용자만 허용 (localStorage 모드 사용자는 제외하지 않으려면 주석 처리 가능)
    // const user = await verifyAuth(req);
    // if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ error: "prompt 필드가 필요합니다." });
      return;
    }
    if (prompt.length > 8000) {
      res.status(400).json({ error: "프롬프트가 너무 깁니다." });
      return;
    }

    const key = getGeminiKey();
    if (!key) {
      res.status(500).json({ error: "Gemini API 키가 설정되지 않았습니다." });
      return;
    }

    try {
      const geminiRes = await fetch(`${GEMINI_URL}?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      if (!geminiRes.ok) {
        const errBody = await geminiRes.text();
        let msg = `Gemini API 오류 ${geminiRes.status}`;
        try {
          msg = JSON.parse(errBody).error?.message || msg;
        } catch (_) {}
        res.status(502).json({ error: msg });
        return;
      }

      const data = await geminiRes.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      res.status(200).json({ text });
    } catch (e) {
      console.error("geminiText error:", e);
      res.status(500).json({ error: "서버 오류가 발생했습니다." });
    }
  });

/**
 * geminiVision
 * base64 이미지 + 텍스트 프롬프트를 받아 Gemini Vision 응답을 반환합니다.
 * 사용처: 오답노트 이미지 OCR (문제/정답 인식)
 *
 * Request body: {
 *   imageBase64: string,   // base64 인코딩된 이미지 데이터
 *   mimeType:    string,   // 예: "image/jpeg"
 *   prompt:      string    // 텍스트 지시
 * }
 * Response: { text: string }
 */
exports.geminiVision = functions
  .region("asia-northeast3")
  .runWith({ timeoutSeconds: 60, memory: "256MB" })
  .https.onRequest(async (req, res) => {
    setCORSHeaders(res);
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    const { imageBase64, mimeType, prompt } = req.body;
    if (!imageBase64 || !prompt) {
      res.status(400).json({ error: "imageBase64, prompt 필드가 필요합니다." });
      return;
    }

    // 이미지 크기 제한 (base64 약 5MB = 실제 ~3.75MB)
    if (imageBase64.length > 5 * 1024 * 1024) {
      res.status(400).json({ error: "이미지가 너무 큽니다. 압축 후 다시 시도하세요." });
      return;
    }

    const key = getGeminiKey();
    if (!key) {
      res.status(500).json({ error: "Gemini API 키가 설정되지 않았습니다." });
      return;
    }

    try {
      const geminiRes = await fetch(`${GEMINI_URL}?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: mimeType || "image/jpeg",
                    data: imageBase64,
                  },
                },
                { text: prompt },
              ],
            },
          ],
          generationConfig: { temperature: 0, maxOutputTokens: 1000 },
        }),
      });

      if (!geminiRes.ok) {
        const errBody = await geminiRes.text();
        let msg = `Gemini API 오류 ${geminiRes.status}`;
        try {
          msg = JSON.parse(errBody).error?.message || msg;
        } catch (_) {}
        res.status(502).json({ error: msg });
        return;
      }

      const data = await geminiRes.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (!text) {
        res.status(200).json({ text: "", error: "텍스트를 인식할 수 없어요. 더 선명한 사진으로 시도해보세요." });
        return;
      }
      res.status(200).json({ text });
    } catch (e) {
      console.error("geminiVision error:", e);
      res.status(500).json({ error: "서버 오류가 발생했습니다." });
    }
  });
