import * as THREE from 'three';
import {GLTFLoader} from './build/three/examples/jsm/loaders/GLTFLoader.js';
export class sceneGeneration extends THREE.Object3D {
    constructor(name, amount, scale, repeat) {
      super();

      var target = new THREE.Object3D();
      var target2 = new THREE.Object3D();
      var matrix = new THREE.Matrix4();
      var position = new THREE.Vector3();
      // let geo = new THREE.BufferGeometry();
      let trees = [];
      const loader = new GLTFLoader();
      loader.load(name, (gltf) => {
          gltf.scene.traverse(c => {
              c.castShadow = true;
              
            });
     
            if(repeat <2) {
       
              var material = gltf.scene.children[0].material;
              let geo = new THREE.BoxGeometry(0,0,0);
              let geo2 = gltf.scene.children[0].geometry;
      
              var cluster = new THREE.InstancedMesh( 
                geo2,
                material, 
                amount, //instance count 
                false, //is it dynamic 
                false,  //does it have color 
                true,  //uniform scale
              );
              cluster.receiveShadow = true;
              cluster.castShadow = true;
              this.add(cluster);
              var k = 0;
              var offset = ( amount - 1 ) / 2;
              for ( var x = 0; x < amount; x ++ ) {
    
                for ( var y = 0; y < amount; y ++ ) {
    
                  for ( var z = 0; z < amount; z ++ ) {
                    target.scale.setScalar(scale);
                    target.position.set( Math.sin(Math.random() * 2*Math.PI) *70, 0, Math.sin(Math.random()*2*Math.PI) *70);
                    target.updateMatrix();
    
                    cluster.setMatrixAt( k ++, target.matrix );
                  }
    
                }
    
              }
            } else {
              var geoGroup = [];
              var matGroup = [];
              var clusterGroup = [];
              for(let i = 0; i <gltf.scene.children[0].children.length; i++) {
                  geoGroup.push(gltf.scene.children[0].children[i].geometry);
                  matGroup.push(gltf.scene.children[0].children[i].material);
                  var cluster = new THREE.InstancedMesh( 
                    gltf.scene.children[0].children[i].geometry,
                    gltf.scene.children[0].children[i].material, 
                    amount, //instance count 
                    false, //is it dynamic 
                    false,  //does it have color 
                    true,  //uniform scale
                  );
                  cluster.receiveShadow = true;
                  cluster.castShadow = true;
                  clusterGroup.push(cluster);
    
                  this.add( clusterGroup[i] );
              }
    
                        var i = 0;
              var offset = ( amount - 1 ) / 2;
              for ( var x = 0; x < amount; x ++ ) {
    
                for ( var y = 0; y < amount; y ++ ) {
    
                  for ( var z = 0; z < amount; z ++ ) {
                    target.scale.setScalar(scale);
                    target.position.set(  Math.sin(Math.random() * 2*Math.PI) *100, 0, Math.sin(Math.random()*2*Math.PI) *100 );
                    target.updateMatrix();
                      for(let k = 0; k<clusterGroup.length; k++) {
                        clusterGroup[k].setMatrixAt( i, target.matrix );
                      }
                        if(z == this.amount -1) {
                          // ////console.log(true)
                        }
                      i++;
                  }
    
                }
    
              }
    
            }
      });
    }
}
  