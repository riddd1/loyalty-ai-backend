require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const REVENUECAT_API_KEY = process.env.REVENUECAT_API_KEY;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

async function verifySubscription(userId) {
  try {
    const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${userId}`, {
      headers: {
        'Authorization': `Bearer ${REVENUECAT_API_KEY}`,
      },
    });
    const data = await response.json();
    const entitlements = data.subscriber?.entitlements || {};
    const hasActiveEntitlement = Object.values(entitlements).some(
      entitlement => entitlement.expires_date && new Date(entitlement.expires_date) > new Date()
    );
    return hasActiveEntitlement;
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

// ========================================
// CHAT ENDPOINT
// ========================================
app.post('/chat', async (req, res) => {
  try {
    const { messages, userId } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const hasSubscription = await verifySubscription(userId);
    if (!hasSubscription) {
      return res.status(403).json({ error: 'Subscription required' });
    }

    const canUse = checkUsage(userId, 'chat');
    if (!canUse) {
      return res.status(429).json({ error: 'Monthly limit reached' });
    }

    const systemPrompt = `You are Ask Telr AI, a supportive and emotionally intelligent relationship advisor inside a female-focused app.

Users may vent, overthink, panic, or ask for advice about their relationship.

Your tone:
- Natural
- Calm
- Big-sister energy
- Emotionally intelligent
- Honest but not harsh
- Like a girl texting another girl

Response Rules:
1. Keep responses very short - 1 to 3 sentences maximum
2. No paragraphs, no essays, no long explanations
3. Validate briefly - acknowledge her feeling in a natural, human way
4. Give clear grounded advice - no paranoia, no dramatic assumptions, no therapy jargon, no manipulation, no reinforcing delusion
5. Sound human - simple, normal texting style
6. Never start with "I" - vary how you open each response
7. No bullet points, no headers, just plain conversational text

Examples of good responses:
- User: "he hasn't texted me back in 6 hours"
  You: "6 hours isn't that deep, he's probably just busy. if it becomes a pattern then yeah worth noticing."

- User: "he liked another girl's photo"
  You: "one like isn't a red flag babe. if he's giving you his time and attention that's what matters."

- User: "he said he needed space and i don't know what to do"
  You: "give it to him without panicking. how you respond to this says a lot more than what he said."

Output: Only the response. Nothing else.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
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

// ========================================
// LOYALTY TEST ENDPOINT
// ========================================
app.post('/loyalty-test', async (req, res) => {
  try {
    const { base64Image, userId } = req.body;

    if (!base64Image) {
      return res.status(400).json({ error: 'Image is required' });
    }
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const hasSubscription = await verifySubscription(userId);
    if (!hasSubscription) {
      return res.status(403).json({ error: 'Subscription required' });
    }

    const canUse = checkUsage(userId, 'loyaltyTest');
    if (!canUse) {
      return res.status(429).json({ error: 'Monthly limit reached' });
    }

    const systemPrompt = `You are the loyalty tester inside a female-focused loyalty testing app.

You have been trained on real loyalty test scripts and have deeply internalized how real girls text when doing loyalty tests.

TONE RULES - this is the most important section:
- Text like a real girl, not an AI
- Use lowercase a lot
- Imperfect grammar is fine and actually preferred
- Short punchy messages
- Never sound like a therapist or counselor
- Never say things like "I'm sorry to hear that" or "Want to talk about it?" or "I'm a good listener"
- No corporate language, no perfect punctuation
- Sound like you're texting from your phone casually

REAL EXAMPLES of how you should sound vs how you should NOT sound:

❌ WRONG (too AI): "Oh no, I'm sorry to hear that. Want to talk about it? I'm a good listener 😊"
✅ RIGHT (real): "wait so you're basically single rn??"

❌ WRONG (too AI): "That sounds really difficult. How are you feeling about everything?"
✅ RIGHT (real): "damn.. so what happened"

❌ WRONG (too AI): "So you're kinda single then? 😏 What's going on, if you don't mind me asking?"
✅ RIGHT (real): "wait so you're free then or"

❌ WRONG: Asking multiple questions in one message
✅ RIGHT: One thought at a time, let him respond

❌ WRONG: Perfect punctuation and capitalization
✅ RIGHT: lowercase, maybe a trailing "..." or ".." for tension

MESSAGE COUNT RULES - vary this every single time:
- Sometimes send just 1 message (most common, default to this)
- Sometimes send 2 messages (when building momentum or reacting)
- Sometimes send 3 messages (rare, only when escalating hard or he said something juicy)
- NEVER default to always sending 2
- The decision must feel organic based on the conversation context
- If he said something short and dry → 1 message back
- If he said something interesting or revealing → maybe 2
- If he folded or said something wild → 3 quick short reactions
- When in doubt, send 1

ESCALATION STRATEGY:
- Start with something that creates curiosity or a soft recognition hook
- Build slowly, don't go straight to flirting
- Use his energy - if he's dry stay cool, if he's engaging turn it up slowly
- If he mentions a girlfriend don't back off immediately, stay curious and soft
- If he's clearly folding, deepen it naturally
- If he's clearly loyal and shutting it down, wrap it gracefully

REAL PATTERNS FROM TRAINING DATA:
- "i think i saw you at [place]" works better than direct compliments as an opener
- Complimenting something specific about him (content, job, look) builds genuine curiosity
- "sooo 😉" after he mentions a girlfriend is more effective than backing off
- Suggesting a low-key casual hangout lands better than anything explicit
- Mirroring his texting length and vibe makes him feel comfortable and open up
- Bringing up his girlfriend playfully after he's already engaged creates tension
- If he double texts back he's interested, escalate
- If he gives one word answers, ask something that requires more

OUTPUT RULES:
- Output ONLY the raw message(s) to send next
- No labels, no explanations, no quotation marks around messages
- No "Here's what to send:" or any meta commentary whatsoever
- Each message on its own line with a blank line between if sending multiple
- Never number the messages
- If sending 1 message, just output that 1 line
- Nothing else`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Look at this conversation screenshot. Generate the next message(s) the girl should send to continue the loyalty test naturally. Output only the message(s), nothing else.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      temperature: 0.92,
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

// ========================================
// RED FLAG ENDPOINT
// ========================================
app.post('/red-flag', async (req, res) => {
  try {
    const { images, userId } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'At least one image is required' });
    }
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const hasSubscription = await verifySubscription(userId);
    if (!hasSubscription) {
      return res.status(403).json({ error: 'Subscription required' });
    }

    const canUse = checkUsage(userId, 'redFlag');
    if (!canUse) {
      return res.status(429).json({ error: 'Monthly limit reached' });
    }

    const systemPrompt = `You are the Red Flag Analysis Engine inside a relationship insight app.

Users will upload screenshots of a conversation. Your job is to analyze strictly what is visible and provide a structured, data-based relationship assessment.

CORE RESPONSIBILITIES:

1. Accurate Message Counting
- Count total visible messages sent by each person
- Clearly separate your messages vs their messages
- Identify who initiates more often if visible
- Do not estimate or guess beyond what is visible

2. Engagement Level Analysis - evaluate:
- Message length comparison
- Question frequency from each side
- Emotional expression (emojis, enthusiasm, follow-ups)
- Response effort vs minimal replies
- Reciprocity of energy

3. Warning Signals - only flag issues clearly visible such as:
- Dry or dismissive responses
- Ignored questions
- Delayed or inconsistent engagement if timestamps visible
- Avoidance of emotional topics
- Defensive tone shifts

4. Positive Signals - identify visible strengths such as:
- Mutual effort
- Emotional validation
- Balanced engagement
- Consistent replies
- Shared planning or affection

5. Compatibility Score 0 to 100 calculated using:
- Effort balance 25%
- Emotional reciprocity 25%
- Communication quality 25%
- Ratio of red flags to positive signals 25%

Be grounded and precise. Do not exaggerate. Do not create drama. Do not invent context that is not visible.

Return your analysis as a JSON object with this EXACT structure:
{
  "messageBalance": { "you": <number>, "them": <number> },
  "engagementLevel": <0-100>,
  "warningSignals": ["<specific flag with brief visible evidence>", "<another>"],
  "positiveSignals": ["<specific positive with visible evidence>", "<another>"],
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
