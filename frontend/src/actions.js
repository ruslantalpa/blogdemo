import {Map, List, fromJS} from 'immutable'
import fetch from 'isomorphic-fetch'

export const SET_LIST = 'SET_LIST'
export const ADD_POST = 'ADD_POST'
export const FETCH_POST_LIST = 'FETCH_POST_LIST'
export const FETCH_POST = 'FETCH_POST'


function setList(list) {
  return { type: SET_LIST, list: fromJS(list) }
}

function addPost(post) {
  return { type: ADD_POST, post: fromJS(post) }
}

function shouldFetchPost(state, postId) {
  const post = state.app.getIn(['posts',postId])
  if (!post) {
    return true
  }
  else {
  	return false
  }
}

function shouldFetchPostList(state) {
  const list = state.app.get('list')
  if (list && list.size > 0) {
    return false
  }
  else {
  	return true
  }
}

function fetchPostList() {
  return dispatch => {
    dispatch({
      type: FETCH_POST_LIST
    })
    return fetch(`http://localhost:8000/api/posts?select=id,title,created_at,authors{email,name},comments{id}`)
      .then(response => response.json())
      .then(json => {
        	dispatch(setList(json))
    	}
      )
  }
}

function fetchPost(postId) {
  return dispatch => {
    dispatch({
      type: FETCH_POST_LIST,
      postId
    })
    return fetch(
    	`http://localhost:8000/api/posts/${postId}?select=*,authors{*},comments{id,body,created_at,authors{email,name}}`,
    	{
			headers: {
				'Prefer': 'plurality=singular'
			}
		}
    )
      .then(response => response.json())
      .then(json => {
        	dispatch(addPost(json))
    	}
      )
  }
}

export function fetchPostIfNeeded(postId) {
  return (dispatch, getState) => {
    if (shouldFetchPost(getState(), postId)) {
      return dispatch(fetchPost(postId))
    }
  }
}

export function fetchPostListIfNeeded() {
  return (dispatch, getState) => {
    if (shouldFetchPostList(getState())) {
      return dispatch(fetchPostList())
    }
  }
}
