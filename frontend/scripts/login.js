

var LoginForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var credentials = {
      email: e.currentTarget["email"].value,
      pass: e.currentTarget["pass"].value
    }
    $.ajax({
      contentType: 'application/json',
      data: JSON.stringify(credentials),
      url: '/api/rpc/login',
      dataType: 'json',
      type: 'POST',
      processData: false,
      success: function(data) {
        console.log(data);
        if(data.token){
          localStorage.session = data.token;
        }
        window.location = '/';
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(err.toString());
      }.bind(this)
    });
  },
  render: function() {
    return (
      <form className="loginForm" onSubmit={this.handleSubmit}>
        <input
          type="text"
          name="email"
          defaultValue="joe@begriffs.com"
          placeholder="Email"
        />
        <input
          type="password"
          name="pass"
          defaultValue="nelson"
          placeholder="Password"
        />
        <input type="submit" value="Login" />
      </form>
    );
  }
});


ReactDOM.render(
  <LoginForm/>,
  document.getElementById('content')
);
