export default {
  name: "unblock",
  description: "Débloque un utilisateur WhatsApp",
  category: "𝙰𝚍𝚖𝚒𝚗",

  async execute(sock, message, args) {
    const { from, reply, raw } = message;

    try {
      // ───── Récupération des cibles ─────
      const mentioned = raw.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      const quotedUser = raw.message?.extendedTextMessage?.contextInfo?.participant;
      let targets = [...mentioned];
      if (quotedUser && !targets.includes(quotedUser)) targets.push(quotedUser);

      // Si numéro passé en argument
      if (args[0]) {
        const num = args[0].replace(/\D/g, '');
        if (num.length >= 10) targets.push(num + "@s.whatsapp.net");
      }

      if (targets.length === 0) {
        return await reply("> ⚠️ 𝙼𝚎𝚗𝚝𝚒𝚘𝚗𝚗𝚎 𝚘𝚞 𝚛𝚎́𝚙𝚘𝚗𝚍𝚜 𝚊 𝚞𝚗 𝚞𝚝𝚒𝚕𝚒𝚜𝚊𝚝𝚎𝚞𝚛 𝚊 𝚍𝚎́𝚋𝚕𝚘𝚌𝚚𝚞𝚎𝚛.");
      }

      // ───── Déblocage ─────
      for (const user of targets) {
        await sock.updateBlockStatus(user, "unblock");
      }

      await sock.sendMessage(from, {
        text: `> ✅ 𝚄𝚗𝚋𝚕𝚘𝚌𝚔 𝚎𝚡𝚎𝚌𝚞𝚝𝚎́ : ${targets.map(t => `@${t.split("@")[0]}`).join(", ")}`,
        mentions: targets
      });

    } catch (err) {
      console.error("❌ Unblock error:", err);
      await reply("> ❌ 𝙸𝚖𝚙𝚘𝚜𝚜𝚒𝚋𝚕𝚎 𝚍𝚎 𝚍𝚎́𝚋𝚕𝚘𝚌𝚚𝚞𝚎𝚛 l'utilisateur. Vérifie mes permissions.");
    }
  }
};