import React from 'react';
// import logo from './logo.svg';
import './App.scss';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Header from "./app/header";
import List from './app/list';
import Upload from './app/upload';
import Annotate from './app/annotate';

const NoMatch = () => {
  return <div className="page404">404 No page found </div>
}

function App() {
  return (
    <div className="App">
      <Router>
        <header className="App-header">
          <Header />
        </header>
        <div className="App-body">
          <Switch>
            <Route exact path="/" component={List} />
            <Route path="/list/:admin?" component={List} />
            <Route exact path="/upload" component={Upload} />
            <Route exact path="/annotate/:htmlFileName" exact={false} component={Annotate} />
            <Route component={NoMatch} />
          </Switch>
        </div>
      </Router>


    </div>
  );
}

export default App;
