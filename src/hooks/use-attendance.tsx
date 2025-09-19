import { createContext, useContext, useMemo, useState } from 'react';

export interface AttendanceRecord {
  id: string;
  studentName: string;
  studentId: string;
  course: string;
  scannedAt: string; // ISO timestamp
  qrData?: string;
}

export interface AttendanceContextValue {
  records: AttendanceRecord[];
  addRecord: (record: Omit<AttendanceRecord, 'id' | 'scannedAt'>) => AttendanceRecord;
  getRecordsByCourse: (course: string) => AttendanceRecord[];
  getTodayRecords: () => AttendanceRecord[];
}

const AttendanceContext = createContext<AttendanceContextValue | null>(null);

const generateId = () => `att_${Math.random().toString(36).slice(2, 10)}`;

export function AttendanceProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  const addRecord: AttendanceContextValue['addRecord'] = (record) => {
    const newRecord: AttendanceRecord = {
      ...record,
      id: generateId(),
      scannedAt: new Date().toISOString()
    };
    setRecords(prev => [newRecord, ...prev]);
    return newRecord;
  };

  const getRecordsByCourse = (course: string) => {
    return records.filter(r => r.course === course);
  };

  const getTodayRecords = () => {
    const today = new Date().toDateString();
    return records.filter(r => new Date(r.scannedAt).toDateString() === today);
  };

  return (
    <AttendanceContext.Provider value={{ records, addRecord, getRecordsByCourse, getTodayRecords }}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const ctx = useContext(AttendanceContext);
  if (!ctx) throw new Error('useAttendance must be used within AttendanceProvider');
  return ctx;
}
