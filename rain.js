import * as THREE from 'three';

  export class rainFx {
    constructor(cloudArr, flash, rainGeo, vertices) {
      this.cloudArr = cloudArr;
      this.flash = flash;
      this.rainGeo = rainGeo;
      this.drops = this.rainGeo.getAttribute( 'position' );
      this.vertices = vertices;
      this.Initialize(); 
     // this.objects_ = objects;
    }
    Initialize() {
      
      console.log(this.vertices[0])

    }
    
    //look in the direction we want
    Update() {
        if(this.cloudsArr !==undefined && this.flash !== undefined) {
            this.cloudsArr.forEach(element => {
                element.rotation.z +=0.0001;
                //console.log(element.rotation.z)
              });
              //console.log(this.flash.power);
              if(Math.random() >0.93 || this.flash.power >100) {
                if(this.flash.power <10) {
                  this.flash.intensity = 1;
                 // console.log(true);
                  this.flash.position.set(
                    Math.random() * 400,
                    300 + Math.random() * 200,
                    Math.random() * 400 -100,
                  );
                } else {
                  this.flash.power = 50 +Math.random() *300;
                  this.flash.intensity = 0;
                }
                
              }
        }
        
          if(this.drops && this.vertices) {
            //this.check = true;
            for(let i = 0; i < this.drops.count; i++){
              let y = this.drops.getY( i );  
              let vel = this.vertices[i].velocity;
              vel -=1 + Math.random()*0.1;
              y += vel;
              if(y <-50) {
                y = 200;
                vel = 0;
              }
      
              this.rainGeo.getAttribute( 'position' ).setY( i, y);
      
            }
      
          }
          this.rainGeo.attributes.position.needsUpdate = true;
      
    }
    // checkFortarget() {
    //   for(let i = 0; i<this.search.length; i+=90) {
    //     this.raycaster.set(this.camera.position, this.search[i], 0.0, 500.0);
    //     //console.log(this.raycaster)
    //      this.intersects = this.raycaster.intersectObjects(this.objects);
    //      // console.log("origin")
    //      // console.log(this.raycaster.ray.origin)
    //      // console.log("direction")
    //      // console.log(this.raycaster.ray.direction)
    //      if(this.intersects[0]) {
    //        console.log(true);
    //      }
    //   }
    //   this.search.forEach((direction) => {
       
        

    //   });
    // }
    // UpdateCollisions(_) {
    //   this.playerBB.copy(this.player.geometry.boundingBox).applyMatrix4(this.player.matrixWorld);
    //   if( this.playerBB.intersectsBox(this.planeBB)) {
    //     this.groundHeight = 2;
    //   }
    //   for (let i = 0; i<this.boxs.length;i++) {
    //     if(this.playerBB.intersectsBox(this.boxs[i])){
    //       this.groundHeight = this.boxs[i].max.y +2;
    //      // this.player.position.copy(this.camera.position);
    //       //  this.player.position.y = 3;
    //       //  this.camera.position.y =3;
    //       // console.log(this.player.position);
    //     } else {
         
    //       this.groundHeight = 2;
    //       //this.canJump = false;
    //       //console.log(this.player.position); 
    //     }
        
    //   }
    // }
    
    // UpdateCamera(_) {
    //   this.camera.quaternion.copy(this.rotation);
    //  //console.log(this.translation);
    //  this.camera.position.copy(this.translation);

    //  this.player.quaternion.copy(this.rotation);
    //  //console.log(this.translation);
    //  this.player.position.copy(this.translation);
    
 
    // //  console.log("pleyr stuff")

    // //  console.log(this.player);
  
    // //  console.log("came")
    // //  console.log(this.camera);
  
    // // this.camera.position.y = 2;
    //  //this.camera.y = 10;
  
   
    
    
    // }
  
    // UpdateRotation() {
      
    //   //how far has the mouse moved from preivious frames
    //   const xh = this.input.current.mouseXDelta / window.innerWidth;
    //   const yh = this.input.current.mouseYDelta / window.innerHeight;
  
    //   //since we know the mouse movement, we can now convert x and y movements into spherical coordinates
    //   this.phi += -xh * this.thetaSpeed;
    //   //this.theta = Math.min(Math.max(this.theta + -yh * 5, -Math.PI/3), Math.PI/3);
    //   this.theta= clamp(this.theta + -yh * this.thetaSpeed, -Math.PI/3, Math.PI/3);
  
    //   //now convert back to rotation
    //   //rotation about y and x axis
    //   const qx = new THREE.Quaternion();
    //   qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi);
  
    //   const qz = new THREE.Quaternion();
    //   qz.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.theta);
  
    //   //multiply them together
    //   const q = new THREE.Quaternion();
    //   q.multiply(qx);
    //   q.multiply(qz);
  
    //   //final rotation calculation
    //   this.rotation.copy(q);
      
    // }  
  
  
    // UpdateTranslation(timeElapsedS) {
    //   //this is where movement is handled
    //   const forwardVelocity = (this.input.key(KEYS.w) ? 1 : 0) + (this.input.key(KEYS.s) ? -1 : 0);
    //   const strafeVelocity = (this.input.key(KEYS.a) ? 1 : 0) + (this.input.key(KEYS.d) ? -1 : 0);
  
    //  // const jumpVelocity = (this.input.key(KEYS.space) ? 3 : -0.5 );
    //   const qx = new THREE.Quaternion();
    //   qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi);
    //   //values for moving forward and back
    //   const forward = new THREE.Vector3(0, 0, -1);
    //   forward.applyQuaternion(qx);
    //   forward.multiplyScalar(forwardVelocity * timeElapsedS * 10);
    //   //values for moving left and right
    //   const left = new THREE.Vector3(-1, 0, 0);
    //   left.applyQuaternion(qx);
    //   left.multiplyScalar(strafeVelocity * timeElapsedS * 10);
  
    //   const jump = new THREE.Vector3(0, 1, 0);
    //   this.translation.add(forward);
    //   this.translation.add(left);
      
    //   if(this.input.key(KEYS.space)) {
    //     this.canJump = false;
    //   }
    //   if(this.canJump == false ) {
    //     this.jumpVelocity -= timeElapsedS;
    //     jump.applyQuaternion(qx);
    //     jump.multiplyScalar(this.jumpVelocity  * timeElapsedS * 10);
    //        this.translation.add(jump);
    //   }


    
    // }
  
  }