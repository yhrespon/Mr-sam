import axios from "axios";

export default {
  name: "weather",
  description: "𝙶𝚎𝚝 𝚍𝚎𝚝𝚊𝚒𝚕𝚎𝚍 𝚠𝚎𝚊𝚝𝚑𝚎𝚛 𝚒𝚗𝚏𝚘𝚛𝚖𝚊𝚝𝚒𝚘𝚗",
  
  async execute(sock, message) {
    const { from, reply, args } = message;
    
    try {
      const city = args.join(" ") || "";
      
      if (!city) {
        return await reply("🌍 𝙿𝚛𝚘𝚟𝚒𝚍𝚎 𝚊 𝚌𝚒𝚝𝚢 𝚗𝚊𝚖𝚎");
      }
      
      const apiKey = "4902c0f2550f58298ad4146a92b65e10";
      
      await reply(`🔍 𝚂𝚎𝚊𝚛𝚌𝚑𝚒𝚗𝚐 𝚏𝚘𝚛 ${city}...`);
      
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
      );
      
      const data = response.data;
      
      // Format date
      const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
      const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();
      const updated = new Date(data.dt * 1000).toLocaleTimeString();
      
      const weatherInfo = `📊 *𝚆𝙴𝙰𝚃𝙷𝙴𝚁 𝚁𝙴𝙿𝙾𝚁𝚃*\n\n` +
                         `📍 ${data.name}, ${data.sys.country}\n\n` +
                         `🌡️ 𝚃𝚎𝚖𝚙𝚎𝚛𝚊𝚝𝚞𝚛𝚎:\n` +
                         `┣ 𝙲𝚞𝚛𝚛𝚎𝚗𝚝: ${data.main.temp}°C\n` +
                         `┣ 𝙵𝚎𝚎𝚕𝚜 𝚕𝚒𝚔𝚎: ${data.main.feels_like}°C\n` +
                         `┣ 𝙼𝚒𝚗: ${data.main.temp_min}°C\n` +
                         `┗ 𝙼𝚊𝚡: ${data.main.temp_max}°C\n\n` +
                         `🌬️ 𝚆𝚒𝚗𝚍: ${data.wind.speed} m/s\n` +
                         `💧 𝙷𝚞𝚖𝚒𝚍𝚒𝚝𝚢: ${data.main.humidity}%\n` +
                         `☁️ 𝙲𝚕𝚘𝚞𝚍𝚜: ${data.clouds.all}%\n\n` +
                         `🌅 𝚂𝚞𝚗𝚛𝚒𝚜𝚎: ${sunrise}\n` +
                         `🌇 𝚂𝚞𝚗𝚜𝚎𝚝: ${sunset}\n\n` +
                         `📝 ${data.weather[0].description}\n` +
                         `🕐 𝚄𝚙𝚍𝚊𝚝𝚎𝚍: ${updated}`;
      
      await reply(weatherInfo);
      
    } catch (error) {
      console.error("Weather detailed error:", error);
      await reply("❌ 𝙲𝚘𝚞𝚕𝚍 𝚗𝚘𝚝 𝚏𝚎𝚝𝚌𝚑 𝚠𝚎𝚊𝚝𝚑𝚎𝚛");
    }
  }
};