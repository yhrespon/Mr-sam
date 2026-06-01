import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { exec } from "child_process";
import webp from "node-webpmux";

const delay = ms => new Promise(res => setTimeout(res, ms));

export default {
  name: "telegram-sticker",
  description: "𝙳𝚘𝚠𝚗𝚕𝚘𝚊𝚍 𝚊𝚗𝚍 𝚌𝚘𝚗𝚟𝚎𝚛𝚝 𝚃𝚎𝚕𝚎𝚐𝚛𝚊𝚖 𝚜𝚝𝚒𝚌𝚔𝚎𝚛 𝚙𝚊𝚌𝚔𝚜",
  aliases: ["tgsticker", "tgpack", "telegramstick"],
  
  async execute(sock, message) {
    const { from, reply, args } = message;
    
    try {
      const url = args[0] || "";
      
      if (!url) {
        return await reply("❌ 𝙿𝚛𝚘𝚟𝚒𝚍𝚎 𝚊 𝚃𝚎𝚕𝚎𝚐𝚛𝚊𝚖 𝚜𝚝𝚒𝚌𝚔𝚎𝚛 𝚙𝚊𝚌𝚔 𝚕𝚒𝚗𝚔\n𝚎𝚡: .𝚝𝚐 𝚑𝚝𝚝𝚙𝚜://𝚝.𝚖𝚎/𝚊𝚍𝚍𝚜𝚝𝚒𝚌𝚔𝚎𝚛𝚜/𝙿𝚊𝚌𝚔𝙽𝚊𝚖𝚎");
      }
      
      // Vérifier le format du lien
      if (!url.startsWith("https://t.me/addstickers/")) {
        return await reply("❌ 𝙸𝚗𝚟𝚊𝚕𝚒𝚍 𝚃𝚎𝚕𝚎𝚐𝚛𝚊𝚖 𝚜𝚝𝚒𝚌𝚕𝚎𝚛 𝚕𝚒𝚗𝚔\n𝙼𝚞𝚜𝚝 𝚜𝚝𝚊𝚛𝚝 𝚠𝚒𝚝𝚑: 𝚑𝚝𝚝𝚙𝚜://𝚝.𝚖𝚎/𝚊𝚍𝚍𝚜𝚝𝚒𝚌𝚔𝚎𝚛𝚜/");
      }
      
      await reply("📦 𝙵𝚎𝚝𝚌𝚑𝚒𝚗𝚐 𝚜𝚝𝚒𝚌𝚔𝚎𝚛 𝚙𝚊𝚌𝚋...");
      
      const packName = url.replace("https://t.me/addstickers/", "");
      const botToken = "7801479976:AAGuPL0a7kXXBYz6XUSR_ll2SR5V_W6oHl4"; // ⚠️ Remplacez par votre token
      
      // Obtenir les infos du pack
      const startTime = Date.now();
      const res = await fetch(`https://api.telegram.org/bot${botToken}/getStickerSet?name=${encodeURIComponent(packName)}`);
      const data = await res.json();
      const latency = Date.now() - startTime;
      
      if (!data.ok || !data.result) {
        throw new Error("𝙿𝚊𝚌𝚔 𝚗𝚘𝚝 𝚏𝚘𝚞𝚗𝚍 𝚘𝚛 𝚒𝚗𝚟𝚊𝚕𝚒𝚍");
      }
      
      const stickers = data.result.stickers || [];
      const totalStickers = stickers.length;
      
      if (totalStickers === 0) {
        return await reply("❌ 𝙽𝚘 𝚜𝚝𝚒𝚌𝚔𝚎𝚛𝚜 𝚏𝚘𝚞𝚗𝚍 𝚒𝚗 𝚝𝚑𝚒𝚜 𝚙𝚊𝚌𝚔");
      }
      
      // Indicateur de performance
      let indicator;
      if (latency <= 1000) {
        indicator = "🟢";
      } else if (latency <= 3000) {
        indicator = "🟡";
      } else {
        indicator = "🔴";
      }
      
      await reply(`${indicator} *${data.result.title}*\n📊 ${totalStickers} 𝚜𝚝𝚒𝚌𝚔𝚎𝚛𝚜\n⚡ ${latency}𝚖𝚜\n\n⏳ 𝙲𝚘𝚗𝚟𝚎𝚛𝚝𝚒𝚗𝚐...`);
      
      // Créer dossier temporaire
      const tmpDir = path.join(process.cwd(), "temp_telegram");
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      
      let successCount = 0;
      let failCount = 0;
      let processedCount = 0;
      
      // Traiter chaque sticker
      for (let i = 0; i < totalStickers; i++) {
        try {
          processedCount++;
          
          // Mettre à jour la progression
          if (processedCount % 5 === 0 || processedCount === totalStickers) {
            await reply(`🔄 𝙿𝚛𝚘𝚌𝚎𝚜𝚜𝚒𝚗𝚐: ${processedCount}/${totalStickers}`);
          }
          
          const sticker = stickers[i];
          const fileId = sticker.file_id;
          
          // Obtenir le chemin du fichier
          const fileRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
          const fileData = await fileRes.json();
          
          if (!fileData.ok) {
            failCount++;
            continue;
          }
          
          const filePath = fileData.result.file_path;
          const fileUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
          
          // Télécharger le fichier
          const fileBuffer = await (await fetch(fileUrl)).buffer();
          
          // Chemins temporaires
          const inputPath = path.join(tmpDir, `tg_input_${i}_${Date.now()}`);
          const outputPath = path.join(tmpDir, `tg_output_${i}_${Date.now()}.webp`);
          
          fs.writeFileSync(inputPath, fileBuffer);
          
          // Déterminer si c'est animé
          const isAnimated = sticker.is_animated || sticker.is_video;
          
          // Commande FFmpeg
          let ffmpegCmd;
          
          if (isAnimated) {
            ffmpegCmd = `ffmpeg -i "${inputPath}" ` +
                       `-vf "scale=512:512:force_original_aspect_ratio=decrease,` +
                       `fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" ` +
                       `-c:v libwebp -loop 0 -vsync 0 ` +
                       `"${outputPath}"`;
          } else {
            ffmpegCmd = `ffmpeg -i "${inputPath}" ` +
                       `-vf "scale=512:512:force_original_aspect_ratio=decrease,` +
                       `pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" ` +
                       `-c:v libwebp "${outputPath}"`;
          }
          
          // Exécuter FFmpeg
          await new Promise((resolve, reject) => {
            exec(ffmpegCmd, (error) => {
              if (error) reject(error);
              else resolve();
            });
          });
          
          // Vérifier que le fichier existe
          if (!fs.existsSync(outputPath)) {
            throw new Error("𝙲𝚘𝚗𝚟𝚎𝚛𝚜𝚒𝚘𝚗 𝚏𝚊𝚒𝚕𝚎𝚍");
          }
          
          // Ajouter des métadonnées EXIF
          const webpBuffer = fs.readFileSync(outputPath);
          const img = new webp.Image();
          await img.load(webpBuffer);
          
          const metadata = {
            "sticker-pack-id": crypto.randomBytes(16).toString("hex"),
            "sticker-pack-name": data.result.title || "Telegram Pack",
            "sticker-pack-publisher": "Bot",
            "emojis": sticker.emoji ? [sticker.emoji] : ["😊"]
          };
          
          const exifAttr = Buffer.from([
            0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57,
            0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
          ]);
          
          const jsonBuffer = Buffer.from(JSON.stringify(metadata), "utf8");
          const exif = Buffer.concat([exifAttr, jsonBuffer]);
          exif.writeUIntLE(jsonBuffer.length, 14, 4);
          
          img.exif = exif;
          const finalBuffer = await img.save(null);
          
          // Envoyer le sticker
          await sock.sendMessage(from, { sticker: finalBuffer });
          successCount++;
          
          // Nettoyage
          fs.unlinkSync(inputPath);
          fs.unlinkSync(outputPath);
          
          // Petit délai pour éviter le spam
          await delay(500);
          
        } catch (error) {
          console.error(`Sticker ${i} error:`, error);
          failCount++;
        }
      }
      
      // Nettoyer le dossier temporaire
      try {
        const files = fs.readdirSync(tmpDir);
        files.forEach(file => {
          try {
            fs.unlinkSync(path.join(tmpDir, file));
          } catch (cleanupError) {
            // Ignorer les erreurs de nettoyage
          }
        });
        fs.rmdirSync(tmpDir);
      } catch (cleanupError) {
        // Ignorer les erreurs de nettoyage
      }
      
      // Résultat final
      const resultText = `📦 *𝚁𝙴𝚂𝚄𝙻𝚃𝚂*\n\n` +
                        `✅ 𝚂𝚞𝚌𝚌𝚎𝚜𝚜: ${successCount}\n` +
                        `❌ 𝙵𝚊𝚒𝚕𝚎𝚍: ${failCount}\n` +
                        `📊 𝚃𝚘𝚝𝚊𝚕: ${totalStickers}\n` +
                        `🏷️ ${data.result.title || "Unknown Pack"}`;
      
      await reply(resultText);
      
    } catch (error) {
      console.error("Telegram sticker error:", error);
      
      if (error.message.includes("pack not found")) {
        await reply("❌ 𝚂𝚝𝚒𝚌𝚔𝚎𝚛 𝚙𝚊𝚌𝚔 𝚗𝚘𝚝 𝚏𝚘𝚞𝚗𝚍\n𝚅𝚎𝚛𝚒𝚏𝚢 𝚝𝚑𝚎 𝚕𝚒𝚗𝚔 𝚒𝚜 𝚌𝚘𝚛𝚛𝚎𝚌𝚝");
      } else if (error.message.includes("bot token")) {
        await reply("❌ 𝙱𝚘𝚝 𝚝𝚘𝚔𝚎𝚗 𝚒𝚗𝚟𝚊𝚕𝚒𝚍 𝚘𝚛 𝚎𝚡𝚙𝚒𝚛𝚎𝚍");
      } else if (error.message.includes("FFmpeg")) {
        await reply("❌ 𝙵𝙵𝚖𝚙𝚎𝚐 𝚗𝚘𝚝 𝚒𝚗𝚜𝚝𝚊𝚕𝚕𝚎𝚍\n𝙸𝚗𝚜𝚝𝚊𝚕𝚕 𝙵𝙵𝚖𝚙𝚎𝚐 𝚏𝚒𝚛𝚜𝚝");
      } else {
        await reply("❌ 𝙵𝚊𝚒𝚕𝚎𝚍 𝚝𝚘 𝚍𝚘𝚠𝚗𝚕𝚘𝚊𝚍 𝚙𝚊𝚌𝚔");
      }
    }
  }
};