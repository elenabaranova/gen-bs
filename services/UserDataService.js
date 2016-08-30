'use strict';

const async = require('async');
const _ = require('lodash');

const ServiceBase = require('./ServiceBase');
const UploadOperation = require('./operations/UploadOperation');
const {ENTITY_TYPES} = require('../utils/Enums');

class UserDataService extends ServiceBase {
    constructor(services, models) {
        super(services, models);
        this.defaultLimit = 100;
    }

    /**
     * Gets data necessary for initial page loading.
     *
     * @param {Object}user User, to which the data request is related to.
     * @param {function(Error, Object)}callback
     * */
    getUserData(user, callback) {
        async.waterfall([
            (callback) => this._findGeneralData(user, callback),
            (results, callback) => {
                this.services.queryHistory.findLastEntryOrNull(user,
                    (error, lastEntry) => callback(error, results, lastEntry));
            },
            (results, lastEntry, callback) => {
                this._findLastSampleInfo(user, results.samples, (error, lastSampleId, lastSampleFields) => {
                    callback(error, Object.assign({}, results, {
                        lastSampleId,
                        lastSampleFields
                    }));
                });
            }
        ], (error, results) => {
            callback(error, results);
        });
    }

    /**
     * Finds id and fields for the last sample.
     *
     * @param {Object}user User
     * @param {Array}allSamples Array of all samples available for the user.
     * @param {function(Error, string, Array)}callback
     * */
    _findLastSampleInfo(user, allSamples, callback) {
        async.waterfall([
            (callback) => {
                // If session is demo session, then we should pick first standard sample.
                const firstNotAdvancedSample = _.find(allSamples, (sample) => sample.type === ENTITY_TYPES.STANDARD);
                let sampleId = firstNotAdvancedSample ? firstNotAdvancedSample.id : null;
                this.services.fieldsMetadata.findByUserAndSampleId(user, sampleId,
                    (error, sampleFields) => callback(error, sampleId, sampleFields));
            }
        ], callback);
    }

    /**
     * @param {Object}user Current user object.
     * @param {function(Error, Object)}callback
     * */
    _findGeneralData(user, callback) {
        async.waterfall([
            (callback) => {
                async.parallel({
                    profileMetadata: (callback) => callback(null, user),
                    views: (callback) => {
                        this.services.views.findAll(user, callback);
                    },
                    filters: (callback) => {
                        this.services.filters.findAll(user, callback);
                    },
                    samples: (callback) => {
                        this.services.samples.findAll(user, callback);
                    },
                    queryHistory: (callback) => {
                        this.services.queryHistory.findAll(user, this.defaultLimit, 0, callback);
                    },
                    savedFiles: (callback) => {
                        this.services.savedFiles.findAll(user, callback);
                    },
                    totalFields: (callback) => {
                        this.services.fieldsMetadata.findTotalMetadata(callback);
                    },
                    activeUploads: (callback) => {
                        this.services.sampleUploadHistory.findActive(user, callback);
                    },
                    uploads: (callback) => {
                        this.services.sampleUploadHistory.findAll(user, this.defaultLimit, 0, callback);
                    }
                }, callback);
            }
        ], (error, results) => {
            callback(error, results);
        });
    }
}

module.exports = UserDataService;
