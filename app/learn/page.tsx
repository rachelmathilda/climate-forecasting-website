"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { DisasterRegistry } from "./scenes"
import Navbar from "@/components/navbar"

interface DisasterScene {
  create(scene: THREE.Scene): THREE.Object3D[]
  update(delta: number): void
}

export default function LearnPanorama() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xbfdfff)

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 5000)
    camera.position.set(-800, 80, 400)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    ref.current.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.maxPolarAngle = Math.PI / 2

    DisasterRegistry.forEach((d: DisasterScene) => d.create(scene))

    let last = performance.now()
    const animate = () => {
      requestAnimationFrame(animate)
      const now = performance.now()
      const delta = (now - last) / 1000
      last = now

      DisasterRegistry.forEach((d: DisasterScene) => d.update(delta))

      controls.target.x += delta * 4
      controls.update()

      renderer.render(scene, camera)
    }

    animate()

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
  <>
    <Navbar />
    <div
      ref={ref}
      className="fixed top-0 left-0 w-screen h-screen"
    />
  </>
)

}