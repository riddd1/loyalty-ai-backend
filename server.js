require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Loyalty AI Backend Running' });
});

// Loyalty Test Endpoint
app.post('/loyalty-test', async (req, res) => {
  try {
    const { base64Image } = req.body;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You generate messages for a girl testing her boyfriend's loyalty. Your goal is to get him to fall for her and slip up. Be OFFENSIVE, not defensive. Push boundaries naturally. Output ONLY the exact message(s)—nothing else.

STRATEGY - BE OFFENSIVE:
- Your job is to make HIM chase YOU
- Be confident, flirty, and slightly challenging
- Push the conversation forward toward him showing interest
- Don't play it safe or be overly sweet
- Make him want to impress you or pursue you
- You can double text if it adds pressure or interest

DOUBLE TEXTING:
- You can send 2-3 messages in a row if it feels natural
- Use it to add interest, push boundaries, or create urgency

TONE - CONFIDENT & FLIRTY:
- Be playful and teasing, not defensive
- Show interest but don't apologize or backtrack
- Push him to respond or engage more

IF HE MENTIONS A GIRLFRIEND:
- Don't immediately back off
- Be casual about it, test if he's serious

IF HE'S ENGAGED/FLIRTY:
- Push harder, ask him out, suggest meeting
- Make him make the move

HARD LIMITS:
❌ NO sexual/explicit content
❌ NO being overly defensive or apologetic
❌ Don't sound desperate or needy
❌ Max 1-2 emojis per message
❌ Sound confident and natural

REMEMBER: Play OFFENSE. Make him want you. Push boundaries. Get him to slip.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Generate message(s) to continue this interaction. You can send multiple messages (double text) if it feels natural. Output ONLY the message(s), nothing else.',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// Red Flag Detector Endpoint
app.post('/red-flag', async (req, res) => {
  try {
    const { images } = req.body;

    const imageContents = images.map((img) => ({
      type: 'image_url',
      image_url: {
        url: `data:image/jpeg;base64,${img}`,
      },
    }));

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are analyzing chat screenshots to provide observable relationship behavior insights. Be objective and factual. Output ONLY valid JSON in this exact format:

{
  "messageBalance": {
    "you": <number>,
    "them": <number>
  },
  "engagementLevel": <number 0-100>,
  "warningSignals": [
    "brief observable pattern 1",
    "brief observable pattern 2",
    "brief observable pattern 3"
  ],
  "positiveSignals": [
    "brief observable pattern 1",
    "brief observable pattern 2",
    "brief observable pattern 3"
  ],
  "compatibilityScore": <number 0-100>
}

RULES:
- Count visible messages from both participants
- Engagement level based on: response frequency, message length, effort shown
- Warning signals: concerning patterns you observe
- Positive signals: healthy patterns you observe
- Compatibility score: derived from message balance, engagement, and patterns
- Keep all descriptions brief and observational (5-10 words max)
- Do NOT assume intent or emotions beyond what's visible
- Be neutral and non-accusatory

Output ONLY the JSON. No extra text.`,
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze these chat screenshots and provide relationship insights.' },
            ...imageContents,
          ],
        },
      ],
    });

    const reply = response.choices[0].message.content || '';
    const jsonMatch = reply.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      res.json(JSON.parse(jsonMatch[0]));
    } else {
      res.status(500).json({ error: 'Invalid response format' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to analyze chats' });
  }
});

// Chat Endpoint
app.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are Loyalty AI, a helpful and supportive assistant for relationship advice and self-improvement. You're friendly, understanding, and give practical advice. Keep responses conversational, supportive, and concise (2-4 sentences). Use a warm, encouraging tone.`,
        },
        ...messages,
      ],
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
}); 