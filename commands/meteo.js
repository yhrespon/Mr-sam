import axios from "axios";

export default {
  name: "meteo",
  description: "𝙰𝚏𝚏𝚒𝚌𝚑𝚎 𝚕𝚊 𝚖é𝚝é𝚘 𝚍’𝚞𝚗𝚎 𝚟𝚒𝚕𝚕𝚎",

  async execute(sock, message, args) {
    const { from, reply } = message;

    try {
      const city = args.join(" ").trim();
      if (!city) {
        return await reply("❌ 𝚄𝚝𝚒𝚕𝚒𝚜𝚊𝚝𝚒𝚘𝚗 : .meteo <𝚟𝚒𝚕𝚕𝚎>");
      }

      const apiKey = "4902c0f2550f58298ad4146a92b65e10";
      const { data } = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=fr`
      );

      const text =
        `╔───── 𝙼𝙴𝚃𝙴𝙾 ─────╗\n` +
        `𝚅𝚒𝚕𝚕𝚎 : ${data.name}\n\n` +
        `𝙲𝚘𝚗𝚍𝚒𝚝𝚒𝚘𝚗𝚜 : ${data.weather[0].description}\n` +
        `𝚃𝚎𝚖𝚙é𝚛𝚊𝚝𝚞𝚛𝚎 : ${data.main.temp}°C\n` +
        `𝚁𝚎𝚜𝚜𝚎𝚗𝚝𝚒 : ${data.main.feels_like}°C\n` +
        `𝙷𝚞𝚖𝚒𝚍𝚒𝚝é : ${data.main.humidity}%\n` +
        `𝚅𝚎𝚗𝚝 : ${data.wind.speed} m/s\n` +
        `𝙿𝚛𝚎𝚜𝚜𝚒𝚘𝚗 : ${data.main.pressure} hPa\n\n` +
        `𝙼𝚒𝚜𝚎 à 𝚓𝚘𝚞𝚛 : ${new Date(data.dt * 1000).toLocaleTimeString("fr-FR")}\n` +
        `╚─────────────────╝`;

      await sock.sendMessage(from, { text }, { quoted: message.raw });

    } catch (err) {
      console.error("Meteo error:", err);
      await reply("⚠️ 𝙸𝚖𝚙𝚘𝚜𝚜𝚒𝚋𝚕𝚎 𝚍𝚎 𝚛é𝚌𝚞𝚙é𝚛𝚎𝚛 𝚕𝚊 𝚖é𝚝é𝚘.");
    }
  }
};