import { createContext, useContext, useMemo, useState } from 'react';

export type Day = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';

export interface ScheduleItem {
  id: string;
  course: string;
  day: Day;
  startTime: string;
  endTime: string;
  room: string;
}

export interface ScheduleContextValue {
  items: ScheduleItem[];
  add: (item: Omit<ScheduleItem, 'id'>) => ScheduleItem;
  update: (id: string, update: Omit<ScheduleItem, 'id'>) => void;
  remove: (id: string) => void;
  groupedByDay: Record<Day, ScheduleItem[]>;
}

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

const generateId = () => `sc_${Math.random().toString(36).slice(2, 10)}`;

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ScheduleItem[]>([
    { id: generateId(), course: 'Computer Science 101', day: 'Mon', startTime: '09:00', endTime: '10:30', room: 'A1' },
    { id: generateId(), course: 'Mathematics 201', day: 'Tue', startTime: '11:00', endTime: '12:30', room: 'B2' },
  ]);

  const add: ScheduleContextValue['add'] = (item) => {
    const created: ScheduleItem = { ...item, id: generateId() };
    setItems(prev => [created, ...prev]);
    return created;
  };

  const update: ScheduleContextValue['update'] = (id, update) => {
    setItems(prev => prev.map(i => i.id === id ? { ...update, id } : i));
  };

  const remove: ScheduleContextValue['remove'] = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const groupedByDay = useMemo(() => {
    const groups: Record<Day, ScheduleItem[]> = { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [] };
    for (const it of items) groups[it.day].push(it);
    (Object.keys(groups) as Day[]).forEach(d => groups[d].sort((a, b) => a.startTime.localeCompare(b.startTime)));
    return groups;
  }, [items]);

  return (
    <ScheduleContext.Provider value={{ items, add, update, remove, groupedByDay }}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error('useSchedule must be used within ScheduleProvider');
  return ctx;
}


