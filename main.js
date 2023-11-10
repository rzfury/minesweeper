// DONT EDIT CONSTANTS
/** @type {string[]} */
const numColor = ['gray', 'blue', 'green', 'red', 'darkblue', 'brown', 'cyan', 'black', 'darkslategray']
/** @type {[number,number][]} */
const surroundingPos = [[-1, -1],[0, -1],[1, -1],[-1, 0],[1, 0],[-1, 1],[0, 1],[1, 1]]
/** @type {{ pos: [number, number], bomb: boolean, value: number, opened: boolean, flagged: boolean }[]} */
const matrix = [];
/** @type {number[]} */
const bombIndex = [];

// EDIT CONSTANTS
const matrixSizeW = 10;
const matrixSizeH = 10;
const bombCount = 15;

let flagCount = 0;
let notBombLeft = 0;
let gameOver = false;

document.getElementById('start').addEventListener('click', ev => {
    generate();
});

generate();

function generate() {
    document.getElementById('matrix').innerHTML = '';

    bombIndex.length = 0;
    matrix.length = 0;

    flagCount = 0;
    notBombLeft = 0;
    gameOver = false;

    buildMatrixBoard();
    putBomb(bombCount);
    renderMatrix();
    openRandomValue();
}

function win() {
    bombIndex.forEach(i => {
        /** @type {HTMLButtonElement} */
        const button = document.querySelector(`button[data-matrix-index="${i}"]`)
        button.style.backgroundColor = 'green';
        button.textContent = 'X';
    });
    gameOver = true;
}

function lose() {
    bombIndex.forEach(i => {
        /** @type {HTMLButtonElement} */
        const button = document.querySelector(`button[data-matrix-index="${i}"]`)
        if (button.getAttribute('data-flagged') === 'true') {
            button.style.backgroundColor = 'green';
        }
        else {
            button.style.backgroundColor = 'red';
        }
        button.textContent = 'X';
    });
    gameOver = true;
}

function checkWin() {
    const allBombFlagged = bombIndex.map(i => matrix[i]).every(n => n.flagged);
    if (allBombFlagged && flagCount === 15 && notBombLeft === 0) {
        win();
    }
}

function renderMatrix() {
    const tbody = document.getElementById('matrix');

    for (let y = 0; y < matrixSizeH; y++) {
        const tr = document.createElement('tr');
        for (let x = 0; x < matrixSizeW; x++) {
            const index = x + (y * matrixSizeH);
            const td = document.createElement('td');
            const button = document.createElement('button');
            button.setAttribute('data-matrix-index', index);
            button.setAttribute('data-flagged', 'false');
            button.addEventListener('contextmenu', (ev) => {
                if (gameOver) return;

                ev.preventDefault();
                
                const node = parseInt(ev.target.getAttribute('data-matrix-index'));

                if (matrix[node].opened) return;

                if (!matrix[node].flagged) {
                    button.setAttribute('data-flagged', 'true');
                    matrix[node].flagged = true;
                    flagCount++;
                }
                else {
                    button.setAttribute('data-flagged', 'false');
                    matrix[node].flagged = false;
                    flagCount--;
                }

                checkWin();
            });
            button.addEventListener('click', (ev) => {
                if (gameOver) return;

                const node = parseInt(ev.target.getAttribute('data-matrix-index'));

                if (matrix[node].opened) return;
                if (matrix[node].bomb) {
                    lose();
                    return;
                }
                
                if (matrix[node].flagged) {
                    ev.target.setAttribute('data-flagged', 'false');
                    matrix[node].flagged = false;
                    flagCount--;
                }

                openNode(node);
            });
            button.append(document.createTextNode(' '));
            td.append(button);
            tr.append(td);
        }
        tbody.append(tr);
    }
}

function openNode(index, noFloodFill = false) {
    const button = document.querySelector(`button[data-matrix-index="${index}"]`)
    button.style.color = numColor[matrix[index].value];
    button.textContent = matrix[index].value;
    matrix[index].opened = true;

    if (matrix[index].flagged) {
        button.setAttribute('data-flagged', 'false');
        matrix[index].flagged = false;
        flagCount--;
    }

    notBombLeft--;

    checkWin();

    if (matrix[index].value === 0 && !noFloodFill) {
        const [x, y] = matrix[index].pos;
        floodFill([x + 1, y]);
        floodFill([x - 1, y]);
        floodFill([x, y + 1]);
        floodFill([x, y - 1]);
    }
}

function openRandomValue() {
    let randomIndex = random(0, matrix.length - 1)
    let validToOpen = false
    while (!validToOpen) {
        randomIndex = random(0, matrix.length - 1)
        if (matrix[randomIndex].bomb || matrix[randomIndex].value !== 0) continue;
        else validToOpen = true;
    }    
    openNode(randomIndex, true);
}

function floodFill([x, y]) {
    const index = matrix.findIndex(n => n.pos[0] === x && n.pos[1] === y);
    if (index > -1) {
        const node = matrix[index];

        if (node.opened || node.bomb) return;

        openNode(index);
    }
}

function buildMatrixBoard() {
    for (let y = 0; y < matrixSizeH; y++) {
        for (let x = 0; x < matrixSizeW; x++) {
            matrix.push(createBaseNode([x, y]))
        }
    }
}

function putBomb(count) {
    while(count > 0) {
        let randomIndex = random(0, matrix.length - 1)
        while (matrix[randomIndex].bomb) {
            randomIndex = random(0, matrix.length - 1)
        }

        bombIndex.push(randomIndex);
        matrix[randomIndex].value = 99;
        matrix[randomIndex].bomb = true;
        const pos = matrix[randomIndex].pos;
        
        surroundingPos.forEach(([x, y]) => {
            const nodeIndex = matrix.findIndex(n => n.pos[0] === x + pos[0] && n.pos[1] === y + pos[1]);
            if (nodeIndex > -1) {
                matrix[nodeIndex].value++;
            }
        })

        count--;
    }

    notBombLeft = matrixSizeW * matrixSizeH - bombIndex.length;
}

function createBaseNode([x, y]) {
    return {
        pos: [x, y],
        bomb: false,
        value: 0,
        opened: false,
        flagged: false,
    };
}

function random(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}
