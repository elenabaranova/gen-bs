'use strict';

const Request = require('superagent');

class UsersClient {
    constructor(config) {
        this.addUrl = `${config.usersClient.httpScheme}://${config.usersClient.host}:${config.usersClient.port}/api${'/users'}`;
    }

    addAsync(languId, user) {
        return new Promise((resolve, reject) => {
            Request
                .post(this.addUrl)
                .send(user)
                .then((res) => resolve(res.body))
                .catch((error) => reject(error));
        });
    }
}

module.exports = UsersClient;