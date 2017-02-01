'use strict';

const _ = require('lodash');
const https = require('https');
const querystring = require('querystring');
const ImageManager = require('./ImageManager');
const GunaydinManager = require('./GunaydinManager');
const TelegramBot = require('node-telegram-bot-api');
const token = '230227294:AAFydBVonInUExWJjtFMPFsnY63c6cFzk0U';
const bot = new TelegramBot(token, {polling: true});


//Matches /i [whatever]
bot.onText(/\/[it] (.+)/, (msg, match) => {
    let chatId = msg.chat.id;
    let term = match[1];
    let filePath = null;

    console.log('Searching image: ' + term);

    ImageManager
        .search(term)
        .then(src => ImageManager.download(src))
        .then(filePath_ => filePath = filePath_)
        .then(_ => bot.sendPhoto(chatId, filePath))
        .catch(err => {
           // bot.sendMessage(chatId, err.message || 'An internal error has occured');
            console.log(err);

            bot
                .sendPhoto(chatId, ImageManager.nahPath)
                .catch(err => { console.log('Fuck a double error', err); });
	 })
    .then(_ => ImageManager.delete(filePath))
});


//Matches /w [whatever]
bot.onText(/\/[w] (.+)/, (msg, match) => {
    let chatId = msg.chat.id;
    let term = match[1];

    console.log('Searching on wiki: ' + term);

    const query = querystring.stringify({
        action: 'query', format: 'json', prop: 'extracts', generator: 'search',
        exsentences: 2, exlimit: 20, exintro: 1, explaintext: 3,
        exsectionformat: 'plain', gsrsearch: term, gsrlimit: 10
    });

    const wikiQueryUrl = 'https://en.wikipedia.org/w/api.php?' + query;

    new Promise((resolve, reject) => {
        https.get(wikiQueryUrl, function(response) {
            let body = '';
            response.on('error', reject);
            response.on('data', chunk => body += chunk);
            response.on('end', () => {
                let data;
                try { data = JSON.parse(body); }
                catch (ex) { data = body; }

                resolve(data);
            });
        })
        .on('error', reject);
    })
    .then(response => {
        const page = _
            .chain(response.query.pages)
            .values()
            .filter('extract')
            .sortBy('index')
            .head()
            .value();

        if (page) return page;

        return _.head(_.values(response.query.pages));
    })
    .then(page => {
        const msg = `More info about *${term}* can be found on [${page.title}](http://en.wikipedia.org/?curid=${page.pageid})`;
        return bot.sendMessage(chatId, msg, {parse_mode: 'Markdown'});
    })
    .catch(err => {
        bot
            .sendMessage(chatId, 'ya bi siktir git')
            .catch(err => { console.log('Fuck a double error', err); });
    });
});


//Matches gunadyin variations
bot.onText(/^(\/?g+|\/?g(u|ü)nayd(i|ı|İ)n)$/i, (msg, match) => {
    let chatId = msg.chat.id;
    let term = match[1];

    console.log('Captured gunaydin request: ' + term);

    if (GunaydinManager.greetingAvailable(chatId)) {
        const msg = GunaydinManager.fetchAGreeting();
        GunaydinManager.greeted(chatId);

        const delay = Math.round(Math.random() * 15) + 5;
        console.log(`Will greet in ${delay} seconds`);

        setTimeout(() => {
            bot
                .sendMessage(153838828, msg)
                .catch(err => { console.log('Fuck a double error', err); });
        }, delay * 1000);
    }
});

