import { serializeFormat } from '../lib/convert'
import type { ExportRequest, ExportResponse } from '../lib/types'

const scope = self as unknown as Worker

scope.onmessage = (event: MessageEvent<ExportRequest>) => {
  void handleRequest(event.data)
}

async function handleRequest(request: ExportRequest): Promise<void> {
  try {
    const { text, notes } = await serializeFormat(
      request.document.structuredData,
      request.format,
      {
        sourceName: request.document.sourceName,
        sourceFormat: request.document.format,
        sourceText: request.document.text,
      },
    )

    post({ type: 'exported', format: request.format, text, notes })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown export error'
    post({ type: 'error', message })
  }
}

function post(message: ExportResponse): void {
  scope.postMessage(message)
}
