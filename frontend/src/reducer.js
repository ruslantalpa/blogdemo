import {Map, List, fromJS} from 'immutable';

function setList(state, newList) {
  let l = fromJS(newList);
  return state.set('list', l);
}

function addPost(state, newPost) {
	let p = fromJS(newPost);
	return state.setIn(['posts', p.get('id')], p);
}

export default function(state = Map({list:List.of(), posts: List.of()}), action) {
  switch (action.type) {
  case 'SET_LIST':
    return setList(state, action.list);
  case 'ADD_POST':
  	return addPost(state, action.post);
  }
  return state;
}