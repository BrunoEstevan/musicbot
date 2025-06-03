import { Responder, ResponderType } from "#base";
import { menus } from "#menus";

new Responder({
    customId: "music/progress/update",
    type: ResponderType.Button,
    cache: "cached",
    async run(interaction) {
        const { guild, member, client } = interaction;
        
        if (!guild || !member) {
            await interaction.reply({
                content: "Erro interno do servidor!",
                ephemeral: true
            });
            return;
        }
        
        const guildMember = member as any;
        const voiceChannel = guildMember.voice.channel;
        
        if (!voiceChannel) {
            await interaction.reply({
                content: "Você precisa estar em um canal de voz para usar este controle!",
                ephemeral: true
            });
            return;
        }
        
        const player = client.player;
        const queue = player.queues.cache.get(guild.id);
        
        if (!queue) {
            await interaction.reply({
                content: "Não há música tocando no momento!",
                ephemeral: true
            });
            return;
        }
        
        // Update the controls menu with fresh progress bar
        const updatedMenu = menus.music.controls(queue, voiceChannel);
        await interaction.update(updatedMenu);
    },
});
