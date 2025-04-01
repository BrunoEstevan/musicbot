import { Command } from "#base";
import { res } from "#functions";
import { menus } from "#menus";
import { ApplicationCommandOptionType } from "discord.js";

new Command({
    name: "musicplayer",
    description: "Opens the music player control panel",
    options: [
        {
            name: "visibility",
            description: "Choose if the panel will be visible only to you or to everyone",
            type: ApplicationCommandOptionType.String,
            choices: [
                { name: "Only for me", value: "private" },
                { name: "For everyone", value: "public" }
            ]
        }
    ],
    async run(interaction) {
        const { options, member, guild, channel, client } = interaction;
        const voiceChannel = member.voice.channel;
        
        if (!voiceChannel) {
            interaction.reply(
                res.danger("You need to be in a voice channel to use this command!")
            );
            return;
        }
        
        if (!channel) {
            interaction.reply(
                res.danger("This command cannot be used in this text channel!")
            );
            return;
        }
        
        const player = client.player;
        const queue = player.queues.cache.get(guild.id);
        
        if (!queue) {
            interaction.reply(
                res.warning("There's no music playing right now!")
            );
            return;
        }
        
        const visibility = options.getString("visibility") ?? "private";
        const isEphemeral = visibility === "private";
        
        const controlsMenu = menus.music.controls(queue, voiceChannel);
        await interaction.reply({ ...controlsMenu, ephemeral: isEphemeral });
    }
}); 