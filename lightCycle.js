import * as THREE from 'three';

  export class dayNightCycle {
    constructor(dirLight, horizonLoight, fog) {
      this.dirLight = dirLight;
      this.horizonLight = horizonLoight;
      this.top = true;
      this.right = false;
      this.bot = false;
      this.left = false;
      this.fog = fog;
      this.dayCheck = true;
     // this.objects_ = objects;
    }

    
    //look in the direction we want
    Update(speedMult) {  
      var speed = 0.001 * speedMult;
      var lightDis = 200;


      if (this.top == true){
        this.horizonLight.position.x += 1 * speed;
        this.horizonLight.position.y -= 1 * speed;
        if (this.horizonLight.position.x >= 1 && this.horizonLight.position.y <= 0){
          this.top = false;
          this.right = true;
        }
      } else if (this.right == true){
        this.horizonLight.position.x -= 1 * speed;
        this.horizonLight.position.y -= 1 * speed;
        if (this.horizonLight.position.x <= 0 && this.horizonLight.position.y <= -1){
          this.right = false;
          this.bot = true;
        }
      } else if (this.bot == true){
        this.horizonLight.position.x -= 1 * speed;
        this.horizonLight.position.y += 1 * speed;
        if (this.horizonLight.position.x <= -1 && this.horizonLight.position.y >= 0){
          this.bot = false;
          this.left = true;
        }
      } else if (this.left == true){
        this.horizonLight.position.x += 1 * speed;
        this.horizonLight.position.y += 1 * speed;
        if (this.horizonLight.position.x <= 0 && this.horizonLight.position.y >= 1){
          this.left = false;
          this.top = true;
        }
      }

      if (this.top == true){
        this.dirLight.position.x += lightDis * speed;
        this.dirLight.position.y -= lightDis * speed;
        if (this.fog.near >= 25 && this.fog.far >= 125){
          this.fog.near -= 300 * speed;
          this.fog.far -= 300 * speed;
        }
      } else if (this.right == true){
        this.dirLight.position.x -= lightDis * speed;
        this.dirLight.position.y -= lightDis * speed;
      } else if (this.bot == true){
        this.dirLight.position.x -= lightDis * speed;
        this.dirLight.position.y += lightDis * speed;
      } else if (this.left == true){
        this.dirLight.position.x += lightDis * speed;
        this.dirLight.position.y += lightDis * speed;
        if (this.fog.near <= 300 && this.fog.far <= 400){
          this.fog.near += 300 * speed;
          this.fog.far += 300 * speed;
        }
        
      } 
    }
  }