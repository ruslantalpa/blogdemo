
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
  loadCommentsFromServer: function() {
    var headers = {};
    if(localStorage.session){
      headers["Authorization"] = 'Bearer ' + localStorage.session
    }
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: true,
      headers: headers,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit: function(comment) {
    comment.post = this.props.articleId;
    
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
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      headers: headers,
      processData: false,
      success: function(comment) {
        var comments = this.state.data;
        var newComments = comments.concat([comment]);
        this.setState({data: newComments});
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({data: comments});
        console.error(this.props.url, status, err.toString());
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
    var commentForm;
    if(localStorage.session){
      commentForm = <CommentForm onCommentSubmit={this.handleCommentSubmit} />
    }
    else{
      commentForm = <a href="login.html">Login to comment</a>;
    }
    return (
      <div className="commentBox">
        <h3>Comments</h3>
        <CommentList data={this.state.data} />
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
  getInitialState: function() {
    return {author: '', body: ''};
  },
  handleAuthorChange: function(e) {
    this.setState({author: e.target.value});
  },
  handleTextChange: function(e) {
    this.setState({body: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var author = this.state.author.trim();
    var body = this.state.body.trim();
    if (!body || !author) {
      return;
    }
    this.props.onCommentSubmit({author: author, body: body});
    this.setState({author: '', body: ''});
  },
  render: function() {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <input
          type="text"
          placeholder="Your name"
          value={this.state.author}
          onChange={this.handleAuthorChange}
        />
        <textarea
          type="text"
          placeholder="Say something..."
          value={this.state.body}
          onChange={this.handleTextChange}
        />
        <input type="submit" value="Post" />
      </form>
    );
  }
});

var Article = React.createClass({
  loadCommentsFromServer: function() {
    var headers = {
      "Prefer":"plurality=singular"
    };
    if(localStorage.session){
      headers["Authorization"] = 'Bearer ' + localStorage.session
    }
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: true,
      headers: headers,
      success: function(article) {
        this.setState({article: article});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {article: {title:"", body:"", author: ""}};
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
  },

  rawMarkup: function() {

    var rawMarkup = marked(this.state.article.body.toString(), {sanitize:true});
    return { __html: rawMarkup };
  },
  render: function() {
    return (
      <div className="commentBox">
        <h1>{this.state.article.title}</h1>
        <h3>by {this.state.article.author}</h3>
        <div dangerouslySetInnerHTML={this.rawMarkup()} />
      </div>
    );
  }
});

var Page = React.createClass({
  render: function() {
    var queryDict = {};
    location.search.substr(1).split("&").forEach(function(item) {queryDict[item.split("=")[0]] = item.split("=")[1]});
    var articleId = queryDict["articleId"];
    var commentsUrl = "/api/comments?post=eq." + articleId;
    var articleUrl  = "/api/posts?id=eq." + articleId;
    return (
      <div>
      <Article url={articleUrl} />
      <CommentBox url={commentsUrl} pollInterval={2000} articleId={articleId} />
      </div>
    );
  }
});

ReactDOM.render(
  <Page/>,
  document.getElementById('content')
);