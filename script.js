window.tanks = function tanks(element) {
    const WIDTH = 800;
    const HEIGHT = 600;

    const KEY_LEFT = 37;
    const KEY_RIGHT = 39;
    const KEY_UP = 38;
    const KEY_DOWN = 40;
    const KEY_SPACE = 32;

    const DIRECTION_UP = 0;
    const DIRECTION_RIGHT = 1.57;
    const DIRECTION_DOWN = Math.PI;
    const DIRECTION_LEFT = 4.71;

    const canvas = document.createElement('canvas');
    canvas.height = HEIGHT;
    canvas.width = WIDTH;

    element.appendChild(canvas);

    const tankImages = [
        document.createElement('img'),
        document.createElement('img'),
        document.createElement('img')
    ];

    tankImages[0].src = 'img/green-tank-1.svg';
    tankImages[1].src = 'img/green-tank-2.svg';
    tankImages[2].src = 'img/green-tank-3.svg';

    const context = canvas.getContext('2d');

    const animate = window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
        function(callback) {
            setTimeout(callback, 1000/60);
        };

    const keys = {};

    document.addEventListener('keydown', function(e) {
        keys[e.keyCode] = true;
    });

    document.addEventListener('keyup', function (e) {
        delete keys[e.keyCode];
    });

    function Actor(x, y, w, h, x_speed, y_speed) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.x_speed = x_speed || 0;
        this.y_speed = y_speed || 0;
    }

    Actor.prototype.render = function() {
        context.fillStyle = '#fff';
        context.fillRect(this.x, this.y, this.w, this.h);
    };

    Actor.prototype.update = function() {
        if ((this.x_speed < 0 && this.x > 0) || (this.x_speed > 0 && (this.x + this.w) < WIDTH)) {
            this.x += this.x_speed;
        }

        if ((this.y_speed < 0 && this.y > 0) || (this.y_speed > 0 && (this.y + this.h) < HEIGHT)) {
            this.y += this.y_speed;
        }
    };

    Actor.prototype.move = function(x, y) {
        this.x_speed = x;
        this.y_speed = y;
    };

    function Tank(x, y) {
        Actor.call(this, x, y, 50, 50);
        this.direction = DIRECTION_UP;
        this.evenTick = 0;
    }

    Tank.prototype = Object.create(Actor.prototype);

    Tank.prototype.update = function() {
        if (keys.hasOwnProperty(KEY_UP)) {
            this.direction = DIRECTION_UP;
            this.evenTick++;
            this.evenTick %= 3;
            this.move(0, -1);
        } else if (keys.hasOwnProperty(KEY_RIGHT)) {
            this.direction = DIRECTION_RIGHT;
            this.evenTick++;
            this.evenTick %= 3;
            this.move(1, 0);
        } else if (keys.hasOwnProperty(KEY_DOWN)) {
            this.direction = DIRECTION_DOWN;
            this.evenTick++;
            this.evenTick %= 3;
            this.move(0, 1);
        } else if (keys.hasOwnProperty(KEY_LEFT)) {
            this.direction = DIRECTION_LEFT;
            this.evenTick++;
            this.evenTick %= 3;
            this.move(-1, 0);
        } else {
            this.move(0, 0);
        }

        Actor.prototype.update.call(this);
    };

    Tank.prototype.render = function() {
        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.direction);

        if (this.direction === DIRECTION_DOWN) {
            context.drawImage(tankImages[this.evenTick], -this.w, -this.h, this.w, this.h);
        } else if (this.direction === DIRECTION_LEFT) {
            context.drawImage(tankImages[this.evenTick], -this.w, 0, this.w, this.h);
        } else if (this.direction === DIRECTION_RIGHT) {
            context.drawImage(tankImages[this.evenTick], 0, -this.h, this.w, this.h);
        } else {
            context.drawImage(tankImages[this.evenTick], 0, 0, this.w, this.h);
        }

        context.restore();
    };

    const actors = [
        new Actor(0, 0, 100, 100),
        new Tank(0, 0)
    ];

    function update() {
        actors.forEach(function(actor) { actor.update() });
    }

    function render() {
        context.fillStyle = '#000';
        context.fillRect(0, 0, WIDTH, HEIGHT);

        actors.forEach(function(actor) { actor.render() });
    }

    function step() {
        update();
        render();
        animate(step);
    }

    animate(step);
};
