import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Users, 
  BookOpen, 
  BarChart3, 
  Upload, 
  QrCode, 
  TrendingUp,
  Award,
  Clock,
  Target
} from 'lucide-react';
import { DatasetRecommender } from './DatasetRecommender';
import { AttendanceManager } from './AttendanceManager';
import { CurriculumManager } from './CurriculumManager';
import heroImage from '@/assets/hero-dashboard.jpg';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const statsData = [
    {
      title: 'Active Students',
      value: '1,247',
      change: '+12%',
      icon: Users,
      gradient: 'bg-gradient-primary'
    },
    {
      title: 'Courses Available',
      value: '34',
      change: '+3',
      icon: BookOpen,
      gradient: 'bg-gradient-success'
    },
    {
      title: 'AI Models Trained',
      value: '128',
      change: '+24',
      icon: Brain,
      gradient: 'bg-gradient-ai'
    },
    {
      title: 'Attendance Rate',
      value: '94.2%',
      change: '+2.1%',
      icon: TrendingUp,
      gradient: 'bg-gradient-analytics'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-ai rounded-lg p-2">
                <Brain className="h-6 w-6 text-ai-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Smart Education AI</h1>
                <p className="text-sm text-muted-foreground">Curriculum & Attendance Intelligence</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-success-light text-success">
                <div className="w-2 h-2 rounded-full bg-success mr-2"></div>
                System Online
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="dataset" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>AI Recommender</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center space-x-2">
              <QrCode className="h-4 w-4" />
              <span>Attendance</span>
            </TabsTrigger>
            <TabsTrigger value="curriculum" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Curriculum</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Hero Section */}
            <div className="relative rounded-xl overflow-hidden bg-gradient-primary p-8 text-primary-foreground">
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `url(${heroImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-4">Welcome to Smart Education AI</h2>
                <p className="text-lg mb-6 opacity-90">
                  Harness the power of AI to optimize curriculum delivery, track attendance intelligently, 
                  and recommend the best machine learning algorithms for your educational datasets.
                </p>
                <div className="flex space-x-4">
                  <Button 
                    variant="secondary" 
                    onClick={() => setActiveTab('dataset')}
                    className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Dataset
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('attendance')}
                    className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    Generate QR Code
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsData.map((stat, index) => (
                <Card key={index} className="border-0 shadow-medium">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-sm text-success font-medium">{stat.change}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.gradient}`}>
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-medium">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-ai p-2 rounded-lg">
                      <Brain className="h-5 w-5 text-ai-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Dataset Analysis</CardTitle>
                      <CardDescription>Upload and analyze your datasets with AI</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get automatic model recommendations and performance comparisons.
                  </p>
                  <Button 
                    className="w-full bg-gradient-ai text-ai-foreground"
                    onClick={() => setActiveTab('dataset')}
                  >
                    Start Analysis
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-medium">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-analytics p-2 rounded-lg">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Attendance Tracking</CardTitle>
                      <CardDescription>QR code and face recognition check-ins</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Monitor student attendance with automated reporting.
                  </p>
                  <Button 
                    className="w-full bg-gradient-analytics text-white"
                    onClick={() => setActiveTab('attendance')}
                  >
                    View Attendance
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-medium">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-success p-2 rounded-lg">
                      <Target className="h-5 w-5 text-success-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Curriculum Insights</CardTitle>
                      <CardDescription>AI-powered curriculum optimization</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get insights on course performance and recommendations.
                  </p>
                  <Button 
                    className="w-full bg-gradient-success text-success-foreground"
                    onClick={() => setActiveTab('curriculum')}
                  >
                    Manage Curriculum
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="dataset">
            <DatasetRecommender />
          </TabsContent>

          <TabsContent value="attendance">
            <AttendanceManager />
          </TabsContent>

          <TabsContent value="curriculum">
            <CurriculumManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}