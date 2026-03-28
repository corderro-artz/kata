type Task = () => void

const pendingTasks: Task[] = []
let rICHandle: number | null = null
let rAFHandle: number | null = null

const hasRIC = typeof requestIdleCallback === 'function'

function processIdleTasks(deadline: IdleDeadline): void {
  while (pendingTasks.length > 0 && deadline.timeRemaining() > 1) {
    const task = pendingTasks.shift()!
    task()
  }

  rICHandle = null

  if (pendingTasks.length > 0) {
    scheduleIdle()
  }
}

function processIdleFallback(): void {
  const start = performance.now()
  while (pendingTasks.length > 0 && performance.now() - start < 4) {
    const task = pendingTasks.shift()!
    task()
  }

  rAFHandle = null

  if (pendingTasks.length > 0) {
    scheduleIdle()
  }
}

function scheduleIdle(): void {
  if (hasRIC) {
    if (rICHandle === null) {
      rICHandle = requestIdleCallback(processIdleTasks, { timeout: 100 })
    }
  } else {
    if (rAFHandle === null) {
      rAFHandle = requestAnimationFrame(processIdleFallback)
    }
  }
}

/** Schedule a low-priority task to run during idle time. */
export function scheduleIdleTask(task: Task): void {
  pendingTasks.push(task)
  scheduleIdle()
}

/** Batch a callback on the next animation frame, deduplicating by key. */
const batchedCallbacks = new Map<string, Task>()
let batchRafHandle: number | null = null

function flushBatch(): void {
  batchRafHandle = null
  const tasks = Array.from(batchedCallbacks.values())
  batchedCallbacks.clear()
  for (const task of tasks) {
    task()
  }
}

export function batchOnFrame(key: string, task: Task): void {
  batchedCallbacks.set(key, task)
  if (batchRafHandle === null) {
    batchRafHandle = requestAnimationFrame(flushBatch)
  }
}
