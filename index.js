const express = require('express');
const bodyParser = require('body-parser');
const GithubNews = require('./lib/githubnews');
const DockerNews = require('./lib/dockernews');
const Notifier = require('./lib/notifier');

class Main {

    async createOrUpdateFeed(feed) {        
        return this.datastore.createOrUpdate(feed);
    }

    async read(owner) {
        return this.datastore.readSingle(owner);
    }

    async readMultiple() {
        return this.datastore.readMultiple();
    }

    async write(feed) {
        return this.datastore.write(feed);
    }

    process(feed) {                
        return Promise.all(feed.repositories            
        .map((repository) => {
            if (repository.type === 'github')
                return this.ghn.inquireRepo(repository);
            if (repository.type === 'docker')
                return this.dockern.inquireRepo(repository);
        }))
        .then(async result => {            
            let results = [];
            let news = [];
            for (let i = 0; i < result.length; i++) {
                let repository = result[i];              
                if (!repository._current || repository._current != repository.latest) {                      
                    await this.notifier.notify(feed.notifications, repository)                    
                    repository._current = repository.latest;
                    news.push(repository);
                }
                results.push(repository);
            }
            feed.repositories = results;
            return Promise.resolve({feed:feed, news: news});
        });
    }
    
    async run(owner, persist) {   
        let feeds = [];
        feeds = owner ? [await this.read(owner)] : await this.readMultiple();
        if (owner && (feeds.length == 0 || !feeds[0]))
            return Promise.reject({message: 'profile not found'});            
        
        return Promise.all(feeds.map(feed => {                        
            return this.process(feed)
                .then((result) => {
                    if (persist !== 'false')
                        this.write(result.feed);
                    return { owner: result.feed.owner, news:result.news };
                })
            }
        )); 
    }

    constructor(){
        this.ghn = new GithubNews();
        this.dockern = new DockerNews();                
        let Datastore = null;
        Datastore = require('./lib/FileDataStore');
        this.datastore = new Datastore();
        this.notifier = new Notifier();    
    }    
}

const app = express();
app.use(bodyParser.json());
const main = new Main();

// health request
app.get('/health', (req, res) => {
    res.status(200).send('UP');
});

// create or update feed
async function createOrUpdateFeed(req,res) {
    if (!req.headers.apikey || req.headers.apikey !== process.env.APIKEY)
        return res.status(401).json({"success": false, "cause": "no or wrong apikey"});
    const contentType = req.headers["content-type"] || req.headers["Content-Type"];
    if (contentType !== 'application/json')
        return res.status(400).json({"success": false, "cause": "content-type not application/json"});
    const feed = req.body;
    feed.owner = req.params.owner;    
    let retval = await main.createOrUpdateFeed(feed);
    res.status(200).send(retval);
}
app.post('/feeds/:owner', async (req, res) => createOrUpdateFeed(req, res)); 
app.put('/feeds/:owner', async (req, res) => createOrUpdateFeed(req, res)); 
// get feed
async function getFeed(req, res) {
    if (!req.headers.apikey || req.headers.apikey !== process.env.APIKEY)
        return res.status(401).json({"success": false, "cause": "no or wrong apikey"});
    const data = await main.read(req.params.owner);
    if (data) return res.json(data);
    res.status(404).send('Not found');
}
app.get('/feeds/:owner', async (req, res) => getFeed(req, res));

// fetch news for feed - either for just one owner or for all users using cron
async function fetchNews(req, res) {    
    main.run(req.params && req.params.owner, req.query.persist)
        .then(news => {
            console.log('Sync successful', JSON.stringify(news));        
            res.status(200).json({"status":"success", "news": news});
        })
        .catch(error => {
            console.error(`Sync failed ${error.message}`, error);            
            res.status(200).json({"status":"failed", "cause": error.message});
        });
}
app.get('/feeds/:owner/update', (req, res) => {    
    if (!req.headers.apikey || req.headers.apikey !== process.env.APIKEY)
        return res.status(401).json({"success": false, "cause": "no or wrong apikey"});    
    return fetchNews(req, res);   
});
app.get('/github-news/cron/update', (req, res) => {
    if (process.env.CRON 
        && req.headers['x-appengine-cron'] !== "true" 
        && req.headers['x-appengine-queuename'] !== "__cron")
        return res.status(403).json({"status":"failed", "cause": "not cron"});
    return fetchNews(req, res);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}!`);
});
