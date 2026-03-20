const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI

export function getAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID || '',
    redirect_uri: REDIRECT_URI || '',
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar.events',
    access_type: 'offline',
    prompt: 'consent',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export async function createEvent(
  accessToken: string,
  event: {
    summary: string
    description: string
    startDateTime: string
    endDateTime: string
  }
) {
  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: event.summary,
        description: event.description,
        start: { dateTime: event.startDateTime, timeZone: 'America/Sao_Paulo' },
        end: { dateTime: event.endDateTime, timeZone: 'America/Sao_Paulo' },
      }),
    }
  )
  return response.json()
}

export async function listEvents(accessToken: string, timeMin: string, timeMax: string) {
  const params = new URLSearchParams({ timeMin, timeMax, singleEvents: 'true', orderBy: 'startTime' })
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  return response.json()
}

export async function deleteEvent(accessToken: string, eventId: string) {
  await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )
}

// Mock functions for demo mode
export function mockCreateEvent(leadName: string, dateTime: string) {
  console.log(`[MOCK] Google Calendar event created: Consulta - ${leadName} at ${dateTime}`)
  return { id: `mock-gcal-${Date.now()}`, status: 'confirmed' }
}
