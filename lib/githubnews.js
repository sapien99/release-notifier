const axios = require('axios');

const ONE_HOUR = 3600 * 1000; /* ms */

module.exports = class GithubNews {

    inquireRepo(repository) {
        if (!repository._lastUpdate || ((new Date) - new Date(repository._lastUpdate)) > ONE_HOUR) {
            const url = `https://api.github.com/repos/${repository.name}/releases/latest`
            return axios.get(url)
                .then(resp => {
                    if (resp.status == 200) {                    
                        repository.created = resp.data.created_at;
                        repository.published = resp.data.published_at;
                        repository.latest = resp.data.tag_name;                    
                        repository.url = resp.data.url;
                        repository._lastUpdate = new Date;
                        return repository;
                    }                
                });
        }
        return Promise.resolve(repository);
    }

    constructor(){        
    }    

};