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
      
      
        //console.log(this.horizonLight.position.x);
        //console.log(this.horizonLight.position.y);
        //console.log(this.fog.far);

        // fog generation
        // if(this.horizonLight.position.y >= -1 && this.horizonLight.position.y <= -0.8){
          
        //   this.dayCheck = false;
        // }
        // if(this.horizonLight.position.y <= 1 && this.horizonLight.position.y >= 0.8){
          
        //   this.dayCheck = true;
        // }
        // let stop = false;
        // //night time
        // if(this.horizonLight.position.y <= -0.1 && this.horizonLight.position.y >= -0.3 && this.dayCheck == true && this.fog.far < 600 ){
          
        //   this.fog.far += 3;
        // }
        // //day time
        // if(this.horizonLight.position.y >= 0.1 && this.horizonLight.position.y <= 0.3 && this.dayCheck == false & this.fog.far >=100){
        //   this.fog.far -= 3;

        // }
        
        var speed = 0.001 * speedMult;
        var lightDis = 200;
        //console.log(this.horizonLight.position.y);
        //console.log(this.fog.far);
        //console.log(this.fog.far);
        //this.flashLight.position = this.camera.position;

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

        // if (this.dirLight.position.y == -0.01){
          
        // }
        // if (this.dirLight.position.y == 0.01){
          
        // }  
    }
  }