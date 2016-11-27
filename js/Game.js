var ground;
var players = [];
var playerAnimation = [];
var playersCheckpointsIndexes = [];
var playersHealth = [];
var checkpointIndex;
var checkpoints = [];

var Game = {
    createWorld:function(scene){

        Game.Car.gunshoot = new BABYLON.Sound("gunshot", "assets/pew.wav", scene);

        ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "assets/racetrack.png", 1000, 1000, 250, 0, 20, scene, false, function() {
        ground.position = new BABYLON.Vector3(100,0,0);
        ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsEngine.HeightmapImpostor, {
                friction: 1,
                mass: 0,
            });
        });
        var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("assets/racetrackTexture.png", scene);
        ground.material = groundMaterial;
        ground.applyGravity = true;
        ground.checkCollisions = true; 

        //skybox
        var skybox = BABYLON.Mesh.CreateBox("skyBox", 1500.0, scene); 
        skybox.position = new BABYLON.Vector3(0, 30.1, 0); 
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene); 
        skyboxMaterial.backFaceCulling = false; 
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/skybox/skybox", scene); 
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE; 
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0); 
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0); 
        skybox.material = skyboxMaterial; 

        //finish line position
        var finish = BABYLON.Mesh.CreateBox("finish", 20.0, scene);
        finish.scaling.z = 0.1
        finish.scaling.x = 10;
        finish.scaling.y = 1;
        finish.position = new BABYLON.Vector3(-90, 9, -190);  
        //finish.material = new BABYLON.StandardMaterial('texturef', scene);
        //finish.material.diffuseColor = new BABYLON.Color3(1, 1, 0);
        finish.visibility = 0.4;



        var finishMaterial = new BABYLON.StandardMaterial("finish", scene);
        finishMaterial.diffuseTexture = new BABYLON.Texture("assets/checkered.jpg", scene);
        finishMaterial.diffuseTexture.uScale = 10;
        finishMaterial.diffuseTexture.vScale = 1;

        finish.material = finishMaterial;

        //half line position
        var half = BABYLON.Mesh.CreateBox("half", 20.0, scene);
        half.scaling.x = 10;
        half.scaling.y = 0.8;
        half.position = new BABYLON.Vector3(460, 9, 0);  
        half.material = new BABYLON.StandardMaterial('textureh', scene);
        half.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
        half.visibility = 0.1;   
        
        
        addTrees(scene);
        addRocks(scene);
        
    },
    createPlayers:function(scene, checkpoints){      
        //create checkpoints
        /*var radius = 80;
        for(var i = 0; i<checkpoints.length; i++){
            var checkpoint = BABYLON.Mesh.CreateSphere("check"+i, 2, radius, scene);
            checkpoint.position = new BABYLON.Vector3(checkpoints[i][0], 0, checkpoints[i][1]);
            checkpoint.material = new BABYLON.StandardMaterial('texturec', scene);
            checkpoint.material.diffuseColor = new BABYLON.Color3(1, 0, 1);
          checkpoint.visibility = 0.50;   
        }*/

        //create player, add to array
        var player1 = BABYLON.Mesh.CreateSphere("p1", 5, 10, scene);
        player1.position = new BABYLON.Vector3(-100, 5, 0);
        player1.material = new BABYLON.StandardMaterial('texturep1', scene);
        player1.material.diffuseColor = new BABYLON.Color3(0, 1, 1);
        player1.applyGravity = true;
        player1.ellipsoid = new BABYLON.Vector3(5,5,5);
        player1.setPhysicsState(BABYLON.PhysicsEngine.SphereImpostor, { mass: 3 });
        player1.checkCollisions = true;

        players.push(player1);

        playersCheckpointsIndexes.push(-1);
        playersHealth.push(5);

        

        var player2 = BABYLON.Mesh.CreateSphere("p1", 5, 10, scene);
        player2.position = new BABYLON.Vector3(-150, 5, 0);
        player2.material = new BABYLON.StandardMaterial('texturep1', scene);
        player2.material.diffuseColor = new BABYLON.Color3(0, 1, 1);
        player2.applyGravity = true;
        player2.ellipsoid = new BABYLON.Vector3(5,5,5);
        player2.setPhysicsState(BABYLON.PhysicsEngine.SphereImpostor, { mass: 3 });
        player2.checkCollisions = true;

        players.push(player2);

        playersCheckpointsIndexes.push(-1);
        playersHealth.push(5);

        var player3 = BABYLON.Mesh.CreateSphere("p1", 5, 10, scene);
        player3.position = new BABYLON.Vector3(-200, 5, 0);
        player3.material = new BABYLON.StandardMaterial('texturep1', scene);
        player3.material.diffuseColor = new BABYLON.Color3(0, 1, 1);
        player3.applyGravity = true;
        player3.ellipsoid = new BABYLON.Vector3(5,5,5);
        player3.setPhysicsState(BABYLON.PhysicsEngine.SphereImpostor, { mass: 3 });
        player3.checkCollisions = true;

        players.push(player3);

        playersCheckpointsIndexes.push(-1);
        playersHealth.push(5);
   
        return players;
    },
    createCar:function(scene){
        var width = 6;
        var depth = 8;
        var height = 0.1;

        var wheelDiameter = 3;
        var wheelDepthPosition = (depth + wheelDiameter) / 2

        var axisWidth = width + wheelDiameter;

        var centerOfMassAdjust = new CANNON.Vec3(0, 0, 0);

        Game.Car.chassis = BABYLON.MeshBuilder.CreateBox("chassis", {
            width: width,
            height: height,
            depth: depth
        }, scene);
        Game.Car.chassis.position.x  = -100;
        Game.Car.chassis.position.y =  30 + wheelDiameter + height / 2;
        Game.Car.chassis.physicsImpostor = new BABYLON.PhysicsImpostor(Game.Car.chassis, BABYLON.PhysicsEngine.BoxImpostor, {
            mass:300,
            nativeParams: {
    		     //angularDamping: 10000,
		    }
        })

        Game.Car.aim = BABYLON.MeshBuilder.CreateBox("Aim", {
            width: 1,
            height: 1,
            depth: 1
        }, scene);
        Game.Car.aim.position.z = 8;

        Game.Car.aim.parent = Game.Car.chassis;

        Game.Car.wheels = [0, 1, 2, 3].map(function(num) {
            var wheel = BABYLON.MeshBuilder.CreateCylinder("wheel" + num, {
                segments: 4,
                diameter: wheelDiameter
            }, scene);
            var a = (num % 2) ? -1 : 1;
            var b = num < 2 ? 1 : -1;
            wheel.rotation = new BABYLON.Vector3(0,0, Math.PI / 2);
            wheel.bakeCurrentTransformIntoVertices();

            wheel.position.copyFromFloats(a * axisWidth / 2-5, wheelDiameter / 2, b * wheelDepthPosition)
            //wheel.rotation.x = Math.PI/4;
            //wheel.rotation.y = Math.PI/4;
            wheel.scaling.x = 0.4;
            

            wheel.physicsImpostor = new BABYLON.PhysicsImpostor(wheel, BABYLON.PhysicsEngine.SphereImpostor, {
                friction:0.2,
                restitution:0,
                mass: 50,
            });
            return wheel;
        });

        
        Game.Car.vehicle = new CANNON.RigidVehicle({
            chassisBody: Game.Car.chassis.physicsImpostor.physicsBody
        });

        //Car
        BABYLON.SceneLoader.ImportMesh("","assets/", "car_blank.babylon", scene, 
            function (models) { 
                //models[0].scaling = new BABYLON.Vector3(1.0, 1.0,1.0); 
                //models[0].position = new BABYLON.Vector3(-50,100, 0); 
                models[0].scaling = new BABYLON.Vector3(2.0, 2.0,2.0); 
                models[0].position = new BABYLON.Vector3(0,-1, -0.5);  
                //models[0].rotation = new BABYLON.Vector3(0,0,0);
                //models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.BoxImpostor, { mass: 1, friction: 1, restitution: 0 }, scene);   
                
                models[0].parent = Game.Car.chassis;
            }
        );

        var down = new CANNON.Vec3(0, 1, 0);

        Game.Car.vehicle.addWheel({
            body: Game.Car.wheels[0].physicsImpostor.physicsBody,
            position: new CANNON.Vec3(axisWidth / 2-1, 0, wheelDepthPosition).vadd(centerOfMassAdjust),
            axis: new CANNON.Vec3(1, 0, 0),
            direction: down
        });

        Game.Car.vehicle.addWheel({
            body: Game.Car.wheels[1].physicsImpostor.physicsBody,
            position: new CANNON.Vec3(-axisWidth / 2+1, 0, wheelDepthPosition).vadd(centerOfMassAdjust),
            axis: new CANNON.Vec3(-1, 0, 0),
            direction: down
        });

        Game.Car.vehicle.addWheel({
            body: Game.Car.wheels[2].physicsImpostor.physicsBody,
            position: new CANNON.Vec3(axisWidth / 2-1, 0, -wheelDepthPosition).vadd(centerOfMassAdjust),
            axis: new CANNON.Vec3(1, 0, 0),
            direction: down,
            isFrontWheel:true
        });

        Game.Car.vehicle.addWheel({
            body: Game.Car.wheels[3].physicsImpostor.physicsBody,
            position: new CANNON.Vec3(-axisWidth / 2+1, 0, -wheelDepthPosition).vadd(centerOfMassAdjust),
            axis: new CANNON.Vec3(-1, 0, 0),
            direction: down,
            isFrontWheel:true
        });

        for (var i = 0; i < Game.Car.vehicle.wheelBodies.length; i++) {
            Game.Car.vehicle.wheelBodies[i].angularDamping = 0.4;
        }

        var world = Game.Car.wheels[3].physicsImpostor.physicsBody.world

        for (var i = 0; i < Game.Car.vehicle.constraints.length; i++) {
            world.addConstraint(Game.Car.vehicle.constraints[i]);
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
        Game.Car.vehicle.setSteeringValue = setSteeringValue.bind(Game.Car.vehicle);

        world.addEventListener('preStep', Game.Car.vehicle._update.bind(Game.Car.vehicle));
    },
    keyboardHandler:function(){
        if(!gameStarted) return;

        var up = (event.type == 'keyup');

        if (!up && event.type !== 'keydown')
            return;

        switch (event.keyCode) {

            case 38: // forward
                //Game.Car.vehicle.setWheelForce(up ? 0 : -maxForce, 0);
                //Game.Car.vehicle.setWheelForce(up ? 0 : maxForce, 1);
                Game.Keyboard.up = !up;
                break;

            case 40: // backward
                //Game.Car.vehicle.setWheelForce(up ? 0 : maxForce / 2, 0);
                //Game.Car.vehicle.setWheelForce(up ? 0 : -maxForce / 2, 1);
                Game.Keyboard.down = !up;
                break;

            case 39: // right
                Game.Keyboard.right = !up;
                //if(up){
                //    Game.Car.currentSteer -= 0.1;
                //    if(Game.Car.currentSteer < 0) Game.Car.currentSteer = 0;
                //}else{
                //    Game.Car.currentSteer += 0.1;
                //    if(Game.Car.currentSteer > maxSteerVal) Game.Car.currentSteer == maxSteerVal;
                //}
                //Game.Car.vehicle.setSteeringValue(up ? 0 : -maxSteerVal, 2);
                //Game.Car.vehicle.setSteeringValue(up ? 0 : -maxSteerVal, 3);
                break;

            case 37: // left
                Game.Keyboard.left = !up;
                //Game.Car.vehicle.setSteeringValue(up ? 0 : maxSteerVal, 2);
                //Game.Car.vehicle.setSteeringValue(up ? 0 : maxSteerVal, 3);
                break;
            case 32:
                Game.Keyboard.space = !up;
                break;
            case 16:
                Game.Keyboard.back =!up;
                break;

        }
        
    },
    Scene:null,
    Car:{
        currentSteer:0,
        camera:null,
        vehicle:null,
        chassis:null,
        aim:null,
        wheels:null,
        bullets: [],
        shoot:function(){
            Game.Car.gunshoot.play();
            var bullet = BABYLON.MeshBuilder.CreateSphere("bullet", {
                width: 1,
                height: 1,
                depth: 1
            }, Game.Scene);
            
            bullet.position = new BABYLON.Vector3(Game.Car.chassis.position.x,Game.Car.chassis.position.y+2,Game.Car.chassis.position.z);
            //console.log(Game.Car.chassis.position.x+" "+Game.Car.chassis.position.z);

            var direction = Game.Car.chassis.position.subtract(Game.Car.aim.getAbsolutePosition());

            bullet.applyGravity = true;
            bullet.ellipsoid = new BABYLON.Vector3(1.0, 1.0, 1.0);
            bullet.setPhysicsState(BABYLON.PhysicsEngine.SphereImpostor, { mass: 0.001 });  
            bullet.checkCollisions = true;  

            bulletParticles(Game.Scene, bullet);

            //check if any of enemies was hit, todo: reduce health
            for(var j = 0; j<players.length; j++){
                players[j].physicsImpostor.registerOnPhysicsCollide(bullet.physicsImpostor, function(main, collided) {

                    collided.object.setEnabled(0);
                    main.object.material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
                    for(var i = 0; i < players.length; i++){
                        if(players[i] === main.object){
                            playersHealth[i]--;

                            if(playersHealth[i] < 1 && playerAnimation[i] != undefined)
                                playerAnimation[i].stop();
                            
                        }
                    }
                }); 
            }
            
            var k = {startPostion:new BABYLON.Vector3(Game.Car.chassis.position.x,Game.Car.chassis.position.y+2,Game.Car.chassis.position.z), bullet:bullet, direction: new BABYLON.Vector3(direction.x,direction.y,direction.z)};
            Game.Car.bullets.push(k);
           
            setTimeout(function(){
                //Destroy after some time
                k.bullet.dispose();

            }, 1000)
            if(Game.Car.bullets.length>10){
                //Game.Car.bullets[0].bullet.dispose();
                Game.Car.bullets.shift();
            }

        },
        update: function(){
            var maxSteerVal = Math.PI / 30;
            var maxForce = 2500;

            //UP DOWN
            if(Game.Keyboard.up){
                Game.Car.vehicle.setWheelForce(-maxForce, 0);
                Game.Car.vehicle.setWheelForce(maxForce, 1);
                //Game.Car.vehicle.setWheelForce(-maxForce, 2);
                //Game.Car.vehicle.setWheelForce(maxForce, 3);
            }
            else if(Game.Keyboard.down){
                Game.Car.vehicle.setWheelForce(maxForce/2, 0);
                Game.Car.vehicle.setWheelForce(-maxForce/2, 1);
            }else{
                Game.Car.vehicle.setWheelForce(0, 0);
                Game.Car.vehicle.setWheelForce(0, 1);
                Game.Car.vehicle.setWheelForce(0, 2);
                Game.Car.vehicle.setWheelForce(0, 3);
            }

            if(Game.Keyboard.left){
                Game.Car.currentSteer += 0.01;
                if(Game.Car.currentSteer > maxSteerVal) Game.Car.currentSteer = maxSteerVal;
                //Game.Car.wheels[1].physicsImpostor.applyImpulse(new BABYLON.Vector3(0, -10, 0), Game.Car.wheels[1].getAbsolutePosition());
                //Game.Car.wheels[0].physicsImpostor.applyImpulse(new BABYLON.Vector3(0, -10, 0), Game.Car.wheels[0].getAbsolutePosition());
                //Game.Car.wheels[2].physicsImpostor.applyImpulse(new BABYLON.Vector3(0, -10, 0), Game.Car.wheels[2].getAbsolutePosition());
                //Game.Car.wheels[3].physicsImpostor.applyImpulse(new BABYLON.Vector3(0, -10, 0), Game.Car.wheels[3].getAbsolutePosition());
            }
            else if(Game.Keyboard.right){
                Game.Car.currentSteer -= 0.01;
                if(Game.Car.currentSteer < -maxSteerVal) Game.Car.currentSteer = -maxSteerVal;
                //Game.Car.wheels[1].physicsImpostor.applyImpulse(new BABYLON.Vector3(0, -10, 0), Game.Car.wheels[1].getAbsolutePosition());
                //Game.Car.wheels[0].physicsImpostor.applyImpulse(new BABYLON.Vector3(0, -10, 0), Game.Car.wheels[0].getAbsolutePosition());
                //Game.Car.wheels[2].physicsImpostor.applyImpulse(new BABYLON.Vector3(0, -10, 0), Game.Car.wheels[2].getAbsolutePosition());
                //Game.Car.wheels[3].physicsImpostor.applyImpulse(new BABYLON.Vector3(0, -10, 0), Game.Car.wheels[3].getAbsolutePosition());
            }
            else{
                if(Game.Car.currentSteer > 0){
                    Game.Car.currentSteer -= 0.05;
                    if(Game.Car.currentSteer <= 0) Game.Car.currentSteer = 0;
                }else{
                    Game.Car.currentSteer += 0.05;
                    if(Game.Car.currentSteer >= 0) Game.Car.currentSteer = 0;
                }
                if(Math.abs(Game.Car.currentSteer) > 0){
                    //Game.Car.wheels[1].physicsImpostor.applyImpulse(new BABYLON.Vector3(0, -10, 0), Game.Car.wheels[1].getAbsolutePosition());
                    //Game.Car.wheels[0].physicsImpostor.applyImpulse(new BABYLON.Vector3(0, -10, 0), Game.Car.wheels[0].getAbsolutePosition());
                    //Game.Car.wheels[2].physicsImpostor.applyImpulse(new BABYLON.Vector3(0, -10, 0), Game.Car.wheels[2].getAbsolutePosition());
                    //Game.Car.wheels[3].physicsImpostor.applyImpulse(new BABYLON.Vector3(0, -10, 0), Game.Car.wheels[3].getAbsolutePosition());
                }
            }

            if(!Game.Keyboard.shooted && Game.Keyboard.space){
                Game.Car.shoot();
                Game.Keyboard.shooted = true;
            }
            if(!Game.Keyboard.space)
                Game.Keyboard.shooted = false;

            Game.Car.vehicle.setSteeringValue(Game.Car.currentSteer,2);
            Game.Car.vehicle.setSteeringValue(Game.Car.currentSteer,3);

            Game.Car.chassis.physicsImpostor.setAngularVelocity(new BABYLON.Vector3(0,0,0));
            
            //update bullets
            for(var i = 0; i < Game.Car.bullets.length; i++){
                var startPostion = Game.Car.bullets[i].startPostion;
                var bullet = Game.Car.bullets[i].bullet;
                var direction = Game.Car.bullets[i].direction;
                direction = direction.normalize();
                direction.x *= 10;
                direction.y *= 10;
                direction.z *= 10;
                bullet.position = bullet.position.add(direction);
            }
        },
        gunshoot:null
    },
    Keyboard:{
        up:false,
        down:false,
        left:false,
        right:false,
        space:false,
        shooted:false,
        back:false,
    }

}

function bulletParticles(scene, bullet){
    var particleSystem = new BABYLON.ParticleSystem("particles", 500, scene);
    particleSystem.particleTexture = new BABYLON.Texture("assets/flare.png", scene);
    particleSystem.emitter = bullet;
    particleSystem.minEmitBox = new BABYLON.Vector3.Zero();
    particleSystem.maxEmitBox = new BABYLON.Vector3.Zero();
    particleSystem.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
    particleSystem.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
    particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);
    particleSystem.minSize = 0.3;
    particleSystem.maxSize = 1.2;
    particleSystem.minLifeTime = 1;
    particleSystem.maxLifeTime = 2;
    particleSystem.emitRate = 200;
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    particleSystem.gravity =    new BABYLON.Vector3(0, -9.81, 0);
    particleSystem.direction1 = new BABYLON.Vector3(-1, 1, -1);
    particleSystem.direction2 = new BABYLON.Vector3( 1, 1,  1);
    particleSystem.minAngularSpeed = 0;
    particleSystem.maxAngularSpeed = Math.PI;
    particleSystem.minEmitPower = 7;
    particleSystem.maxEmitPower = 10;
    particleSystem.updateSpeed = 0.01;
    particleSystem.start(); 
}


function addRocks(scene){
    BABYLON.SceneLoader.ImportMesh("","assets/", "rock2.babylon", scene, 
        function (models) { 
            models[0].position = new BABYLON.Vector3(-160, 0, -280);  
            models[0].scaling = new BABYLON.Vector3(1.0, 1.0, 1.0); 
            models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);   
        }
    );

    BABYLON.SceneLoader.ImportMesh("","assets/", "rock1.babylon", scene, 
        function (models) { 
            models[0].position = new BABYLON.Vector3(-20, 0, -60);  
            models[0].scaling = new BABYLON.Vector3(1.0, 1.0, 1.0); 
            models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);   
        }
    );
    BABYLON.SceneLoader.ImportMesh("","assets/", "rock3.babylon", scene, 
        function (models) { 
            models[0].position = new BABYLON.Vector3(0, 0, -160);  
            models[0].scaling = new BABYLON.Vector3(1.0, 1.0, 1.0); 
            models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);   
        }
    );
    BABYLON.SceneLoader.ImportMesh("","assets/", "rock1.babylon", scene, 
        function (models) { 
            models[0].rotation = new BABYLON.Vector3(0,0.5,0);
            models[0].position = new BABYLON.Vector3(-40, 0, -260);  
            models[0].scaling = new BABYLON.Vector3(1.0, 1.0, 1.0); 
            models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);   
        }
    );
    BABYLON.SceneLoader.ImportMesh("","assets/", "rock1.babylon", scene, 
        function (models) { 
            models[0].rotation = new BABYLON.Vector3(0,0.1,0);
            models[0].position = new BABYLON.Vector3(100, 0, -330);  
            models[0].scaling = new BABYLON.Vector3(1.0, 1.0, 1.0); 
            models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);   
        }
    );
    BABYLON.SceneLoader.ImportMesh("","assets/", "rock1.babylon", scene, 
        function (models) { 
            models[0].rotation = new BABYLON.Vector3(0,0.1,0);
            models[0].position = new BABYLON.Vector3(250, 0, -270);  
            models[0].scaling = new BABYLON.Vector3(1.0, 1.0, 1.0); 
            models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);   
        }
    );
    BABYLON.SceneLoader.ImportMesh("","assets/", "rock1.babylon", scene, 
        function (models) { 
            models[0].rotation = new BABYLON.Vector3(0,0.2,0);
            models[0].position = new BABYLON.Vector3(350, 0, -100);  
            models[0].scaling = new BABYLON.Vector3(1.0, 1.0, 1.0); 
            models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);   
        }
    );
    BABYLON.SceneLoader.ImportMesh("","assets/", "rock1.babylon", scene, 
        function (models) { 
            models[0].rotation = new BABYLON.Vector3(0,0.2,0);
            models[0].position = new BABYLON.Vector3(360, 0, 100);  
            models[0].scaling = new BABYLON.Vector3(1.0, 1.0, 1.0); 
            models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);   
        }
    );
    BABYLON.SceneLoader.ImportMesh("","assets/", "rock1.babylon", scene, 
        function (models) { 
            models[0].rotation = new BABYLON.Vector3(0,0.8,0);
            models[0].position = new BABYLON.Vector3(350, 0, 280);  
            models[0].scaling = new BABYLON.Vector3(1.0, 1.0, 1.0); 
            models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);   
        }
    );

    BABYLON.SceneLoader.ImportMesh("","assets/", "rock1.babylon", scene, 
        function (models) { 
            models[0].position = new BABYLON.Vector3(-60, 0, 150);  
            models[0].scaling = new BABYLON.Vector3(1.0, 1.0, 1.0); 
            models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);   
        }
    );
    
}

function addTrees(scene){
    BABYLON.SceneLoader.ImportMesh("","assets/", "pine2.babylon", scene, 
        function (models) { 
            models[0].position = new BABYLON.Vector3(-20, 10, -60);  
            models[0].scaling = new BABYLON.Vector3(1.0, 1.0, 1.0); 
            models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);   
        }
    );
    BABYLON.SceneLoader.ImportMesh("","assets/", "pine1.babylon", scene, 
        function (models) { 
            models[0].position = new BABYLON.Vector3(-100, 10, -30);  
            models[0].scaling = new BABYLON.Vector3(1.0, 1.0, 1.0); 
            models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);   
        }
    );
    BABYLON.SceneLoader.ImportMesh("","assets/", "pine1.babylon", scene, 
        function (models) { 
            models[0].position = new BABYLON.Vector3(50, 10, -70);  
            models[0].scaling = new BABYLON.Vector3(1.0, 1.0, 1.0); 
            models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);   
        }
    );
    BABYLON.SceneLoader.ImportMesh("","assets/", "tree.babylon", scene, 
        function (models) { 
            models[0].position = new BABYLON.Vector3(80, 20, -90);  
            models[0].scaling = new BABYLON.Vector3(1.0, 1.0, 1.0); 
            models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);   
        }
    );
    BABYLON.SceneLoader.ImportMesh("","assets/", "pine1.babylon", scene, 
        function (models) { 
            models[0].position = new BABYLON.Vector3(130, 10, -170);  
            models[0].scaling = new BABYLON.Vector3(1.0, 1.0, 1.0); 
            models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);   
        }
    );
    
    BABYLON.SceneLoader.ImportMesh("","assets/", "pine1.babylon", scene, 
        function (models) { 
            models[0].position = new BABYLON.Vector3(130, 10, -250);  
            models[0].scaling = new BABYLON.Vector3(1.0, 1.0, 1.0); 
            models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);   
        }
    );
    BABYLON.SceneLoader.ImportMesh("","assets/", "pine1.babylon", scene, 
        function (models) { 
            models[0].position = new BABYLON.Vector3(70, 10, -350);  
            models[0].scaling = new BABYLON.Vector3(1.0, 1.0, 1.0); 
            models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);   
        }
    );
    BABYLON.SceneLoader.ImportMesh("","assets/", "pine1.babylon", scene, 
        function (models) { 
            models[0].position = new BABYLON.Vector3(90, 10, -380);  
            models[0].scaling = new BABYLON.Vector3(1.0, 1.0, 1.0); 
            models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);   
        }
    );
    BABYLON.SceneLoader.ImportMesh("","assets/", "pine1.babylon", scene, 
        function (models) { 
            models[0].position = new BABYLON.Vector3(120, 10, -400);  
            models[0].scaling = new BABYLON.Vector3(1.0, 1.0, 1.0); 
            models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);   
        }
    );
    BABYLON.SceneLoader.ImportMesh("","assets/", "pine1.babylon", scene, 
        function (models) { 
            models[0].position = new BABYLON.Vector3(180, 10, -400);  
            models[0].scaling = new BABYLON.Vector3(1.0, 1.0, 1.0); 
            models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);   
        }
    );
    BABYLON.SceneLoader.ImportMesh("","assets/", "pine1.babylon", scene, 
        function (models) { 
            models[0].position = new BABYLON.Vector3(280, 10, -400);  
            models[0].scaling = new BABYLON.Vector3(1.0, 1.0, 1.0); 
            models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);   
        }
    );
    BABYLON.SceneLoader.ImportMesh("","assets/", "pine1.babylon", scene, 
        function (models) { 
            models[0].position = new BABYLON.Vector3(350, 10, -350);  
            models[0].scaling = new BABYLON.Vector3(1.0, 1.0, 1.0); 
            models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);   
        }
    );
    BABYLON.SceneLoader.ImportMesh("","assets/", "pine1.babylon", scene, 
        function (models) { 
            models[0].position = new BABYLON.Vector3(370, 10, -300);  
            models[0].scaling = new BABYLON.Vector3(1.0, 1.0, 1.0); 
            models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);   
        }
    );
    BABYLON.SceneLoader.ImportMesh("","assets/", "pine1.babylon", scene, 
        function (models) { 
            models[0].position = new BABYLON.Vector3(390, 10, -250);  
            models[0].scaling = new BABYLON.Vector3(1.0, 1.0, 1.0); 
            models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);   
        }
    );
    BABYLON.SceneLoader.ImportMesh("","assets/", "pine1.babylon", scene, 
        function (models) { 
            models[0].position = new BABYLON.Vector3(400, 10, -190);  
            models[0].scaling = new BABYLON.Vector3(1.0, 1.0, 1.0); 
            models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);   
        }
    );
    BABYLON.SceneLoader.ImportMesh("","assets/", "pine1.babylon", scene, 
        function (models) { 
            models[0].position = new BABYLON.Vector3(420, 10, -100);  
            models[0].scaling = new BABYLON.Vector3(1.0, 1.0, 1.0); 
            models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);   
        }
    );
    BABYLON.SceneLoader.ImportMesh("","assets/", "pine1.babylon", scene, 
        function (models) { 
            models[0].position = new BABYLON.Vector3(420, 10, -30);  
            models[0].scaling = new BABYLON.Vector3(1.0, 1.0, 1.0); 
            models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);   
        }
    );
    BABYLON.SceneLoader.ImportMesh("","assets/", "pine1.babylon", scene, 
        function (models) { 
            models[0].position = new BABYLON.Vector3(400, 10, 50);  
            models[0].scaling = new BABYLON.Vector3(1.0, 1.0, 1.0); 
            models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);   
        }
    );
    BABYLON.SceneLoader.ImportMesh("","assets/", "pine1.babylon", scene, 
        function (models) { 
            models[0].position = new BABYLON.Vector3(370, 10, 120);  
            models[0].scaling = new BABYLON.Vector3(1.0, 1.0, 1.0); 
            models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);   
        }
    );
    BABYLON.SceneLoader.ImportMesh("","assets/", "pine1.babylon", scene, 
        function (models) { 
            models[0].position = new BABYLON.Vector3(320, 10, 130);  
            models[0].scaling = new BABYLON.Vector3(1.0, 1.0, 1.0); 
            models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);   
        }
    );
    BABYLON.SceneLoader.ImportMesh("","assets/", "pine1.babylon", scene, 
        function (models) { 
            models[0].position = new BABYLON.Vector3(270, 10, 110);  
            models[0].scaling = new BABYLON.Vector3(1.0, 1.0, 1.0); 
            models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);   
        }
    );
    BABYLON.SceneLoader.ImportMesh("","assets/", "pine1.babylon", scene, 
        function (models) { 
            models[0].position = new BABYLON.Vector3(200, 10, 40);  
            models[0].scaling = new BABYLON.Vector3(1.0, 1.0, 1.0); 
            models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);   
        }
    );
    BABYLON.SceneLoader.ImportMesh("","assets/", "pine1.babylon", scene, 
        function (models) { 
            models[0].position = new BABYLON.Vector3(150, 10, 10);  
            models[0].scaling = new BABYLON.Vector3(1.0, 1.0, 1.0); 
            models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);   
        }
    );
    BABYLON.SceneLoader.ImportMesh("","assets/", "pine1.babylon", scene, 
        function (models) { 
            models[0].position = new BABYLON.Vector3(90, 10, -20);  
            models[0].scaling = new BABYLON.Vector3(1.0, 1.0, 1.0); 
            models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);   
        }
    );
    BABYLON.SceneLoader.ImportMesh("","assets/", "pine1.babylon", scene, 
        function (models) { 
            models[0].position = new BABYLON.Vector3(10, 10, -20);  
            models[0].scaling = new BABYLON.Vector3(1.0, 1.0, 1.0); 
            models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);   
        }
    );
    BABYLON.SceneLoader.ImportMesh("","assets/", "pine1.babylon", scene, 
        function (models) { 
            models[0].position = new BABYLON.Vector3(-70, 10, 10);  
            models[0].scaling = new BABYLON.Vector3(1.0, 1.0, 1.0); 
            models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);   
        }
    );
    BABYLON.SceneLoader.ImportMesh("","assets/", "pine1.babylon", scene, 
        function (models) { 
            models[0].position = new BABYLON.Vector3(-160, 10, 10);  
            models[0].scaling = new BABYLON.Vector3(1.0, 1.0, 1.0); 
            models[0].physicsImpostor = new BABYLON.PhysicsImpostor(models[0], BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);   
        }
    );
    
}