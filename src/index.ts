import { bootstrapApp } from "#base";
import { PoTokenResult, IntegrityTokenData } from "bgutils-js";
import {  Player } from "discord-player";
import { GatewayIntentBits, ActivityType } from "discord.js";
import { YoutubeiExtractor } from "discord-player-youtubei";
import { SpotifyExtractor } from "@discord-player/extractor";
import { cookies, spotifyCredentials, youtubeCredentials } from "#auth";
import { spawn } from "child_process";
// import { ProxyAgent } from "undici";
// import { proxyMain } from "#proxy";



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
      ytdlOptions: {
        quality: "highestaudio",
        filter: "videoonly",
      }
    });


    const { token2, visitorData } = youtubeCredentials;
    const { clientId, clientSecret } = spotifyCredentials;
    // const { proxyUrl } = proxyMain;
    const { cookie } = cookies;
    // const proxyAgent = new ProxyAgent(proxyUrl);

    const tokenResult: PoTokenResult = {
      poToken: token2,
      integrityTokenData: {} as IntegrityTokenData,
    };

    player.extractors.register(YoutubeiExtractor, {
      streamOptions: {
        useClient: "WEB",
      },
      disablePlayer: false,
      // proxy: proxyAgent,
      overrideBridgeMode: "yt",
      cookie: cookie,
      trustedTokens: {
        poToken: tokenResult.poToken || tokenResult.integrityTokenData.toString(),
        visitorData: visitorData
      }
    });

    player.extractors.register(SpotifyExtractor, {
      clientId: clientId,
      clientSecret: clientSecret,
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