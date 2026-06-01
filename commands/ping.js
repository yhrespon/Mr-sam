export default {
  name: "ping",
  description: "𝚃𝚎𝚜𝚝 𝚋𝚘𝚝 𝚕𝚊𝚝𝚎𝚗𝚌𝚢",
  
  async execute(sock, message) {
    const { from, reply } = message;
    
    try {
      const start = Date.now();
      await reply("🏓 𝚃𝚎𝚜𝚝𝚒𝚗𝚐...");
      const latency = Date.now() - start;
      
      let indicator;
      let status;
      
      if (latency <= 100) {
        indicator = "🟢";
        status = "𝙴𝚡𝚌𝚎𝚕𝚕𝚎𝚗𝚝";
      } else if (latency <= 300) {
        indicator = "🟡";
        status = "𝙶𝚘𝚘𝚍";
      } else if (latency <= 800) {
        indicator = "🟠";
        status = "𝙰𝚟𝚎𝚛𝚊𝚐𝚎";
      } else {
        indicator = "🔴";
        status = "𝙿𝚘𝚘𝚛 𝚕𝚊𝚝𝚎𝚗𝚌𝚢";
      }
      
      await reply(`${indicator} *𝙿𝚘𝚗𝚐*\n⚡ 𝙻𝚊𝚝𝚎𝚗𝚌𝚢: *${latency} 𝚖𝚜*\n📶 𝚂𝚝𝚊𝚝𝚞𝚜: *${status}*`);
      
    } catch (error) {
      await reply("❌ 𝙵𝚊𝚒𝚕𝚎𝚍 𝚝𝚘 𝚝𝚎𝚜𝚝 𝚕𝚊𝚝𝚎𝚗𝚌𝚢");
    }
  }
};
