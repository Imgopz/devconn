import uuid from 'uuid'
import { SET_ALERTS, REMOVE_ALERTS } from './types'

export const setAlert = (msg, alertType) => dispatch => {
	const id = uuid.v4()
	dispatch({
		type: setAlert,
		payload: { msg, alertType, id }
	})
}