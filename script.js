window.tanks = function tanks(element) {
    const WIDTH = 800;
    const HEIGHT = 600;

    const KEY_LEFT = 37;
    const KEY_RIGHT = 39;
    const KEY_UP = 38;
    const KEY_DOWN = 40;
    const KEY_SPACE = 32;

    const KEY_W = 87;
    const KEY_A = 65;
    const KEY_S = 83;
    const KEY_D = 68;
    const KEY_F = 70;

    const DIRECTION_UP = 0;
    const DIRECTION_RIGHT = 1.57;
    const DIRECTION_DOWN = Math.PI;
    const DIRECTION_LEFT = 4.71;

    const TANK_SIZE = 50;
    const TANK_COLOR_GREEN = 'green';
    const TANK_COLOR_YELLOW = 'yellow';

    const canvas = document.createElement('canvas');
    canvas.height = HEIGHT;
    canvas.width = WIDTH;

    element.appendChild(canvas);

    const TANK_IMAGES = {};

    [TANK_COLOR_GREEN, TANK_COLOR_YELLOW].forEach(function(color) {
        TANK_IMAGES[color] = [];
        for (var i = 1; i <= 3; i++) {
            var element = document.createElement('img');
            element.src = 'img/' + color + '-tank-' + i + '.svg';
            TANK_IMAGES[color].push(element);
        }
    });

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

    function between(n, x1, x2) {
        return n >= x1 && n < x2;
    }

    function colided(x1, xo1, x2, xo2) {
        return between(x1, x2, xo2) || between(xo1, x2, xo2);
    }

    function Actor(x, y, w, h, x_speed, y_speed) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.x_speed = x_speed || 0;
        this.y_speed = y_speed || 0;
    }

    Actor.prototype.onOut = function() {};

    Actor.prototype.render = function() {
        context.fillStyle = '#fff';
        context.fillRect(this.x, this.y, this.w, this.h);
    };

    Actor.prototype.update = function() {
        if ((this.x_speed < 0 && this.x > 0) || (this.x_speed > 0 && (this.x + this.w) < WIDTH)) {
            this.x += this.x_speed;
        } else if (this.x_speed != 0) {
            this.onOut();
        }

        if ((this.y_speed < 0 && this.y > 0) || (this.y_speed > 0 && (this.y + this.h) < HEIGHT)) {
            this.y += this.y_speed;
        } else if (this.y_speed != 0) {
            this.onOut();
        }
    };

    Actor.prototype.futureX = function() {
        return this.x + this.x_speed;
    };

    Actor.prototype.futureY = function() {
        return this.y + this.y_speed;
    };

    Actor.prototype.futureOuterX = function() {
        return this.futureX() + this.w;
    };

    Actor.prototype.futureOuterY = function() {
        return this.futureY() + this.h;
    };

    Actor.prototype.move = function(x, y) {
        this.x_speed = x;
        this.y_speed = y;
    };

    Actor.prototype.colided = function(actor) {
        if (colided(this.futureX(), this.futureOuterX(), actor.futureX(), actor.futureOuterX())) {
            if (colided(this.futureY(), this.futureOuterY(), actor.futureY(), actor.futureOuterY())) {
                return true;
            }
        }

        return false;
    };

    function Tank(x, y, direction, color, upKey, rightKey, downKey, leftKey) {
        Actor.call(this, x, y, TANK_SIZE, TANK_SIZE);
        this.direction = direction;
        this.evenTick = 0;
        this.upKey = upKey;
        this.rightKey = rightKey;
        this.downKey = downKey;
        this.leftKey = leftKey;
        this.color = color;
    }

    Tank.prototype = Object.create(Actor.prototype);

    Tank.prototype.update = function() {
        if (keys.hasOwnProperty(this.upKey)) {
            this.direction = DIRECTION_UP;
            this.move(0, -1);
        } else if (keys.hasOwnProperty(this.rightKey)) {
            this.direction = DIRECTION_RIGHT;
            this.move(1, 0);
        } else if (keys.hasOwnProperty(this.downKey)) {
            this.direction = DIRECTION_DOWN;
            this.move(0, 1);
        } else if (keys.hasOwnProperty(this.leftKey)) {
            this.direction = DIRECTION_LEFT;
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
            context.drawImage(TANK_IMAGES[this.color][this.evenTick], -this.w, -this.h, this.w, this.h);
        } else if (this.direction === DIRECTION_LEFT) {
            context.drawImage(TANK_IMAGES[this.color][this.evenTick], -this.w, 0, this.w, this.h);
        } else if (this.direction === DIRECTION_RIGHT) {
            context.drawImage(TANK_IMAGES[this.color][this.evenTick], 0, -this.h, this.w, this.h);
        } else {
            context.drawImage(TANK_IMAGES[this.color][this.evenTick], 0, 0, this.w, this.h);
        }

        context.restore();
    };

    Tank.prototype.move = function(x, y) {
        if (x || y) {
            this.evenTick++;
            this.evenTick %= 3;
        }

        Actor.prototype.move.call(this, x, y);

        if (this.colided(this.enemeny)) {
            this.x_speed = 0;
            this.y_speed = 0;
        }
    };

    Tank.prototype.setEnemy = function(tank) {
        this.enemeny = tank;
    };

    function Projectile(tank, enemy, key) {
        Actor.call(this, 0, 0, 5, 5);
        this.tank = tank;
        this.enemy = enemy;
        this.fired = false;
        this.key = key;
    }

    Projectile.prototype = Object.create(Actor.prototype);

    Projectile.prototype.update = function() {
        if (this.colided(this.enemy)) {
            this.fired = false;
        }

        if (keys.hasOwnProperty(this.key) && !this.fired) {
            this.fired = true;
            this.x = this.tank.x + ((this.tank.w / 2) - (this.w / 2));
            this.y = this.tank.y + ((this.tank.h / 2) - (this.h / 2));

            if (this.tank.direction === DIRECTION_UP) {
                this.move(0, -4);
            } else if (this.tank.direction === DIRECTION_DOWN) {
                this.move(0, 4);
            } else if (this.tank.direction === DIRECTION_RIGHT) {
                this.move(4, 0);
            } else if (this.tank.direction === DIRECTION_LEFT) {
                this.move(-4, 0);
            }
        }

        Actor.prototype.update.call(this);
    };

    Projectile.prototype.onOut = function() {
        this.fired = false;
    };

    Projectile.prototype.render = function() {
        if (!this.fired) {
            return;
        }

        Actor.prototype.render.call(this);
    };

    var tank = new Tank(WIDTH / 2 - TANK_SIZE / 2, 499, DIRECTION_DOWN, TANK_COLOR_GREEN, KEY_UP, KEY_RIGHT, KEY_DOWN, KEY_LEFT);
    var tank2 = new Tank(WIDTH / 2 - TANK_SIZE / 2, HEIGHT - TANK_SIZE, DIRECTION_UP, TANK_COLOR_YELLOW, KEY_W, KEY_D, KEY_S, KEY_A);
    tank.setEnemy(tank2);
    tank2.setEnemy(tank);
    const actors = [
        tank,
        new Projectile(tank, tank2, KEY_SPACE),
        tank2,
        new Projectile(tank2, tank, KEY_F)
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
