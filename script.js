window.tanks = function tanks(element) {
    const WIDTH = 800;
    const HEIGHT = 600;

    const KEY_LEFT = 37;
    const KEY_RIGHT = 39;
    const KEY_UP = 38;
    const KEY_DOWN = 40;
    const KEY_SPACE = 32;

    const canvas = document.createElement('canvas');
    canvas.height = HEIGHT;
    canvas.width = WIDTH;

    const context = canvas.getContext('2d');
    element.appendChild(canvas);

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
        Actor.call(this, x, y, 100, 100);
    }

    Tank.prototype = Object.create(Actor.prototype);

    Tank.prototype.update = function() {
        if (keys.hasOwnProperty(KEY_UP)) {
            this.move(0, -1);
        } else if (keys.hasOwnProperty(KEY_RIGHT)) {
            this.move(1, 0);
        } else if (keys.hasOwnProperty(KEY_DOWN)) {
            this.move(0, 1);
        } else if (keys.hasOwnProperty(KEY_LEFT)) {
            this.move(-1, 0);
        } else {
            this.move(0, 0);
        }

        Actor.prototype.update.call(this);
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
