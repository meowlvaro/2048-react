import React from 'react';
const { PropTypes } = React;

// Components
import Square from './Square';
import ActiveSquare from './ActiveSquare';

// data
import ActiveSquareStore from './data/ActiveSquareStore';


export default React.createClass({

  getInitialState() {
    return {
      isGameOver: ActiveSquareStore.isGameOver()
    }
  },

  componentDidMount() {

    ActiveSquareStore.addChangeListener(this._onChange);

  },

  componentWillUnmount() {
    ActiveSquareStore.removeChangeListener(this._onChange);
  },

  // change listenenr
  _onChange() {
    this.setState({
      isGameOver: ActiveSquareStore.isGameOver()
    });
  },

  renderRow( rowId ) {

    // for each row build a square corresponding to # of columns
    let squares = [];

    for( var i = 0; i < this.props.columns; i++ ) {
      squares[i] = [];
    }

    let squareId = 0 + (rowId * this.props.rows);


    return (
      <div className="row" key={ 'r' + rowId }>
        {squares.map( () => {
            return <Square key={ 's' + (squareId++)} />
        })}
      </div>
    )
  },

  render() {

    return (
      <div className="board">
        {this.state.isGameOver && this.renderGameOver()}
        {this.renderGame()}
      </div>
    )
  },

  renderGameOver() {
    return (
      <div className="gameOver">
        <h1>Game Over</h1>
      </div>
    )
  },

  renderGame() {

    let rows = [];
    for( var i = 0; i < this.props.rows; i++ ) {
      rows[i] = [];
    }
    let rowId = 0;

    let activeSquares = this.props.activeSquares || {};


    return (
      <div>
        {rows.map(() => {
          return this.renderRow( rowId++ );
        })}
        {Object.keys(activeSquares).map( uid => {
          let properties = activeSquares[uid];
          return (<ActiveSquare key={uid} {...properties} />)
        })}
      </div>
    )
  },

  propTypes: {
    columns: PropTypes.number,
    rows: PropTypes.number
  }
});
