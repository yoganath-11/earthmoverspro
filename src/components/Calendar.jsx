import { useState } from 'react';
import './Calendar.css';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function toIso(date) {
  return date.toISOString().split('T')[0];
}

function isBefore(a, b) {
  return new Date(a) < new Date(b);
}

function isBetween(d, start, end) {
  if (!start || !end) return false;
  const date = new Date(d);
  const s = new Date(start < end ? start : end);
  const e = new Date(start < end ? end : start);
  return date > s && date < e;
}

export default function Calendar({ blockedDates = [], onRangeChange, selectedStart, selectedEnd }) {
  const today = new Date();
  today.setHours(0,0,0,0);

  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [hoverDate, setHoverDate] = useState(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function prevMonth() {
    setViewDate(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    setViewDate(new Date(year, month + 1, 1));
  }

  function handleDayClick(dateStr, blocked, past) {
    if (blocked || past) return;
    if (!selectedStart || (selectedStart && selectedEnd)) {
      onRangeChange(dateStr, null);
    } else {
      if (dateStr === selectedStart) {
        onRangeChange(null, null);
        return;
      }
      const start = selectedStart < dateStr ? selectedStart : dateStr;
      const end = selectedStart < dateStr ? dateStr : selectedStart;
      // Check if any blocked dates fall in range
      const curr = new Date(start);
      const endDate = new Date(end);
      while (curr <= endDate) {
        if (blockedDates.includes(toIso(curr))) {
          onRangeChange(dateStr, null);
          return;
        }
        curr.setDate(curr.getDate() + 1);
      }
      onRangeChange(start, end);
    }
  }

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(year, month, d));
  }

  const displayEnd = selectedStart && !selectedEnd && hoverDate ? hoverDate : selectedEnd;

  return (
    <div className="calendar">
      <div className="cal-header">
        <button className="cal-nav" onClick={prevMonth}>‹</button>
        <h4>{MONTHS[month]} {year}</h4>
        <button className="cal-nav" onClick={nextMonth}>›</button>
      </div>
      <div className="cal-weekdays">
        {WEEKDAYS.map(d => <div key={d} className="cal-weekday">{d}</div>)}
      </div>
      <div className="cal-days">
        {days.map((date, idx) => {
          if (!date) return <div key={idx} className="cal-day empty" />;
          const dateStr = toIso(date);
          const isPast = date < today;
          const isBlocked = blockedDates.includes(dateStr);
          const isStart = dateStr === selectedStart;
          const isEnd = dateStr === (selectedEnd || displayEnd);
          const inRange = isBetween(dateStr, selectedStart, displayEnd);

          let cls = 'cal-day';
          if (isPast) cls += ' past';
          else if (isBlocked) cls += ' blocked';
          else if (isStart || isEnd) cls += ' selected';
          else if (inRange) cls += ' in-range';

          return (
            <div
              key={dateStr}
              className={cls}
              onClick={() => handleDayClick(dateStr, isBlocked, isPast)}
              onMouseEnter={() => selectedStart && !selectedEnd && setHoverDate(dateStr)}
              onMouseLeave={() => setHoverDate(null)}
              title={isBlocked ? 'Not available' : dateStr}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>
      <div className="cal-legend">
        <div className="cal-legend-item">
          <div className="cal-legend-dot" style={{background:'var(--amber)'}} />
          <span>Selected</span>
        </div>
        <div className="cal-legend-item">
          <div className="cal-legend-dot" style={{background:'var(--amber-glow)',border:'1px solid var(--border-amber)'}} />
          <span>Range</span>
        </div>
        <div className="cal-legend-item">
          <div className="cal-legend-dot" style={{background:'rgba(239,68,68,0.15)'}} />
          <span>Booked</span>
        </div>
      </div>
    </div>
  );
}
