import { settings } from "#settings";
import { brBuilder, createEmbed, createRow, limitText } from "@magicyan/discord";
import { GuildQueue } from "discord-player";
import { ButtonBuilder, ButtonStyle, hyperlink, } from "discord.js";
// import { client } from "../../index.js";








export function musicQueueMenu(queue: GuildQueue, page = 0) {
    const maxItems = 10;
    const amount = queue.size;
    const total = Math.ceil(amount / maxItems);
    const spliced = queue.tracks.toArray().splice(page * maxItems, maxItems);

    const embed = createEmbed({
        color: settings.colors.fuchsia,
        description: brBuilder(
            "# Current Queue",
            `Songs: ${queue.tracks.size}`,
            `- Current Song: ${queue.currentTrack?.title ?? "None"}`
        ),
        fields: spliced.map(track => ({
            name: limitText(track.title, 18, "..."),
            value: brBuilder(
                `> **Song**: ${hyperlink(track.title, track.url)}`,
                `> **Artist**: ${track.author}`,
                `> **Duration**: ${track.duration}`
            )
        })),
        footer: {
            text: `${page + 1}/${Math.max(total, 1)}`
        }
    });

    const row = createRow(
        new ButtonBuilder({
            customId: `music/queue/${page - 1}`,
            label: "Previous",
            style: ButtonStyle.Secondary,
            disabled: page < 1
        }),
        new ButtonBuilder({
            customId: "music/queue/00",
            label: "Start",
            style: ButtonStyle.Secondary,
            disabled: page < 1
        }),
        new ButtonBuilder({
            customId: `music/queue/${page + 1}`,
            label: "Next",
            style: ButtonStyle.Secondary,
            disabled: page >= total - 1,
        }),
    );

    return { ephemeral:true , embeds: [embed], components: [row] };
}

// async function run(interaction: any, params: any) {
//     const { client: { player } } = interaction;
// Client.on("interactionCreate", async (interaction: any) => {
//     if (!interaction.isButton()) return;

//     const [action, type, page] = interaction.customId.split("/");

//     if (action === "music" && type === "queue") {
//         const guildId = interaction.guildId;
//         if (!guildId) {
//             return interaction.reply({ content: "No guild ID found!", ephemeral: true });
//         }
//         const queue = client.player.queues.cache.get(guildId);
//         if (!queue) {
//             return interaction.reply({ content: "No active queue!", ephemeral: true });
//         }

//         const newPage = parseInt(page, 10);
//         const menu = musicQueueMenu(queue, newPage);
//         await interaction.update(menu);
//     }

//     return;
// });
