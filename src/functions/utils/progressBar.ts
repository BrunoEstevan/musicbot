import { GuildQueue } from "discord-player";

export interface ProgressBarOptions {
    length?: number;
    leftChar?: string;
    rightChar?: string;
    indicator?: string;
    showTimecodes?: boolean;
    separator?: string;
}

export function createCustomProgressBar(queue: GuildQueue, options: ProgressBarOptions = {}) {
    const {
        length = 20,
        leftChar = '▬',
        rightChar = '▬',
        indicator = '🔘',
        showTimecodes = true,
        separator = ' | '
    } = options;

    const currentTrack = queue.currentTrack;
    if (!currentTrack) {
        const emptyBar = leftChar.repeat(length);
        return showTimecodes ? `${emptyBar}${separator}0:00 / 0:00` : emptyBar;
    }

    // Get timestamp data
    const timestamp = queue.node.getTimestamp();
    if (!timestamp) {
        const emptyBar = leftChar.repeat(length);
        return showTimecodes ? `${emptyBar}${separator}0:00 / ${currentTrack.duration}` : emptyBar;
    }

    const { current, total } = timestamp;
    const progress = current.value / total.value;
    const progressLength = Math.round(progress * length);

    // Create the progress bar
    const leftPart = leftChar.repeat(Math.max(0, progressLength - 1));
    const rightPart = rightChar.repeat(Math.max(0, length - progressLength));
    const progressBar = leftPart + (progressLength > 0 ? indicator : '') + rightPart;

    if (showTimecodes) {
        return `${progressBar}${separator}${current.label} / ${total.label}`;
    }

    return progressBar;
}

export function formatDuration(ms: number): string {
    if (!ms || isNaN(ms)) return "0:00";
    
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function getProgressPercentage(queue: GuildQueue): number {
    const timestamp = queue.node.getTimestamp();
    if (!timestamp) return 0;
    
    const { current, total } = timestamp;
    return Math.round((current.value / total.value) * 100);
}
