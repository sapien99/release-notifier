const Slack = require('./slack');
const Discord = require('./discord');
const Jenkins = require('./jenkins');
const Text = require('./text');

module.exports = class Notifier {

    notify(notifications, repository) {
        return Promise.all(notifications.map(notification => {
            if (notification.type == "slack") 
                return this.slack.notify(notification.url, repository);
            if (notification.type == "discord") 
                return this.discord.notify(notification.url, repository);
            if (notification.type == "jenkins") 
                return this.jenkins.notify(notification.url, repository);
            if (notification.type == "text") 
                return this.text.notify(notification.url, repository);
            return Promise.resolve(repository);
        }));
    }

    constructor(){
        this.slack = new Slack() ;
        this.discord = new Discord() ;
        this.jenkins = new Jenkins() ;
        this.text = new Text() ;
    }    

}
