import _ from 'lodash';

import immutableArray from './immutableArray';
import {entityTypeIsDemoDisabled} from './entityTypes';
import {sampleType, sampleTypesForAnalysisType} from './samplesUtils';
import {analysisType} from './analyseUtils';
import config from '../../config';
import {formatDate} from './dateUtil';
import * as i18n from './i18n';


function trimName(name) {
    return name.slice(0, config.ANALYSIS.MAX_NAME_LENGTH);
}

function trimDescription(description) {
    return description.slice(0, config.ANALYSIS.MAX_DESCRIPTION_LENGTH);
}


export function makeHistoryItem(historyItem, newHistoryItemInfo, languageId) {
    return i18n.changeEntityText(
        {
            ...historyItem,
            createdDate: new Date(),
            lastQueryDate: new Date(),
            id: null
        },
        languageId,
        {
            name: trimName(newHistoryItemInfo.name)
        }
    );
}

export function makeNewHistoryItemName(sample, filter, view, languageId) {

    function makeOptionalEntityName(entity) {
        return entity ?
            i18n.getEntityText(entity, languageId).name :
            '';
    }

    return `${formatDate(new Date())}_${makeOptionalEntityName(sample)}_${makeOptionalEntityName(filter)}_${makeOptionalEntityName(view)}`;
}

export function makeNewHistoryItem(sample, filter, view, newHistoryItemInfo) {
    return i18n.setEntityText(
        {
            id: null,
            createdDate: new Date(),
            lastQueryDate: new Date(),
            filterId: filter ?
                filter.id :
                null,
            viewId: view ? view.id : null,
            type: analysisType.SINGLE,
            modelId: null,
            samples: [{
                id: sample ? sample.id : null,
                type: sampleType.SINGLE
            }]
/* can make other types like this:
            // tumor
            type: analysisType.TUMOR,
            model: historyItem.filters[0] // select approptiate
            samples: [
                {
                    id: sample.id, // select approptiate
                    type: sampleType.TUMOR
                },
                {
                    id: sample.id, // select approptiate
                    type: sampleType.NORMAL
                }
            ]
            // family
            type: analysisType.FAMILY,
            model: historyItem.filters[0] // select approptiate
            samples: [
                {
                    id: sample.id, // select approptiate
                    type: sampleType.PROBAND
                },
                {
                    id: sample.id, // select approptiate
                    type: sampleType.MOTHER
                },
                {
                    id: historyItem.sample.id, // select approptiate
                    type: sampleType.FATHER
                }
            ]
 */
        },
        {
            name: trimName(newHistoryItemInfo.name),
            description: trimDescription(newHistoryItemInfo.description)
        }
    );
}

/**
 * Change sample id in array of samples info, make result array contain no duplicate ids.
 * @param {{id: string, ...}[]} oldSamples samples info including id
 * @param {number} sampleIndex sample id to replace
 * @param {string} newSampleId new sample id to set to oldSamples[sampleIndex].id
 * @returns {{id: string, ...}[]}
 */
function changeSampleId(oldSamples, sampleIndex, newSampleId) {
    // If we found new sample id in array at other place then we swap these ids so there will not be duplicates.
    /** @type {number} sample index with newSampleId if any */
    const sampleExistIndex = _.findIndex(oldSamples, (sample, index) => index !== sampleIndex && sample.id === newSampleId);
    /** @type {{id: string, [...]}} sample info where to set new id */
    const replacedSample = oldSamples[sampleIndex];
    /** @type {{id: string, [...]}[]} array of samples infos with new id at desired place */
    const newSamplesWithNewSample = immutableArray.replace(oldSamples, sampleIndex, {...replacedSample, id: newSampleId});
    if (sampleExistIndex < 0) {
        // inserted id is unique, just return the result
        return newSamplesWithNewSample;
    } else {
        // inserted id is at sampleExistIndex, place there replaced id
        return immutableArray.replace(newSamplesWithNewSample, sampleExistIndex, {...newSamplesWithNewSample[sampleExistIndex], id: replacedSample.id});
    }
}

function changeSamplesArray(oldSamples, samplesList, isDemo, newSamplesTypes) {
    const samplesListArray = samplesList.hashedArray.array;
    const usedSamplesIds = {};
    return newSamplesTypes.map(
        (type, index) => {
            const oldSample = oldSamples[index];
            if (oldSample) {
                const oldSampleId = oldSample.id;
                usedSamplesIds[oldSampleId] = true;
                return {id: oldSampleId, type: type};
            } else {
                const unusedSample = _.find(
                        samplesListArray,
                        (sample) => !usedSamplesIds[sample.id] && !entityTypeIsDemoDisabled(sample.type, isDemo)
                    ) ||
                    samplesListArray[0];
                const unusedSampleId = unusedSample.id;
                usedSamplesIds[unusedSampleId] = true;
                return {id: unusedSampleId, type: type};
            }
        }
    );
}

function changeType(historyItem, samplesList, modelsList, isDemo, targetType) {

    function getAvailableModel(type) {
        const model = _.find(
            modelsList.hashedArray.array,
            (model) => !entityTypeIsDemoDisabled(model.type, isDemo) && model.analysisType === type
        );
        return model && model.id;
    }

    function typeConvert(historyItem, newType) {
        const {modelId} = historyItem;

        const model = modelId && modelsList.hashedArray.hash[modelId];
        const newModelId = newType === analysisType.SINGLE ?
            null :
            model && model.analysisType === newType ?
                modelId :
                getAvailableModel(newType);
        const newSamples = changeSamplesArray(
            historyItem.samples,
            samplesList,
            isDemo,
            sampleTypesForAnalysisType[newType]
        );

        return {
            ...historyItem,
            samples: newSamples,
            modelId: newModelId,
            type: newType
        };
    }

    return typeConvert(historyItem, targetType);
}

export function changeHistoryItem(historyItem, samplesList, modelsList, isDemo, change, languageId) {
    let editingHistoryItem = historyItem;
    if (change.name != null) {
        editingHistoryItem = i18n.changeEntityText(editingHistoryItem, languageId, {name: change.name});
    }
    if (change.description != null) {
        editingHistoryItem = i18n.changeEntityText(editingHistoryItem, languageId, {description: change.description});
    }
    if (change.type != null) {
        editingHistoryItem = changeType(editingHistoryItem, samplesList, modelsList, isDemo, change.type);
    }
    if (change.sample != null) {
        editingHistoryItem = {
            ...editingHistoryItem,
            samples: changeSampleId(editingHistoryItem.samples, change.sample.index, change.sample.id)
        };
    }
    if (change.samples != null) {
        editingHistoryItem = {...editingHistoryItem, samples: change.samples};
    }
    if (change.filterId != null) {
        editingHistoryItem = {...editingHistoryItem, filterId: change.filterId};
    }
    if (change.viewId != null) {
        editingHistoryItem = {...editingHistoryItem, viewId: change.viewId};
    }
    if (change.modelId != null) {
        editingHistoryItem = {...editingHistoryItem, modelId: change.modelId};
    }
    return editingHistoryItem;
}

export function makeNewSearchParams(historyItem, newId, languageId) {
    const {
        type, samples, viewId, filterId, modelId
    } = historyItem;
    const {name, description} = i18n.getEntityText(historyItem, languageId);
    const searchParams = i18n.setEntityText(
        {
            id: newId,
            type,
            samples,
            viewId,
            filterId,
            modelId
        },
        {
            name,
            description
        }
    );
    return searchParams;
}