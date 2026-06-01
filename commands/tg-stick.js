export default {
  name: "tg-stick",
  aliases: ["tgstick", "telegramstick", "tgpack"],
  description: "Télécharge des packs de stickers Telegram",
  
  async execute(sock, message, args) {
    const { from, reply, raw } = message;

    try {
      // Vérification de l'URL
      if (!args[0]) {
        return await reply(
          "⚠️ *Usage:* .tg-stick <lien_pack_telegram>\n\n" +
          "*Exemple:*\n" +
          ".tg-stick https://t.me/addstickers/Porcientoreal\n" +
          ".tg-stick https://t.me/addstickers/NomDuPack"
        );
      }

      const url = args[0].trim();
      
      // Validation du lien Telegram
      if (!url.includes('t.me/addstickers/')) {
        return await reply("❌ Lien invalide. Le lien doit être un pack de stickers Telegram (ex: https://t.me/addstickers/NomDuPack)");
      }

      // Extraction du nom du pack
      const packName = url.replace("https://t.me/addstickers/", "").replace("http://t.me/addstickers/", "");

      // Envoi du message de début
      const processingMsg = await reply("🔗 Connexion à l'API Telegram...");

      // Token Telegram Bot (⚠️ À REMPLACER PAR VOTRE TOKEN)
      const botToken = "7801479976:AAGuPL0a7kXXBYz6XUSR_ll2SR5V_W6oHl4";

      // Requête à l'API Telegram pour obtenir les infos du pack
      const response = await fetch(`https://api.telegram.org/bot${botToken}/getStickerSet?name=${encodeURIComponent(packName)}`);
      const data = await response.json();

      if (!data.ok || !data.result) {
        throw new Error("Pack introuvable ou invalide. Vérifiez le lien.");
      }

      const stickers = data.result.stickers;
      
      // Message d'information sur le pack
      await reply(
        `📦 *Pack trouvé:* ${data.result.title}\n` +
        `📊 *Total stickers:* ${stickers.length}\n` +
        `⏳ *Conversion en cours...*\n\n` +
        `⚠️ Cela peut prendre quelques minutes...`
      );

      // Création du dossier temporaire
      const tmpDir = `./tmp_tg_${Date.now()}`;
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }

      let successCount = 0;
      let failedCount = 0;
      
      // Traitement des stickers un par un
      for (let i = 0; i < stickers.length; i++) {
        try {
          const sticker = stickers[i];
          
          // Message de progression
          if (i % 5 === 0) {
            await sock.sendMessage(from, {
              text: `🔄 Traitement: ${i+1}/${stickers.length} stickers...`
            });
          }

          // Récupérer le fichier sticker
          const fileInfo = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${sticker.file_id}`);
          const fileData = await fileInfo.json();
          
          if (!fileData.ok) {
            failedCount++;
            continue;
          }

          const fileUrl = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
          const fileBuffer = await (await fetch(fileUrl)).buffer();
          
          // Sauvegarder temporairement
          const tempFile = path.join(tmpDir, `sticker_${i}`);
          fs.writeFileSync(tempFile, fileBuffer);

          // Vérifier si c'est un sticker animé
          const isAnimated = sticker.is_animated || sticker.is_video;
          
          // Convertir en WebP pour WhatsApp
          const outputFile = path.join(tmpDir, `output_${i}.webp`);
          
          let ffmpegCommand;
          if (isAnimated) {
            // Pour les stickers animés
            ffmpegCommand = `ffmpeg -i "${tempFile}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=30,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -loop 0 -preset picture -qscale 50 "${outputFile}"`;
          } else {
            // Pour les stickers statiques
            ffmpegCommand = `ffmpeg -i "${tempFile}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -lossless 1 -qscale 100 "${outputFile}"`;
          }

          // Exécuter la conversion
          await new Promise((resolve, reject) => {
            exec(ffmpegCommand, (error) => {
              if (error) reject(error);
              else resolve();
            });
          });

          // Lire le fichier converti
          const webpData = fs.readFileSync(outputFile);
          
          // Envoyer le sticker
          await sock.sendMessage(from, {
            sticker: webpData
          });

          successCount++;
          
          // Pause pour éviter le spam
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Nettoyer les fichiers temporaires
          fs.unlinkSync(tempFile);
          fs.unlinkSync(outputFile);

        } catch (error) {
          console.error(`Erreur avec le sticker ${i + 1}:`, error.message);
          failedCount++;
        }
      }

      // Nettoyer le dossier temporaire
      if (fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, { recursive: true });
      }

      // Message de fin
      await reply(
        `✅ *Conversion terminée!*\n\n` +
        `📦 Pack: ${data.result.title}\n` +
        `✅ Réussis: ${successCount}/${stickers.length}\n` +
        `❌ Échecs: ${failedCount}\n\n` +
        `Les stickers ont été envoyés un par un.`
      );

      // Réaction de confirmation
      await sock.sendMessage(from, {
        react: { text: "✅", key: raw.key }
      });

    } catch (error) {
      console.error("Erreur tg-stick:", error);
      
      let errorMessage = "❌ Erreur: ";
      if (error.message.includes("Pack introuvable")) {
        errorMessage = "❌ Pack non trouvé. Vérifiez que:\n1. Le lien est correct\n2. Le pack est public\n3. Le nom du pack est exact";
      } else if (error.message.includes("429")) {
        errorMessage = "⚠️ Trop de requêtes. Attendez quelques minutes avant de réessayer.";
      } else if (error.message.includes("401")) {
        errorMessage = "🔑 Erreur d'authentification. Le token bot est invalide.";
      } else if (error.message.includes("ffmpeg")) {
        errorMessage = "❌ Erreur de conversion. FFmpeg n'est pas installé ou configuré.";
      } else {
        errorMessage += error.message;
      }
      
      await reply(errorMessage);
    }
  }
};

// Import des modules nécessaires
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { exec } from "child_process";