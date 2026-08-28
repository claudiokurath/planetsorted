/**
 * RSD Reality Check — Rule-based reframing & reply-script engine.
 *
 * This runs entirely client-side (no external AI/API calls — this is a
 * static site). It uses keyword/pattern detection over the pasted message
 * and context to select from a curated bank of neutral reframes and
 * tone-specific reply scripts, then blends in a couple of generic,
 * always-true reframes so every result feels complete even for very
 * short or ambiguous input.
 */
const RSDEngine = (function () {

  // ---------- Signal detection ----------

  const SIGNAL_LIBRARY = [
    {
      id: 'short_reply',
      test: (msg) => msg.trim().length > 0 && msg.trim().split(/\s+/).length <= 4,
      interpretation: {
        title: 'It may simply be brief, not cold',
        text: "Short messages are often a product of the sender being busy, on their phone, or just not a big writer — not a signal about how they feel about you. Tone is genuinely hard to read from a handful of words."
      }
    },
    {
      id: 'need_to_talk',
      test: (msg) => /\b(we need to talk|can we talk|need to discuss|need to chat|got a minute|can we (hop on a|jump on a) call)\b/i.test(msg),
      interpretation: {
        title: '"We need to talk" is a scheduling cue, not a verdict',
        text: "This phrase usually just means the person wants a real-time conversation instead of typing something out — it's used for good news, logistics, and minor issues far more often than for something catastrophic."
      }
    },
    {
      id: 'no_reply',
      test: (msg, ctx) => /\b(hasn'?t replied|no response|left on read|didn'?t respond|haven'?t heard back|ghosted|no reply)\b/i.test(msg + ' ' + ctx),
      interpretation: {
        title: 'Silence has many mundane explanations',
        text: "A delayed reply is far more often explained by a busy inbox, a notification getting buried, or the person mentally drafting a thoughtful answer than by anger or rejection."
      }
    },
    {
      id: 'exclusion',
      test: (msg, ctx) => /\b(not invited|wasn'?t invited|left out|excluded|didn'?t include me|forgot to invite|without me)\b/i.test(msg + ' ' + ctx),
      interpretation: {
        title: 'Being left off something is rarely deliberate',
        text: "Group invites and CC lists are usually assembled quickly from memory or an old list — an omission is far more often an oversight than an intentional exclusion."
      }
    },
    {
      id: 'criticism',
      test: (msg) => /\b(disappointed|not (what i|what we) expected|needs? (work|improvement)|issues? with|concerns? about|falls? short|below expectations|not good enough|mistakes?|wrong|redo|revise)\b/i.test(msg),
      interpretation: {
        title: 'Feedback targets the work, not your worth',
        text: "Even direct critical feedback is almost always about a specific deliverable or moment in time — it's rarely a comprehensive judgment of your ability or character, even when it doesn't feel that way in the moment."
      }
    },
    {
      id: 'cancel',
      test: (msg) => /\b(cancel|reschedul|can'?t make it|won'?t be able to|postpone)\b/i.test(msg),
      interpretation: {
        title: 'Canceled plans usually reflect their schedule, not your value',
        text: "Rescheduling or canceling is most often driven by the other person's competing constraints (energy, time, other obligations) rather than a change in how they feel about spending time with you."
      }
    },
    {
      id: 'exclaim_caps',
      test: (msg) => /[A-Z]{4,}/.test(msg) || (msg.match(/!/g) || []).length >= 2,
      interpretation: {
        title: 'Formatting often reflects urgency, not fury',
        text: "Capitalization and exclamation points frequently signal that someone is rushed, distracted, or trying to be noticed in a busy channel — not that they're angry with you specifically."
      }
    },
    {
      id: 'question_only',
      test: (msg) => msg.trim().endsWith('?') && msg.trim().split(/\s+/).length <= 12,
      interpretation: {
        title: 'A direct question is a request for information',
        text: "A short question is typically exactly what it looks like — someone wants a fact or a decision from you. It's easy to layer judgment onto it that was never intended."
      }
    },
    {
      id: 'no_greeting',
      test: (msg) => !/^(hi|hello|hey|dear|good (morning|afternoon|evening))/i.test(msg.trim()) && msg.trim().split(/\s+/).length > 6,
      interpretation: {
        title: 'Skipping pleasantries is often just efficiency',
        text: "Jumping straight to the point without a greeting is a common habit for busy communicators and says nothing about their regard for you personally."
      }
    },
    {
      id: 'past_tense_negative',
      test: (msg) => /\b(unacceptable|not okay|not ok|frustrat|upset|angry|furious)\b/i.test(msg),
      interpretation: {
        title: 'Strong words can describe a moment, not a relationship',
        text: "Even when someone names frustration directly, it usually describes their reaction to a single event — it is information you can act on, not evidence of how they see you overall."
      }
    }
  ];

  const GENERIC_INTERPRETATIONS = [
    {
      title: 'Text strips out tone entirely',
      text: "Written messages carry none of the facial expression, vocal tone, or body language we normally use to judge intent — our brains often fill that gap with the worst-case guess by default."
    },
    {
      title: 'Your reaction is data, not proof',
      text: "Feeling a strong reaction tells you something matters to you — it doesn't tell you the other person meant harm. The intensity of a feeling is not evidence of the accuracy of the interpretation behind it."
    },
    {
      title: 'There may be a story you don\'t have',
      text: "The sender likely has context you can't see right now — what they're dealing with today, a deadline they're under, or a habit of writing tersely to everyone, not just you."
    },
    {
      title: 'Most ambiguous messages resolve neutrally',
      text: "In hindsight, the vast majority of messages that trigger a strong reaction turn out to be about logistics, timing, or something unrelated to the relationship at all."
    },
    {
      title: 'One data point isn\'t a pattern',
      text: "It's worth asking whether this message, read on its own without your history of worry, would still feel alarming — often a single line loses its charge once separated from anticipation."
    }
  ];

  function detectSignals(message, context) {
    const msg = message || '';
    const ctx = context || '';
    return SIGNAL_LIBRARY.filter(s => {
      try { return s.test(msg, ctx); } catch (e) { return false; }
    });
  }

  function generateInterpretations(message, context) {
    const matched = detectSignals(message, context).map(s => s.interpretation);
    const pool = [...matched];
    // fill with generic ones not already conceptually duplicated, until we have 3
    const usedTitles = new Set(pool.map(p => p.title));
    for (const g of GENERIC_INTERPRETATIONS) {
      if (pool.length >= 3) break;
      if (!usedTitles.has(g.title)) {
        pool.push(g);
        usedTitles.add(g.title);
      }
    }
    return pool.slice(0, 3);
  }

  // ---------- Reply scripts ----------

  function snippet(message, maxLen) {
    const trimmed = (message || '').trim().replace(/\s+/g, ' ');
    if (trimmed.length <= maxLen) return trimmed;
    return trimmed.slice(0, maxLen).trim() + '…';
  }

  function generateScripts(message, context, intensity) {
    const hasContext = !!(context && context.trim().length > 0);
    const isQuestion = /\?\s*$/.test((message || '').trim());
    const looksCritical = /\b(disappointed|issues?|concerns?|mistake|wrong|redo|revise|not good enough|unacceptable)\b/i.test(message || '');
    const looksLikeMeeting = /\b(talk|discuss|call|meeting|chat)\b/i.test(message || '');

    let neutral, warm, firm;

    if (isQuestion) {
      neutral = "Thanks for asking — let me get you a clear answer. Give me a little time to check the details and I'll follow up shortly.";
      warm = "Great question — I appreciate you checking in! Let me look into it properly so I can give you a full answer rather than a rushed one. I'll get back to you soon.";
      firm = "I want to give you an accurate answer, so I'll follow up once I've confirmed the details. Thanks for your patience.";
    } else if (looksCritical) {
      neutral = "Thanks for the feedback. I want to make sure I understand exactly what you'd like changed — could you point to the specific part you'd like addressed?";
      warm = "I really appreciate you telling me directly — that helps me improve. Could we go over the specifics together so I get it right?";
      firm = "Thanks for flagging this. I'd like to understand the specific expectation so I can address it directly. Can we clarify the details?";
    } else if (looksLikeMeeting) {
      neutral = "Sure, happy to talk. Could you let me know what time works, and if there's anything I should prepare beforehand?";
      warm = "Of course — always happy to connect! Let me know a time that works for you, and I'll make sure I'm ready.";
      firm = "I'm available to discuss this. Please share a time and a brief agenda so we can make the conversation productive.";
    } else {
      neutral = "Thanks for your message. I wanted to check I'm reading this correctly — could you share a bit more detail so I can respond appropriately?";
      warm = "Thanks so much for reaching out! I want to make sure I respond in the most helpful way — could you tell me a little more about what you're looking for?";
      firm = "Thanks for the note. Could you clarify the specific ask or expectation here? I want to make sure my response is on target.";
    }

    if (hasContext) {
      const ctxSnip = snippet(context, 90);
      neutral += ` (For context on my end: ${ctxSnip})`;
    }

    if (intensity >= 7) {
      warm += " I'm taking a short moment to reply thoughtfully rather than react right away, because this matters to me.";
      firm += " I'm choosing to reply once I've had a moment to think this through carefully.";
    }

    return { neutral, warm, firm };
  }

  // ---------- Wait recommendation ----------

  function recommendWait(intensity, suggestWait) {
    intensity = Number(intensity) || 1;

    if (!suggestWait) {
      if (intensity >= 7) {
        return {
          headline: 'A short pause is still worth considering',
          detail: "You turned off wait suggestions, so it's your call — but at this intensity level, even 15–20 minutes of stepping away before hitting send tends to noticeably improve how a reply lands."
        };
      }
      return {
        headline: 'Feel free to reply whenever you\'re ready',
        detail: "You've opted out of a suggested wait, and your intensity is low enough that responding right away is unlikely to cause regret. Trust your read on this one."
      };
    }

    if (intensity <= 3) {
      return {
        headline: 'No real wait needed — reply when convenient',
        detail: "Your intensity is low. A brief re-read of your draft before sending is plenty; there's little benefit to delaying further."
      };
    }
    if (intensity <= 5) {
      return {
        headline: 'Suggested wait: about 1–2 hours',
        detail: "A short break lets any initial defensiveness settle so you can choose your words deliberately rather than reactively."
      };
    }
    if (intensity <= 7) {
      return {
        headline: 'Suggested wait: 4–6 hours (or sleep on it if evening)',
        detail: "At this intensity, emotions can still be coloring your interpretation. Stepping away for a few hours — a walk, a meal, a different task — usually reveals a calmer, clearer read of the message."
      };
    }
    if (intensity <= 9) {
      return {
        headline: 'Suggested wait: 24 hours',
        detail: "This is a strong reaction. Waiting a full day gives the emotional intensity time to drop substantially, and you can revisit your drafted reply scripts before sending — most people are glad they waited."
      };
    }
    return {
      headline: 'Suggested wait: 24–48 hours, and consider talking it through first',
      detail: "This is a very intense reaction. Beyond waiting a day or two, it can help to talk the situation through with a trusted friend, colleague, or professional before you reply, so you're responding to the actual message rather than the story around it."
    };
  }

  function intensityLabel(value) {
    const v = Number(value);
    if (v <= 2) return 'Calm';
    if (v <= 4) return 'Slightly uneasy';
    if (v <= 6) return 'Moderately concerned';
    if (v <= 8) return 'Highly triggered';
    return 'Overwhelmed';
  }

  return {
    generateInterpretations,
    generateScripts,
    recommendWait,
    intensityLabel
  };
})();
