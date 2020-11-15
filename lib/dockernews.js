const axios = require('axios');

const ONE_HOUR = 3600 * 1000; /* ms */

module.exports = class DockerNews {

    async inquireRepo(repository) {
        if (!repository._lastUpdate || ((new Date) - new Date(repository._lastUpdate)) > ONE_HOUR-1) {            
            const registry = repository.registry || 'https://hub.docker.com';
            let url = `${registry}/v2/repositories/${repository.name}/tags/`;            
            url += `?page_size=${repository.pagesize || 50}&ordering=last_updated`
            if (repository.filter)
                url += `&name=${repository.filter}`
            const pattern = new RegExp(repository.pattern || '^latest$');
            const options = {};            
            return axios.get(url, options)
                .then(resp => {
                    if (resp.status == 200) {
                        console.log(`${repository.name}`);
                        console.log(`  found:`);
                        resp.data.results.forEach((row) => {
                            console.log(`    ${row.name} ${row.last_updated}`);
                        })                        
                        resp.data.results.some(result => {                                                        
                            if (pattern.test(result.name)) {
                                repository.created = result.tag_last_updated;
                                repository.published = result.tag_last_pushed;
                                repository.latest = result.name;
                                repository.url = `https://hub.docker.com/r/${repository.name}/tags`;
                                repository._lastUpdate = new Date;                                
                                console.log(`  selected: ${result.name}`);
                                return repository;
                            }                             
                        });                                        
                        return repository;
                    }                
                });
        }
        return Promise.resolve(repository);
    }

    constructor() {
        this.googleToken = '';
    }    

};