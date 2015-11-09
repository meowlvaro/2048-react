import React  from 'react';
import ReactDOM  from 'react-dom';
import { Router, Route } from 'react-router';
import { createHistory } from 'history';

import NotFound from './components/NotFound';
import Game from './components/Game';

/*
  Routes
*/

var routes = (
  <Router history={createHistory()}>
    <Route path="/" component={Game}/>
    <Route path="*" component={NotFound}/>
  </Router>
)

ReactDOM.render(routes, document.querySelector('#main'));
