//import { KeyDisplay } from './utils';
//import { CharacterControls } from './characterControls';
import * as THREE from 'three';

import { OrbitControls } from "./build/three/examples/jsm/controls/OrbitControls.js";
//import {DragControls} from './build/three/examples/jsm/controls/DragControls.js';

//import {FBXLoader} from './build/three/examples/jsm/loaders/FBXLoader.js';
import {GLTFLoader} from './build/three/examples/jsm/loaders/GLTFLoader.js';
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
  const loader1 = new THREE.TextureLoader();
  const height = loader1.load([
    './resources/height-map.png',
]);

    texture.encoding = THREE.sRGBEncoding;
    this.scene.background = texture;

    const mapLoader = new THREE.TextureLoader();
    const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();
    const checkerboard = mapLoader.load('resources/grass.png');
    checkerboard.anisotropy = maxAnisotropy;
    checkerboard.wrapS = THREE.RepeatWrapping;
    checkerboard.wrapT = THREE.RepeatWrapping;
    checkerboard.repeat.set(32, 32);
    checkerboard.encoding = THREE.sRGBEncoding;

    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(1000, 1000, 10, 10),
        new THREE.MeshStandardMaterial({map: checkerboard,
        displacementMap: height}));
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


    // // Create Box3 for each mesh in the scene so that we can
    // // do some easy intersection tests.
    const meshes = [
      plane, box];

    this.objects_ = [];

    for (let i = 0; i < meshes.length; ++i) {
      const b = new THREE.Box3();
      b.setFromObject(meshes[i]);
      this.objects_.push(b);
    }
   
    this._LoadTreeModel();
    this._LoadGrassModel();
  }

  _LoadTreeModel() {
    let trees = [];
    const loader = new GLTFLoader();

    loader.load('./resources/tree/scene.gltf', (gltf) => {
        gltf.scene.traverse(c => {
            c.castShadow = true;
            
          });
         // console.log(gltf)
         this.scene.add(gltf.scene);
         for(let i = 0; i<101; i++) {
         // gltf.scene.position.set(Math.random()*100,0, Math.random()*100)
          trees.push(gltf.scene.clone());
          if(i == 100) {
            for(let j = 0; j<trees.length;j++) {
              trees[j].position.set(100*Math.random() +5,0,100*Math.random())
              this.scene.add(trees[j]);
            }
          }
         }

    });

}

_LoadGrassModel() {
  let grass = [];
  const loader = new GLTFLoader();

  loader.load('./resources/grass/scene.gltf', (gltf) => {
      gltf.scene.traverse(c => {
          c.castShadow = true;
          
        });
        gltf.scene.scale.set(5,5,5);
       // console.log(gltf)
       this.scene.add(gltf.scene);
       for(let i = 0; i<100; i++) {
       // gltf.scene.position.set(Math.random()*100,0, Math.random()*100)
        grass.push(gltf.scene.clone());
        if(i == 99) {
          for(let j = 0; j<grass.length;j++) {
            grass[j].position.set(100*Math.random() +5,0,100*Math.random())
            this.scene.add(grass[j]);
          }
        }
       }

  });

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

  InitializeMap() {
    // initialize plane
    this.plane = new THREE.PlaneBufferGeometry(1000, 1000, 10, 10);
    this.plane.castShadow = true;
    this.plane.receiveShadow = true;

    this.vertices = this.plane.attributes.position.array;
    // apply height map to vertices of plane
    for(i=0, j=2; i < data.length; i += 4, j += 3) {
        vertices[j] = data[i] * HEIGHT_AMPLIFIER;
    }

    var material = new THREE.MeshPhongMaterial({color: 0xFFFFFF, side: THREE.DoubleSide, shading: THREE.FlatShading});

    var mesh = new THREE.Mesh(plane, material);
    mesh.rotation.x = - Math.PI / 2;
    mesh.matrixAutoUpdate  = false;
    mesh.updateMatrix();

    plane.computeFaceNormals();
    plane.computeVertexNormals();

    scene.add(mesh);
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