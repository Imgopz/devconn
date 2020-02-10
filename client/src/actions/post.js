import axios from 'axios'
import { setAlert } from './alert'
import { GET_POSTS, POST_ERROR, UPDATE_LIKES, DELETE_POST, ADD_POST, GET_POST } from './types'

// Get posts
export const getPosts = () => async dispatch => {
	try {
		const res = await axios.get('/api/post')
		
		dispatch({
			type: GET_POSTS,
			payload: res.data
		})
	} catch (err) {
		dispatch({
			type: POST_ERROR,
			payload: { msg: err.response.statusText, status: err.response.status }
		})
	}
}

// Add likes
export const addLikes = id => async dispatch => {
	try {
		const res = await axios.put(`/api/post/like/${id}`)
		
		dispatch({
			type: UPDATE_LIKES,
			payload: { id, likes: res.data }
		})
	} catch (err) {
		dispatch({
			type: POST_ERROR,
			payload: { msg: err.response.statusText, status: err.response.status }
		})
	}
}

// Remove likes
export const removeLikes = id => async dispatch => {
	try {
		const res = await axios.put(`/api/post/unlike/${id}`)
		
		dispatch({
			type: UPDATE_LIKES,
			payload: { id, likes: res.data }
		})
	} catch (err) {
		dispatch({
			type: POST_ERROR,
			payload: { msg: err.response.statusText, status: err.response.status }
		})
	}
}

// Delete Post
export const deletePost = id => async dispatch => {
	try {
		
		await axios.delete(`/api/post/${id}`)
		
		dispatch({
			type: DELETE_POST,
			payload: id
		})
		
		dispatch(setAlert('Post Removed', 'success'))
		
	} catch (err) {
		dispatch({
			type: POST_ERROR,
			payload: { msg: err.response.statusText, status: err.response.status }
		})
	}
}

// Add Post
export const addPost = formData => async dispatch => {
	
	const config = {
		headers: {
			'Content-Type': 'application/json'
		}
	}
	
	try {
		
		const res = await axios.post('/api/post/', formData, config)
		
		dispatch({
			type: ADD_POST,
			payload: res.data
		})
		
		dispatch(setAlert('Post Created', 'success'))
		
	} catch (err) {
		dispatch({
			type: POST_ERROR,
			payload: { msg: err.response.statusText, status: err.response.status }
		})
	}
}

// Get post
export const getPost = id => async dispatch => {
	try {
		const res = await axios.get(`/api/post/${id}`)
		
		dispatch({
			type: GET_POST,
			payload: res.data
		})
	} catch (err) {
		dispatch({
			type: POST_ERROR,
			payload: { msg: err.response.statusText, status: err.response.status }
		})
	}
}