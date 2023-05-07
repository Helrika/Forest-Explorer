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
  


  
  export class collsionDetect {
    constructor(camera, clock, player, boundingboxs, playerBB) {
      this.camera = camera;
      this.clock = clock;
      this.boxs = boundingboxs;
      this.player = player;
      this.playerBB = playerBB;  
     // this.objects_ = objects;
    }
    
    //look in the direction we want
    Update(timeElapsedS) {
      this.UpdateCollisions(timeElapsedS);
     

      
    }
    UpdateCollisions(_) {
      this.playerBB.copy(this.player.geometry.boundingBox).applyMatrix4(this.player.matrixWorld);
      for (let i = 0; i<this.boxs.length;i++) {
        if(this.playerBB.intersectsBox(this.boxs[i])){
          this.player.position.copy(this.camera.position);
           this.player.position.y = 10;
           console.log(this.player.position)
        }
        
      }
      
      
    }
    

  

  

  
  }