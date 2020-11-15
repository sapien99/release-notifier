const { Datastore } = require('@google-cloud/datastore');
const ds = new Datastore();

module.exports = class Datastore {

    async createOrUpdate(feed) {        
        const key = ds.key(['GithubNews', feed.owner]);
        const entity = {
            key: key,
            data: feed
        };
        return ds.upsert(entity);
    }

    async readSingle(owner) {        
        const key = ds.key(['GithubNews', owner]);
        const items = await ds.get(key);
        return Promise.resolve(items[0]);
    }

    async readMultiple() {        
        const query = ds.createQuery('GithubNews');     
        const result = await ds.runQuery(query);
        return result[0];        
    }

    async write(feed) {
        return ds.update(feed);
    }

}