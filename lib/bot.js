'use strict';

const ImageManager = require('./ImageManager');
const TelegramBot = require('node-telegram-bot-api');
const token = '230227294:AAFydBVonInUExWJjtFMPFsnY63c6cFzk0U';
const bot = new TelegramBot(token, {polling: true});


//Matches /i [whatever]
bot.onText(/\/[it] (.+)/, (msg, match) => {
    let chatId = msg.chat.id;
    let term = match[1];
    let filePath = null;

    console.log('Searching ' + term);

    ImageManager
        .search(term)
        .then(src => ImageManager.download(src))  
        .then(filePath_ => filePath = filePath_)
        .then(_ => bot.sendPhoto(chatId, filePath))
        .catch(err => {
           // bot.sendMessage(chatId, err.message || 'An internal error has occured');
            console.log(err);
       
	    let filePath__ = null;

            ImageManager
                .search('nah')
                .then(src => ImageManager.download(src))  
                .then(filePath_ => filePath__ = filePath_)
                .then(_ => bot.sendPhoto(chatId, filePath__))
		.catch(err => { console.log('Fuck a double error', err); })
                .then(_ => ImageManager.delete(filePath__));
	 })
        .then(_ => ImageManager.delete(filePath))
});

