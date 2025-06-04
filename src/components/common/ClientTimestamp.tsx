
"use client";

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ClientTimestampProps {
  date: Date;
  locale?: string | string[];
  options?: Intl.DateTimeFormatOptions;
  className?: string;
}

export function ClientTimestamp({ date, locale = [], options = { hour: '2-digit', minute: '2-digit' }, className }: ClientTimestampProps) {
  const [formattedTime, setFormattedTime] = useState<string | null>(null);

  useEffect(() => {
    // Ensure date is a valid Date object before formatting
    if (date && typeof date.toLocaleTimeString === 'function') {
      setFormattedTime(new Date(date).toLocaleTimeString(locale, options));
    } else if (date) {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        setFormattedTime(parsedDate.toLocaleTimeString(locale, options));
      } else {
        setFormattedTime('Inválido'); 
      }
    } else {
       setFormattedTime('--:--'); 
    }
  }, [date, locale, options]);

  if (formattedTime === null) {
    return <span className={cn("text-xs text-muted-foreground/70 self-end mt-1", className)}>...</span>;
  }

  return <span className={cn("text-xs text-muted-foreground self-end mt-1 font-code", className)}>{formattedTime}</span>;
}
