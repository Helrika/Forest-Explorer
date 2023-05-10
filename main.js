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
      // orbitControls.maxPolarAngle = 0;
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
      // './resources/skybox/posx.jpg',
      // './resources/skybox/negx.jpg',
      // './resources/skybox/posy.jpg',
      // './resources/skybox/negy.jpg',
      // './resources/skybox/posz.jpg',
      // './resources/skybox/negz.jpg'a,
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
    this._LoadRockModel();

    const geometry = new THREE.SphereGeometry(300, 32, 16);
    const material = new THREE.MeshBasicMaterial({color: 0xfffff});
    const sphere = new THREE.Mesh(geometry, material);
    sphere.material.side = THREE.BackSide;
    this.scene.add(sphere);

    this.scene.fog = new THREE.Fog(0xDFE9F3, 0, 30);

  }


_LoadTreeModel() {

  //CREATES CORDS

  let spaceX = 0;
  let spaceZ = 0;
  let count = 0;
  let index = 0;
  let xCord = [];
  let zCord = [];
  while (count < 11){
    for (let i = 0; i < 11; i++){
      xCord[index] = spaceX + 15*Math.random();
      //chguucwsuhwcu
      ///ghxwyhgxwygxwygw
      zCord[index] = spaceZ + 15*Math.random();
      spaceZ = spaceZ + 20;
      index = index + 1;
    }
    count = count + 1;
    spaceX = spaceX + 20;
    spaceZ = 0;
  }
  
  ////////////////


  //RANDOMIZES

  let xCord2 = [];
  let zCord2 = [];

  const arr = [];

  for (let i = 0; i <= 101; i++) {
    arr.push(i);
  }

  arr.sort(() => Math.random() - 0.5);

  for (let i = 0; i < xCord.length; i++){
    xCord2.push(xCord[arr[i]]);
    zCord2.push(zCord[arr[i]]);
  }

  /////////////////


  //LOADS IN TREE 1
  let trees = [];
  const loader = new GLTFLoader();
  loader.load('./resources/tree2/scene.gltf', (gltf) => {
      gltf.scene.traverse(c => {
          c.castShadow = true;
          
        });

       // console.log(gltf)
       this.scene.add(gltf.scene);
       for(let i = 0; i<41; i++) {
       // gltf.scene.position.set(Math.random()*100,0, Math.random()*100)
        trees.push(gltf.scene.clone());
        
        if(i == 40) {
          for(let j = 0; j<trees.length;j++) {
            //trees[j].position.set(100*Math.random() +5,0,100*Math.random()+5)
            trees[j].position.set(xCord2[j],0,zCord2[j])
            this.scene.add(trees[j]);
          }
        }
       }

  });

  /////////////////


  //LOADS IN TREE 2

  loader.load('./resources/tree/scene.gltf', (gltf) => {
    gltf.scene.traverse(c => {
        c.castShadow = true;
        
      });

     // console.log(gltf)
     this.scene.add(gltf.scene);
     for(let i = 0; i<41; i++) {
     // gltf.scene.position.set(Math.random()*100,0, Math.random()*100)
      trees.push(gltf.scene.clone());
      
      if(i == 40) {
        for(let j = 39; j<trees.length;j++) {
          //trees[j].position.set(100*Math.random() +5,0,100*Math.random()+5)
          trees[j].position.set(xCord2[j],0,zCord2[j])
          this.scene.add(trees[j]);
        }
      }
     }

  });

  /////////////////


  //LOADS IN TREE 3

  loader.load('./resources/deadtree/scene.gltf', (gltf) => {
    gltf.scene.traverse(c => {
        c.castShadow = true;
        
      });

     // console.log(gltf)
     this.scene.add(gltf.scene);
     for(let i = 0; i<21; i++) {
     // gltf.scene.position.set(Math.random()*100,0, Math.random()*100)
      trees.push(gltf.scene.clone());
      
      if(i == 20) {
        for(let j = 79; j<trees.length;j++) {
          //trees[j].position.set(100*Math.random() +5,0,100*Math.random()+5)
          trees[j].position.set(xCord2[j],0,zCord2[j])
          this.scene.add(trees[j]);
        }
      }
     }

  });

  /////////////////

}

//old version of tree model done by helrika
_LoadTreeModelOgHelVer() {
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
            trees[j].position.set(100*Math.random() +5,0,100*Math.random()+5)
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
            grass[j].position.set(180*Math.random() +5,0,200*Math.random())
            this.scene.add(grass[j]);
          }
        }
       }

  });

}

_LoadRockModel() {
  let rock = [];
  const loader = new GLTFLoader();

  loader.load('./resources/rock/scene.gltf', (gltf) => {
      gltf.scene.traverse(c => {
          c.castShadow = true;
          
        });
        gltf.scene.scale.set(5,5,5);
       // console.log(gltf)
       this.scene.add(gltf.scene);
       for(let i = 0; i<100; i++) {
       // gltf.scene.position.set(Math.random()*100,0, Math.random()*100)
        rock.push(gltf.scene.clone());
        if(i == 99) {
          for(let j = 0; j<rock.length;j++) {
            rock[j].position.set(180*Math.random() +5,0,200*Math.random())
            rock[j].scale.set(0.4, 0.4, 0.4);
            this.scene.add(rock[j]);
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
        //this.scene.add(new THREE.AmbientLight(0xffffff, 0.7))

        this.dirLight = new THREE.DirectionalLight(0xffffff, 1);
        this.dirLight.position.set(0, 1000, 0);
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
    
        this.flashLight = new THREE.SpotLight(0xffffff, 1.0, 25, Math.PI / 4.0, 0.5, 1);
        this.flashLight.position.set(0, 10, 0);
        this.flashLight.rotation.set(0, 270, 0);
    
        this.scene.add(this.flashLight);
        this.scene.add(this.flashLight.target);
    
        this.camera.add(this.flashLight);
        this.camera.add(this.flashLight.target);
        // this.camera.add(this.flashLight);
        // this.camera.add(this.flashLight.target);
        //this.camera.add(flashLight.target);
        //flashLight.target.position.z = -3;
    
        this.horizonLight = new THREE.HemisphereLight (0xffffbb, 0x080820, 1);
        this.horizonLight.position.set(0, 1, 0.5);
        this.scene.add(this.horizonLight);
        this.moveLight = new dayNightCycle(this.dirLight,this.horizonLight);


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
    this.CloudScene = new cloudScene();
    this.scene.add(this.CloudScene);
    console.log(this.CloudScene);
    this.rainDown = new rainFx(this.CloudScene);

  }

//animate
  _RAF() {
      requestAnimationFrame((t) => {
          if (this.previousRAF === null) {
            this.previousRAF = t;
          }
          this.moveLight.Update();
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