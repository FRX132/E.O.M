/**
 * Parser for iCalendar (.ics) files to convert events into E.O.M Timetable Blocks
 */

const DAY_MAP = {
  MO: 'Monday',
  TU: 'Tuesday',
  WE: 'Wednesday',
  TH: 'Thursday',
  FR: 'Friday',
  SA: 'Saturday',
  SU: 'Sunday'
};

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const parseICSDate = (dateStr) => {
  if (!dateStr) return null;
  // Handle forms: 20261012T090000Z, 20261012T090000, 20261012, TZID=...:20261012T090000
  const cleanStr = dateStr.includes(':') ? dateStr.split(':').pop() : dateStr;
  const match = cleanStr.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?Z?)?/);
  if (!match) return null;
  const [, year, month, day, hours = '09', minutes = '00', seconds = '00'] = match;
  return new Date(Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), parseInt(hours, 10), parseInt(minutes, 10), parseInt(seconds, 10)));
};

const formatTime = (date) => {
  if (!date || isNaN(date.getTime())) return '09:00';
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

export const parseICSContent = (icsText) => {
  const blocks = [];
  const lines = icsText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  
  // Unfold lines that start with space or tab
  const unfoldedLines = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if ((line.startsWith(' ') || line.startsWith('\t')) && unfoldedLines.length > 0) {
      unfoldedLines[unfoldedLines.length - 1] += line.slice(1);
    } else {
      unfoldedLines.push(line);
    }
  }

  let inEvent = false;
  let currentEvent = {};

  for (const line of unfoldedLines) {
    if (line.startsWith('BEGIN:VEVENT')) {
      inEvent = true;
      currentEvent = {};
      continue;
    }
    if (line.startsWith('END:VEVENT')) {
      inEvent = false;
      if (currentEvent.summary) {
        const startDate = parseICSDate(currentEvent.dtstart);
        const endDate = parseICSDate(currentEvent.dtend);

        let day = 'Monday';
        if (currentEvent.rrule) {
          const byDayMatch = currentEvent.rrule.match(/BYDAY=([A-Z,]+)/);
          if (byDayMatch) {
            const firstDay = byDayMatch[1].split(',')[0];
            day = DAY_MAP[firstDay] || 'Monday';
          }
        } else if (startDate && !isNaN(startDate.getTime())) {
          day = WEEKDAY_NAMES[startDate.getDay()];
        }

        const startFormatted = startDate ? formatTime(startDate) : '09:00';
        let endFormatted = endDate ? formatTime(endDate) : '10:00';
        if (startFormatted === endFormatted) {
          const [sh, sm] = startFormatted.split(':').map(Number);
          endFormatted = `${String((sh + 1) % 24).padStart(2, '0')}:${String(sm).padStart(2, '0')}`;
        }

        blocks.push({
          id: window.crypto?.randomUUID ? window.crypto.randomUUID() : Date.now().toString() + Math.random().toString(36).substr(2, 5),
          title: currentEvent.summary || 'Imported Event',
          notes: currentEvent.description || '',
          url: currentEvent.url || '',
          day: day,
          startTime: startFormatted,
          endTime: endFormatted,
          color: 'blue',
          habitId: null,
          isReminder: false,
          completed: false
        });
      }
      continue;
    }

    if (!inEvent) continue;

    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const propKey = line.slice(0, colonIdx).split(';')[0].toUpperCase();
    const propVal = line.slice(colonIdx + 1);

    if (propKey === 'SUMMARY') currentEvent.summary = propVal.replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\n/g, '\n');
    else if (propKey === 'DESCRIPTION') currentEvent.description = propVal.replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\n/g, '\n');
    else if (propKey === 'DTSTART') currentEvent.dtstart = line;
    else if (propKey === 'DTEND') currentEvent.dtend = line;
    else if (propKey === 'RRULE') currentEvent.rrule = propVal;
    else if (propKey === 'URL') currentEvent.url = propVal;
  }

  return blocks;
};
