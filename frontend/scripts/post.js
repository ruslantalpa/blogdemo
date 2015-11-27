
var Comment = React.createClass({
  rawMarkup: function() {
    var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    return { __html: rawMarkup };
  },

  render: function() {
    return (
      <div className="comment">
        <h4 className="commentAuthor">
          {this.props.author} on {this.props.created_at}
        </h4>
        <span dangerouslySetInnerHTML={this.rawMarkup()} />
      </div>
    );
  }
});

var CommentBox = React.createClass({
  
  render: function() {
    var commentForm;
    if(localStorage.session){
      commentForm = <CommentForm onCommentSubmit={this.props.handleCommentSubmit} />
    }
    else{
      commentForm = <a href="/login.html">Login to comment</a>;
    }
    return (
      <div className="commentBox">
        <h3>Comments</h3>
        <CommentList data={this.props.comments} />
        {commentForm}
      </div>
    );
  }
});

var CommentList = React.createClass({
  render: function() {
    var commentNodes = this.props.data.map(function(comment) {
      return (
        <Comment author={comment.author} created_at={comment.created_at} key={comment.id}>
          {comment.body}
        </Comment>
      );
    });
    return (
      <div className="commentList">
        {commentNodes}
      </div>
    );
  }
});

var CommentForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var author = e.currentTarget["author"].value.trim();
    var body = e.currentTarget["body"].value.trim();
    if (!body || !author) {
      return;
    }
    this.props.onCommentSubmit({author: author, body: body});
    e.currentTarget["author"].value = '';
    e.currentTarget["body"].value = '';
    
  },
  render: function() {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <input
          type="text"
          name="author"
          placeholder="Your name"
          
        />
        <textarea
          type="text"
          name="body"
          placeholder="Say something..."
          
        />
        <input type="submit" value="Post" />
      </form>
    );
  }
});

var Post = React.createClass({
  rawMarkup: function() {

    var rawMarkup = marked(this.props.post.body.toString(), {sanitize:true});
    return { __html: rawMarkup };
  },
  render: function() {
    return (
      <div className="commentBox">
        <h1>{this.props.post.title}</h1>
        <h3>by {this.props.post.author}</h3>
        <div dangerouslySetInnerHTML={this.rawMarkup()} />
      </div>
    );
  }
});

var Page = React.createClass({
  handleCommentSubmit: function(comment) {
    comment.post = this.props.postId;
    
    var headers = {
      "Prefer":"plurality=singular",
      "Prefer":"return=representation"
    };

    if(localStorage.session){
      headers["Authorization"] = 'Bearer ' + localStorage.session
    }
    $.ajax({
      contentType: 'application/json',
      data: JSON.stringify(comment),
      url: '/api/comments',
      dataType: 'json',
      type: 'POST',
      headers: headers,
      processData: false,
      success: function(comment) {
        var newpost = this.state.post;
        newpost.comments = newpost.comments.concat([comment]);
        this.setState({post: newpost});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  loadData: function(){
    
    var headers = {
      "Prefer":"plurality=singular"
    };
    if(localStorage.session){
      headers["Authorization"] = 'Bearer ' + localStorage.session
    }
    $.ajax({
      url: '/api/posts/' + this.props.postId + '?select=*,comments{*}',
      dataType: 'json',
      cache: true,
      headers: headers,
      success: function(post) {
        this.setState({post: post});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {
      post: {
        title: '',
        body: '',
        comments: []
      }
    };
  },
  componentDidMount: function(){
    this.loadData();
  },
  render: function() {
    return (
      <div>
      <Post post={this.state.post} />
      <CommentBox comments={this.state.post.comments || []} postId={this.props.postId} handleCommentSubmit={this.handleCommentSubmit} />
      </div>
    );
  }
});

var postId = parseInt(window.location.pathname.replace(/[^0-9]/g, ''));
ReactDOM.render(
  <Page postId={postId}/>,
  document.getElementById('content')
);
