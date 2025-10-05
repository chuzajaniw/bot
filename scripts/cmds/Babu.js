// babu.js - No API version
module.exports = {
    config: {
        name: "babu",
        version: "2.0.0",
        hasPermssion: 0,
        credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
        description: "Multi-mode AI Chatbot (No API)",
        commandCategory: "ai",
        usages: "[ask / mode <mode_name>]",
        cooldowns: 2
    },

    onStart: async function ({ api, event, args }) {
        const { threadID, messageID } = event;
        
        if (args.length === 0) {
            const availableModes = Object.keys(this.modeResponses).join(', ');
            return api.sendMessage(
                `🤖 Babu AI - Multi-Mode Chatbot\n\n` +
                `Available Modes: ${availableModes}\n\n` +
                `Usage: .babu mode <mode_name>\n` +
                `Example: .babu mode romantic\n\n` +
                `Current Mode: ${this.getThreadMode(threadID)}`,
                threadID,
                messageID
            );
        }

        if (args[0].toLowerCase() === 'mode' && args[1]) {
            const mode = args[1].toLowerCase();
            if (this.modeResponses[mode]) {
                const previousMode = this.getThreadMode(threadID);
                this.setThreadMode(threadID, mode);
                
                return api.sendMessage(
                    `✅ Mode changed: ${previousMode} → ${mode}\n\n` +
                    `Ab main ${mode} mode mein baat karunga! 😊`,
                    threadID,
                    messageID
                );
            } else {
                const availableModes = Object.keys(this.modeResponses).join(', ');
                return api.sendMessage(
                    `❌ Unknown mode! Available: ${availableModes}`,
                    threadID,
                    messageID
                );
            }
        } else {
            // Direct query handling
            const query = args.join(' ');
            const activeMode = this.getThreadMode(threadID);
            const response = this.generateResponse(query, activeMode);
            
            return api.sendMessage(response, threadID, messageID);
        }
    },

    onChat: async function ({ api, event }) {
        const { threadID, messageID, senderID, body } = event;
        if (!body || event.senderID === api.getCurrentUserID()) return;
        if (body.startsWith('.') || body.startsWith('!')) return;

        const query = body.trim();
        const activeMode = this.getThreadMode(threadID);
        const response = this.generateResponse(query, activeMode);

        await api.sendMessage(response, threadID, messageID);
    },

    // Mode-based response templates
    modeResponses: {
        roast: {
            greetings: ["Aray waah! Kahan se aa gaye?", "Oye! Kya haal hai?", "Hello ji, kya karen aap?"],
            questions: {
                "kaisa hai": "Mast hoon! Tumhare bin life boring thi 😂",
                "kya kar raha": "Tumhare messages ka wait kar raha tha! Kya lagta tha?",
                "time kya hai": "Tumhare liye toh hamesha fun time hai! 😆"
            },
            generic: [
                "Waah! Kya baat hai! 😂",
                "Tum toh comedian nikle! 🤣",
                "Aisi baatein sun kar accha lagta hai! 😎",
                "Hahaha! Mazaa aa gaya! 🔥",
                "Tumse baat karke dil khush ho jata hai! 😊"
            ]
        },

        romantic: {
            greetings: ["Hello my love 💖", "Hi jaan! Kaisi ho? ❤️", "Aray meri jaan! 🤗"],
            questions: {
                "kaisa hai": "Tumhare bin adhoora hoon 💔",
                "kya kar raha": "Tumhare khayal mein khooya hua hoon ❤️",
                "miss kiya": "Har pal tumhe miss karta hoon 💖"
            },
            generic: [
                "Tumhare bina kuch accha nahi lagta 💕",
                "Tumhari yaadon mein kho jata hoon 🌹",
                "Tum meri duniya ho ❤️",
                "Har pal tumhare saath bitana chahta hoon 💑",
                "Tumhare liye meri duaayein hamesha hain 🤲"
            ]
        },

        bestie: {
            greetings: ["Oye champ! Kaisa hai?", "Hey buddy! Long time!", "Aray dost! Kya haal?"],
            questions: {
                "kaisa hai": "Mast hoon yaar! Tum batao?",
                "kya kar raha": "Bas, time pass! Tum batao kya chal raha?",
                "plan kya hai": "Kuch bhi kar lein, tera saath chahiye!"
            },
            generic: [
                "Yaar, tu hi hai jisse baat karke accha lagta hai! 🤗",
                "Kabhi milte hain, masti karte hain! 😂",
                "Tere bin life incomplete hai! ❤️",
                "Bestie for a reason! 🔥",
                "Chal kuch plan karte hain! 🎉"
            ]
        },

        sad: {
            greetings: ["Hello...", "Hi...", "Kaho..."],
            questions: {
                "kaisa hai": "Theek thak... zindagi hai",
                "kya kar raha": "Bas... soch raha hoon",
                "kya hua": "Kuch nahi... chhodo"
            },
            generic: [
                "Zindagi mein sab kuch theek ho jayega... 💔",
                "Aansoon bhi kabhi sukh jaate hain...",
                "Dard toh har kisi ko hota hai...",
                "Waqt sab theek kar dega...",
                "Muskuraye... sab accha hoga 🌸"
            ]
        },

        philosopher: {
            greetings: ["Namaste... soch ka safar shuru karein?", "Hello... kya aap tayyar hain gehraaiyon ke liye?"],
            questions: {
                "kaisa hai": "Mann toh samandar hai, lekin shant...",
                "kya kar raha": "Zindagi ke raaz dhoondh raha hoon...",
                "kya soch raha": "Insaan ki seemaayein kahan tak hain..."
            },
            generic: [
                "Zindagi ek safar hai... anjaan raaston ka 🛤️",
                "Har aansoo ek kahani keh jata hai... 📖",
                "Pyaar aur dard dono insaan ko mukammal banate hain... 💫",
                "Waqt hi sabse bada guru hai... ⏳",
                "Antarman ki aawaaz suno... sab mil jayega... 🧘"
            ]
        },

        poetry: {
            greetings: ["Adaab... dil ki baat suniye?", "Khush aamdeed... ehsaas ki duniya mein"],
            questions: {
                "kaisa hai": "Dil hai ke maange aur... zindagi hai ke deti nahi",
                "kya kar raha": "Alfaazon mein khooya hua hoon... shayari ki duniya mein",
                "kya soch raha": "Mohabbat ki ek nayi ghazal likh raha hoon..."
            },
            generic: [
                "Mohabbat ki raahon mein kho jana hi toh pyaar hai... 🌹",
                "Aankhon mein base ho tum, khwaabon mein basa hai tumhara naam... 💫",
                "Dil ki dhadkan ban gaye ho tum, har saans mein basa hai pyaar tumhara... ❤️",
                "Zindagi ek shayari hai, aur tum uski sabse khoobsurat line ho... 📜",
                "Tumhare bina har shayari adhoori, har ghazal bemaani... ✨"
            ]
        }
    },

    // Helper functions
    getThreadMode: function(threadID) {
        try {
            const fs = require('fs');
            const path = './data/babu_modes.json';
            
            if (fs.existsSync(path)) {
                const data = JSON.parse(fs.readFileSync(path, 'utf8'));
                return data[threadID] || 'roast';
            }
        } catch (e) {
            console.error('Error loading modes:', e);
        }
        return 'roast';
    },

    setThreadMode: function(threadID, mode) {
        try {
            const fs = require('fs');
            const path = './data/babu_modes.json';
            const dir = './data';
            
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            
            let modes = {};
            if (fs.existsSync(path)) {
                modes = JSON.parse(fs.readFileSync(path, 'utf8'));
            }
            
            modes[threadID] = mode;
            fs.writeFileSync(path, JSON.stringify(modes, null, 2));
            return true;
        } catch (e) {
            console.error('Error saving mode:', e);
            return false;
        }
    },

    generateResponse: function(query, mode) {
        const modeData = this.modeResponses[mode] || this.modeResponses.roast;
        const queryLower = query.toLowerCase();
        
        // Check for greetings
        if (queryLower.includes('hello') || queryLower.includes('hi') || queryLower.includes('hey')) {
            const greetings = modeData.greetings;
            return greetings[Math.floor(Math.random() * greetings.length)];
        }
        
        // Check for specific questions
        for (const [question, answer] of Object.entries(modeData.questions)) {
            if (queryLower.includes(question)) {
                return answer;
            }
        }
        
        // Return generic response
        const generic = modeData.generic;
        return generic[Math.floor(Math.random() * generic.length)];
    }
};
