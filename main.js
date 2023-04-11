//import { KeyDisplay } from './utils';
//import { CharacterControls } from './characterControls';
import * as THREE from 'three';

import { OrbitControls } from "./build/three/examples/jsm/controls/OrbitControls.js";
//import {DragControls} from './build/three/examples/jsm/controls/DragControls.js';

//import {FBXLoader} from './build/three/examples/jsm/loaders/FBXLoader.js';
//import {GLTFLoader} from './build/three/examples/jsm/loaders/GLTFLoader.js';




class loadedWorld {
  constructor() {
      this._Initialize(); 
  }

  _Initialize() {
      this.renderer = new THREE.WebGLRenderer({
          antialias: true,
        });
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    
        document.body.appendChild(this.renderer.domElement);
    
        window.addEventListener('resize', () => {
          this._OnWindowResize();
        }, false);

        // SCENE
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xa8def0);
      //[previous state]
      this.previousRAF = null;
      //animation state
      this.mixers = [];

      //lighting
      this.scene.add(new THREE.AmbientLight(0xffffff, 0.7))

      let dirLight = new THREE.DirectionalLight(0xffffff, 1)
      dirLight.position.set(- 60, 100, - 10);
      dirLight.castShadow = true;
      dirLight.shadow.camera.top = 50;
      dirLight.shadow.camera.bottom = - 50;
      dirLight.shadow.camera.left = - 50;
      dirLight.shadow.camera.right = 50;
      dirLight.shadow.camera.near = 0.1;
      dirLight.shadow.camera.far = 200;
      dirLight.shadow.mapSize.width = 4096;
      dirLight.shadow.mapSize.height = 4096;
      this.scene.add(dirLight);

      dirLight = new THREE.AmbientLight(0x101010);
      this.scene.add(dirLight);

      //camera
      this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
      this.camera.position.set(75, 20, 0);

      const orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
      orbitControls.enableDamping = true
      orbitControls.minDistance = 25
      orbitControls.maxDistance = 155
      orbitControls.enablePan = false
      orbitControls.maxPolarAngle = Math.PI / 2 - 0.05
      orbitControls.update();

      //geometry
      const plane = new THREE.Mesh(
          new THREE.PlaneGeometry(1000, 1000, 10, 10),
          new THREE.MeshStandardMaterial({
              color: 0xFFFFFF,
            }));
      plane.castShadow = false;
      plane.receiveShadow = true;
      plane.rotation.x = -Math.PI / 2;
      this.scene.add(plane);


      this._RAF();
      
 
  }

  
//resize window
  _OnWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  
//animate
  _RAF() {
      requestAnimationFrame((t) => {
          if (this.previousRAF === null) {
            this.previousRAF = t;
          }
    
          this._RAF();
    
          this.renderer.render(this.scene, this.camera);
          this._Step(t - this.previousRAF);
          this.previousRAF = t;
        });
  }
//helpful for animations. shouldnt impact anything for now
  _Step(timeElapsed) {
      const timeElapsedS = timeElapsed * 0.001;
      if (this.mixers) {
        this.mixers.map(m => m.update(timeElapsedS));
      }
  
      if (this.controls) {
        this.controls.Update(timeElapsedS);
      }
  }
  

}

let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
_APP = new loadedWorld();
});