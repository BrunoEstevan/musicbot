import { Event } from "#base";
import { menus } from "#menus";
import { QueueRepeatMode } from "discord-player";
import { ActionRowBuilder,  ButtonInteraction, GuildMember, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from "discord.js";

new Event({
    name: "MusicControls",
    event: "interactionCreate",
    async run(interaction) {
        
        if (interaction.isButton()) {
            const buttonInteraction = interaction as ButtonInteraction;
            const [action, type, command, value] = buttonInteraction.customId.split("/");
            
            if (action !== "music" || type !== "control") return;
            
            const { guild, member, client } = buttonInteraction;
            if (!guild || !member) return;

            
            const guildMember = member as GuildMember;
            const voiceChannel = guildMember.voice.channel;
            
            if (!voiceChannel) {
                await buttonInteraction.reply({
                    content: "You need to be in a voice channel to use these controls!",
                    ephemeral: true
                });
                return;
            }
            
            const player = client.player;
            const queue = player.queues.cache.get(guild.id);
            
            if (!queue) {
                await buttonInteraction.reply({
                    content: "There's no music playing right now!",
                    ephemeral: true
                });
                return;
            }
            
            
            if (command === "volume" && value === "settings") {
                
                const modal = new ModalBuilder()
                    .setCustomId("music/volume/modal")
                    .setTitle("Volume Control");
                
                const volumeInput = new TextInputBuilder()
                    .setCustomId("volumeValue")
                    .setLabel("Set volume (0-100)")
                    .setPlaceholder("Enter a value between 0 and 100")
                    .setValue(queue.node.volume.toString())
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short);
                
                const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(volumeInput);
                modal.addComponents(firstActionRow);
                
                await buttonInteraction.showModal(modal);
                return;
            }
            
            
            if (command === "volume" && value && value !== "settings") {
                const volumeLevel = parseInt(value);
                if (!isNaN(volumeLevel)) {
                    queue.node.setVolume(volumeLevel);
                    const updatedMenu = menus.music.controls(queue, voiceChannel);
                    await buttonInteraction.update(updatedMenu);
                    return;
                }
            }
            
            switch (command) {
                case "previous": {
                    
                    if (queue.history.tracks.size === 0) {
                        await buttonInteraction.reply({
                            content: "There are no previous tracks to go back to!",
                            ephemeral: true
                        });
                        return;
                    }
                    
                    
                    await queue.history.back();
                    
                    
                    const updatedMenu = menus.music.controls(queue, voiceChannel);
                    await buttonInteraction.update(updatedMenu);
                    break;
                }
                
                case "pause": {
                    
                    queue.node.pause();
                    
                    
                    const updatedMenu = menus.music.controls(queue, voiceChannel);
                    await buttonInteraction.update(updatedMenu);
                    break;
                }
                
                case "resume": {
                    
                    queue.node.resume();
                    
                    
                    const updatedMenu = menus.music.controls(queue, voiceChannel);
                    await buttonInteraction.update(updatedMenu);
                    break;
                }
                
                case "skip": {
                    
                    if (queue.tracks.size === 0 && queue.repeatMode !== QueueRepeatMode.AUTOPLAY) {
                        
                        queue.setRepeatMode(QueueRepeatMode.AUTOPLAY);
                        await buttonInteraction.reply({
                            content: "Autoplay enabled because there are no more tracks in the queue!",
                            ephemeral: true
                        });
                    }
                    
                    
                    await queue.node.skip();
                    
                    
                    const updatedMenu = menus.music.controls(queue, voiceChannel);
                    await buttonInteraction.update(updatedMenu);
                    break;
                }
                
                case "autoplayon": {
                    
                    queue.setRepeatMode(QueueRepeatMode.AUTOPLAY);
                    
                    
                    const updatedMenu = menus.music.controls(queue, voiceChannel);
                    await buttonInteraction.update(updatedMenu);
                    break;
                }
                
                case "autoplayoff": {
                    
                    queue.setRepeatMode(QueueRepeatMode.OFF);
                    
                    
                    const updatedMenu = menus.music.controls(queue, voiceChannel);
                    await buttonInteraction.update(updatedMenu);
                    break;
                }
                
                case "queue": {
                    
                    const queueMenu = menus.music.queue(queue);
                    await buttonInteraction.reply(queueMenu);
                    break;
                }
                
                case "seek": {
                    // Show modal for specific time input
                    const currentTrack = queue.currentTrack;
                    if (!currentTrack) {
                        await buttonInteraction.reply({
                            content: "There's no music playing right now!",
                            ephemeral: true
                        });
                        return;
                    }
                  
                    
                    const modal = new ModalBuilder()
                        .setCustomId("music/seek/modal")
                        .setTitle("Position Control");
                    
                    const seekInput = new TextInputBuilder()
                        .setCustomId("seekValue")
                        .setLabel(`Set position (example: 1:30 or 90 seconds)`)
                        .setPlaceholder("Enter time in MM:SS format or seconds")
                        .setValue("")
                        .setRequired(true)
                        .setStyle(TextInputStyle.Short);
                    
                    const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(seekInput);
                    modal.addComponents(firstActionRow);
                    
                    await buttonInteraction.showModal(modal);
                    break;
                }
            }
        }
        
        if (interaction.isModalSubmit()) {
            const modalInteraction = interaction as ModalSubmitInteraction;
            
            // Check if it's the volume modal
            if (modalInteraction.customId === "music/volume/modal") {
                const volumeValue = modalInteraction.fields.getTextInputValue("volumeValue");
                const volumeLevel = parseInt(volumeValue);
                
                if (isNaN(volumeLevel) || volumeLevel < 0 || volumeLevel > 100) {
                    await modalInteraction.reply({
                        content: "Please enter a valid volume value between 0 and 100.",
                        ephemeral: true
                    });
                    return;
                }
                
                const { guild, member, client } = modalInteraction;
                if (!guild || !member) return;

                
                const guildMember = member as GuildMember;
                const voiceChannel = guildMember.voice.channel;
                
                if (!voiceChannel) {
                    await modalInteraction.reply({
                        content: "You need to be in a voice channel to use these controls!",
                        ephemeral: true
                    });
                    return;
                }
                
                const player = client.player;
                const queue = player.queues.cache.get(guild.id);
                
                if (!queue) {
                    await modalInteraction.reply({
                        content: "There's no music playing right now!",
                        ephemeral: true
                    });
                    return;
                }
                
                
                queue.node.setVolume(volumeLevel);
                
                
                const controlsMenu = menus.music.controls(queue, voiceChannel);
                await modalInteraction.reply({
                    content: `Volume set to ${volumeLevel}%`,
                    ephemeral: true
                });
                
                
                try {
                    const originalMessage = await modalInteraction.channel?.messages.fetch(modalInteraction.message?.id || '');
                    if (originalMessage && originalMessage.editable) {
                        await originalMessage.edit(controlsMenu);
                    }
                } catch (error) {
                    // Ignore errors when trying to update the message
                }
            }
            
            // Handle the seek modal
            if (modalInteraction.customId === "music/seek/modal") {
                const seekValue = modalInteraction.fields.getTextInputValue("seekValue");
                let seekTimeInSeconds = 0;
                
                // Try to interpret the value as MM:SS or as seconds
                if (seekValue.includes(":")) {
                    const [minutes, seconds] = seekValue.split(":");
                    seekTimeInSeconds = (parseInt(minutes) * 60) + parseInt(seconds);
                } else {
                    seekTimeInSeconds = parseInt(seekValue);
                }
                
                if (isNaN(seekTimeInSeconds) || seekTimeInSeconds < 0) {
                    await modalInteraction.reply({
                        content: "Please enter a valid time in MM:SS format or in seconds.",
                        ephemeral: true
                    });
                    return;
                }
                
                const { guild, member, client } = modalInteraction;
                if (!guild || !member) return;
                
                const guildMember = member as GuildMember;
                const voiceChannel = guildMember.voice.channel;
                
                if (!voiceChannel) {
                    await modalInteraction.reply({
                        content: "You need to be in a voice channel to use these controls!",
                        ephemeral: true
                    });
                    return;
                }
                
                const player = client.player;
                const queue = player.queues.cache.get(guild.id);
                
                if (!queue) {
                    await modalInteraction.reply({
                        content: "There's no music playing right now!",
                        ephemeral: true
                    });
                    return;
                }
                
                // Check if the time is within the limits of the song
                const timestamp = queue.node.getTimestamp();
                const totalTime: number = timestamp ? Math.floor(Number(timestamp.total) / 1000) : 0;
                if (seekTimeInSeconds > totalTime) {
                    await modalInteraction.reply({
                        content: `Time exceeds the duration of the song. Please enter a valid time value.`,
                        ephemeral: true
                    });
                    return;
                }
                
                try {
                    // Convert to milliseconds and seek
                    await queue.node.seek(seekTimeInSeconds * 1000);
                    
                    // Inform the user
                    await modalInteraction.reply({
                        content: `Song advanced to ${formatTime(seekTimeInSeconds * 1000)}`,
                        ephemeral: true
                    });
                    
                    // Update the control menu
                    const controlsMenu = menus.music.controls(queue, voiceChannel);
                    
                    // Try to update the original message
                    try {
                        const originalMessage = await modalInteraction.channel?.messages.fetch(modalInteraction.message?.id || '');
                        if (originalMessage && originalMessage.editable) {
                            await originalMessage.edit(controlsMenu);
                        }
                    } catch (error) {
                        // Ignore errors when trying to update the message
                    }
                } catch (error) {
                    console.error("Error seeking the song:", error);
                    await modalInteraction.reply({
                        content: "An error occurred while trying to advance the song.",
                        ephemeral: true
                    });
                }
            }
        }
    }
});

function formatTime(milliseconds: number): string {
    if (!milliseconds || isNaN(milliseconds)) return "0:00";
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
} 