/*jshint esversion: 6 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScore = document.getElementById('finalScore');
const characterSelection = document.getElementById('characterSelection');

let scale, bird, pipes, score, pipeSpeed, pipeGap, frames, gameOver, selectedCharacter, waterY, waterSpeed, waveOffset, extraCollision;

const config = {
    bird: { radius: 50, gravity: 0.16, jump: -5 },
    pipes: { width: 70, gap: 200, initialSpeed: 2, color: 'LimeGreen' },
    ground: { height: 40 },
    difficulty: { gapReduction: 10, speedIncrement: 0.2 },
    water: { speed: 0.5, amplitude: 5, frequency: 0.02, color: 'SteelBlue' },
    extraCollision: {
        size: 60,
        speed: 3,
        image: new Image()
    }
};

config.extraCollision.image.src = 'tub.jpg';

const backgroundImage = new Image();
backgroundImage.src = 'background.jpg';

function initCanvas() {
    const aspectRatio = 3 / 4;
    if (window.innerWidth / window.innerHeight < aspectRatio) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerWidth / aspectRatio;
    } else {
        canvas.height = window.innerHeight;
        canvas.width = window.innerHeight * aspectRatio;
    }
    scale = canvas.width / 480;
    waterY = canvas.height - config.ground.height * scale;
}

function resetGame() {
    bird = {
        x: 50 * scale,
        y: canvas.height / 2,
        radius: config.bird.radius * scale,
        velocity: 0,
        gravity: config.bird.gravity * scale,
        jump: config.bird.jump * scale
    };
    pipes = [];
    score = 0;
    pipeSpeed = config.pipes.initialSpeed * scale;
    pipeGap = config.pipes.gap * scale;
    frames = 0;
    gameOver = false;
    waterSpeed = config.water.speed * scale;
    waveOffset = 0;
    extraCollision = null;
    document.getElementById('score').innerText = 'Score: 0';
}

function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

function drawWater() {
    ctx.fillStyle = config.water.color;

    ctx.beginPath();
    ctx.moveTo(0, canvas.height);

    for (let x = 0; x < canvas.width; x++) {
        const y = waterY + config.water.amplitude * scale * Math.sin(config.water.frequency * x + waveOffset);
        ctx.lineTo(x, y);
    }

    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fill();

    waveOffset += waterSpeed;

    const waterSurfaceY = waterY + config.water.amplitude * scale * Math.sin(config.water.frequency * bird.x + waveOffset);
    if (bird.y + bird.radius > waterSurfaceY) {
        gameOver = true;
    }
}

function drawPipes() {
    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed;

        ctx.fillStyle = config.pipes.color;
        ctx.fillRect(pipe.x, 0, config.pipes.width * scale, pipe.topHeight);

        if (
            bird.x + bird.radius > pipe.x &&
            bird.x - bird.radius < pipe.x + config.pipes.width * scale &&
            (bird.y - bird.radius < pipe.topHeight)
        ) {
            gameOver = true;
        }

        if (!pipe.passed && pipe.x + config.pipes.width * scale < bird.x) {
            pipe.passed = true;
            score++;
            document.getElementById('score').innerText = `Score: ${score}`;
        }
    });

    pipes = pipes.filter(pipe => pipe.x > -config.pipes.width * scale);
}

function drawExtraCollision() {
    if (extraCollision) {
        ctx.drawImage(config.extraCollision.image, extraCollision.x - config.extraCollision.size * scale / 2, extraCollision.y - config.extraCollision.size * scale / 2, config.extraCollision.size * scale, config.extraCollision.size * scale);
        extraCollision.x -= config.extraCollision.speed * scale;

        const distX = bird.x - extraCollision.x;
        const distY = bird.y - extraCollision.y;
        const distance = Math.sqrt(distX * distX + distY * distY);
        if (distance < bird.radius + config.extraCollision.size * scale / 2) {
            gameOver = true;
        }

        if (extraCollision.x < -config.extraCollision.size * scale) {
            extraCollision = null;
        }
    }
}

function drawBird() {
    const birdImage = new Image();
    birdImage.src = selectedCharacter;
    ctx.drawImage(birdImage, bird.x - bird.radius, bird.y - bird.radius, bird.radius * 2, bird.radius * 2);
}

function addPipe() {
    const pipeHeight = Math.random() * (canvas.height - pipeGap - 100 * scale) + 50 * scale;
    pipes.push({
        x: canvas.width,
        topHeight: pipeHeight,
    });
}

function gameLoop() {
    if (gameOver) {
        gameOverScreen.style.display = 'flex';
        finalScore.innerText = `Your Score: ${score}`;
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    drawBird();
    drawPipes();
    drawWater();

    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (frames % 160 === 0) addPipe();

    if (frames % 300 === 0 && extraCollision === null) {
        extraCollision = {
            x: canvas.width,
            y: Math.random() * (canvas.height - config.ground.height * scale - config.extraCollision.size * scale) + config.extraCollision.size * scale / 2
        };
    }

    drawExtraCollision();

    frames++;

    requestAnimationFrame(gameLoop);
}

characterSelection.style.display = 'flex';
document.querySelectorAll('.characterOption').forEach(option => {
    option.addEventListener('click', (e) => {
        selectedCharacter = e.target.getAttribute('data-character');
        characterSelection.style.display = 'none';
        canvas.style.display = 'block';
        initCanvas();
        resetGame();
        gameLoop();
    });
});

document.addEventListener('click', () => {
    if (!gameOver) bird.velocity = bird.jump;
});

function restartGame() {
    gameOverScreen.style.display = 'none';
    resetGame();
    gameLoop();
}