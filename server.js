const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sudokuSolver = require('./solver');
const path = require('path');


const app = express();
app.use(cors());
const port = 3000;

app.use(bodyParser.json());

app.post('/api/sudoku', (req, res) => {
  const sudokuBoard = req.body.board;

  console.log('Received Sudoku Board:', sudokuBoard);

  const solvedGrid = sudokuSolver.solver(sudokuBoard);

  if (solvedGrid === null) {
    // Board is unsolvable
    console.log('Unsolvable Sudoku Board');
  } else {
    // Board is solvable
    console.log('Solved Sudoku Board:', solvedGrid);
    
    
  }
  res.json({ solvedGrid });
});


app.use(express.static(path.join(__dirname, 'build')));


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
