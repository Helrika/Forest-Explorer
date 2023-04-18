//import { KeyDisplay } from './utils';
//import { CharacterControls } from './characterControls';
import * as THREE from 'three';

import { OrbitControls } from "./build/three/examples/jsm/controls/OrbitControls.js";
//import {DragControls} from './build/three/examples/jsm/controls/DragControls.js';

//import {FBXLoader} from './build/three/examples/jsm/loaders/FBXLoader.js';
//import {GLTFLoader} from './build/three/examples/jsm/loaders/GLTFLoader.js';
//import {FirstPersonControls} from 'fps';
//import CharacterController from "charactercontroller";
import {FirstPersonCamera} from './fps.js';




class loadedWorld {
  constructor() {
      this.Initialize(); 
   
      this.InitializeLights();
      this.initializeScene_();
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

      
      this.clock=new THREE.Clock();

      //camera
      const fov = 100;
      const aspect = 1920 / 1080;
      const near = 1.0;
      const far = 1000.0;
      this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
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

  ////////////////////////////////////////////////////////////////////
  //////////// change any environment here
  ////////////////////////////////////////////////////////////////////
  initializeScene_() {
    //this is a place holder. edit all the scene elements here. then remove the placeholder assets
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
      './resources/skybox/posx.jpg',
      './resources/skybox/negx.jpg',
      './resources/skybox/posy.jpg',
      './resources/skybox/negy.jpg',
      './resources/skybox/posz.jpg',
      './resources/skybox/negz.jpg',
  ]);

    texture.encoding = THREE.sRGBEncoding;
    this.scene.background = texture;

    const mapLoader = new THREE.TextureLoader();
    const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();
    const checkerboard = mapLoader.load('resources/checkerboard.png');
    checkerboard.anisotropy = maxAnisotropy;
    checkerboard.wrapS = THREE.RepeatWrapping;
    checkerboard.wrapT = THREE.RepeatWrapping;
    checkerboard.repeat.set(32, 32);
    checkerboard.encoding = THREE.sRGBEncoding;

    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100, 10, 10),
        new THREE.MeshStandardMaterial({map: checkerboard}));
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    this.scene.add(plane);

    const box = new THREE.Mesh(
      new THREE.BoxGeometry(4, 4, 4),
      this.loadMaterial_('vintage-tile1_', 0.2));
    box.position.set(10, 2, 0);
    box.castShadow = true;
    box.receiveShadow = true;
    this.scene.add(box);

    const concreteMaterial = this.loadMaterial_('concrete3-', 4);

    const wall1 = new THREE.Mesh(
      new THREE.BoxGeometry(100, 100, 4),
      concreteMaterial);
    wall1.position.set(0, -40, -50);
    wall1.castShadow = true;
    wall1.receiveShadow = true;
    this.scene.add(wall1);

    const wall2 = new THREE.Mesh(
      new THREE.BoxGeometry(100, 100, 4),
      concreteMaterial);
    wall2.position.set(0, -40, 50);
    wall2.castShadow = true;
    wall2.receiveShadow = true;
    this.scene.add(wall2);

    const wall3 = new THREE.Mesh(
      new THREE.BoxGeometry(4, 100, 100),
      concreteMaterial);
    wall3.position.set(50, -40, 0);
    wall3.castShadow = true;
    wall3.receiveShadow = true;
    this.scene.add(wall3);

    const wall4 = new THREE.Mesh(
      new THREE.BoxGeometry(4, 100, 100),
      concreteMaterial);
    wall4.position.set(-50, -40, 0);
    wall4.castShadow = true;
    wall4.receiveShadow = true;
    this.scene.add(wall4);

    // // Create Box3 for each mesh in the scene so that we can
    // // do some easy intersection tests.
    const meshes = [
      plane, box, wall1, wall2, wall3, wall4];

    this.objects_ = [];

    for (let i = 0; i < meshes.length; ++i) {
      const b = new THREE.Box3();
      b.setFromObject(meshes[i]);
      this.objects_.push(b);
    }
   

  }

  ////////////////////////////////////////////////////////////////////
  //////////// change any material loading here
  ////////////////////////////////////////////////////////////////////
  loadMaterial_(name, tiling) {
    //you can use this to load mateirials. edit the stuff in here and remove placeholder assets
    const mapLoader = new THREE.TextureLoader();
    const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();

    const metalMap = mapLoader.load('resources/freepbr/' + name + 'metallic.png');
    metalMap.anisotropy = maxAnisotropy;
    metalMap.wrapS = THREE.RepeatWrapping;
    metalMap.wrapT = THREE.RepeatWrapping;
    metalMap.repeat.set(tiling, tiling);

    const albedo = mapLoader.load('resources/freepbr/' + name + 'albedo.png');
    albedo.anisotropy = maxAnisotropy;
    albedo.wrapS = THREE.RepeatWrapping;
    albedo.wrapT = THREE.RepeatWrapping;
    albedo.repeat.set(tiling, tiling);
    albedo.encoding = THREE.sRGBEncoding;

    const normalMap = mapLoader.load('resources/freepbr/' + name + 'normal.png');
    normalMap.anisotropy = maxAnisotropy;
    normalMap.wrapS = THREE.RepeatWrapping;
    normalMap.wrapT = THREE.RepeatWrapping;
    normalMap.repeat.set(tiling, tiling);

    const roughnessMap = mapLoader.load('resources/freepbr/' + name + 'roughness.png');
    roughnessMap.anisotropy = maxAnisotropy;
    roughnessMap.wrapS = THREE.RepeatWrapping;
    roughnessMap.wrapT = THREE.RepeatWrapping;
    roughnessMap.repeat.set(tiling, tiling);

    const material = new THREE.MeshStandardMaterial({
      metalnessMap: metalMap,
      map: albedo,
      normalMap: normalMap,
      roughnessMap: roughnessMap,
    });

    return material;
  }


  ////////////////////////////////////////////////////////////////////
  //////////// change above the rest below is fine
  ////////////////////////////////////////////////////////////////////

  InitializeCamera() {
    //put Camera elements in here!
    this.fpsCamera = new FirstPersonCamera(this.camera, this.clock);
    

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