import { useEffect, useMemo, useRef, useState } from 'preact/hooks'

export function useVirtualWindow(totalCount: number, rowHeight: number, overscan = 8) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(480)
  const [scrollTop, setScrollTop] = useState(0)

  useEffect(() => {
    const element = containerRef.current
    if (!element) {
      return undefined
    }

    const resizeObserver = new ResizeObserver(() => {
      setHeight(element.clientHeight)
    })

    resizeObserver.observe(element)
    setHeight(element.clientHeight)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const metrics = useMemo(() => {
    const visibleCount = Math.ceil(height / rowHeight) + overscan * 2
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
    const end = Math.min(totalCount, start + visibleCount)
    const offsetTop = start * rowHeight
    const totalHeight = totalCount * rowHeight

    return {
      start,
      end,
      offsetTop,
      totalHeight,
    }
  }, [height, overscan, rowHeight, scrollTop, totalCount])

  return {
    containerRef,
    ...metrics,
    onScroll(event: Event) {
      const target = event.currentTarget as HTMLDivElement
      setScrollTop(target.scrollTop)
    },
  }
}