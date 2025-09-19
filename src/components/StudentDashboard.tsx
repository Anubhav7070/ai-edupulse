import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { QrCode, BookOpen, Calendar, CheckCircle2, Clock, Users, Download, Camera } from 'lucide-react';
import { useSchedule } from '@/hooks/use-schedule';
import { useAttendance } from '@/hooks/use-attendance';
import jsQR from 'jsqr';

interface ClassItem {
  id: string;
  name: string;
  schedule: string;
  instructor: string;
  room: string;
  nextSession: string;
}

interface CurriculumItem {
  course: string;
  unit: string;
  status: 'completed' | 'in-progress' | 'upcoming';
}

export function StudentDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('classes');
  const [selectedClassId, setSelectedClassId] = useState('cs101');
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const { addRecord } = useAttendance();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<number | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { items } = useSchedule();
  const classes: ClassItem[] = items.map(it => ({
    id: it.id,
    name: it.course,
    schedule: `${it.day} ${it.startTime}–${it.endTime}`,
    instructor: '—',
    room: `Room ${it.room}`,
    nextSession: `${it.day} ${it.startTime}`
  }));

  const curriculum: CurriculumItem[] = [
    { course: 'Computer Science 101', unit: 'Introduction to Programming', status: 'completed' },
    { course: 'Computer Science 101', unit: 'Data Structures Basics', status: 'in-progress' },
    { course: 'Mathematics 201', unit: 'Linear Algebra Review', status: 'completed' },
    { course: 'Physics 301', unit: 'Classical Mechanics', status: 'upcoming' },
  ];

  const markAttendance = () => {
    const cls = classes.find(c => c.id === selectedClassId);
    if (!cls) return;
    
    addRecord({
      studentName,
      studentId,
      course: cls.name,
      qrData: `qr_${selectedClassId}_${Date.now()}`
    });
    
    toast({
      title: 'Attendance Marked',
      description: `You marked attendance for ${cls.name}.`,
    });
  };

  const stopScan = () => {
    setIsScanning(false);
    if (scanTimerRef.current) {
      cancelAnimationFrame(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopScan();
    };
  }, []);

  const scanQR = async () => {
    if (!studentName || !studentId) {
      toast({
        title: 'Missing Information',
        description: 'Please enter your name and student ID first.',
        variant: 'destructive'
      });
      return;
    }
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsScanning(true);
      const tick = async () => {
        if (!isScanning || !videoRef.current) return;
        try {
          const supported = (window as any).BarcodeDetector;
          if (supported) {
            const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
            const codes = await detector.detect(videoRef.current);
            if (codes && codes.length > 0) {
              const value = (codes[0] as any).rawValue || '';
              if (value) {
                stopScan();
                try {
                  const info = JSON.parse(value);
                  const course = info.course || classes[0]?.name;
                  addRecord({ studentName, studentId, course, qrData: value });
                  toast({ title: 'QR Code Scanned Successfully', description: `Attendance marked for ${course}` });
                } catch {
                  toast({ title: 'Invalid QR Code', description: 'Please scan a valid attendance QR code.', variant: 'destructive' });
                }
                return;
              }
            }
          } else {
            // Fallback: draw frame to canvas and decode via jsQR
            const video = videoRef.current as HTMLVideoElement;
            const canvas = canvasRef.current || document.createElement('canvas');
            if (!canvasRef.current) canvasRef.current = canvas as any;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas not supported');
            const width = video.videoWidth;
            const height = video.videoHeight;
            if (width && height) {
              canvas.width = width;
              canvas.height = height;
              ctx.drawImage(video, 0, 0, width, height);
              const imageData = ctx.getImageData(0, 0, width, height);
              const code = jsQR(imageData.data, width, height);
              if (code && code.data) {
                const value = code.data;
                stopScan();
                try {
                  const info = JSON.parse(value);
                  const course = info.course || classes[0]?.name;
                  addRecord({ studentName, studentId, course, qrData: value });
                  toast({ title: 'QR Code Scanned Successfully', description: `Attendance marked for ${course}` });
                } catch {
                  toast({ title: 'Invalid QR Code', description: 'Please scan a valid attendance QR code.', variant: 'destructive' });
                }
                return;
              }
            }
          }
        } catch {
          // ignore per frame errors
        }
        scanTimerRef.current = requestAnimationFrame(tick);
      };
      scanTimerRef.current = requestAnimationFrame(tick);
    } catch (err: any) {
      console.error(err);
      setCameraError(err?.message || 'Unable to access camera');
      toast({ title: 'Camera error', description: 'Unable to start camera.', variant: 'destructive' });
      stopScan();
    }
  };

  const downloadSchedule = () => {
    const text = classes.map(c => `${c.name} — ${c.schedule} — ${c.room}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'class-schedule.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const statusBadge = (status: CurriculumItem['status']) => {
    if (status === 'completed') return <Badge className="bg-success-light text-success">Completed</Badge>;
    if (status === 'in-progress') return <Badge className="bg-warning/20 text-warning">In Progress</Badge>;
    return <Badge className="bg-muted text-muted-foreground">Upcoming</Badge>;
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
                <h1 className="text-xl font-bold text-foreground">Student Dashboard</h1>
                <p className="text-sm text-muted-foreground">Classes, Curriculum, and Attendance</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={downloadSchedule}>
                <Download className="mr-2 h-4 w-4" />
                Download Schedule
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50">
            <TabsTrigger value="classes" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Classes</span>
            </TabsTrigger>
            <TabsTrigger value="curriculum" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Curriculum</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center space-x-2">
              <QrCode className="h-4 w-4" />
              <span>Attendance</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="classes" className="space-y-6">
            <Card className="border-0 shadow-medium">
              <CardHeader>
                <CardTitle className="text-lg">Your Classes</CardTitle>
                <CardDescription>Upcoming sessions and instructors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {classes.map(cls => (
                    <div key={cls.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                      <div>
                        <p className="text-foreground font-semibold">{cls.name}</p>
                        <p className="text-sm text-muted-foreground">{cls.schedule} • {cls.room}</p>
                        <p className="text-sm text-muted-foreground">Instructor: {cls.instructor}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Next: {cls.nextSession}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="curriculum" className="space-y-6">
            <Card className="border-0 shadow-medium">
              <CardHeader>
                <CardTitle className="text-lg">Curriculum Progress</CardTitle>
                <CardDescription>Track your completed and upcoming units</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {curriculum.map((item, idx) => (
                    <div key={`${item.course}-${idx}`} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                      <div>
                        <p className="text-foreground font-semibold">{item.course}</p>
                        <p className="text-sm text-muted-foreground">{item.unit}</p>
                      </div>
                      <div>
                        {statusBadge(item.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-medium">
                <CardHeader>
                  <CardTitle className="text-lg">Student Information</CardTitle>
                  <CardDescription>Enter your details for attendance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentName">Full Name</Label>
                    <Input 
                      id="studentName" 
                      placeholder="Enter your full name" 
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID</Label>
                    <Input 
                      id="studentId" 
                      placeholder="Enter your student ID" 
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-medium">
                <CardHeader>
                  <CardTitle className="text-lg">QR Code Scanner</CardTitle>
                  <CardDescription>Scan QR code generated by teacher</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg text-center space-y-4">
                    <div className="relative mx-auto w-full max-w-sm rounded overflow-hidden bg-black">
                      <video ref={videoRef} className="w-full h-64 object-cover" playsInline muted />
                    </div>
                    {cameraError && (
                      <p className="text-sm text-destructive">{cameraError}</p>
                    )}
                    <div className="flex gap-2">
                      {!isScanning ? (
                        <Button className="w-full bg-gradient-ai text-ai-foreground" onClick={scanQR}>
                          <Camera className="mr-2 h-4 w-4" />
                          Start Scanner
                        </Button>
                      ) : (
                        <Button variant="outline" className="w-full" onClick={() => stopScan()}>
                          Stop Scanner
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Tip: Ensure sufficient lighting and hold steady for a moment.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-medium">
              <CardHeader>
                <CardTitle className="text-lg">Manual Attendance</CardTitle>
                <CardDescription>Select your class and confirm check-in</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full bg-gradient-analytics text-white" onClick={markAttendance}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark Attendance
                </Button>

                <p className="text-xs text-muted-foreground">
                  Note: QR-based verification is preferred for accuracy.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default StudentDashboard;


