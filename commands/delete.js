export default {
  name: "delete",
  description: "Supprime des messages dans le chat",

  async execute(sock, message, args) {
    const { from, reply, raw } = message;

    try {
      let targets = [];

      const quoted = raw.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (quoted) targets.push(raw.message.extendedTextMessage.contextInfo.stanzaId || raw.key.id);

      const mentioned = raw.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      if (mentioned.length) targets.push(...mentioned);

      if (args[0]) targets.push(`${args[0].replace(/\D/g, "")}@s.whatsapp.net`);

      if (!targets.length) targets.push(raw.key.id);

      for (const t of targets) {
        try {
          await sock.sendMessage(from, { delete: { remoteJid: from, fromMe: false, id: t, participant: t } });
        } catch (e) {}
      }

      await reply("𝙵𝚊𝚒𝚕𝚎𝚍 𝚝𝚘 𝚜𝚎𝚊𝚛𝚌𝚑 𝚏𝚘𝚛 𝚒𝚖𝚊𝚐𝚎𝚜 ✅ Messages supprimés.");
    } catch (err) {
      await reply(`𝙵𝚊𝚒𝚕𝚎𝚍 𝚝𝚘 𝚜𝚎𝚊𝚛𝚌𝚑 𝚏𝚘𝚛 𝚒𝚖𝚊𝚐𝚎𝚜 ❌ Impossible de supprimer : ${err.message}`);
    }
  }
};
