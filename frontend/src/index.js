import React from 'react'
import { render } from 'react-dom'
import Router, {Route} from 'react-router'
import App from './components/App'
import {PostListContainer} from './components/PostList'
import {PostContainer} from './components/Post'
import {combineReducers, applyMiddleware, compose, createStore} from 'redux'
import reducer from './reducer'
import {fetchPostList} from './actions'
import {Provider} from 'react-redux'
import {reduxReactRouter, routerStateReducer, ReduxRouter} from 'redux-router'
import {createHistory} from 'history'
import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'

const loggerMiddleware = createLogger()

const routes = (
	<Route component={App}>
	  <Route path="/" component={PostListContainer} />
	  <Route path="/post/:id" component={PostContainer} />
	</Route>
)

const combinedReducer = combineReducers({
  router: routerStateReducer,
  app: reducer
})

const store = compose(
	applyMiddleware(thunkMiddleware, loggerMiddleware),
	reduxReactRouter({routes, createHistory})
)(createStore)(combinedReducer)

render(<Provider store={store}><ReduxRouter>{routes}</ReduxRouter></Provider>, document.getElementById('root'))
