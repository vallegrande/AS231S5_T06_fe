
"use client";

import { useState, useEffect } from 'react';

interface ClientTimestampProps {
  date: Date;
  locale?: string | string[];
  options?: Intl.DateTimeFormatOptions;
}

export function ClientTimestamp({ date, locale = [], options = { hour: '2-digit', minute: '2-digit' } }: ClientTimestampProps) {
  const [formattedTime, setFormattedTime] = useState<string | null>(null);

  useEffect(() => {
    // Ensure date is a valid Date object before formatting
    if (date && typeof date.toLocaleTimeString === 'function') {
      setFormattedTime(new Date(date).toLocaleTimeString(locale, options));
    } else if (date) {
      // Attempt to parse if it's a string representation
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        setFormattedTime(parsedDate.toLocaleTimeString(locale, options));
      } else {
        setFormattedTime('--:--'); // Fallback for invalid date
      }
    } else {
       setFormattedTime('--:--'); // Fallback for null/undefined date
    }
  }, [date, locale, options]);

  // Render a placeholder or null while waiting for client-side effect
  if (formattedTime === null) {
    return <span className="text-xs text-gray-500 self-end mt-1">Cargando...</span>;
  }

  return <span className="text-xs text-gray-500 self-end mt-1">{formattedTime}</span>;
}
