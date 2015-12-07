import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import { Link } from 'react-router';
import {fetchPostListIfNeeded} from '../actions'

export const PostList =  React.createClass({
  mixins: [PureRenderMixin],
  componentDidMount() {
    this.props.fetchPostList()
  },
  render: function() {
    return <div>
      {this.props.list.map(post =>
        <div className="blog-post" key={post.get('id')}>
          <h3><Link to={`/post/${post.get('id')}`}>{post.get('title')}</Link> <small>{(new Date(post.get('created_at'))).toDateString()}</small> <small>by {post.get('authors').get('name')}</small></h3>
          <div className="callout">
            <ul className="menu simple">
              <li>Comments: {post.get('comments').size}</li>
            </ul>
          </div>
        </div>
      )}
    </div>;
  }
});

function mapStateToProps(state) {
  return {
    list: state.app.get('list')
  };
}
function mapDispatchToProps(dispatch) {
  return {
    fetchPostList: () => dispatch(fetchPostListIfNeeded())
  }
}
export const PostListContainer = connect(mapStateToProps, mapDispatchToProps)(PostList);