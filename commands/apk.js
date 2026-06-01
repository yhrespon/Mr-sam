// 📁 commands/apk.js
export default {
  name: "apk",
  description: "𝚁𝚎𝚌𝚑𝚎𝚛𝚌𝚑𝚎 𝚍𝚎𝚜 𝙰𝙿𝙺 𝚜𝚞𝚛 𝚍𝚒𝚏𝚏é𝚛𝚎𝚗𝚝𝚜 𝚜𝚝𝚘𝚛𝚎𝚜",
  category: "📥 𝚃é𝚕é𝚌𝚑𝚊𝚛𝚐𝚎𝚖𝚎𝚗𝚝",

  async execute(sock, message, args) {
    const { from, reply } = message;

    try {
      if (!args || args.length === 0) {
        return await reply(
          "❌ 𝚄𝚜𝚊𝚐𝚎 : `.apk <𝚊𝚙𝚙𝚕𝚒𝚌𝚊𝚝𝚒𝚘𝚗>`\n\n" +
          "𝙴𝚡𝚊𝚖𝚙𝚕𝚎 : `.apk 𝚆𝚑𝚊𝚝𝚜𝙰𝚙𝚙`"
        );
      }

      const query = args.join(" ");

      const links = [
        `𝙿𝚕𝚊𝚢 𝚂𝚝𝚘𝚛𝚎:\n${`https://play.google.com/store/search?q=${encodeURIComponent(query)}&c=apps`}`,
        `𝙰𝙿𝙺𝙿𝚞𝚛𝚎:\n${`https://apkpure.com/search?q=${encodeURIComponent(query)}`}`,
        `𝙰𝙿𝙺𝙼𝚒𝚛𝚛𝚘𝚛:\n${`https://www.apkmirror.com/?s=${encodeURIComponent(query)}`}`,
        `𝚄𝚙𝚃𝚘𝙳𝚘𝚠𝚗:\n${`https://en.uptodown.com/android/search/${encodeURIComponent(query)}`}`,
        `𝙷𝚊𝚙𝚙𝚢𝙼𝚘𝚍:\n${`https://www.happymod.com/search.html?q=${encodeURIComponent(query)}`}`,
        `𝙰𝚙𝚝𝚘𝚒𝚍𝚎:\n${`https://en.aptoide.com/search/${encodeURIComponent(query)}`}`,
        `𝙰𝙿𝙺𝙼𝚘𝚗𝚔:\n${`https://www.apkmonk.com/search/?q=${encodeURIComponent(query)}`}`,
        `𝙰𝙿𝙺𝚜𝙵𝚛𝚎𝚎:\n${`https://apksfree.com/search/${encodeURIComponent(query)}/`}`
      ];

      await sock.sendMessage(from, {
        text:
          `🔍 𝚁𝚎𝚌𝚑𝚎𝚛𝚌𝚑𝚎 : *${query}*\n\n` +
          links.join("\n\n")
      });

    } catch (err) {
      console.error("APK error:", err);
      await reply(
        "⚠️ 𝙴𝚛𝚛𝚘𝚛.\n" +
        "𝙸𝚖𝚙𝚘𝚜𝚜𝚒𝚋𝚕𝚎 𝚍𝚎 𝚐é𝚗é𝚛𝚎𝚛 𝚕𝚎𝚜 𝚕𝚒𝚎𝚗𝚜."
      );
    }
  }
};