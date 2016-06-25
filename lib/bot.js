'use strict';

const ImageManager = require('./ImageManager');
const TelegramBot = require('node-telegram-bot-api');
const token = '239421526:AAHmZVSMKdNduzRvm2LKFGbTELafXgKRrnk';
const bot = new TelegramBot(token, {polling: true});


//Matches /i [whatever]
bot.onText(/\/i (.+)/, (msg, match) => {
    let chatId = msg.chat.id;
    let term = match[1];
    let filePath = null;

    ImageManager
        .search(term)
        .then(src => ImageManager.download(src))  
        .then(filePath_ => filePath = filePath_)
        .then(_ => bot.sendPhoto(chatId, filePath))
        .catch(err => {
            bot.sendMessage(chatId, err.message || 'An internal error has occured');
            console.log(err);
        })
        .then(_ => ImageManager.delete(filePath))
});

