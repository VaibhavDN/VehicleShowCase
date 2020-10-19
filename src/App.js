import React from 'react';
import './App.css';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";

import TDCarList from './components/threedcarmodel.component';

function App() {
  return (
    <Router>
      <Route path="/" component={TDCarList}/>
    </Router>
  );
}

export default App;
