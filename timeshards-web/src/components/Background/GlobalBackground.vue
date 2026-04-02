<template>
  <div class="background-wrapper" aria-hidden="true">
    <!-- <div ref="threeContainer" class="three-container"></div> -->
    <vue-particles
      id="tsparticles"
      :options="particleOptions"
      class="particles-container"
      @particlesLoaded="onParticlesLoaded"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'

interface ShardUserData {
  rotationSpeed: { x: number; y: number }
  floatSpeed: number
}

const threeContainer = ref<HTMLDivElement | null>(null)

let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let animationFrameId: number | null = null

let shards: Array<THREE.Mesh<THREE.TetrahedronGeometry, THREE.MeshPhongMaterial>> = []
let shardGeometry: THREE.TetrahedronGeometry | null = null
let shardMaterial: THREE.MeshPhongMaterial | null = null

const isCoarsePointer = ref(false)

const particleOptions = computed(() => ({
  background: { color: { value: 'transparent' } },
  fpsLimit: 120,
  detectRetina: true,
  interactivity: {
    events: {
      onClick: { enable: true, mode: 'push' },
      onHover: { enable: true, mode: 'repulse' },
      resize: true,
    },
    modes: {
      push: { quantity: 4 },
      repulse: { distance: 200, duration: 0.4 },
    },
  },
  particles: {
    color: { value: '#00f3ff' },
    links: {
      color: '#00f3ff',
      distance: 150,
      enable: true,
      opacity: 0.2,
      width: 1,
    },
    move: {
      direction: 'none',
      enable: true,
      outModes: { default: 'bounce' },
      random: false,
      speed: 1,
      straight: false,
    },
    number: { density: { enable: true, area: 800 }, value: isCoarsePointer.value ? 110 : 240 },
    opacity: { value: 0.3 },
    shape: { type: 'circle' },
    size: { value: { min: 1, max: 3 } },
  },
}))

type ParticlesLike = {
  particles?: {
    count?: number
    removeQuantity?: (quantity: number) => void
  }
}

const particlesContainer = ref<ParticlesLike | null>(null)
let particlesCleanupTimer: number | null = null

function getBaseCount() {
  return isCoarsePointer.value ? 110 : 240
}

function onParticlesLoaded(container?: unknown) {
  particlesContainer.value = (container as ParticlesLike) ?? null

  // 渐进式清理：只清理 “push” 点击产生的额外粒子，避免连线无限变多
  if (particlesCleanupTimer != null) window.clearInterval(particlesCleanupTimer)

  particlesCleanupTimer = window.setInterval(() => {
    const c = particlesContainer.value
    const count: number | undefined = c?.particles?.count
    if (typeof count !== 'number') return
    const BASE_COUNT = getBaseCount()
    if (count <= BASE_COUNT) return

    const extra = count - BASE_COUNT
    const remove = Math.min(3, extra) // 小步移除，做到“慢慢消失”
    c?.particles?.removeQuantity?.(remove)
  }, 450)
}

function initThree() {
  if (!threeContainer.value) return

  const width = window.innerWidth
  const height = window.innerHeight

  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x000000, 0.002)

  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
  camera.position.z = 50

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  threeContainer.value.appendChild(renderer.domElement)

  const ambientLight = new THREE.AmbientLight(0x404040)
  scene.add(ambientLight)
  const pointLight = new THREE.PointLight(0x00f3ff, 1, 100)
  pointLight.position.set(10, 10, 10)
  scene.add(pointLight)

  shardGeometry = new THREE.TetrahedronGeometry(1, 0)
  shardMaterial = new THREE.MeshPhongMaterial({
    color: 0x00f3ff,
    flatShading: true,
    transparent: true,
    opacity: 0.6,
    shininess: 100,
  })

  shards = []
  for (let i = 0; i < 50; i++) {
    const shard = new THREE.Mesh(shardGeometry, shardMaterial)

    shard.position.x = (Math.random() - 0.5) * 100
    shard.position.y = (Math.random() - 0.5) * 100
    shard.position.z = (Math.random() - 0.5) * 50
    shard.rotation.x = Math.random() * Math.PI
    shard.rotation.y = Math.random() * Math.PI
    shard.scale.setScalar(Math.random() * 2 + 0.5)

    shard.userData = {
      rotationSpeed: { x: (Math.random() - 0.5) * 0.02, y: (Math.random() - 0.5) * 0.02 },
      floatSpeed: (Math.random() - 0.5) * 0.05,
    } satisfies ShardUserData

    scene.add(shard)
    shards.push(shard)
  }

  animate()
}

function animate() {
  animationFrameId = window.requestAnimationFrame(animate)
  if (!renderer || !scene || !camera) return

  for (const shard of shards) {
    const data = shard.userData as ShardUserData
    shard.rotation.x += data.rotationSpeed.x
    shard.rotation.y += data.rotationSpeed.y
    shard.position.y += data.floatSpeed

    if (shard.position.y > 50) shard.position.y = -50
    if (shard.position.y < -50) shard.position.y = 50
  }

  renderer.render(scene, camera)
}

function onWindowResize() {
  if (!camera || !renderer) return
  const width = window.innerWidth
  const height = window.innerHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

function disposeThree() {
  if (animationFrameId != null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }

  window.removeEventListener('resize', onWindowResize)

  for (const shard of shards) {
    scene?.remove(shard)
  }
  shards = []

  shardGeometry?.dispose()
  shardGeometry = null

  shardMaterial?.dispose()
  shardMaterial = null

  if (renderer) {
    const canvas = renderer.domElement
    renderer.dispose()
    renderer = null
    canvas.parentElement?.removeChild(canvas)
  }

  scene = null
  camera = null
}

onMounted(() => {
  const mq = window.matchMedia?.('(pointer: coarse)')
  if (mq) {
    isCoarsePointer.value = mq.matches
    const onChange = (e: MediaQueryListEvent) => {
      isCoarsePointer.value = e.matches
    }
    mq.addEventListener?.('change', onChange)
  }

  initThree()
  window.addEventListener('resize', onWindowResize)
})

onBeforeUnmount(() => {
  if (particlesCleanupTimer != null) {
    window.clearInterval(particlesCleanupTimer)
    particlesCleanupTimer = null
  }
  disposeThree()
})
</script>

<style scoped>
.background-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* 勿用负 z-index：会落到 html/body 实色背景之下导致「背景没了」 */
  z-index: 0;
  overflow: hidden;
  background: radial-gradient(circle at center, var(--global-bg-center) 0%, var(--global-bg-edge) 100%);
  pointer-events: none;
}

.three-container {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.particles-container {
  position: absolute;
  inset: 0;
  z-index: 1;
}
</style>
