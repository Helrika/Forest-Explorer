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




class loadedWorld {
  constructor() {
      this.Initialize(); 
   
      this.InitializeLights();
      this.initializeScene_();
      this.InitializeCamera();
      this.raycast();
      this._loadClouds();

   
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
      this.object = [];
      this.boxes = [];
      this.clock=new THREE.Clock();
      this.objectlist =[];

      //camera
      const fov = 100;
      const aspect = 1920 / 1080;
      const near = 1.0;
      const far = 1000.0;
      this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
      this.camera.position.set(0, 2, 0);
    
      this.cloudsArr = [];
      this.rainCount =15000;
      this.drops = 0;
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
    plane.userData.ground= true;
    this.plane1BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    //gets the boundaries
    this.plane1BB.setFromObject(plane);
   // this.boxes.push(this.plane1BB);


    this.scene.add(plane);

    const box = new THREE.Mesh(
      new THREE.BoxGeometry(4, 4, 4),
      this.loadMaterial_('vintage-tile1_', 0.2));
    box.position.set(10, 2, 0);
    box.castShadow = true;
    box.receiveShadow = true;
    this.object.push(box);
   box.userData.draggable = true;
     box.userData.name = "box";
     this.boxBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
     //gets the boundaries
     this.boxBB.setFromObject(box);
     this.boxes.push(this.boxBB);
     this.objectlist.push(box);
    this.scene.add(box);

    this.playerGeo = new THREE.CapsuleGeometry(1,1,4,8);
    this.playerMesh = new THREE.MeshBasicMaterial({color: 0x00ff00});
    this.player = new THREE.Mesh(this.playerGeo, this.playerMesh)
    this.player.y = 2;
    this.player.userData.name = "player";
    this.player.userData.draggable = false;
    this.playerBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    //gets the boundaries
    this.playerBB.setFromObject(this.player);
    this.scene.add(this.player);  

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
    this.fpsCamera = new FirstPersonCamera(this.camera, this.clock, this.player,this.boxes, this.playerBB, this.plane1BB, this.objectlist);
   // this.collisions = new collsionDetect(this.camera, this.clock, this.player, this.boxes, this.playerBB);

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
  

//ray cast set up
  raycast() {
    this.raycaster = new THREE.Raycaster();
    this.clickMouse = new THREE.Vector2();
    this.moveMouse = new THREE.Vector2();
    this.draggable =[];
  
    window.addEventListener("click",  (event) => {
  
      if(this.draggable[0]) {
        console.log('drag is gonezos '+ this.draggable[0].userData.name)
        this.draggable.pop();
        return;
      }
          
      this.clickMouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      this.clickMouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  
      this.raycaster.setFromCamera( this.clickMouse, this.camera );
      this.found = this.raycaster.intersectObjects( this.scene.children);
      console.log(this.found[0])
      if((this.found.length>0 && this.found[0].object.userData.draggable)) {
        this.draggable.push(this.found[0].object);
        console.log(this.found[0].object.userData.name +" is found");
    
      } else if((this.found.length>0 && this.found[0].object.parent.userData.draggable)) {
        this.draggable.push(this.found[0].object.parent);
  
      }
      }); 
  
  
      window.addEventListener("mousemove",  (event) => {
  
  
      this.moveMouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      this.moveMouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  
  
      }); 
  }
 //draggable items 
  dragObject() {
    if(this.draggable[0] != null) {
  
      this.raycaster.setFromCamera( this.moveMouse, this.camera );
      this.found2 = this.raycaster.intersectObjects( this.scene.children );
      if(this.found2.length>0) {

        for(let o of this.found2){
          if(!o.object.userData.ground)
            continue
            this.draggable[0].position.x = o.point.x;
            this.draggable[0].position.z = o.point.z;
        }
      }
    }
  }
  _loadClouds() {
    this.cloudGeo = new THREE.PlaneGeometry(500,500);
    this.cloudMat = new THREE.MeshLambertMaterial({
      map: this.textures,
      transparent: true,
      alphaTest: 0.5,
      // blending: THREE.CustomBlending,
      // blendSrc: THREE.OneFactor,
      // blendDst: THREE.OneMinusSrcAlphaFactor,
    });
    for(let i =0; i<25;i++) {
        this.cloud = new THREE.Mesh(this.cloudGeo, this.cloudMat);
        this.cloud.position.set(
          Math.random()* 1000 -200, 
          200,
          Math.random()* 1000 -450
        );
        this.cloud.rotation.set(
          1.16,
          -0.12,
          Math.random()*360
        );
        this.cloud.material.opacity = 0.6;
        this.cloudsArr.push(this.cloud);
        this.scene.add(this.cloud);
    }



    this.flash = new THREE.PointLight(0x062d89,30,500,1.7);
    this.flash.position.set(200,300,100);
    this.scene.add(this.flash);


    //this.rainBuff = new THREE.BufferGeometry();
    //this.rainGeo = new THREE.BoxGeometry();
    //console.log(this.rainGeo)
    this.vertices = [];
    for(let i = 0; i <this.rainCount; i++) {
      this.rainDrop = new THREE.Vector3(
        Math.random() * 400 -200,
        Math.random() * 500 -250,
        Math.random() * 400 -200,
      );
      this.rainDrop.velocity = {};
      this.rainDrop.velocity = 0;
      this.vertices.push(this.rainDrop);
      if(i == this.rainCount-1) {
        this.rainGeo = new THREE.BufferGeometry().setFromPoints(this.vertices);
        
        
     //this.rainGeo.geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( this.vertices, 3 ) );
      //this.rainGeo.geometry.attributes.position.needsUpdate = true;
      }

    }
    this.drops = this.rainGeo.getAttribute( 'position' );
  
    this.rainMat = new THREE.PointsMaterial({
      color:0xaaaaaa,
      size: 0.1,
      transparent: true
    })
    this.rain = new THREE.Points(this.rainGeo,this.rainMat);
    this.scene.add(this.rain);

    this.rainDown = new rainFx(this.cloudArr, this.flash, this.rainGeo, this.vertices);

  }

//animate
  _RAF() {
      requestAnimationFrame((t) => {
          if (this.previousRAF === null) {
            this.previousRAF = t;
          }
    
          this._RAF();
          this.dragObject();
          this.rainDown.Update();
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
     // this.collisions.Update(timeElapsedS);

  }
  

}

let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
_APP = new loadedWorld();
});