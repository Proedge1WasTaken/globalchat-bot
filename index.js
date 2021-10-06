const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const db = require("quick.db");
const config = require("./config.json");

client.on("ready", () => {
  console.log(`${client.user.username} Elindult és ${client.guilds.cache.size} guildben ${client.users.cache.size} felhasználót szolgál ki.`);
});

client.on("message", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;
  const args = message.content
    .slice(config.prefix.length)
    .trim()
    .split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command === "help") return message.channel.send("!global #csatorna");
  if (command === "global") {
    const channel = message.mentions.channels.first();
    if (!message.member.hasPermission('MANAGE_GUILD')) return message.channel.send(`Szükséged van MANAGE_GUILD jogra`)
    if (!channel)
      return message.channel.send(
        "Adj is meg valamit"
      );
    db.set(`g_${message.guild.id}`, `${channel.id}`);
    message.channel.send(`Globál csatorna beállítva a(z) ${channel} csatornában!`);
  }
});

client.on("message", async message => {
  if (message.author.bot) return;
  if (message.content.startsWith(config.prefix)) return;
  let set = db.fetch(`g_${message.guild.id}`);
  if (message.channel.id === set) {
    const embed = new Discord.MessageEmbed()
      .setTitle(message.author.tag)
      .addField('üzenet',message.content)
      .setFooter(`Szerver: ${message.guild.name} || Tagok: ${message.guild.memberCount}`)
      .setTimestamp();
      message.delete();
    client.guilds.cache.forEach(g => {
      try {
        client.channels.cache.get(db.fetch(`g_${g.id}`)).send(embed);
      } catch (e) {
        return;
      }
    });
  }
});
client.login(config.token);