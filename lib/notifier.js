const Slack = require('./slack');
const Discord = require('./discord');

module.exports = class Notifier {

    notify(notifications, repository) {
        return Promise.all(notifications.map(notification => {
            if (notification.type == "slack") 
                return this.slack.notify(notification.url, repository);
            if (notification.type == "discord") 
                return this.discord.notify(notification.url, repository);
            return Promise.resolve(repository);
        }));
    }

    constructor(){
        this.slack = new Slack() ;
        this.discord = new Discord() ;
    }    

}