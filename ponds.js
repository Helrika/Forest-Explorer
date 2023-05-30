import * as THREE from 'three';
import {GLTFLoader} from './build/three/examples/jsm/loaders/GLTFLoader.js';
export class pondSpawn extends THREE.Object3D {
    constructor(name,gui, type) {
        super();
        const mapLoader= new THREE.TextureLoader();
        const texture = mapLoader.load('resources/background.jpg');
        const loader = new GLTFLoader();
        switch(type) {
          case 0:
          loader.load(name, (gltf) => {
            gltf.scene.traverse(c => {
                c.castShadow = true;
                
              });
              ////console.log(gltf.scene.children[0]);
      
              gltf.scene.children[0].position.set(15,0,15);
              this.add(gltf.scene.children[0])
              const geometry = new THREE.CylinderGeometry( 1, 1, 0.7, 32 ); 
              this.pondMaterial = new THREE.ShaderMaterial({
                uniforms: {
                u_time: {value: 0},
                u_texture: {value: texture},
                u_movementY: {value :0},
                u_movementX: {value :0},
                u_Resolution: {value: 10.0},
                u_centre: {value: 0.5},
                u_dropShown: {value: 0.2},
                u_dropSize: {value: 0.1},
                u_lifeSpan: {value: 0.3},
                u_Intensity: {value: 10},
                }
              });
              this.pondMaterial.vertexShader=document.getElementById( 'vertexShaderSimple' ).textContent
              this.pondMaterial.fragmentShader=document.getElementById( 'fragmentShaderSimple' ).textContent
              const cylinder = new THREE.Mesh( geometry, this.pondMaterial );
              cylinder.position.set(15.095,0,15.051);
                this.add( cylinder );
          });
            break;
          case 1:
            loader.load(name, (gltf) => {
              gltf.scene.traverse(c => {
                  c.castShadow = true;
                  
                });
                ////console.log(gltf.scene.children[0]);
        
                gltf.scene.children[0].position.set(0,0,0);
              
                this.add(gltf.scene.children[0])
                const geometry = new THREE.CylinderGeometry( 2, 2, 0.5, 32 ); 
                this.pond2Material = new THREE.ShaderMaterial({
                  uniforms: {
                  u_time: {value: 0},
                  u_texture: {value: texture},
                  u_movementY: {value :0},
                  u_movementX: {value :0},
                  u_Resolution: {value: 10.0},
                  u_centre: {value: 0.5},
                  u_dropShown: {value: 0.2},
                  u_dropSize: {value: 0.1},
                  u_lifeSpan: {value: 0.3},
                  u_Intensity: {value: 10},
                  }
                });
                this.pond2Material.vertexShader=document.getElementById( 'vertexShaderSimple' ).textContent
                this.pond2Material.fragmentShader=document.getElementById( 'fragmentShaderSimple' ).textContent
                const cylinder = new THREE.Mesh( geometry, this.pond2Material );
                cylinder.position.set(0,0,0);
                 this.add( cylinder );
        
            
        
                 gui.add(this.pond2Material.uniforms.u_Resolution,'value',1,100).name("Resolution");
        
                 gui.add(this.pond2Material.uniforms.u_dropShown,'value',0,1).name("shown");
                 gui.add(this.pond2Material.uniforms.u_dropSize,'value',0,1).name("size");
                 gui.add(this.pond2Material.uniforms.u_lifeSpan,'value',0,1).name("LifeSpan");
        
        
            });
            break;
        }
    }

    Update(t) {
      if(this.pondMaterial){
        this.pondMaterial.uniforms.u_time.value =t/1000;
      }
      if(this.pond2Material) {
        this.pond2Material.uniforms.u_time.value =t/1000;
      }

    }
}
