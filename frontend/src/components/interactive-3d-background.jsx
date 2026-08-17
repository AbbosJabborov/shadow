import { useEffect, useRef, useCallback } from "react"
import * as THREE from "three"
import { useTheme } from "next-themes"

/**
 * High-performance 3D Neural Particle Constellation Background built with Three.js.
 * Features:
 * - Neural Constellation Particle Network with dynamic mouse tethers
 * - Distance-based adaptive neural connection lines
 * - Interactive Cursor Laser Tracking & Shockwave Impulses
 * - Smooth Mouse & Scroll Parallax
 * - Theme-aware styling (seamless dark & light modes)
 */
export function Interactive3DBackground({ variant = "hero" }) {
  const containerRef = useRef(null)
  const { resolvedTheme } = useTheme()
  const shockwavesRef = useRef([])

  // Click handler to emit 3D shockwave ripple through the neural constellation
  const handleClick = useCallback((e) => {
    const normX = (e.clientX / window.innerWidth) * 2 - 1
    const normY = -(e.clientY / window.innerHeight) * 2 + 1

    shockwavesRef.current.push({
      x: normX * 85,
      y: normY * 60,
      radius: 0.1,
      maxRadius: variant === "subtle" ? 55 : 90,
      speed: 2.4,
      intensity: 2.2,
      decay: 0.018,
    })
  }, [variant])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // ----------------------------------------------------
    // 1. SCENE SETUP
    // ----------------------------------------------------
    const scene = new THREE.Scene()
    const isSubtle = variant === "subtle"

    const camera = new THREE.PerspectiveCamera(
      isSubtle ? 55 : 60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.z = isSubtle ? 95 : 80
    camera.position.y = isSubtle ? -4 : 0

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // ----------------------------------------------------
    // 2. THEME COLOR PALETTE
    // ----------------------------------------------------
    const isDark =
      resolvedTheme === "dark" ||
      document.documentElement.classList.contains("dark")

    const colors = {
      particle: isDark ? 0xffffff : 0x0f172a,
      particleAccent: isDark ? 0x38bdf8 : 0x2563eb,
      line: isDark ? 0x94a3b8 : 0x64748b,
      cursorLine: isDark ? 0x38bdf8 : 0x3b82f6,
    }

    // ----------------------------------------------------
    // 3. NEURAL PARTICLE CLUSTER (Econometric Data Nodes)
    // ----------------------------------------------------
    const particleCount = isSubtle ? 85 : 180
    const particleGeo = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const velocities = []
    const particleColors = new Float32Array(particleCount * 3)

    const colorPrimary = new THREE.Color(colors.particle)
    const colorAccent = new THREE.Color(colors.particleAccent)

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      positions[i3] = (Math.random() - 0.5) * (isSubtle ? 180 : 175)
      positions[i3 + 1] = (Math.random() - 0.5) * (isSubtle ? 130 : 125)
      positions[i3 + 2] = (Math.random() - 0.5) * (isSubtle ? 70 : 85)

      velocities.push({
        x: (Math.random() - 0.5) * (isSubtle ? 0.045 : 0.08),
        y: (Math.random() - 0.5) * (isSubtle ? 0.045 : 0.08),
        z: (Math.random() - 0.5) * 0.035,
      })

      // Accent color node distribution
      const isAccent = Math.random() > 0.7
      const chosenColor = isAccent ? colorAccent : colorPrimary
      particleColors[i3] = chosenColor.r
      particleColors[i3 + 1] = chosenColor.g
      particleColors[i3 + 2] = chosenColor.b
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3))

    // High-tech glowing circular point texture via Canvas
    const createCircleTexture = () => {
      const canvas = document.createElement("canvas")
      canvas.width = 64
      canvas.height = 64
      const ctx = canvas.getContext("2d")
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30)
      grad.addColorStop(0, "rgba(255, 255, 255, 1)")
      grad.addColorStop(0.35, "rgba(255, 255, 255, 0.85)")
      grad.addColorStop(0.7, "rgba(255, 255, 255, 0.25)")
      grad.addColorStop(1, "rgba(255, 255, 255, 0)")
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, 64, 64)

      const texture = new THREE.CanvasTexture(canvas)
      texture.needsUpdate = true
      return texture
    }

    const particleMaterial = new THREE.PointsMaterial({
      vertexColors: true,
      size: isDark ? 2.8 : 2.4,
      map: createCircleTexture(),
      transparent: true,
      opacity: isDark
        ? isSubtle ? 0.55 : 0.90
        : isSubtle ? 0.40 : 0.75,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false,
    })

    const particleSystem = new THREE.Points(particleGeo, particleMaterial)
    scene.add(particleSystem)

    // ----------------------------------------------------
    // 4. INTER-PARTICLE CONSTELLATION LINES
    // ----------------------------------------------------
    const maxLineCount = isSubtle ? 200 : 420
    const linePositions = new Float32Array(maxLineCount * 6)
    const lineGeo = new THREE.BufferGeometry()
    lineGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage)
    )

    const lineMaterial = new THREE.LineBasicMaterial({
      color: colors.line,
      transparent: true,
      opacity: isDark
        ? isSubtle ? 0.16 : 0.28
        : isSubtle ? 0.10 : 0.18,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false,
    })

    const lineSegments = new THREE.LineSegments(lineGeo, lineMaterial)
    scene.add(lineSegments)

    // ----------------------------------------------------
    // 5. CURSOR TETHER LINES (Neural connections to pointer)
    // ----------------------------------------------------
    const maxCursorLines = 16
    const cursorLinePositions = new Float32Array(maxCursorLines * 6)
    const cursorLineGeo = new THREE.BufferGeometry()
    cursorLineGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(cursorLinePositions, 3).setUsage(THREE.DynamicDrawUsage)
    )

    const cursorLineMaterial = new THREE.LineBasicMaterial({
      color: colors.cursorLine,
      transparent: true,
      opacity: isDark ? 0.65 : 0.45,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      linewidth: 2,
    })

    const cursorLineSegments = new THREE.LineSegments(cursorLineGeo, cursorLineMaterial)
    scene.add(cursorLineSegments)

    // ----------------------------------------------------
    // 6. MOUSE & PARALLAX TRACKING
    // ----------------------------------------------------
    let mouseX = 0
    let mouseY = 0
    let targetCamX = 0
    let targetCamY = 0
    let scrollY = 0

    const mouse3D = new THREE.Vector3(-9999, -9999, 0)
    let isMouseActive = false

    const handleMouseMove = (e) => {
      isMouseActive = true
      const normX = (e.clientX / window.innerWidth) * 2 - 1
      const normY = -(e.clientY / window.innerHeight) * 2 + 1

      mouseX = normX * (isSubtle ? 16 : 30)
      mouseY = normY * (isSubtle ? 12 : 24)

      // Project 2D coordinates to 3D plane
      mouse3D.set(normX * 90, normY * 65, 0)
    }

    const handleMouseLeave = () => {
      isMouseActive = false
      mouse3D.set(-9999, -9999, 0)
    }

    const handleScroll = () => {
      scrollY = window.scrollY || window.pageYOffset
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    document.addEventListener("mouseleave", handleMouseLeave)
    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("click", handleClick, { passive: true })

    // Resize Handler
    const handleResize = () => {
      if (!container) return
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener("resize", handleResize)

    // ----------------------------------------------------
    // 7. ANIMATION LOOP & NEURAL PHYSICS
    // ----------------------------------------------------
    let animationFrameId
    const startTime = performance.now()
    const maxConnDist = isSubtle ? 21 : 27

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      const elapsedTime = (performance.now() - startTime) * 0.001

      // Smooth camera parallax with scroll elevation
      targetCamX += (mouseX - targetCamX) * 0.04
      targetCamY += (mouseY - targetCamY) * 0.04
      const scrollOffset = scrollY * 0.02
      camera.position.x = targetCamX
      camera.position.y = (isSubtle ? -4 : 0) + targetCamY - Math.min(scrollOffset, 30)
      camera.lookAt(0, -scrollOffset * 0.4, 0)

      // Update Shockwaves
      const activeShockwaves = shockwavesRef.current
      for (let s = activeShockwaves.length - 1; s >= 0; s--) {
        const sw = activeShockwaves[s]
        sw.radius += sw.speed
        sw.intensity -= sw.decay

        if (sw.intensity <= 0 || sw.radius > sw.maxRadius) {
          activeShockwaves.splice(s, 1)
        }
      }

      // Update Neural Particles & Connection Geometry
      const pArray = particleGeo.attributes.position.array
      let lineIdx = 0
      let cursorLineIdx = 0

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3

        // Move particles along velocity vectors
        pArray[i3] += velocities[i].x
        pArray[i3 + 1] += velocities[i].y
        pArray[i3 + 2] += velocities[i].z

        // Soft bounding box bounce
        const bX = isSubtle ? 92 : 88
        const bY = isSubtle ? 66 : 62
        const bZ = isSubtle ? 40 : 45

        if (Math.abs(pArray[i3]) > bX) velocities[i].x *= -1
        if (Math.abs(pArray[i3 + 1]) > bY) velocities[i].y *= -1
        if (Math.abs(pArray[i3 + 2]) > bZ) velocities[i].z *= -1

        // Shockwave kinetic burst on nodes
        for (let s = 0; s < activeShockwaves.length; s++) {
          const sw = activeShockwaves[s]
          const sDx = pArray[i3] - sw.x
          const sDy = pArray[i3 + 1] - sw.y
          const sDist = Math.sqrt(sDx * sDx + sDy * sDy)
          const sDiff = Math.abs(sDist - sw.radius)

          if (sDiff < 22) {
            const force = ((22 - sDiff) / 22) * sw.intensity * 2.5
            pArray[i3] += (sDx / (sDist || 1)) * force
            pArray[i3 + 1] += (sDy / (sDist || 1)) * force
            pArray[i3 + 2] += force * 1.8
          }
        }

        // Mouse magnetic repulsion & cursor tether laser
        if (isMouseActive) {
          const mDx = pArray[i3] - mouse3D.x
          const mDy = pArray[i3 + 1] - mouse3D.y
          const mDz = pArray[i3 + 2] - mouse3D.z
          const distToMouse = Math.sqrt(mDx * mDx + mDy * mDy + mDz * mDz)

          if (distToMouse < 40) {
            const repelForce = (40 - distToMouse) * 0.045
            pArray[i3] += (mDx / distToMouse) * repelForce
            pArray[i3 + 1] += (mDy / distToMouse) * repelForce
          }

          // Connect nearest nodes to cursor
          if (distToMouse < 32 && cursorLineIdx < maxCursorLines * 6) {
            cursorLinePositions[cursorLineIdx++] = pArray[i3]
            cursorLinePositions[cursorLineIdx++] = pArray[i3 + 1]
            cursorLinePositions[cursorLineIdx++] = pArray[i3 + 2]
            cursorLinePositions[cursorLineIdx++] = mouse3D.x
            cursorLinePositions[cursorLineIdx++] = mouse3D.y
            cursorLinePositions[cursorLineIdx++] = mouse3D.z
          }
        }

        // Connect nearby neighbor nodes
        for (let j = i + 1; j < particleCount; j++) {
          if (lineIdx >= maxLineCount * 6) break

          const j3 = j * 3
          const pDx = pArray[i3] - pArray[j3]
          const pDy = pArray[i3 + 1] - pArray[j3 + 1]
          const pDz = pArray[i3 + 2] - pArray[j3 + 2]
          const dist = Math.sqrt(pDx * pDx + pDy * pDy + pDz * pDz)

          if (dist < maxConnDist) {
            linePositions[lineIdx++] = pArray[i3]
            linePositions[lineIdx++] = pArray[i3 + 1]
            linePositions[lineIdx++] = pArray[i3 + 2]
            linePositions[lineIdx++] = pArray[j3]
            linePositions[lineIdx++] = pArray[j3 + 1]
            linePositions[lineIdx++] = pArray[j3 + 2]
          }
        }
      }

      particleGeo.attributes.position.needsUpdate = true

      lineGeo.setDrawRange(0, lineIdx / 3)
      lineGeo.attributes.position.needsUpdate = true

      cursorLineSegments.visible = isMouseActive && cursorLineIdx > 0
      cursorLineGeo.setDrawRange(0, cursorLineIdx / 3)
      cursorLineGeo.attributes.position.needsUpdate = true

      // Slow orbital drift
      particleSystem.rotation.y = elapsedTime * 0.02
      lineSegments.rotation.y = elapsedTime * 0.02

      renderer.render(scene, camera)
    }

    animate()

    // ----------------------------------------------------
    // 8. CLEANUP
    // ----------------------------------------------------
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("click", handleClick)
      window.removeEventListener("resize", handleResize)

      particleGeo.dispose()
      particleMaterial.dispose()
      lineGeo.dispose()
      lineMaterial.dispose()
      cursorLineGeo.dispose()
      cursorLineMaterial.dispose()

      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [resolvedTheme, variant, handleClick])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  )
}
