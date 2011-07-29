var canvas, context, width, height;
var lightX, lightY, lightSize;
var mothSize;
var score = 0;
var moths = [];

var speedFactor = 10;
var healthEat = 0.02;
var healthStarve = -0.005
var healthChoke = 3;

$(
    function()
    {
        init();
        if (context != null) {

            // Spawn a new moth when we get a click.
            $(canvas).click(function(event) {
                $('#score').show();
                $('#help').hide();
                $('#end').hide();
                moths.push(new moth(rand(0, width - 1), rand(0, height - 1)));
            });

            // Update the light position when the mouse is moved.
            $(canvas).bind('mousemove', function(event) {
                lightX = event.pageX;
                lightY = event.pageY;
            });

            // No resizing allowed.
            $(window).resize(function(event) {
                die('imploded');
            });

            // Loop the play() function.
            setInterval(play, 50);
        }
    }
);

// Set up the canvas.
function init()
{
    canvas = $('#canvas')[0];
    if (canvas && canvas.getContext) {

        // Make it full screen.
        width = $(window).width();
        height = $(window).height();
        $(canvas).attr('width', width);
        $(canvas).attr('height', height);

        // Put the light in the middle.
        lightX = width / 2;
        lightY = height / 2;

        // Size the light and the moths according to the window Size.
        lightSize = width / 10;
        mothSize = width / 50;

        context = canvas.getContext('2d');
        context.globalCompositeOperation = 'darker';

    } else {
        alert('Your browser is not HTML5 capable. Too bad.');
    }
}

// Main play loop.
function play()
{
    context.clearRect(0, 0, width, height);
    drawLight();
    drawScore();
    for (var i in moths) {
        if (moths[i].isStarved()) {
            die('starved');
            break;
        }
        if (moths[i].isChoked()) {
            die('choked');
            break;
        }
        moths[i].move();
        moths[i].draw();
        moths[i].feed();
    }
}

// Draw the light.
function drawLight(event)
{
    var grad = context.createRadialGradient(lightX, lightY, 0, lightX, lightY, lightSize);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    context.fillStyle = grad;
    context.beginPath();
    context.arc(lightX, lightY, lightSize, 0, Math.PI * 2, false);
    context.fill();
}

// Draw the score.
function drawScore()
{
    $('#score > span').html(score);
}

// End the game.
function die(how)
{
    //clearInterval();
    $('#score').hide();
    $('#help').hide();
    $('#end > span:nth-child(1)').html(how);
    $('#end > span:nth-child(2)').html(score);
    $('#end').show();
    moths = [];
    score = 0;
}

// A moth object.
function moth(initX, initY)
{

    var x = initX;
    var y = initY;
    var direction = rand(0, 359);
    var health = 1;

    // Move this moth in the direction it's facing.
    this.move = function()
    {
        x += Math.sin(direction) * Math.min(1, health) * speedFactor;
        if (x >= width + (mothSize / 2)) {
            x = 0 - (mothSize / 2);
        } else if (x < 0 - (mothSize / 2)) {
            x = width + (mothSize / 2);
        }
        y += Math.cos(direction) * Math.min(1, health) * speedFactor;
        if (y >= height + (mothSize / 2)) {
            y = 0 - (mothSize / 2);
        } else if (y < 0 - (mothSize / 2)) {
            y = height + (mothSize / 2);
        }
        direction += Math.random(0.2) - 0.4;
    }

    // Draw this moth.
    this.draw = function()
    {
        // Select the color gradient according to health.
        var grad = context.createRadialGradient(x, y, 0, x, y, mothSize * Math.min(1, health));
        grad.addColorStop(0, '#ffff00');
        grad.addColorStop(1, '#000000');

        context.fillStyle = grad;
        context.beginPath();
        context.arc(x, y, mothSize * Math.min(1, health), 0, Math.PI * 2, false);
        context.fill();
    }

    // Feed this moth.
    this.feed = function()
    {

        // Distance to the light.
        var dist = Math.sqrt(Math.pow(x - lightX, 2) + Math.pow(y - lightY, 2));

        // If we're inside the light's radius, we get to eat and we move toward the light.
        if (dist <= lightSize) {

            // Score.
            score += moths.length;

            // Eat.
            health += healthEat;

            // Move toward the light.
            if (lightX != x || lightY != y) {
                direction = Math.atan2(x - lightX, y - lightY) + 360 + rand(-1, 1);
            }

        } else {

            // Starvelate.
            if (health > 1) {
                health = 1;
            }
            health += healthStarve;

        }

    }

    // Are we starved?
    this.isStarved = function()
    {
        return health < 0 ? true : false;
    }

    // Are we choked?
    this.isChoked = function()
    {
        return health >= healthChoke ? true : false;
    }

}

function rand(min, max)
{
    return Math.floor((Math.random() * (max - min + 1)) + 1);
}