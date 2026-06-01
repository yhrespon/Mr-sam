import axios from "axios";
import fs from "fs";
import path from "path";
import mime from "mime-types";

export default {
  name: "down-url",
  description: "𝚃élécharge un fichier depuis un lien direct",
  category: "📥 𝚃éléchargement",

  async execute(sock, message, args) {
    const { from, reply, key } = message;

    const url = args[0];
    if (!url) {
      return await reply(
        "⚠️ Usage: .down-url <lien>\n" +
        "Ex: .down-url https://example.com/video.mp4"
      );
    }

    try {
      await sock.sendMessage(from, { text: "⏳ Téléchargement en cours..." });

      // ───── Download content ─────
      const response = await axios.get(url, { responseType: "arraybuffer" });
      const buffer = Buffer.from(response.data, "binary");

      // ───── Determine MIME type ─────
      const contentType = response.headers["content-type"] || mime.lookup(url) || "application/octet-stream";
      const extension = mime.extension(contentType) || "bin";
      const fileName = `download_${Date.now()}.${extension}`;
      const filePath = path.join("./", fileName);

      fs.writeFileSync(filePath, buffer);

      // ───── Prepare message options ─────
      let messageOptions = {};
      if (contentType.startsWith("image/")) {
        messageOptions = { image: fs.readFileSync(filePath), caption: `📷 Fichier image téléchargé depuis:\n${url}` };
      } else if (contentType.startsWith("video/")) {
        messageOptions = { video: fs.readFileSync(filePath), caption: `🎥 Vidéo téléchargée depuis:\n${url}` };
      } else if (contentType.startsWith("audio/")) {
        messageOptions = { audio: fs.readFileSync(filePath), mimetype: contentType, ptt: false };
      } else {
        messageOptions = { document: fs.readFileSync(filePath), mimetype: contentType, fileName };
      }

      // ───── Send file ─────
      await sock.sendMessage(from, messageOptions, { quoted: message });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("Down-url error:", err);
      await reply(
        "❌ Erreur lors du téléchargement.\n" +
        "Vérifie que le lien est valide et accessible publiquement."
      );
    }
  }
};