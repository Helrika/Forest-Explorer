import * as THREE from 'three';
export class cloudScene extends THREE.Object3D {
  constructor(rain) {
    super();
    var cloudsArr = [];
    var rainCount = 15000;
    const mapLoader = new THREE.TextureLoader();
    const cloudText = mapLoader.load('resources/Smoke-Transparent.png');
    var cloudGeo = new THREE.PlaneGeometry(500,500);
    var cloudMat = new THREE.MeshLambertMaterial({
      map: cloudText,
      transparent: true,
      alphaTest: 0.5,
    });
    for(let i =0; i<105;i++) {
      var cloud = new THREE.Mesh(cloudGeo, cloudMat);
      cloud.position.set(
        Math.random()* 1000 -200, 
        Math.random() *100 +100+i,
        Math.random()* 1000 -450
      );
      cloud.rotation.set(
        Math.PI/2,
        0,
        0
      );
      cloud.material.opacity = 0.6;
      cloudsArr.push(cloud);
      this.add(cloud);
    }



    var flash = new THREE.PointLight(0x062d89,30,500,1.7);
    flash.position.set(200,300,100);
    this.add(flash);

    var vertices = [];
    for(let i = 0; i <rainCount; i++) {
      var rainDrop = new THREE.Vector3(
        Math.random() * 400 -200,
        Math.random() * 500 -250,
        Math.random() * 400 -200,
      );
      rainDrop.velocity = {};
      rainDrop.velocity = 0;
      vertices.push(rainDrop);
      if(i == rainCount-1) {
        var rainGeo = new THREE.BufferGeometry().setFromPoints(vertices);

      }

    }
    this.userData.vertices =(vertices);
  
    var rainMat = new THREE.PointsMaterial({
      map:rain,
      alphaTest: 0.5,
      size: 0.1,
      transparent: true
    })
    var rain = new THREE.Points(rainGeo,rainMat);

    this.add(rain);
  }
}
