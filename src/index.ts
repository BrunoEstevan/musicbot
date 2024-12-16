import { bootstrapApp } from "#base";
import { PoTokenResult, IntegrityTokenData } from "bgutils-js";
// import { poTokenExtraction } from "discord-player-youtubei/experimental";
import { Player } from "discord-player";
import { GatewayIntentBits } from "discord.js";
import { YoutubeiExtractor } from "discord-player-youtubei";
import { SpotifyExtractor } from "@discord-player/extractor";
import { spotifyCredentials, youtubeCredentials } from "#auth";
import { ActivityType } from "discord.js";
import { ProxyAgent } from "undici";
import { proxyMain } from "#proxy";


const client = await bootstrapApp({
  workdir: import.meta.dirname,
  commands: {
    guilds: ["1037734705753247764","1252034169903779920","739845524361969764"]
   },
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
  beforeLoad: async(client) => {
    
    const player = Player.create(Object(client), {
      ytdlOptions: {
        quality: "highestaudio",
        filter: "videoonly",
      },
    });
    const { token2, visitorData } = youtubeCredentials;
    const { clientId, clientSecret } = spotifyCredentials;
    const {  proxyUrl } = proxyMain
   
    const proxyAgent = new ProxyAgent(proxyUrl);

     console.log(proxyAgent);
    const options = {
      streamOptions: {
        useClient: "WEB",
      },
      disablePlayer: false,
      agent: proxyAgent,
    };
      
    const youtubeExtractor = await player.extractors.register(
      YoutubeiExtractor, 
      options
    );

    

    if (youtubeExtractor ) {
        const innertube = youtubeExtractor.innerTube;
        if(innertube) {
        // const token = await poTokenExtraction(innertube);
        const tokenResult: PoTokenResult = {
          poToken: token2,
          integrityTokenData: {} as IntegrityTokenData,
        };
        console.log(tokenResult);
        
        youtubeExtractor.setPoToken(
          tokenResult,
          visitorData
        );
      } 
    }
    player.extractors.register(SpotifyExtractor, {
      clientId: clientId,
      clientSecret: clientSecret,
    });

    Object.assign(client, { player });
  },
});

client.on("ready", () => {
  if (client.user) {
    client.user.setActivity("Commands: /music 🤖", {
      type: ActivityType.Custom,
    });
  }
});

console.log(client);
