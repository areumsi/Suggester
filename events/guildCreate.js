const { dbQuery, dbQueryAll, guildLog } = require("../coreFunctions.js");
const { release } = require("../config.json");
module.exports = async (Discord, client, guild) => {
	let qServerDB = await dbQuery("Server", guild.id);
	let qSuggestionDB = await dbQueryAll("Suggestion", guild.id);
	if (qServerDB && qServerDB.blocked) {
		await guild.leave();
		return guildLog(`:no_entry: I was added to blacklisted guild **${guild.name}** (${guild.id}) and left`, client);
	}

	let enforceWhitelist = [
		"canary",
		"special",
		"premium"
	];
	if ((enforceWhitelist.includes(release)) && !qServerDB.whitelist) {
		await guild.leave();
		return guildLog(`:no_entry: I was added to non-whitelisted guild **${guild.name}** (${guild.id}) and left`, client);
	}

	if (qSuggestionDB.length > 0) {
		if (qServerDB.config.suggestion &&
			qServerDB.config.channels.suggestions &&
			client.channels.find((c) => c.id === qServerDB.config.suggestion)) {
			qSuggestionDB.forEach((suggestion) => {
				client.channels.find((c) => c.id === qSuggestionDB.config.channels.suggestions)
					.fetchMessage(suggestion.messageId)
					.catch((err) => {
						throw new Error(err);
					});
			});
		}
	}

	await guildLog(`:inbox_tray: New Guild: **${guild.name}** (${guild.id})\n>>> **Owner:** ${guild.owner.user.tag}\n**Member Count:** ${guild.memberCount}`, client);
};
