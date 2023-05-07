import * as THREE from 'three';
const KEYS = {
    'a': 65,
    's': 83,
    'w': 87,
    'd': 68,
    'space': 32,
  };
  
  function clamp(x, a, b) {
    return Math.min(Math.max(x, a), b);
  }
  

//captures key and mouse input
export class InputController {
    constructor(target) {
      this.target = target || document;
      this.Initialize()
    }
    Initialize() {
      //current input from mouse and key input
      this.current = {
        leftButton: false,
        rightButton: false,
        mouseX: 0,
        mouseY: 0,
        mouseXDelta: 0,
        mouseYDelta: 0,
        jump: true,
      };
      //browser cant store input so we manually do it by using current input
      this.previous = null;
      this.keys = {};
      this.previousKeys = {};
  
      //event listenrs for mouse and keyboard
      this.target.addEventListener('mousedown', (e) => this.onMouseDown(e), false);
      this.target.addEventListener('mouseup', (e) => this.onMouseUp(e), false);
      this.target.addEventListener('mousemove', (e) => this.onMouseMove(e), false);
      this.target.addEventListener('keydown', (e) => this.onKeyDown(e), false);
      this.target.addEventListener('keyup', (e) => this.onKeyUp(e), false);
      this.target.addEventListener('keyjump', (e) => this.onKeyJump(e), false);
    }
  //we use these to stash input into the class and use them later
    onMouseDown(e) {
      this.onMouseMove(e);
      switch(e.button) {
        case 0: {
          this.current.leftButton = true;
          break;
        }
        case 2: {
          this.current.rightButton = true;
          break;
        } 
      }
    }
    onMouseUp(e) {
      this.onMouseMove(e);
      switch(e.button) {
        case 0: {
          this.current.leftButton = false;
          break;
        }
        case 2: {
          this.current.rightButton = false;
          break;
        } 
      }
    }
    onMouseMove(e) {
      //current position
      this.current.mouseX = e.pageX - window.innerWidth/2;
      this.current.mouseY = e.pageY - window.innerHeight/2;
      
      //store old positions
      if(this.previous === null) {
        this.previous = { 
          ...this.current
        }
      }
  
      //since we have previous and current stored, we can calculate how much has changed here
      this.current.mouseXDelta = this.current.mouseX - this.previous.mouseX;
      this.current.mouseYDelta = this.current.mouseY - this.previous.mouseY;
    }
    onKeyDown(e) {
      this.keys[e.keyCode] = true;
    }
    onKeyUp(e) {
      this.keys[e.keyCode] = false;
    }
    onKeyJump(e) {
      this.keys[e.keyCode] = false;
    }
    key(keyCode) {
      return !!this.keys[keyCode];
    }
  
    update() {
      //store and track inputs here. this prevents rotyation sliding
      if (this.previous !== null) {
        this.current.mouseXDelta = this.current.mouseX - this.previous.mouseX;
        this.current.mouseYDelta = this.current.mouseY - this.previous.mouseY;
  
        this.previous = {...this.current};
      }
    }
  
  }
  
  export class FirstPersonCamera {
    constructor(camera, clock, player, boundingboxs, playerBB, planeBB, objects) {
      this.camera = camera;
      this.clock = clock;
      this.input = new InputController();
      this.rotation = new THREE.Quaternion();
      //default camera position
      this.translation = new THREE.Vector3(0, 2, 0);
      this.phi = 0;
      this.theta = 0;
      this.phiSpeed = 8;
      this.thetaSpeed = 5;
      this.clock = new THREE.Clock();
      this.canJump = false;
      this.revert = false;
      this.groundHeight = 2;
      this.airSpace = 2.3;
      this.maxJumpHeight = this.groundHeight +this.airSpace;
      this.velocity_y = 16;
      this.boxs = boundingboxs;
      this.player = player;
      this.playerBB = playerBB;
      this.planeBB = planeBB; 
      this.canJump = true; 
      this.jumpVelocity = 1;
      this.raycaster = new THREE.Raycaster();
      this.search = [];
      this.objects = objects;
      this.Initialize(); 
     // this.objects_ = objects;
    }
    Initialize() {
      
      
      //console.log(this.raycaster)
      for(let i = 0; i<360; i+=90) {
        this.search[i] = new THREE.Vector3(Math.cos(i),2,Math.sin(i));
      }
    }
    
    //look in the direction we want
    Update(timeElapsedS) {
     
      this.UpdateRotation(timeElapsedS);
      this.UpdateCamera(timeElapsedS);

      if(this.camera.position.y <= this.groundHeight) {
        this.canJump = true;
        this.camera.position.y =this.groundHeight;
        this.player.position.y =this.groundHeight -1;
        this.revert = false;
        this.jumpVelocity =1;
      }
       if(this.camera.position.y > this.groundHeight) {
        this.canJump = false;
       }
   
      this.UpdateTranslation(timeElapsedS);
      this.UpdateCollisions(timeElapsedS);
     
      this.checkFortarget();
  
      // if(this.camera.position.y >= this.maxJumpHeight) {
      //   this.canJump = false;
      //   this.revert = true;
      // }
     
      //if input update isnt called, then the rotation will spaz out
      this.input.update(timeElapsedS);
      
    }
    checkFortarget() {
      for(let i = 0; i<this.search.length; i+=90) {
        this.raycaster.set(this.camera.position, this.search[i], 0.0, 500.0);
        //console.log(this.raycaster)
         this.intersects = this.raycaster.intersectObjects(this.objects);
         // console.log("origin")
         // console.log(this.raycaster.ray.origin)
         // console.log("direction")
         // console.log(this.raycaster.ray.direction)
         if(this.intersects[0]) {
           console.log(true);
         }
      }
      this.search.forEach((direction) => {
       
        

      });
    }
    UpdateCollisions(_) {
      this.playerBB.copy(this.player.geometry.boundingBox).applyMatrix4(this.player.matrixWorld);
      if( this.playerBB.intersectsBox(this.planeBB)) {
        this.groundHeight = 2;
      }
      for (let i = 0; i<this.boxs.length;i++) {
        if(this.playerBB.intersectsBox(this.boxs[i])){
          this.groundHeight = this.boxs[i].max.y +2;
         // this.player.position.copy(this.camera.position);
          //  this.player.position.y = 3;
          //  this.camera.position.y =3;
          // console.log(this.player.position);
        } else {
         
          this.groundHeight = 2;
          //this.canJump = false;
          //console.log(this.player.position); 
        }
        
      }
    }
    
    UpdateCamera(_) {
      this.camera.quaternion.copy(this.rotation);
     //console.log(this.translation);
     this.camera.position.copy(this.translation);

     this.player.quaternion.copy(this.rotation);
     //console.log(this.translation);
     this.player.position.copy(this.translation);
    
 
    //  console.log("pleyr stuff")

    //  console.log(this.player);
  
    //  console.log("came")
    //  console.log(this.camera);
  
    // this.camera.position.y = 2;
     //this.camera.y = 10;
  
   
    
    
    }
  
    UpdateRotation() {
      
      //how far has the mouse moved from preivious frames
      const xh = this.input.current.mouseXDelta / window.innerWidth;
      const yh = this.input.current.mouseYDelta / window.innerHeight;
  
      //since we know the mouse movement, we can now convert x and y movements into spherical coordinates
      this.phi += -xh * this.thetaSpeed;
      //this.theta = Math.min(Math.max(this.theta + -yh * 5, -Math.PI/3), Math.PI/3);
      this.theta= clamp(this.theta + -yh * this.thetaSpeed, -Math.PI/3, Math.PI/3);
  
      //now convert back to rotation
      //rotation about y and x axis
      const qx = new THREE.Quaternion();
      qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi);
  
      const qz = new THREE.Quaternion();
      qz.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.theta);
  
      //multiply them together
      const q = new THREE.Quaternion();
      q.multiply(qx);
      q.multiply(qz);
  
      //final rotation calculation
      this.rotation.copy(q);
      
    }  
  
  
    UpdateTranslation(timeElapsedS) {
      //this is where movement is handled
      const forwardVelocity = (this.input.key(KEYS.w) ? 1 : 0) + (this.input.key(KEYS.s) ? -1 : 0);
      const strafeVelocity = (this.input.key(KEYS.a) ? 1 : 0) + (this.input.key(KEYS.d) ? -1 : 0);
  
     // const jumpVelocity = (this.input.key(KEYS.space) ? 3 : -0.5 );
      const qx = new THREE.Quaternion();
      qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi);
      //values for moving forward and back
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyQuaternion(qx);
      forward.multiplyScalar(forwardVelocity * timeElapsedS * 10);
      //values for moving left and right
      const left = new THREE.Vector3(-1, 0, 0);
      left.applyQuaternion(qx);
      left.multiplyScalar(strafeVelocity * timeElapsedS * 10);
  
      const jump = new THREE.Vector3(0, 1, 0);
      this.translation.add(forward);
      this.translation.add(left);
      
      if(this.input.key(KEYS.space)) {
        this.canJump = false;
      }
      if(this.canJump == false ) {
        this.jumpVelocity -= timeElapsedS;
        jump.applyQuaternion(qx);
        jump.multiplyScalar(this.jumpVelocity  * timeElapsedS * 10);
           this.translation.add(jump);
      }

  //     const jump = new THREE.Vector3(0, 1, 0);
  // //this is the jump handlers. you might be wonderign why is the value differenc e so high. change the 10 to a low number and you wont fall
  //     if(!this.revert) {
  //       const jumpVelocity = (this.input.key(KEYS.space) ? 10 : 0 );
  //         this.canJump = false;
  //         //this.revert = true;
  //         jump.applyQuaternion(qx);
  
  //         jump.multiplyScalar(jumpVelocity  * timeElapsedS * 10);
  //         this.translation.add(jump);
  //     }
  
      
  

     
  //     if(this.revert) {
  //       const jumpVelocity = (this.input.key(KEYS.space) ? -0.6 : -0.6 );
  //       jump.applyQuaternion(qx);
  
  //       jump.multiplyScalar(jumpVelocity  * timeElapsedS * 10);
  //       this.translation.add(jump);
  //     }
  
      //altjump code. snappy but its the only one that allows for gravity falling regardless of value
      // if (this.input.key(KEYS.space) && this.canJump) {// space
      //   this.canJump = false;
      //   this.velocity_y = 160;
      // }
      // this.camera.position.y+=this.velocity_y*timeElapsedS;
  
      // if(this.canJump==false){
      //   this.velocity_y-=160*2*timeElapsedS;
      //   if(this.camera.position.y<=2){
      //   this.canJump = false;
      //   this.velocity_y=0;
      //   this. camera.position.y=2;
      //   }
      // }
    
    }
  
  }