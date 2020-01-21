import uuid from 'uuid'
import { SET_ALERTS, REMOVE_ALERTS } from './types'

export const setAlert = (msg, alertType) => dispatch => {
	const id = uuid.v4()
	dispatch({
		type: SET_ALERTS,
		payload: { msg, alertType, id }
	})
	
	setTimeout(() => dispatch({ type: REMOVE_ALERTS, payload: id}), 2000);
}