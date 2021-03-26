'use strict';

const DESCRIPTIONS = require('./descriptions.json');
const Embed = require('../../classes/Embed');
const axios = require('axios');

module.exports = {
    name: 'Reactions',
    description: 'Anime GIFs are reactions',
    aliases: [],
    syntax: 'userinfo [@mention]',
    requiredPermissions: {
        user: [],
        client: []
    },
    async selfPopulate() { // Function to populate the `this.aliases` field
        if (!process.env.OTAKUGIFS_TOKEN) return console.length('Reactions not configured');

        // Get all reactions from otakugifs.xyz
        const response = await axios.get('https://api.otakugifs.xyz/gif/allreactions', {
            headers: {
                'x-api-key': process.env.OTAKUGIFS_TOKEN
            }
        });

        // Adding all reactions that were returned but only if they exist in the descriptions.json
        this.aliases = response.data.reactions.filter(r => DESCRIPTIONS[r]);

        // Showing which reactions have not been implemented yet in the descriptions.json
        if (this.aliases.length !== response.data.reactions.length)
            console.log(`Your descriptions.json is missing the ${response.data.reactions.filter(r => !DESCRIPTIONS[r]).join(', ')} reaction(s)`);

        console.log('Populated reactions');
    },
    async run({ message, cmd }) {

        // Requesting a random GIF from otakugifs.xyz
        const response = await axios.get(`https://api.otakugifs.xyz/gif/${cmd}`, {
            headers: {
                'x-api-key': process.env.OTAKUGIFS_TOKEN
            }
        });

        // <GuildMemberRoleManager>.color IS A ROLE INSTANCE ITS NOT A MISTAKE and YES it has .color property 
        let highestColorRole = message.member.roles.color ? message.member.roles.color.color : 0xffffff;

        let desc = DESCRIPTIONS[cmd]; // Object { single: [...], multiple: [...] }
        desc = message.mentions.members.size === 0 ? desc.single : desc.multiple; // Array of `single` or `multiple` [...]
        desc = desc[Math.floor(Math.random() * desc.length)]; // String, random choice from `single` or `multiple`

        // Replacing placeholders with the appropriate values
        desc = desc.replace(/--author/g, message.member.displayName);
        if (message.mentions.members.size !== 0)
            desc = desc.replace(/--target/g, Array.from(message.mentions.members.values()).map(m => m.displayName).join(', '));

        const embed = new Embed()
            .addDescription(desc)
            .setImage(response.data.url)
            .setColor(highestColorRole)
            .setFooter('Powered by otakugifs.xyz', 'https://otakugifs.b-cdn.net/assets/otakugifsLogo.png');

        message.channel.send(embed);
    }
};