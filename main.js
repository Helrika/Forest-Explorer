import * as THREE from 'three';
import {GLTFLoader} from './build/three/examples/jsm/loaders/GLTFLoader.js';
import {FirstPersonCamera} from './fps.js';
import {rainFx} from './rain.js';
import {dayNightCycle} from './lightCycle.js';
import { cloudScene } from './clouds.js';
import { sceneGeneration } from './sceneGen.js';
import { pondSpawn } from './ponds.js';
import datGui from 'https://cdn.skypack.dev/dat.gui';

class loadedWorld {
  constructor() {
      this.Initialize();
      this.InitializeLights();
      this.initializeBase();
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
  //////////// Initialized Base scene elements
  ////////////////////////////////////////////////////////////////////
  initializeBase() {
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

    //sky
    const skytext = mapLoader.load("./resources/Sky_horiz_19.jpg");
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

  ////////////////////////////////////////////////////////////////////
  //////////// Change plane
  ////////////////////////////////////////////////////////////////////
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

  ////////////////////////////////////////////////////////////////////
  //////////// Click Spawn
  ////////////////////////////////////////////////////////////////////
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

  ////////////////////////////////////////////////////////////////////
  //////////// Materials
  ////////////////////////////////////////////////////////////////////

  loadMaterial_(name, tiling) {
    this.shaderActive = false;
    //you can use this to load mateirials. edit the stuff in here and remove placeholder assets
    const mapLoader = new THREE.TextureLoader();
    const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();

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
    
    const material = new THREE.MeshStandardMaterial({
      map: albedo,
      normalMap: normalMap,
      roughnessMap: roughnessMap,
      displacementMap: displacementMap,
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
      u_dropShown: {value: 0.2},
      u_dropSize: {value: 0.01},
      u_lifeSpan: {value: 0.3},
      u_Intensity: {value: 1000},
      }
      
    });

    return mat1;
  }

  ////////////////////////////////////////////////////////////////////
  //////////// Camera
  ////////////////////////////////////////////////////////////////////

  InitializeCamera() {
    
    //put Camera elements in here!
    this.fpsCamera = new FirstPersonCamera(this.camera, this.clock, this.player,this.boxes, this.playerBB, this.plane1BB, this.objectlist, this.flashLight);
   // this.collisions = new collsionDetect(this.camera, this.clock, this.player, this.boxes, this.playerBB);
    
  }

  ////////////////////////////////////////////////////////////////////
  //////////// Lights
  ////////////////////////////////////////////////////////////////////
  InitializeLights() {
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

    this.flashLight.position.set(0, 5, 0);
    this.flashLight.target = this.camera;
    this.scene.add(this.flashLight);

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
  

  ////////////////////////////////////////////////////////////////////
  //////////// Raycast
  ////////////////////////////////////////////////////////////////////
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

  ////////////////////////////////////////////////////////////////////
  //////////// Main Scene Generation
  ////////////////////////////////////////////////////////////////////  
  _SceneGeneration() {
    const mapLoader = new THREE.TextureLoader();
    const rain = mapLoader.load('./resources/clipart27636.png');
    this.CloudScene = new cloudScene(rain);
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

    this.pond1 = new pondSpawn(this.arr[7], this.gui, 1);
    this.scene.add(this.pond1);
    this.pond2 = new pondSpawn(this.arr[6], this.gui, 0);
    this.scene.add(this.pond2);
  }

  ////////////////////////////////////////////////////////////////////
  //////////// Animation State
  ////////////////////////////////////////////////////////////////////
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

          this.pond1.Update(t);
          this.pond2.Update(t);
          
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