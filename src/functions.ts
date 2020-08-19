function getWinConditions(): number[][]{
    return [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
}

function checkGameState(board: string[]): [string, number[]] {
    let conditions = getWinConditions();
    for (let condition of conditions) {
        if (board[condition[0]] != null && board[condition[0]] === board[condition[1]] && board[condition[1]] === board[condition[2]])
            return [board[condition[0]], condition];
    }
    if (board.every((cell) => (cell != null)))
        return ["Draw", [-1, -1, -1]];
    else
        return ["", [-1, -1, -1]];
}

function endBoardState(board: string[], winLine: number[]): string[] {
    let endBoard = Array.from(board, (value: string) => (!value ? "-" : value));
    for (let index of winLine) 
        endBoard[index] = "*" + endBoard[index];
    return endBoard;
}

function getBotDecision(board: string[], currentPlayer: string, moves: number[]): number {
    let opponent: string = "";
    if (currentPlayer === "O")
        opponent ="X";
    else
        opponent ="O";

    let moveNumber: number = moves.findIndex((x: number) => x===-1);
    if (moveNumber === 0)
        return Math.floor(Math.random() * 9);

    if (moveNumber === 1) {
        if (moves[0] === 4) 
            return [0,2,6,8][Math.floor(Math.random() * 4)];
        else if ([0,2,6,8].includes(moves[0]))
            return 4;
        else {
            let spots = getSpotForSide(board, opponent);
            return spots[Math.floor(Math.random() * spots.length)];
        }
    }

    if (moveNumber === 2) {
        if ([0,2,6,8].includes(moves[1]) && !board[4])
            return 4;
        else if ([1,3,5,7].includes(moves[0])) {
            let spots = getAvailableSpots(board);
            spots.splice(spots.indexOf(8-moves[0]), 1);
            console.log(spots);
            return spots[Math.floor(Math.random() * spots.length)];
        }
        else {
            let spots = getAvailableSpots(board);
            console.log(spots);
            return spots[Math.floor(Math.random() * spots.length)];
        }
    }

    let lines: number[][] = getWinnableLines(board);
    let position: number = checkWinnable(board, lines, currentPlayer);
    if (position !== -1)
        return position;
    position = checkWinnable(board, lines, opponent);
    if (position !== -1)
        return position;
    
    if (moveNumber === 3) {
        if (moves[0] === 4 && moves[1]+moves[2] === 8) {
            let spots = [0,2,6,8];
            spots.splice([0,2,6,8].indexOf(moves[1]), 1);
            spots.splice(spots.indexOf(moves[2]), 1);
            return spots[Math.floor(Math.random() * spots.length)];
        }
        else if ([0,2,6,8].includes(moves[0]) && moves[0]+moves[2] === 8)
            return [1,3,5,7][Math.floor(Math.random() * 4)];
        else if ([1,3,5,7].includes(moves[0])) {
            let spots: number[] = getStrategicSpots(board, opponent, true);
            let exclusion: number[] = getWinnableLines(board).filter((line: number[]) => 
                (line.map((x:number) => board[x]).includes(currentPlayer))).flat();
            let excSpots: number[] = spots.filter((x: number) => !exclusion.includes(x));
            if (excSpots.length === 0)
                return spots[Math.floor(Math.random() * spots.length)];
            else
                return excSpots[Math.floor(Math.random() * excSpots.length)]; 
        }
    }
    
    let spots: number[] = getStrategicSpots(board, currentPlayer, false);
    if (spots.length !== 0)
        return spots[Math.floor(Math.random() * spots.length)];
    spots= getStrategicSpots(board, opponent, true);
    if (spots.length !== 0)
        return spots[Math.floor(Math.random() * spots.length)];
    
    spots = getAvailableSpots(board);
    return spots[Math.floor(Math.random() * spots.length)];
}

function getWinnableLines(board: string[]): number[][] {
    let allLines: number[][] = getWinConditions();
    allLines = allLines.filter((lines: number[]) => (
        !(lines.map((x: number) => board[x]).includes("O") && lines.map((x: number) => board[x]).includes("X"))
    ));
    allLines = allLines.filter((lines: number[]) => !lines.map((x: number) => board[x]).every((x) => !x));
    return allLines;
}

function checkWinnable(board: string[], lines: number[][], player: string): number {
    let winnableLines: number[][] = lines.filter((line: number[]) => line.map((x: number) => board[x]).includes(player));
    winnableLines = winnableLines.filter((line: number[]) => line.filter((x) => !board[x]).length === 1);
    let winnablePosition: number[] = winnableLines.map((line: number[]) => line.filter((x) => !board[x])[0]);
    if (winnablePosition.length === 0)
        return -1;
    else
        return winnablePosition[Math.floor(Math.random() * winnablePosition.length)];
}

function getSpotForSide(board: string[], opponent: string): number[] {
    let allLines: number[][] = getWinConditions().slice(0,6);
    allLines = allLines.filter((lines: number[]) => (lines.map((x: number) => board[x]).includes(opponent)));
    let spots = allLines.flat().filter((value, index, self) => self.indexOf(value) === index);
    spots = spots.filter((x: number) => !board[x]);
    return spots;
}

function getAvailableSpots(board: string[]): number[] {
    let spots: number[] = [0,1,2,3,4,5,6,7,8];
    spots = spots.filter((x: number) => !board[x]);
    return spots;
}

function getStrategicSpots(board: string[], player: string, block: boolean): number[] {
    let lines = getWinnableLines(board);
    lines = lines.filter((line: number[]) => (line.map((x: number) => board[x]).includes(player)));
    let intersections: number[] = [];
    for (let i = 0; i < lines.length; i++) {
        let sum: number = 0;
        for (let j = 0; j < lines.length; j++) {
            if (i === j)
                continue;
            let line1: number[] = lines[i];
            let line2: number[] = lines[j];
            if (line1.filter((x: number) => line2.includes(x)).length !== 0)
                sum++;
        }
        intersections.push(sum);
    }
    if (intersections.length === 0)
        return [];
    
    if (block) {
        lines = lines.filter((line: number[], index: number) => (intersections[index] === Math.max(...intersections)));
        let spots: number[] = lines.flat().filter((value, index, self) => self.indexOf(value) === index);
        spots = spots.filter((x: number) => !board[x]);
        return spots;
    }
    else {
        lines = lines.filter((line: number[], index: number) => (intersections[index] > 0));
        let spots: number[] = [];
        for (let i = 0; i < lines.length; i++)
            for (let j = i + 1; j < lines.length; j++) {
                let intersectionPoint: number = lines[i].filter((x: number) => lines[j].includes(x))[0];
                if (!spots.includes(intersectionPoint))
                    spots.push(intersectionPoint);
            }
        spots = spots.filter((x: number) => !board[x]);
        return spots;
    }
}

export {checkGameState, endBoardState, getBotDecision};