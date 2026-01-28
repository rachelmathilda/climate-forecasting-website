import * as THREE from "three"
import { TsunamiScene } from "./tsunami"

export const DisasterRegistry = [TsunamiScene]
export interface DisasterScene {
  id: string
  title: string
  create(scene: THREE.Scene): THREE.Object3D[]
  update(delta: number): void
}
