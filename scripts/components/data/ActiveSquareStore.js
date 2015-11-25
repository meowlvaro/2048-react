import AppDispatcher from './Dispatch';
import { EventEmitter } from 'events';
import assign from 'object-assign';

var activeSquares = {};

var CHANGE_EVENT = 'change';

var ActiveSquareStore = assign({}, EventEmitter.prototype, {

    // Actual collection of model data

    // Accessor method we'll use later
    getAllSquares() {
      return activeSquares;
    },

    isGameOver() {
      return Object.keys(activeSquares).length === 16;
    },

    getSquare( uid ) {
      return activeSquares[uid];
    },

    emitChange: function() {
      this.emit(CHANGE_EVENT);
    },

    addChangeListener: function(callback) {
      this.on(CHANGE_EVENT, callback);
    },

    removeChangeListener: function(callback) {
      this.removeListener(CHANGE_EVENT, callback);
    },

    canChange: true

});


// lots of listeners
ActiveSquareStore.setMaxListeners(24);


AppDispatcher.register(function(action) {

  if( ActiveSquareStore.isGameOver() || !ActiveSquareStore.canChange ) {
    return;
  }

  ActiveSquareStore.canChange = false;

  switch(action.actionType) {
    case 'create':
      create( action.allowLarge );
      ActiveSquareStore.emitChange();
      setTimeout(function(){
        ActiveSquareStore.canChange = true;
      }, 250);
      break;
    case 'move':
      move( action.direction );

      // after moving create
      break;
  }

});

function move( direction ) {
  // create 2 dimensional array
  let isVertical = (direction === 'up' || direction === 'down');
  // let activeSquareArray = buildActiveSquareArray( isVertical );

  // is the movement additive, or subtractive i.e. will it add to the x || y Coord?
  let isAdditive = (direction === 'down' || direction === 'right');
  moveSquares( isVertical, isAdditive );
}

function buildActiveSquareArray( isVertical ) {
  var output = [ [ false, false, false, false, ],
                 [ false, false, false, false, ],
                 [ false, false, false, false, ] ,
                 [ false, false, false, false, ] ];

  Object.keys(activeSquares).forEach( uid => {
    let activeSquare = activeSquares[uid],
        { xCoord, yCoord } = activeSquare;

    xCoord -= 1;
    yCoord -= 1;

    if( isVertical ) {
      output[ xCoord ][ yCoord ] = activeSquare;
    } else {
      output[ yCoord ][ xCoord ] = activeSquare;
    }
  });

  return output;
}

function moveSquares( isVertical, isAdditive ) {

  Object.keys(activeSquares).forEach( uid => {

    let activeSquare = activeSquares[uid];

    if( activeSquare.isNew ) {
      return;
    }

    // step 1. move the square as far as possible within bounds
    // step 2. move the square as far as possible before hitting another square
    moveSquare( activeSquare, isVertical, isAdditive );
    ActiveSquareStore.emitChange();
  });

  setTimeout(function(){
    create( true );
    ActiveSquareStore.emitChange();
    ActiveSquareStore.canChange = true;
  }, 250);

}

function moveSquare( activeSquare, isVertical, isAdditive ) {

  do {

    let newCoord = false;
    if( isVertical ) {
      newCoord = (isAdditive ? activeSquare.yCoord+1 : activeSquare.yCoord-1);
    } else {
      newCoord = (isAdditive ? activeSquare.xCoord+1 : activeSquare.xCoord-1);
    }

    if( !newCoord || newCoord > 4 || newCoord < 1 ) {
      break;
    }

    // merge case
    const xCoord = (!isVertical ? newCoord : activeSquare.xCoord),
          yCoord = (isVertical ? newCoord : activeSquare.yCoord);
    if( !areCoordinatesValid( xCoord, yCoord ) ) {

      let badSquares = Object.keys(activeSquares).filter( uid => {
        let badSquare = activeSquares[uid];
        return badSquare.uid !== activeSquare.uid &&
               badSquare.xCoord === xCoord &&
               badSquare.yCoord === yCoord;
      });

      if( badSquares.length ) {
        let badSquare = activeSquares[badSquares[0]];

        if( badSquare.value === activeSquare.value ) {
          badSquare.value += activeSquare.value;
          delete activeSquares[activeSquare.uid];
        }

        break;
      }

    }

    activeSquare.xCoord = xCoord;
    activeSquare.yCoord = yCoord;

  } while( isSquareWithinBounds(activeSquare, isVertical) )
  // if( activeSquare.xCoord > 4 ) {
  //   activeSquare.xCoord--;
  // }
  // if( activeSquare.yCoord > 4 ) {
  //   activeSquare.yCoord--;
  // }
  // if( activeSquare.xCoord < 1 ) {
  //   activeSquare.xCoord++;
  // }
  // if( activeSquare.yCoord < 1 ) {
  //   activeSquare.yCoord++;
  // }
}

function isSquareWithinBounds( activeSquare, isVertical ) {
  return (isVertical) ? (activeSquare.yCoord > 1 && activeSquare.yCoord < 4) :
                        (activeSquare.xCoord > 1 && activeSquare.xCoord < 4);
}

function create( allowLarge ) {

  let uid = generateUID(),
      value = generateRandomValue( allowLarge );
      // xCoord = generateRandomCoord(),
      // yCoord = generateRandomCoord();


  if( Object.keys(activeSquares).length === 16 ) {
    // ActiveSquareStore.emitChange();
    return false;
  }

  let availableSquareArray = [];

  let takenSquareHash = {};
  Object.keys(activeSquares).forEach( uid => {
    let activeSquare = activeSquares[uid];

    if( activeSquare ) {
      let xCoord = activeSquare.xCoord + '',
          yCoord = activeSquare.yCoord + '';

      takenSquareHash[ xCoord + yCoord ] = true;
    }

  });

  for( var x=1; x <= 4; x++ ) {
    for(var y=1;  y <= 4; y++ ) {
      let xC = x+'',
          yC = y+'';

      if( !takenSquareHash[ xC+yC ] ) {
        availableSquareArray.push({
          xCoord: x,
          yCoord: y
        });
      }
    }
  }

  console.log('here');

  let randomIdx = Math.round(Math.random() * 1000) % availableSquareArray.length;
  const { xCoord, yCoord } = availableSquareArray[ randomIdx ];

  let newSquare = {
    uid,
    xCoord,
    yCoord,
    value,
    isNew: true
  };

  setTimeout(function(){
    activeSquares[uid].isNew = false;
  }, 250);

  // console.log('newest ' + uid);

  activeSquares[ uid ] = newSquare;
  return newSquare;
}

function areCoordinatesValid( xCoord=false, yCoord=false ) {
  return !document.getElementsByClassName( 'x-'+xCoord+' y-'+yCoord ).length;
}

function generateUID() {
  let uid = false;

  while( !uid || activeSquares[ uid ] ) {
    uid = Math.random().toString(36).substring(2,9);
  }

  return uid;
}

// Helper methods
function generateRandomCoord() {
  return Math.ceil((Math.random() * 100000) % 4);
}

function generateRandomValue( allowLarge ){
  let mod = (allowLarge ? 4 : 2);
  return Math.pow( 2, Math.ceil((Math.random() * 10) % mod) );
}

module.exports = ActiveSquareStore;
