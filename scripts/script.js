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
        if (getCurrentSign() === _player1.getSign()) return _player1;
        else return _player2;
    }

    const setMode = (type) => {
        if (type === 'ai') _mode = "ai";
        else if (type === 'players') _mode = "players";
    } 

    const resetGame = () => {
        gameBoard.clearBoard();
        displayController.clearBoardDisplay();
        displayController.activateFields();
        _roundNum = 1;
        _gameNum++;
        displayController.showTurn();
        if (_mode === 'ai' && _currentPlayer() === _player2) addMark();        
    }

    const _winner = (player) => {
        const winningCombinations = [ ["0 0", "1 1", "2 2"],  ["0 2", "1 1", "2 0"],
                                      ["0 0", "0 1", "0 2"],  ["1 0", "1 1", "1 2"],
                                      ["2 0", "2 1", "2 2"],  ["0 0", "1 0", "2 0"],
                                      ["0 1", "1 1", "2 1"],  ["0 2", "1 2", "2 2"] ];
        
        for (let set of winningCombinations) {
            let gameWon = true;
            for (let coordinates of set) {
                let x = coordinates.slice(0,1);
                let y = coordinates.slice(2);
                if (gameBoard.getField(x, y) != player.getSign()) {
                    gameWon = false;
                    break;
                }              
            }
            if (gameWon) return {
                                    value: true,
                                    combo: set
                                }
        }
        return false;
    }

    const _minimax = (player) => {
        if (player === _player1) {
            if (_winner(_player2).value) return { score: 10 };
        } else if (player === _player2) {
            if (_winner(_player1).value) return { score: -10 };
        }

        if (_roundNum === 10) return { score: 0 };

        let moves = [];
        let x, y, min = 100, max = -100, bestIndex, score;
        const availableFields = gameBoard.getAvailableFields();
        for (let i = 0; i < availableFields.length; i++) {
            [x, y] = availableFields[i];
            const move = {};
            move.index = availableFields[i];
            gameBoard.markSign(x, y, player.getSign());
            _roundNum++;

            if (player === _player1) { 
                score = _minimax(_player2).score;
                if (score < min) {
                    min = score;
                    bestIndex = i;
                }
            } else {
                score = _minimax(_player1).score;
                if (score > max) {
                    max = score;
                    bestIndex = i;
                }
            }

            move.score = score;
            moves.push(move);
            gameBoard.markSign(x, y, "");
            _roundNum--;
        }    

        if (score === undefined) {
            console.log(gameBoard.getGameBoard());
            console.log(min, max, availableFields, _roundNum, _currentPlayer().getSign());

        }
        return moves[bestIndex];
    }

    const addMark = (e) => {    
        let x, y;
        if (_mode === "ai" && _currentPlayer() === _player2) {
            [x, y] = _minimax(_player2).index;
        } else {
            x = e.currentTarget.dataset.index.slice(0,1);
            y = e.currentTarget.dataset.index.slice(2);
        }
        
        if (gameBoard.isFieldEmpty(x, y)) {
            gameBoard.markSign(x, y, gameController.getCurrentSign());
            displayController.markSign(x, y);
            const checkWinner = _winner(_currentPlayer());
            if (_roundNum >= 5 && checkWinner.value === true) {
                displayController.markWinningCombo(checkWinner.combo);
                displayController.deactivateFields();
                if (_currentPlayer() === _player1) {
                    _player1.incrementScore();
                    displayController.incrementScore(0);
                    displayController.announceResult('player one');
                } else {
                    _player2.incrementScore();
                    displayController.incrementScore(1);
                    displayController.announceResult('player two');
                }
            } else if (_roundNum === 9) {
                displayController.announceResult('draw');
            } else {
                _roundNum++;
                displayController.showTurn();
                if (_mode === 'ai' && _currentPlayer() === _player2) addMark();
            }
        }
    }     
    
    return { setMode, getCurrentSign, addMark, resetGame }
})();

const gameBoard = (() => {
    const _board = new Array(3).fill("").map( () => new Array(3).fill(""));

    const getGameBoard = () => {
        return _board;
    }
    const isFieldEmpty = (x, y) => {
        return !_board[x][y];
    }
    const markSign = (x, y, sign) => {
        _board[x][y] = sign;
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

const displayController = (() => {
    const _restartBtn = document.querySelector('.restart-button');
    const _divFields = Array.from( document.querySelectorAll('.game-board > *') );
    const _divsArray = new Array(3).fill("").map( () => new Array(3).fill(""));
    const _playerScore = document.querySelectorAll('.score');
    const _info = document.querySelector('.turn-info');
    const _playerNames = document.querySelectorAll('.player > input');
    const _modeBtns = document.querySelectorAll('.mode');
    const _gameSection = document.querySelector('main');
    const _headerSection = document.querySelector('.header-menu');

    for (let i = 0; i < _divFields.length; i++) {
        _divsArray[Math.floor(i / 3)][i % 3] = _divFields[i];
    }
    _divsArray.forEach( row => row.forEach( div => div.addEventListener('click', gameController.addMark)));
    _restartBtn.addEventListener('click', gameController.resetGame);

    const _displayGame = () => {
        _headerSection.classList.add("active")
        setTimeout(() => _gameSection.classList.add("visible"), 300);
    }

    _modeBtns.forEach(button => button.addEventListener('click', (e) => {
        if (!e.currentTarget.parentNode.children[0].classList.contains("inactive") &&
            !e.currentTarget.parentNode.children[1].classList.contains("inactive")) {
                _displayGame();
        }
        
        if (e.currentTarget.classList.contains("bot")) {
            gameController.setMode("ai");
            e.currentTarget.previousElementSibling.classList.remove("inactive");
            if (gameController.getCurrentSign() === 'O') gameController.addMark();
        } else {
            gameController.setMode("players");
            e.currentTarget.nextElementSibling.classList.remove("inactive");
        }

        e.currentTarget.classList.add("inactive");  
    }));
    
    const showTurn = () => {
        if (gameController.getCurrentSign() === 'X') {
            _info.textContent = `${_playerNames[0].value}, your turn`;
        } else {
            _info.textContent = `${_playerNames[1].value}, your turn`;
        }
    }
    _playerNames.forEach( playerName => playerName.addEventListener('change', () => {
        if (!playerName.value.trim()) playerName.value = playerName.defaultValue;

        if (_info.textContent.includes("wins")) {
            if ( (gameController.getCurrentSign() === 'X' && playerName.defaultValue === "Player one") ||
                 (gameController.getCurrentSign() === 'O' && playerName.defaultValue === "Player two") ) {
                let info = _info.textContent;
                _info.textContent = info.replace(info.slice(0, info.lastIndexOf(" ")), playerName.value);
            } 
        } else if (_info.textContent.includes("turn")) showTurn();
    }));

    const markSign = (x, y) => {
        const sign = gameController.getCurrentSign();
        _divsArray[x][y].firstChild.textContent = sign;
        _divsArray[x][y].firstChild.classList.add("marked");

        if(sign === 'O' && _modeBtns[1].classList.contains("inactive")) {
            _divsArray[x][y].firstChild.classList.add("marked-ai");
        }
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

    const markWinningCombo = (combo) => {
        for (let coordinates of combo) {
            let x = coordinates.slice(0,1);
            let y = coordinates.slice(2);
            _divsArray[x][y].firstChild.style.color = `var(--pink)`;
        }
    }

    const activateFields = () => {
        _divsArray.forEach( row => row.forEach( div => div.classList.remove('inactive')));
    }

    const deactivateFields = () => {
        _divsArray.forEach( row => row.forEach( div => div.classList.add('inactive')));
    }
    
    const clearBoardDisplay = () => {
        _divsArray.forEach( row => row.forEach( div => {
            div.firstChild.textContent = "";
            div.firstChild.classList.remove("marked");
            div.firstChild.classList.remove("marked-ai");
            div.firstChild.style.color = `var(--light-teal)`;
        }));
    }

    return { markSign, 
             showTurn, 
             announceResult, 
             incrementScore,
             markWinningCombo, 
             activateFields, 
             deactivateFields, 
             clearBoardDisplay }
})();