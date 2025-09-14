import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';
import { 
  QrCode, 
  Camera, 
  Users, 
  Calendar,
  Clock,
  TrendingUp,
  Download,
  UserCheck,
  UserX,
  BarChart3
} from 'lucide-react';

interface AttendanceRecord {
  id: string;
  studentName: string;
  studentId: string;
  checkInTime: string;
  method: 'qr' | 'face';
  status: 'present' | 'late' | 'absent';
  course: string;
}

export function AttendanceManager() {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [qrCodeImage, setQrCodeImage] = useState<string>('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Mock attendance data
  const [attendanceRecords] = useState<AttendanceRecord[]>([
    {
      id: '1',
      studentName: 'Alice Johnson',
      studentId: 'ST001',
      checkInTime: '09:15 AM',
      method: 'qr',
      status: 'present',
      course: 'Computer Science 101'
    },
    {
      id: '2',
      studentName: 'Bob Smith',
      studentId: 'ST002',
      checkInTime: '09:25 AM',
      method: 'face',
      status: 'late',
      course: 'Computer Science 101'
    },
    {
      id: '3',
      studentName: 'Carol Davis',
      studentId: 'ST003',
      checkInTime: '09:10 AM',
      method: 'qr',
      status: 'present',
      course: 'Computer Science 101'
    },
    {
      id: '4',
      studentName: 'David Wilson',
      studentId: 'ST004',
      checkInTime: '09:30 AM',
      method: 'face',
      status: 'late',
      course: 'Mathematics 201'
    },
    {
      id: '5',
      studentName: 'Eva Brown',
      studentId: 'ST005',
      checkInTime: '09:05 AM',
      method: 'qr',
      status: 'present',
      course: 'Mathematics 201'
    }
  ]);

  const courses = ['Computer Science 101', 'Mathematics 201', 'Physics 301', 'Data Structures'];
  
  const getAttendanceStats = () => {
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter(r => r.status === 'present').length;
    const late = attendanceRecords.filter(r => r.status === 'late').length;
    const absent = attendanceRecords.filter(r => r.status === 'absent').length;
    
    return {
      total,
      present,
      late,
      absent,
      presentPercentage: Math.round((present / total) * 100),
      latePercentage: Math.round((late / total) * 100),
      absentPercentage: Math.round((absent / total) * 100)
    };
  };

  const stats = getAttendanceStats();

  const generateQRCode = async () => {
    if (!selectedCourse) {
      toast({
        title: "Please select a course",
        description: "You need to select a course before generating a QR code.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingQR(true);
    try {
      // Generate attendance URL with course and timestamp
      const attendanceData = {
        course: selectedCourse,
        timestamp: Date.now(),
        sessionId: `session_${Date.now()}`,
        action: 'checkin'
      };
      
      const qrData = JSON.stringify(attendanceData);
      
      // Generate QR code as data URL
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1e40af', // Blue color to match theme
          light: '#ffffff'
        }
      });
      
      setQrCodeImage(qrCodeDataURL);
      
      toast({
        title: "QR Code Generated!",
        description: `QR code created for ${selectedCourse}. Students can scan to check in.`,
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error generating QR code",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const startFaceRecognition = () => {
    toast({
      title: "Face Recognition Activated",
      description: "Camera is now scanning for student faces. Students will be automatically checked in when detected.",
    });
    
    // Simulate face recognition process
    setTimeout(() => {
      toast({
        title: "Student Detected",
        description: "John Doe has been automatically checked in via face recognition.",
      });
    }, 3000);
  };

  const viewDetailedAnalytics = () => {
    toast({
      title: "Analytics Dashboard",
      description: "Opening detailed attendance analytics and performance reports...",
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Attendance Management</h2>
          <p className="text-muted-foreground mt-2">
            Track student attendance with QR codes and face recognition
          </p>
        </div>
        <div className="bg-gradient-analytics p-3 rounded-lg">
          <Users className="h-8 w-8 text-white" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <QrCode className="h-5 w-5" />
              <span>QR Code Check-in</span>
            </CardTitle>
            <CardDescription>
              Generate QR codes for students to scan and check in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="course-select">Select Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course} value={course}>{course}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={generateQRCode}
              className="w-full bg-gradient-primary text-primary-foreground"
              disabled={!selectedCourse || isGeneratingQR}
            >
              <QrCode className="mr-2 h-4 w-4" />
              {isGeneratingQR ? 'Generating...' : 'Generate QR Code'}
            </Button>
            
            {/* QR Code Display */}
            {qrCodeImage && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg text-center">
                <h4 className="font-semibold mb-3">Attendance QR Code</h4>
                <div className="bg-white p-4 rounded-lg inline-block shadow-medium">
                  <img src={qrCodeImage} alt="Attendance QR Code" className="w-48 h-48" />
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Students can scan this QR code to check in for {selectedCourse}
                </p>
                <div className="flex gap-2 mt-4 justify-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.download = `qr-code-${selectedCourse.replace(/\s+/g, '-').toLowerCase()}.png`;
                      link.href = qrCodeImage;
                      link.click();
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setQrCodeImage('')}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="h-5 w-5" />
              <span>Face Recognition</span>
            </CardTitle>
            <CardDescription>
              Automated attendance using facial recognition technology
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-success"></div>
                <span className="text-sm font-medium">Camera Status: Ready</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered face recognition is ready to identify students
              </p>
            </div>
            <Button 
              onClick={startFaceRecognition}
              className="w-full bg-gradient-ai text-ai-foreground"
            >
              <Camera className="mr-2 h-4 w-4" />
              Start Face Recognition
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-medium">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Students</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <div className="bg-gradient-primary p-3 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-medium">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Present</p>
                <p className="text-2xl font-bold text-success">{stats.present}</p>
                <p className="text-sm text-success font-medium">{stats.presentPercentage}%</p>
              </div>
              <div className="bg-gradient-success p-3 rounded-lg">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-medium">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Late</p>
                <p className="text-2xl font-bold text-warning">{stats.late}</p>
                <p className="text-sm text-warning font-medium">{stats.latePercentage}%</p>
              </div>
              <div className="bg-warning p-3 rounded-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-medium">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Absent</p>
                <p className="text-2xl font-bold text-destructive">{stats.absent}</p>
                <p className="text-sm text-destructive font-medium">{stats.absentPercentage}%</p>
              </div>
              <div className="bg-destructive p-3 rounded-lg">
                <UserX className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Records */}
      <Card className="border-0 shadow-medium">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Today's Attendance Records</span>
              </CardTitle>
              <CardDescription>
                Real-time attendance tracking for all courses
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attendanceRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {record.studentName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{record.studentName}</h4>
                    <p className="text-sm text-muted-foreground">ID: {record.studentId}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{record.course}</p>
                    <p className="text-sm text-muted-foreground">{record.checkInTime}</p>
                  </div>
                  
                  <Badge 
                    variant={record.method === 'qr' ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {record.method === 'qr' ? (
                      <>
                        <QrCode className="mr-1 h-3 w-3" />
                        QR Code
                      </>
                    ) : (
                      <>
                        <Camera className="mr-1 h-3 w-3" />
                        Face ID
                      </>
                    )}
                  </Badge>

                  <Badge 
                    className={`${
                      record.status === 'present' 
                        ? 'bg-success-light text-success' 
                        : record.status === 'late'
                        ? 'bg-warning/20 text-warning'
                        : 'bg-destructive/20 text-destructive'
                    }`}
                  >
                    {record.status === 'present' && <UserCheck className="mr-1 h-3 w-3" />}
                    {record.status === 'late' && <Clock className="mr-1 h-3 w-3" />}
                    {record.status === 'absent' && <UserX className="mr-1 h-3 w-3" />}
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-foreground">Attendance Summary</h4>
                <p className="text-sm text-muted-foreground">
                  {stats.presentPercentage}% attendance rate for today's sessions
                </p>
              </div>
              <Button className="bg-gradient-analytics text-white" onClick={viewDetailedAnalytics}>
                <TrendingUp className="mr-2 h-4 w-4" />
                View Detailed Analytics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}