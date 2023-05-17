import * as THREE from 'three';

  export class rainFx {
    constructor(clouds) {
      this.cloudsArr = clouds.children;

      this.flash = clouds.children[clouds.children.length-2];
      this.rainGeo = clouds.children[clouds.children.length-1].geometry;
      this.drops = this.rainGeo.getAttribute( 'position' );
      this.vertices = clouds.userData.vertices;

    }

    Update(newVel) {
            this.cloudsArr.forEach((element, index) => {
              if(index <this.cloudsArr.length-2) {
                element.rotation.z +=0.001;
              }
                
                //console.log(element.rotation.z)
              });
              //console.log(this.flash.power);
              if(Math.random() >0.99 || this.flash.power >100) {
                if(this.flash.power <10) {
                  this.flash.intensity = 1;
                  this.flash.power = 50 +Math.random() *300;
                 // console.log(true);
                  this.flash.position.set(
                    Math.random() * 400,
                    50,
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
              vel -=newVel + Math.random()*0.1;
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