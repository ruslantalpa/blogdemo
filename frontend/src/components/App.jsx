import React from 'react';
import { Link } from 'react-router';

export default React.createClass({
  render: function() {
  	return <div>
  		<div className="callout large primary">
			<div className="row column text-center">
				<h1><Link to="/">PostgREST Demo</Link></h1>
			</div>
		</div>
		<div className="row medium-8 large-7 columns">
		{this.props.children}
		</div>
		</div>
    return ;
  }
});