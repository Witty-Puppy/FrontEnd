import { createActions, handleActions } from 'redux-actions';

/* 초기값 */
const initialState = {
    calendar: null,
    eventList: [],
    searchEventList: [],
    event: null,
    employeeList: [],
    message: null,
    tempDeletedEventList: []
};

/* 액션 */
export const GET_CALENDAR = 'calendar/GET_CALENDAR';
export const GET_EVENTS = 'calendar/GET_EVENTS';
export const GET_EVENTS_SEARCH = 'calendar/GET_EVENTS_SEARCH';
export const GET_EVENT = 'calendar/GET_EVENT';
export const GET_EMPLOYEES = 'calendar/GET_EMPLOYEES';
export const POST_EVENT = 'calendar/POST_EVENT';
export const PUT_EVENT = 'calendar/PUT_EVENT';
export const DELETE_EVENT = 'calendar/DELETE_EVENT';
export const GET_TEMP_DELETED_EVENTS = 'calendar/GET_TEMP_DELETED_EVENTS';
export const PUT_TEMP_DELETED_EVENT = 'calendar/PUT_TEMP_DELETED_EVENT';

const action = createActions({
    [GET_CALENDAR]: () => { },
    [GET_EVENTS]: () => { },
    [GET_EVENTS_SEARCH]: () => { },
    [GET_EVENT]: () => { },
    [GET_EMPLOYEES]: () => { },
    [POST_EVENT]: () => { },
    [PUT_EVENT]: () => { },
    [DELETE_EVENT]: () => { },
    [GET_TEMP_DELETED_EVENTS]: () => { },
    [PUT_TEMP_DELETED_EVENT]: () => { },
});

const calendarReducer = handleActions(
    {
        [GET_CALENDAR]: (state, { payload }) => {
            return {
                ...state,
                calendar: payload,
            };
        },
        [GET_EVENTS]: (state, { payload }) => {
            return {
                ...state,
                eventList: payload,
            };
        },
        [GET_EVENTS_SEARCH]: (state, { payload }) => {
            return {
                ...state,
                searchEventList: payload,
            };
        },
        [GET_EVENT]: (state, { payload }) => {
            return {
                ...state,
                event: payload,
            };
        },
        [GET_EMPLOYEES]: (state, { payload }) => {
            return {
                ...state,
                employeeList: payload,
            };
        },
        [POST_EVENT]: (state, { payload }) => {
            return {
                ...state,
                message: payload,
            };
        },
        [PUT_EVENT]: (state, { payload }) => {
            return {
                ...state,
                message: payload,
            };
        },
        [DELETE_EVENT]: (state, { payload }) => {
            return {
                ...state,
                message: payload,
            };
        },
        [GET_TEMP_DELETED_EVENTS]: (state, { payload }) => {
            return {
                ...state,
                tempDeletedEventList: payload,
            };
        },
        [PUT_TEMP_DELETED_EVENT]: (state, { payload }) => {
            return {
                ...state,
                message: payload,
            };
        },
    },
    initialState
);

export default calendarReducer;