/**
 * Example: How to add a custom command to the Minecraft bot
 * 
 * This example shows how to add a "dance" command that makes the bot
 * perform a simple dance by turning around and jumping.
 */

// To add this command to your bot, copy the code below into the handleCommand function in index.js

/*
case 'dance':
  bot.chat('I am dancing!');
  
  // Create a dance sequence
  const danceSequence = async () => {
    // Turn around
    for (let i = 0; i < 4; i++) {
      bot.look(bot.entity.yaw + Math.PI/2, 0);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Jump three times
    for (let i = 0; i < 3; i++) {
      bot.setControlState('jump', true);
      await new Promise(resolve => setTimeout(resolve, 200));
      bot.setControlState('jump', false);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    bot.chat('Dance complete!');
  };
  
  // Execute the dance sequence
  danceSequence().catch(err => {
    bot.chat(`Error while dancing: ${err.message}`);
  });
  break;
*/

// Don't forget to add the command to the help menu:
/*
case 'help':
  // ... existing help commands ...
  bot.chat('!dance - Make the bot perform a dance');
  break;
*/ 