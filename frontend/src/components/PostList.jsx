import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import { Link } from 'react-router';

export const PostList =  React.createClass({
  mixins: [PureRenderMixin],
  render: function() {
    //console.log(this.props);
    return <div>
      {this.props.list.map(post =>
        <div className="blog-post" key={post.get('id')}>
          <h3><Link to={`/post/${post.get('id')}`}>{post.get('title')}</Link> <small>3/6/2015</small> <small>by {post.get('users').get('name')}</small></h3>
          <div className="callout">
            <ul className="menu simple">
              <li><a href="#">Comments: {post.get('comments').size}</a></li>
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

export const PostListContainer = connect(mapStateToProps)(PostList);