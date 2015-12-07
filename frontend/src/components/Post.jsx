import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import {connect} from 'react-redux'
import {fetchPostIfNeeded} from '../actions'

export const Post =  React.createClass({
  mixins: [PureRenderMixin],
  componentDidMount() {
    this.props.fetchPost(this.props.postId)
  },
  componentWillReceiveProps(nextProps) {
    this.props.fetchPost(nextProps.postId)
  },
  render: function() {
  	let post = this.props.posts.get(this.props.postId)
    return !post ? 
    	<div></div> :
	    <div className="blog-post">
			<h3>{post.get('title')} <small>{(new Date(post.get('created_at'))).toDateString()}</small> <small>by {post.get('authors').get('name')}</small></h3>
			<img className="thumbnail" src="http://placehold.it/850x350" />
			<p>{post.get('body')}</p>
			<div>
				<h4>Comments</h4>
				<ul className="comments simple">
					{post.get('comments').map(comment =>
						<li key={comment.get('id')}>
							<h5><small>{(new Date(comment.get('created_at'))).toDateString()}</small> <small>by {comment.get('authors').get('name')}</small></h5>
							<p>{comment.get('body')}</p>
						</li>
					)}
				</ul>
				<form>
					<div className="row column">
						<input type="text" placeholder="Your Name" />
						<textarea placeholder="Comment..."></textarea>
						<button className="button expanded">Post</button>
					</div>
				</form>
				
			</div>		
		</div>
  }
});

function mapStateToProps(state) {
  return {
    posts: state.app.get('posts'),
    postId: state.router.params.id
  };
}
function mapDispatchToProps(dispatch) {
  return {
    fetchPost: (postId) => dispatch(fetchPostIfNeeded(postId))
  }
}

export const PostContainer = connect(mapStateToProps, mapDispatchToProps)(Post);