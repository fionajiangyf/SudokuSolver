import React, { useState } from 'react';
import './SudokuGrid.css';


let originalPuzzle = [];
let currentPuzzle = [];
const SudokuGrid = () => {
  const [grid, setGrid] = useState(createEmptyGrid());
  const [solvable, setSolvable] = useState(true);

  function createEmptyGrid() {
    return Array.from({ length: 9 }, () => Array(9).fill(''));
  }


// Function to handle user input in cells
    function handleCellInput(event, row, col) {
        const value = event.target.value;
    
        // Allow only numbers 1-9 or delete
        if (/^[1-9]?$/.test(value)) {
        const newGrid = [...grid];
    
        if (originalPuzzle[row][col] === '') {
            newGrid[row][col] = value;
            setGrid(newGrid);
        }
        }
    }
    

  // Function to handle loading a board from a text file
    async function loadBoardFromFile(fileContent) {
        const newGrid = createEmptyGrid();
    
        // Parse file content and update the grid
        fileContent.split('\n').forEach((line, rowIndex) => {
        line.trim().split('').forEach((char, colIndex) => {
            if (char !== '*') {
            newGrid[rowIndex][colIndex] = char;
            }
        });
        });
        originalPuzzle = newGrid.map(row => [...row]);
        setGrid(newGrid);
    }
  



  // Function to handle difficulty selection
  async function handleDifficulty(difficulty) {
    try {
        const jsonData = await import(`./${difficulty}.json`);
        const fileContent = jsonData.text;
        console.log(fileContent);
        loadBoardFromFile(fileContent);

    } catch (error) {
        console.error('Error loading the board:', error);
    }
  }
// Function to handle solving the Sudoku board
async function handleSolve() {
    try {
      currentPuzzle = grid.map(row => [...row]);
      const response = await fetch('http://localhost:3000/api/sudoku', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ board: grid }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! Status: ${response.status}, Error: ${errorData.error}`);
      }
  
      const data = await response.json();
      console.log(data);
      
        
      if (data === null) {
        setSolvable(false);
        const newGrid = createEmptyGrid();
        originalPuzzle = newGrid.map(row => [...row]);
        setGrid(currentPuzzle);
      } else {
        const solvedGrid = data.solvedGrid;
        setSolvable(true);
        setGrid(solvedGrid);
              }
    } catch (error) {
      console.error('Error solving Sudoku:', error);
          }
  }
  
  function handleClear() {
    const newGrid = createEmptyGrid();
    originalPuzzle = newGrid.map(row => [...row]);
    setGrid(newGrid);
  }

  function handleClosePopup() {
    setSolvable(true);
    handleClear();
  }


return (
    <div className="sudoku-container">
        <div className="sudoku-grid">
        {grid === null ? (
          <>
          <p>Cannot solve the Sudoku board. Please check your input.</p>
          <button className="popup-button" onClick={handleClosePopup}>
          Close
          </button>
        </>
        ) : (
            <>
              {grid.map((row, rowIndex) => (
                <div key={rowIndex} className="row">
                  {row.map((cell, colIndex) => (
                    <input
                      key={colIndex}
                      type="text"
                      maxLength={1}
                      className="cell"
                      value={cell}
                      onChange={(event) => handleCellInput(event, rowIndex, colIndex)}
                    />
                  ))}
                </div>
              ))}
              <div className="button-container">
                <button className="clear-button" onClick={() => handleClear()}>
                  Clear
                </button>
                <button className="difficulty-button easy" onClick={() => handleDifficulty('easy')}>
                  Easy
                </button>
                <button className="difficulty-button medium" onClick={() => handleDifficulty('medium')}>
                  Medium
                </button>
                <button className="difficulty-button hard" onClick={() => handleDifficulty('hard')}>
                  Hard
                </button>
                <button className="solve-button" onClick={() => handleSolve()}>
                  Solve
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
    }



export default SudokuGrid;
