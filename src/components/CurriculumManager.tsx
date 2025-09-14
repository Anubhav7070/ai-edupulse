import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  Users,
  Clock,
  FileText,
  Upload,
  Brain,
  CheckCircle2,
  Activity
} from 'lucide-react';

interface Course {
  id: string;
  name: string;
  modules: number;
  students: number;
  completion: number;
  performance: number;
  attendanceRate: number;
  status: 'active' | 'planning' | 'completed';
}

interface AIInsight {
  type: 'warning' | 'success' | 'info';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
}

export function CurriculumManager() {
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  
  // Mock course data
  const [courses] = useState<Course[]>([
    {
      id: '1',
      name: 'Computer Science 101',
      modules: 12,
      students: 45,
      completion: 67,
      performance: 82,
      attendanceRate: 94,
      status: 'active'
    },
    {
      id: '2',
      name: 'Data Structures & Algorithms',
      modules: 10,
      students: 38,
      completion: 45,
      performance: 76,
      attendanceRate: 87,
      status: 'active'
    },
    {
      id: '3',
      name: 'Machine Learning Fundamentals',
      modules: 15,
      students: 28,
      completion: 23,
      performance: 69,
      attendanceRate: 78,
      status: 'active'
    },
    {
      id: '4',
      name: 'Web Development Bootcamp',
      modules: 8,
      students: 52,
      completion: 89,
      performance: 91,
      attendanceRate: 96,
      status: 'active'
    }
  ]);

  // Mock AI insights
  const [aiInsights] = useState<AIInsight[]>([
    {
      type: 'warning',
      title: 'Low Attendance in Module 3',
      description: 'Machine Learning Fundamentals shows 22% drop in attendance during Module 3 (Neural Networks)',
      impact: 'high',
      recommendation: 'Consider breaking complex topics into smaller sessions or adding prerequisite review materials'
    },
    {
      type: 'success',
      title: 'High Engagement Pattern',
      description: 'Web Development students show 96% attendance with 91% performance correlation',
      impact: 'medium',
      recommendation: 'Apply similar hands-on project structure to other theoretical courses'
    },
    {
      type: 'info',
      title: 'Performance Prediction',
      description: 'Students with <80% attendance in first 3 modules have 73% chance of poor final performance',
      impact: 'high',
      recommendation: 'Implement early intervention system for at-risk students'
    }
  ]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'success': return CheckCircle2;
      case 'info': return Brain;
      default: return Activity;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-warning bg-warning/20';
      case 'success': return 'text-success bg-success-light';
      case 'info': return 'text-ai-primary bg-ai-secondary';
      default: return 'text-foreground bg-muted';
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Curriculum Management</h2>
          <p className="text-muted-foreground mt-2">
            AI-powered insights connecting attendance data to curriculum outcomes
          </p>
        </div>
        <div className="bg-gradient-success p-3 rounded-lg">
          <Target className="h-8 w-8 text-white" />
        </div>
      </div>

      {/* Course Upload */}
      <Card className="border-0 shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload Course Materials</span>
          </CardTitle>
          <CardDescription>
            Add new courses, modules, and learning outcomes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course-name">Course Name</Label>
              <Input id="course-name" placeholder="e.g., Advanced Machine Learning" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-modules">Number of Modules</Label>
              <Input id="course-modules" type="number" placeholder="12" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="course-description">Course Description</Label>
            <Textarea 
              id="course-description" 
              placeholder="Brief description of the course objectives and learning outcomes..."
              className="min-h-[100px]"
            />
          </div>
          <div className="flex items-center space-x-4">
            <Button className="bg-gradient-success text-success-foreground">
              <BookOpen className="mr-2 h-4 w-4" />
              Create Course
            </Button>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Import from File
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Course Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="border-0 shadow-medium hover:shadow-large transition-all cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge className={`${
                  course.status === 'active' 
                    ? 'bg-success-light text-success' 
                    : course.status === 'planning'
                    ? 'bg-warning/20 text-warning'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                </Badge>
                <div className="text-sm text-muted-foreground">{course.modules} modules</div>
              </div>
              <CardTitle className="text-lg">{course.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{course.completion}%</span>
                </div>
                <Progress value={course.completion} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>Students</span>
                  </div>
                  <div className="font-semibold">{course.students}</div>
                </div>
                <div>
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    <span>Performance</span>
                  </div>
                  <div className="font-semibold">{course.performance}%</div>
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Attendance Rate</span>
                  <span className={`font-medium ${
                    course.attendanceRate >= 90 
                      ? 'text-success' 
                      : course.attendanceRate >= 80 
                      ? 'text-warning' 
                      : 'text-destructive'
                  }`}>
                    {course.attendanceRate}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Insights */}
      <Card className="border-0 shadow-large">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-ai-primary" />
            <span>AI-Powered Curriculum Insights</span>
          </CardTitle>
          <CardDescription>
            Intelligent analysis of attendance patterns and curriculum performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {aiInsights.map((insight, index) => {
            const IconComponent = getInsightIcon(insight.type);
            return (
              <div key={index} className="p-4 rounded-lg border border-border bg-muted/20">
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-lg ${getInsightColor(insight.type)}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-foreground">{insight.title}</h4>
                      <Badge className={`text-xs ${getImpactBadge(insight.impact)}`}>
                        {insight.impact} impact
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                    <div className="bg-card p-3 rounded-lg border border-border">
                      <div className="flex items-start space-x-2">
                        <Target className="h-4 w-4 text-ai-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-foreground mb-1">Recommendation:</div>
                          <div className="text-sm text-muted-foreground">{insight.recommendation}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-foreground">Need More Insights?</h4>
                <p className="text-sm text-muted-foreground">
                  Upload new datasets to get fresh AI recommendations
                </p>
              </div>
              <Button className="bg-gradient-ai text-ai-foreground">
                <Brain className="mr-2 h-4 w-4" />
                Generate New Insights
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Correlation */}
      <Card className="border-0 shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Attendance-Performance Correlation</span>
          </CardTitle>
          <CardDescription>
            How attendance directly impacts learning outcomes across courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{course.name}</h4>
                    <p className="text-sm text-muted-foreground">{course.students} students</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 text-center">
                  <div>
                    <div className="text-lg font-bold text-foreground">{course.attendanceRate}%</div>
                    <div className="text-xs text-muted-foreground">Attendance</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-foreground">{course.performance}%</div>
                    <div className="text-xs text-muted-foreground">Performance</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    Math.abs(course.attendanceRate - course.performance) <= 10 
                      ? 'text-success' 
                      : 'text-warning'
                  }`}>
                    {Math.abs(course.attendanceRate - course.performance) <= 10 
                      ? 'Strong Correlation' 
                      : 'Needs Review'
                    }
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {Math.abs(course.attendanceRate - course.performance)}% variance
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}