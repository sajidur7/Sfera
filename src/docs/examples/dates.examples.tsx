import { useState } from 'react';
import { Calendar, DateInput, DateRangeInput, DateTimeInput, Field, Grid, HStack, Text, TimeInput, Timer, Timestamp, VStack, fmtDate, useToast } from '../../sfera';

// #region CalendarExample
export function CalendarExample() {
  const [d, setD] = useState<Date | null>(new Date(2026, 10, 18));
  const [r, setR] = useState<[Date | null, Date | null]>([new Date(2026, 10, 9), new Date(2026, 10, 14)]);
  return (
    <HStack gap={6} wrap justify="center" align="start">
      <VStack gap={2} align="center">
        <Calendar value={d} onChange={setD} min={new Date(2026, 10, 3)} />
        <Text size="sm" tone="muted">{d ? fmtDate(d) : 'Nothing picked'}</Text>
      </VStack>
      <VStack gap={2} align="center">
        <Calendar mode="range" range={r} onRangeChange={setR} />
        <Text size="sm" tone="muted">{r[0] && r[1] ? `${fmtDate(r[0])} – ${fmtDate(r[1])}` : 'Pick an end date'}</Text>
      </VStack>
    </HStack>
  );
}
// #endregion

// #region DateInputs
export function DateInputs() {
  const [due, setDue] = useState<Date | null>(new Date(2026, 10, 28));
  return (
    <Grid min={220} gap={4}>
      <Field label="Due date" help={due ? `Due ${fmtDate(due)}` : 'No due date'}>
        <DateInput value={due} onChange={setDue} />
      </Field>
      <Field label="Report range">
        <DateRangeInput />
      </Field>
      <Field label="Reminder time">
        <TimeInput defaultValue="09:30" />
      </Field>
      <Field label="Meeting">
        <DateTimeInput />
      </Field>
    </Grid>
  );
}
// #endregion

// #region TimestampExample
export function TimestampExample() {
  const now = Date.now();
  return (
    <VStack gap={2}>
      {[2, 47 * 60, 5 * 3600, 3 * 86400, 40 * 86400].map((s) => (
        <HStack key={s} justify="between">
          <Text size="sm">Updated</Text>
          <Timestamp date={new Date(now - s * 1000)} />
        </HStack>
      ))}
      <HStack justify="between">
        <Text size="sm">Created</Text>
        <Timestamp date={new Date(2026, 6, 28, 14, 5)} format="datetime" />
      </HStack>
    </VStack>
  );
}
// #endregion

// #region TimerExample
export function TimerExample() {
  const toast = useToast();
  return (
    <VStack gap={4} align="center">
      <HStack gap={2}>
        <Text size="sm" tone="muted">Stopwatch</Text>
        <Timer />
      </HStack>
      <HStack gap={2}>
        <Text size="sm" tone="muted">Countdown</Text>
        <Timer countdownFrom={10_000} onDone={() => toast({ title: 'Time is up', tone: 'success' })} />
      </HStack>
    </VStack>
  );
}
// #endregion
