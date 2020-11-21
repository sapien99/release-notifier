const axios = require('axios');
const _ = require('lodash');

module.exports = class JenkinsNotifier {

    notify(hookUrl, repository) {                      
        if (!repository.jenkins) return Promise.resolve({});        
        if (!repository.jenkins.buildParams) buildParams = {};
        let url = `${hookUrl}/job/${repository.jenkins.job}/buildWithParameters?token=${repository.jenkins.token}`;        
        Object.keys(repository.jenkins.buildParams).forEach(key => {
            const tmplFunc = _.template(repository.jenkins.buildParams[key]);
            url += `&${key}=${tmplFunc(repository)}`
        });
        url += `&cause=triggered_by_release_watcher`;        
        return axios.post(url, {});
    }

}