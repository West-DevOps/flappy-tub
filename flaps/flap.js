const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScore = document.getElementById('finalScore');

let scale, bird, pipes, clouds, groundOffset, score, pipeSpeed, groundSpeed, pipeGap, frames, gameOver;

const config = {
    bird: { radius: 15, gravity: 0.16, jump: -5 },
    pipes: { width: 70, gap: 200, initialSpeed: 2 },
    ground: { height: 50 },
    difficulty: { gapReduction: 10, speedIncrement: 0.2 },
    colors: {
        backgroundGradient: ['#87ceeb', '#70c5ce'],
        pipe: '#4caf50',
        ground: '#6b8e23',
        cloud: 'rgba(255, 255, 255, 0.8)',
        bird: { start: 'yellow', end: 'orange' },
    },
};

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
}

function resetGame() {
    bird = { x: 50 * scale, y: canvas.height / 2, radius: config.bird.radius * scale, velocity: 0, gravity: config.bird.gravity * scale, jump: config.bird.jump * scale };
    pipes = [];
    clouds = [];
    groundOffset = 0;
    score = 0;
    pipeSpeed = config.pipes.initialSpeed * scale;
    groundSpeed = config.pipes.initialSpeed * scale;
    pipeGap = config.pipes.gap * scale;
    frames = 0;
    gameOver = false;
    document.getElementById('score').innerText = 'Score: 0';
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, config.colors.backgroundGradient[0]);
    gradient.addColorStop(1, config.colors.backgroundGradient[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawGround() {
    groundOffset -= groundSpeed;
    if (groundOffset <= -canvas.width) groundOffset = 0;

    ctx.fillStyle = config.colors.ground;
    ctx.fillRect(groundOffset, canvas.height - config.ground.height * scale, canvas.width, config.ground.height * scale);
    ctx.fillRect(groundOffset + canvas.width, canvas.height - config.ground.height * scale, canvas.width, config.ground.height * scale);
}

function addCloud() {
    clouds.push({ x: canvas.width, y: Math.random() * 150 * scale + 20 * scale, size: Math.random() * 40 * scale + 40 * scale, speed: Math.random() * 0.5 * scale + 0.2 * scale });
}

function drawClouds() {
    clouds.forEach(cloud => {
        ctx.fillStyle = config.colors.cloud;
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.size * 0.6, Math.PI * 0.5, Math.PI * 1.5);
        ctx.arc(cloud.x + cloud.size * 0.4, cloud.y - cloud.size * 0.4, cloud.size * 0.5, Math.PI, Math.PI * 1.85);
        ctx.arc(cloud.x + cloud.size * 0.8, cloud.y - cloud.size * 0.2, cloud.size * 0.4, Math.PI * 1.37, Math.PI * 1.91);
        ctx.arc(cloud.x + cloud.size, cloud.y, cloud.size * 0.6, Math.PI * 1.5, Math.PI * 0.5);
        ctx.closePath();
        ctx.fill();
        cloud.x -= cloud.speed;
    });
    clouds = clouds.filter(cloud => cloud.x > -cloud.size);
}

function addPipe() {
    const pipeHeight = Math.random() * (canvas.height - pipeGap - 100 * scale) + 50 * scale;
    pipes.push({ x: canvas.width, topHeight: pipeHeight, bottomHeight: canvas.height - pipeHeight - pipeGap });
}

function drawPipes() {
    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed;
        ctx.fillStyle = config.colors.pipe;
        ctx.fillRect(pipe.x, 0, config.pipes.width * scale, pipe.topHeight);
        ctx.fillRect(pipe.x, canvas.height - pipe.bottomHeight, config.pipes.width * scale, pipe.bottomHeight);

        if (
            bird.x + bird.radius > pipe.x &&
            bird.x - bird.radius < pipe.x + config.pipes.width * scale &&
            (bird.y - bird.radius < pipe.topHeight || bird.y + bird.radius > canvas.height - pipe.bottomHeight)
        ) {
            gameOver = true;
        }

        if (!pipe.passed && pipe.x + config.pipes.width * scale < bird.x) {
            pipe.passed = true;
            score++;
            document.getElementById('score').innerText = `Score: ${score}`;
            if (score % 5 === 0) {
                pipeSpeed += config.difficulty.speedIncrement * scale;
                groundSpeed += config.difficulty.speedIncrement * scale;
                if (pipeGap > 120 * scale) pipeGap -= config.difficulty.gapReduction * scale;
            }
        }
    });
    pipes = pipes.filter(pipe => pipe.x > -config.pipes.width * scale);
}

function drawBird() {
    const gradient = ctx.createRadialGradient(bird.x, bird.y, bird.radius / 2, bird.x, bird.y, bird.radius);
    gradient.addColorStop(0, config.colors.bird.start);
    gradient.addColorStop(1, config.colors.bird.end);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
    ctx.fill();
}

function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
    if (bird.y + bird.radius > canvas.height - config.ground.height * scale || bird.y - bird.radius < 0) {
        gameOver = true;
    }
}

function gameLoop() {
    if (gameOver) {
        gameOverScreen.style.display = 'flex';
        finalScore.innerText = `Your Score: ${score}`;
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    drawClouds();
    drawGround();
    drawBird();
    drawPipes();
    updateBird();

    if (frames % 250 === 0) addCloud();
    if (frames % 160 === 0) addPipe();

    frames++;
    requestAnimationFrame(gameLoop);
}

function restartGame() {
    gameOverScreen.style.display = 'none';
    resetGame();
    gameLoop();
}

document.addEventListener('click', () => {
    if (!gameOver) bird.velocity = bird.jump;
});

window.addEventListener('resize', () => {
    initCanvas();
    restartGame();
});

initCanvas();
resetGame();
gameLoop();