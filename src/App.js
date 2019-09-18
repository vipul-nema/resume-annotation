import React from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route } from 'react-router-dom'
import Header from "./app/header";
import List from './app/list';
import Upload from './app/upload';
import Annotate from './app/annotate';

function App() {
  return (
    <div className="App">
      <Router>
        <header className="App-header">
          <Header />
        </header>
        <div className="App-body">
          <Route exact path="/" component={List} />
          <Route path="/list" component={List} />
          <Route path="/upload" component={Upload} />
          <Route path="/annotate/:htmlFileName" exact={false} component={Annotate} />
        </div>
      </Router>


    </div>
  );
}

export default App;
