export default {
  name: "manga",
  description: "𝚁𝚎𝚌𝚑𝚎𝚛𝚌𝚑𝚎 𝚍’𝚞𝚗 𝚊𝚗𝚒𝚖𝚎 / 𝚖𝚊𝚗𝚐𝚊",

  async execute(sock, message, args) {
    const { from, reply } = message;

    try {
      if (!args.length) {
        return await reply("❌ 𝚄𝚝𝚒𝚕𝚒𝚜𝚊𝚝𝚒𝚘𝚗 : .manga <𝚗𝚘𝚖>");
      }

      const search = args.join(" ").trim();

      // API Jikan
      const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(search)}&limit=1`;
      const res = await fetch(url);
      const data = await res.json();

      if (!data.data || data.data.length === 0) {
        return await reply("❌ 𝙰𝚞𝚌𝚞𝚗 𝚛é𝚜𝚞𝚕𝚝𝚊𝚝 𝚝𝚛𝚘𝚞𝚟é.");
      }

      const anime = data.data[0];

      const text =
        `╔───── 𝙼𝙰𝙽𝙶𝙰 ─────╗\n` +
        `𝚃𝚒𝚝𝚛𝚎 : ${anime.title}\n\n` +
        `𝚃𝚢𝚙𝚎 : ${anime.type || "N/A"}\n` +
        `𝙰𝚗𝚗é𝚎 : ${anime.year || "N/A"}\n` +
        `𝚂𝚌𝚘𝚛𝚎 : ${anime.score || "N/A"}\n` +
        `É𝚙𝚒𝚜𝚘𝚍𝚎𝚜 : ${anime.episodes || "En cours"}\n\n` +
        `𝚂𝚢𝚗𝚘𝚙𝚜𝚒𝚜 :\n` +
        `${anime.synopsis ? anime.synopsis.substring(0, 300) : "N/A"}\n\n` +
        `𝙻𝚒𝚎𝚗 : ${anime.url}\n` +
        `╚─────────────────╝`;

      await sock.sendMessage(from, { text }, { quoted: message.raw });

    } catch (err) {
      console.error("Manga error:", err);
      await reply("⚠️ 𝚂𝚎𝚛𝚟𝚒𝚌𝚎 𝚖𝚊𝚗𝚐𝚊 𝚒𝚗𝚍𝚒𝚜𝚙𝚘𝚗𝚒𝚋𝚕𝚎.");
    }
  }
};