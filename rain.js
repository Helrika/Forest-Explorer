import * as THREE from 'three';

  export class rainFx {
    constructor(cloudArr, flash, rainGeo, vertices) {
      this.cloudsArr = cloudArr;
      this.flash = flash;
      this.rainGeo = rainGeo;
      this.drops = this.rainGeo.getAttribute( 'position' );
      this.vertices = vertices;

     // this.objects_ = objects;
    }

    
    //look in the direction we want
    Update() {
    
      
            
            this.cloudsArr.forEach(element => {
                element.rotation.z +=0.001;
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
  
  }