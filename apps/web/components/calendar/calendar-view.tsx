'use client'

import { useState, useMemo } from 'react'
import { CalendarEvent } from '@prisma/client'
import { cn, SEASON_COLORS, SEASON_ICONS } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Calendar, Gift, Star } from 'lucide-react'

type Season = 'Spring' | 'Summer' | 'Fall' | 'Winter'
const SEASONS: Season[] = ['Spring', 'Summer', 'Fall', 'Winter']
const DAYS_IN_SEASON = 28

interface CalendarViewProps {
  events: CalendarEvent[]
}

export function CalendarView({ events }: CalendarViewProps) {
  const [currentSeason, setCurrentSeason] = useState<Season>('Spring')
  const [currentDay, setCurrentDay] = useState<number>(1)
  const [filter, setFilter] = useState<'all' | 'festival' | 'birthday'>('all')
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  const seasonIndex = SEASONS.indexOf(currentSeason)

  const seasonEvents = useMemo(() =>
    events.filter((e) => e.season === currentSeason),
    [events, currentSeason]
  )

  const filteredEvents = useMemo(() =>
    seasonEvents.filter((e) => filter === 'all' || e.type === filter),
    [seasonEvents, filter]
  )

  const eventsByDay = useMemo(() => {
    const map: Record<number, CalendarEvent[]> = {}
    for (const event of filteredEvents) {
      if (!map[event.day]) map[event.day] = []
      map[event.day].push(event)
    }
    return map
  }, [filteredEvents])

  // Next 3 upcoming events from current day/season
  const nextEvents = useMemo(() => {
    const allOrdered: (CalendarEvent & { absoluteDay: number })[] = []
    for (const season of SEASONS) {
      const sIdx = SEASONS.indexOf(season)
      const sEvents = events.filter((e) => e.season === season && (filter === 'all' || e.type === filter))
      for (const e of sEvents) {
        allOrdered.push({ ...e, absoluteDay: sIdx * 28 + e.day })
      }
    }
    allOrdered.sort((a, b) => a.absoluteDay - b.absoluteDay)

    const currentAbsolute = seasonIndex * 28 + currentDay
    const upcoming = allOrdered.filter((e) => e.absoluteDay >= currentAbsolute)
    // Wrap around year
    const wrapped = upcoming.length < 3
      ? [...upcoming, ...allOrdered.slice(0, 3 - upcoming.length)]
      : upcoming

    return wrapped.slice(0, 3)
  }, [events, currentSeason, currentDay, filter, seasonIndex])

  const colors = SEASON_COLORS[currentSeason]

  function prevSeason() {
    setCurrentSeason(SEASONS[(seasonIndex - 1 + 4) % 4])
  }
  function nextSeason() {
    setCurrentSeason(SEASONS[(seasonIndex + 1) % 4])
  }

  return (
    <div className="space-y-6">
      {/* Season navigator */}
      <div className="card-stardew p-4 flex items-center justify-between">
        <button onClick={prevSeason} className="p-2 hover:bg-stardew-brown/10 rounded-lg transition-colors">
          <ChevronLeft size={20} className="text-stardew-brown" />
        </button>

        <div className="flex gap-2 flex-wrap justify-center">
          {SEASONS.map((season) => (
            <button
              key={season}
              onClick={() => setCurrentSeason(season)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all',
                currentSeason === season
                  ? `${SEASON_COLORS[season].bg} ${SEASON_COLORS[season].text} ${SEASON_COLORS[season].border}`
                  : 'border-transparent text-stardew-brown hover:bg-stardew-brown/10'
              )}
            >
              {SEASON_ICONS[season]} {season}
            </button>
          ))}
        </div>

        <button onClick={nextSeason} className="p-2 hover:bg-stardew-brown/10 rounded-lg transition-colors">
          <ChevronRight size={20} className="text-stardew-brown" />
        </button>
      </div>

      {/* Current day picker + filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-stardew-brown" />
          <label className="text-sm font-semibold text-stardew-brown">Current day:</label>
          <select
            value={currentDay}
            onChange={(e) => setCurrentDay(Number(e.target.value))}
            className="rounded-xl border-2 border-stardew-brown/30 bg-white/70 px-3 py-1.5 text-sm text-stardew-brown-dark focus:outline-none focus:border-stardew-brown"
          >
            {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>Day {d}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 ml-auto">
          {(['all', 'festival', 'birthday'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold border-2 capitalize transition-all',
                filter === f
                  ? 'bg-stardew-brown text-stardew-cream border-stardew-brown'
                  : 'border-stardew-brown/30 text-stardew-brown hover:bg-stardew-brown/10 bg-white/50'
              )}
            >
              {f === 'festival' ? '🎉' : f === 'birthday' ? '🎂' : '📅'} {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar grid */}
        <div className="lg:col-span-2 card-stardew overflow-hidden">
          <div className={cn('px-4 py-3 border-b border-stardew-brown/10', colors.bg)}>
            <h2 className={cn('font-pixel text-xs', colors.text)}>
              {SEASON_ICONS[currentSeason]} {currentSeason}
            </h2>
          </div>
          <div className="grid grid-cols-7 gap-px bg-stardew-brown/5 p-1">
            {/* Day headers */}
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-stardew-brown/60 py-2 bg-white/20">
                {d}
              </div>
            ))}
            {/* Day cells */}
            {Array.from({ length: DAYS_IN_SEASON }, (_, i) => i + 1).map((day) => {
              const dayEvents = eventsByDay[day] ?? []
              const isCurrentDay = day === currentDay
              return (
                <div
                  key={day}
                  className={cn(
                    'min-h-[60px] bg-white/30 p-1 cursor-pointer hover:bg-stardew-brown/5 transition-colors relative',
                    isCurrentDay && 'ring-2 ring-stardew-brown ring-inset bg-stardew-brown/5',
                    dayEvents.length > 0 && 'bg-white/50'
                  )}
                  onClick={() => setCurrentDay(day)}
                >
                  <span className={cn(
                    'text-xs font-semibold leading-none',
                    isCurrentDay ? 'text-stardew-brown-dark' : 'text-stardew-brown/60'
                  )}>
                    {day}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.map((event) => (
                      <button
                        key={event.id}
                        className={cn(
                          'w-full text-left text-xs px-1 py-0.5 rounded font-semibold truncate leading-tight',
                          event.type === 'festival'
                            ? 'bg-stardew-gold/30 text-yellow-800'
                            : 'bg-stardew-pink/30 text-pink-800'
                        )}
                        onClick={(e) => { e.stopPropagation(); setSelectedEvent(event) }}
                        title={event.name}
                      >
                        {event.type === 'festival' ? '🎉' : '🎂'} {event.name}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {/* Next 3 events */}
          <div className="card-stardew overflow-hidden">
            <div className="px-4 py-3 bg-stardew-gold/10 border-b border-stardew-brown/10">
              <h3 className="font-pixel text-xs text-stardew-brown-dark">⏭ Next 3 Events</h3>
              <p className="text-xs text-stardew-brown font-semibold mt-0.5">from {currentSeason} Day {currentDay}</p>
            </div>
            <div className="divide-y divide-stardew-brown/5">
              {nextEvents.map((event, i) => (
                <button
                  key={`${event.id}-${i}`}
                  className="w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-stardew-brown/5 transition-colors"
                  onClick={() => setSelectedEvent(event)}
                >
                  <span className="text-lg leading-none mt-0.5">
                    {event.type === 'festival' ? '🎉' : '🎂'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-stardew-brown-dark truncate">{event.name}</p>
                    <Badge variant={event.season as Season}>
                      {SEASON_ICONS[event.season as Season]} {event.season} {event.day}
                    </Badge>
                  </div>
                </button>
              ))}
              {nextEvents.length === 0 && (
                <p className="px-4 py-3 text-sm text-stardew-brown/60 font-semibold">No upcoming events.</p>
              )}
            </div>
          </div>

          {/* Selected event detail */}
          {selectedEvent && (
            <div className="card-stardew p-4 animate-fade-up">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-stardew-brown-dark">{selectedEvent.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={selectedEvent.type === 'festival' ? 'gold' : 'default'}>
                      {selectedEvent.type === 'festival' ? '🎉 Festival' : '🎂 Birthday'}
                    </Badge>
                    <Badge variant={selectedEvent.season as Season}>
                      {SEASON_ICONS[selectedEvent.season as Season]} {selectedEvent.season} {selectedEvent.day}
                    </Badge>
                  </div>
                </div>
                <button
                  className="text-stardew-brown/40 hover:text-stardew-brown text-lg"
                  onClick={() => setSelectedEvent(null)}
                >×</button>
              </div>
              {selectedEvent.description && (
                <p className="text-sm text-stardew-brown font-semibold leading-relaxed">
                  {selectedEvent.description}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
