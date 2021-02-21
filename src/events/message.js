const handleError = (e, m) => {
    // 404 Usually happens when member.fetch,
    if (e.httpStatus === 404) m.channel.send('Didn\'t find what you were looking for');
    // 403 Usually happens when channel.send,
    // BE CAREFUL, you might not see errors in your console because of this line
    else if (e.httpStatus === 403) return;
    // All other errors
    else {
        console.log(e)
        m.channel.send('Unknown Error');
    }
};

module.exports = (Kiyo, message) => {
    if (message.author.bot || message.channel.type === 'dm') return;
    if (!message.content.toLowerCase().startsWith(Kiyo.globalPrefix)) return;

    const [cmd, ...args] = message.content
        .toLowerCase()
        .slice(Kiyo.globalPrefix.length)
        .split(/\s+/g);

    for (const [commandName, command] of Kiyo.commands) {
        if (commandName !== cmd) continue;

        command.run({ message, Kiyo, args }).catch(e => handleError(e, message));
    };
};