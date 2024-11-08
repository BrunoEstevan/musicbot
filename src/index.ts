import { bootstrapApp } from "#base";
import { Player } from "discord-player";
import { GatewayIntentBits,} from "discord.js";
import { YoutubeiExtractor } from "discord-player-youtubei";
import { SpotifyExtractor } from "@discord-player/extractor";
import { spotifyCredentials } from "#auth";

const client = await bootstrapApp({
    workdir: import.meta.dirname,
    commands: {
    },
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ],
    beforeLoad(client) {

         const { clientId, clientSecret } = spotifyCredentials;


        const oauthTokens = process.env.YTB_OAUTH;
        const player = Player.create(Object(client), {
            ytdlOptions: {
                quality: "highestaudio",
                filter: "videoonly"
            }
        });
        player.extractors.register(YoutubeiExtractor, { authentication: oauthTokens
        });
      
        player.extractors.register(SpotifyExtractor, {
            clientId: clientId,  
            clientSecret: clientSecret  
        });

        Object.assign(client, { player });
    },
}) 
console.log(client);
