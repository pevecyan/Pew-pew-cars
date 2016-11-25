var listener;
var cylinder;
var chassis;
var finishPosition;
var halfPosition;
var laps = 17;

function initialize(){
    //input
    listener = new window.keypress.Listener();

    var engine = initializeEngine();
    // the canvas/window resize event handler
    window.addEventListener('resize', function(){
        engine.resize();
    });


}


function initializeEngine(){
    var canvas = document.getElementById('renderCanvas');
    var engine = new BABYLON.Engine(canvas, true);
    var scene = createScene(engine);

    //BABYLON.SceneLoader.ImportMesh("", "assets/", "tree.babylon", scene, function (models) { 
    //    models[0].scaling = new BABYLON.Vector3(10.0, 10.0, 10.0); 
    //    models[0].position.y = 0;
            //models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, {
            //    friction: 1,
            //    mass: 0
           // });
    //});
    //scene.registerBeforeRender(function(){
        //console.log(chassis.rotationQuaternion.toEulerAngles());
        //if(chassis.rotationQuaternion.toEulerAngles().x > Math.PI/4){
        //    chassis.rotate(BABYLON.Axis.Z, Math.PI/4, BABYLON.Space.LOCAL);
        //}else if(chassis.rotationQuaternion.toEulerAngles().x < -1){
        //    chassis.rotate(BABYLON.Axis.Z, -1, BABYLON.Space.LOCAL);
        //}
        //var before = chassis.rotationQuaternion;
        //chassis.rotate(BABYLON.Axis.Z, Math.PI/2, BABYLON.Space.LOCAL);
        //var after = chassis.rotationQuaternion;
        //var diff = after.subtract(before);
        //chassis.updatePhysicsBodyPosition();
        //chassis.rotationQuaternion = chassis.rotationQuaternion.add(BABYLON.Quaternion.RotationAlphaBetaGamma(0, 0, 0));
    //});

    engine.runRenderLoop(function(){
        scene.render();
    });

    return engine;
}

function createScene(engine){
    var scene = new BABYLON.Scene(engine);

    var gravity = new BABYLON.Vector3(0, -9.81, 0);
    scene.gravity = gravity
    scene.enablePhysics(gravity, new BABYLON.CannonJSPlugin());
    scene.collisionsEnabled = true;
    //scene.getPhysicsEngine().setTimeStep(1/10000)
    
    var light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0.2), scene);
    light.groundColor = new BABYLON.Color3(.2, .2, .2);

    var camera = new BABYLON.FollowCamera("Camera", new BABYLON.Vector3(0, 0, 0), scene);
    camera.radius *= 2;
    Game.Car.camera = camera;

    var camera2 = new BABYLON.FreeCamera("Camera2", new BABYLON.Vector3(0, 700, 0), scene);
    camera2.setTarget(BABYLON.Vector3.Zero());
    //scene.activeCamera = camera2;

    //WORLD
    Game.createWorld(scene);
    var checkpoints = [[-180,-9],[-97,-280],[150,-415],[420,-210],[490,350],[240,345],[-200,250],[-260,70]];
    //checkpoints -> x, z coordinates of checkpoints
    var radius = 80; //radius of checkpoint, sphere
    var players = Game.createPlayers(scene, checkpoints); //creates players & checkpoint positions
    var checkpointIndex = startingPositions(players.length, checkpoints.length); 
    //2D boolean array of indexes of current positions of players
    //lines == player index, columns == checkpoint index
    //if cell == true, last passed checkpoint of a player
    
    //CAR
    var car = Game.createCar(scene);
    camera.target = (Game.Car.chassis);

    document.onkeydown = Game.keyboardHandler;
    document.onkeyup = Game.keyboardHandler;

    scene.registerAfterRender(Game.Car.update);
    Game.Scene = scene;

    //GAMEPLAY
    finishPosition = false;
    halfPosition = true;
    car = Game.Car.chassis;

    var playerIndex = 0; //player == players[playerIndex]
    //todo: another loop for all players
    var currIndex = getCurrIndex(checkpointIndex[playerIndex]); //returns the passed checkpoint of a player
    movePlayer(players, playerIndex, checkpoints, currIndex); //move player from point a to b
    
    scene.registerBeforeRender(function (){
        if(halfPosition){
            checkFinishLine(car);
        }
        if(finishPosition){
            checkHalfLine(car);
        }     
        var next = checkIfCheckpointReached(scene, players, playerIndex, checkpoints, checkpointIndex, currIndex, radius);
        if(next != undefined){
             movePlayerNext(players, playerIndex, checkpoints, next);
        }
    });

    return scene;
}

//LAPS
function checkFinishLine(car){
    currPositionX = car.position.x;
    currPositionZ = car.position.z;
    if(currPositionX<10 && currPositionX>-190 && currPositionZ<-180 && currPositionZ>-200){
        finishPosition = true;
        halfPosition = false;
        laps--;
        console.log("Remaining laps: "+laps);
        if(laps == 0){
            console.log("Finished!");
            engine.stopRenderLoop();
        }
    } 
    
}

function checkHalfLine(car){
    currPositionX = car.position.x;
    currPositionZ = car.position.z;
    if(currPositionX<560 && currPositionX>360 && currPositionZ<10 && currPositionZ>-10){
        finishPosition = false;
        halfPosition = true;
    } 
}

//CHECKPOINTS OF PLAYERS - ENEMIES
function checkIfCheckpointReached(scene, players, playerIndex, checkpoints, checkpointIndex, currCheckpointIndex, radius){
    var playerX = players[playerIndex].position.x;
    var playerZ = players[playerIndex].position.z;
    var x = (playerX-checkpoints[currCheckpointIndex+1][0])*(playerX-checkpoints[currCheckpointIndex+1][0]);
    var z = (playerZ-checkpoints[currCheckpointIndex+1][1])*(playerZ-checkpoints[currCheckpointIndex+1][1]);
    var r = (radius/2)*(radius/2);
    if(x + z < r){ //check if player has reached the checkpoint
        checkpointIndex[playerIndex][currCheckpointIndex] = false;
        checkpointIndex[playerIndex][currCheckpointIndex+1] = true;
        var next = getCurrIndex(checkpointIndex[playerIndex]);
        return next; //return the next checkpoint
    }  
}

function movePlayer(players, playerIndex, checkpoints, checkpointIndex){
    console.log(checkpointIndex, checkpointIndex+1); //med 0. in 1. checkpoint
    var speed = Math.floor((Math.random() * 4) + 2);
    var move = BABYLON.Animation.CreateAndStartAnimation("move", players[playerIndex], "position", speed, 20, 
        new BABYLON.Vector3(checkpoints[checkpointIndex][0], 5, checkpoints[checkpointIndex][1]), new BABYLON.Vector3(checkpoints[checkpointIndex+1][0], 5, checkpoints[checkpointIndex+1][1]), BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
}

function movePlayerNext(players, playerIndex, checkpoints, checkpointIndex){
    console.log(checkpointIndex, checkpointIndex+1); //med 1. in 2. checkpoint... a ne dela!!
    var speedN = Math.floor((Math.random() * 4) + 2);
    var moveN = BABYLON.Animation.CreateAndStartAnimation("moveN", players[playerIndex], "positionN", speedN, 20,
        players[playerIndex].position, new BABYLON.Vector3(checkpoints[checkpointIndex+1][0], 5, checkpoints[checkpointIndex+1][1]), BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
}

function startingPositions(numPlayers, numCheckpoints){ //sets starting positions of players
    var indexes = [];
    for(var k = 0; k<numPlayers; k++){
        var arr = [];
        for(var l = 0; l<numCheckpoints; l++){
            arr[l] = false;
        }
        arr[0] = true; //first passed, index 0, only can detect next checkpoint
        indexes.push(arr);
    }
    return indexes;
}

function getCurrIndex(playerCheckpoints){ 
//get index of current passed checkpoint, movement will be between this and next one; +1
    for(var i = 0; i<playerCheckpoints.length; i++){
        if(playerCheckpoints[i] == true){
            return i;
        }
    }
}