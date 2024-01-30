function sudokuCells() {
  const cells = [];
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      cells.push([i, j]);
    }
  }
  return cells;
}

function sudokuArcs() {
  const arcs = new Set();

  // Rows and columns
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      for (let k = 0; k < 9; k++) {
        if (k !== j) {
          const arc1 = [[i, j], [i, k]];
          arcs.add(arc1);
          const arc2 = [[j, i], [k, i]];
          arcs.add(arc2);
        }
      }
    }
  }

  // 3x3 squares
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      for (let k = 0; k < 3; k++) {
        for (let w = 0; w < 3; w++) {
          const x = Math.floor(i / 3) * 3 + k;
          const y = Math.floor(j / 3) * 3 + w;
          if (i !== x || j !== y) {
            const arc3 = [[i, j], [x, y]];
            arcs.add(arc3);
          }
        }
      }
    }
  }

  return arcs;
}
function readBoardFromArray(sudokuArray) {
const board = {};

for (let row = 0; row < sudokuArray.length; row++) {
  const line = sudokuArray[row];

  for (let col = 0; col < line.length; col++) {
    const char = line[col];

    if (char === '') {
      board[[row,col]] = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    } else {
      board[[row,col]] = new Set([parseInt(char, 10)]);
    }
  }
}

return board;
}


class Sudoku {
  static CELLS = sudokuCells();
  static ARCS = new Set(sudokuArcs());

  constructor(board) {
    this.board = readBoardFromArray(board);
  }

  

  getValues(cell) {
    return this.board[cell];
  }

  removeInconsistentValues(cell1, cell2) {
    const val1 = this.getValues(cell1);
    const val2 = this.getValues(cell2);
    if (!Array.from(Sudoku.ARCS).some(arr => JSON.stringify(arr) === JSON.stringify([cell1, cell2]))) {
      return false;
    } else {
      if (val2.size === 1) {
        const val2Array = Array.from(val2);
        if (val1.has(val2Array[0])) {
          val1.delete(val2Array[0]);
          this.board[cell1] = val1;
          return true;
        }
      }
    }
    return false;
  }

  neighbors(cell) {
    const [x, y] = cell;
    const neighbor = new Set();
    for (let row = 0; row < 9; row++) {
      if (row !== x) {
        neighbor.add([row, y]);
      }
    }
    for (let col = 0; col < 9; col++) {
      if (col !== y) {
        neighbor.add([x, col]);
      }
    }
    for (let dx = 0; dx < 3; dx++) {
      for (let dy = 0; dy < 3; dy++) {
        const x1 = Math.floor(x / 3) * 3 + dx;
        const y1 = Math.floor(y / 3) * 3 + dy;
        if (x1 !== x || y1 !== y) {
          neighbor.add([x1, y1]);
        }
      }
    }
    return Array.from(neighbor);
  }

  inferAC3() {
    const queue = [...Sudoku.ARCS];
    while (queue.length !== 0) {
      const [cell1, cell2] = queue.pop();
      if (this.removeInconsistentValues(cell1, cell2)) {
        if (this.getValues(cell1).size === 0) {
          return false;
        }
        const neighbor = this.neighbors(cell1);
        if (neighbor.includes(cell2)) {
          neighbor.splice(neighbor.indexOf(cell2), 1);
        }
        for (const n of neighbor) {
          queue.push([n, cell1]);
        }
      }
    }
    return this.board;
  }

  rowNeighborsValues(cell) {
    const [x, y] = cell;
    const neighbor = new Set();
    for (let row = 0; row < 9; row++) {
      if (row !== x) {
        const values = this.getValues([row, y]);
        values.forEach(element => neighbor.add(element));
      }
    }
    return neighbor;
  }

  colNeighborsValues(cell) {
    const [x, y] = cell;
    const neighbor = new Set();
    for (let col = 0; col < 9; col++) {
      if (col !== y) {
        const values = this.getValues([x,col]);
        values.forEach(element => neighbor.add(element));
      }
    }
    return neighbor;
  }

  blockNeighborsValues(cell) {
    const [x, y] = cell;
    const neighbor = new Set();
    for (let dx = 0; dx < 3; dx++) {
      for (let dy = 0; dy < 3; dy++) {
        const x1 = Math.floor(x / 3) * 3 + dx;
        const y1 = Math.floor(y / 3) * 3 + dy;
        if (x1 !== x || y1 !== y) {
          const values = this.getValues([x1, y1]);
          values.forEach(element => neighbor.add(element));
        }
      }
    }
    return neighbor;
  }

  inferImproved() {
    let extraInference = true;
    while (extraInference) {
      this.inferAC3();
      extraInference = false;
      for (const cell of Sudoku.CELLS) {
        const values = this.getValues(cell);
        if (values.size > 1) {
          for (const v of values) {
            if (!this.rowNeighborsValues(cell).has(v)) {
              extraInference = true;
              this.board[cell] = new Set([v]);
              break;
            }
            if (!this.colNeighborsValues(cell).has(v)) {
              extraInference = true;
              this.board[cell] = new Set([v]);
              break;
            }
            if (!this.blockNeighborsValues(cell).has(v)) {
              extraInference = true;
              this.board[cell] = new Set([v]);
              break;
            }
          }
        }
    }
  }

    return this.board;
  }
  

  isSolved() {
    for (const cell of Sudoku.CELLS) {
      if (this.board[cell].size !== 1) {
        return false;
      }
    }
    return true;
  }

  inferWithGuessing() {
    this.inferImproved();
    for (const cell of Sudoku.CELLS) {
      const values = this.getValues(cell);
  
      if (values.size > 1) {
        for (const v of values) {
          const temp = this.board;
          this.board[cell] = new Set([v]);
          this.inferWithGuessing();
          if (this.isSolved()) {
            break;
          } else {
            this.board = temp;
          }
        }
      }
    }
    return this.board;
  }
  
}

function solver(grid) {
  const sudoku = new Sudoku(grid);
  const newBoard = sudoku.inferWithGuessing();
  if (!sudoku.isSolved()) {
    return null;
  }
  const newArray = Array.from({ length: 9 }, () => Array(9).fill(''));
  Object.keys(newBoard).forEach((key) => {
    const parts = key.split(',');
    const numbers = parts.map(Number);

    const value = newBoard[numbers];
    newArray[numbers[0]][numbers[1]] = Array.from(value)[0].toString();
  });
  return newArray;
}

  
module.exports = { solver };
  
  