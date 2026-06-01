export default {
  name: "country",
  description: "Affiche les informations détaillées d’un pays.",

  async execute(sock, message, args) {
    const { from, reply, raw } = message;

    try {
      const countryName = args.join(" ").trim();

      if (!countryName) {
        return await reply(
          "𝙵𝚊𝚒𝚕𝚎𝚍 𝚝𝚘 𝚜𝚎𝚊𝚛𝚌𝚑 𝚏𝚘𝚛 𝚒𝚖𝚊𝚐𝚎𝚜 ⚠️ Fournis le nom d’un pays.\nExemple : *.country Pakistan*"
        );
      }

      await reply(`𝙵𝚊𝚒𝚕𝚎𝚍 𝚝𝚘 𝚜𝚎𝚊𝚛𝚌𝚑 𝚏𝚘𝚛 𝚒𝚖𝚊𝚐𝚎𝚜 🌍 Récupération des informations pour *${countryName}*...`);

      const apiUrl = `https://api.siputzx.my.id/api/tools/countryInfo?name=${encodeURIComponent(countryName)}`;
      const res = await fetch(apiUrl);
      const data = await res.json();

      if (!data || !data.status || !data.data) {
        return await reply(`𝙵𝚊𝚒𝚕𝚎𝚍 𝚝𝚘 𝚜𝚎𝚊𝚛𝚌𝚑 𝚏𝚘𝚛 𝚒𝚖𝚊𝚐𝚎𝚜 ⚠️ Aucune information trouvée pour *${countryName}*.`);
      }

      const info = data.data;

      const neighborsText =
        info.neighbors?.length > 0
          ? info.neighbors.map(n => `🌍 ${n.name}`).join(", ")
          : "Aucun pays voisin trouvé.";

      const caption = `𝙵𝚊𝚒𝚕𝚎𝚍 𝚝𝚘 𝚜𝚎𝚊𝚛𝚌𝚑 𝚏𝚘𝚛 𝚒𝚖𝚊𝚐𝚎𝚜
🏛 Capitale : ${info.capital || "Inconnue"}
📍 Continent : ${info.continent.name || "Inconnu"} ${info.continent.emoji || ""}
📞 Indicatif : ${info.phoneCode || "N/A"}
📏 Superficie : ${info.area.squareKilometers} km² (${info.area.squareMiles} mi²)
🚗 Côté de conduite : ${info.drivingSide || "N/A"}
💱 Monnaie : ${info.currency || "N/A"}
🔤 Langues : ${info.languages?.native?.join(", ") || "N/A"}
🌟 Connu pour : ${info.famousFor || "N/A"}
🌍 Codes ISO : ${info.isoCode.alpha2.toUpperCase()}, ${info.isoCode.alpha3.toUpperCase()}
🌎 Domaine internet : ${info.internetTLD || "N/A"}
🔗 Pays voisins : ${neighborsText}`;

      await sock.sendMessage(
        from,
        { image: { url: info.flag }, caption },
        { quoted: raw }
      );

    } catch (err) {
      console.error("❌ Erreur countryinfos :", err);
      await reply(`𝙵𝚊𝚒𝚕𝚎𝚍 𝚝𝚘 𝚜𝚎𝚊𝚛𝚌𝚑 𝚏𝚘𝚛 𝚒𝚖𝚊𝚐𝚎𝚜 ❌ Une erreur est survenue : ${err.message}`);
    }
  }
};
