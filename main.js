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
import {rainFx} from './rain.js';
import {dayNightCycle} from './lightCycle.js';
import {PointerLockControls} from './build/three/examples/jsm/controls/PointerLockControls.js';
import { cloudScene } from './clouds.js';
import { sceneGeneration } from './sceneGen.js';
import {mergeBufferGeometries} from 'https://cdn.skypack.dev/three-stdlib@2.8.5/utils/BufferGeometryUtils';
import datGui from 'https://cdn.skypack.dev/dat.gui';

class loadedWorld {
  constructor() {
      this.Initialize();
      this.InitializeLights();
      this.initializeScene_();
      this.InitializeCamera();
      this.raycast();
      this._SceneGeneration();
      this.shaderActive = false;
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
      this.scene.fog = new THREE.Fog(0xA7A69D, 300, 400);
      //[previous state]
      this.previousRAF = null;
      //animation state
      this.mixers = [];
      this.boxes = [];
      this.clock=new THREE.Clock();
      this.objectlist =[];
      this.arr = ['./resources/tree2/tree.gltf','./resources/bush/bush2.gltf','./resources/rock/rock1.gltf','./resources/treetest.gltf','./resources/bush/bush3.gltf', './resources/rock/rock2.gltf','./resources/pond.gltf', './resources/pond2.gltf'];

      //camera
      const fov = 100;
      const aspect = 1920 / 1080;
      const near = 1.0;
      const far = 1000.0;
      
      this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
      this.camera.position.set(0, 2, 0);
      const listener = new THREE.AudioListener();
      this.camera.add( listener );
      
      // create a global audio source
      this.sound = new THREE.Audio( listener );
      
      // load a sound and set it as the Audio object's buffer
      this.audioLoader = new THREE.AudioLoader();
      document.body.addEventListener('click', (e) => this.onclick(this.sound,this.audioLoader), false);


      this.grassmat = [];
      this.grassmat2 = this.loadMaterial_("Grass_001_", 110);
      this.grassmat3 = this.loadShaderMaterial_("Grass_001_", 110);
      this.grassmat.push(this.grassmat2);
      this.grassmat.push(this.grassmat3);
        this.params = {
          speed: 1,
          nums: 2,
          vel: 1,
        };
      this.gui = new datGui.GUI();
      // const orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
      // orbitControls.enableDamping = true
      // orbitControls.minDistance = 25
      // orbitControls.maxDistance = 155
      // orbitControls.enablePan = false
      // orbitControls.maxPolarAngle = 0;
      // orbitControls.update();

      this._RAF();
      
 
  }
  onclick(sound,audioLoader) {
    
    audioLoader.load( 'resources/crucial_surfacerain_med_loop.wav', function( buffer ) {
      sound.setBuffer( buffer );
      sound.setLoop( true );
      sound.setVolume( 0.3 );
      sound.play();
    });
  }

  ////////////////////////////////////////////////////////////////////
  //////////// change any environment here
  ////////////////////////////////////////////////////////////////////
  initializeScene_() {
    //edit initial load here

    const mapLoader = new THREE.TextureLoader();
    const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();

    //plane
    this.plane = new THREE.Mesh(
        new THREE.PlaneGeometry(1000, 1000, 10, 10),
        this.grassmat[0]);
        this.plane.castShadow = false;
        this.plane.receiveShadow = true;
        this.plane.rotation.x = -Math.PI / 2;
        this.plane.userData.ground= true;
    this.plane1BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    //gets the boundaries
    this.plane1BB.setFromObject(this.plane);
   // this.boxes.push(this.plane1BB);

    this.grassmat[1].vertexShader=document.getElementById( 'vertexShaderSimple' ).textContent
    this.grassmat[1].fragmentShader=document.getElementById( 'fragmentShaderSimple' ).textContent

    this.scene.add(this.plane);


    this.playerGeo = new THREE.CapsuleGeometry(1,1,4,8);
    this.playerMesh = new THREE.MeshBasicMaterial({color: 0x00ff00});
    this.player = new THREE.Mesh(this.playerGeo, this.playerMesh)
    this.player.y = 2;
    this.player.userData.name = "player";
    this.player.userData.draggable = false;
    this.playerBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    //gets the boundaries
    this.playerBB.setFromObject(this.player);
    //this.scene.add(this.player);  



    //manual spawn of ponds
    this.pondSpawn(this.arr[6]);
    this.pondSpawn2(this.arr[7]);

    //sky
    const skytext = mapLoader.load("/resources/Sky_horiz_19.jpg");
    const geometry = new THREE.SphereGeometry(400, 32, 16);
    const material = new THREE.MeshStandardMaterial({map: skytext});
    const sphere = new THREE.Mesh(geometry, material);
    sphere.material.side = THREE.BackSide;
    this.scene.add(sphere);

   //gui 
   this.gui.add(this.plane.material, 'wireframe').name("plane texture").onChange((e) => {

    this.resetPlane(e);
   })
   this.gui.add(this.params,'speed', 0,10).name("light cycle speed");
   this.gui.add(this.params,'nums', 0,this.arr.length -3).step(1).name("object spawner");
   this.gui.add(this.params,'vel', 0,10).name("Rain Velocity");
   

  }

  resetPlane(type) {
    this.scene.remove(this.plane);

    if(type == true) {
      this.plane = new THREE.Mesh(
        new THREE.PlaneGeometry(1000, 1000, 10, 10),
        this.grassmat[1]);
        this.plane.castShadow = false;
        this.plane.receiveShadow = true;
        this.plane.rotation.x = -Math.PI / 2;
        this.plane.userData.ground= true;
  
  
    this.grassmat[1].vertexShader=document.getElementById( 'vertexShaderSimple' ).textContent
    this.grassmat[1].fragmentShader=document.getElementById( 'fragmentShaderSimple' ).textContent
    this.scene.add(this.plane);
    } else {
      this.plane = new THREE.Mesh(
        new THREE.PlaneGeometry(1000, 1000, 10, 10),
        this.grassmat[0]);
        this.plane.castShadow = false;
        this.plane.receiveShadow = true;
        this.plane.rotation.x = -Math.PI / 2;
        this.plane.userData.ground= true;
  
  
    this.grassmat[1].vertexShader=document.getElementById( 'vertexShaderSimple' ).textContent
    this.grassmat[1].fragmentShader=document.getElementById( 'fragmentShaderSimple' ).textContent
    this.scene.add(this.plane);
    }
  }


  manualSpawn(name, point, num) {
    var objScale = 1;
    switch(num) {
      case 0:
        objScale = 1;
        break;

      case 1:
        objScale = 0.01;
        break;
      
      case 2:
        objScale = 0.1;    
        break;
      
      case 3:
        objScale = 4;
        break;
      
      case 4:
        objScale = 0.05;
        break;
      
      case 5:
        objScale = 1;    
        break;
      

    }
    

    const loader = new GLTFLoader();
    loader.load(name, (gltf) => {
      gltf.scene.traverse(c => {
          c.castShadow = true;
          
        });
        gltf.scene.children[0].scale.set(objScale,objScale,objScale);
        gltf.scene.children[0].position.set(point.x,point.y,point.z);
        this.scene.add(gltf.scene.children[0])
    });
  }


  pondSpawn(name) {
    ////console.log(point);
    const mapLoader= new THREE.TextureLoader();
    const texture = mapLoader.load('resources/background.jpg');
    const loader = new GLTFLoader();
    loader.load(name, (gltf) => {
      gltf.scene.traverse(c => {
          c.castShadow = true;
          
        });
        ////console.log(gltf.scene.children[0]);

        gltf.scene.children[0].position.set(15,0,15);
        this.scene.add(gltf.scene.children[0])
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
         this.scene.add( cylinder );
    });
  }


  pondSpawn2(name) {
    ////console.log(point);
    const mapLoader= new THREE.TextureLoader();
    const texture = mapLoader.load('resources/background.jpg');
    const loader = new GLTFLoader();
    loader.load(name, (gltf) => {
      gltf.scene.traverse(c => {
          c.castShadow = true;
          
        });
        ////console.log(gltf.scene.children[0]);

        gltf.scene.children[0].position.set(0,0,0);
      
        this.scene.add(gltf.scene.children[0])
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
         this.scene.add( cylinder );

		

         this.gui.add(this.pond2Material.uniforms.u_Resolution,'value',1,100).name("Resolution");

         this.gui.add(this.pond2Material.uniforms.u_dropShown,'value',0,1).name("shown");
         this.gui.add(this.pond2Material.uniforms.u_dropSize,'value',0,1).name("size");
         this.gui.add(this.pond2Material.uniforms.u_lifeSpan,'value',0,1).name("LifeSpan");


    });
  }

  ////////////////////////////////////////////////////////////////////
  //////////// change any material loading here
  ////////////////////////////////////////////////////////////////////

  loadMaterial_(name, tiling) {
    this.shaderActive = false;
    //you can use this to load mateirials. edit the stuff in here and remove placeholder assets
    const mapLoader = new THREE.TextureLoader();
    const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();

    // const metalMap = mapLoader.load('resources/textures/' + name + 'metallic.png');
    // metalMap.anisotropy = maxAnisotropy;
    // metalMap.wrapS = THREE.RepeatWrapping;
    // metalMap.wrapT = THREE.RepeatWrapping;
    // metalMap.repeat.set(tiling, tiling);

    const albedo = mapLoader.load('resources/textures/' + name + 'basecolor.jpg');
    albedo.anisotropy = maxAnisotropy;
    albedo.wrapS = THREE.RepeatWrapping;
    albedo.wrapT = THREE.RepeatWrapping;
    albedo.repeat.set(tiling, tiling);
    albedo.encoding = THREE.sRGBEncoding;

    const normalMap = mapLoader.load('resources/textures/' + name + 'normal.jpg');
    normalMap.anisotropy = maxAnisotropy;
    normalMap.wrapS = THREE.RepeatWrapping;
    normalMap.wrapT = THREE.RepeatWrapping;
    normalMap.repeat.set(tiling, tiling);

    const roughnessMap = mapLoader.load('resources/textures/' + name + 'roughness.jpg');
    roughnessMap.anisotropy = maxAnisotropy;
    roughnessMap.wrapS = THREE.RepeatWrapping;
    roughnessMap.wrapT = THREE.RepeatWrapping;
    roughnessMap.repeat.set(tiling, tiling);

    const displacementMap = mapLoader.load('resources/textures/' + name + 'DISP.png');
    roughnessMap.anisotropy = maxAnisotropy;
    roughnessMap.wrapS = THREE.RepeatWrapping;
    roughnessMap.wrapT = THREE.RepeatWrapping;
    roughnessMap.repeat.set(tiling, tiling);

    // const occMap = mapLoader.load('resources/textures/' + name + 'OCC.jpg');
    // roughnessMap.anisotropy = maxAnisotropy;
    // roughnessMap.wrapS = THREE.RepeatWrapping;
    // roughnessMap.wrapT = THREE.RepeatWrapping;
    // roughnessMap.repeat.set(tiling, tiling);
    
    const material = new THREE.MeshStandardMaterial({
     // metalnessMap: metalMap,
      map: albedo,
      normalMap: normalMap,
      roughnessMap: roughnessMap,
      displacementMap: displacementMap,
     // occulisonMap: occMap,
    });

    return material;
  }

  loadShaderMaterial_(name, tiling) {
    //you can use this to load mateirials. edit the stuff in here and remove placeholder assets
    this.shaderActive = true;
    const mapLoader = new THREE.TextureLoader();
    const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();



    const albedo = mapLoader.load('resources/textures/' + name + 'basecolor.jpg');
    albedo.anisotropy = maxAnisotropy;
    albedo.wrapS = THREE.RepeatWrapping;
    albedo.wrapT = THREE.RepeatWrapping;
    albedo.repeat.set(tiling, tiling);
    albedo.encoding = THREE.sRGBEncoding;



    const mat1 = new THREE.ShaderMaterial({

      uniforms: {
      u_time: {value: 0},
      u_texture: {value: albedo},
      u_movementY: {value :0},
      u_movementX: {value :0},
      u_Resolution: {value: 100.0},
      u_centre: {value: 0.5},
      u_dropShown: {value: 0.5},
      u_dropSize: {value: 0.01},
      u_lifeSpan: {value: 0.3},
      u_Intensity: {value: 1000},
      }
      
    });

    return mat1;
  }

  ////////////////////////////////////////////////////////////////////
  //////////// change above the rest below is fine
  ////////////////////////////////////////////////////////////////////

  InitializeCamera() {
    
    //put Camera elements in here!
    this.fpsCamera = new FirstPersonCamera(this.camera, this.clock, this.player,this.boxes, this.playerBB, this.plane1BB, this.objectlist, this.flashLight);
   // this.collisions = new collsionDetect(this.camera, this.clock, this.player, this.boxes, this.playerBB);
    
  }

  InitializeLights() {
    //lighting
    //put lights here
        //this.scene.add(new THREE.AmbientLight(0xffffff, 0.7))

        this.dirLight = new THREE.DirectionalLight(0xffffff, 1);
        this.dirLight.position.set(0, 200, 0);
        this.dirLight.castShadow = true;
        this.dirLight.shadow.camera.top = 50;
        this.dirLight.shadow.camera.bottom = - 50;
        this.dirLight.shadow.camera.left = - 50;
        this.dirLight.shadow.camera.right = 50;
        this.dirLight.shadow.camera.near = 0.1;
        this.dirLight.shadow.camera.far = 200;
        this.dirLight.shadow.mapSize.width = 4096;
        this.dirLight.shadow.mapSize.height = 4096;
        this.scene.add(this.dirLight);
    
        this.ambLight = new THREE.AmbientLight(0x101010, 0.5);
        this.scene.add(this.ambLight);
    
        this.flashLight = new THREE.PointLight(0xE67638, 0, 30);
        //this.camera.add(this.flashLight);
        //this.flashLight.position.set(this.camera.position);
        this.flashLight.position.set(0, 5, 0);
        this.flashLight.target = this.camera;
        this.scene.add(this.flashLight);
        //this.player.add(this.flashLight);
    
        this.horizonLight = new THREE.HemisphereLight (0xffffbb, 0x080820, 1);
        this.horizonLight.position.set(0, 1, 0.5);
        this.scene.add(this.horizonLight);
        this.moveLight = new dayNightCycle(this.dirLight,this.horizonLight, this.scene.fog);


  }



  
//resize window
  _OnWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  

//ray cast set up
  raycast() {
    this.raycaster = new THREE.Raycaster();
    this.clickMouse = new THREE.Vector2();
    this.moveMouse = new THREE.Vector2();
    this.draggable =[];
  
    window.addEventListener("click",  (event) => {
  
      if(this.draggable[0]) {
        this.draggable.pop();
        return;
      }
          
      this.clickMouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      this.clickMouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
      this.raycaster.setFromCamera( this.clickMouse, this.camera );
      this.found = this.raycaster.intersectObjects( this.scene.children);
      
      if((this.found.length>0 && this.found[0].object.userData.draggable)) {
        this.draggable.push(this.found[0].object);
      } else if((this.found.length>0 && this.found[0].object.parent.userData.draggable)) {
        this.draggable.push(this.found[0].object.parent);
      } else {
        this.manualSpawn(this.arr[this.params.nums], this.found[0].point, this.params.nums);
      }
      }); 
  
  
      window.addEventListener("mousemove",  (event) => {
  
  
      this.moveMouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      this.moveMouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  
  
      }); 
  }
 //draggable items 
 //this does work but due to complications it was disabled and used for something else
  dragObject() {
    if(this.draggable[0] != null) {
  
      this.raycaster.setFromCamera( this.moveMouse, this.camera );
      this.found2 = this.raycaster.intersectObjects( this.scene.children );
      if(this.found2.length>0) {
        ////console.log(this.found2)
        for(let o of this.found2){
          if(!o.object.userData.ground)
            continue
            this.draggable[0].position.x = o.point.x;
            this.draggable[0].position.z = o.point.z;
        }
      }
    }
  }
  
  _SceneGeneration() {
    this.CloudScene = new cloudScene();
    this.scene.add(this.CloudScene);
    ////////console.log(this.CloudScene);
    this.rainDown = new rainFx(this.CloudScene);

    this.bush = new sceneGeneration(this.arr[4], 25, 0.05,2);
    this.scene.add(this.bush);
    this.bush2 = new sceneGeneration(this.arr[1], 50, 0.01,1);
    this.scene.add(this.bush2);
    this.rock1 = new sceneGeneration(this.arr[2], 150, 0.1,1);
    this.scene.add(this.rock1);
    this.rock2 = new sceneGeneration(this.arr[5], 50, 1,1);
    this.scene.add(this.rock2);
    this.trees = new sceneGeneration(this.arr[3],150,4,2);
    this.scene.add(this.trees);

  }

//animate
  _RAF() {
      requestAnimationFrame((t) => {
          if (this.previousRAF === null) {
            this.previousRAF = t;
          }
          //this.dragObject();
          this.moveLight.Update(this.params.speed);
          this._RAF();
          if(this.grassmat.length >1) {
            this.grassmat[1].uniforms.u_time.value =t/1000;
          }
          
          if(this.pondMaterial){
            this.pondMaterial.uniforms.u_time.value =t/1000;
          }
          if(this.pond2Material) {
            this.pond2Material.uniforms.u_time.value =t/1000;
          }
          
          this.flashLight.position.x = this.camera.position.x + 0;
          this.flashLight.position.y = this.camera.position.y + 1;
          this.flashLight.position.z = this.camera.position.z + 0;
          
          document.onKeyDown = function (e){
            if (e.keyCode === 69){
              this.flashLight.intensity = 0;
            }
          }

          this.rainDown.Update(this.params.vel);
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