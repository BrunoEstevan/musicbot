import { Command } from "#base";
import { res } from "#functions";
import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import process from "node:process";
import { exec } from "child_process";
import path from "path";

new Command({
    name: "restart",
    description: "Restart the bot (administrators only)",
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    options: [
        {
            name: "reason",
            description: "Reason to restart the bot",
            type: ApplicationCommandOptionType.String,
            required: false
        }
    ],
    async run(interaction) {
        const { options, user } = interaction;
        const reason = options.getString("reason") ?? "No reason specified";
        
        await interaction.reply(res.warning(`Bot is being restarted by ${user.username}.\nReason: ${reason}`));
        
        try {
            console.log(`Bot is being restarted by ${user.username}. Reason: ${reason}`);
            
            
            if (interaction.client.player) {
                
                const guilds = interaction.client.player.queues.cache.keys();
                for (const guildId of guilds) {
                    const queue = interaction.client.player.queues.cache.get(guildId);
                    if (queue) queue.delete();
                }
            }
            
            
            const workDir = process.cwd();
            
            
            const restartScript = path.join(workDir, "restart.bat");
            
           
            exec(`echo @echo off > "${restartScript}" && echo timeout /t 1 >> "${restartScript}" && echo cd "${workDir}" >> "${restartScript}" && echo npm run dev >> "${restartScript}" && start "" "${restartScript}"`, (error) => {
                if (error) {
                    console.error("Error creating restart script:", error);
                    return;
                }
                
                
                setTimeout(() => {
                    process.exit(0);
                }, 1000);
            });
        } catch (error) {
            console.error("Error restarting the bot:", error);
            await interaction.followUp(res.danger("An error occurred while trying to restart the bot."));
        }
    }
}); 