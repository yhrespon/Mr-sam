import { getDevice } from "@whiskeysockets/baileys";

export default {
  name: "device",
  description: "𝙲𝚑𝚎𝚌𝚔 𝚠𝚑𝚒𝚌𝚑 𝚍𝚎𝚟𝚒𝚌𝚎 𝚊 𝚞𝚜𝚎𝚛 𝚒𝚜 𝚘𝚗",
  
  async execute(sock, message) {
    const { from, reply } = message;
    
    try {
      // Get quoted message ID from message context
      const quotedId = message.quoted?.key?.id || 
                      message.message?.extendedTextMessage?.contextInfo?.stanzaId;
      
      if (!quotedId) {
        return await reply("❌ 𝙿𝚕𝚎𝚊𝚜𝚎 𝚛𝚎𝚙𝚕𝚢 𝚝𝚘 𝚊 𝚖𝚎𝚜𝚜𝚊𝚐𝚎");
      }
      
      const deviceCode = getDevice(quotedId);
      
      // Simple output
      let deviceName;
      switch(deviceCode) {
        case 0: deviceName = "Android Phone"; break;
        case 1: deviceName = "iPhone"; break;
        case 2:
        case 4: deviceName = "Web Browser"; break;
        case 3: deviceName = "Desktop App"; break;
        default: deviceName = "Unknown Device";
      }
      
      await reply(`📱 𝙳𝚎𝚟𝚒𝚌𝚎: ${deviceName}`);
      
    } catch (error) {
      console.error("Device command error:", error);
      await reply("❌ 𝙲𝚘𝚞𝚕𝚍 𝚗𝚘𝚝 𝚍𝚎𝚝𝚎𝚛𝚖𝚒𝚗𝚎 𝚍𝚎𝚟𝚒𝚌𝚎");
    }
  }
};