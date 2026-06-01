export default {
  name: "desc",
  description: "📝 Change the group description",
  
  async execute(sock, message, args) {
    const { from, reply, isGroup } = message;
    if (!isGroup) return await reply("❌ This command works only in groups");

    const newDesc = args.join(" ");
    if (!newDesc) return await reply("📝 Usage: desc <new description>");

    try {
      await sock.groupUpdateDescription(from, newDesc);
      await reply(`✅ 𝙶𝚛𝚘𝚞𝚙 description updated:\n*${newDesc}*`);
    } catch (e) {
      console.error("Desc error:", e);
      await reply("❌ Cannot update group description");
    }
  }
};