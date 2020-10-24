import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
        <button className={`square ${props.shouldHighlight ? 'highlight' : ''}`} onClick={() => props.onClick()}>
          {props.value}
        </button>
    );
}

function ToggleButton(props) {
    return (
        <button onClick={() => props.onClick()}>
            {props.value}
        </button>
    )
}

class Board extends React.Component {
    renderSquare(i) {
      return <Square 
        value={this.props.squares[i]} 
        shouldHighlight={(this.props.highlightedSquares || []).includes(i)}
        onClick={() => this.props.onClick(i)}/>;
    }

    render() {
        
        return (<div>
            {
                [0,1,2].map(row => (<div className="board-row"> {[0,1,2].map(col => this.renderSquare(row * 3 + col))} </div>))
            }
        </div>);
    }
}
  
class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null)
            }],
            stepNumber: 0,
            xIsNext: true,
            isAscending: true
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[this.state.stepNumber];
        const squares = current.squares.slice();
        
        if(calculateWinner(squares) || squares[i]) return;


        squares[i] = this.state.xIsNext ? 'X' : 'O';
        
        this.setState({
            history: history.concat([{
                squares,
                lastIndexSelected: i,
            }]),
            xIsNext: !this.state.xIsNext,
            stepNumber: history.length,
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winningResult = calculateWinner(current.squares);
        
        const moves = history.map((step, move) => {
            const desc = move ?
                    `Go to move #${move}` :
                    `Go to move start`;
            const col = step.lastIndexSelected % 3 + 1;
            const row = Math.floor(step.lastIndexSelected / 3) + 1;

            const rowColText = move ? 
                <label>Row {row} Col {col} </label> : 
                undefined;

            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)} className={this.state.stepNumber === move ? 'history-current' : ''}>{desc}</button>
                    {rowColText}
                </li>
            )
        });

        const status = winningResult && winningResult.winner ? 
            `Winner: ${winningResult.winner}` :
            `Next player: ${this.state.xIsNext ? 'X' : 'O'}`;

        return (
            <div className="game">
            <div className="game-board">
                <Board 
                    squares={current.squares}
                    highlightedSquares={(winningResult && winningResult.squares) || []}
                    onClick={(i, coord) => this.handleClick(i, coord)} />
            </div>
            <div className="game-info">
                <div>{status}</div>
                <ol>{this.state.isAscending ? moves : moves.reverse()}</ol>
            </div>
            <div>
                <ToggleButton
                    value={`Sort ${this.state.isAscending ? 'Descending' : 'Ascending'}`}
                    onClick={() => this.changeStepOrder(!this.state.isAscending)}
                />
            </div>
            </div>
        );
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: step % 2 === 0
        });
    }

    changeStepOrder(isAscending) {
        this.setState({
            isAscending
        });
    }
}
  
// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
  

function calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return {
                winner: squares[a],
                squares: [a,b,c]
            }
        }
    }
    if(squares.every(k => k)) {
        return {
            winner: 'Tie'
        }
    }
    return null;
  }