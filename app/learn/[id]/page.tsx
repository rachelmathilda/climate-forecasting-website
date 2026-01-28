"use client"

import { useParams } from "next/navigation"
import { useEffect, useRef } from "react"
import * as THREE from "three"
import { DisasterRegistry } from "../scenes"

export default function DisasterDetail() {
  const { id } = useParams()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const disaster = DisasterRegistry.find(d => d.id === id)
    if (!disaster || !ref.current) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xdfefff)

    const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 500)
    camera.position.set(-40, 18, 60)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(innerWidth / 2, innerHeight)
    ref.current.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0xffffff, 0.8))

    disaster.create(scene)

    let last = performance.now()
    const loop = () => {
      requestAnimationFrame(loop)
      const now = performance.now()
      disaster.update((now - last) / 1000)
      last = now
      renderer.render(scene, camera)
    }
    loop()
  }, [id])

  return <div ref={ref} className="fixed left-0 top-0 w-1/2 h-full" />
}
