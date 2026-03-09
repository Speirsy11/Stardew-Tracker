import { prisma } from '@stardew/db'
import { CalendarView } from '@/components/calendar/calendar-view'

export default async function CalendarPage() {
  const events = await prisma.calendarEvent.findMany({
    orderBy: [{ season: 'asc' }, { day: 'asc' }],
  })

  return (
    <div className="max-w-5xl mx-auto animate-fade-up">
      <div className="mb-6">
        <h1 className="page-header">📅 Calendar</h1>
        <p className="text-sm text-stardew-brown font-semibold">
          All festivals and birthdays across every season. Set your current in-game
          date to see the next 3 upcoming events. Click any event for details.
        </p>
      </div>
      <CalendarView events={events} />
    </div>
  )
}
