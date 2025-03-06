const mineflayer = require('mineflayer');
const { Vec3 } = require('vec3');
const pathfinder = require('mineflayer-pathfinder');
const { GoalNear } = pathfinder.goals;

// Bot configuration
const config = {
  host: '192.168.1.50',     // Minecraft server IP
  port: 25565,           // Minecraft server port
  username: 'BobiBot',   // Bot username
  version: '1.21.4'      // Minecraft version
};

// Create the bot instance
const bot = mineflayer.createBot(config);

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

bot.on('chat', (username, message) => {
  // Ignore messages from the bot itself
  if (username === bot.username) return;
  
  console.log(`${username}: ${message}`);
  
  // Process commands (messages starting with ! or @bobibot)
  if (message.startsWith('!')) {
    const args = message.slice(1).trim().split(' ');
    const command = args.shift().toLowerCase();
    
    handleCommand(username, command, args);
  } else if (message.toLowerCase().includes('@bobibot')) {
    // Extract command after @bobibot
    const commandText = message.toLowerCase().split('@bobibot')[1].trim();
    if (commandText) {
      const args = commandText.split(' ');
      const command = args.shift().toLowerCase();
      
      handleCommand(username, command, args);
    }
  }
});

bot.on('kicked', (reason) => {
  console.log(`Bot was kicked: ${reason}`);
});

bot.on('error', (err) => {
  console.error(`Bot encountered an error: ${err}`);
});

// Add inventory ready event
bot.on('playerCollect', (collector, collected) => {
  if (collector.username === bot.username) {
    bot.chat('I collected an item!');
  }
});

// Command handler
function handleCommand(username, command, args) {
  switch (command) {
    case 'help':
      bot.chat('Available commands:');
      bot.chat('!help - Show this help message');
      bot.chat('!come - Make the bot come to you');
      bot.chat('!follow - Make the bot follow you');
      bot.chat('!stop - Stop following');
      bot.chat('!jump - Make the bot jump');
      bot.chat('!dig - Make the bot dig down');
      bot.chat('!collect - Collect nearby items');
      bot.chat('!equip <item> - Equip an item from inventory');
      bot.chat('!toss <item> [amount] - Toss items from inventory');
      bot.chat('!say <message> - Make the bot say something');
      bot.chat('!inventory - Show bot inventory');
      break;
      
    case 'come':
      const player = bot.players[username];
      if (!player || !player.entity) {
        bot.chat(`I can't see you, ${username}! Make sure I'm loaded in your area.`);
        return;
      }
      
      const playerPosition = player.entity.position;
      bot.chat(`Coming to you, ${username}!`);
      
      // Use GoalNear to get close to the player (within 2 blocks instead of 1)
      bot.pathfinder.setGoal(new GoalNear(playerPosition.x, playerPosition.y, playerPosition.z, 2));
      
      // Add a timeout to report if the bot is stuck
      setTimeout(() => {
        const currentPos = bot.entity.position;
        const distanceToPlayer = currentPos.distanceTo(playerPosition);
        if (distanceToPlayer > 3) {
          bot.chat(`I'm having trouble reaching you. I'm ${Math.round(distanceToPlayer)} blocks away.`);
        }
      }, 10000); // Check after 10 seconds
      break;
      
    case 'follow':
      const targetPlayer = bot.players[username];
      if (!targetPlayer || !targetPlayer.entity) {
        bot.chat(`I can't see you, ${username}!`);
        return;
      }
      
      bot.chat(`I'm following you, ${username}!`);
      
      // Store the interval ID to be able to stop following later
      bot.followInterval = setInterval(() => {
        const target = bot.players[username];
        if (!target || !target.entity) {
          bot.chat(`I lost sight of you, ${username}!`);
          clearInterval(bot.followInterval);
          return;
        }
        
        const pos = target.entity.position;
        bot.pathfinder.setGoal(new GoalNear(pos.x, pos.y, pos.z, 1));
      }, 1000);
      break;
      
    case 'stop':
      if (bot.followInterval) {
        clearInterval(bot.followInterval);
        bot.followInterval = null;
        bot.chat('I stopped following.');
      } else {
        bot.chat('I was not following anyone.');
      }
      break;
      
    case 'jump':
      bot.setControlState('jump', true);
      setTimeout(() => {
        bot.setControlState('jump', false);
      }, 500);
      break;
      
    case 'dig':
      // Dig the block below the bot
      const blockBelow = bot.blockAt(bot.entity.position.offset(0, -1, 0));
      if (blockBelow && blockBelow.name !== 'air') {
        bot.chat(`Digging ${blockBelow.name}...`);
        try {
          bot.dig(blockBelow)
            .then(() => {
              bot.chat('Finished digging!');
            })
            .catch((err) => {
              bot.chat(`Couldn't dig: ${err.message}`);
            });
        } catch (err) {
          bot.chat(`Error starting to dig: ${err.message}`);
        }
      } else {
        bot.chat('There is no block below me to dig!');
      }
      break;
      
    case 'collect':
      bot.chat('Looking for items to collect...');
      const nearbyItems = Object.values(bot.entities).filter(entity => 
        entity.type === 'object' && 
        entity.objectType === 'Item' &&
        entity.position.distanceTo(bot.entity.position) < 20
      );
      
      if (nearbyItems.length > 0) {
        const item = nearbyItems[0];
        bot.chat(`Found an item! Moving to collect it...`);
        bot.pathfinder.setGoal(new GoalNear(item.position.x, item.position.y, item.position.z, 1));
      } else {
        bot.chat('No items found nearby.');
      }
      break;
      
    case 'equip':
      if (args.length === 0) {
        bot.chat('Please specify an item to equip. Usage: !equip <item>');
        return;
      }
      
      const itemName = args.join(' ').toLowerCase();
      try {
        // Find the item in the bot's inventory
        const item = bot.inventory.items().find(item => 
          item.name.toLowerCase().includes(itemName)
        );
        
        if (!item) {
          bot.chat(`I don't have ${itemName} in my inventory.`);
          return;
        }
        
        // Try to equip the item
        bot.equip(item, 'hand')
          .then(() => {
            bot.chat(`Equipped ${item.name}!`);
          })
          .catch(err => {
            bot.chat(`Failed to equip ${item.name}: ${err.message}`);
          });
      } catch (err) {
        bot.chat(`Error equipping item: ${err.message}`);
      }
      break;
      
    case 'toss':
      if (args.length === 0) {
        bot.chat('Please specify an item to toss. Usage: !toss <item> [amount]');
        return;
      }
      
      const tossAmount = args.length > 1 && !isNaN(args[args.length - 1]) 
        ? parseInt(args.pop()) 
        : 1;
      const tossName = args.join(' ').toLowerCase();
      
      try {
        // Find the item in the bot's inventory
        const tossItem = bot.inventory.items().find(item => 
          item.name.toLowerCase().includes(tossName)
        );
        
        if (!tossItem) {
          bot.chat(`I don't have ${tossName} in my inventory.`);
          return;
        }
        
        // Toss the item
        bot.toss(tossItem.type, null, Math.min(tossAmount, tossItem.count))
          .then(() => {
            bot.chat(`Tossed ${Math.min(tossAmount, tossItem.count)} ${tossItem.name}!`);
          })
          .catch(err => {
            bot.chat(`Failed to toss ${tossItem.name}: ${err.message}`);
          });
      } catch (err) {
        bot.chat(`Error tossing item: ${err.message}`);
      }
      break;
      
    case 'say':
      if (args.length === 0) {
        bot.chat('Please specify a message. Usage: !say <message>');
        return;
      }
      
      const message = args.join(' ');
      bot.chat(message);
      break;
      
    case 'inventory':
      const inventoryItems = bot.inventory.items();
      if (inventoryItems.length === 0) {
        bot.chat('My inventory is empty.');
        return;
      }
      
      bot.chat('My inventory:');
      const itemCounts = {};
      
      // Count items by name
      inventoryItems.forEach(item => {
        if (itemCounts[item.name]) {
          itemCounts[item.name] += item.count;
        } else {
          itemCounts[item.name] = item.count;
        }
      });
      
      // Display inventory
      Object.keys(itemCounts).forEach(itemName => {
        bot.chat(`- ${itemName}: ${itemCounts[itemName]}`);
      });
      break;
      
    default:
      bot.chat(`Unknown command: ${command}. Type !help for available commands.`);
  }
}

// Handle errors and cleanup
process.on('SIGINT', () => {
  console.log('Bot is disconnecting...');
  bot.quit();
  process.exit();
});

console.log('Bot is starting...');

// Export the handleCommand function for use in other files
module.exports = { handleCommand }; 