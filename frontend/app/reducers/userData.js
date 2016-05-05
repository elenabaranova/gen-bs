import * as ActionTypes from '../actions/userData'

export default function userData(state = {
    isFetching: false,
    isValid: false,
    profileMetadata: {},
    filters: [],
    views: [],
    attachedHistoryData: {
        sampleId: null,
        filterId: null,
        viewId: null
    }
}, action) {

    switch (action.type) {

        case ActionTypes.REQUEST_USERDATA:
            return Object.assign({}, state, {
                isFetching: true
            });

        case ActionTypes.RECEIVE_USERDATA:
            return Object.assign({}, state, {
                isFetching: false,
                isValid: true,

                profileMetadata: action.userData.profileMetadata,
                filters: action.userData.filters,
                views: action.userData.views,

                lastUpdated: action.receivedAt
            });

        case ActionTypes.REQUEST_VIEWS:
            return Object.assign({}, state, {
                isFetching: true
            });

        case ActionTypes.RECEIVE_VIEWS:
            return Object.assign({}, state, {
                isFetching: false,

                views: action.views,

                lastUpdated: action.receivedAt
            });

        case ActionTypes.REQUEST_FILTERS:
            return Object.assign({}, state, {
                isFetching: true
            });

        case ActionTypes.RECEIVE_FILTERS:
            return Object.assign({}, state, {
                isFetching: false,
                filters: action.filters,
                lastUpdated: action.receivedAt
            });

        case ActionTypes.CHANGE_HISTORY_DATA:
        {
            const {sampleId, filterId, viewId} = action;
            return Object.assign({}, state, {
                attachedHistoryData: {
                    sampleId: sampleId,
                    filterId: filterId,
                    viewId: viewId
                }
            });
        }
        case ActionTypes.CHANGE_FILTERS:
        {
            const {filters} = action;
            return Object.assign({}, state, {
                filters: filters
            });
        }
        case ActionTypes.CHANGE_VIEWS:
        {
            const {views} = action;
            return Object.assign({}, state, {
                views: views
            });
        }
        case ActionTypes.DELETE_VIEW:
        {
            const deletedViewIndex = _.findIndex(state.views, view => view.id == action.viewId);
            return Object.assign({}, state, {
                views: [
                    ...state.views.slice(0, deletedViewIndex),
                    ...state.views.slice(deletedViewIndex + 1)
                ]
            });
        }
        case ActionTypes.DELETE_FILTER:
        {
            const deletedFilterIndex = _.findIndex(state.filters, filter => filter.id == action.filterId);
            return Object.assign({}, state, {
                filters: [
                    ...state.filters.slice(0, deletedFilterIndex),
                    ...state.filters.slice(deletedFilterIndex + 1)
                ]
            });
        }
        case ActionTypes.ADD_FILTER:
        {
            return Object.assign({}, state, {
                filters: [
                    ...state.filters.slice(),
                    action.filter
                ]
            });
        }
        default:
            return state
    }
}