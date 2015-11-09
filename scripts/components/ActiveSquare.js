import React from 'react';
const { PropTypes } = React;

import ActiveSquareStore from './data/ActiveSquareStore';

import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

export default React.createClass({

  getInitialState() {

    return this.props

  },

  render() {

    const { xCoord, yCoord, value } = this.state;

    let position = 'active square x-' + xCoord + ' y-' + yCoord;
    return (
      <ReactCSSTransitionGroup transitionName="activeSquare" transitionEnterTimeout={500} transitionLeaveTimeout={500} className={position}>
        <p ref={value} className="value">{value}</p>
      </ReactCSSTransitionGroup>
    )
  },

  componentDidMount() {
    ActiveSquareStore.addChangeListener(this._onChange);
  },

  componentWillUnmount() {
    ActiveSquareStore.removeChangeListener(this._onChange);
  },

  _onChange() {
    let uid = this.props.uid;
    let activeSquare = ActiveSquareStore.getSquare( uid );
    if( activeSquare ) {
      this.setState( activeSquare );
    }
  },

  propTypes: {
    latestEvent: PropTypes.string
  }
});
