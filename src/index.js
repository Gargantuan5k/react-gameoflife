import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { ButtonToolbar, Dropdown, DropdownButton } from 'react-bootstrap';

// alert("There may be some minor visual glitches with the grid, especially with Firefox browser. Try zooming in/out :)")

class Box extends React.Component {
    selectBox = () => {
        this.props.selectBox(this.props.row, this.props.col)
    }

    render() {
        return (
            <div
                className={this.props.boxClass}
                id={this.props.id}
                onClick={this.selectBox}
            />
        );
    }
}

class Grid extends React.Component {
    render() {
        const width = (this.props.cols * 14);
        var rowsArr = [];

        var boxClass = "";
        for (var i = 0; i < this.props.rows; i++) {
            for (var j = 0; j < this.props.cols; j++) {
                let boxID = i + "_" + j;

                boxClass = this.props.gridFull[i][j] ? "box on" : "box off";
                rowsArr.push(
                    <Box
                        boxClass={boxClass}
                        key={boxID}
                        boxID={boxID}
                        row={i}
                        col={j}
                        selectBox={this.props.selectBox}
                    />
                );
            }
        }

        return (
            <div className="grid" style={{ width: width }}>
                {rowsArr}
            </div>
        );
    }
}

class Buttons extends React.Component {
    handleSelectGridSize = (event) => {
        this.props.gridSize(event);
    } 

    render() {
        return (
            <div className="center">
                <ButtonToolbar>
                    <button className="btn btn-default menu_button" onClick={this.props.clear}>Clear</button>
                    <button className="btn btn-default menu_button" onClick={this.props.seed}>Seed</button>
                    <button className="btn btn-default menu_button" onClick={this.props.pauseButton}>Pause</button>
                    <button className="btn btn-default menu_button" onClick={this.props.playButton}><strong>Simulate!</strong></button>
                    <button className="btn btn-default menu_button" onClick={this.props.slow}>Slow</button>
                    <button className="btn btn-default menu_button" onClick={this.props.fast}>Fast</button>
                    <DropdownButton
                        title="Grid Size"
                        id="size-menu"
                        onSelect={this.handleSelectGridSize}>
                        <Dropdown.Item eventKey="1">Small</Dropdown.Item>
                        <Dropdown.Item eventKey="2">Medium</Dropdown.Item>
                        <Dropdown.Item eventKey="3">Large</Dropdown.Item>
                        <Dropdown.Item eventKey="5">Gigantic</Dropdown.Item>
                    </DropdownButton>
                </ButtonToolbar>
            </div>
        );
    }
}

class Main extends React.Component {
    constructor() {
        super();
        this.speed = 100;
        this.rows = 30;
        this.cols = 50;

        this.state = {
            generation: 0,
            gridFull: Array(this.rows).fill().map(() => Array(this.cols).fill(false)),
        }
    }

    selectBox = (row, col) => {
        let gridCopy = arrayClone(this.state.gridFull);
        gridCopy[row][col] = !gridCopy[row][col]
        this.setState({
            gridFull: gridCopy
        });
    }

    seed = () => {
        let gridCopy = arrayClone(this.state.gridFull);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (Math.floor(Math.random() * 4) === 1) {
                    gridCopy[i][j] = true;
                }
            }
        }
        this.setState({
            gridFull: gridCopy
        });
    }

    playButton = () => {
        clearInterval(this.intervalID);
        this.intervalID = setInterval(this.play, this.speed);
    }

    pauseButton = () => {
        clearInterval(this.intervalID);
    }

    slow = () => {
        this.speed = 1000;
        this.playButton();
    }

    fast = () => {
        this.speed = 100;
        this.playButton();
    }

    clear = () => {
        this.pauseButton();
        var grid = Array(this.rows).fill().map(() => Array(this.cols).fill(false));
        this.setState({
            gridFull: grid,
            generation: 0
        });
    }

    gridSize = (size) => {
        switch (size) {
            case "1":
                this.cols = 20;
                this.rows = 10;
            break;

            case "2":
                this.cols = 50;
                this.rows = 30;
            break;

            case "3":
                this.cols = 70;
                this.rows = 50;
            break;

            default:
                this.cols = 100;
                this.rows = 100;
        }
        this.clear();
    }

    play = () => {
        let g = this.state.gridFull;
        let g2 = arrayClone(this.state.gridFull);

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                let count = 0;
                if (i > 0) if (g[i - 1][j]) count++;
                if (i > 0 && j > 0) if (g[i - 1][j - 1]) count++;
                if (i > 0 && j < this.cols - 1) if (g[i - 1][j + 1]) count++;
                if (j < this.cols - 1) if (g[i][j + 1]) count++;
                if (j > 0) if (g[i][j - 1]) count++;
                if (i < this.rows - 1) if (g[i + 1][j]) count++;
                if (i < this.rows - 1 && j > 0) if (g[i + 1][j - 1]) count++;
                if (i < this.rows - 1 && j < this.cols - 1) if (g[i + 1][j + 1]) count++;
                if (g[i][j] && (count < 2 || count > 3)) g2[i][j] = false;
                if (!g[i][j] && count === 3) g2[i][j] = true;
            }
        }

        this.setState({
            gridFull: g2,
            generation: this.state.generation + 1
        })
    }

    componentDidMount() {
        this.seed();
    }

    render() {
        return (
            <div>
                <h1>The Game of Life (<a href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life" target="new">?</a>)</h1>
                

                <Buttons
                    playButton={this.playButton}
                    pauseButton={this.pauseButton}
                    fast={this.fast}
                    slow={this.slow}
                    clear={this.clear}
                    seed={this.seed}
                    gridSize={this.gridSize}
                />
                <Grid
                    gridFull={this.state.gridFull}
                    rows={this.rows}
                    cols={this.cols}
                    selectBox={this.selectBox}

                />
                <h2>Generations: {this.state.generation}</h2>
                <h5>Board size: {this.rows}x{this.cols}<br />Speed: {this.speed}ms<br /></h5>
            </div>
        );
    }
}

function arrayClone(arr) {
    return JSON.parse(JSON.stringify(arr));
}

ReactDOM.render(<Main />, document.getElementById('root'));