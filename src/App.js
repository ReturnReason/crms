import React,{Component} from 'react';
import Board from './Components/Board';
import './App.scss';

class App extends Component{
  render(){
    return(
      <div className="App">
        <Board/>
      </div>
    );
  }
}

export default App;
