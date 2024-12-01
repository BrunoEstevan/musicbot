import { QueueMetadata } from "#functions";
import { menus } from "#menus";
import { GuildQueue, useMainPlayer } from "discord-player";

const player = useMainPlayer();


player.events.on("playerStart", (queue: GuildQueue<QueueMetadata>, track) => {
    const { channel, voiceChannel  } = queue.metadata;

    
    if (channel) {
        channel.send(menus.music.announcement(track, voiceChannel));
    }
});




