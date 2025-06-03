import { Command } from "#base";
import { settings } from "#settings";
import { gemini } from "#tools";
import { createEmbed } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType, AttachmentBuilder, TextChannel } from "discord.js";
import { promptCR7 } from "#tools";

new Command({
    name: "cris",
    description: "send a question to Cristiano Ronaldo",
    type: ApplicationCommandType.ChatInput,
    dmPermission: false,
    options: [
        {
            name: "question",
            description: "The question you want to ask Cristiano Ronaldo",
            type: ApplicationCommandOptionType.String,
            required: true,
        }
    ],
    async run(interaction) {
        const { options, user, channel } = interaction;
        await interaction.deferReply();
        const userQuestion = options.getString("question", true);
        
        // Recuperar contexto de mensagens anteriores do CR7 no canal
        let contextMessages = "";
        if (channel instanceof TextChannel) {
            try {
                // Busca as últimas 10 mensagens do canal
                const messages = await channel.messages.fetch({ limit: 10 });
                
                // Filtra apenas mensagens do bot que são respostas do CR7
                const cr7Messages = messages.filter(msg => 
                    msg.author.id === interaction.client.user?.id && 
                    msg.embeds.length > 0 && 
                    msg.embeds[0].author?.name === "Cristiano Ronaldo"
                );
                
                // Construir contexto com as últimas interações
                if (cr7Messages.size > 0) {
                    contextMessages = "\n\nÚltimas interações no canal (use para contexto):\n";
                    
                    cr7Messages.forEach(msg => {
                        const embed = msg.embeds[0];
                        // Tenta extrair a pergunta anterior do embed
                        const description = embed.description || "";
                        const questionMatch = description.match(/\*\*([^*]+) perguntou:\*\* "([^"]+)"/);
                        
                        if (questionMatch) {
                            const [, prevUser, prevQuestion] = questionMatch;
                            contextMessages += `${prevUser} perguntou: "${prevQuestion}"\n`;
                            
                            // Remove a pergunta da descrição para pegar apenas a resposta
                            const answer = description.replace(questionMatch[0], "").trim();
                            contextMessages += `Sua resposta: ${answer.substring(0, 200)}${answer.length > 200 ? "..." : ""}\n\n`;
                        }
                    });
                }
            } catch (error) {
                console.error("Erro ao buscar mensagens anteriores:", error);
            }
        }
        
        // Usa a função promptCR7 passando a pergunta, o nome do usuário e o contexto
       const promptText = await promptCR7(userQuestion + contextMessages, user.username);
        const { response } = await gemini.text.generateContent(promptText);
    
    
        const result = gemini.getText(response);
        if (!result.success || !result.text) {
          const embed = createEmbed({
            color: settings.colors.danger,
            description: "Desculpe, não consegui processar sua pergunta. Tente novamente mais tarde.",
          });
            await interaction.editReply({ embeds: [embed] });
            return;
        }
        
        const maxLength = 3000;
        const texts: string[] = [];
        for (let i = 0; i < result.text.length; i += maxLength) {
            texts.push(result.text.slice(i, i + maxLength));
        }
        
        // Adicionar o avatar do CR7 e nome no embed, incluindo a pergunta do usuário
        const embed = createEmbed({
            color: settings.colors.success,
            author: {
                name: "Cristiano Ronaldo",
            },
            thumbnail: {
                url: "attachment://cr7.jpg"
            },
            // Mostrar a pergunta do usuário em negrito e depois a resposta
            description: `**${user.username} perguntou:** "${userQuestion}"\n\n${texts.shift()}`,
            footer: {
                text: `Respondendo a ${user.username}`
            }
        });
        
        const attachment = new AttachmentBuilder("./assets/images/cr7.jpg", { name: "cr7.jpg" });
        await interaction.editReply({ embeds: [embed], files: [attachment] });
        
        if(texts.length < 1) return;
        
        while(texts.length >= 1){
            const embed = createEmbed({
                color: settings.colors.primary,
                description: texts.shift(),
                author: {
                    name: "Cristiano Ronaldo",
                },
                thumbnail: {
                    url: "attachment://cr7.jpg"
                }
            });
            
            const attachment = new AttachmentBuilder("./assets/images/cr7.jpg", { name: "cr7.jpg" });
            await interaction.followUp({ embeds: [embed], files: [attachment] });
        }
    }
});