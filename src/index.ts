import { bootstrapApp } from "#base";
// import { PoTokenResult, IntegrityTokenData } from "bgutils-js";
import { Player } from "discord-player";
import { GatewayIntentBits, ActivityType } from "discord.js";
import { YoutubeiExtractor } from "discord-player-youtubei";
// import { poTokenExtraction } from 'discord-player-youtubei/experimental'
import { SpotifyExtractor } from "@discord-player/extractor";
import {  spotifyCredentials } from "#auth";
import { spawn } from "child_process";
import { ProxyAgent } from "undici";
import { proxyMain } from "#proxy";

// Atualizar credenciais a cada 5 minutos
// setInterval(updateCredentials, 5 * 60 * 1000);

export const client = await bootstrapApp({
  workdir: import.meta.dirname,
  commands: {
    guilds: [
      "1037734705753247764",
      "1252034169903779920",
      "739845524361969764",
      "1170830808886550588",
      "981733220817207316",
      "858859024618487828",
      "1330749640152191076",
      "1366848355061338183",
    ],
  },
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    
  ],
  beforeLoad: async (client) => {
    const player = Player.create(Object(client), {
      
    });
  ;
    // const { token2, visitorData } = youtubeCredentials;
    const { clientId, clientSecret } = spotifyCredentials;
    const { proxyUrl } = proxyMain;
    const proxyAgent = new ProxyAgent(proxyUrl);
  // const { oauthtoken } = youtubeOauth;


    // const options = {
    //   streamOptions: {
    //     useClient: "WEB",
    //   },
    //   disablePlayer: false,
    //   agent: proxyAgent,
    // };
  

    // const youtubeExtractor = await player.extractors.register(
    //   YoutubeiExtractor, 
    //   options
    // );

    //  if (youtubeExtractor ) {
    //     const innertube = youtubeExtractor.innerTube;
    //     if(innertube) {
    //     const token = await poTokenExtraction(innertube);
    //     const tokenResult: PoTokenResult = {
    //      poToken : token as unknown as string,
         
    //      integrityTokenData: {} as IntegrityTokenData,

    //     };
    //     console.log(tokenResult);
        
    //     youtubeExtractor.setPoToken(
    //       tokenResult,
    //       visitorData
    //     );
    //   } 
    // }


   player.extractors.register(YoutubeiExtractor, {
      streamOptions: {
        useClient: "WEB",
      },
      // cookie: cookies as unknown as string,
      // authentication: oauthtoken,
      // disablePlayer: false,
      proxy: proxyAgent,
      // overrideBridgeMode: "yt",
      generateWithPoToken: true,
    });

    
  //  console.log(cookies)
    // Registrar extrator do Spotify
    player.extractors.register(SpotifyExtractor, {
      clientId: clientId,
      clientSecret: clientSecret,
    });

    // Configurar eventos de erro
    player.events.on("error", (_, error) => {
      console.error("Erro no player:", error);
    });

    // Adicionar delay entre requisições
    player.events.on("playerStart", async () => {
      try {
        // Aguardar 10 segundos antes de processar a próxima música
        await new Promise(resolve => setTimeout(resolve, 10000));
      } catch (error) {
        console.error("Erro ao aguardar delay:", error);
      }
    });



    Object.assign(client, { player });
  },
});

client.on("ready", () => {
  if (client.user) {
    client.user.setActivity("Commands: /music 🤖, /musicplayer 🎵", {
      type: ActivityType.Custom,
    });
  }
});

process.on('uncaughtException', (error) => {
  console.error('Erro não capturado:', error);
  // O bot continuará funcionando mesmo com erros não capturados
});

process.on('unhandledRejection', (reason) => {
  console.error('Promessa rejeitada não tratada:', reason);
  // O bot continuará funcionando mesmo com promessas rejeitadas
});

// Handle process exit to run the restart script if needed
process.on('exit', (code) => {
  console.log(`Bot process is exiting with code ${code}. Checking for restart...`);
  
  if (code === 0) {
    // If there's a clean exit with code 0, try to run the restart script
    // This is executed in a detached process to allow this process to exit
    const child = spawn('npm', ['run', 'restart'], {
      detached: true,
      stdio: 'ignore',
      cwd: process.cwd(),
    });
    child.unref();
  }
});