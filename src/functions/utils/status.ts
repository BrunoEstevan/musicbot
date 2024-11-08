import { ActivityType, Client } from "discord.js";
import { Track } from "discord-player";


export function setSongStatus(client: Client<true>, track: Track){
    client.user.setActivity({
        name: track.title,
        type: ActivityType.Listening
    });
} 