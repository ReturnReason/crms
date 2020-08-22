import React,{Component} from 'react';
import Board from './Components/Board';
import './App.css';
import Main from './Components/Main';
import Detail from './Components/Detail/Detail';
import Listview from './Components/Listview/Listview';
import Dashboard from './Components/Dashboard/Dashboard';

class App extends Component{
  render(){
    return(
      <div className="App">
        {/* <Main/> */}
        <Board/>
        {/* <Detail /> */}
        {/* <Listview /> */}
        {/* <Dashboard/> */}
      </div>
    );
  }
}

export default App;
