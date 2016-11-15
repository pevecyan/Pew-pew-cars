var Game = {
    createWorld:function(scene){
        //ground
        var ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "3D2.jpg", 800, 800, 250, 0, 25, scene, false, function() {
        ground.position.y -= 0;
        ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsEngine.HeightmapImpostor, {
                friction: 1,
                mass: 0
            });
        });
        var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("test.jpg", scene);
        ground.material = groundMaterial;
    },
    createCar:function(scene){
        var width = 8;
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
        Game.Car.chassis.position.y =  100+ wheelDiameter + height / 2;
        Game.Car.chassis.physicsImpostor = new BABYLON.PhysicsImpostor(Game.Car.chassis, BABYLON.PhysicsEngine.BoxImpostor, {
            mass: 20
        })

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
                friction:0.5,
                mass: 6
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
                Game.Car.vehicle.setWheelForce  (-100,0);
                Game.Car.vehicle.setWheelForce  (-100,1);
                break;

        }
        
    },
    Car:{
        currentSteer:0,
        vehicle:null,
        chassis:null,
        wheels:null,
        update: function(){
            var maxSteerVal = Math.PI / 10;
            var maxForce = 400;

            //UP DOWN
            if(Game.Keyboard.up){
                Game.Car.vehicle.setWheelForce(-maxForce, 0);
                Game.Car.vehicle.setWheelForce(maxForce, 1);
            }
            else if(Game.Keyboard.down){
                Game.Car.vehicle.setWheelForce(maxForce/2, 0);
                Game.Car.vehicle.setWheelForce(-maxForce/2, 1);
            }else{
                Game.Car.vehicle.setWheelForce(0, 0);
                Game.Car.vehicle.setWheelForce(0, 1);
            }

            if(Game.Keyboard.left){
                Game.Car.currentSteer += 0.05;
                if(Game.Car.currentSteer > maxSteerVal) Game.Car.currentSteer = maxSteerVal;
            }
            else if(Game.Keyboard.right){
                Game.Car.currentSteer -= 0.05;
                if(Game.Car.currentSteer < -maxSteerVal) Game.Car.currentSteer = -maxSteerVal;
            }
            else{
                if(Game.Car.currentSteer > 0){
                    Game.Car.currentSteer -= 0.05;
                    if(Game.Car.currentSteer <= 0) Game.Car.currentSteer = 0;
                }else{
                    Game.Car.currentSteer += 0.05;
                    if(Game.Car.currentSteer >= 0) Game.Car.currentSteer = 0;
                }
            }

            Game.Car.vehicle.setSteeringValue(Game.Car.currentSteer,2);
            Game.Car.vehicle.setSteeringValue(Game.Car.currentSteer,3);
        }
    },
    Keyboard:{
        up:false,
        down:false,
        left:false,
        right:false,
    }

}