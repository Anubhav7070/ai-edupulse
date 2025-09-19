import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Edit3, Plus, Trash2, Users, QrCode, CheckCircle2 } from 'lucide-react';
import { Day, ScheduleItem, useSchedule } from '@/hooks/use-schedule';
import { useAttendance } from '@/hooks/use-attendance';
import QRCode from 'qrcode';

export function TeacherDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('schedule');
  const [editingId, setEditingId] = useState<string | null>(null);
  const { records, getTodayRecords } = useAttendance();
  const { items, add, update, remove, groupedByDay } = useSchedule();
  const uniqueCourses = useMemo(() => Array.from(new Set(items.map(i => i.course))), [items]);
  const [qrCourse, setQrCourse] = useState<string>('');
  const [qrImage, setQrImage] = useState<string>('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  const [form, setForm] = useState<ScheduleItem>({
    id: '',
    course: '',
    day: 'Mon',
    startTime: '09:00',
    endTime: '10:00',
    room: ''
  });

  const resetForm = () => setForm({ id: '', course: '', day: 'Mon', startTime: '09:00', endTime: '10:00', room: '' });

  const saveItem = () => {
    if (!form.course || !form.room || !form.startTime || !form.endTime) {
      toast({ title: 'Missing fields', description: 'Please fill all required fields.', variant: 'destructive' });
      return;
    }
    if (editingId) {
      update(editingId, { ...form, id: undefined as never });
      toast({ title: 'Schedule updated', description: `${form.course} on ${form.day} ${form.startTime}-${form.endTime}` });
    } else {
      const created = add({ course: form.course, day: form.day, startTime: form.startTime, endTime: form.endTime, room: form.room });
      toast({ title: 'Schedule added', description: `${created.course} on ${created.day} ${created.startTime}-${created.endTime}` });
    }
    setEditingId(null);
    resetForm();
  };

  const editItem = (id: string) => {
    const it = items.find(i => i.id === id);
    if (!it) return;
    setEditingId(id);
    setForm({ ...it });
  };

  const deleteItem = (id: string) => {
    remove(id);
    if (editingId === id) {
      setEditingId(null);
      resetForm();
    }
    toast({ title: 'Schedule removed' });
  };

  const generateAttendanceQR = async () => {
    if (!qrCourse) {
      toast({ title: 'Select a course', description: 'Choose a course to generate its QR.', variant: 'destructive' });
      return;
    }
    setIsGeneratingQR(true);
    try {
      const payload = JSON.stringify({ course: qrCourse, timestamp: Date.now(), action: 'checkin' });
      const dataUrl = await QRCode.toDataURL(payload, { width: 300, margin: 2 });
      setQrImage(dataUrl);
      toast({ title: 'QR generated', description: `${qrCourse} QR is ready.` });
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed to generate QR', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setIsGeneratingQR(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-success rounded-lg p-2">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Teacher Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage schedules and classes</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50">
            <TabsTrigger value="schedule" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Schedule</span>
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Create / Edit</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Attendance</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-6">
            {(Object.keys(groupedByDay) as Day[]).map(day => (
              <Card key={day} className="border-0 shadow-medium">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge>{day}</Badge>
                    </div>
                    <CardDescription>All classes for {day}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {groupedByDay[day].length === 0 && (
                      <p className="text-sm text-muted-foreground">No classes scheduled.</p>
                    )}
                    {groupedByDay[day].map(it => (
                      <div key={it.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                        <div>
                          <p className="text-foreground font-semibold">{it.course}</p>
                          <p className="text-sm text-muted-foreground">{it.startTime} - {it.endTime} • Room {it.room}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => editItem(it.id)}>
                            <Edit3 className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deleteItem(it.id)}>
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="manage">
            <Card className="border-0 shadow-medium">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Plus className="h-5 w-5 mr-2" /> {editingId ? 'Edit Schedule' : 'Add Schedule'}
                </CardTitle>
                <CardDescription>Provide details and save</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="course">Course</Label>
                    <Input id="course" placeholder="e.g. Data Structures" value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Day</Label>
                    <Select value={form.day} onValueChange={(v: Day) => setForm(f => ({ ...f, day: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(['Mon','Tue','Wed','Thu','Fri'] as Day[]).map(d => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start">Start Time</Label>
                    <Input id="start" type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end">End Time</Label>
                    <Input id="end" type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="room">Room</Label>
                    <Input id="room" placeholder="e.g. A1" value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button className="bg-gradient-success text-success-foreground" onClick={saveItem}>{editingId ? 'Update' : 'Add'}</Button>
                  <Button variant="outline" onClick={() => { setEditingId(null); resetForm(); }}>Clear</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            <Card className="border-0 shadow-medium">
              <CardHeader>
                <CardTitle className="text-lg">Today's Attendance Records</CardTitle>
                <CardDescription>Students who have checked in today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getTodayRecords().length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No attendance records for today yet.</p>
                  ) : (
                    getTodayRecords().map(record => (
                      <div key={record.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-success rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {record.studentName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{record.studentName}</h4>
                            <p className="text-sm text-muted-foreground">ID: {record.studentId}</p>
                            <p className="text-sm text-muted-foreground">Course: {record.course}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {new Date(record.scannedAt).toLocaleTimeString()}
                          </p>
                          <Badge className="bg-success-light text-success">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Present
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-medium">
              <CardHeader>
                <CardTitle className="text-lg">Generate QR Code</CardTitle>
                <CardDescription>Create QR code for students to scan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label>Select Course</Label>
                    <Select value={qrCourse} onValueChange={setQrCourse}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose course" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueCourses.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button className="w-full bg-gradient-ai text-ai-foreground" onClick={generateAttendanceQR} disabled={!qrCourse || isGeneratingQR}>
                      <QrCode className="mr-2 h-4 w-4" />
                      {isGeneratingQR ? 'Generating...' : 'Generate QR Code'}
                    </Button>
                  </div>
                </div>

                {qrImage && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg text-center">
                    <h4 className="font-semibold mb-3">Attendance QR for {qrCourse}</h4>
                    <div className="bg-white p-4 rounded-lg inline-block shadow-medium">
                      <img src={qrImage} alt="Attendance QR Code" className="w-48 h-48" />
                    </div>
                    <div className="flex gap-2 mt-4 justify-center">
                      <Button variant="outline" size="sm" onClick={() => {
                        const a = document.createElement('a');
                        a.href = qrImage;
                        a.download = `attendance-qr-${qrCourse.replace(/\s+/g,'-').toLowerCase()}.png`;
                        a.click();
                      }}>
                        Download
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setQrImage('')}>
                        Clear
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default TeacherDashboard;


