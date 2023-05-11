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
import {mergeBufferGeometries} from 'https://cdn.skypack.dev/three-stdlib@2.8.5/utils/BufferGeometryUtils';


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
      this.arr = ['./resources/tree2/tree.gltf','./resources/grass/grass2.gltf','./resources/rock/rock.gltf','./resources/treetest.gltf'];

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
    this.grassmat = this.loadMaterial_("Grass_001_", 110);
    const checkerboard = mapLoader.load('resources/grass.png');
    checkerboard.anisotropy = maxAnisotropy;
    checkerboard.wrapS = THREE.RepeatWrapping;
    checkerboard.wrapT = THREE.RepeatWrapping;
    checkerboard.repeat.set(32, 32);
    checkerboard.encoding = THREE.sRGBEncoding;

    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(1000, 1000, 10, 10),
        this.grassmat);
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
      this.loadMaterial_('Stylized_Grass_003_', 0.2));
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
    //console.log(this.arr[0]);
   this._LoadTreeModel(this.arr[0], 100, 2,1);
    this._LoadTreeModel(this.arr[1], 300, 5,1);
   this._LoadTreeModel(this.arr[2], 300, 0.3,1);
    this._LoadTreeModel(this.arr[3],100,4,2);
    //this._LoadRockModel();

    const geometry = new THREE.SphereGeometry(300, 32, 16);
    const material = new THREE.MeshBasicMaterial({color: 0xfffff});
    const sphere = new THREE.Mesh(geometry, material);
    sphere.material.side = THREE.BackSide;
    this.scene.add(sphere);

    this.scene.fog = new THREE.Fog(0xDFE9F3, 0, 100);

  }


  something(geo2) {
    geo2.translate(Math.random() * 1,0,Math.random()*1);
    return geo2;
  }
_LoadTreeModel(name, amount, scale, repeat) {
  
  var dummy = new THREE.Object3D();
  var dummy2 = new THREE.Object3D();
  var matrix = new THREE.Matrix4();
  var position = new THREE.Vector3();
  // let geo = new THREE.BufferGeometry();
  let trees = [];
  const loader = new GLTFLoader();
  loader.load(name, (gltf) => {
      gltf.scene.traverse(c => {
          c.castShadow = true;
          
        });
        //console.log(gltf.scene.children[0].children[0]);
        if(repeat <2) {
          console.log(repeat);
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
          this.scene.add( cluster );
          var k = 0;
          var offset = ( amount - 1 ) / 2;
          for ( var x = 0; x < amount; x ++ ) {

            for ( var y = 0; y < amount; y ++ ) {

              for ( var z = 0; z < amount; z ++ ) {
                dummy.scale.setScalar(scale);
                dummy.position.set( Math.sin(Math.random() * 2*Math.PI) *100, 0, Math.sin(Math.random()*2*Math.PI) *100);
                dummy.updateMatrix();

                cluster.setMatrixAt( k ++, dummy.matrix );

              }

            }

          }
        } else {
          var geoGroup = [];
          var matGroup = [];
          var clusterGroup = [];
          console.log(gltf.scene.children[0].children.length)
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
              clusterGroup.push(cluster);
              //console.log(clusterGroup);
              this.scene.add( clusterGroup[i] );
          }

                    var i = 0;
          var offset = ( amount - 1 ) / 2;
          for ( var x = 0; x < amount; x ++ ) {

            for ( var y = 0; y < amount; y ++ ) {

              for ( var z = 0; z < amount; z ++ ) {
                dummy.scale.setScalar(scale);
                dummy.position.set(  Math.sin(Math.random() * 2*Math.PI) *100, 0, Math.sin(Math.random()*2*Math.PI) *100 );
                dummy.updateMatrix();
                  //console.log(clusterGroup);
                  for(let k = 0; k<clusterGroup.length; k++) {
                    clusterGroup[k].setMatrixAt( i, dummy.matrix );

                  }
                    if(z == amount -1) {
                      // console.log(true)
                    }
                  i++;
              }

            }

          }
          // var material = gltf.scene.children[0].children[0].material;
          // let geo = new THREE.BoxGeometry(0,0,0);
          // let geo2 = gltf.scene.children[0].children[0].geometry;
  
          // var cluster = new THREE.InstancedMesh( 
          //   geo2,
          //   material, 
          //   amount, //instance count 
          //   false, //is it dynamic 
          //   false,  //does it have color 
          //   true,  //uniform scale
          // );
          // //this.scene.add( cluster );
        }


		


  });


}



// _LoadRockModel() {
//   let rock = [];
//   const loader = new GLTFLoader();

//   loader.load('./resources/rock/scene.gltf', (gltf) => {
//       gltf.scene.traverse(c => {
//           c.castShadow = true;
          
//         });
//         gltf.scene.scale.set(5,5,5);
//        // ////console.log(gltf)
//        this.scene.add(gltf.scene);
//        for(let i = 0; i<100; i++) {
//        // gltf.scene.position.set(Math.random()*100,0, Math.random()*100)
//         rock.push(gltf.scene.clone());
//         if(i == 99) {
//           for(let j = 0; j<rock.length;j++) {
//             rock[j].position.set(180*Math.random() +5,0,200*Math.random())
//             rock[j].scale.set(0.4, 0.4, 0.4);
//             this.scene.add(rock[j]);
//           }
//         }
//        }

//   });

// }

  ////////////////////////////////////////////////////////////////////
  //////////// change any material loading here
  ////////////////////////////////////////////////////////////////////
  loadMaterial_(name, tiling) {
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

    // const displacementMap = mapLoader.load('resources/textures/' + name + 'height.png');
    // roughnessMap.anisotropy = maxAnisotropy;
    // roughnessMap.wrapS = THREE.RepeatWrapping;
    // roughnessMap.wrapT = THREE.RepeatWrapping;
    // roughnessMap.repeat.set(tiling, tiling);

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
      //displacementMap: displacementMap,
     // occulisonMap: occMap,
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
        ////console.log('drag is gonezos '+ this.draggable[0].userData.name)
        this.draggable.pop();
        return;
      }
          
      this.clickMouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      this.clickMouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  
      this.raycaster.setFromCamera( this.clickMouse, this.camera );
      this.found = this.raycaster.intersectObjects( this.scene.children);
      ////console.log(this.found[0])
      if((this.found.length>0 && this.found[0].object.userData.draggable)) {
        this.draggable.push(this.found[0].object);
        ////console.log(this.found[0].object.userData.name +" is found");
    
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
    ////console.log(this.CloudScene);
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