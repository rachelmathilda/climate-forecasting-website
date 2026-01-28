declare module 'three/examples/jsm/controls/OrbitControls.js' {
  import { Camera, MOUSE, EventDispatcher, Vector3 } from 'three'
  export class OrbitControls extends EventDispatcher {
    constructor(object: Camera, domElement?: HTMLElement)
    object: Camera
    domElement: HTMLElement | undefined
    enableDamping: boolean
    dampingFactor: number
    screenSpacePanning: boolean
    maxPolarAngle: number
    minDistance: number
    maxDistance: number
    update(): boolean
    dispose(): void
    saveState(): void
    reset(): void
    target: Vector3
    mouseButtons: { LEFT: MOUSE; MIDDLE: MOUSE; RIGHT: MOUSE }
  }
}
