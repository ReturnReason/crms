import React,{Component} from 'react';
import Content from './Content/Content'
import Sidebar from './Sidebar/Sidebar'
import './Board.css';
import { connect } from 'react-redux';
import Accordion from './Sidebar/Accordion';

class Board extends Component{
    render(){
        return(
            <main className="brd">
                <Content/>
                {/* <Sidemenu/> */}
                <Accordion />
            </main>
        );
    }
}

export default Board;