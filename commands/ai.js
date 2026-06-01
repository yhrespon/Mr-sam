export default {
  name: "ai",
  description: "𝙸𝙰 𝚌𝚘𝚗𝚟𝚎𝚛𝚜𝚊𝚝𝚒𝚘𝚗",
  category: "𝚃𝚘𝚘𝚕𝚜",

  async execute(sock, message, args) {
    const { from, reply } = message;
    const query = args.join(" ").trim();

    try {
      // ───── NO QUERY ─────
      if (!query) {
        return await reply(
          "⚠️ 𝙸 𝚗𝚎𝚎𝚍 𝚠𝚘𝚛𝚍𝚜.\n\n" +
          "𝙴𝚡𝚊𝚖𝚙𝚕𝚎 : `.ai 𝙷𝚎𝚕𝚕𝚘`"
        );
      }

      // ───── THINKING ─────
      await sock.sendMessage(from, {
        text: "🤖 𝙸'𝚖 𝚝𝚑𝚒𝚗𝚔𝚒𝚗𝚐..."
      });

      // ───── API CALL ─────
      const apiUrl = `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(query)}`;
      const res = await fetch(apiUrl);
      const data = await res.json();

      if (!data || !data.message) {
        return await reply(
          "❌ 𝚂𝚒𝚕𝚎𝚗𝚌𝚎.\n" +
          "𝚃𝚛𝚢 𝚊𝚐𝚊𝚒𝚗."
        );
      }

      // ───── RAW AI RESPONSE ─────
      await sock.sendMessage(from, {
        text: data.message
      });

    } catch (err) {
      console.error("AI error:", err);
      await reply(
        "⚠️ 𝙴𝚛𝚛𝚘𝚛.\n" +
        "𝚃𝚑𝚎 𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚒𝚘𝚗 𝚏𝚊𝚒𝚕𝚎𝚍."
      );
    }
  }
};