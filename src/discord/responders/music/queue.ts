import { Responder, ResponderType } from "#base";
import { res } from "#functions";
import { menus } from "#menus";
new Responder({
    customId: "music/queue/:page",
    type: ResponderType.Button, cache: "cached",
    async run(interaction, params) {
        const { guild, client: { player } } = interaction;
        const clear = { components: [] };
        const queue = player.queues.cache.get(guild.id);
        if (!queue) {
            interaction.update(res.danger("There is no active playback queue!", clear));
            return;
        }
        if (queue.size < 1) {
            interaction.update(res.danger("There are no songs in the active playback queue!", clear));
            return;
        }
        const page = Number.parseInt(params.page);
        interaction.update(menus.music.queue(queue, page));
    },
});
