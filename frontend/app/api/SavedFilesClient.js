'use strict';

import _ from 'lodash';

import UserEntityClientBase from './UserEntityClientBase';
import RequestWrapper from './RequestWrapper';

export default class SavedFilesClient extends UserEntityClientBase {
    constructor(urls) {
        super(urls, urls.savedFilesUrls());
    }

    download(languId, sessionId, itemId, callback) {
        RequestWrapper.get(
            this.collectionUrls.download(itemId),
            this._makeHeaders({sessionId, languId}),
            null,
            null,
            callback
        );
    }

    add(languId, sessionId, fileMetadata, fileBlob, callback) {
        const formData = {
            file: fileBlob,
            metadata: JSON.stringify(fileMetadata)
        };

        RequestWrapper.uploadMultipart(
            this.collectionUrls.upload(),
            this._makeHeaders({sessionId, languId}),
            null,
            formData,
            callback
        );
    }
}
