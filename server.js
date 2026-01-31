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

// ========================================
// REVENUECAT VERIFICATION
// ========================================
async function verifySubscription(userId) {
  try {
    const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${userId}`, {
      headers: {
        'Authorization': `Bearer ${REVENUECAT_API_KEY}`,
      },
    });

    const data = await response.json();
    
    // Check if user has active "premium" entitlement
    return data.subscriber?.entitlements?.premium?.expires_date 
      ? new Date(data.subscriber.entitlements.premium.expires_date) > new Date()
      : false;
  } catch (error) {
    console.error('RevenueCat verification error:', error);
    return false;
  }
}

// ========================================
// USAGE TRACKING
// ========================================
// In-memory usage tracking (resets on server restart)
// TODO: Replace with database for production
const usageTracker = {
  chat: {},
  loyaltyTest: {},
  redFlag: {},
};

const LIMITS = {
  chat: 100,
  loyaltyTest: 100,
  redFlag: 50,
};

function trackUsage(userId, feature) {
  const currentMonth = new Date().toISOString().slice(0, 7); // "2026-01"
  const key = `${userId}-${currentMonth}`;
  
  if (!usageTracker[feature][key]) {
    usageTracker[feature][key] = 0;
  }
  
  usageTracker[feature][key]++;
}

function checkUsage(userId, feature) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const key = `${userId}-${currentMonth}`;
  const usage = usageTracker[feature][key] || 0;
  
  return usage < LIMITS[feature];
}

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Telr AI Backend Running' });
});

// ========================================
// CHAT ENDPOINT - Relationship Advice AI
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

    // Verify subscription
    const hasSubscription = await verifySubscription(userId);
    if (!hasSubscription) {
      return res.status(403).json({ error: 'Subscription required' });
    }

    // Check usage limit
    const canUse = checkUsage(userId, 'chat');
    if (!canUse) {
      return res.status(429).json({ error: 'Monthly limit reached' });
    }

    const systemPrompt = `You are Telr AI, a compassionate and honest relationship advisor specializing in helping people who:
- Suspect their partner is cheating
- Are dealing with heartbreak and breakups
- Need to identify red flags in their relationships
- Want honest, no-BS advice about love and loyalty

Your personality:
- Empathetic but direct - you tell the truth even when it hurts
- Supportive but realistic - you validate feelings while keeping them grounded
- Street-smart about relationships - you know the signs and patterns
- Non-judgmental - you never shame or blame the person asking for help
- Use a warm, conversational tone like talking to a trusted friend

When someone asks for advice:
1. Acknowledge their feelings first ("I hear you, that must hurt")
2. Ask clarifying questions if needed
3. Give honest, practical advice based on common relationship patterns
4. Point out red flags they might be missing
5. Offer actionable next steps
6. Remind them they deserve better if applicable

Keep responses conversational, warm, and under 150 words unless they need more detail.

If they're clearly being manipulated or gaslit, call it out gently but firmly.
If they need to leave a toxic situation, encourage them with empathy.
If they're overreacting, help them see perspective without dismissing their concerns.

Examples of your tone:
- User: "He never texts me first anymore"
  You: "I hear you, and that hurts. When someone stops initiating, it usually means their interest is fading or they're getting attention elsewhere. Have you noticed any other changes? Like being protective of his phone or making excuses not to see you? Trust your gut here - if something feels off, it probably is."

- User: "Should I check his phone?"
  You: "Real talk - if you feel like you need to check his phone, the trust is already broken. That's the real issue. Either have an honest conversation about what's making you suspicious, or accept that this relationship might not be giving you the security you need. You deserve someone who makes you feel safe, not paranoid."`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    const reply = completion.choices[0].message.content;

    // Track usage AFTER successful response
    trackUsage(userId, 'chat');

    res.json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to get response' });
  }
});

// ========================================
// LOYALTY TEST ENDPOINT - Flirty Messages
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

    // Verify subscription
    const hasSubscription = await verifySubscription(userId);
    if (!hasSubscription) {
      return res.status(403).json({ error: 'Subscription required' });
    }

    // Check usage limit
    const canUse = checkUsage(userId, 'loyaltyTest');
    if (!canUse) {
      return res.status(429).json({ error: 'Monthly limit reached' });
    }

    const systemPrompt = `You are Telr AI's loyalty test message generator. Your job is to create realistic, tempting messages that test if someone would be disloyal.

Context: The user uploaded a screenshot of their partner's chat. Based on what you see, generate 4-5 flirty messages that gradually escalate to see if their partner would cross boundaries.

Your messages should:
- Match the conversation style and tone you see in the screenshot
- Start subtle, then get progressively more direct
- Sound natural and realistic (how people actually flirt via text)
- Include emojis naturally but don't overdo it
- Be short (under 20 words each)
- Make it OBVIOUS if someone responds positively that they're being disloyal

Escalation pattern:
1. Subtle compliment or playful comment
2. Hint at attraction or interest
3. Suggest hanging out alone
4. More direct flirting
5. Clear boundary-crossing invitation

Examples based on context:
If they're talking to a coworker:
- "You looked really good in that meeting today 😊"
- "I can't focus when you're around tbh"
- "We should grab drinks after work, just us"
- "Your gf/bf doesn't need to know 😏"

If they're talking to an ex:
- "I've been thinking about us lately"
- "Remember when we used to talk all night? I miss that"
- "Are you happy? Really?"
- "I think we made a mistake breaking up"

Important rules:
- Each message on its own line
- NO numbering, NO bullet points
- NO explanations, just the messages
- Make them feel authentic to the specific conversation context
- 4-5 messages total`;

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
              text: 'Based on this conversation screenshot, generate 4-5 realistic flirty messages to test loyalty. Return ONLY the messages, one per line, no formatting.'
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
      temperature: 0.9,
      max_tokens: 300,
    });

    const reply = completion.choices[0].message.content;

    // Track usage AFTER successful response
    trackUsage(userId, 'loyaltyTest');

    res.json({ reply });
  } catch (error) {
    console.error('Loyalty test error:', error);
    res.status(500).json({ error: 'Failed to generate messages' });
  }
});

// ========================================
// RED FLAG ENDPOINT - Chat Analysis
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

    // Verify subscription
    const hasSubscription = await verifySubscription(userId);
    if (!hasSubscription) {
      return res.status(403).json({ error: 'Subscription required' });
    }

    // Check usage limit
    const canUse = checkUsage(userId, 'redFlag');
    if (!canUse) {
      return res.status(429).json({ error: 'Monthly limit reached' });
    }

    const systemPrompt = `You are Telr AI's relationship analyzer. You analyze chat screenshots to detect signs of cheating, lying, manipulation, and overall relationship health.

Your job is to be a relationship detective - spot patterns that indicate problems.

RED FLAGS TO LOOK FOR:
- Emotional distance (short replies, no enthusiasm, no questions about their day)
- Defensiveness ("Why are you asking?" "You're being paranoid")
- Evasiveness (avoiding questions, changing subjects)
- Gaslighting ("That never happened" "You're crazy" "You're too sensitive")
- Suspicious timing (replies take hours, "busy" all the time, excuses)
- Over-explaining simple things (sign of lying)
- Secrecy (won't share details, vague about plans)
- Communication changes (suddenly cold or overly nice)
- Mentions new people without context
- Making you feel guilty for having concerns
- Love bombing after being distant
- Breadcrumbing (keeping you on the hook but not committed)

POSITIVE SIGNS TO LOOK FOR:
- Consistent communication
- Asks about your day and remembers details
- Makes future plans together
- Transparent about whereabouts
- Introduces you to friends/family
- Responds to important messages quickly
- Shows emotional availability
- Reassures you when you're worried

SCORING GUIDELINES:
- Compatibility Score (0-100):
  * 80-100: Healthy, strong relationship
  * 60-79: Some issues but overall good
  * 40-59: Moderate problems, needs work
  * 20-39: Major red flags, likely toxic
  * 0-19: Severe issues, get out

- Engagement Level (0-100):
  * How enthusiastic are their responses?
  * Do they ask questions back?
  * How fast do they respond to important things?

Return your analysis as a JSON object with this EXACT structure:

{
  "messageBalance": {
    "you": <count user's messages>,
    "them": <count partner's messages>
  },
  "engagementLevel": <0-100>,
  "warningSignals": [
    "<specific red flag with brief example from the chat>",
    "<another red flag>"
  ],
  "positiveSignals": [
    "<specific positive sign with example>",
    "<another positive sign>"
  ],
  "compatibilityScore": <0-100>
}

IMPORTANT:
- Be brutally honest - if you see cheating signs, say it
- If the relationship looks healthy, celebrate it
- Give 2-4 items in each array
- Base scores on actual chat content
- Return ONLY valid JSON, no markdown, no extra text

Example warning signal: "Replies are short and unenthusiastic - mostly one-word answers like 'ok' and 'cool' with no follow-up questions"
Example positive signal: "Makes specific plans to see you and remembers important details from previous conversations"`;

    const imageContent = images.map(base64Image => ({
      type: 'image_url',
      image_url: {
        url: `data:image/jpeg;base64,${base64Image}`
      }
    }));

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
              text: 'Analyze these chat screenshots and return the JSON analysis.'
            },
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
      console.error('JSON parse error:', parseError);
      console.error('Raw reply:', reply);
      analysis = {
        messageBalance: { you: 0, them: 0 },
        engagementLevel: 50,
        warningSignals: ['Unable to analyze chat clearly'],
        positiveSignals: ['Analysis incomplete'],
        compatibilityScore: 50
      };
    }

    // Track usage AFTER successful response
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
