

var ArticlesBox = React.createClass({
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
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
  },
  render: function() {
    return (
      <div>
        <h3>Articles</h3>
        <ArticlesList data={this.state.data} />
      </div>
    );
  }
});

var ArticlesList = React.createClass({
  render: function() {
    var articleNodes = this.props.data.map(function(article) {
      return (
        <Article article={article}  key={article.id} />
      );
    });
    return (
      <div>
        {articleNodes}
      </div>
    );
  }
});

var Article = React.createClass({
  render: function() {
    return (
      <div>
        <h1><a href={'article.html?articleId=' + this.props.article.id}>{this.props.article.title}</a></h1>
        <h3>by {this.props.article.author} on {this.props.article.created_at}</h3>
      </div>
    );
  }
});

var Page = React.createClass({
  render: function() {
    var articlesUrl = '/api/posts';
    return (
      <div>
      <ArticlesBox url={articlesUrl} />
      </div>
    );
  }
});

ReactDOM.render(
  <Page/>,
  document.getElementById('content')
);
