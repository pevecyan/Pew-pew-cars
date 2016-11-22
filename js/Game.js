var Game = {
    createWorld:function(scene){
        //ground
        var ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "assets/track.png", 1500, 1500, 250, 0, 50, scene, false, function() {
        ground.position.y -= 100;
        ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsEngine.HeightmapImpostor, {
                friction: 1,
                mass: 0,
            });
        });
        var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("test.jpg", scene);
        ground.material = groundMaterial;

        //Skybox
        var skybox = BABYLON.Mesh.CreateBox("skyBox", 1500.0, scene); 
        skybox.position = new BABYLON.Vector3(0, 30.1, 0); 
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene); 
        skyboxMaterial.backFaceCulling = false; 
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/skybox/skybox", scene); 
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE; 
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0); 
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0); 
        skybox.material = skyboxMaterial; 
    },
    createCar:function(scene){
        var width = 10;
        var depth = 16;
        var height = 0.1;

        var wheelDiameter = 4;
        var wheelDepthPosition = (depth + wheelDiameter) / 2

        var axisWidth = width + wheelDiameter;

        var centerOfMassAdjust = new CANNON.Vec3(0, 0, 0);

        Game.Car.chassis = BABYLON.MeshBuilder.CreateBox("chassis", {
            width: width,
            height: height,
            depth: depth
        }, scene);
        Game.Car.chassis.position.y =  100 + wheelDiameter + height / 2;
        Game.Car.chassis.physicsImpostor = new BABYLON.PhysicsImpostor(Game.Car.chassis, BABYLON.PhysicsEngine.BoxImpostor, {
            mass:100,
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

            wheel.position.copyFromFloats(a * axisWidth / 2, wheelDiameter / 2, b * wheelDepthPosition)
            //wheel.rotation.x = Math.PI/4;
            //wheel.rotation.y = Math.PI/4;
            wheel.scaling.x = 0.8;
            

            wheel.physicsImpostor = new BABYLON.PhysicsImpostor(wheel, BABYLON.PhysicsEngine.SphereImpostor, {
                friction:0.8,
                mass: 40,
            });
            return wheel;
        });


        Game.Car.vehicle = new CANNON.RigidVehicle({
            chassisBody: Game.Car.chassis.physicsImpostor.physicsBody
        });

        var down = new CANNON.Vec3(0, 1, 0);

        Game.Car.vehicle.addWheel({
            body: Game.Car.wheels[0].physicsImpostor.physicsBody,
            position: new CANNON.Vec3(axisWidth / 2, 0, wheelDepthPosition).vadd(centerOfMassAdjust),
            axis: new CANNON.Vec3(1, 0, 0),
            direction: down
        });

        Game.Car.vehicle.addWheel({
            body: Game.Car.wheels[1].physicsImpostor.physicsBody,
            position: new CANNON.Vec3(-axisWidth / 2, 0, wheelDepthPosition).vadd(centerOfMassAdjust),
            axis: new CANNON.Vec3(-1, 0, 0),
            direction: down
        });

        Game.Car.vehicle.addWheel({
            body: Game.Car.wheels[2].physicsImpostor.physicsBody,
            position: new CANNON.Vec3(axisWidth / 2, 0, -wheelDepthPosition).vadd(centerOfMassAdjust),
            axis: new CANNON.Vec3(1, 0, 0),
            direction: down,
            isFrontWheel:true
        });

        Game.Car.vehicle.addWheel({
            body: Game.Car.wheels[3].physicsImpostor.physicsBody,
            position: new CANNON.Vec3(-axisWidth / 2, 0, -wheelDepthPosition).vadd(centerOfMassAdjust),
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
            var bullet = BABYLON.MeshBuilder.CreateSphere("", {
                width: 1,
                height: 1,
                depth: 1
            }, Game.Scene);
            
            bullet.position = new BABYLON.Vector3(Game.Car.chassis.position.x,Game.Car.chassis.position.y+2,Game.Car.chassis.position.z);
            
            var direction = Game.Car.chassis.position.subtract(Game.Car.aim.getAbsolutePosition());
            
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
            var maxSteerVal = Math.PI / 15;
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

            //Game.Car.chassis.physicsImpostor.setAngularVelocity(new BABYLON.Vector3(0,0,0));
            

            //update bullets
            for(var i = 0; i < Game.Car.bullets.length; i++){
                var startPostion = Game.Car.bullets[i].startPostion;
                var bullet = Game.Car.bullets[i].bullet;
                var direction = Game.Car.bullets[i].direction;
                direction = direction.normalize();
                direction.x *= 5;
                direction.y *= 5;
                direction.z *= 5;
                bullet.position = bullet.position.add(direction);
            }
        }
    },
    Keyboard:{
        up:false,
        down:false,
        left:false,
        right:false,
        space:false,
        shooted:false,
    }

}