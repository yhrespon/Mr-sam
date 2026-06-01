import axios from "axios";

export default {
  name: "news",
  description: "𝚂𝚑𝚘𝚠 𝚝𝚘𝚙 𝚗𝚎𝚠𝚜 𝚑𝚎𝚊𝚍𝚕𝚒𝚗𝚎𝚜",
  aliases: ["headlines", "latestnews"],
  
  async execute(sock, message) {
    const { from, reply } = message;
    
    try {
      const apiKey = "dcd720a6f1914e2d9dba9790c188c08c";
      
      await reply("📰 𝙵𝚎𝚝𝚌𝚑𝚒𝚗𝚐 𝚕𝚊𝚝𝚎𝚜𝚝 𝚗𝚎𝚠𝚜...");
      
      // Fetch news
      const { data } = await axios.get(
        `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`
      );
      
      const articles = data.articles?.slice(0, 5) || [];
      
      if (articles.length === 0) {
        return await reply("❌ 𝙽𝚘 𝚗𝚎𝚠𝚜 𝚊𝚟𝚊𝚒𝚕𝚊𝚋𝚕𝚎");
      }
      
      // Format news message
      let newsText = `📰 *𝚃𝙾𝙿 𝙽𝙴𝚆𝚂*\n\n`;
      
      articles.forEach((article, index) => {
        newsText += `*${index + 1}. ${article.title || "No title"}*\n`;
        
        if (article.source?.name) {
          newsText += `📰 𝚂𝚘𝚞𝚛𝚌𝚎: ${article.source.name}\n`;
        }
        
        if (article.description) {
          const shortDesc = article.description.length > 100 
            ? article.description.substring(0, 100) + "..." 
            : article.description;
          newsText += `📝 ${shortDesc}\n`;
        }
        
        if (article.publishedAt) {
          const date = new Date(article.publishedAt).toLocaleDateString();
          newsText += `📅 ${date}\n`;
        }
        
        newsText += `\n`;
      });
      
      newsText += `📊 𝚃𝚘𝚝𝚊𝚕: ${data.totalResults} 𝚊𝚛𝚝𝚒𝚌𝚕𝚎𝚜 𝚏𝚘𝚞𝚗𝚍`;
      
      await sock.sendMessage(from, { text: newsText });
      
    } catch (error) {
      console.error("News error:", error);
      
      if (error.response?.status === 426) {
        await reply("❌ 𝙰𝙿𝙸 𝚕𝚒𝚖𝚒𝚝 𝚛𝚎𝚊𝚌𝚑𝚎𝚍");
      } else if (error.response?.status === 401) {
        await reply("❌ 𝙸𝚗𝚟𝚊𝚕𝚒𝚍 𝙰𝙿𝙸 𝚔𝚎𝚢");
      } else {
        await reply("❌ 𝙵𝚊𝚒𝚕𝚎𝚍 𝚝𝚘 𝚏𝚎𝚝𝚌𝚑 𝚗𝚎𝚠𝚜");
      }
    }
  }
};