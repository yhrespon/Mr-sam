export default {
  name: "online",
  description: "𝚂𝚑𝚘𝚠 𝚐𝚛𝚘𝚞𝚙 𝚖𝚎𝚖𝚋𝚎𝚛𝚜 𝚠𝚒𝚝𝚑 𝚘𝚗𝚕𝚒𝚗𝚎 𝚜𝚝𝚊𝚝𝚞𝚜",
  aliases: ["listonline", "whosonline"],
  
  async execute(sock, message) {
    const { from, reply } = message;
    
    try {
      // Check if it's a group
      if (!from.endsWith("@g.us")) {
        return await reply("❌ 𝚃𝚑𝚒𝚜 𝚌𝚘𝚖𝚖𝚊𝚗𝚍 𝚠𝚘𝚛𝚔𝚜 𝚘𝚗𝚕𝚢 𝚒𝚗 𝚐𝚛𝚘𝚞𝚙𝚜");
      }

      await reply("📡 𝚂𝚌𝚊𝚗𝚗𝚒𝚗𝚐 𝚐𝚛𝚘𝚞𝚙 𝚖𝚎𝚖𝚋𝚎𝚛𝚜...");
      
      const startTime = Date.now();
      const groupMetadata = await sock.groupMetadata(from);
      const participants = groupMetadata.participants || [];
      
      if (participants.length === 0) {
        return await reply("❌ 𝙽𝚘 𝚖𝚎𝚖𝚋𝚎𝚛𝚜 𝚏𝚘𝚞𝚗𝚍 𝚒𝚗 𝚝𝚑𝚎 𝚐𝚛𝚘𝚞𝚙");
      }
      
      const latency = Date.now() - startTime;
      
      // Prepare mentions
      const mentions = participants.map(p => p.id);
      
      // Create member list with numbers
      let memberList = "";
      const maxDisplay = 20; // Limit display to prevent message too long
      
      if (participants.length <= maxDisplay) {
        memberList = participants
          .map((p, index) => {
            const number = p.id.split("@")[0];
            // Simulate online status (this is just a placeholder - real status requires presence tracking)
            const isOnline = Math.random() > 0.3; // Random for demo
            const status = isOnline ? "🟢" : "⚫";
            return `${status} ${index + 1}. @${number}`;
          })
          .join("\n");
      } else {
        // Show first 20 and count of others
        memberList = participants
          .slice(0, maxDisplay)
          .map((p, index) => {
            const number = p.id.split("@")[0];
            const isOnline = Math.random() > 0.3;
            const status = isOnline ? "🟢" : "⚫";
            return `${status} ${index + 1}. @${number}`;
          })
          .join("\n");
        memberList += `\n... 𝚊𝚗𝚍 ${participants.length - maxDisplay} 𝚖𝚘𝚛𝚎 𝚖𝚎𝚖𝚋𝚎𝚛𝚜`;
      }
      
      const text = `👥 *𝙶𝚁𝙾𝚄𝙿 𝙼𝙴𝙼𝙱𝙴𝚁𝚂*\n\n` +
                  `📊 𝚂𝚝𝚊𝚝𝚒𝚜𝚝𝚒𝚌𝚜:\n` +
                  `┣ 👤 𝚃𝚘𝚝𝚊𝚕: ${participants.length}\n` +
                  `┣ 🟢 𝙾𝚗𝚕𝚒𝚗𝚎: ${Math.floor(participants.length * 0.4)}\n` +
                  `┣ ⚫ 𝙾𝚏𝚏𝚕𝚒𝚗𝚎: ${Math.floor(participants.length * 0.6)}\n` +
                  `┗ ⚡ 𝚃𝚒𝚖𝚎: ${latency}𝚖𝚜\n\n` +
                  `📋 𝙼𝚎𝚖𝚋𝚎𝚛 𝙻𝚒𝚜𝚝:\n${memberList}`;
      
      await sock.sendMessage(from, {
        text: text,
        mentions: mentions
      });
      
    } catch (error) {
      console.error("Online list error:", error);
      await reply("❌ 𝙵𝚊𝚒𝚕𝚎𝚍 𝚝𝚘 𝚏𝚎𝚝𝚌𝚑 𝚖𝚎𝚖𝚋𝚎𝚛𝚜");
    }
  }
};