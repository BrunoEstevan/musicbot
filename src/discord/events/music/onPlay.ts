import { menus } from "#menus";
import { useMainPlayer } from "discord-player";


const player = useMainPlayer();


player.events.on("playerStart", (queue, track) => {
    const { channel, voiceChannel  } = queue.metadata;

    
    if (channel) {
        channel.send(menus.music.announcement(track, voiceChannel));
    }
});

