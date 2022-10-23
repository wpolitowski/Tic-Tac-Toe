const player = (sign) => {
    let _score = 0;
    const getSign = () => {
        return sign;
    }
    const incrementScore = () => {
        _score++;
    }
    return { getSign, incrementScore };   
}

const gameController = (() => {
    const _player1 = player('X');
    const _player2 = player('O');
    let _roundNum = 1;
    let _gameNum = 1;
    let _mode = "ai";

    const getCurrentSign = () => {
        if (_gameNum % 2) 
            return _roundNum % 2 ? _player1.getSign() : _player2.getSign();
        else 
            return _roundNum % 2 ? _player2.getSign() : _player1.getSign();
    }
    
    const _currentPlayer = () => {
        if (getCurrentSign() === _player1.getSign()) return 1;
        else return 2;
    }

    const resetGame = () => {
        gameBoard.clearBoard();
        displayController.clearBoardDisplay();
        displayController.activateFields();
        _roundNum = 1;
        displayController.showTurn();
        if (_mode === 'ai' && _currentPlayer() === 2) addMark();        
    }

    const _isGameOver = () => {
        const winners = [   ["0 0", "1 1", "2 2"],  ["0 2", "1 1", "2 0"],
                            ["0 0", "0 1", "0 2"],  ["1 0", "1 1", "1 2"],
                            ["2 0", "2 1", "2 2"],  ["0 0", "1 0", "2 0"],
                            ["0 1", "1 1", "2 1"],  ["0 2", "1 2", "2 2"]   ];
        
        for (let winner of winners) {
            let gameWon = true;
            for (let coordinates of winner) {
                let x = coordinates.slice(0,1);
                let y = coordinates.slice(2);
                if (gameBoard.getField(x, y) != getCurrentSign()) {
                    gameWon = false;
                    break;
                }              
            }
            if (gameWon) {
                if (getCurrentSign() === _player1.getSign()) {
                    _player1.incrementScore();
                    displayController.incrementScore(0);
                    displayController.announceResult('player one');
                } else {
                    _player2.incrementScore();
                    displayController.incrementScore(1);
                    displayController.announceResult('player two');
                }
                return true;
            }
        }

        if (_roundNum === 9) {
            displayController.announceResult('draw');
            return true;
        }
    }

    const minimax = (board, player) => {
        
    }


    const addMark = (e) => {    
        let x, y;
        if (_mode === "ai" && _currentPlayer() === 2) {
            //random field will serve as "easy";
            const availableFields = gameBoard.getAvailableFields();
            const randInd = Math.floor(Math.random() * availableFields.length);
            [x, y] = availableFields[randInd];


        } else {
            x = e.target.dataset.index.slice(0,1);
            y = e.target.dataset.index.slice(2);
        }
        
        if (gameBoard.isFieldEmpty(x, y)) {
            gameBoard.markSign(x, y);
            displayController.markSign(x, y);
            if (_roundNum >= 5 && _isGameOver()) {
                displayController.deactivateFields();
                _gameNum++;
            } else {
                _roundNum++;
                displayController.showTurn();
                if (_mode === 'ai' && _currentPlayer() === 2) {
                    addMark();
                }
            }
        }
    };     
    
    return { getCurrentSign, addMark, resetGame }
})();

const displayController = (() => {
    const _restartBtn = document.querySelector('.restart-button');
    const _divFields = Array.from( document.querySelectorAll('.game-board > *') );
    const _divsArray = new Array(3).fill("").map( () => new Array(3).fill(""));
    const _playerScore = document.querySelectorAll('.score');
    const _info = document.querySelector('.turn-info');
    const _playerNames = document.querySelectorAll('.player > input');

    for (let i = 0; i < _divFields.length; i++) {
        _divsArray[Math.floor(i / 3)][i % 3] = _divFields[i];
    }
    _divsArray.forEach( row => row.forEach( div => div.addEventListener('click', gameController.addMark)));
    _restartBtn.addEventListener('click', gameController.resetGame);

    const showTurn = () => {
        if (gameController.getCurrentSign() === 'X') {
            _info.textContent = `${_playerNames[0].value}, your turn`;
        } else {
            _info.textContent = `${_playerNames[1].value}, your turn`;
        }
    }
    _playerNames.forEach( playerName => playerName.addEventListener('change', () => {
        if (!playerName.value.trim()) playerName.value = playerName.defaultValue;

        // after the game is over, _gameNum is incremented and turn order is switched
        // if player one wins, then the current sign (for next game) is player's two sign
        if (_info.textContent.includes("wins")) {
            if ( (gameController.getCurrentSign() === 'O' && playerName.defaultValue === "Player one") ||
                 (gameController.getCurrentSign() === 'X' && playerName.defaultValue === "Player two") ) {
                let info = _info.textContent;
                _info.textContent = info.replace(info.slice(0, info.lastIndexOf(" ")), playerName.value);
            } 
        } else if (_info.textContent.includes("turn")) showTurn();
    }));

    const markSign = (x, y) => {
        _divsArray[x][y].textContent = gameController.getCurrentSign();
    }

    const incrementScore = index => {
        _playerScore[index].textContent++;
    }

    const announceResult = (result) => {
        if (result === "draw") {
            _info.textContent = "It's a draw";
        } else if (result === "player one") {
            _info.textContent = `${_playerNames[0].value} wins`;
        } else {
            _info.textContent = `${_playerNames[1].value} wins`;
        }
    }

    const activateFields = () => {
        _divsArray.forEach( row => row.forEach( div => div.classList.remove('inactive')));
    }

    const deactivateFields = () => {
        _divsArray.forEach( row => row.forEach( div => div.classList.add('inactive')));
    }
    
    const clearBoardDisplay = () => {
        _divsArray.forEach( row => row.forEach( div => div.textContent = ""));
    }

    return { markSign, 
             showTurn, 
             announceResult, 
             incrementScore, 
             activateFields, 
             deactivateFields, 
             clearBoardDisplay }
})();

const gameBoard = (() => {
    const _board = new Array(3).fill("").map( () => new Array(3).fill(""));

    const getGameBoard = () => {
        return _board;
    }
    const isFieldEmpty = (x, y) => {
        return !_board[x][y];
    }
    const markSign = (x, y) => {
        _board[x][y] = gameController.getCurrentSign();
    }

    const getField = (x, y) => {
        return  _board[x][y];
    }

    const getAvailableFields = () => {
        const available = [];
        for (let i = 0; i < _board.length; i++) {
            for (let j = 0; j < _board[i].length; j++) {
                if (_board[i][j] === "") available.push([i,j]);
            }
        }
        return available;
    }

    const clearBoard = () => {
        for (let i = 0; i < _board.length; i++) {
            for (let j = 0; j < _board[i].length; j++) {
                _board[i][j] = "";
            }
        }
    }

    return { getGameBoard, isFieldEmpty, markSign, getField, getAvailableFields, clearBoard };
})();