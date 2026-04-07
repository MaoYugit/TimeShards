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
  let lastZOrderKey = ''

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
    missing.forEach((e) => {
      const h = entryHash(e.id)
      const u1 = (h % 10000) / 10000
      const u2 = ((h >>> 14) % 10000) / 10000
      bodies[e.id] = {
        x: 0.08 * sw + u1 * 0.84 * sw,
        y: 0.12 * sh + u2 * 0.76 * sh,
        vx: 0,
        vy: 0,
        halfW: 88,
        halfH: 58,
        phase: (h % 628) / 100,
        om: (0.28 + (h % 45) / 260) * 0.72,
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

  function syncDOM(updateZ = false) {
    const entries = sortedEntries.value
    const topZ = entries.length + 100
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i]!
      const el = bubbleRoots[e.id]
      const p = bodies[e.id]
      if (el && p) {
        // transform 比 left/top 更少触发布局，动画更流畅
        el.style.transform = `translate3d(${p.x - p.halfW}px, ${p.y - p.halfH}px, 0)`
        if (updateZ) {
          // sortedEntries 已按 createdAt 降序：越新越靠前 -> z-index 越高
          el.style.zIndex = String(topZ - i)
          el.style.willChange = 'transform'
        }
      }
    }
  }

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

    /** 漂游强度（略低 = 更慢、更稳） */
    const drift = 0.038
    const moveScale = 26
    for (const p of list) {
      p.vx += Math.sin(t * p.om * 0.65 + p.phase) * drift * dt * 60
      p.vy += Math.cos(t * p.om * 0.57 + p.phase * 1.2) * drift * 0.9 * dt * 60
      p.vx *= 0.992
      p.vy *= 0.992
      p.x += p.vx * dt * moveScale
      p.y += p.vy * dt * moveScale
    }

    /** 速度上限，保证观感轻柔 */
    const maxSpeed = 1.45
    for (const p of list) {
      const sp = Math.hypot(p.vx, p.vy)
      if (sp > maxSpeed) {
        const k = maxSpeed / sp
        p.vx *= k
        p.vy *= k
      }
    }

    wallClamp(list, sw, sh)

    syncDOM(false)
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
      const stage = floatStageRef.value
      if (!stage) return
      const sw = stage.clientWidth
      const sh = stage.clientHeight
      const list = sortedEntries.value.map((e) => bodies[e.id]).filter((b): b is Body => !!b)
      wallClamp(list, sw, sh)
      syncDOM()
    })
    resizeObs.observe(el)
  }

  function layoutAndRelax() {
    ensureBodies()
    const zOrderKey = sortedEntries.value.map((e) => e.id).join(',')
    const needUpdateZ = zOrderKey !== lastZOrderKey
    if (needUpdateZ) lastZOrderKey = zOrderKey
    nextTick(() => {
      requestAnimationFrame(() => {
        measureHalfSizes()
        const stage = floatStageRef.value
        if (!stage) return
        const sw = stage.clientWidth
        const sh = stage.clientHeight
        const list = sortedEntries.value.map((e) => bodies[e.id]).filter((b): b is Body => !!b)
        wallClamp(list, sw, sh)
        syncDOM(needUpdateZ)
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
