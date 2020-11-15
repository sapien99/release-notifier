const fs = require('fs');
const os = require('os');
const path = require('path');

module.exports = class Datastore {
    
    async readSingle(owner) {        
        let fname = path.join(this.PATH, `${owner}.json`);        
        return new Promise((resolve,reject) => {
            if (!fs.existsSync(fname)) resolve();
            fs.readFile(fname, 'utf8', (err, content) => {
                if (err) return reject(err);
                return resolve(JSON.parse(content));
            });
        });        
    }

    async readMultiple() {    
        const readFile = (filename) => {
            return new Promise((resolve,reject) => {
                fs.readFile(path.join(this.PATH, filename), 'utf-8', (err, content) => {
                    if (err) return reject(err);
                    resolve(JSON.parse(content));
                });
            });
        };

        return new Promise((resolve,reject) => {
            const retval = [];   
            fs.readdir(this.PATH, async (err, filenames) => {
                if (err) return reject(err);
                for (const filename of filenames) {
                    retval.push(await readFile(filename));
                }
                resolve(retval);
            });            
        });
    }

    async write(feed) {        
        let fname = path.join(this.PATH, `${feed.owner}.json`);        
        return new Promise((resolve,reject) => {            
            fs.writeFile(fname, JSON.stringify(feed), 'utf8', (err) => {
                if (err) return reject(err);
                return resolve();
            });
        });        
    }

    async createOrUpdate(feed) {        
        return this.write(feed);
    }

    constructor() {
        this.PATH = "./profiles";
    }

}