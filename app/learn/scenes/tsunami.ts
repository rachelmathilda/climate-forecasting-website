import * as THREE from "three"
import { DisasterScene } from "./index"

let sea: THREE.Mesh
let waves: THREE.Mesh[] = []

export const TsunamiScene: DisasterScene = {
  id: "tsunami",
  title: "Tsunami",

  create(scene) {
    const objects: THREE.Object3D[] = []

    const seaGeom = new THREE.PlaneGeometry(1000, 600, 200, 100)
    const seaMat = new THREE.MeshPhongMaterial({
      color: 0x1e90ff,
      side: THREE.DoubleSide,
      flatShading: true,
      shininess: 100
    })
    sea = new THREE.Mesh(seaGeom, seaMat)
    sea.rotation.x = -Math.PI / 2
    sea.position.set(0, 10, 0)
    scene.add(sea)
    objects.push(sea)

    const land = new THREE.Mesh(
      new THREE.PlaneGeometry(400, 600),
      new THREE.MeshPhongMaterial({ color: 0x8b6b4f })
    )
    land.rotation.x = -Math.PI / 2
    land.position.set(400, 20, 0)
    scene.add(land)
    objects.push(land)

    for (let i = 0; i < 4; i++) {
      const geom = new THREE.PlaneGeometry(300, 600, 50, 50)
      const mat = new THREE.MeshPhongMaterial({
        color: 0x1565c0,
        side: THREE.DoubleSide,
        flatShading: true,
        transparent: true,
        opacity: 0.8 - i * 0.15,
        shininess: 80
      })
      const wave = new THREE.Mesh(geom, mat)
      wave.rotation.x = -Math.PI / 2
      wave.position.set(-400 - i * 150, 15 + i * 5, 0)
      scene.add(wave)
      objects.push(wave)
      waves.push(wave)
    }

    return objects
  },

  update(delta) {
    const time = performance.now() * 0.002

    const pos = sea.geometry.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = Math.sin(x * 0.05 + time) * 20 + Math.sin(x * 0.15 + time * 0.5) * 8
      pos.setY(i, y)
    }
    pos.needsUpdate = true
    sea.geometry.computeVertexNormals()

    waves.forEach((wave, index) => {
      wave.position.x += delta * (20 + index * 5)
      const geom = wave.geometry as THREE.PlaneGeometry
      const wavePos = geom.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < wavePos.count; i++) {
        const x = wavePos.getX(i)
        const y = Math.sin(x * 0.3 + time * (1.5 + index * 0.3)) * (25 + index * 5)
        wavePos.setY(i, y)
      }
      wavePos.needsUpdate = true
      geom.computeVertexNormals()
    })
  }
}
