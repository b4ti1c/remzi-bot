const _ = require('lodash');


class GunaydinManager {
    constructor() {
        this.greetingDB = {};
    }

    greetingAvailable(chatId) {
        if (!this.greetingDB[chatId]) return true;

        const lastGreetingDay = this.greetingDB[chatId];
        const today = this.getToday();

        return today != lastGreetingDay;
    }

    greeted(chatId) {
        this.greetingDB[chatId] = this.getToday();
    }

    fetchAGreeting() {
        return _.sample(['Günaydın', 'ggg', 'gunaydin', 'G', 'günaydın', 'Gunaydin']);
    }

    getToday() {
        const now = new Date();
        const day = now.getDate();
        const today = now.getHours() < 5 ? day - 1 : day;

        return today;
    }
}

module.exports = new GunaydinManager();
