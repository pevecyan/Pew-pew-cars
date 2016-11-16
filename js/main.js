var listener;
var cylinder;

function initialize(){
    listener = new window.keypress.Listener();
    
    initializeEngine();

    window.addEventListener('resize', function(){
        engine.resize();
    });
}


function initializeEngine(){
    var canvas = document.getElementById('renderCanvas');
    var engine = new BABYLON.Engine(canvas, true);
    
    var createScene = function(){
        var scene = new BABYLON.Scene(engine);
        scene.enablePhysics(null, new BABYLON.CannonJSPlugin());
        //scene.getPhysicsEngine().setTimeStep(1/10000)
        
        var light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0.2), scene);
        light.groundColor = new BABYLON.Color3(.2, .2, .2);

        var camera = new BABYLON.FollowCamera("Camera", new BABYLON.Vector3(0, 0, 0), scene);

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

        //skyBoxInit(scene);

        var ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "assets/worldHeightMap.jpg", 400, 400, 250, 0, 15, scene, false, function() {
            ground.position.y -= 10;
            ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsEngine.HeightmapImpostor, {
                friction: 1,
                mass: 0
            });
        });
        var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("assets/world.png", scene);
        ground.material = groundMaterial;

         //BOX

        var box = BABYLON.Mesh.CreateBox("box1", 5.0, scene);
        box.position = new BABYLON.Vector3(-10, -7.5, 0);  
        box.material = new BABYLON.StandardMaterial('texture1', scene);
        box.material.diffuseColor = new BABYLON.Color3(1, 0, 0);

        //PHYSICS   

        scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
        var gravity = new BABYLON.Vector3(0, -9.81, 0);
        scene.enablePhysics(gravity, new BABYLON.CannonJSPlugin());
        scene.collisionsEnabled = true;

        box.applyGravity = true;
        box.ellipsoid = new BABYLON.Vector3(1.0, 1.0, 1.0);

        ground.applyGravity = true;
        ground.ellipsoid = new BABYLON.Vector3(400.0, 2.0, 400.0);  

        box.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, { mass: 100 });

        ground.checkCollisions = true;
        box.checkCollisions = true;   

        shootBullet(scene, camera, box, ground);   

        return scene;
    }
    var scene = createScene();

    engine.runRenderLoop(function(){
        scene.render();
    });
}


function bulletParticles(scene, bullet){
    var particleSystem = new BABYLON.ParticleSystem("particles", 200, scene);
    particleSystem.particleTexture = new BABYLON.Texture("assets/flare.png", scene);
    particleSystem.emitter = bullet;
    particleSystem.minEmitBox = new BABYLON.Vector3.Zero();
    particleSystem.maxEmitBox = new BABYLON.Vector3.Zero();
    particleSystem.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
    particleSystem.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
    particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.5;
    particleSystem.minLifeTime = 0.7;
    particleSystem.maxLifeTime = 0.9;
    particleSystem.emitRate = 1500;
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    particleSystem.gravity =    new BABYLON.Vector3(0, -9.81, 0);
    particleSystem.direction1 = new BABYLON.Vector3(-1, 1, -1);
    particleSystem.direction2 = new BABYLON.Vector3( 1, 1,  1);
    particleSystem.minAngularSpeed = 0;
    particleSystem.maxAngularSpeed = Math.PI;
    particleSystem.minEmitPower = 3;
    particleSystem.maxEmitPower = 4;
    particleSystem.updateSpeed = 0.005;
    particleSystem.start(); 
}

function shootBullet(scene, camera, box, ground){
    window.addEventListener("keydown", function (e) {
    if (e.keyCode == 88) { //x
        var bullet = BABYLON.Mesh.CreateSphere('bullet', 100.0, 0.5, scene);
        var startPos = camera.position; //car position

        bullet.position = new BABYLON.Vector3(startPos.x, startPos.y, startPos.z);
        bullet.material =  new BABYLON.StandardMaterial('texture1', scene);
        bullet.material.diffuseColor = new BABYLON.Color3(3, 2, 0);

        bullet.applyGravity = true;
        bullet.ellipsoid = new BABYLON.Vector3(0.25, 0.25, 0.25);
        bullet.setPhysicsState(BABYLON.PhysicsEngine.SphereImpostor, { mass: 1.0 });

        bullet.checkCollisions = true;     
            
        var invView = new BABYLON.Matrix();
        camera.getViewMatrix().invertToRef(invView); //car
        var direction = BABYLON.Vector3.TransformNormal(new BABYLON.Vector3(0, 0, 1), invView);
        direction.normalize();  

        //bulletParticles(scene, bullet);

         //---------------------TODO

        var ray = BABYLON.Ray.CreateNewFromTo(camera.position, camera.getTarget()).direction;
        var r = camera.getTarget().subtract(camera.position);
        r = r.normalize();     

        var forwards = new BABYLON.Vector3(parseFloat(Math.sin(bullet.rotation.y)) / 8, 0.15, parseFloat(Math.cos(bullet.rotation.y)) / 8);
        forwards.negate();

        //bullet.moveWithCollisions(forwards);

        var bulletDirection = new BABYLON.Vector3(0, 0, -20);
        bullet.physicsImpostor.setLinearVelocity(bulletDirection);

        //bullet.applyImpulse(direction, camera.position);
        //bullet.position.addInPlace(direction); 
        
        scene.registerBeforeRender(function () {
            //bullet.position.z -= 0.1;  
            //bullet.position.addInPlace(direction);     
            //bullet.applyImpulse(direction, bullet.getAbsolutePosition());             
        });

        //--------------------

        box.physicsImpostor.registerOnPhysicsCollide(bullet.physicsImpostor, function(main, collided) {
            main.object.material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
            //collided.object.setEnabled(0);
        });

        ground.physicsImpostor.registerOnPhysicsCollide(bullet.physicsImpostor, function(main, collided) {
            //setTimeout(function(){ collided.object.setEnabled(0); }, 500);
            collided.object.material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
        }); 
    }
    });
}

function skyBoxInit(scene){
    var skybox = BABYLON.Mesh.CreateBox("skyBox", 60.0, scene);
    skybox.position = new BABYLON.Vector3(0, 30.1, 0);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("skybox/skybox", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;
}