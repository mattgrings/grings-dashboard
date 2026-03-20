const NOTION_TOKEN = import.meta.env.VITE_NOTION_TOKEN
const DATABASE_ID = import.meta.env.VITE_NOTION_DATABASE_ID

const NOTION_API = 'https://api.notion.com/v1'

export async function createCalendarEntry(data: {
  nome: string
  telefone: string
  dataHora: string
  status: string
}) {
  const response = await fetch(`${NOTION_API}/pages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      parent: { database_id: DATABASE_ID },
      properties: {
        Nome: { title: [{ text: { content: data.nome } }] },
        Telefone: { rich_text: [{ text: { content: data.telefone } }] },
        'Data/Hora': { date: { start: data.dataHora } },
        Status: { select: { name: data.status } },
      },
    }),
  })
  return response.json()
}

export async function updateEntry(pageId: string, data: { status?: string; notas?: string }) {
  const properties: Record<string, unknown> = {}
  if (data.status) {
    properties['Status'] = { select: { name: data.status } }
  }
  if (data.notas) {
    properties['Notas'] = { rich_text: [{ text: { content: data.notas } }] }
  }

  const response = await fetch(`${NOTION_API}/pages/${pageId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({ properties }),
  })
  return response.json()
}

// Mock functions for demo mode
export function mockCreateCalendarEntry(nome: string, dataHora: string) {
  console.log(`[MOCK] Notion entry created: ${nome} at ${dataHora}`)
  return { id: `mock-notion-${Date.now()}`, status: 'created' }
}
