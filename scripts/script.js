const player = (sign) => {
    const getSign = () => {
        return sign;
    }
    return { getSign };   
}

const gameController = (() => {
    const _playerA = player('X');
    const _playerB = player('O');
    let roundNum = 0;

    const getCurrentSign = () => {
        return roundNum % 2 === 0 ? _playerA.getSign() : _playerB.getSign();
    }

    const addMark = (e) => {        
        let indexX = e.target.dataset.index.slice(0,1);
        let indexY = e.target.dataset.index.slice(2);

        if (gameBoard.isFieldEmpty(indexX, indexY)) {
            gameBoard.markSign(indexX, indexY);
            displayController.markSign(indexX, indexY);

        }
        roundNum++;
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

    const markSign = (x, y) => {
        _divsArray[x][y].textContent = gameController.getCurrentSign();
    }
    



    return { markSign }
})();

const gameBoard = (() => {
    const _board = new Array(3).fill("").map( () => new Array(3).fill(""));
    const isFieldEmpty = (x, y) => {
        return !_board[x][y];
    }
    const markSign = (x, y) => {
        _board[x][y] = gameController.getCurrentSign();
    }

    return { isFieldEmpty, markSign };
})();