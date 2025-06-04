import { Command } from "#base";
import { res } from "#functions";
import { menus } from "#menus";
import { brBuilder, limitText } from "@magicyan/discord";
import { QueryType, QueueRepeatMode, SearchQueryType } from "discord-player";
import { ApplicationCommandOptionType } from "discord.js";

new Command({
  name: "music",
  description: "Music command",
  options: [
    {
      name: "play",
      description: "Play a song",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "query",
          description: "Song name or URL",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "engine",
          description: "Search engine",
          type: ApplicationCommandOptionType.String,
          choices: Object.values(QueryType)
            .filter(
              (type) =>
                type === "youtube" ||
                type === "youtubeSearch" ||
                type === "youtubePlaylist" ||
                type === "youtubeVideo" ||
                type === "spotifySearch" ||
                type === "spotifyAlbum" ||
                type === "spotifyPlaylist" ||
                type === "spotifySong"
            )
            .map((type) => ({
              name: type,
              value: type,
            })),
        },
        {
          name: "volume",
          description: "Set the volume level (0-100)",
          type: ApplicationCommandOptionType.Integer,
          minValue: 0,
          maxValue: 100,
        },
        {
          name: "panel",
          description: "Open the music control panel",
          type: ApplicationCommandOptionType.Boolean,
        },
      ],
    },
    {
      name: "pause",
      description: "Pause the current song",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "resume",
      description: "Resume the current song",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "stop",
      description: "Stop the current song",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "repeat",
      description: "Repeat the current song",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "mode",
          description: "Repeat mode",
          type: ApplicationCommandOptionType.String,
          choices: [
            { name: "repeatON", value: "track" },
            { name: "off", value: "off" },
          ],
          required: true,
        },
      ],
    },
    {
      name: "autoplay",
      description: "Toggle autoplay",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "mode",
          description: "autoplay mode",
          type: ApplicationCommandOptionType.String,
          choices: [
            { name: "autoplayON", value: "auto" },
            { name: "autoplayOFF", value: "off" },
          ],
          required: true,
        },
      ],
    },
    {
      name: "skip",
      description: "Skip songs in the queue",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "amount",
          description: "Number of songs to skip",
          type: ApplicationCommandOptionType.Integer,
          minValue: 1,
        },
      ],
    },
    {
      name: "search",
      description: "Search for a song",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "engine",
          description: "Search engine",
          type: ApplicationCommandOptionType.String,
          choices: Object.values(QueryType)
            .filter(
              (type) =>
                type === "youtube" ||
                type === "youtubeSearch" ||
                type === "youtubePlaylist" ||
                type === "youtubeVideo" ||
                type === "spotifySearch" ||
                type === "spotifyAlbum" ||
                type === "spotifyPlaylist" ||
                type === "spotifySong"
            )
            .map((type) => ({
              name: type,
              value: type,
            })),
          required: true,
        },
        {
          name: "query",
          description: "Song name or URL",
          type: ApplicationCommandOptionType.String,
          required: true,
          autocomplete: true,
        },
      ],
    },
    {
      name: "queue",
      description: "Show the current queue",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "shuffle",
      description: "Shuffle the queue",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "clear",
      description: "Clear the current queue",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "select",
      description: "Skip to a specific song in the queue",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "song",
          description: "Select the song",
          type: ApplicationCommandOptionType.String,
          required: true,
          autocomplete: true,
        },
      ],
    },
  ],
  async autocomplete(interaction) {
    const {
      options,
      guild,
      client: { player },
    } = interaction;

    if (!guild) return;
    const queue = player.queues.cache.get(guild.id);

    switch (options.getSubcommand(true)) {
      case "search": {
        const searchEngine = options.getString("engine", true);
        const focused = options.getFocused();
        if (!focused) return interaction.respond([]);

        try {
          const results = await player.search(focused, {
            searchEngine: searchEngine as SearchQueryType,
          });
          if (!results.hasTracks()) {
            interaction.respond([]);
            return;
          }
          interaction.respond(
            results.tracks
              .map((track) => ({
                name: limitText(
                  `${track.source || 'N/A'} - ${track.duration} - ${track.title}`,
                  100
                ),
                value: track.url,
              }))
              .slice(0, 24)
          );
        } catch(err) {
            console.error("[AutoComplete Error Search]", err);
            interaction.respond([]);
        }
        return;
      }
      case "select": {
        if (!queue || queue.size < 1) {
            interaction.respond([]);
            return;
        }
        const choices = queue.tracks.map((track, index) => ({
          name: limitText(`${index + 1}) ${track.title}`, 100),
          value: track.id,
        }));
        interaction.respond(choices.slice(0, 24));
        return;
      }
    }
  },
  async run(interaction) {
    const { options, member, guild, channel, client } = interaction;

    if (!member || !guild || !channel) {
        interaction.reply(res.danger("An error occurred while processing the command. Please try again."));
        return;
    }

    const voiceChannel = member.voice.channel;
    if (!voiceChannel) {
      interaction.reply(
        res.danger("You need to be in a voice channel to use this command!")
      );
      return;
    }

    const metadata = {
      channel,
      client,
      guild,
      voiceChannel,
    };
    const player = client.player;

    await interaction.deferReply({ ephemeral: false });

    const queue = player.queues.cache.get(guild.id);

    switch (options.getSubcommand(true)) {
      case "play": {
        const query = options.getString("query", true);
        const initialSearchEngine = options.getString("engine"); 
        const volume = options.getInteger("volume");
        const panel = options.getBoolean("panel");
        
        let track, searchResult;
        let success = false;

        const enginesToTryBase = [
            initialSearchEngine,
            QueryType.YOUTUBE_VIDEO,
            QueryType.SPOTIFY_SONG,
            initialSearchEngine === QueryType.YOUTUBE ? QueryType.YOUTUBE_VIDEO : null,
            QueryType.YOUTUBE,
            QueryType.YOUTUBE_PLAYLIST,
            QueryType.SPOTIFY_PLAYLIST,
            QueryType.SPOTIFY_ALBUM,
            QueryType.YOUTUBE_SEARCH,
            QueryType.SPOTIFY_SEARCH,
        ];

        const enginesToTry = [...new Set(enginesToTryBase.filter(engine => engine != null))];
          if (!initialSearchEngine && !enginesToTry.includes(QueryType.YOUTUBE)) {
            enginesToTry.push(QueryType.YOUTUBE);
        }
        if (enginesToTry.length === 0) {
            enginesToTry.push(QueryType.YOUTUBE);
        }
        
        console.log(`[DEBUG] Guild: ${guild.id}, User: ${member.user.id}, Query: "${query}", Initial Engine: ${initialSearchEngine}, Engines to try: ${enginesToTry.join(', ')}`);

        for (const engine of enginesToTry) {
            try {
                console.log(`[Player] Guild: ${guild.id}, Attempting to play query "${query}" with engine: ${engine}`);
                const result = await player.play(
                    voiceChannel as never,
                    query,
                    {
                        searchEngine: engine as SearchQueryType,
                        nodeOptions: { 
                            metadata,
                            volume: volume ?? undefined 
                        },
                    }
                );

                if (result && result.track) {
                    track = result.track;
                    searchResult = result.searchResult;
                    success = true;
                    console.log(`[Player] Guild: ${guild.id}, Successfully found track "${track.title}" (Duration: ${track.duration}) with engine: ${engine}`);
                    break; 
                } else {
                    console.warn(`[Player] Guild: ${guild.id}, Engine ${engine} returned no track for query "${query}". Result object:`, JSON.stringify(result));
                }
            } catch (err: any) {
                console.warn(`[Player] Guild: ${guild.id}, Failed to play query "${query}" with engine ${engine}. Error: ${err.message}`);
            }
        }

        if (!success || !track) {
            interaction.editReply(res.danger("Could not play the song after trying multiple sources. Please check the name or link provided."));
            
            const currentQueueAfterFailure = player.queues.cache.get(guild.id);
            if (!currentQueueAfterFailure || (currentQueueAfterFailure.tracks.size === 0 && !currentQueueAfterFailure.currentTrack)) {
                 console.log(`[Player] Guild: ${guild.id}, Queue is empty after failing to find a song. Bot MAY disconnect depending on settings (e.g. leaveOnEmpty).`);
            }
            return;
        }
        
        const currentQueuePlay = player.queues.cache.get(guild.id);

        if (volume !== null && currentQueuePlay) {
            try {
                currentQueuePlay.node.setVolume(volume); 
                console.log(`[Player] Guild: ${guild.id}, Volume set to ${volume} for queue.`);
            } catch (volErr: any) {
                console.warn(`[Player] Guild: ${guild.id}, Could not set volume to ${volume} on the queue: ${volErr.message}`);
            }
        }
        
        if (panel) {
            if (currentQueuePlay) { 
                const controlsMenu = menus.music.controls(currentQueuePlay, voiceChannel);
                await interaction.editReply(controlsMenu);
                return; 
            } else {
                 console.warn(`[Player] Guild: ${guild.id}, Panel requested but queue not found even after track was supposedly played.`);
            }
        }
        
        const display = [];
        if (searchResult && searchResult.playlist) { 
            const { tracks: playlistTracks, title: playlistTitle, url: playlistUrl } = searchResult.playlist;
            display.push(
                `Added ${playlistTracks.length} songs from playlist [${limitText(playlistTitle, 60)}](${playlistUrl})`,
                ...playlistTracks.map((t) => `➥ ${limitText(t.title, 70)}`).slice(0, 8)
            );
            if (playlistTracks.length > 8) {
                display.push(`... and ${playlistTracks.length - 8} more.`);
            }
        } else {
            const isQueuePopulated = currentQueuePlay && (currentQueuePlay.tracks.size > 0 || (currentQueuePlay.currentTrack && currentQueuePlay.currentTrack.id !== track.id) || currentQueuePlay.history.tracks.size > 0);
            display.push(
                `${isQueuePopulated ? "Added to queue" : "Now playing"} ${
                    limitText(track.title, 70)
                } (${track.duration})`
            );
        }
        interaction.editReply(res.success(brBuilder(display)));
        return;
      }
      
      case "search": {
        const trackUrl = options.getString("query", true);
        const searchEngine = options.getString("engine", true) ?? QueryType.YOUTUBE;
        try {
          const { track } = await player.play(voiceChannel as never, trackUrl, {
            searchEngine: searchEngine as SearchQueryType,
            nodeOptions: { metadata },
          });
          const q = player.queues.cache.get(guild.id);
          const text = q?.size && q.size > 0 ? "Added to queue" : "Now playing";
          interaction.editReply(res.success(`${text} ${track.title}`));
        } catch (err: any) {
          console.error(`[Search Command Error] Guild: ${guild.id}, Query: ${trackUrl}, Engine: ${searchEngine}, Error: ${err.message}`);
          interaction.editReply(res.danger("Could not play the song."));
        }
        return;
      }
    }
    
    if (!queue) {
      interaction.editReply(res.danger("No music playing or active queue!"));
      return;
    }
    switch (options.getSubcommand(true)) {
      case "pause": {
        if (queue.node.isPaused()) {
          interaction.editReply(
            res.danger("Current song is already paused!")
          );
          return;
        }
        queue.node.pause();
        interaction.editReply(res.success("Current song has been paused!"));
        return;
      }
      case "resume": {
        if (!queue.node.isPaused()) {
          interaction.editReply(res.danger("Current song is not paused!"));
          return;
        }
        queue.node.resume();
        interaction.editReply(
          res.success("Current song has been resumed!")
        );
        return;
      }
      case "stop": {
        queue.node.stop();
        interaction.editReply(
          res.success("Music has been stopped and queue cleared!")
        );
        return;
      }
      case "skip": {
        const amount = options.getInteger("amount") ?? 1;
        
        if (!queue.currentTrack) {
          interaction.editReply(res.warning("No song to skip!"));
          return;
        }
        
        if (amount === 1) {
            if (queue.tracks.size === 0 && queue.repeatMode === QueueRepeatMode.OFF) {
                queue.node.stop();
                interaction.editReply(res.success("Song skipped. Queue is empty."));
            } else {
                const skippedTrack = queue.currentTrack;
                queue.node.skip();
                interaction.editReply(res.success(`Skipped: ${limitText(skippedTrack.title, 50)}`));
            }
        } else {
            if (queue.tracks.size < amount -1) {
                interaction.editReply(res.danger(`There aren't ${amount} songs in the queue to skip.`));
                return;
            }
            let skippedCount = 0;
            for (let i = 0; i < amount; i++) {
                if (!queue.currentTrack && queue.tracks.size === 0) break;
                queue.node.skip();
                skippedCount++;
            }
             interaction.editReply(res.success(`${skippedCount} song(s) skipped!`));
        }
        return;
      }
      case "queue": {
        interaction.editReply(menus.music.queue(queue, 0));
        return;
      }
      case "shuffle": {
        if (queue.tracks.size < 2) {
            interaction.editReply(res.warning("Not enough songs in the queue to shuffle."));
            return;
        }
        queue.tracks.shuffle();
        interaction.editReply(res.success("Queue has been shuffled!"));
        return;
      }
      case "clear": {
        if (queue.tracks.size === 0) {
            interaction.editReply(res.warning("Queue is already empty."));
            return;
        }
        queue.tracks.clear();
        interaction.editReply(res.success("Queue has been cleared!"));
        return;
      }
      case "select": {
        const trackId = options.getString("song", true);
        try {
          const targetTrack = queue.tracks.find(t => t.id === trackId);
          if (!targetTrack) {
            interaction.editReply(res.danger("Song not found in the queue with that ID."));
            return;
          }
          const skipped = queue.node.skipTo(targetTrack);
          interaction.editReply(
            skipped
              ? res.success(`Skipping to: ${limitText(targetTrack.title, 50)}!`)
              : res.danger("No song was skipped!")
          );
        } catch (err: any) {
          console.error(`[Select Command Error] Guild: ${guild.id}, TrackID: ${trackId}, Error: ${err.message}`);
          interaction.editReply(
            res.danger("Could not skip to the selected song.")
          );
        }
        return;
      }
      case "repeat": {
        if (!queue.currentTrack) {
          interaction.editReply(
            res.danger("No music playing to repeat!")
          );
          return;
        }
        const mode = interaction.options.getString("mode", true);
        let repeatModeToSet: QueueRepeatMode;
        let modeName = "";

        if (mode === "track") {
          if (queue.repeatMode === QueueRepeatMode.TRACK) {
            interaction.editReply(res.danger("Current song repeat is already enabled!"));
            return;
          }
          repeatModeToSet = QueueRepeatMode.TRACK;
          modeName = "Current Song";
        } else if (mode === "off") {
          if (queue.repeatMode === QueueRepeatMode.OFF) {
            interaction.editReply(res.danger("Repeat mode is already disabled!"));
            return;
          }
          repeatModeToSet = QueueRepeatMode.OFF;
          modeName = "Disabled";
        } else {
            interaction.editReply(res.danger("Invalid repeat mode."));
            return;
        }
        queue.setRepeatMode(repeatModeToSet);
        interaction.editReply(
          res.success(
            `Repeat mode changed to: **${modeName}**.` +
            (repeatModeToSet === QueueRepeatMode.TRACK ? ` Repeating: ${limitText(queue.currentTrack.title, 40)}` : "")
          )
        );
        return;
      }
      case "autoplay": {
        if (!queue.currentTrack) {
          interaction.editReply(
            res.danger("No music playing to enable autoplay!")
          );
          return;
        }
        const mode = interaction.options.getString("mode", true);
        let autoPlayModeToSet: QueueRepeatMode;
        let modeName = "";

        if (mode === "auto") {
            if (queue.repeatMode === QueueRepeatMode.AUTOPLAY) {
                interaction.editReply(res.danger("Autoplay is already enabled!"));
                return;
            }
            autoPlayModeToSet = QueueRepeatMode.AUTOPLAY;
            modeName = "Autoplay Enabled";
        } else if (mode === "off") {
            if (queue.repeatMode !== QueueRepeatMode.AUTOPLAY && queue.repeatMode === QueueRepeatMode.OFF) {
                 interaction.editReply(res.danger("Autoplay is already disabled (no repeat mode active)!"));
                 return;
            }
             if (queue.repeatMode !== QueueRepeatMode.AUTOPLAY) {
                 interaction.editReply(res.danger("Autoplay is not active to be disabled. Current mode: " + queue.repeatMode));
                 return;
            }
            autoPlayModeToSet = QueueRepeatMode.OFF;
            modeName = "Autoplay Disabled";
        } else {
            interaction.editReply(res.danger("Invalid autoplay mode."));
            return;
        }
        queue.setRepeatMode(autoPlayModeToSet);
        interaction.editReply(
            res.success(
              `${modeName}.` +
              (autoPlayModeToSet === QueueRepeatMode.AUTOPLAY ? ` Will play similar songs after queue ends.` : "")
            )
        );
        return;
      }
    }
  },
});
