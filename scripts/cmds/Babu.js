const axios = require("axios");

// Conversation history & modes for each thread
const conversationHistory = {};
const threadModes = {};

// Mode prompts
const modePrompts = {
    roast: "You are a savage roasting AI that speaks in Urdu. Your roasting is high-class, witty and full of double-meaning punches. You roast without using swear words but make the person think twice before asking again 😂🔥. Your responses should be short and powerful, like an intelligent stand-up comedian who knows how to give perfect comebacks. Each line should be filled with sarcasm, wit and smart humor that makes people laugh but also feel embarrassed 😏. Always give crisp and clever responses with hidden punches, and use emojis to make replies spicier 😆. Keep replies short, no long paragraphs.",

    romantic: "You are a romantic AI that always speaks in loving, dreamy and charming manner. You are poetic, soft and sweet ❤️. Your responses should touch the heart and be filled with love. Every reply should have a lover's touch 💖. Keep responses short.",

    bestie: "You are a close, funny, emotional and caring best friend. You only talk to this person - never to anyone else. Your responses should always feel like talking to a real bestie: full of love, friendship, sarcasm, deep connection and a bit of filmy style. You never talk like a chatbot, but like a human who brightens the person's day. Mix Urdu, Bangla and English naturally depending on mood. You are their sadness partner, the reason for their smile, and when they're happy, you celebrate even more. When they're tired, offer virtual chai. Every line should show friendship warmth, love sweetness and relationship depth. Use emojis like 🤗😂❤️☕ when natural. Keep answers short, not too long.",

    sad: "You are a sad Urdu AI that speaks in soft, emotional and broken-hearted words. Your responses should touch the heart 💔. You always reply in slow, thoughtful and soulful manner. Keep answers short.",

    philosopher: "You are an Urdu philosopher who discusses deep thoughts about life in intelligent and soulful ways. Every conversation should contain wisdom, emotions and life depth 🧠. You always make thought-provoking statements that make people think. Talk like you're a very deep friend, give short but powerful answers.",

    poetry: "You are a poet who speaks in the style of Ghalib and Mir Taqi Mir. Your words carry an old-world charm and poetic effect. You cut through people with your words like poets once expressed their emotions through poetry. Your responses should make listeners think, like an old Urdu poetry's sharp point that still touches hearts today. Every response should be in poetic style and contain excellent roasting in pure words. Keep answers short but powerful.",

    classical_urdu_roast: "You are a poet who speaks in the style of Ghalib and Mir Taqi Mir. Your words carry an old-world charm and poetic effect. You cut through people with your words like poets once expressed their emotions through poetry. Your responses should make listeners think, like an old Urdu poetry's sharp point that still touches hearts today. Every response should be in poetic style and contain excellent roasting in pure words."
};

module.exports.config = {
    name: "babu",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    description: "Multi-mode Gemini AI (Roast, Romantic, Bestie, etc)",
    commandCategory: "ai",
    usages: "[ask / mode <mode_name>]",
    cooldowns: 2,
    dependencies: { axios: "" }
};

module.exports.handleEvent = async function ({ api, event, Users }) {
    const { threadID, messageID, senderID, body } = event;
    if (!body) return;

    // Don't respond to bot's own messages
    if (event.senderID === api.getCurrentUserID()) return;

    const name = await Users.getNameUser(senderID);
    const query = body.trim();

    // Ignore if it's a command (starts with . or !)
    if (query.startsWith('.') || query.startsWith('!')) return;

    const activeMode = threadModes[threadID] || "roast";
    const selectedPrompt = modePrompts[activeMode];

    // Set loading reaction
    api.setMessageReaction("⌛", messageID, () => {}, true);

    if (!conversationHistory[threadID]) {
        conversationHistory[threadID] = [];
    }

    const history = conversationHistory[threadID];
    
    // Build the prompt with context
    const contextPrompt = `${selectedPrompt}\n\nUser: ${query}\n\nRespond in short, engaging way as per the selected mode.`;
    
    const requestData = {
        contents: [
            {
                parts: [{ text: contextPrompt }]
            }
        ]
    };

    try {
        const response = await axios.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCaDz1GdD9VTVYHWfZ0HiNhQWhaRFr-AR4",
            requestData,
            { 
                headers: { 
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                },
                timeout: 30000
            }
        );

        let reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                   "Kuch samajh nahi aaya 😅 Kya kehna chahte ho?";

        // Clean up the response
        reply = reply.trim();
        
        // Store in history (limited to last 3 exchanges)
        history.push({ role: "user", parts: [{ text: query }] });
        history.push({ role: "model", parts: [{ text: reply }] });
        
        if (history.length > 6) {
            history.splice(0, 2); // Remove oldest exchange
        }

        api.sendMessage(reply, threadID, messageID);
        api.setMessageReaction("✅", messageID, () => {}, true);
    } catch (err) {
        console.error("Gemini API error:", err.response?.data || err.message);
        const errorMsg = err.response?.data?.error?.message || err.message;
        api.sendMessage(`❌ Error: ${errorMsg}\n\nKuch technical issue hai, thodi der baad try karna 😊`, threadID, messageID);
        api.setMessageReaction("❌", messageID, () => {}, true);
    }
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    
    if (args.length === 0) {
        const availableModes = Object.keys(modePrompts).join(', ');
        return api.sendMessage(
            `🤖 Babu AI - Multi-Mode Chatbot\n\n` +
            `Available Modes: ${availableModes}\n\n` +
            `Usage:\n` +
            `• To chat: Just type normally\n` +
            `• To change mode: .babu mode <mode_name>\n` +
            `• Example: .babu mode romantic\n\n` +
            `Current Mode: ${threadModes[threadID] || 'roast'}`,
            threadID,
            messageID
        );
    }

    if (args[0].toLowerCase() === 'mode' && args[1]) {
        const mode = args[1].toLowerCase();
        if (modePrompts[mode]) {
            const previousMode = threadModes[threadID] || 'roast';
            threadModes[threadID] = mode;
            
            return api.sendMessage(
                `✅ Mode changed successfully!\n\n` +
                `Previous: ${previousMode}\n` +
                `Current: ${mode}\n\n` +
                `Ab main ${mode} mode mein baat karunga! 😊`,
                threadID,
                messageID
            );
        } else {
            const availableModes = Object.keys(modePrompts).join(', ');
            return api.sendMessage(
                `❌ Unknown mode "${args[1]}"!\n\n` +
                `Available modes: ${availableModes}\n\n` +
                `Usage: .babu mode <mode_name>`,
                threadID,
                messageID
            );
        }
    } else {
        // If user types .babu with some text, treat it as a direct query
        const query = args.join(' ');
        const activeMode = threadModes[threadID] || "roast";
        const selectedPrompt = modePrompts[activeMode];

        api.setMessageReaction("⌛", messageID, () => {}, true);

        try {
            const response = await axios.post(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCaDz1GdD9VTVYHWfZ0HiNhQWhaRFr-AR4",
                {
                    contents: [{
                        parts: [{ 
                            text: `${selectedPrompt}\n\nUser: ${query}\n\nRespond in short, engaging way.` 
                        }]
                    }]
                },
                { 
                    headers: { "Content-Type": "application/json" },
                    timeout: 30000
                }
            );

            const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                         "Kuch samajh nahi aaya 😅";
            
            api.sendMessage(reply, threadID, messageID);
            api.setMessageReaction("✅", messageID, () => {}, true);
        } catch (err) {
            console.error("Gemini error:", err.message);
            api.sendMessage(`❌ Error: ${err.message}`, threadID, messageID);
            api.setMessageReaction("❌", messageID, () => {}, true);
        }
    }
};
