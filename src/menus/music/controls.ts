import { settings } from "#settings";
import { brBuilder, createEmbed, createRow } from "@magicyan/discord";
import { GuildQueue, } from "discord-player";
import { ButtonBuilder, ButtonStyle, VoiceBasedChannel } from "discord.js";

export function musicControlsMenu(queue: GuildQueue, voiceChannel: VoiceBasedChannel) {
    const currentTrack = queue.currentTrack;
    
    if (!currentTrack) {
        const embed = createEmbed({
            color: settings.colors.danger,
            title: "🎵 Music Player",
            description: "No music is currently playing."
        });
        
        return { embeds: [embed], ephemeral: true };
    }
    
    const { thumbnail, url, title, author, duration } = currentTrack;
    const isPaused = queue.node.isPaused();
    const hasPlayedTracks = queue.history.tracks.size > 0;
    const hasNextTracks = queue.tracks.size > 0;
    const volume = queue.node.volume;
    
    const embed = createEmbed({
        color: settings.colors.fuchsia,
        title: "🎵 Music Player",
        thumbnail,
        url,
        description: brBuilder(
            `### 🎵 Now Playing:`,
            `**${title}**`,
            `**Artist**: ${author}`,
            `**Duration**: ${duration}`,
            `\n### 🎛️ Controls:`,
            `**Volume**: ${volume}%`,
            `**Status**: ${isPaused ? "Paused ⏸️" : "Playing ▶️"}`,
            `**Autoplay**: ${queue.repeatMode === 3 ? "Enabled 🔄" : "Disabled ⏹️"}`,
            `**In Queue**: ${queue.tracks.size} songs`,
            `**Voice Channel**: ${voiceChannel}`
        )
    });
    
    const mainRow = createRow(
        new ButtonBuilder({
            customId: "music/control/previous",
            emoji: "⏮️",
            style: ButtonStyle.Primary,
            disabled: !hasPlayedTracks
        }),
        new ButtonBuilder({
            customId: isPaused ? "music/control/resume" : "music/control/pause",
            emoji: isPaused ? "▶️" : "⏸️",
            style: isPaused ? ButtonStyle.Success : ButtonStyle.Secondary
        }),
        new ButtonBuilder({
            customId: "music/control/skip",
            emoji: "⏭️",
            style: ButtonStyle.Primary,
            disabled: !hasNextTracks && queue.repeatMode !== 3
        }),
        new ButtonBuilder({
            customId: queue.repeatMode === 3 ? "music/control/autoplayoff" : "music/control/autoplayon",
            emoji: "🔄",
            label: queue.repeatMode === 3 ? "Disable Autoplay" : "Enable Autoplay",
            style: queue.repeatMode === 3 ? ButtonStyle.Danger : ButtonStyle.Success
        })
    );
    
    const secondRow = createRow(
        new ButtonBuilder({
            customId: "music/control/queue",
            emoji: "📋",
            label: "Queue",
            style: ButtonStyle.Secondary
        }),
        new ButtonBuilder({
            customId: "music/control/volume/settings",
            emoji: "🔊",
            label: "Volume",
            style: ButtonStyle.Secondary
        }),
        new ButtonBuilder({
            customId: "music/control/seek",
            emoji: "⏱️",
            label: "Skip to Position",
            style: ButtonStyle.Primary
        })
    );
    
    const volumeRow = createRow(
        new ButtonBuilder({
            customId: "music/control/volume/10",
            label: "10%",
            style: ButtonStyle.Secondary
        }),
        new ButtonBuilder({
            customId: "music/control/volume/30",
            label: "30%",
            style: ButtonStyle.Secondary
        }),
        new ButtonBuilder({
            customId: "music/control/volume/50",
            label: "50%",
            style: ButtonStyle.Secondary
        }),
        new ButtonBuilder({
            customId: "music/control/volume/80",
            label: "80%",
            style: ButtonStyle.Secondary
        }),
        new ButtonBuilder({
            customId: "music/control/volume/100",
            label: "100%",
            style: ButtonStyle.Secondary
        })
    );
    
    return { embeds: [embed], components: [mainRow, secondRow, volumeRow] };
}
