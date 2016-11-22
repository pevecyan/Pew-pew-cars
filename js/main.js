var listener;
var cylinder;
var chassis;
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
    // get the canvas DOM element
    var canvas = document.getElementById('renderCanvas');

    // load the 3D engine
    var engine = new BABYLON.Engine(canvas, true);
    
    // call the createScene function
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

    

    // run the render loop
    engine.runRenderLoop(function(){
        scene.render();
    });

    return engine;
}

function createScene(engine){
    var scene = new BABYLON.Scene(engine);

    scene.enablePhysics(null, new BABYLON.CannonJSPlugin());

    //scene.getPhysicsEngine().setTimeStep(1/10000)
    
    var light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0.2), scene);
    light.groundColor = new BABYLON.Color3(.2, .2, .2);

    // Camera
    var camera = new BABYLON.FollowCamera("Camera", new BABYLON.Vector3(0, 0, 0), scene);
    camera.radius *= 2 ;
    Game.Car.camera = camera;
    Game.createWorld(scene);
    //CAR
    Game.createCar(scene);
    
    camera.target = (Game.Car.chassis);

    document.onkeydown = Game.keyboardHandler;
    document.onkeyup = Game.keyboardHandler;

    scene.registerAfterRender(Game.Car.update);
    Game.Scene = scene;
    return scene;
}

