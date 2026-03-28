import { render } from 'preact'
import { registerSW } from 'virtual:pwa-register'

import '@fontsource/manrope/latin-400.css'
import '@fontsource/manrope/latin-600.css'
import '@fontsource/syncopate/latin-400.css'
import '@fontsource/syncopate/latin-700.css'

import './index.css'
import { App } from './app.tsx'
import { startPerformanceObservers } from './lib/perf'

startPerformanceObservers()

render(<App />, document.getElementById('app')!)

registerSW({
	immediate: true,
})
