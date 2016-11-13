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

        scene.enablePhysics(null, new BABYLON.CannonJSPlugin());

        //scene.getPhysicsEngine().setTimeStep(1/10000)
        
        var light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0.2), scene);
        light.groundColor = new BABYLON.Color3(.2, .2, .2);

        // Camera
        var camera = new BABYLON.FollowCamera("Camera", new BABYLON.Vector3(0, 0, 0), scene);
        camera.radius *= 1;

        

        var y = 0;
        //var ground = BABYLON.Mesh.CreateGround("ground1", 600, 600, 2, scene);
        //ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);
        


        //CAR!
        var width = 2;
        var depth = 4;
        var height = 0.1;

        var wheelDiameter = 1;
        var wheelDepthPosition = (depth + wheelDiameter) / 2

        var axisWidth = width + wheelDiameter;

        var centerOfMassAdjust = new CANNON.Vec3(0, 0, 0);

        var chassis = BABYLON.MeshBuilder.CreateBox("chassis", {
            width: width,
            height: height,
            depth: depth
        }, scene);
        chassis.position.y = wheelDiameter + height / 2;
        chassis.physicsImpostor = new BABYLON.PhysicsImpostor(chassis, BABYLON.PhysicsEngine.BoxImpostor, {
            mass: 100
        })
        camera.target = (chassis);
        var wheels = [0, 1, 2, 3].map(function(num) {
            var wheel = BABYLON.MeshBuilder.CreateCylinder("wheel" + num, {
                segments: 4,
                diameter: wheelDiameter
            }, scene);
            var a = (num % 2) ? -1 : 1;
            var b = num < 2 ? 1 : -1;
            wheel.rotation = new BABYLON.Vector3(0,0, Math.PI / 2);
			wheel.bakeCurrentTransformIntoVertices();

            wheel.position.copyFromFloats(a * axisWidth / 2, wheelDiameter / 2, b * wheelDepthPosition)
            //wheel.rotation.x = Math.PI/4;
            //wheel.rotation.y = Math.PI/4;
            wheel.scaling.x = 0.4;
            

            wheel.physicsImpostor = new BABYLON.PhysicsImpostor(wheel, BABYLON.PhysicsEngine.SphereImpostor, {
                friction:0.5,
                mass: 3
            });
            return wheel;
        });

        var vehicle = new CANNON.RigidVehicle({
            chassisBody: chassis.physicsImpostor.physicsBody
        });


        var down = new CANNON.Vec3(0, 1, 0);

        vehicle.addWheel({
            body: wheels[0].physicsImpostor.physicsBody,
            position: new CANNON.Vec3(axisWidth / 2, 0, wheelDepthPosition).vadd(centerOfMassAdjust),
            axis: new CANNON.Vec3(1, 0, 0),
            direction: down
        });

        vehicle.addWheel({
            body: wheels[1].physicsImpostor.physicsBody,
            position: new CANNON.Vec3(-axisWidth / 2, 0, wheelDepthPosition).vadd(centerOfMassAdjust),
            axis: new CANNON.Vec3(-1, 0, 0),
            direction: down
        });

        vehicle.addWheel({
            body: wheels[2].physicsImpostor.physicsBody,
            position: new CANNON.Vec3(axisWidth / 2, 0, -wheelDepthPosition).vadd(centerOfMassAdjust),
            axis: new CANNON.Vec3(1, 0, 0),
            direction: down,
            isFrontWheel:true
        });

        vehicle.addWheel({
            body: wheels[3].physicsImpostor.physicsBody,
            position: new CANNON.Vec3(-axisWidth / 2, 0, -wheelDepthPosition).vadd(centerOfMassAdjust),
            axis: new CANNON.Vec3(-1, 0, 0),
            direction: down,
            isFrontWheel:true
        });

        // Some damping to not spin wheels too fast
        for (var i = 0; i < vehicle.wheelBodies.length; i++) {
            vehicle.wheelBodies[i].angularDamping = 0.4;
        }

        //add the constraints to the world
        var world = wheels[3].physicsImpostor.physicsBody.world

        for (var i = 0; i < vehicle.constraints.length; i++) {
            world.addConstraint(vehicle.constraints[i]);
        }

        var setSteeringValue = function(value, wheelIndex) {
            // Set angle of the hinge axis
            var axis = this.wheelAxes[wheelIndex];

            var c = Math.cos(value),
                s = Math.sin(value),
                x = axis.x,
                z = axis.z;
            this.constraints[wheelIndex].axisA.set(
                c * x - s * z,
                0,
                s * x + c * z
            );
        };
        vehicle.setSteeringValue = setSteeringValue.bind(vehicle);

        world.addEventListener('preStep', vehicle._update.bind(vehicle));

        document.onkeydown = handler;
        document.onkeyup = handler;

        scene.onPointerUp = function() {
            chassis.physicsImpostor.applyImpulse(new BABYLON.Vector3(200, 200, 0), chassis.getAbsolutePosition())
        }

        var maxSteerVal = Math.PI / 8;
        var maxSpeed = 100;
        var maxForce = 100 ;

        function handler(event) {
            var up = (event.type == 'keyup');

            if (!up && event.type !== 'keydown')
                return;

            switch (event.keyCode) {

                case 38: // forward
                    vehicle.setWheelForce(up ? 0 : -maxForce, 0);
                    vehicle.setWheelForce(up ? 0 : maxForce, 1);
                    
                    
                    break;

                case 40: // backward
                    vehicle.setWheelForce(up ? 0 : maxForce / 2, 0);
                    vehicle.setWheelForce(up ? 0 : -maxForce / 2, 1);
                    break;

                case 39: // right
                    vehicle.setSteeringValue(up ? 0 : -maxSteerVal, 2);
                    vehicle.setSteeringValue(up ? 0 : -maxSteerVal, 3);
                    break;

                case 37: // left
                    vehicle.setSteeringValue(up ? 0 : maxSteerVal, 2);
                    vehicle.setSteeringValue(up ? 0 : maxSteerVal, 3);
                    break;
                case 32:
                    vehicle.setWheelForce  (-100,0);
                    vehicle.setWheelForce  (-100,1);
                    break;

            }
        }
        var ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "worldHeightMap.jpg", 400, 400, 250, 0, 15, scene, false, function() {
            ground.position.y -= 10;
            ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsEngine.HeightmapImpostor, {
                friction: 1,
                mass: 0
            });
        });
        var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("world.png", scene);
        ground.material = groundMaterial;
        return scene;
    }

    // call the createScene function
    var scene = createScene();

    // run the render loop
    engine.runRenderLoop(function(){
        scene.render();
    });
}