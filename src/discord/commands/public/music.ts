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
          required,
        },
        {
          name: "engine",
          description: "Search engine",
          type: ApplicationCommandOptionType.String,
          choices: Object.values(QueryType)
            .filter(
              (type) =>
                type === "youtube" ||
                type ===  "youtubeSearch" ||
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
                type ===  "youtubeSearch" ||
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
          required,
        },
        {
          name: "query",
          description: "Song name or URL",
          type: ApplicationCommandOptionType.String,
          required,
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
          required,
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

    const queue = player.queues.cache.get(guild.id);

    switch (options.getSubcommand(true)) {
      case "search": {
        const searchEngine = options.getString("engine", true);
        const focused = options.getFocused();
        try {
          const results = await player.search(focused, {
            searchEngine: searchEngine as SearchQueryType,
          });
          if (!results.hasTracks()) return;
          interaction.respond(
            results.tracks
              .map((track) => ({
                name: limitText(
                  `${track.source} - ${track.duration} - ${track.title}`,
                  100
                ),
                value: track.url,
              }))
              .slice(0, 24)
          );
        } catch {}
        return;
      }
      case "select": {
        if (!queue || queue.size < 1) return;
        const choices = queue.tracks.map((track, index) => ({
          name: limitText(`${index}) ${track.title}`, 100),
          value: track.id,
        }));
        interaction.respond(choices.slice(0, 24));
        return;
      }
    }
  },
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
    const metadata = {
      channel,
      client,
      guild,
      voiceChannel,
      autoPlayEnabled: false,
    };
    const player = client.player;
    const queue = player.queues.cache.get(guild.id);
   await interaction.deferReply({ ephemeral: true });
   
    switch (options.getSubcommand(true)) {
      case "play": {
        const query = options.getString("query", true);
        const searchEngine = options.getString("engine") ?? QueryType.YOUTUBE;
        const volume = options.getInteger("volume");
        const panel = options.getBoolean("panel");
        
        let track, searchResult;
        
        try {
          // Tenta primeiro com o engine especificado (ou YouTube por padrão)
          try {
            const result = await player.play(
              voiceChannel as never,
              query,
              {
                searchEngine: searchEngine as SearchQueryType,
                nodeOptions: { metadata },
              }
            );
            track = result.track;
            searchResult = result.searchResult;
          }
          catch (err) {
            // Se falhou, tenta com YouTube Video
            try {
              const result = await player.play(
                voiceChannel as never,
                query,
                {
                  searchEngine: QueryType.YOUTUBE_VIDEO,
                  nodeOptions: { metadata },
                }
              );
              track = result.track;
              searchResult = result.searchResult;
            } catch (err) {
              // Se falhou, tenta com YouTube Playlist
              try {
                const result = await player.play(
                  voiceChannel as never,
                  query,
                  {
                    searchEngine: QueryType.YOUTUBE_PLAYLIST,
                    nodeOptions: { metadata },
                  }
                );
                track = result.track;
                searchResult = result.searchResult;
              } catch (err) {
                // Se falhou, tenta com YouTube Search
                try {
                  const result = await player.play(
                    voiceChannel as never,
                    query,
                    {
                      searchEngine: QueryType.YOUTUBE_SEARCH,
                      nodeOptions: { metadata },
                    }
                  );
                  track = result.track;
                  searchResult = result.searchResult;
                } catch (err) {
                  // Se falhou, tenta com Spotify Album
                  try {
                    const result = await player.play(
                      voiceChannel as never,
                      query,
                      {
                        searchEngine: QueryType.SPOTIFY_ALBUM,
                        nodeOptions: { metadata },
                      }
                    );
                    track = result.track;
                    searchResult = result.searchResult;
                  } catch (err) {
                    // Se falhou, tenta com Spotify Song
                    try {
                      const result = await player.play(
                        voiceChannel as never,
                        query,
                        {
                          searchEngine: QueryType.SPOTIFY_SONG,
                          nodeOptions: { metadata },
                        }
                      );
                      track = result.track;
                      searchResult = result.searchResult;
                    } catch (spotifyErr) {
                      // Se ainda falhou, tenta com Spotify Playlist
                      try {
                        const result = await player.play(
                          voiceChannel as never,
                          query,
                          {
                            searchEngine: QueryType.SPOTIFY_PLAYLIST,
                            nodeOptions: { metadata },
                          }
                        );
                        track = result.track;
                        searchResult = result.searchResult;
                      } catch (spotifyErr) {
                        // Se ainda falhou, tenta com Spotify Search
                        try {
                          const result = await player.play(
                            voiceChannel as never,
                            query,
                            {
                              searchEngine: QueryType.SPOTIFY_SEARCH,
                              nodeOptions: { metadata },
                            }
                          );
                          track = result.track;
                          searchResult = result.searchResult;
                        } catch (finalErr) {
                          interaction.editReply(res.danger("Unable to play the song"));
                          return;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        } catch (err) {
          interaction.editReply(res.danger("Unable to play the song"));
          return;
        }
        
        // Set the volume if specified
        if (volume !== null) {
          const queue = player.queues.cache.get(guild.id);
          if (queue) {
            queue.node.setVolume(volume);
          }
        }
        
        // Abrir o painel de controle se solicitado
        if (panel) {
          const queue = player.queues.cache.get(guild.id);
          if (queue) {
            const controlsMenu = menus.music.controls(queue, voiceChannel);
            await interaction.editReply(controlsMenu);
            return;
          }
        }
        
        const display = [];
        if (searchResult.playlist) {
          const { tracks, title, url } = searchResult.playlist;
          display.push(
            `Added ${tracks.length} songs from the playlist [${title}](${url})`,
            ...tracks.map((track) => `${track.title}`).slice(0, 8),
            "..."
          );
        } else {
          display.push(
            `${queue?.size ? "Added to queue" : "Now playing"} ${
              track.title
            }`
          );
        }
        interaction.editReply(res.success(brBuilder(display)));
        return;
      }
      case "search": {
        const trackUrl = options.getString("query", true);
        const searchEngine = options.getString("engine") ?? QueryType.YOUTUBE_SEARCH;
        try {
          const { track } = await player.play(voiceChannel as never, trackUrl, {
            searchEngine: searchEngine as SearchQueryType,
            nodeOptions: { metadata },
          });
          const text = queue?.size ? "Added to queue" : "Now playing";
          interaction.editReply(res.success(`${text} ${track.title}`));
        } catch (_) {
          interaction.editReply(res.danger("Unable to play the song"));
        }
        return;
      }
    }
    if (!queue) {
      interaction.editReply(res.danger("No active queue!"));
      return;
    }
    switch (options.getSubcommand(true)) {
      case "pause": {
        if (queue.node.isPaused()) {
          interaction.editReply(
            res.danger("The current song is already paused!")
          );
          return;
        }
        queue.node.pause();
        interaction.editReply(res.success("The current song has been paused!"));
        return;
      }
      case "resume": {
        if (!queue.node.isPaused()) {
          interaction.editReply(res.danger("The current song is not paused!"));
          return;
        }
        queue.node.resume();
        interaction.editReply(
          res.success("The current song has been resumed!")
        );
        return;
      }
      case "stop": {
        queue.node.stop();
        interaction.editReply(
          res.success("The current song has been stopped!")
        );
        return;
      }
      case "skip": {
        const amount = options.getInteger("amount") ?? 1;
        
        if (!queue.currentTrack) {
          interaction.editReply(res.warning("No songs to skip!"));
          return;
        }
        
        try {
          // Log the queue state for debugging
          console.log(`Skip command: requested to skip ${amount} songs`);
          console.log(`Current track: ${queue.currentTrack.title}`);
          console.log(`Queue size: ${queue.tracks.size} additional tracks`);
          
          // If there are no more tracks in the queue and we're trying to skip more than 1
          if (queue.tracks.size === 0 && amount > 1) {
            // Just skip the current track as that's all we have
            queue.node.skip();
            interaction.editReply(res.success("Skipped the current song. No more songs in queue!"));
            return;
          }
          
          // If just skipping the current song
          if (amount === 1) {
            queue.node.skip();
            interaction.editReply(res.success("Song skipped successfully!"));
            return;
          }
          
          // For skipping multiple songs, we'll use a different approach:
          // 1. Save all the tracks currently in the queue
          const allTracks = queue.tracks.toArray();
          
          // 2. Calculate how many tracks we need to skip and how many to keep
          // We're always skipping the current track, so we need to skip (amount-1) from the queue
          const skipFromQueue = Math.min(amount - 1, allTracks.length);
          
          // Debug log
          console.log(`Will skip current track + ${skipFromQueue} tracks from queue`);
          
          // 3. Get the tracks we want to keep (after skipping)
          const tracksToKeep = allTracks.slice(skipFromQueue);
          console.log(`Keeping ${tracksToKeep.length} tracks in queue`);
          
          // 4. Skip the current track
          queue.node.skip();
          
          // 5. Wait a moment for the skip operation to complete
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // 6. If we need to skip more tracks from the queue
          if (skipFromQueue > 0) {
            // Clear the entire queue
            queue.tracks.clear();
            
            // Wait a moment before adding tracks back
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // If we have tracks to keep
            if (tracksToKeep.length > 0) {
              // Add each track back to the queue in the right order
              for (const track of tracksToKeep) {
                // Use the search engine from the track's source
                const searchEngine = track.raw?.source as SearchQueryType || QueryType.YOUTUBE;
                
                try {
                  await player.play(voiceChannel as never, track.url, {
                    nodeOptions: { metadata },
                    searchEngine
                  });
                  
                  // Short delay between adding tracks to maintain order
                  await new Promise(resolve => setTimeout(resolve, 100));
                } catch (err) {
                  console.error(`Failed to add track back to queue: ${track.title}`, err);
                }
              }
            }
          }
          
          // Create success message
          const skippedCount = 1 + skipFromQueue; // current + queue tracks
          let successMessage = `Skipped ${skippedCount} song${skippedCount !== 1 ? 's' : ''}`;
          
          if (tracksToKeep.length > 0) {
            successMessage += `. ${tracksToKeep.length} song${tracksToKeep.length !== 1 ? 's' : ''} remaining in queue.`;
          } else {
            successMessage += `. Queue is now empty.`;
          }
          
          interaction.editReply(res.success(successMessage));
          
        } catch (error) {
          console.error("Error skipping songs:", error);
          interaction.editReply(res.danger("An error occurred while trying to skip songs."));
        }
        
        return;
      }
      case "queue": {
        interaction.editReply(menus.music.queue(queue, 0));
        return;
      }
      case "shuffle": {
        queue.tracks.shuffle();
        interaction.editReply(res.success("The queue of songs has been shuffled!"));
        return;
      }
      case "clear": {
        queue.tracks.clear();
        interaction.editReply(res.success("The queue of songs has been cleared!"));
        return;
      }
      case "select": {
        const trackId = options.getString("song", true);
        try {
          const skipped = queue.node.skipTo(trackId);
          interaction.editReply(
            skipped
              ? res.success("Songs skipped successfully!")
              : res.danger("No song was skipped!")
          );
        } catch (_) {
          interaction.editReply(
            res.danger("Unable to skip to the selected song")
          );
        }
        return;
      }
      case "repeat": {
        if (!queue || !queue.currentTrack) {
          interaction.editReply(
            res.danger("No song is currently playing to repeat!")
          );
          return;
        }
        const mode = interaction.options.getString("mode");
        if (mode === "track") {
          if (queue.repeatMode === QueueRepeatMode.TRACK) {
            interaction.editReply(
              res.danger("The repeat mode is already activated for the current song!")
            );
            return;
          }
          queue.setRepeatMode(QueueRepeatMode.TRACK);
          interaction.editReply(
            res.success(
              `Repeating the current song: ${queue.currentTrack.title}`
            )
          );
        } else if (mode === "off") {
          if (queue.repeatMode === QueueRepeatMode.OFF) {
            interaction.editReply(
              res.danger("The repeat mode is already deactivated!")
            );
            return;
          }
          queue.setRepeatMode(QueueRepeatMode.OFF);
          interaction.editReply(res.success("Repeat mode deactivated."));
        }
        return;
      }
      case "autoplay": {
        if (!queue || !queue.currentTrack) {
          interaction.editReply(
            res.danger("No song is currently playing to activate autoplay!")
          );
          return;
        }
        const mode = interaction.options.getString("mode");
        if (mode === "auto") {
          if (queue.repeatMode === QueueRepeatMode.AUTOPLAY) {
            interaction.editReply(
              res.danger("The autoplay mode is already activated for the current song!")
            );
            return;
          }
          queue.setRepeatMode(QueueRepeatMode.AUTOPLAY);
          interaction.editReply(
            res.success(
              `Playing similar songs automatically: ${queue.currentTrack.title}`
            )
          );
        } else if (mode === "off") {
          if (queue.repeatMode === QueueRepeatMode.OFF) {
            interaction.editReply(
              res.danger("The autoplay mode is already deactivated!")
            );
            return;
          }
          queue.setRepeatMode(QueueRepeatMode.OFF);
          interaction.editReply(res.success("Autoplay mode deactivated."));
        }
        return;
      }
    }
  },
});
