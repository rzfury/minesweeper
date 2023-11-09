// DONT EDIT CONSTANTS
/** @type {[number,number][]} */
const surroundingPos = [[-1, -1],[0, -1],[1, -1],[-1, 0],[1, 0],[-1, 1],[0, 1],[1, 1]]
/** @type {{ pos: [number, number], bomb: boolean, value: number, opened: boolean }[]} */
const matrix = [];
/** @type {number[]} */
const bombIndex = [];
/** @type {number[]} */
const flaggedMine = [];

// EDIT CONSTANTS
const matrixSizeW = 10;
const matrixSizeH = 10;
const bombCount = 15;

let notBombLeft = 0;
let gameOver = false;

buildMatrixBoard();
putBomb(bombCount);
renderMatrix();
openRandomValue();

function win() {
    bombIndex.forEach(i => {
        /** @type {HTMLButtonElement} */
        const button = document.querySelector(`button[data-matrix-index="${i}"]`)
        button.style.backgroundColor = 'green';
        button.textContent = 'X';
    });
    gameOver = true;
    setTimeout(() => {
        alert('WIN!')
    }, 1);
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
    setTimeout(() => {
        alert('LOSE!')
    }, 1);
}

function checkWin() {
    const flags = flaggedMine.slice().sort((a, b) => a - b);
    const bombs = bombIndex.slice().sort((a, b) => a - b);

    for(let i = 0; i < bombs.length; i++) {
        if (flags[i] !== bombs[i]) return;
    }

    if (notBombLeft === 0) win();
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
                const flagged = ev.target.getAttribute('data-flagged');

                if (matrix[node].opened) return;

                if (flagged === 'false') {
                    flaggedMine.push(node);
                    ev.target.setAttribute('data-flagged', 'true');
                }
                
                if (flagged === 'true') {
                    const index = flaggedMine.indexOf(node);
                    if (index > -1) {
                        flaggedMine.splice(index, 1);
                        ev.target.setAttribute('data-flagged', 'false');
                    }
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

                ev.target.setAttribute('data-flagged', 'false');
                flaggedMine.splice(node, 1);

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
    button.textContent = matrix[index].value;
    matrix[index].opened = true;

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
        opened: false
    };
}

function random(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}
