const player = (sign) => {
    const getSign = () => {
        return sign;
    }
    return { getSign };   
}

const gameController = (() => {
    const _player1 = player('X');
    const _player2 = player('O');
    let roundNum = 0;

    const getCurrentSign = () => {
        return roundNum % 2 === 0 ? _player1.getSign() : _player2.getSign();
    }

    const _checkIfOver = () => {
        const arr = gameBoard.getGameBoard();
        const winners = [   ["0 0", "1 1", "2 2"],  ["0 2", "1 1", "2 0"],
                            ["0 0", "0 1", "0 2"],  ["1 0", "1 1", "1 2"],
                            ["2 0", "2 1", "2 2"],  ["0 0", "1 0", "2 0"],
                            ["0 1", "1 1", "2 1"],  ["0 2", "1 2", "2 2"]   ];

        for (let winner of winners) {
            let gameWon = true;
            for (let coordinates of winner) {
                let x = coordinates.slice(0,1);
                let y = coordinates.slice(2);
                if (arr[x][y] != getCurrentSign()) {
                    gameWon = false;
                    break;
                }              
            }
            if (gameWon) {
                if (getCurrentSign() === _player1.getSign()) {
                    console.log("Player 1 wins");
                } else {
                    console.log("Player 2 wins");
                }
                displayController.toggleFields();
                break;
            }
        }
    }

    const addMark = (e) => {        
        let indexX = e.target.dataset.index.slice(0,1);
        let indexY = e.target.dataset.index.slice(2);

        if (gameBoard.isFieldEmpty(indexX, indexY)) {
            gameBoard.markSign(indexX, indexY);
            displayController.markSign(indexX, indexY);
            _checkIfOver();
        }
        
        roundNum++;
        if (roundNum === 9) {
            console.log("It's a draw")
        }
    }; 
    
    return { getCurrentSign, addMark }
})();

const displayController = (() => {
    const _divFields = Array.from( document.querySelectorAll('[class*="row"] [class*="column"]') );
    const _divsArray = new Array(3).fill("").map( () => new Array(3).fill(""));
    for (let i = 0; i < _divFields.length; i++) {
        _divsArray[Math.floor(i / 3)][i % 3] = _divFields[i];
    }
    
    _divsArray.forEach( row => row.forEach( div => div.addEventListener('click', gameController.addMark)));

    const toggleFields = () => {
        _divsArray.forEach( row => row.forEach( div => div.classList.toggle('inactive')));
    }

    const markSign = (x, y) => {
        _divsArray[x][y].textContent = gameController.getCurrentSign();
    }    

    return { markSign, toggleFields }
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

    return { getGameBoard, isFieldEmpty, markSign };
})();