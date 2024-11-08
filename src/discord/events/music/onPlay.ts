import { menus } from "#menus";
import { useMainPlayer } from "discord-player";
import { ActivityType } from "discord.js";
const player = useMainPlayer();
player.events.on("playerStart", (queue, track) => {
    const { client, channel, voiceChannel, guild } = queue.metadata;
    if (guild.id === voiceChannel.guild.id) {
        client.user.setActivity({ name: track.title, type: ActivityType.Listening });
        channel.send(menus.music.announcement(track, voiceChannel));
    }
});
player.events.on("playerFinish", (queue) => {
    const { client } = queue.metadata;
    client.user.setActivity({ name: "Nothing right now", type: ActivityType.Listening });
});
