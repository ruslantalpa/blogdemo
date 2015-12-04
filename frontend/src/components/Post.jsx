import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';

export const Post =  React.createClass({
  mixins: [PureRenderMixin],
  render: function() {
  	let post = this.props.posts.get(this.props.postId);
    return !post ? 
    	<div></div> :
	    <div className="blog-post">
			<h3>{post.get('title')} <small>3/6/2015</small></h3>
			<img className="thumbnail" src="http://placehold.it/850x350" />
			<p>{post.get('body')}</p>
			<div>
				<h4>Comments</h4>
				<ul className="comments simple">
					{post.get('comments').map(comment =>
						<li key={comment.get('id')}>
							<h5><small>3/6/2015</small> <small>by {comment.get('users').get('name')}</small></h5>
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

export const PostContainer = connect(mapStateToProps)(Post);