import { nextTick, onBeforeUnmount, onMounted, watch, type ComputedRef, type Ref } from 'vue'
import type { GuestbookEntry } from '@/stores/guestbook'

type Body = {
  x: number
  y: number
  vx: number
  vy: number
  halfW: number
  halfH: number
  phase: number
  om: number
}

function entryHash(id: string) {
  let h = 2166136261
  for (let i = 0; i < id.length; i++) {
    h = Math.imul(h, 16777619) ^ id.charCodeAt(i)
  }
  return h >>> 0
}

function zIndexFor(id: string) {
  return 1 + (entryHash(id) % 10)
}

export function useGuestbookBubblePhysics(
  floatStageRef: Ref<HTMLElement | null>,
  sortedEntries: ComputedRef<GuestbookEntry[]>,
) {
  const bubbleRoots: Record<string, HTMLElement> = {}
  const bodies: Record<string, Body> = {}

  let raf = 0
  let lastNow = 0
  let running = false
  let resizeObs: ResizeObserver | null = null

  function setBubbleRoot(id: string, el: unknown) {
    if (el instanceof HTMLElement) bubbleRoots[id] = el
    else delete bubbleRoots[id]
  }

  function ensureBodies() {
    const stage = floatStageRef.value
    if (!stage) return
    const sw = stage.clientWidth
    const sh = stage.clientHeight
    if (sw < 8 || sh < 8) return

    const entries = sortedEntries.value
    const n = entries.length

    for (const k of Object.keys(bodies)) {
      if (!entries.some((e) => e.id === k)) delete bodies[k]
    }

    const missing = entries.filter((e) => !bodies[e.id])
    const idxBase = entries.length - missing.length
    missing.forEach((e, mi) => {
      const i = idxBase + mi
      const golden = Math.PI * (3 - Math.sqrt(5))
      const theta = (i + 1) * golden
      const r =
        0.1 * Math.min(sw, sh) +
        Math.sqrt((mi + 1) / Math.max(n, 1)) * 0.34 * Math.min(sw, sh)
      const h = entryHash(e.id)
      bodies[e.id] = {
        x: sw / 2 + Math.cos(theta) * r,
        y: sh / 2 + Math.sin(theta) * r * 0.92,
        vx: 0,
        vy: 0,
        halfW: 88,
        halfH: 58,
        phase: (h % 628) / 100,
        om: 0.32 + (h % 45) / 220,
      }
    })
  }

  function measureHalfSizes() {
    for (const e of sortedEntries.value) {
      const root = bubbleRoots[e.id]
      const p = bodies[e.id]
      if (!root || !p) continue
      const bubble = root.querySelector('.float-bubble')
      const el = bubble instanceof HTMLElement ? bubble : root
      const br = el.getBoundingClientRect()
      if (br.width < 4 || br.height < 4) continue
      p.halfW = br.width / 2 + 10
      p.halfH = br.height / 2 + 10
    }
  }

  function wallClamp(list: Body[], sw: number, sh: number) {
    for (const p of list) {
      const minX = p.halfW
      const maxX = sw - p.halfW
      const minY = p.halfH
      const maxY = sh - p.halfH
      if (p.x < minX) {
        p.x = minX
        p.vx *= -0.35
      }
      if (p.x > maxX) {
        p.x = maxX
        p.vx *= -0.35
      }
      if (p.y < minY) {
        p.y = minY
        p.vy *= -0.35
      }
      if (p.y > maxY) {
        p.y = maxY
        p.vy *= -0.35
      }
    }
  }

  function resolvePairs(list: Body[]) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i]!
        const b = list[j]!
        const dx = b.x - a.x
        const dy = b.y - a.y
        const overlapX = a.halfW + b.halfW - Math.abs(dx)
        const overlapY = a.halfH + b.halfH - Math.abs(dy)
        if (overlapX <= 0 || overlapY <= 0) continue

        const nx = dx >= 0 ? 1 : -1
        const ny = dy >= 0 ? 1 : -1

        if (overlapX < overlapY) {
          const push = overlapX * 0.52 + 0.5
          a.x -= nx * push * 0.5
          b.x += nx * push * 0.5
          const imp = Math.min(0.55, 0.09 + overlapX * 0.04)
          a.vx -= nx * imp
          b.vx += nx * imp
        } else {
          const push = overlapY * 0.52 + 0.5
          a.y -= ny * push * 0.5
          b.y += ny * push * 0.5
          const imp = Math.min(0.55, 0.09 + overlapY * 0.04)
          a.vy -= ny * imp
          b.vy += ny * imp
        }
      }
    }
  }

  function relaxStatic(iterations: number) {
    const stage = floatStageRef.value
    if (!stage) return
    const sw = stage.clientWidth
    const sh = stage.clientHeight
    const list = sortedEntries.value.map((e) => bodies[e.id]).filter((b): b is Body => !!b)
    for (let k = 0; k < iterations; k++) {
      wallClamp(list, sw, sh)
      resolvePairs(list)
    }
    wallClamp(list, sw, sh)
  }

  function syncDOM() {
    for (const e of sortedEntries.value) {
      const el = bubbleRoots[e.id]
      const p = bodies[e.id]
      if (el && p) {
        el.style.left = `${p.x}px`
        el.style.top = `${p.y}px`
        el.style.zIndex = String(zIndexFor(e.id))
      }
    }
  }

  let measureTicker = 0

  function tick(now: number) {
    if (!running) return
    raf = requestAnimationFrame(tick)

    const stage = floatStageRef.value
    const entries = sortedEntries.value
    if (!stage || entries.length === 0) return

    const dt = lastNow ? Math.min(0.045, (now - lastNow) / 1000) : 0.016
    lastNow = now
    const t = now / 1000
    const sw = stage.clientWidth
    const sh = stage.clientHeight
    if (sw < 8 || sh < 8) return

    const list = entries.map((e) => bodies[e.id]).filter((b): b is Body => !!b)
    if (list.length === 0) return

    measureTicker++
    if (measureTicker % 24 === 0) measureHalfSizes()

    const drift = 0.11
    for (const p of list) {
      p.vx += Math.sin(t * p.om + p.phase) * drift * dt * 60
      p.vy += Math.cos(t * p.om * 0.88 + p.phase * 1.2) * drift * 0.9 * dt * 60
      p.vx *= 0.987
      p.vy *= 0.987
      p.x += p.vx * dt * 52
      p.y += p.vy * dt * 52
    }

    wallClamp(list, sw, sh)
    for (let k = 0; k < 5; k++) resolvePairs(list)
    wallClamp(list, sw, sh)

    syncDOM()
  }

  function startLoop() {
    if (running) return
    running = true
    lastNow = 0
    raf = requestAnimationFrame(tick)
  }

  function stopLoop() {
    running = false
    cancelAnimationFrame(raf)
    raf = 0
  }

  function bindResize(el: HTMLElement | null) {
    resizeObs?.disconnect()
    resizeObs = null
    if (!el) return
    resizeObs = new ResizeObserver(() => {
      measureHalfSizes()
      relaxStatic(28)
      syncDOM()
    })
    resizeObs.observe(el)
  }

  function layoutAndRelax() {
    ensureBodies()
    nextTick(() => {
      requestAnimationFrame(() => {
        measureHalfSizes()
        relaxStatic(60)
        syncDOM()
      })
    })
  }

  watch(
    () => sortedEntries.value.map((e) => e.id).join(','),
    () => layoutAndRelax(),
    { flush: 'post' },
  )

  watch(floatStageRef, (el) => bindResize(el), { flush: 'post', immediate: true })

  onMounted(() => {
    startLoop()
    nextTick(() => layoutAndRelax())
  })

  onBeforeUnmount(() => {
    stopLoop()
    resizeObs?.disconnect()
    resizeObs = null
  })

  return { setBubbleRoot }
}
