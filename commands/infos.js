export default {
  name: "infos",
  description: "📊 Affiche les informations détaillées du bot et de son système",
  category: "🛠️ Système",

  async execute(sock, message, args = [], options = {}) {
    const { botNumber = "" } = options;
    const { from, reply } = message;

    try {
      // === Uptime ===
      const uptime = process.uptime(); // sec
      const h = Math.floor(uptime / 3600);
      const m = Math.floor((uptime % 3600) / 60);
      const s = Math.floor(uptime % 60);
      const uptimeStr = `${h}h ${m}m ${s}s`;

      // === Mémoire & platform ===
      let usedMemMB = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
      let totalMemGB = "N/A";
      let platform = "N/A";
      let osType = "N/A";
      let nodeVersion = process.version;

      try {
        const os = await import("os");
        totalMemGB = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
        platform = `${os.platform()} ${os.release()}`;
        osType = os.type();
      } catch (e) {
        console.warn("Impossible d'importer 'os':", e?.message || e);
      }

      // === Latence ===
      const start = Date.now();
      await sock.sendMessage(from, { text: "⏳ Vérification des performances..." }, { quoted: message }).catch(() => {});
      const latency = Date.now() - start;

      // === Numéro du bot ===
      const botJid = botNumber || (sock?.user?.id || sock?.user?.jid || "").split?.(":")?.[0] || "Inconnu";

      // === Statistiques WhatsApp (si possible) ===
      let chatsCount = 0;
      let groupsCount = 0;
      let participantsCount = 0;

      try {
        const allChats = await sock.chats.all(); // dépend de la version Baileys / pair.js
        chatsCount = allChats.length;
        groupsCount = allChats.filter(c => c.id.endsWith("@g.us")).length;
        participantsCount = allChats.reduce((acc, c) => acc + (c?.participants?.length || 0), 0);
      } catch (e) {
        console.warn("Impossible de récupérer les stats des chats:", e?.message || e);
      }

      // === Message formaté ===
      const text = 
`> ⚡ Informations du bot

> 📱 Numéro        : ${botJid}
> ⏱️ Uptime        : ${uptimeStr}
> 🫩 Latence       : ${latency} ms
> 💾 Mémoire       : ${usedMemMB} MB / ${totalMemGB} GB
> 💻 Platforme     : ${platform}
> 🖥️ OS Type       : ${osType}
> 🟢 Node.js       : ${nodeVersion}

> 💬 Chats totaux  : ${chatsCount}
> 👥 Groupes       : ${groupsCount}
> 🧑‍🤝‍🧑 Participants  : ${participantsCount}

> 📌 Commandes actives : ${Object.keys(sock.commands || {}).length}
> ⚙️ Version bot     : ${options.version || "Inconnue"}`;

      await sock.sendMessage(from, { text }, { quoted: message });

    } catch (err) {
      console.error("Erreur infos :", err);
      await reply("❌ Impossible de récupérer les informations du bot.");
    }
  }
};