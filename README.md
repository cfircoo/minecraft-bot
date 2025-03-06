# Minecraft Bot

A simple Minecraft bot built with Node.js and Mineflayer that can respond to commands in the game chat.

## Prerequisites

- Node.js (v14 or higher)
- A Minecraft Java Edition server (version 1.21.4 recommended)

## Installation

1. Clone this repository or download the files
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

## Configuration

Edit the `config` object in `index.js` to match your Minecraft server settings:

```javascript
const config = {
  host: 'localhost',     // Change to your Minecraft server IP
  port: 25565,           // Change if your server uses a different port
  username: 'BobiBot',   // Change the bot's username if desired
  version: '1.21.4'      // Change to match your Minecraft server version
};
```

## Usage

### Basic Usage

1. Start your Minecraft server
2. Run the bot:

```bash
npm start
# or
node index.js
```

### Connect to a Specific Server

You can use the connect.js script to connect to a specific server without modifying the config:

```bash
node connect.js <host> <port> <username> <version>
```

Example:
```bash
node connect.js mc.example.com 25565 BobiBot 1.21.4
```

3. Join your Minecraft server
4. Interact with the bot using commands in the chat

## Available Commands

You can interact with the bot in two ways:
1. Using the `!` prefix: `!command [arguments]`
2. Mentioning the bot: `@BobiBot command [arguments]`

Available commands:
- `!help` or `@BobiBot help` - Show available commands
- `!come` or `@BobiBot come` - Make the bot come to your position
- `!follow` or `@BobiBot follow` - Make the bot follow you
- `!stop` or `@BobiBot stop` - Stop the bot from following
- `!jump` or `@BobiBot jump` - Make the bot jump
- `!dig` or `@BobiBot dig` - Make the bot dig the block below it
- `!collect` or `@BobiBot collect` - Make the bot collect nearby items
- `!equip <item>` or `@BobiBot equip <item>` - Equip an item from inventory
- `!toss <item> [amount]` or `@BobiBot toss <item> [amount]` - Toss items from inventory
- `!say <message>` or `@BobiBot say <message>` - Make the bot say something
- `!inventory` or `@BobiBot inventory` - Show bot inventory

## Extending the Bot

To add more commands, edit the `handleCommand` function in `index.js`. Add a new case to the switch statement with your command logic.

Check the `examples` directory for sample code showing how to add custom commands.

## License

MIT 