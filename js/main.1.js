var listener;
var cylinder;
function initialize(){
    //input
    listener = new window.keypress.Listener();

    // the canvas/window resize event handler
    window.addEventListener('resize', function(){
        engine.resize();
    });


    initializeEngine();
}


function initializeEngine(){
    // get the canvas DOM element
    var canvas = document.getElementById('renderCanvas');

    // load the 3D engine
    var engine = new BABYLON.Engine(canvas, true);
    
    // createScene function that creates and return the scene
    var createScene = function(){

        var scene = new BABYLON.Scene(engine);
        var gravityVector = new BABYLON.Vector3(0,-9.81, 0);
        var physicsPlugin = new BABYLON.CannonJSPlugin();
        scene.enablePhysics(gravityVector, physicsPlugin);


        var camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5,-10), scene);
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.attachControl(canvas, true);

        var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);


        //Car objects
        //Chassis
        var chassis = BABYLON.Mesh.CreateBox("chassis", 1.0, scene);
        chassis.scaling = new BABYLON.Vector3(6,0.5,3);
        chassis.position = new BABYLON.Vector3(10, 5, 0);
        //Wheels
        var wheel1 = BABYLON.Mesh.CreateCylinder("wheel1", 0.5, 2, 2, 20, 1, scene);
        wheel1.position = new BABYLON.Vector3(7.5,5,1.5);
        wheel1.rotation = new BABYLON.Vector3(0, Math.PI/2,Math.PI/2);
        

        var wheel2 = BABYLON.Mesh.CreateCylinder("wheel2", 0.5, 2, 2, 20, 1, scene);
        wheel2.position = new BABYLON.Vector3(7.5,5,-1.5);
        wheel2.rotation = new BABYLON.Vector3(0, Math.PI/2,Math.PI/2);

        var wheel3 = BABYLON.Mesh.CreateCylinder("wheel3", 0.5, 2, 2, 20, 1, scene);
        wheel3.position = new BABYLON.Vector3(12.5,5,1.5);
        wheel3.rotation = new BABYLON.Vector3(0, Math.PI/2,Math.PI/2);

        var wheel4 = BABYLON.Mesh.CreateCylinder("wheel4", 0.5, 2, 2, 20, 1, scene);
        wheel4.position = new BABYLON.Vector3(12.5,5,-1.5);
        wheel4.rotation = new BABYLON.Vector3(0, Math.PI/2,Math.PI/2);
        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;

        // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
        var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);

        // Move the sphere upward 1/2 its height
        sphere.position.y = 2;

        // Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
        var ground = BABYLON.Mesh.CreateGround("ground1", 60, 60, 2, scene);


        cylinder = BABYLON.Mesh.CreateCylinder("cylinder", 1, 3, 3, 10, 1, scene);

        cylinder.position = new BABYLON.Vector3(-5,5,0);
        cylinder.rotation.x = Math.PI/2;

        sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0.9 }, scene);
	    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);

        //car physics impostors
        chassis.physicsImpostor = new BABYLON.PhysicsImpostor(chassis, BABYLON.PhysicsImpostor.BoxImpostor,{mass:20, restitution : 0}, scene);
        wheel1.physicsImpostor = new BABYLON.PhysicsImpostor(wheel1, BABYLON.PhysicsImpostor.BoxImpostor, {mass:1, restitution:0, friction:0.1}, scene);
        wheel2.physicsImpostor = new BABYLON.PhysicsImpostor(wheel2, BABYLON.PhysicsImpostor.BoxImpostor, {mass:1, restitution:0, friction:0.1}, scene);
        wheel3.physicsImpostor = new BABYLON.PhysicsImpostor(wheel3, BABYLON.PhysicsImpostor.BoxImpostor, {mass:1, restitution:0, friction:0.1}, scene);
        wheel4.physicsImpostor = new BABYLON.PhysicsImpostor(wheel4, BABYLON.PhysicsImpostor.BoxImpostor, {mass:1, restitution:0, friction:0.1}, scene);

        var wheel1Joint = new BABYLON.HingeJoint({
            mainPivot:new BABYLON.Vector3(2.5,0,2),
            mainAxis: new BABYLON.Vector3(0, 0, -1),
            connectedAxis: new BABYLON.Vector3(0, -1, 0),
            nativeParams: {
                limit: [0, 0],
                spring: [100, 2],
                min: 5,
                max: 30
            }
        });
        chassis.physicsImpostor.addJoint(wheel1.physicsImpostor, wheel1Joint);
        var wheel2Joint = new BABYLON.HingeJoint({
            mainPivot:new BABYLON.Vector3(2.5,0,-2),
            mainAxis: new BABYLON.Vector3(0,0 ,-1),
            connectedAxis: new BABYLON.Vector3(0, -1, 0),
            nativeParams: {
                limit: [0, 0],
                spring: [100, 2],
                min: 5,
                max: 30
            }
        });
        chassis.physicsImpostor.addJoint(wheel2.physicsImpostor, wheel2Joint);
        var wheel3Joint = new BABYLON.Hinge2Joint({
            mainPivot:new BABYLON.Vector3(-2.5,0,1.5),
            mainAxis: new BABYLON.Vector3(0, 0,-1),
            connectedAxis: new BABYLON.Vector3(0, -1, 0),
            nativeParams: {
                spring: [100, 2],
                min: 5,
                max: 30
            }
        });
        chassis.physicsImpostor.addJoint(wheel3.physicsImpostor, wheel3Joint);
        var wheel4Joint = new BABYLON.Hinge2Joint({
            mainPivot:new BABYLON.Vector3(-2.5,0,-1.5),
            mainAxis: new BABYLON.Vector3(0, 0,-1),
            connectedAxis: new BABYLON.Vector3(0, -1, 0),
            nativeParams: {
                limit: [0, 0],
                spring: [100, 2],
                min: 5,
                max: 30
            }
        });
        chassis.physicsImpostor.addJoint(wheel4.physicsImpostor, wheel4Joint);

        cylinder.physicsImpostor = new BABYLON.PhysicsImpostor(cylinder, BABYLON.PhysicsImpostor.CylinderImpostor,{ mass:1, restitution:0.0}, scene);
        
        var distanceJoint = new BABYLON.DistanceJoint({ maxDistance: 10 });
        sphere.physicsImpostor.addJoint(cylinder.physicsImpostor, distanceJoint);

        


        document.onkeydown = handler;
        document.onkeyup = handler;

        function handler(event){
            var up = (event.type == 'keyup');

            if(!up && event.type !== 'keydown'){
                return;
            }

            switch(event.keyCode){
                case 87: // forward
                    wheel1Joint.setMotor(5);
                    wheel2Joint.setMotor(5);
                    //chassis.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0,10,0));
                    //vehicle.applyEngineForce(up ? 0 : -maxForce, 2);
                    //vehicle.applyEngineForce(up ? 0 : -maxForce, 3);
                    break;

                case 83: // backward
                    //sphere.physicsImpostor.setAngularVelocity(new BABYLON.Quaternion(sphere.rotation.x,0,-5,0));
                    //vehicle.applyEngineForce(up ? 0 : maxForce, 2);
                    //vehicle.applyEngineForce(up ? 0 : maxForce, 3);
                    break;

                case 66: // b
                    //cylinder.rotation.z = Math.PI/4;
                    //vehicle.setBrake(brakeForce, 0);
                    //vehicle.setBrake(brakeForce, 1);
                    //vehicle.setBrake(brakeForce, 2);
                    //vehicle.setBrake(brakeForce, 3);
                    break;

                case 68: // right
                    wheel1.rotation.x = Math.PI/20
                    wheel2.rotation.x = Math.PI/20
                    //vehicle.setSteeringValue(up ? 0 : -maxSteerVal, 0);
                    //vehicle.setSteeringValue(up ? 0 : -maxSteerVal, 1);
                    break;

                case 65: // left
                    wheel1.rotation.x = -Math.PI/20
                    wheel2.rotation.x = -Math.PI/20
                    //vehicle.setSteeringValue(up ? 0 : maxSteerVal, 0);
                    //vehicle.setSteeringValue(up ? 0 : maxSteerVal, 1);
                    break;
            }
        }
        /*
        // create a basic BJS Scene object
        var scene = new BABYLON.Scene(engine);

        // create a FreeCamera, and set its position to (x:0, y:5, z:-10)

        // target the camera to scene origin

        // attach the camera to the canvas
        camera.attachControl(canvas, false);

        // create a basic light, aiming 0,1,0 - meaning, to the sky
        var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), scene);

        // create a built-in "sphere" shape; its constructor takes 5 params: name, width, depth, subdivisions, scene
        var sphere = BABYLON.Mesh.CreateSphere('sphere1', 16, 2, scene);

        // move the sphere upward 1/2 of its height
        sphere.position.y = 2;

        // create a built-in "ground" shape; its constructor takes the same 5 params as the sphere's one
        //var ground = BABYLON.Mesh.CreateGround('ground1', 6, 6, 2, scene);
        var ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "worldHeightMap.jpg", 200, 200, 250, 0, 10, scene, false);
        // return the created scene
        */
        return scene;
    }

    // call the createScene function
    var scene = createScene();

    // run the render loop
    engine.runRenderLoop(function(){
        scene.render();
    });
}