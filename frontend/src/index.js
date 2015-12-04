import React from 'react';
import { render } from 'react-dom';
import Router, {Route} from 'react-router';
import App from './components/App';
import {PostListContainer} from './components/PostList';
import {PostContainer} from './components/Post';
import {combineReducers, applyMiddleware, compose, createStore} from 'redux';
import reducer from './reducer';
import {Provider} from 'react-redux';
import {reduxReactRouter, routerStateReducer, ReduxRouter} from 'redux-router';
import {createHistory} from 'history';

const routes = (
	<Route component={App}>
	  <Route path="/" component={PostListContainer} />
	  <Route path="/post/:id" component={PostContainer} />
	</Route>
);

const combinedReducer = combineReducers({
  router: routerStateReducer,
  app: reducer
});

const store = compose(
	reduxReactRouter({routes, createHistory})
)(createStore)(combinedReducer);
//const store = createStore(reducer);

store.dispatch({
	type: 'SET_LIST',
	list: [
		{id: 1, title: "Post 1", users: {name: 'Joe Nelson'}, comments: [{id: 1}, {id: 2}, {id: 3}]},
		{id: 2, title: "Post 2", users: {name: 'Ruslan Talpa'}, comments: [{id: 4}, {id: 5}]}
	]
});
store.dispatch({
	type: 'ADD_POST',
	post: {
		id: 1, title: "Post 1", body: "Post body",
		comments: [
			{id: 1, users: {name: 'Joe Nelson'}, body: "text comment"},
			{id: 2, users: {name: 'Ruslan Talpa'}, body: "text comment 2"},
			{id: 3, users: {name: 'Joe Nelson'}, body: "text comment 3"}
		]
	}
});
store.dispatch({
	type: 'ADD_POST',
	post: {
		id: 2, title: "Post 2", body: "Post body",
		comments: [
			{id: 4, users: {name: 'Joe Nelson'}, body: "text comment"},
			{id: 5, users: {name: 'Ruslan Talpa'}, body: "text comment 3"}
		]
	}
});

render(<Provider store={store}><ReduxRouter>{routes}</ReduxRouter></Provider>, document.getElementById('root'));
