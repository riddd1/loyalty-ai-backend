require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const cloudinary = require('cloudinary').v2;

const app = express();
const PORT = process.env.PORT || 3000;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const REVENUECAT_API_KEY = process.env.REVENUECAT_API_KEY;
const CREATOR_MASTER_CODE = 'TELRCREATOR2025';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const messageStore = {};

async function verifySubscription(userId) {
  try {
    const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${userId}`, {
      headers: { 'Authorization': `Bearer ${REVENUECAT_API_KEY}` },
    });
    const data = await response.json();
    const entitlements = data.subscriber?.entitlements || {};
    return Object.values(entitlements).some(
      e => e.expires_date && new Date(e.expires_date) > new Date()
    );
  } catch (error) {
    console.error('RevenueCat verification error:', error);
    return false;
  }
}

const usageTracker = { chat: {}, loyaltyTest: {}, redFlag: {} };
const LIMITS = { chat: 100, loyaltyTest: 100, redFlag: 50 };

function trackUsage(userId, feature) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const key = `${userId}-${currentMonth}`;
  if (!usageTracker[feature][key]) usageTracker[feature][key] = 0;
  usageTracker[feature][key]++;
}

function checkUsage(userId, feature) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const key = `${userId}-${currentMonth}`;
  return (usageTracker[feature][key] || 0) < LIMITS[feature];
}

app.get('/', (req, res) => {
  res.json({ status: 'Telr AI Backend Running' });
});

// ── Image Upload ──────────────────────────────────────
app.post('/upload-image', async (req, res) => {
  try {
    const { base64Image } = req.body;
    if (!base64Image) return res.status(400).json({ error: 'Image required' });

    const result = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${base64Image}`,
      { folder: 'telr-ai-chats', resource_type: 'image' }
    );

    res.json({ url: result.secure_url });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// ── Messages ──────────────────────────────────────────
app.post('/messages/send', (req, res) => {
  const { userId, testerId, content, type = 'text' } = req.body;
  if (!userId || !testerId || !content) {
    return res.status(400).json({ error: 'userId, testerId, content required' });
  }
  if (!messageStore[testerId]) messageStore[testerId] = {};
  if (!messageStore[testerId][userId]) messageStore[testerId][userId] = [];

  const message = {
    id: Date.now().toString(),
    role: 'user',
    content,
    type,
    timestamp: new Date().toISOString(),
    read: false,
  };

  messageStore[testerId][userId].push(message);
  res.json({ success: true, message });
});

app.get('/messages/:testerId/:userId', (req, res) => {
  const { testerId, userId } = req.params;
  const messages = messageStore[testerId]?.[userId] || [];
  res.json({ messages });
});

// ── Creator ───────────────────────────────────────────
app.post('/creator/all-conversations', (req, res) => {
  const { creatorCode } = req.body;
  if (creatorCode !== CREATOR_MASTER_CODE) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const result = [];
  Object.entries(messageStore).forEach(([testerId, conversations]) => {
    Object.entries(conversations).forEach(([userId, messages]) => {
      result.push({
        testerId,
        userId,
        lastMessage: messages[messages.length - 1] || null,
        unreadCount: messages.filter(m => m.role === 'user' && !m.read).length,
        messageCount: messages.length,
      });
    });
  });

  result.sort((a, b) => {
    const aTime = a.lastMessage?.timestamp || '';
    const bTime = b.lastMessage?.timestamp || '';
    return bTime.localeCompare(aTime);
  });

  res.json({ conversations: result });
});

app.post('/creator/conversation', (req, res) => {
  const { creatorCode, userId, testerId } = req.body;
  if (creatorCode !== CREATOR_MASTER_CODE) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const messages = messageStore[testerId]?.[userId] || [];

  if (messageStore[testerId]?.[userId]) {
    messageStore[testerId][userId] = messageStore[testerId][userId].map(m =>
      m.role === 'user' ? { ...m, read: true } : m
    );
  }

  res.json({ messages, testerId, userId });
});

app.post('/creator/reply', (req, res) => {
  const { creatorCode, userId, testerId, content, type = 'text' } = req.body;
  if (creatorCode !== CREATOR_MASTER_CODE) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!messageStore[testerId]) messageStore[testerId] = {};
  if (!messageStore[testerId][userId]) messageStore[testerId][userId] = [];

  const message = {
    id: Date.now().toString(),
    role: 'tester',
    content,
    type,
    timestamp: new Date().toISOString(),
    read: true,
  };

  messageStore[testerId][userId].push(message);
  res.json({ success: true, message });
});

// ── Chat ──────────────────────────────────────────────
app.post('/chat', async (req, res) => {
  try {
    const { messages, userId } = req.body;
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Messages array is required' });
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    const canUse = checkUsage(userId, 'chat');
    if (!canUse) return res.status(429).json({ error: 'Monthly limit reached' });

    const systemPrompt = `You are Ask Telr AI, a supportive and emotionally intelligent relationship advisor inside a female-focused app.

Users may vent, overthink, panic, or ask for advice about their relationship.

Your tone:
- Natural, calm, big-sister energy
- Emotionally intelligent, honest but not harsh
- Like a girl texting another girl

Response Rules:
1. Keep responses very short - 1 to 3 sentences maximum
2. No paragraphs, no essays
3. Validate briefly and naturally
4. Give clear grounded advice - no paranoia, no therapy jargon
5. Sound human - simple texting style
6. Never start with "I"
7. No bullet points, just plain conversational text

Output: Only the response. Nothing else.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature: 0.85,
      max_tokens: 150,
    });

    const reply = completion.choices[0].message.content;
    trackUsage(userId, 'chat');
    res.json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to get response' });
  }
});

// ── Loyalty Test ──────────────────────────────────────
app.post('/loyalty-test', async (req, res) => {
  try {
    const { base64Image, userId, testerPersonality, testerName } = req.body;
    if (!base64Image) return res.status(400).json({ error: 'Image is required' });
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    const canUse = checkUsage(userId, 'loyaltyTest');
    if (!canUse) return res.status(429).json({ error: 'Monthly limit reached' });

    const personality = testerPersonality || 'subtle, soft, warm curiosity — never too obvious, always intriguing';
    const name = testerName || 'the tester';

    const systemPrompt = `You are the Loyalty Tester AI inside a Gen-Z female-focused app. The app user base is aged 16-28.

You are playing the role of ${name}. Your personality: ${personality}

Your job is to generate the next message(s) the girl should send to subtly test a guy's loyalty.

Your responses must feel 100% human — never AI-written.

CORE RULES:

1. Human First. Strategy Second.
Do not sound polished, structured, or perfectly phrased. No textbook flirting. No robotic rhythm. It must feel like it was typed casually on a phone.

2. Gen-Z Realism.
Use modern, natural phrasing. Light slang only if it fits. Never force slang.

3. Emoji Intelligence.
Emojis are optional. Do NOT add an emoji unless it genuinely improves the tone. One emoji max per message cluster.

4. Emotional Texture.
Every reply must carry subtle emotional intent - playful curiosity, soft challenge, calm confidence, slight mystery, light teasing, controlled temptation. Never desperation. She has options.

5. Adaptive Tone Engine.
Mirror his texting style lightly - never mimic.

6. Escalation Control.
Start believable. Build curiosity slowly. Never jump too sexual too fast. Never make it obvious it's a test.

7. Message Structure.
Sometimes one message. Sometimes double text. Occasionally triple. Never predictable. When in doubt, send one.

OUTPUT RULE:
Only output the exact message(s) she should send next.
No explanations. No labels. No quotation marks.
Each message on its own line with a blank line between if sending multiple.
Nothing else.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Look at this conversation screenshot. Generate the next message(s) the girl should send. Output only the message(s), nothing else.' },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
          ]
        }
      ],
      temperature: 0.93,
      max_tokens: 200,
    });

    const reply = completion.choices[0].message.content;
    trackUsage(userId, 'loyaltyTest');
    res.json({ reply });
  } catch (error) {
    console.error('Loyalty test error:', error);
    res.status(500).json({ error: 'Failed to generate messages' });
  }
});

// ── Red Flag ──────────────────────────────────────────
app.post('/red-flag', async (req, res) => {
  try {
    const { images, userId } = req.body;
    if (!images || !Array.isArray(images) || images.length === 0) return res.status(400).json({ error: 'At least one image is required' });
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    const canUse = checkUsage(userId, 'redFlag');
    if (!canUse) return res.status(429).json({ error: 'Monthly limit reached' });

    const systemPrompt = `You are the Red Flag Analysis Engine inside a relationship insight app.

Users will upload screenshots of a conversation. Your job is to analyze strictly what is visible and provide a structured, data-based relationship assessment.

CORE RESPONSIBILITIES:

1. Accurate Message Counting
- Count total visible messages sent by each person
- Do not estimate or guess beyond what is visible

2. Engagement Level Analysis - evaluate:
- Message length comparison
- Question frequency from each side
- Emotional expression
- Response effort vs minimal replies
- Reciprocity of energy

3. Warning Signals - only flag issues clearly visible:
- Dry or dismissive responses
- Ignored questions
- Avoidance of emotional topics
- Defensive tone shifts

4. Positive Signals - identify visible strengths:
- Mutual effort
- Emotional validation
- Balanced engagement
- Consistent replies

5. Compatibility Score 0 to 100:
- Effort balance 25%
- Emotional reciprocity 25%
- Communication quality 25%
- Ratio of red flags to positive signals 25%

Return your analysis as a JSON object with this EXACT structure:
{
  "messageBalance": { "you": <number>, "them": <number> },
  "engagementLevel": <0-100>,
  "warningSignals": ["<specific flag with brief visible evidence>"],
  "positiveSignals": ["<specific positive with visible evidence>"],
  "compatibilityScore": <0-100>
}

RULES:
- Only use visible evidence
- Give 2-4 items in each signals array
- Return ONLY valid JSON, no markdown, no extra text`;

    const imageContent = images.map(base64Image => ({
      type: 'image_url',
      image_url: { url: `data:image/jpeg;base64,${base64Image}` }
    }));

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze these chat screenshots and return the JSON analysis. Only use what is visible.' },
            ...imageContent
          ]
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const reply = completion.choices[0].message.content;
    let analysis;
    try {
      const cleanedReply = reply.replace(/```json\n?|\n?```/g, '').trim();
      analysis = JSON.parse(cleanedReply);
    } catch (parseError) {
      console.error('Parse error:', parseError);
      analysis = {
        messageBalance: { you: 0, them: 0 },
        engagementLevel: 50,
        warningSignals: ['Unable to analyze chat clearly'],
        positiveSignals: ['Analysis incomplete'],
        compatibilityScore: 50
      };
    }

    trackUsage(userId, 'redFlag');
    res.json(analysis);
  } catch (error) {
    console.error('Red flag analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze chats' });
  }
});

app.listen(PORT, () => {
  console.log(`Telr AI Backend running on port ${PORT}`);
});
