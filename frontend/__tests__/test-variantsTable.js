import {setVariantsSort, changeVariantsSort} from '../app/actions/variantsTable';
import storeTestUtils from './storeTestUtils';
import MOCK_APP_STATE from './__data__/appState.json';

function stateMapperFunc(globalState) {
    return {
        appState: {
            ...globalState.variantsTable
        },
        sortingFields: [
            {fieldId: 'field1', sampleId: 'sample1'},
            {fieldId: 'field2', sampleId: 'sample2'},
            {fieldId: 'field3', sampleId: 'sample3'},
        ]
    };
}

describe('Variants table', () => {
    describe('Set sorting', () => {

        const initStore = stateMapperFunc(MOCK_APP_STATE);
        const {appState, sortingFields} = initStore;

        it('should set sort', (done) => {
            const initSort = appState.searchInResultsParams.sort;
            const newSort = ['some', 'sort', 'params'];
            expect(initSort).not.toEqual(newSort);
            storeTestUtils.runTest({
                applyActions: (dispatch) => dispatch(setVariantsSort(newSort)),
                stateMapperFunc
            }, (newState) => {
                expect(newState.appState.searchInResultsParams.sort).toBe(newSort);
                done();
            });
        });

        it('should store sort to empty array', (done) => {
            const FIELD_ID = sortingFields[0].fieldId;
            const SAMPLE_ID = sortingFields[0].sampleId;
            const SORT_ORDER = 1; // or 2
            const SORT_DIRECTION = 'asc'; // or 'desc'
            storeTestUtils.runTest({
                applyActions: (dispatch) => dispatch([
                    setVariantsSort([]),
                    changeVariantsSort(FIELD_ID, SAMPLE_ID, SORT_ORDER, SORT_DIRECTION)
                ]),
                stateMapperFunc
            }, (newState) => {
                expect(newState.appState.searchInResultsParams.sort).toEqual([{
                    fieldId: FIELD_ID,
                    sampleId: SAMPLE_ID,
                    order: SORT_ORDER,
                    direction: SORT_DIRECTION
                }]);
                done();
            });
        });

        it('should store 2nd sort to empty array', (done) => {
            const FIELD_ID = sortingFields[0].fieldId;
            const SAMPLE_ID = sortingFields[0].sampleId;
            const SORT_ORDER = 2; // try to set 2 as first sort
            const SORT_DIRECTION = 'asc';
            storeTestUtils.runTest({
                applyActions: (dispatch) => dispatch([
                    setVariantsSort([]),
                    changeVariantsSort(FIELD_ID, SAMPLE_ID, SORT_ORDER, SORT_DIRECTION)
                ]),
                stateMapperFunc
            }, (newState) => {
                expect(newState.appState.searchInResultsParams.sort).toEqual([{
                    fieldId: FIELD_ID,
                    sampleId: SAMPLE_ID,
                    order: 1, // always 1 if single sort
                    direction: SORT_DIRECTION
                }]);
                done();
            });
        });

        it('should add sort', (done) => {
            const initialSort = [{
                fieldId: sortingFields[0].fieldId,
                sampleId: sortingFields[0].sampleId,
                order: 1,
                direction: 'asc'
            }];
            const FIELD_ID = sortingFields[1].fieldId;
            const SAMPLE_ID = sortingFields[1].sampleId;
            const SORT_ORDER = 2; // try with 'sortArray.length < action.sortOrder'
            const SORT_DIRECTION = 'desc';
            storeTestUtils.runTest({
                applyActions: (dispatch) => dispatch([
                    setVariantsSort(initialSort),
                    changeVariantsSort(FIELD_ID, SAMPLE_ID, SORT_ORDER, SORT_DIRECTION)
                ]),
                stateMapperFunc
            }, (newState) => {
                expect(newState.appState.searchInResultsParams.sort).not.toBe(initialSort);
                expect(newState.appState.searchInResultsParams.sort).toEqual([
                    ...initialSort,
                    {
                        fieldId: FIELD_ID,
                        sampleId: SAMPLE_ID,
                        order: SORT_ORDER,
                        direction: SORT_DIRECTION
                    }
                ]);
                done();
            });
        });

        it('should replace less-order sort', (done) => {
            const initialSort = [{
                fieldId: sortingFields[0].fieldId,
                sampleId: sortingFields[0].sampleId,
                order: 1,
                direction: 'asc'
            }];
            const FIELD_ID = sortingFields[1].fieldId;
            const SAMPLE_ID = sortingFields[1].sampleId;
            const SORT_ORDER = 1; // try with not 'sortArray.length < action.sortOrder'
            const SORT_DIRECTION = 'desc';
            storeTestUtils.runTest({
                applyActions: (dispatch) => dispatch([
                    setVariantsSort(initialSort),
                    changeVariantsSort(FIELD_ID, SAMPLE_ID, SORT_ORDER, SORT_DIRECTION)
                ]),
                stateMapperFunc
            }, (newState) => {
                expect(newState.appState.searchInResultsParams.sort).not.toBe(initialSort);
                expect(newState.appState.searchInResultsParams.sort).toEqual([
                    {
                        fieldId: FIELD_ID,
                        sampleId: SAMPLE_ID,
                        order: SORT_ORDER,
                        direction: SORT_DIRECTION
                    }
                ]);
                done();
            });
        });

        it('should set 1 sort with two sorts', (done) => {
            const initialSort = [
                {
                    fieldId: sortingFields[0].fieldId,
                    sampleId: sortingFields[0].sampleId,
                    order: 1,
                    direction: 'asc'
                },
                {
                    fieldId: sortingFields[1].fieldId,
                    sampleId: sortingFields[1].sampleId,
                    order: 2,
                    direction: 'asc'
                },
            ];
            const FIELD_ID = sortingFields[2].fieldId;
            const SAMPLE_ID = sortingFields[2].sampleId;
            const SORT_ORDER = 1;
            const SORT_DIRECTION = 'desc';
            storeTestUtils.runTest({
                applyActions: (dispatch) => dispatch([
                    setVariantsSort(initialSort),
                    changeVariantsSort(FIELD_ID, SAMPLE_ID, SORT_ORDER, SORT_DIRECTION)
                ]),
                stateMapperFunc
            }, (newState) => {
                expect(newState.appState.searchInResultsParams.sort).not.toBe(initialSort);
                expect(newState.appState.searchInResultsParams.sort).toEqual([
                    {
                        fieldId: FIELD_ID,
                        sampleId: SAMPLE_ID,
                        order: SORT_ORDER,
                        direction: SORT_DIRECTION
                    }
                ]);
                done();
            });
        });

        it('should set 2 sort with two sorts', (done) => {
            const initialSort = [
                {
                    fieldId: sortingFields[0].fieldId,
                    sampleId: sortingFields[0].sampleId,
                    order: 1,
                    direction: 'asc'
                },
                {
                    fieldId: sortingFields[1].fieldId,
                    sampleId: sortingFields[1].sampleId,
                    order: 2,
                    direction: 'asc'
                },
            ];
            const FIELD_ID = sortingFields[2].fieldId;
            const SAMPLE_ID = sortingFields[2].sampleId;
            const SORT_ORDER = 2;
            const SORT_DIRECTION = 'desc';
            storeTestUtils.runTest({
                applyActions: (dispatch) => dispatch([
                    setVariantsSort(initialSort),
                    changeVariantsSort(FIELD_ID, SAMPLE_ID, SORT_ORDER, SORT_DIRECTION)
                ]),
                stateMapperFunc
            }, (newState) => {
                expect(newState.appState.searchInResultsParams.sort).not.toBe(initialSort);
                expect(newState.appState.searchInResultsParams.sort).toEqual([
                    initialSort[0],
                    {
                        fieldId: FIELD_ID,
                        sampleId: SAMPLE_ID,
                        order: SORT_ORDER,
                        direction: SORT_DIRECTION
                    }
                ]);
                done();
            });
        });

        it('should change direction', (done) => {
            const SORT1 = {
                fieldId: sortingFields[0].fieldId,
                sampleId: sortingFields[0].sampleId,
                order: 1,
                direction: 'asc'
            };
            const SORT2 = {
                fieldId: sortingFields[1].fieldId,
                sampleId: sortingFields[1].sampleId,
                order: 2,
                direction: 'asc'
            };
            const initialSort = [SORT1, SORT2];
            const FIELD_ID = SORT1.fieldId;
            const SAMPLE_ID = SORT1.sampleId;
            const SORT_ORDER = SORT1.order;
            const SORT_DIRECTION = 'desc';
            storeTestUtils.runTest({
                applyActions: (dispatch) => dispatch([
                    setVariantsSort(initialSort),
                    changeVariantsSort(FIELD_ID, SAMPLE_ID, SORT_ORDER, SORT_DIRECTION)
                ]),
                stateMapperFunc
            }, (newState) => {
                expect(newState.appState.searchInResultsParams.sort).not.toBe(initialSort);
                expect(newState.appState.searchInResultsParams.sort).toEqual([
                    {...initialSort[0], direction: 'desc'},
                    initialSort[1]
                ]);
                done();
            });
        });

        it('should remove sorting', (done) => {
            const SORT1 = {
                fieldId: sortingFields[0].fieldId,
                sampleId: sortingFields[0].sampleId,
                order: 1,
                direction: 'asc'
            };
            const SORT2 = {
                fieldId: sortingFields[1].fieldId,
                sampleId: sortingFields[1].sampleId,
                order: 2,
                direction: 'asc'
            };
            const initialSort = [SORT1, SORT2];
            const FIELD_ID = SORT1.fieldId;
            const SAMPLE_ID = SORT1.sampleId;
            const SORT_ORDER = SORT1.order;
            const SORT_DIRECTION = SORT1.direction;
            storeTestUtils.runTest({
                applyActions: (dispatch) => dispatch([
                    setVariantsSort(initialSort),
                    changeVariantsSort(FIELD_ID, SAMPLE_ID, SORT_ORDER, SORT_DIRECTION)
                ]),
                stateMapperFunc
            }, (newState) => {
                expect(newState.appState.searchInResultsParams.sort).not.toBe(initialSort);
                expect(newState.appState.searchInResultsParams.sort).toEqual([
                    {
                        ...initialSort[1],
                        order: 1
                    }
                ]);
                done();
            });
        });

        it('should not remove last sorting', (done) => {
            const SORT1 = {
                fieldId: sortingFields[0].fieldId,
                sampleId: sortingFields[0].sampleId,
                order: 1,
                direction: 'asc'
            };
            const initialSort = [SORT1];
            const FIELD_ID = SORT1.fieldId;
            const SAMPLE_ID = SORT1.sampleId;
            const SORT_ORDER = SORT1.order;
            const SORT_DIRECTION = SORT1.direction;
            storeTestUtils.runTest({
                applyActions: (dispatch) => dispatch([
                    setVariantsSort(initialSort),
                    changeVariantsSort(FIELD_ID, SAMPLE_ID, SORT_ORDER, SORT_DIRECTION)
                ]),
                stateMapperFunc
            }, (newState) => {
                expect(newState.appState.searchInResultsParams.sort).toBe(initialSort);
                done();
            });
        });
    });
});