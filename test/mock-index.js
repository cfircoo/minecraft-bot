// This is a mock version of index.js for testing purposes

// Mock handleCommand function
function handleCommand(username, command, args) {
  switch (command) {
    case 'help':
      global.bot.chat('Available commands:');
      global.bot.chat('!help - Show this help message');
      global.bot.chat('!come - Make the bot come to you');
      global.bot.chat('!follow - Make the bot follow you');
      global.bot.chat('!stop - Stop following');
      global.bot.chat('!jump - Make the bot jump');
      global.bot.chat('!dig - Make the bot dig down');
      global.bot.chat('!collect - Collect nearby items');
      global.bot.chat('!equip <item> - Equip an item from inventory');
      global.bot.chat('!toss <item> [amount] - Toss items from inventory');
      global.bot.chat('!say <message> - Make the bot say something');
      global.bot.chat('!inventory - Show bot inventory');
      break;
      
    case 'come':
      const player = global.bot.players[username];
      if (!player || !player.entity) {
        global.bot.chat(`I can't see you, ${username}! Make sure I'm loaded in your area.`);
        return;
      }
      
      const playerPosition = player.entity.position;
      global.bot.chat(`Coming to you, ${username}!`);
      
      // Use GoalNear to get close to the player (within 2 blocks instead of 1)
      global.bot.pathfinder.setGoal(new global.pathfinder.goals.GoalNear(playerPosition.x, playerPosition.y, playerPosition.z, 2));
      break;
      
    case 'follow':
      const targetPlayer = global.bot.players[username];
      if (!targetPlayer || !targetPlayer.entity) {
        global.bot.chat(`I can't see you, ${username}!`);
        return;
      }
      
      global.bot.chat(`I'm following you, ${username}!`);
      
      // Store the interval ID to be able to stop following later
      global.bot.followInterval = global.setInterval(() => {
        const target = global.bot.players[username];
        if (!target || !target.entity) {
          global.bot.chat(`I lost sight of you, ${username}!`);
          global.clearInterval(global.bot.followInterval);
          return;
        }
        
        const pos = target.entity.position;
        global.bot.pathfinder.setGoal(new global.pathfinder.goals.GoalNear(pos.x, pos.y, pos.z, 1));
      }, 1000);
      break;
      
    case 'stop':
      if (global.bot.followInterval) {
        global.clearInterval(global.bot.followInterval);
        global.bot.followInterval = null;
        global.bot.chat('I stopped following.');
      } else {
        global.bot.chat('I was not following anyone.');
      }
      break;
      
    case 'jump':
      global.bot.setControlState('jump', true);
      setTimeout(() => {
        global.bot.setControlState('jump', false);
      }, 500);
      break;
      
    case 'dig':
      // Dig the block below the bot
      const blockBelow = global.bot.blockAt(global.bot.entity.position.offset(0, -1, 0));
      if (blockBelow && blockBelow.name !== 'air') {
        global.bot.chat(`Digging ${blockBelow.name}...`);
        try {
          global.bot.dig(blockBelow)
            .then(() => {
              global.bot.chat('Finished digging!');
            })
            .catch((err) => {
              global.bot.chat(`Couldn't dig: ${err.message}`);
            });
        } catch (err) {
          global.bot.chat(`Error starting to dig: ${err.message}`);
        }
      } else {
        global.bot.chat('There is no block below me to dig!');
      }
      break;
      
    case 'collect':
      global.bot.chat('Looking for items to collect...');
      const nearbyItems = Object.values(global.bot.entities).filter(entity => 
        entity.type === 'object' && 
        entity.objectType === 'Item' &&
        entity.position.distanceTo(global.bot.entity.position) < 20
      );
      
      if (nearbyItems.length > 0) {
        const item = nearbyItems[0];
        global.bot.chat(`Found an item! Moving to collect it...`);
        global.bot.pathfinder.setGoal(new global.pathfinder.goals.GoalNear(item.position.x, item.position.y, item.position.z, 1));
      } else {
        global.bot.chat('No items found nearby.');
      }
      break;
      
    case 'equip':
      if (args.length === 0) {
        global.bot.chat('Please specify an item to equip. Usage: !equip <item>');
        return;
      }
      
      const itemName = args.join(' ').toLowerCase();
      try {
        // Find the item in the bot's inventory
        const item = global.bot.inventory.items().find(item => 
          item.name.toLowerCase().includes(itemName)
        );
        
        if (!item) {
          global.bot.chat(`I don't have ${itemName} in my inventory.`);
          return;
        }
        
        // Try to equip the item
        global.bot.equip(item, 'hand')
          .then(() => {
            global.bot.chat(`Equipped ${item.name}!`);
          })
          .catch(err => {
            global.bot.chat(`Failed to equip ${item.name}: ${err.message}`);
          });
      } catch (err) {
        global.bot.chat(`Error equipping item: ${err.message}`);
      }
      break;
      
    case 'toss':
      if (args.length === 0) {
        global.bot.chat('Please specify an item to toss. Usage: !toss <item> [amount]');
        return;
      }
      
      const tossAmount = args.length > 1 && !isNaN(args[args.length - 1]) 
        ? parseInt(args.pop()) 
        : 1;
      const tossName = args.join(' ').toLowerCase();
      
      try {
        // Find the item in the bot's inventory
        const tossItem = global.bot.inventory.items().find(item => 
          item.name.toLowerCase().includes(tossName)
        );
        
        if (!tossItem) {
          global.bot.chat(`I don't have ${tossName} in my inventory.`);
          return;
        }
        
        // Toss the item
        global.bot.toss(tossItem.type, null, Math.min(tossAmount, tossItem.count))
          .then(() => {
            global.bot.chat(`Tossed ${Math.min(tossAmount, tossItem.count)} ${tossItem.name}!`);
          })
          .catch(err => {
            global.bot.chat(`Failed to toss ${tossItem.name}: ${err.message}`);
          });
      } catch (err) {
        global.bot.chat(`Error tossing item: ${err.message}`);
      }
      break;
      
    case 'say':
      if (args.length === 0) {
        global.bot.chat('Please specify a message. Usage: !say <message>');
        return;
      }
      
      const message = args.join(' ');
      global.bot.chat(message);
      break;
      
    case 'inventory':
      const inventoryItems = global.bot.inventory.items();
      if (inventoryItems.length === 0) {
        global.bot.chat('My inventory is empty.');
        return;
      }
      
      global.bot.chat('My inventory:');
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
        global.bot.chat(`- ${itemName}: ${itemCounts[itemName]}`);
      });
      break;
      
    default:
      global.bot.chat(`Unknown command: ${command}. Type !help for available commands.`);
  }
}

module.exports = { handleCommand }; 