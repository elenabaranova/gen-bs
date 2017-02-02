import {entityType} from './entityTypes';

// see http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
export function getUrlParameterByName(name, url) {
    if (!url) {
        url = location.href;
    }
    // This is just to avoid case sensitiveness
    url = url.toLowerCase();
    // This is just to avoid case sensitiveness for query parameter name
    name = name.replace(/[\[\]]/g, '\\$&').toLowerCase();
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    var results = regex.exec(url);
    if (!results) {
        return null;
    }
    if (!results[2]) {
        return '';
    }
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

export function getItemLabelByNameAndType(itemName, itemType) {
    return itemType === entityType.HISTORY ? itemName + ' (from history)' : itemName;
}

export function getReadonlyReasonForSessionAndType(what, isDemoSession, selectedViewFilterType, p) {
    switch (selectedViewFilterType) {
        case entityType.HISTORY:
            return p.t('filterAndModel.readOnlyReason.historyEntity', {entity: what});
        case entityType.USER:
            return '';
    }
    const descriptionText = p.t('filterAndModel.readOnlyReason.notEditable', {entity: what});
    if (isDemoSession) {
        return descriptionText + p.t('filterAndModel.readOnlyReason.forRegisteredUsers');
    } else {
        return descriptionText;
    }
}