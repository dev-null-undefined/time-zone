let confetti = {
    leafs: [],
    canvas: document.getElementById('canvas'),
    ctx: null,
    rendering: false,
    config: {
        confettiCount: 1000,
        gravity: 0.5,
        terminalVelocity: 10,
        drag: 0.05,
        colors: [
            {front: 'red', back: 'darkred'},
            {front: 'green', back: 'darkgreen'},
            {front: 'blue', back: 'darkblue'},
            {front: 'yellow', back: 'darkyellow'},
            {front: 'orange', back: 'darkorange'},
            {front: 'pink', back: 'darkpink'},
            {front: 'purple', back: 'darkpurple'},
            {front: 'turquoise', back: 'darkturquoise'}
        ]
    },
    cx: 0,
    cy: 0
}

confetti.ctx = confetti.canvas.getContext('2d');

function resizeCanvas() {
    confetti.canvas.width = window.innerWidth;
    confetti.canvas.height = window.innerHeight;
    confetti.cx = confetti.ctx.canvas.width / 2;
    confetti.cy = confetti.ctx.canvas.height / 2;
}

resizeCanvas();

function initConfetti() {
    for (let i = 0; i < confetti.config.confettiCount; i++) {
        confetti.leafs.push({
            color: randomElem(confetti.config.colors),
            dimensions: {
                x: randomRange(10, 20),
                y: randomRange(10, 30)
            },

            position: {
                x: randomRange(0, confetti.canvas.width),
                y: confetti.canvas.height - 1
            },

            rotation: randomRange(0, 2 * Math.PI),
            scale: {
                x: 1,
                y: 1
            },

            velocity: {
                x: randomRange(-25, 25),
                y: randomRange(0, -50)
            }
        });
    }
}

function render() {
    confetti.rendering = true;

    confetti.ctx.clearRect(0, 0, confetti.canvas.width, confetti.canvas.height);

    confetti.leafs.forEach((confetto, index) => {
        let width = confetto.dimensions.x * confetto.scale.x;
        let height = confetto.dimensions.y * confetto.scale.y;

        // Move canvas to position and rotate
        confetti.ctx.translate(confetto.position.x, confetto.position.y);
        confetti.ctx.rotate(confetto.rotation);

        // Apply forces to velocity
        confetto.velocity.x -= confetto.velocity.x * confetti.config.drag;
        confetto.velocity.y = Math.min(confetto.velocity.y + confetti.config.gravity, confetti.config.terminalVelocity);
        confetto.velocity.x += Math.random() > 0.5 ? Math.random() : -Math.random();

        // Set position
        confetto.position.x += confetto.velocity.x;
        confetto.position.y += confetto.velocity.y;

        // Delete confetti when out of frame
        if (confetto.position.y >= confetti.canvas.height) confetti.leafs.splice(index, 1);

        // Loop confetto x position
        if (confetto.position.x > confetti.canvas.width) confetto.position.x = 0;
        if (confetto.position.x < 0) confetto.position.x = confetti.canvas.width;

        // Spin confetto by scaling y
        confetto.scale.y = Math.cos(confetto.position.y * 0.1);
        confetti.ctx.fillStyle = confetto.scale.y > 0 ? confetto.color.front : confetto.color.back;

        // Draw confetti
        confetti.ctx.fillRect(-width / 2, -height / 2, width, height);

        // Reset transform matrix
        confetti.ctx.setTransform(1, 0, 0, 1, 0, 0);
    });

    if (confetti.leafs.length >= 0) {
        window.requestAnimationFrame(render);
    } else {
        confetti.rendering = false;
    }
}

function startRender() {
    if (!confetti.rendering) {
        render();
    }
}


function explode() {
    confetti.leafs = [];
    initConfetti();
    startRender();
}

window.addEventListener('resize', resizeCanvas);