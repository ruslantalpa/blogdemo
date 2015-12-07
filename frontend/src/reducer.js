import {fromJS} from 'immutable';
const defaultState = fromJS({list:[], posts: [], postId:0});

function setList(state, list) {
  return state.set('list', list);
}

function addPost(state, post) {
	return state.setIn(['posts', post.get('id')], post);
}

export default function(state = defaultState, action) {
  switch (action.type) {
  case 'SET_LIST':
    return setList(state, action.list);
  case 'ADD_POST':
  	return addPost(state, action.post);
  }
  return state;
}