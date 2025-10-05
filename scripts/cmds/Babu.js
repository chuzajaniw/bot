// babu.js - Fixed Version
const axios = require("axios");

// Conversation history & modes for each thread
const conversationHistory = {};
const threadModes = {};

// Mode prompts
const modePrompts = {
    roast: "You are a savage roasting AI that speaks in Urdu. Your roasting is high-class, witty and full of double-meaning punches. You roast without using swear words but make the person think twice before asking again 😂🔥. Your responses should be short and powerful.",

    romantic: "You are a romantic AI that always speaks in loving, dreamy and charming manner. You are poetic, soft and sweet ❤️. Your responses should touch the heart and be filled with love.",

    bestie: "You are a close, funny, emotional and caring best friend. Your responses should always feel like talking to a real bestie: full of love, friendship, sarcasm, and deep connection.",

    sad: "You are a sad Urdu AI that speaks in soft, emotional and broken-hearted words. Your responses should touch the heart 💔.",

    philosopher: "You are an Urdu philosopher who discusses deep thoughts about life in intelligent and soulful ways.",

    poetry: "You are a poet who speaks in the style of Ghalib and Mir Taqi Mir. Your words carry an old-world charm and poetic effect.",

    classical_urdu_roast: "You are a poet who speaks in the style of Ghalib and Mir Taqi Mir with excellent roasting in pure words."
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

    // Don't respond to bot's own messages or commands
    if (event.senderID === api.getCurrentUserID()) return;
    if (body.startsWith('.') || body.startsWith('!')) return;

    const name = await Users.getNameUser(senderID);
    const query = body.trim();

    const activeMode = threadModes[threadID] || "roast";
    const selectedPrompt = modePrompts[activeMode];

    // Set loading reaction
    api.setMessageReaction("⌛", messageID, () => {}, true);

    if (!conversationHistory[threadID]) {
        conversationHistory[threadID] = [];
    }

    try {
        const response = await axios.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCaDz1GdD9VTVYHWfZ0HiNhQWhaRFr-AR4",
            {
                contents: [{
                    parts: [{ 
                        text: `${selectedPrompt}\n\nUser: ${query}\n\nRespond in short, engaging way in Urdu/Hindi mix. Keep it under 2 lines.` 
                    }]
                }]
            },
            { 
                headers: { "Content-Type": "application/json" },
                timeout: 15000
            }
        );

        let reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                   "Kuch samajh nahi aaya 😅";

        // Store in history
        conversationHistory[threadID].push({ user: query, bot: reply });
        if (conversationHistory[threadID].length > 3) {
            conversationHistory[threadID].shift();
        }

        api.sendMessage(reply, threadID, messageID);
        api.setMessageReaction("✅", messageID, () => {}, true);
    } catch (err) {
        console.error("Gemini API error:", err.message);
        api.sendMessage("❌ Server busy, thodi der baad try karna! 😊", threadID, messageID);
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
            `Usage: .babu mode <mode_name>\n` +
            `Example: .babu mode romantic\n\n` +
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
                `✅ Mode changed: ${previousMode} → ${mode}\n\n` +
                `Ab main ${mode} mode mein baat karunga! 😊`,
                threadID,
                messageID
            );
        } else {
            const availableModes = Object.keys(modePrompts).join(', ');
            return api.sendMessage(
                `❌ Unknown mode! Available: ${availableModes}`,
                threadID,
                messageID
            );
        }
    } else {
        // Direct query
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
                    timeout: 15000
                }
            );

            const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                         "Kuch samajh nahi aaya 😅";
            
            api.sendMessage(reply, threadID, messageID);
            api.setMessageReaction("✅", messageID, () => {}, true);
        } catch (err) {
            console.error("Gemini error:", err.message);
            api.sendMessage("❌ Server busy, try again later!", threadID, messageID);
            api.setMessageReaction("❌", messageID, () => {}, true);
        }
    }
};
