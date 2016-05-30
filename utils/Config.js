'use strict';

const ENV = process.env;

const SETTINGS = {
    port: ENV.GEN_WS_PORT || 5000,
    disableRequestLimits: ENV.GEN_WS_DISABLE_REQUEST_LIMITS || false,
    enableCORS: ENV.GEN_WS_CORS_ENABLE || true,
    // If true, the 'callbackPort' variable will be supported in the SessionsController.
    // This setting is very security-critical and should be set to false in production.
    enableAuthCallbackPorts: ENV.GEN_WS_ENABLE_AUTH_CALLBACK_PORTS || false,
    // If true, Redis host will be ignored in the data received from AS, and localhost
    // will always be used. This is convenient when port forwarding to Redis server is used.
    forceOverrideRedisToLocalhost: ENV.GEN_WS_FORCE_OVERRIDE_REDIS_TO_LOCALHOST || false,
    // If true, samples will not be marked as analyzed, and there will be no fee from the user.
    disableMakeAnalyzed: ENV.GEN_WS_DISABLE_MAKE_ANALYZED || true,
    // If enabled, demo users will have rights to create and delete filters and samples.
    // These filters and samples will be shared between them, as there is only one demo-user in the system.
    enableFullRightsForDemoUsers: ENV.GEN_WS_ENABLE_FULL_RIGHTS_FOR_DEMO_USERS || false,
    samplesUpload: {
        path: ENV.GEN_WS_UPLOAD_PATH || __dirname + '/../uploads/', // Temporary path for uploaded samples.
        maxSizeInBytes: ENV.GEN_WS_UPLOAD_MAX_SIZE || 25 * 1024 * 1024, // Max size of the uploaded sample.
        maxCount: ENV.GEN_WS_UPLOAD_MAX_COUNT || 5 // Max parallel uploads count.
    },
    savedFilesUpload: {
        maxSizeInBytes: ENV.GEN_WS_SAVED_FILES_MAX_SIZE || 1024 * 1024,
        maxCount: ENV.GEN_WS_SAVED_FILES_MAX_COUNT || 2,
        path: ENV.GEN_WS_SAVED_FILES_PATH || __dirname + '/../uploads/',
        // Object storage type to use. Supported values: 's3', 'oss'
        objectStorageType: ENV.GEN_WS_OBJECT_STORAGE_TYPE || 's3',
        amazon: {
            amazonS3BucketName: ENV.GEN_WS_S3_BUCKET_NAME || 'wstestbucket-ae7b342f-9ec0-45ad-aa55-2298287b422b',
            amazonS3AccessKeyId: ENV.GEN_WS_S3_ACCESS_KEY_ID || 'AKIAJKA73IEQR3ECGPVA',
            amazonS3AccessKeySecret: ENV.GEN_WS_S3_ACCESS_KEY_SECRET || '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',
            amazonS3RegionName: ENV.GEN_WS_S3_REGION_NAME || 'us-east-1'
        },
        oss: {
            ossBucketName: ENV.GEN_WS_OSS_BUCKET_NAME || 'testwsgenomix',
            ossAccessKeyId: ENV.GEN_WS_OSS_ACCESS_KEY_ID || 'j1ZHzIFv65VdK42B',
            ossAccessKeySecret: ENV.GEN_WS_OSS_ACCESS_KEY_SECRET || 'QkLzlvbROdqHmpGnNZAGlDUpy7Tr1i',
            ossRegionName: ENV.GEN_WS_OSS_REGION_NAME || 'oss-cn-beijing'
        }
    },
    applicationServer: {
        host: ENV.GEN_WS_AS_HOST || 'localhost',
        port: ENV.GEN_WS_AS_PORT || 8888
    },
    database: {
        host: ENV.GEN_WS_DATABASE_SERVER || 'localhost',
        port: ENV.GEN_WS_DATABASE_PORT || 5432,
        user: ENV.GEN_WS_DATABASE_USER || 'postgres',
        password: ENV.GEN_WS_DATABASE_PASSWORD || 'zxcasdqwe',
        databaseName: ENV.GEN_WS_DATABASE_NAME || 'genomixdb'
    },
    headers: {
        sessionHeader: ENV.GEN_SESSION_HEADER || 'X-Session-Id',
        languageHeader: ENV.GEN_LANGUAGE_HEADER || 'X-Langu-Id'
    },
    sessions: {
        allowMultipleUserSessions: ENV.GEN_WS_ALLOW_MULTIPLE_USER_SESSIONS || true,
        sessionTimeoutSec: ENV.GEN_WS_USER_SESSION_TIMEOUT || 5 * 60
    },
    scheduler: {
        enabled: ENV.GEN_WS_SCHEDULE_ENABLED || true,
        tasks: {
            // Task timeouts in seconds.
            checkSessions: {
                isEnabled: true,
                taskTimeout: 10 * 60
            },
            importSourceMetadata: {
                isEnabled: true,
                taskTimeout: 60 * 60
            }
        }
    },
    logger: {
        app_name: 'genomix',
        console: {
            level: ENV.GEN_WS_CONSOLE_LOG_LEVEL || 'trace'
        },
        file: {
            level: ENV.GEN_WS_LOG_LEVEL || 'trace',
            path: ENV.GEN_WS_LOG_PATH || __dirname + '/../logs/genomix.log',
            rotatingFilesCount: 7
        }
    },
    defaultLanguId: 'en'
};

// Add computational fields
// Warning! Currently, base url should be set to HTTP scheme, as otherwise Google sends 'Missing parameter: scope' error.
// The HTTP address will be redirected to HTTPS by NginX.
SETTINGS.baseUrl = ENV.GEN_WS_BASE_URL || 'http://localhost:' + SETTINGS.port;
SETTINGS.google = {
    // Google Application parameters
    clientId: ENV.GEN_WS_GOOGLE_CLIENT_ID || '1051611087780-4eo3v6k4oboivgha2l8jbi9jd6b0bfe9.apps.googleusercontent.com',
    clientSecret: ENV.GEN_WS_GOOGLE_CLIENT_SECRET || '7U3OeIgx-wO86CAGT7xYOGIz'
};

module.exports = SETTINGS;
