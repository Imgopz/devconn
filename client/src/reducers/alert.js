import { SET_ALERTS, REMOVE_ALERTS } from '../actions/types'

const initialState = []

export default function( state= initialState, action){
	
	const { type, payload } = action;
	
	switch(type){
		case SET_ALERTS:
			return [...state, payload]
		case REMOVE_ALERTS:
			return state.filter(alert => alert.id !== payload)
		default:
			return state
	}
}