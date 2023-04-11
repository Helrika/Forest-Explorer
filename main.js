//import { KeyDisplay } from './utils';
//import { CharacterControls } from './characterControls';
import * as THREE from 'three';

import { OrbitControls } from "./build/three/examples/jsm/controls/OrbitControls.js";
//import {DragControls} from './build/three/examples/jsm/controls/DragControls.js';

//import {FBXLoader} from './build/three/examples/jsm/loaders/FBXLoader.js';
//import {GLTFLoader} from './build/three/examples/jsm/loaders/GLTFLoader.js';
import {FirstPersonControls} from 'fps';

function clamp(x, a, b) {
  return Math.min(Math.max(x, a), b);
}

//captures key and mouse input
class InputController {
  constructor() {
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
    };
    //browser cant store input so we manually do it by using current input
    this.previous = null;
    this.keys = {};
    this.previousKeys = {};

    //event listenrs for mouse and keyboard
    document.addEventListener('mousedown', (e) => this.onMouseDown(e), false);
    document.addEventListener('mouseup', (e) => this.onMouseUp(e), false);
    document.addEventListener('mousemove', (e) => this.onMouseMove(e), false);
    document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
    document.addEventListener('keyup', (e) => this.onKeyUp(e), false);
  }
//we use these to stash input into the class and use them later
  onMouseDown(e) {
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

  update() {
    //store and track inputs here
    this.previous = {
      ...this.current
    };
  }

}

class FirstPersonCamera {
  constructor(camera) {
    this.camera = camera;
    this.input = new InputController();
    this.rotation = new THREE.Quaternion();
    this.translation = new THREE.Vector3();
    this.phi = 0;
    this.theta = 0;
  }
  
  //look in the direction we want
  Update(timeElapsedS) {
    this.UpdateRotation(timeElapsedS);
    this.UpdateCamera(timeElapsedS);
   
  }
  
  UpdateCamera(_) {
    this.camera.quaternion.copy(this.rotation);
  }

  UpdateRotation() {
    //how far has the mouse moved from preivious frames
    const xh = this.input.current.mouseXDelta / window.innerWidth;
    const yh = this.input.current.mouseYDelta / window.innerHeight;

    //since we know the mouse movement, we can now convert x and y movements into spherical coordinates
    this.phi += -xh * 5;
    this.theta = Math.min(Math.max(this.theta + -yh * 5, -Math.PI/3), Math.PI/3);
    //clamp(this.theta + -yh * 5, -Math.PI/3, Math.PI/3);

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
}


class loadedWorld {
  constructor() {
      this.Initialize(); 

      this.InitializeLights();
      this.InitializeGeos();
      this.InitializeCamera();
   
  }

  Initialize() {
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

      


      //camera
      this.camera = new THREE.PerspectiveCamera(160, window.innerWidth / window.innerHeight, 0.1, 1000);
      this.camera.position.set(0, 2, 0);

      // const orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
      // orbitControls.enableDamping = true
      // orbitControls.minDistance = 25
      // orbitControls.maxDistance = 155
      // orbitControls.enablePan = false
      // orbitControls.maxPolarAngle = Math.PI / 2 - 0.05
      // orbitControls.update();

      this._RAF();
      
 
  }

  InitializeCamera() {
    //put Camera elements in here!
    this.fpsCamera = new FirstPersonCamera(this.camera);
    

  }

  InitializeLights() {
    //lighting
    //put lights here
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

  }

  InitializeGeos() {
      //geometry
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(1000, 1000, 10, 10),
      new THREE.MeshStandardMaterial({
          color: 0xFFFFFF*0.7,
      }));
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    this.scene.add(plane);
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
      //used for animation syncing
      if (this.mixers) {
        this.mixers.map(m => m.update(timeElapsedS));
      }
  
    
      this.fpsCamera.Update(timeElapsedS);

  }
  

}

let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
_APP = new loadedWorld();
});