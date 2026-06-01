export default {
  name: "dico",
  description: "𝙳éfinition d'un mot en anglais via un dictionnaire",
  category: "📖 𝙳𝚒𝚌𝚝𝚒𝚘𝚗𝚊𝚛𝚢",

  async execute(sock, message, args) {
    const { from, reply } = message;

    try {
      if (!args.length) {
        return await reply(
          "📖 Usage: .dico <mot>\n" +
          "Ex: .dico algorithm"
        );
      }

      const word = args[0];
      const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data[0]) {
        const entry = data[0];
        let text = `📖 ${entry.word}\n━━━━━━━━━━━━━━━━━━\n`;

        entry.meanings.slice(0, 2).forEach((meaning, i) => {
          text += `📚 ${meaning.partOfSpeech}\n`;
          meaning.definitions.slice(0, 2).forEach((def, j) => {
            text += `  ${j + 1}. ${def.definition.substring(0, 100)}\n`;
          });
          text += `━━━━━━━━━━━━━━━━━━\n`;
        });

        await sock.sendMessage(from, { text });

      } else {
        await reply("❌ Mot non trouvé.");
      }

    } catch (err) {
      console.error("Dictionary error:", err);
      await reply("⚠️ Service dictionnaire indisponible.");
    }
  }
};