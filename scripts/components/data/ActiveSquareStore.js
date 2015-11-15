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
    }

});


// lots of listeners
ActiveSquareStore.setMaxListeners(24);


AppDispatcher.register(function(action) {
  switch(action.actionType) {
    case 'create':
      create( action.allowLarge );
      ActiveSquareStore.emitChange();
      break;
    case 'move':
      create( true );
      ActiveSquareStore.emitChange();

      setTimeout(()=>{
        move( action.direction );
      }, 50)
      break;
  }
});

function move( direction ) {
  // create 2 dimensional array
  let isVertical = (direction === 'up' || direction === 'down');
  let activeSquareArray = buildActiveSquareArray( isVertical );

  // is the movement additive, or subtractive i.e. will it add to the x || y Coord?
  let isAdditive = (direction === 'down' || direction === 'right');
  moveSquares( activeSquareArray, isVertical, isAdditive );
}

function buildActiveSquareArray( isVertical ) {
  var output = [ [ [], [], [], [], ], [ [], [], [], [], ], [ [], [], [], [], ] , [ [], [], [], [],  ] ];

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

function moveSquares( activeSquareArray, isVertical, isAdditive ) {
  var unmoveableSquares = {};
  while( Object.keys(unmoveableSquares).length < Object.keys(activeSquares).length ) {
    // activeSquareArray = activeSquareArray.reverse();
    activeSquareArray.forEach( layer => {
      layer = layer.reverse();
      layer.forEach( activeSquare => {

        // arrays don't have uids :
        if( activeSquare.uid ) {
          // console.log( 'prev', activeSquare );
          const {xCoord, yCoord} = activeSquare;
          let coord = (isVertical) ? yCoord : xCoord;

          // let i = 0;
          // removed super hacky i++ < 1000

          while( true ) {
            if( coord >= 1 && coord <= 4 ) {
              coord = (isAdditive) ? coord+1 : coord-1;
            } else {
              coord = (isAdditive) ? coord-1 : coord+1;
              if( !unmoveableSquares[ activeSquare.uid ] ) {
                unmoveableSquares[ activeSquare.uid ] = true;
              }
              break;
            }

            if( !areCoordinatesValid( (!isVertical ? coord : xCoord), (isVertical ? coord : yCoord), true, activeSquare.uid) ) {
              coord = (isAdditive) ? coord-1 : coord+1;
              if( !unmoveableSquares[ activeSquare.uid ] ) {
                unmoveableSquares[ activeSquare.uid ] = true;
              }
              break;
            }
          }

          if( isVertical ) {
            activeSquare.yCoord = coord;
          } else {
            activeSquare.xCoord = coord;
          }
          ActiveSquareStore.emitChange();
        }
      });
    });

  }
}



function create( allowLarge ) {
  let uid = generateUID(),
      value = generateRandomValue( allowLarge ),
      xCoord = generateRandomCoord(),
      yCoord = generateRandomCoord();


  if( Object.keys(activeSquares).length === 16 ) {
    ActiveSquareStore.emitChange();
    return;
  }

  let emergencyBreak = 16;

  while( !areCoordinatesValid( xCoord, yCoord ) ) {
    xCoord = generateRandomCoord();
    yCoord = generateRandomCoord();

    if( emergencyBreak-- == 0 ) {
      console.log( 'bad math' );
      break;
    }
  }

  let newSquare = {
    uid,
    xCoord,
    yCoord,
    value
  };

  activeSquares[ uid ] = newSquare;
  return newSquare;
}

function areCoordinatesValid( xCoord=false, yCoord=false, mergeIfCollided, mergeUID ) {

  return !Object.keys(activeSquares).filter( uid => {
    let activeSquare = activeSquares[uid];
    if( !activeSquare ) {
      return false;
    }

    let collision = activeSquare.xCoord === xCoord && activeSquare.yCoord === yCoord;
    // if( mergeUID ) {
    //   collision = activeSquare.xCoord === xCoord && activeSquare.yCoord === yCoord && uid !== mergeUID;
    // }

    if( collision && mergeIfCollided && uid !== mergeUID ) {
      if( !activeSquares[mergeUID] ) {
        return false;
      }

      if( activeSquares[mergeUID].value === activeSquare.value ) {
        setTimeout(()=>{
          activeSquare.value += activeSquare.value;
          delete activeSquares[ mergeUID ];
          ActiveSquareStore.emitChange();
        }, 250);
        collision = false;
      }
    }

    return collision;
  }).length;

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
