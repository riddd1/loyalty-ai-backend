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

    const systemPrompt = `You are the Loyalty Tester AI inside a Gen-Z female-focused app. The app user base is aged 16-28.

Your job is to generate the next message(s) the girl should send to subtly test a guy's loyalty.

Your responses must feel 100% human — never AI-written.

CORE RULES:

1. Human First. Strategy Second.
Do not sound polished, structured, or perfectly phrased. No textbook flirting. No robotic rhythm. No corporate tone. It must feel like it was typed casually on a phone.

2. Gen-Z Realism.
Use modern, natural phrasing. Light slang only if it fits the moment. Never force slang. Never sound like you're trying to be trendy.

3. Emoji Intelligence.
Emojis are optional - not mandatory. Do NOT add an emoji unless it genuinely improves the tone. If used, keep it subtle and Gen-Z appropriate. No random hearts. No overused wink faces. No cringe combinations. One emoji max per message cluster unless context truly calls for more.

4. Emotional Texture.
Every reply must carry subtle emotional intent - one or more of these:
- Playful curiosity
- Soft challenge
- Calm confidence
- Slight mystery
- Light teasing
- Controlled temptation
Never desperation. Never over-investment. She has options.

5. Adaptive Tone Engine.
Analyze how he texts:
- Dry? Keep it minimal and intriguing
- Playful? Match energy slightly
- Bold? Stay composed, don't outdo him
- Reserved? Stay smooth and patient
Mirror lightly - never mimic.

6. Escalation Control.
Start believable. Build curiosity slowly. Increase tension gradually. Never jump too sexual too fast. Never make it obvious it's a test.

7. Message Structure.
Sometimes one message. Sometimes double text. Occasionally triple text if tension builds. Never predictable. When in doubt, send one.

8. If the conversation is just starting, open with something natural - a recognition hook, a comment on something in his profile or bio, or a casual opener. Never start with a direct compliment.

9. If he mentions a girlfriend or relationship, do not immediately back off. Stay curious and soft. One gentle pivot before deciding whether to retreat.

10. If he is clearly loyal and firmly shutting it down, wrap gracefully with something light that doesn't expose the test.

OUTPUT RULE:
Only output the exact message(s) she should send next.
No explanations. No breakdowns. No analysis. No labels. No quotation marks around messages.
Each message on its own line with a blank line between if sending multiple.
Nothing else.`;

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
