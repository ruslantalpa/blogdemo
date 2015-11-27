

var PostsBox = React.createClass({
  loadCommentsFromServer: function() {
    var headers = {};
    if(localStorage.session){
      headers["Authorization"] = 'Bearer ' + localStorage.session
    }
    $.ajax({
      url: '/api/posts',
      dataType: 'json',
      cache: true,
      headers: headers,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
  },
  render: function() {
    return (
      <div>
        <h3>Posts</h3>
        <PostsList data={this.state.data} />
      </div>
    );
  }
});

var PostsList = React.createClass({
  render: function() {
    var postNodes = this.props.data.map(function(post) {
      return (
        <Post post={post}  key={post.id} />
      );
    });
    return (
      <div>
        {postNodes}
      </div>
    );
  }
});

var Post = React.createClass({
  render: function() {
    return (
      <div>
        <h1><a href={'/post/' + this.props.post.id}>{this.props.post.title}</a></h1>
        <h3>by {this.props.post.author} on {this.props.post.created_at}</h3>
      </div>
    );
  }
});

var Page = React.createClass({
  render: function() {
    return (
      <div>
      <PostsBox />
      </div>
    );
  }
});

ReactDOM.render(
  <Page/>,
  document.getElementById('content')
);
