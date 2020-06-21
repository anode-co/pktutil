# pktutil

A mattermost bot for getting information about PKT chain.

## Setup guide

1. Decide on a trigger word, you can type `/mytrigger` in a chat and if you get the message:
`Command with a trigger of '/mytrigger' not found. Click here to send as a message.` then that trigger is not being used.
2. Setup the bot, type `npm install` to install all of the dependencies
3. Copy config.example.js to config.js and edit it
    * Set "trigger" to your chosen trigger word (without the /)
    * Set "user" and "pass" based on the rpcuser and rpcpass fields in `~/.pktd/pktd.conf` file
    * Set "httpPort" to a port which you are not using
4. Launch the bot `node ./pktutil.js`
5. In your mattermost desktop or web client:
    1. Click the hamburger menu in the upper-left near your avatar
    2. Click on "Integrations"
    3. Click on "Slash Commands"
    4. Click "Add Slash Command"
    5. Enter a meaningful title and description
    6. Enter the trigger word which you decided on
    7. Set the "Request URL" to your http server
    8. Set the "Response Username" to the name which you would like to use for your bot
    9. Set the "Response Icon" to an image which you would like to use for your bot's avatar
6. Check the Autocomplete box so people can discover your command
7. Under "Autocomplete Hint", you probably want to enter `[command]` since your bot has multiple commands
8. Under "Autocomplete Description", enter the available commands, e.g.
`Available commands: diff, mempool, height, help. Type /pkt help for further explanation.`
9. Test your bot, type `/mytrigger help` in any channel