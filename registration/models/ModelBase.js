'use strict';

const _ = require('lodash');
const async = require('async'); // TODO replace by Promise

const Uuid = require('node-uuid');

const ChangeCaseUtil = require('../utils/ChangeCaseUtil');
const CollectionUtils = require('../utils/CollectionUtils');

class ModelBase {
    /**
     * @param db
     * @param {Logger} logger
     * @param baseTableName Name of the main (or the only) table of the corresponding model.
     * @param mappedColumns List of column names that will be allowed to extract from the table(s) (@see ModelBase._mapColumns() method).
     * */
    constructor(db, logger, baseTableName, mappedColumns) {
        this.db = db;
        this.logger = logger;
        this.baseTableName = baseTableName;
        this.mappedColumns = mappedColumns;
    }

    add(item, languId, callback) {
        async.waterfall([
            (callback) => this._add(item, languId, true, callback),
            (itemId, callback) => this.find(itemId, callback)
        ], callback);
    }

    addWithId(item, languId, callback) {
        async.waterfall([
            (callback) => this._add(item, languId, false, callback),
            (itemId, callback) => this.find(itemId, callback)
        ], callback);
    }

    exists(itemId, callback) {
        this.db.asCallback((knex, callback) => {
            knex.select('id')
                .from(this.baseTableName)
                .where('id', itemId)
                .asCallback((error, itemData) => {
                    if (error) {
                        callback(error);
                    } else {
                        callback(null, (itemData.length > 0));
                    }
                });
        }, callback);
    }

    find(itemId, callback) {
        async.waterfall([
            (callback) => this._fetch(itemId, callback),
            (itemData, callback) => {
                callback(null, this._mapColumns(itemData));
            }
        ], callback);
    }

    _add(item, languId, shouldGenerateId, callback) {
        throw new Error('Method is abstract.');
    }

    _generateId() {
        // Generate random UUID
        return Uuid.v4();
    }

    _mapColumns(item) {
        const itemData = ChangeCaseUtil.convertKeysToCamelCase(item);
        return CollectionUtils.createHash(this.mappedColumns,
            _.identity,
            (column) => itemData[column]
        );
    }

    /**
     * @protected
     * */
    _toCamelCase(itemOrItems, callback) {
        callback(null, ChangeCaseUtil.convertKeysToCamelCase(itemOrItems));
    }

    /**
     * @param {string}name
     * @param {function(Error)}callback
     */
    _ensureNameIsValid(name, callback) {
        const trimmedName = (name || '').trim();
        if (_.isEmpty(trimmedName)) {
            callback(new Error('Name cannot be empty.'));
        } else {
            callback(null);
        }
    }

    _ensureAllItemsFound(itemsFound, itemIdsToFind, callback) {
        if (itemsFound && itemsFound.length === itemIdsToFind.length) {
            callback(null, itemsFound);
        } else {
            callback('Part of the items is not found: ' + itemIdsToFind);
        }
    }

    _mapItems(items, callback) {
        async.map(items, (item, callback) => {
            callback(null, this._mapColumns(item));
        }, callback);
    }

    _fetch(itemId, callback) { // TODO return Promise
        this.db.asCallback((knex, callback) => {
            knex.select()
                .from(this.baseTableName)
                .where('id', itemId)
                .asCallback((error, itemData) => {
                    if (error || !itemData.length) {
                        callback(error || new Error('Item not found: ' + itemId));
                    } else {
                        callback(null, ChangeCaseUtil.convertKeysToCamelCase(itemData[0]));
                    }
                });
        }, callback);
    }

    _insert(dataToInsert, trx, callback) {
        this._unsafeInsert(this.baseTableName, dataToInsert, trx, callback);
    }

    _unsafeInsert(tableName, dataToInsert, trx, callback) {
        trx(tableName)
            .insert(ChangeCaseUtil.convertKeysToSnakeCase(dataToInsert))
            .asCallback((error) => {
                callback(error, dataToInsert.id);
            });
    }

    _unsafeUpdate(itemId, dataToUpdate, trx, callback) {
        trx(this.baseTableName)
            .where('id', itemId)
            .update(ChangeCaseUtil.convertKeysToSnakeCase(dataToUpdate))
            .asCallback((error) => {
                callback(error, itemId);
            });
    }
}

module.exports = ModelBase;