/*
  App
*/

import React from 'react';
// import Dispatch from './Dispatch';

import AppDispatcher from './data/Dispatch';

// Components
import Board from './Board';
import ActiveSquare from './ActiveSquare';
import ActiveSquareStore from './data/ActiveSquareStore';

// Firebase
// import Rebase  from 're-base';
// var base = Rebase.createClass('https://catch-off-the-day.firebaseio.com/');

const ROWS = 4,
      COLUMNS = 4;


export default React.createClass({

  getInitialState() {

    this.setKeyListeners();

    return {
      rows: ROWS,
      columns: COLUMNS,
      activeSquares: ActiveSquareStore.getAllSquares()
    };
  },

  setKeyListeners() {
    document.onkeydown = this.keyListener;
  },

  keyListener(event) {

    let keyCode = event.keyCode;

    if(
        keyCode !== 37 &&
        keyCode !== 38 &&
        keyCode !== 39 &&
        keyCode !== 40
    ) {
      return;
    }

    event.preventDefault();

    let direction = false;

    switch( keyCode ) {
        case 38:
            // handle up
            direction = 'up';
            break;
        case 40:
            // handle down
            direction = 'down';
            break;
        case 37:
            // handle left
            direction = 'left';
            break;
        case 39:
            // handle right
            direction = 'right';
            break;
     }

     if( !!direction ) {
       AppDispatcher.dispatch({
         actionType: 'move',
         direction
       });
     }
  },

  spawnSquare() {
    AppDispatcher.dispatch({
      actionType: 'create',
      allowLarge: false
    });
  },

  componentDidMount() {

    ActiveSquareStore.addChangeListener(this._onChange);

    // if new game
    this.spawnSquare();

    // base.syncState(this.props.params.storeId + '/fishes', {
    //   context : this,
    //   state : 'fishes'
    // });
    //
    // var localStorageRef = localStorage.getItem('order-' + this.props.params.storeId);
    //
    // if(localStorageRef) {
    //   // update our component state to reflect what is in localStorage
    //   this.setState({
    //     order : JSON.parse(localStorageRef)
    //   });
    // }

  },

  componentWillUnmount() {
    ActiveSquareStore.removeChangeListener(this._onChange);
  },

  componentWillUpdate(nextProps, nextState) {
    // debugger;
    // localStorage.setItem('order-' + this.props.params.storeId, JSON.stringify(nextState.order));
  },

  // change listenenr
  _onChange() {
    this.setState({
      activeSquares: ActiveSquareStore.getAllSquares(),
      isGameOver: ActiveSquareStore.isGameOver()
    });
  },

  render() {

    return (
      <Board {...this.state} />
    )
  }


});
