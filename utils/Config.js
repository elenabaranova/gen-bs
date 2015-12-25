'use strict';

const ENV = process.env;

const SETTINGS = {
    port: ENV.PORT || 5000,
    applicationServer: {
        host: ENV.AS_HOST || 'localhost',
        port: ENV.AS_WS_PORT || 8888,
        sessionHeader: ENV.WS_SESSION_HEADER || 'X-Session-Id'
    },
    database: {
        host: ENV.WS_DATABASE_SERVER || 'localhost',
        user: ENV.WS_DATABASE_USER || 'postgres',
        password: ENV.WS_DATABASE_PASSWORD || 'zxcasdqwe',
        databaseName: ENV.WS_DATABASE_NAME || 'genomixdb'
    }
};

module.exports = SETTINGS;