/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { WebGLErrorBoundary, WebGLFallback } from './webgl-error-boundary'
import {
  CanvasTexture,
  DoubleSide,
  LinearFilter,
  SRGBColorSpace,
  TextureLoader,
} from 'three'
import { Suspense, useEffect, useMemo, useRef } from 'react'

const vertexShader = `
  uniform float uBend;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 transformed = position;
    float curve = 1.0 - cos(position.x * 3.14159265);
    transformed.z -= curve * uBend;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uImageAspect;
  uniform float uPlaneAspect;
  uniform float uBlur;
  uniform sampler2D uIcon;
  uniform float uHover;
  varying vec2 vUv;
  vec2 coverUv(vec2 uv) {
    vec2 scale = vec2(1.0);
    if (uImageAspect > uPlaneAspect) {
      scale.x = uPlaneAspect / uImageAspect;
    } else {
      scale.y = uImageAspect / uPlaneAspect;
    }
    return (uv - 0.5) * scale + 0.5;
  }
  void main() {
    vec2 uv = coverUv(vUv);
    vec2 stepSize = vec2(0.0065) * uBlur;
    vec4 color = texture2D(uTexture, uv) * 0.23;
    color += texture2D(uTexture, uv + vec2(stepSize.x, 0.0)) * 0.12;
    color += texture2D(uTexture, uv - vec2(stepSize.x, 0.0)) * 0.12;
    color += texture2D(uTexture, uv + vec2(stepSize.x * 2.0, 0.0)) * 0.06;
    color += texture2D(uTexture, uv - vec2(stepSize.x * 2.0, 0.0)) * 0.06;
    color += texture2D(uTexture, uv + vec2(0.0, stepSize.y)) * 0.12;
    color += texture2D(uTexture, uv - vec2(0.0, stepSize.y)) * 0.12;
    color += texture2D(uTexture, uv + vec2(0.0, stepSize.y * 2.0)) * 0.06;
    color += texture2D(uTexture, uv - vec2(0.0, stepSize.y * 2.0)) * 0.06;
    color += texture2D(uTexture, uv + stepSize) * 0.025;
    color += texture2D(uTexture, uv - stepSize) * 0.025;
    float luminance = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
    color.rgb = mix(vec3(luminance), color.rgb, 1.18);
    color.rgb = (color.rgb - 0.5) * 1.08 + 0.5;
    float brightness = 1.04 - min(uBlur * 0.025, 0.07);
    vec3 rgb = clamp(color.rgb * brightness, 0.0, 1.0);
    rgb *= 1.0 - 0.4 * uHover;
    vec2 iconUv = (vUv - 0.5) * vec2(uPlaneAspect, 1.0) / 0.34 + 0.5;
    float inside = step(0.0, iconUv.x) * step(iconUv.x, 1.0) * step(0.0, iconUv.y) * step(iconUv.y, 1.0);
    float iconAlpha = texture2D(uIcon, iconUv).a * inside * uHover;
    rgb = mix(rgb, vec3(1.0), iconAlpha);
    rgb = pow(rgb, vec3(1.0 / 2.2));
    gl_FragColor = vec4(rgb, 1.0);
  }
`

function wrappedPosition(value, length) {
  const wrapped = ((value % length) + length) % length
  return wrapped > length / 2 ? wrapped - length : wrapped
}

function imageAspect(texture) {
  const image = texture.image
  const width = image?.naturalWidth ?? image?.width ?? 1
  const height = image?.naturalHeight ?? image?.height ?? 1
  return width / Math.max(height, 1)
}

function SpiralScene({
  items,
  targetProgress,
  radius,
  verticalGap,
  cardWidth,
  cardAspectRatio,
  autoRotate,
  autoSpeed,
  smoothing,
  blurStrength,
  bend,
  reducedMotion,
  lastInteraction,
  hovered,
}) {
  const sceneItems = useMemo(
    () =>
      Array.from(
        { length: Math.max(items.length, 16) },
        (_, index) => items[index % items.length],
      ),
    [items],
  )

  const textures = useLoader(
    TextureLoader,
    sceneItems.map((item) => item.src),
  )

  const { gl, viewport, size } = useThree()
  const desktop = size.width >= 1024
  const progress = useRef(0)
  const meshes = useRef([])
  const materials = useRef([])

  const iconTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const g = canvas.getContext('2d')
    g.strokeStyle = '#fff'
    g.fillStyle = '#fff'
    g.lineWidth = 14
    g.lineCap = 'round'
    g.lineJoin = 'round'
    g.beginPath()
    g.moveTo(20, 128)
    g.quadraticCurveTo(128, 28, 236, 128)
    g.quadraticCurveTo(128, 228, 20, 128)
    g.closePath()
    g.stroke()
    g.beginPath()
    g.arc(128, 128, 28, 0, Math.PI * 2)
    g.fill()
    const texture = new CanvasTexture(canvas)
    texture.minFilter = LinearFilter
    texture.magFilter = LinearFilter
    texture.generateMipmaps = false
    return texture
  }, [])

  const uniforms = useMemo(
    () =>
      textures.map((texture) => ({
        uTexture: { value: texture },
        uImageAspect: { value: imageAspect(texture) },
        uPlaneAspect: { value: cardAspectRatio },
        uBlur: { value: 0 },
        uBend: { value: 0 },
        uIcon: { value: iconTexture },
        uHover: { value: 0 },
      })),
    [cardAspectRatio, textures, iconTexture],
  )

  useEffect(() => {
    textures.forEach((texture) => {
      texture.colorSpace = SRGBColorSpace
      texture.minFilter = LinearFilter
      texture.magFilter = LinearFilter
      texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())
      texture.needsUpdate = true
    })
  }, [gl, textures])

  useFrame((_state, delta) => {
    if (
      autoRotate &&
      hovered.current < 0 &&
      !reducedMotion.current &&
      performance.now() - lastInteraction.current > 450
    ) {
      targetProgress.current += autoSpeed * Math.min(delta, 0.05)
    }

    const frameScale = Math.min(delta * 60, 3)
    const ease = reducedMotion.current
      ? 1
      : 1 - Math.pow(1 - smoothing, frameScale)
    progress.current += (targetProgress.current - progress.current) * ease

    const hoverEase = 1 - Math.pow(1 - 0.18, frameScale)

    const factor = Math.max(viewport.factor, 1)
    const planeWidth = Math.min(cardWidth / factor, viewport.width * 0.32)
    const planeHeight = planeWidth / cardAspectRatio
    const spiralRadius = Math.min(radius / factor, viewport.width * 0.3)
    const gap = Math.min(
      (verticalGap / factor) * (desktop ? 1.4 : 1),
      viewport.height * (desktop ? 0.14 : 0.1),
    )
    const count = sceneItems.length

    meshes.current.forEach((mesh, index) => {
      const material = materials.current[index]
      if (!mesh || !material) return

      const position = wrappedPosition(index - progress.current, count)
      const angle = position * (desktop ? 0.88 : 0.78)
      const depth = (Math.cos(angle) + 1) / 2
      const distance = Math.min(Math.abs(position) / (count * 0.43), 1)
      const scale = 0.74 + depth * 0.26

      mesh.position.set(
        Math.sin(angle) * spiralRadius,
        -position * gap,
        Math.cos(angle) * 2.55,
      )
      mesh.rotation.set(0, Math.sin(angle) * -1.12, 0)
      mesh.scale.set(planeWidth * scale, planeHeight * scale, 1)

      material.uniforms.uBlur.value = Math.pow(distance, 1.28) * blurStrength
      material.uniforms.uBend.value = planeWidth * bend
      material.uniforms.uPlaneAspect.value = cardAspectRatio

      const hoverTarget = hovered.current === index ? 1 : 0
      material.uniforms.uHover.value +=
        (hoverTarget - material.uniforms.uHover.value) * hoverEase
    })
  })

  return (
    <>
      {sceneItems.map((item, index) => (
        <mesh
          key={`${item.src}-${index}`}
          ref={(node) => {
            meshes.current[index] = node
          }}
          frustumCulled={false}
          onPointerOver={(event) => {
            event.stopPropagation()
            hovered.current = index
            gl.domElement.style.cursor = 'pointer'
          }}
          onPointerOut={() => {
            if (hovered.current === index) {
              hovered.current = -1
              lastInteraction.current = performance.now()
            }
            gl.domElement.style.cursor = ''
          }}
        >
          <planeGeometry args={[1, 1, 48, 2]} />
          <shaderMaterial
            ref={(node) => {
              materials.current[index] = node
            }}
            uniforms={uniforms[index]}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            side={DoubleSide}
            depthTest
            depthWrite
          />
        </mesh>
      ))}
    </>
  )
}

export function Spiral3DSlider({
  items,
  className = '',
  radius = 320,
  verticalGap = 85,
  cardWidth = 360,
  cardAspectRatio = 16 / 10,
  autoRotate = true,
  autoSpeed = 0.15,
  scrollSensitivity = 0.0024,
  smoothing = 0.065,
  blurStrength = 1.65,
  bend = 0.15,
  fov = 44,
  ariaLabel = 'Spiral image gallery',
}) {
  const stageRef = useRef(null)
  const targetProgress = useRef(0)
  const previousScroll = useRef(0)
  const lastWheelTime = useRef(0)
  const lastInteraction = useRef(0)
  const visible = useRef(false)
  const reducedMotion = useRef(false)
  const hovered = useRef(-1)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    previousScroll.current = window.scrollY

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncMotionPreference = () => {
      reducedMotion.current = motionQuery.matches
    }
    syncMotionPreference()
    motionQuery.addEventListener('change', syncMotionPreference)

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible.current = Boolean(entry?.isIntersecting)
      },
      { threshold: 0.08 },
    )
    observer.observe(stage)

    const handlePageScroll = () => {
      const scrollY = window.scrollY
      const delta = scrollY - previousScroll.current
      previousScroll.current = scrollY

      if (
        visible.current &&
        hovered.current < 0 &&
        performance.now() - lastWheelTime.current > 80
      ) {
        lastInteraction.current = performance.now()
        const boundedDelta = Math.sign(delta) * Math.min(Math.abs(delta), 160)
        targetProgress.current += boundedDelta * scrollSensitivity
      }
    }

    window.addEventListener('scroll', handlePageScroll, { passive: true })

    return () => {
      observer.disconnect()
      motionQuery.removeEventListener('change', syncMotionPreference)
      window.removeEventListener('scroll', handlePageScroll)
    }
  }, [scrollSensitivity])

  const handleWheel = (event) => {
    lastWheelTime.current = performance.now()
    lastInteraction.current = lastWheelTime.current
    if (hovered.current >= 0) return
    const delta = Math.sign(event.deltaY) * Math.min(Math.abs(event.deltaY), 160)
    targetProgress.current += delta * scrollSensitivity
  }

  if (!items.length) return null

  return (
    <div
      ref={stageRef}
      role="region"
      aria-label={ariaLabel}
      className={className}
      onWheel={handleWheel}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        overflow: 'hidden',
        background: 'transparent',
      }}
    >
      <WebGLErrorBoundary
        fallback={
          <WebGLFallback
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
            }}
          />
        }
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        >
          <Canvas
            dpr={[1, 1.75]}
            camera={{ position: [0, 0, 10], fov, near: 0.1, far: 100 }}
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
            }}
            gl={{
              alpha: true,
              antialias: true,
              powerPreference: 'high-performance',
            }}
          >
            <Suspense fallback={null}>
              <SpiralScene
                items={items}
                targetProgress={targetProgress}
                radius={radius}
                verticalGap={verticalGap}
                cardWidth={cardWidth}
                cardAspectRatio={cardAspectRatio}
                autoRotate={autoRotate}
                autoSpeed={autoSpeed}
                smoothing={smoothing}
                blurStrength={blurStrength}
                bend={bend}
                reducedMotion={reducedMotion}
                lastInteraction={lastInteraction}
                hovered={hovered}
              />
            </Suspense>
          </Canvas>
        </div>
      </WebGLErrorBoundary>
    </div>
  )
}