const axios = require('axios');
const _ = require('lodash');

module.exports = class JenkinsNotifier {

    async notify(hookUrl, repository) {                      
        if (!repository.jenkins || !repository.jenkins.job) return Promise.resolve({});                
        let url = `${hookUrl}/job/${repository.jenkins.job.name}/buildWithParameters?token=${repository.jenkins.job.token}`;        
        Object.keys(repository.jenkins.job.params).forEach(key => {
            const tmplFunc = _.template(repository.jenkins.job.params[key]);
            url += `&${key}=${tmplFunc(repository)}`
        });
        url += `&cause=triggered_by_release_watcher`;        

        // first get crumb, bail out if we dont get one        
        return axios.post(url, {}, { 
            auth: {
                username: repository.jenkins.user,
                password: repository.jenkins.token
            }
        });
    }

}