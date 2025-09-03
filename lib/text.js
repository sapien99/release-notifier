
module.exports = class TextNotifier {

    notify(hookUrl, repository) {      
        console.log(`New Release of ${repository.name}: ${repository.latest}`)
    }

}
