export default {
  name: "tiktok",
  aliases: ["tt", "tik", "tiktokdl"],
  description: "Télécharge des vidéos/audio depuis TikTok",
  
  async execute(sock, message, args) {
    const { from, reply, raw } = message;

    try {
      // Vérifier les arguments
      if (!args.length) {
        return await reply(
          "⚠️ *Usage:*\n" +
          "• .tiktok <url> - Télécharge la vidéo\n" +
          "• .tiktok audio <url> - Télécharge l'audio uniquement\n\n" +
          "Exemple: .tiktok https://vm.tiktok.com/xxxxxx"
        );
      }

      // Vérifier le mode (vidéo ou audio)
      let mode = 'video';
      let url = args[0];
      
      if (args[0].toLowerCase() === 'audio' && args[1]) {
        mode = 'audio';
        url = args[1];
      }

      // Validation de l'URL
      if (!url.includes('tiktok.com') && !url.includes('vt.tiktok.com') && !url.includes('vm.tiktok.com')) {
        return await reply("❌ URL TikTok invalide. Fournissez un lien TikTok valide.");
      }

      console.log(`🎯 TikTok ${mode === 'audio' ? 'Audio' : 'Video'} Download: ${url}`);

      // Message de traitement
      const processingMsg = await reply(`⏳ Téléchargement ${mode === 'audio' ? 'de l\'audio' : 'de la vidéo'} TikTok en cours...`);

      // Appel de l'API
      const apiUrl = `https://api.danscot.dev/api/tiktok/download?url=${encodeURIComponent(url)}`;
      const { data } = await axios.get(apiUrl, { timeout: 30000 });

      if (data.status !== 'ok' || !Array.isArray(data.results) || data.results.length === 0) {
        throw new Error("❌ Aucun contenu téléchargeable trouvé.");
      }

      let result;
      
      if (mode === 'audio') {
        // Chercher l'audio
        result = data.results.find(r => r.type === 'music');
        if (!result) {
          throw new Error("❌ Audio non disponible pour cette vidéo.");
        }
        
        // Envoi de l'audio
        await sock.sendMessage(from, {
          audio: { url: result.url },
          mimetype: 'audio/mp4',
          fileName: `tiktok_audio.mp3`,
          caption: `🎵 *TikTok Audio*\n📀 ${result.label || 'Audio TikTok'}`,
          quoted: raw
        });
        
      } else {
        // Chercher la vidéo (priorité: hd > mp4 > watermark)
        result =
          data.results.find(r => r.type === 'hd') ||
          data.results.find(r => r.type === 'mp4') ||
          data.results.find(r => r.type === 'watermark') ||
          data.results[0];

        if (!result) {
          throw new Error("❌ Vidéo non disponible.");
        }

        // Obtenir les informations de la vidéo
        const videoInfo = data.results.find(r => r.type === 'info') || {};
        
        // Envoi de la vidéo
        await sock.sendMessage(from, {
          video: { url: result.url },
          mimetype: 'video/mp4',
          caption: `🎵 *TikTok Video*${videoInfo.label ? `\n📝 ${videoInfo.label}` : ''}${videoInfo.author ? `\n👤 ${videoInfo.author}` : ''}${videoInfo.duration ? `\n⏱ ${videoInfo.duration}s` : ''}\n\n✅ Téléchargement réussi`,
          quoted: raw
        });
      }

      // Réaction de confirmation
      await sock.sendMessage(from, {
        react: { text: "✅", key: raw.key }
      });

      console.log(`✅ TikTok ${mode} envoyé avec succès.`);

    } catch (err) {
      console.error('❌ TikTok Error:', err);
      
      let errorMessage = "❌ Erreur: ";
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = "⏳ Temps d'attente dépassé. Le serveur est lent, réessayez.";
      } else if (err.response?.status === 404) {
        errorMessage = "❌ Vidéo non trouvée. Le lien est peut-être invalide ou la vidéo a été supprimée.";
      } else if (err.response?.status === 429) {
        errorMessage = "🚫 Trop de requêtes. Veuillez patienter avant de réessayer.";
      } else if (err.message.includes('network')) {
        errorMessage = "🌐 Erreur réseau. Vérifiez votre connexion internet.";
      } else {
        errorMessage += err.message.replace('❌ ', '');
      }
      
      await reply(errorMessage);
    }
  }
};

// Import
import axios from 'axios';