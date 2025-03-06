/**
 * Connect script for Minecraft Bot
 * 
 * This script allows you to connect to a specific Minecraft server using command line arguments.
 * 
 * Usage:
 * node connect.js <host> <port> <username> <version>
 * 
 * Example:
 * node connect.js mc.example.com 25565 BobiBot 1.19.2
 */

const mineflayer = require('mineflayer');
const pathfinder = require('mineflayer-pathfinder');
const { Vec3 } = require('vec3');
const { GoalNear } = pathfinder.goals;

// Get command line arguments
const args = process.argv.slice(2);
const host = args[0] || '168.192.1.50';
const port = parseInt(args[1]) || 25565;
const username = args[2] || 'BobiBot';
const version = args[3] || '1.20.1';

console.log(`Connecting to ${host}:${port} as ${username} (version: ${version})`);

// Bot configuration
const config = {
  host,
  port,
  username,
  version
};

// Create the bot instance
const bot = mineflayer.createBot(config);

// Patch for the vehicle.passengers undefined error
const originalEmit = bot._client.emit;
bot._client.emit = function(name, ...args) {
  try {
    return originalEmit.apply(this, [name, ...args]);
  } catch (error) {
    if (error.message && error.message.includes("Cannot read properties of undefined (reading 'passengers')")) {
      console.log('Caught and handled vehicle.passengers undefined error');
      // Skip this problematic packet
      return;
    }
    throw error;
  }
};

// Load pathfinder plugin
bot.loadPlugin(pathfinder.pathfinder);

// Bot events
bot.on('spawn', () => {
  console.log(`Bot spawned in the world!`);
  bot.chat('Hello, I am BobiBot! Type !help to see available commands.');
  
  // Initialize pathfinder
  const mcData = require('minecraft-data')(bot.version);
  bot.pathfinder.setMovements(new pathfinder.Movements(bot, mcData));
});

// Import the command handler from index.js
const { handleCommand } = require('./index.js');

bot.on('chat', (username, message) => {
  // Ignore messages from the bot itself
  if (username === bot.username) return;
  
  console.log(`${username}: ${message}`);
  
  // Process commands (messages starting with !)
  if (message.startsWith('!')) {
    const args = message.slice(1).trim().split(' ');
    const command = args.shift().toLowerCase();
    
    try {
      handleCommand(username, command, args);
    } catch (err) {
      console.error(`Error handling command: ${err.message}`);
      bot.chat(`Error executing command: ${err.message}`);
    }
  }
});

bot.on('kicked', (reason, loggedIn) => {
  console.log(`Bot was kicked: ${JSON.stringify(reason)}`);
  console.log(`Logged in: ${loggedIn}`);
});

bot.on('error', (err) => {
  console.error(`Bot encountered an error: ${err.message}`);
  console.error(err.stack);
});

// Handle errors and cleanup
process.on('SIGINT', () => {
  console.log('Bot is disconnecting...');
  bot.quit();
  process.exit();
}); 