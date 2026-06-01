export default {
  name: "infosgroups",
  description: "🌐 Affiche des informations détaillées sur un groupe WhatsApp",
  category: "🛠️ Système",

  async execute(sock, message, args = []) {
    const { from, reply } = message;

    // Vérifier si c'est un groupe
    if (!from.endsWith("@g.us")) {
      return await reply("⚠️ Cette commande ne fonctionne que dans un groupe !");
    }

    try {
      const metadata = await sock.groupMetadata(from);
      const groupName = metadata.subject || "Inconnu";
      const participants = metadata.participants || [];
      const creationDate = metadata.creation || Date.now() / 1000;
      const owner = metadata.owner || null;

      // Administrateurs
      const admins = participants.filter(p => p.admin);
      const superAdmins = admins.filter(a => a.admin === "superadmin");
      const normalAdmins = admins.filter(a => a.admin === "admin");
      const adminMentions = admins.map(a => `@${a.id.split("@")[0]}`);

      // Nombre de membres
      const totalMembers = participants.length;

      // Créateur
      let creatorText = "Non disponible";
      if (owner) {
        const creatorInGroup = participants.find(p => p.id === owner);
        creatorText = creatorInGroup ? `@${owner.split("@")[0]}` : "Créateur absent";
      }

      // Statut du groupe
      const groupStatus = metadata.restrict ? "Privé" : "Public";

      // Construction du message
      let infoText = 
`> 🌟 Infos du groupe

> 📝 Nom               : ${groupName}
> 👑 Créateur          : ${creatorText}
> 🔒 Statut du groupe  : ${groupStatus}

> 🛡️ Administrateurs   : ${adminMentions.join(", ")}
>    • Superadmins     : ${superAdmins.length}
>    • Admins normaux  : ${normalAdmins.length}

> 👥 Membres totaux     : ${totalMembers}
> 📆 Date de création   : ${new Date(creationDate * 1000).toLocaleString()}`;

      // Mentions
      const mentions = [
        ...admins.map(a => a.id),
        ...(owner ? [owner] : [])
      ];

      await sock.sendMessage(from, { text: infoText, mentions });

    } catch (err) {
      console.error("Erreur infosgroups:", err);
      await reply("⚠️ Impossible de récupérer les informations du groupe.");
    }
  }
};