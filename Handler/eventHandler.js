const { getGroupSetting, getSudoUsers } = require("../Database/config");

const Events = async (client, event, pict) => {
    const botJid = await client.decodeJid(client.user.id);

    try {
        const metadata = await client.groupMetadata(event.id);
        const participants = event.participants;
        const desc = metadata.desc || "Some boring group, I guess.";
        const groupSettings = await getGroupSetting(event.id);
        const eventsEnabled = groupSettings?.events === true;
        const antidemote = groupSettings?.antidemote === true;
        const antipromote = groupSettings?.antipromote === true;
        const sudoUsers = await getSudoUsers();
        const currentDevs = Array.isArray(sudoUsers)
            ? sudoUsers.map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net")
            : [];

        for (const participant of participants) {
            let dpUrl = pict;
            try {
                dpUrl = await client.profilePictureUrl(participant, "image");
            } catch {
                dpUrl = pict; // Fallback to default pic if user has no DP
            }

            if (eventsEnabled && event.action === "add") {
                try {
                    const userName = participant.split("@")[0];
                    const welcomeText = 
`╭───「 💉 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃 𝐖𝐞𝐥𝐜𝐨𝐦𝐞 💉 」
│ 😈 *Yo, @${userName}, welcome to the chaos!*  
│
│ 🤖 *Bot*: 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃 𝐕3
│ 🦁 *Group*: ${metadata.subject}
│ 📜 *Desc*: ${desc}
│
│ 😼 *Try not to get roasted too hard, newbie!*
╰───「 🔥 Powered by 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃  🔥 」`;

                    await client.sendMessage(event.id, {
                        image: { url: dpUrl },
                        caption: welcomeText,
                        mentions: [participant]
                    });
                } catch {
                    // Keep it chill, no error spam
                }
            } else if (eventsEnabled && event.action === "remove") {
                try {
                    const userName = participant.split("@")[0];
                    const leaveText = 
`╭───「 Venom-x 」
│ 😎 *Later, @${userName}! Couldn’t handle the heat?*  
│ 🦁 *Group*: ${metadata.subject}
│
│ 😜 *Don’t cry, we’ll survive without ya!*
╰───「 🔥 Dave Tech 🔥 」`;

                    await client.sendMessage(event.id, {
                        image: { url: dpUrl },
                        caption: leaveText,
                        mentions: [participant]
                    });
                } catch {
                    // No whining about errors
                }
            }

            if (event.action === "demote" && antidemote) {
                try {
                    if (
                        event.author === metadata.owner ||
                        event.author === botJid ||
                        event.author === participant ||
                        currentDevs.includes(event.author)
                    ) {
                        await client.sendMessage(event.id, {
                            text: 
`╭───「 venom-x」
│ 😤 *Big shot @${participant.split("@")[0]} got knocked down!*  
│ 🦁 *Group*: ${metadata.subject}
╰───「 🔥 Dave Tech 🔥 」`,
                            mentions: [participant]
                        });
                        return;
                    }

                    await client.groupParticipantsUpdate(event.id, [event.author], "demote");
                    await client.groupParticipantsUpdate(event.id, [participant], "promote");

                    await client.sendMessage(event.id, {
                        text: 
`╭───「 venom-x」
│ 😏 *Nice try, @${event.author.split("@")[0]}! Demoted for messing with @${participant.split("@")[0]}!*  
│ 🦁 *Group*: ${metadata.subject}
│ 📜 *Rule*: Antidemote’s on, loser. Only the big dogs can demote!
╰───「 🔥 Dave Tech 🔥 」`,
                        mentions: [event.author, participant]
                    });
                } catch {
                    // Errors? Pfft, we don’t care
                }
            } else if (event.action === "promote" && antipromote) {
                try {
                    if (
                        event.author === metadata.owner ||
                        event.author === botJid ||
                        event.author === participant ||
                        currentDevs.includes(event.author)
                    ) {
                        await client.sendMessage(event.id, {
                            text: 
`╭───「 venom-x」
│ 😎 *Big dog @${participant.split("@")[0]} just leveled up!*  
│ 🦁 *Group*: ${metadata.subject}
╰───「 🔥 Dave Tech 🔥 」`,
                            mentions: [participant]
                        });
                        return;
                    }

                    await client.groupParticipantsUpdate(event.id, [event.author, participant], "demote");

                    await client.sendMessage(event.id, {
                        text: 
`╭───「 Venom-x」
│ 😆 *Oof, @${event.author.split("@")[0]}! Demoted for trying to boost @${participant.split("@")[0]}!*  
│ 🦁 *Group*: ${metadata.subject}
│ 📜 *Rule*: @${participant.split("@")[0]} got yeeted too. Antipromote’s on, only the elite can promote!
╰───「 🔥 Dave Tech🔥 」`,
                        mentions: [event.author, participant]
                    });
                } catch {
                    // Errors are for the weak
                }
            }
        }
    } catch {
        try {
            await client.sendMessage(event.id, {
                text: 
`╭───「 venom-x」
│ 😬 *Yikes, something broke. Blame the group vibes!*  
│ 🦁 *Group*: ${metadata.subject}
╰───「 🔥 Dave Tech 🔥 」`
            });
        } catch {
            // If this fails, we’re just cursed
        }
    }
};

module.exports = Events;