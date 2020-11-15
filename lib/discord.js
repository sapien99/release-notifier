const axios = require('axios');

module.exports = class DiscordNotifier {

    async notify(hookUrl, repository) {         
        // delay every request for 2 seconds because of only 5 requests per 2 seconds allowed in discord
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        const message = {
            username: 'notifier@rocklogic',
            content: `New Release of ${repository.name}: ${repository.latest}`,
            embeds: [{
                "description": ` Published ${repository.published} [here](${repository.url}).`                
            }]            
        };
        
        await delay(2000);                
        return axios.post(hookUrl, message);        
    }

}