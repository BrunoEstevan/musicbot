import { settings } from "#settings";
import { brBuilder, createEmbed } from "@magicyan/discord";
import { Track } from "discord-player";
import { VoiceBasedChannel } from "discord.js";

export function musicAnnouncementMenu(track: Track, voiceChannel: VoiceBasedChannel) {
    const { thumbnail, url, title, author, duration } = track;

    const embed = createEmbed({
        color: settings.colors.fuchsia,
        title: "🎵 Now Playing",
        thumbnail, 
        url,
        description: brBuilder(
            `**Song**: ${title}`,
            `**Artist**: ${author}`,
            `**Voice Channel**: ${voiceChannel}`, 
            `**Duration**: ${duration}`
        )
    });

    return { embeds: [embed] };
}
