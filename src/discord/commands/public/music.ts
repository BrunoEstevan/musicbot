import { Command } from "#base";
import { res } from "#functions";
import { menus } from "#menus";
import { brBuilder, limitText } from "@magicyan/discord";
import { QueryType, QueueRepeatMode, SearchQueryType} from "discord-player";
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
                    required
                },
                {
                    name: "engine",
                    description: "Search engine",
                    type: ApplicationCommandOptionType.String,
                    choices: Object.values(QueryType)                 
                    .filter(type => type === "youtube" || type === "spotifySearch" || type === "autoSearch")
                    .map(type => ({
                        name: type, value: type
                    }))
                }
            ]
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
                        { name: "off", value: "off" }
                    ]
                }
            ]
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
                }
            ]
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
                    .filter(type => type === "youtube" || type === "spotifySearch" || type === "autoSearch")
                    .map(type => ({
                        name: type, value: type
                    })),
                    required,
                },
                {
                    name: "query",
                    description: "Song name or URL",
                    type: ApplicationCommandOptionType.String,
                    required, autocomplete: true,
                }
            ]
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
            name: "select",
            description: "Skip to a specific song in the queue",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "song",
                    description: "Select the song",
                    type: ApplicationCommandOptionType.String,
                    required, autocomplete: true,
                }
            ]
        },
    ],
    async autocomplete(interaction) {
        const { options, guild, client:{player} } = interaction;
       
        const queue = player.queues.cache.get(guild.id);

        switch (options.getSubcommand(true)) {
            case "search": {
                const searchEngine = options.getString("engine", true);
                const focused = options.getFocused();
                try {
                    const results = await player.search(focused, {
                        searchEngine: searchEngine as SearchQueryType
                    });
                    if (!results.hasTracks())
                        return;
                    interaction.respond(results.tracks.map(track => ({
                        name: limitText(`${track.source} - ${track.duration} - ${track.title}`, 100),
                        value: track.url
                    })).slice(0, 24));
                }
                catch { }
                return;
            }
            case "select": {
                if (!queue || queue.size < 1)
                    return;
                const choices = queue.tracks.map((track, index) => ({
                    name: limitText(`${index}) ${track.title}`, 100),
                    value: track.id
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
            interaction.reply(res.danger("You need to be in a voice channel to use this command!"));
            return;
        }
        if (!channel) {
            interaction.reply(res.danger("This command cannot be used in this text channel!"));
            return;
        }
        const metadata = { channel, client, guild, voiceChannel };
        const player = client.player;
        const queue = player.queues.cache.get(guild.id);
        await interaction.deferReply({ ephemeral });
        switch (options.getSubcommand(true)) {
            case "play": {
                const query = options.getString("query", true);
                const searchEngine = options.getString("engine") ?? QueryType.AUTO;
                try {
                    const { track, searchResult } = await player.play(voiceChannel as never, query, {
                        searchEngine: searchEngine as SearchQueryType,
                        nodeOptions: { metadata }
                    });
                    const display = [];
                    if (searchResult.playlist) {
                        const { tracks, title, url } = searchResult.playlist;
                        display.push(`Added ${tracks.length} tracks from the playlist [${title}](${url})`, ...tracks.map(track => `${track.title}`).slice(0, 8), "...");
                    }
                    else {
                        display.push(`${queue?.size ? "Added to the queue" : "Now playing"} ${track.title}`);
                    }
                    interaction.editReply(res.success(brBuilder(display)));
                }
                catch (_) {
                    interaction.editReply(res.danger("Couldn't play the song"));
                }
                return;
            }
            case "search": {
                const trackUrl = options.getString("query", true);
                const searchEngine = options.getString("engine", true) as SearchQueryType;
                try {
                    const { track } = await player.play(voiceChannel as never , trackUrl, {
                        searchEngine, nodeOptions: { metadata }
                    });
                    const text = queue?.size ? "Added to the queue" : "Now playing";
                    interaction.editReply(res.success(`${text} ${track.title}`));
                }
                catch (_) {
                    interaction.editReply(res.danger("Couldn't play the song"));
                }
                return;
            }
        }
        if (!queue) {
            interaction.editReply(res.danger("There's no active queue!"));
            return;
        }
        switch (options.getSubcommand(true)) {
            case "pause": {
                if (queue.node.isPaused()) {
                    interaction.editReply(res.danger("The current song is already paused!"));
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
                interaction.editReply(res.success("The current song has been resumed!"));
                return;
            }
            case "stop": {
                queue.node.stop();
                interaction.editReply(res.success("The current song has been stopped!"));
                return;
            }
            case "skip": {
                const amount = options.getInteger("amount") ?? 1;
                const skipAmount = Math.min(queue.size, amount);
                for (let i = 0; i < skipAmount; i++) {
                    queue.node.skip();
                }
                interaction.editReply(res.success("Songs skipped successfully!"));
                return;
            }
            case "queue": {
                interaction.editReply(menus.music.queue(queue, 0));
                return;
            }
            case "shuffle": {
                queue.tracks.shuffle();
                interaction.editReply(res.success("The queue has been shuffled!"));
                return;
            }
            case "select": {
                const trackId = options.getString("song", true);
                try {
                    const skipped = queue.node.skipTo(trackId);
                    interaction.editReply(skipped
                        ? res.success("Songs skipped successfully!")
                        : res.danger("No song was skipped!"));
                }
                catch (_) {
                    interaction.editReply(res.danger("Couldn't skip to the selected song"));
                }
                return;
            }
            case "repeat": {
                if (!queue || !queue.currentTrack) {
                    interaction.editReply(res.danger("There's no song currently playing to repeat!"));
                    return;
                }
                const mode = interaction.options.getString("mode");
                if (mode === "track") {
                    if (queue.repeatMode === QueueRepeatMode.TRACK) {
                        interaction.editReply(res.danger("Repeat mode is already enabled for the current song!"));
                        return;
                    }
                    queue.setRepeatMode(QueueRepeatMode.TRACK);
                    interaction.editReply(res.success(`Repeating the current song: ${queue.currentTrack.title}`));
                }
                else if (mode === "off") {
                    if (queue.repeatMode === QueueRepeatMode.OFF) {
                        interaction.editReply(res.danger("Repeat mode is already disabled!"));
                        return;
                    }
                    queue.setRepeatMode(QueueRepeatMode.OFF);
                    interaction.editReply(res.success("Repeat mode disabled."));
                }
                return;
            }
        }
    }
});
