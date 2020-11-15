const axios = require('axios');

module.exports = class SlackNotifier {

    notify(hookUrl, repository) {      
        const message = {
            text: `New Release of ${repository.name}: ${repository.latest}`,
            mrkdwn: true,
            attachments: [
            {
                title: 'Release',
                title_link: repository.url,
                fields: [
                {
                    title: 'Published',
                    value: `${repository.published}`
                }            
                ]
            }
            ]
        };
        return axios.post(hookUrl, message);      
    }

}