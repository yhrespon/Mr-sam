// commands/toaudio.js
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fs from "fs";
import { join } from "path";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

ffmpeg.setFfmpegPath(ffmpegPath);

export default {
  name: "toaudio",
  description: "Convertit une vidéo en audio (mp3)",

  async execute(sock, message, args) {
    const { from, reply, raw } = message;

    try {
      // Vidéo ciblée (reply ou direct)
      const quoted =
        raw.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
        raw.message;

      const videoMsg =
        quoted.videoMessage ||
        quoted.viewOnceMessageV2?.message?.videoMessage ||
        quoted.viewOnceMessageV2Extension?.message?.videoMessage;

      if (!videoMsg) {
        return await reply(
          "⚠️ 𝚁𝚎́𝚙𝚘𝚗𝚍𝚜 𝚘𝚞 𝚎𝚗𝚟𝚘𝚢𝚎 𝚞𝚗𝚎 *𝚟𝚒𝚍𝚎́𝚘* pour la convertir en *audio*."
        );
      }

      // Téléchargement vidéo
      const stream = await downloadContentFromMessage(videoMsg, "video");
      let buffer = Buffer.from([]);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

      // Dossier temporaire
      const tempDir = "./temp";
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
      const inputPath = join(tempDir, "video.mp4");
      const outputPath = join(tempDir, "audio.mp3");
      fs.writeFileSync(inputPath, buffer);

      // Conversion vidéo → audio
      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .toFormat("mp3")
          .on("end", resolve)
          .on("error", reject)
          .save(outputPath);
      });

      // Envoi audio
      const audioBuffer = fs.readFileSync(outputPath);
      await sock.sendMessage(from, {
        audio: audioBuffer,
        mimetype: "audio/mp4",
        ptt: false,
        caption: "✅ Ton audio est prêt.",
      });

      // Nettoyage
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    } catch (err) {
      console.error("❌ TOAUDIO error:", err);
      await reply(`❌ Erreur : ${err.message}`);
    }
  }
};
