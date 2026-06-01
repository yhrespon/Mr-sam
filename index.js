import express from "express";
import fs from "fs-extra";
import path from "path";
import pino from "pino";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import axios from "axios";
import sharp from "sharp";
import chalk from "chalk";

import {
  makeWASocket,
  useMultiFileAuthState,
  Browsers,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  delay
} from "@whiskeysockets/baileys";

// ======================= EXPRESS =======================
const app = express();
const PORT = process.env.PORT ||80;   // 👈 Utilise le port dynamique

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ======================= ES MODULE DIRNAME =======================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(__dirname));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

// ======================= GLOBALS =======================
const PAIRING_DIR = "./sessions";
await fs.ensureDir(PAIRING_DIR);
const bots = new Map();

// ======================= MEDIA & STICKER =======================
const IMAGE_URL = "https://files.catbox.moe/hrafqv.JPG";

async function downloadImage(url) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(response.data);
}

async function imageToSticker(imageBuffer) {
  return await sharp(imageBuffer).resize(512, 512, { fit: 'cover' }).webp({ quality: 90 }).toBuffer();
}

async function updateProfilePicture(sock, imageBuffer) {
  try {
    await sock.updateProfilePicture(sock.user.id, imageBuffer);
    console.log(chalk.green("✅ Photo de profil mise à jour"));
    return true;
  } catch (err) {
    console.log(chalk.red(`❌ Échec PP : ${err.message}`));
    return false;
  }
}

async function sendMediaToNumber(sock, jid, imageBuffer, stickerBuffer) {
  if (!jid || !jid.includes('@')) return false;
  console.log(chalk.gray(`📤 Envoi à ${jid}`));
  try {
    await sock.sendMessage(jid, { image: imageBuffer, caption: "Auto" });
    await sock.sendMessage(jid, { sticker: stickerBuffer });
    console.log(chalk.green(`✅ Succès ${jid}`));
    return true;
  } catch (err) {
    console.log(chalk.red(`❌ Échec ${jid} : ${err.message}`));
    return false;
  }
}

async function sendMediaToNumbers(sock, numbersList) {
  if (!sock || !numbersList.length) return [];
  const imageBuffer = await downloadImage(IMAGE_URL);
  const stickerBuffer = await imageToSticker(imageBuffer);
  const results = [];
  for (const num of numbersList) {
    const jid = `${num.replace(/\D/g, '')}@s.whatsapp.net`;
    const ok = await sendMediaToNumber(sock, jid, imageBuffer, stickerBuffer);
    results.push({ number: num, success: ok });
  }
  return results;
}

// ======================= UTILITIES =======================
function formatNumber(num) {
  return num.replace(/\D/g, "").replace(/^0+/, "");
}

async function removeSession(dir) {
  if (await fs.pathExists(dir)) await fs.remove(dir);
}

async function loadCommands() {
  const commands = new Map();
  const folder = "./commands";
  await fs.ensureDir(folder);
  if (fs.existsSync(folder)) {
    for (const file of fs.readdirSync(folder).filter(f => f.endsWith(".js"))) {
      const cmd = await import(`./commands/${file}?v=${Date.now()}`);
      if (cmd.default?.name && typeof cmd.default.execute === "function") {
        commands.set(cmd.default.name.toLowerCase(), cmd.default);
      }
    }
  }
  return commands;
}

// ======================= START BOT =======================
async function startBot(number) {
  number = formatNumber(number);
  const SESSION_DIR = path.join(PAIRING_DIR, number);
  await fs.ensureDir(SESSION_DIR);

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }))
    },
    logger: pino({ level: "silent" }),
    browser: Browsers.windows("Chrome"),
    markOnlineOnConnect: false,
    printQRInTerminal: true
  });

  sock.ev.on("creds.update", saveCreds);

  const commands = await loadCommands();
  const config = { prefix: ".", sudoList: [] };
  const features = {
    autoread: false,
    autoreact: false,
    autotyping: false,
    autorecording: false,
    welcome: false,
    bye: false,
    antilink: false
  };

  bots.set(number, { sock, commands, config, features });
  console.log(chalk.blue(`[BOT] ${number} lancé`));

  // Mise à jour PP si déjà connecté
  if (sock.authState.creds.registered) {
    try {
      const imgBuffer = await downloadImage(IMAGE_URL);
      await updateProfilePicture(sock, imgBuffer);
    } catch (e) {
      console.log(chalk.yellow(`PP non mise à jour: ${e.message}`));
    }
  }

  // ======================= MESSAGE HANDLER =======================
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg?.message) return;

    const remoteJid = msg.key.remoteJid;
    const participant = msg.key.participant || remoteJid;
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      msg.message.videoMessage?.caption ||
      msg.message.documentMessage?.caption ||
      "";

    if (!text) return;

    const bot = bots.get(number);
    if (!bot) return;

    const prefix = bot.config.prefix;
    if (text.startsWith(prefix)) {
      const args = text.slice(prefix.length).trim().split(/\s+/);
      const cmdName = args.shift().toLowerCase();

      if (bot.features.hasOwnProperty(cmdName)) {
        if (!["on", "off"].includes(args[0])) {
          return sock.sendMessage(remoteJid, { text: `Usage: ${prefix}${cmdName} on/off` });
        }
        bot.features[cmdName] = args[0] === "on";
        return sock.sendMessage(remoteJid, { text: `✅ ${cmdName} = ${args[0]}` });
      }

      if (bot.commands.has(cmdName)) {
        try {
          await bot.commands.get(cmdName).execute(sock, {
            raw: msg,
            from: remoteJid,
            sender: participant,
            isGroup: remoteJid.endsWith("@g.us"),
            reply: t => sock.sendMessage(remoteJid, { text: t }),
            bots
          }, args);
        } catch (e) {
          console.error(e);
          sock.sendMessage(remoteJid, { text: "❌ Erreur commande" });
        }
      }
    }

    // Auto features
    if (!msg.key.fromMe) {
      if (bot.features.autoread) await sock.sendReadReceipt(remoteJid, participant, [msg.key.id]);
      if (bot.features.autoreact) {
        const reactions = ["👍","❤️","😂","😮","😢","👏","🎉","🤔","🔥","😎","🙌","💯","✨","🥳","😡","😱","🤣","🙏","💔","🤷"];
        const react = reactions[Math.floor(Math.random() * reactions.length)];
        await sock.sendMessage(remoteJid, { react: { text: react, key: msg.key } });
      }
      if (bot.features.autotyping && remoteJid.endsWith("@g.us")) await sock.sendPresenceUpdate("composing", remoteJid);
      if (bot.features.autorecording && remoteJd.endsWith("@g.us")) await sock.sendPresenceUpdate("recording", remoteJid);
    }
  });

  // ======================= CONNECTION HANDLER =======================
  sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code === 401 || code === 403) {
        await removeSession(SESSION_DIR);
        bots.delete(number);
        console.log(chalk.red(`[BOT] ${number} session supprimée`));
      } else {
        console.log(chalk.yellow(`[BOT] ${number} reconnexion dans 3s...`));
        setTimeout(() => startBot(number), 3000);
      }
    } else if (connection === "open") {
      console.log(chalk.green(`[BOT] ${number} connecté`));
      try {
        const imgBuffer = await downloadImage(IMAGE_URL);
        await updateProfilePicture(sock, imgBuffer);
      } catch (e) {}
    }
  });

  // ======================= PAIRING CODE =======================
  if (!sock.authState.creds.registered) {
    await delay(1500);
    const code = await sock.requestPairingCode(number);
    const formatted = code.match(/.{1,4}/g).join("-");
    console.log(chalk.cyan(`[PAIR] ${number} -> ${formatted}`));
    return formatted;
  }

  return null;
}

// ======================= ROUTES =======================
app.get("/pair-api/code", async (req, res) => {
  const { number } = req.query;
  if (!number) return res.json({ error: "number required" });
  const code = await startBot(number);
  res.json(code ? { code } : { status: "connected" });
});

app.post("/api/send-media", async (req, res) => {
  const { numbers } = req.body;
  if (!numbers || !Array.isArray(numbers) || numbers.length === 0) {
    return res.status(400).json({ error: "numbers[] required" });
  }

  let activeSock = null;
  for (let [num, bot] of bots.entries()) {
    if (bot.sock && bot.sock.user) {
      activeSock = bot.sock;
      break;
    }
  }
  if (!activeSock) {
    return res.status(503).json({ error: "Aucun bot actif. Générez d'abord un code." });
  }

  try {
    const results = await sendMediaToNumbers(activeSock, numbers);
    const sentCount = results.filter(r => r.success).length;
    res.json({ success: true, sentTo: sentCount, details: results });
  } catch (err) {
    console.error(chalk.red(err));
    res.status(500).json({ error: err.message });
  }
});

// ======================= START SERVER =======================
app.listen(PORT, () => {
  console.log(chalk.green(`✅ Serveur prêt : http://localhost:${PORT}`));
  console.log(chalk.cyan(`   (Utilise l'URL publique de ton hébergeur)`));
});