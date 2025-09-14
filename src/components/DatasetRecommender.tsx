import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  Brain, 
  TrendingUp, 
  Award, 
  BarChart3,
  FileSpreadsheet,
  Zap,
  Target
} from 'lucide-react';

interface ModelResult {
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  status: 'completed' | 'training' | 'pending';
}

export function DatasetRecommender() {
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const { toast } = useToast();

  // Mock results data
  const [modelResults] = useState<ModelResult[]>([
    {
      name: 'Random Forest',
      accuracy: 94.2,
      precision: 92.8,
      recall: 95.1,
      f1Score: 93.9,
      rocAuc: 96.3,
      status: 'completed'
    },
    {
      name: 'Gradient Boosting',
      accuracy: 92.7,
      precision: 90.4,
      recall: 94.2,
      f1Score: 92.3,
      rocAuc: 94.8,
      status: 'completed'
    },
    {
      name: 'Neural Network',
      accuracy: 91.5,
      precision: 89.2,
      recall: 93.7,
      f1Score: 91.4,
      rocAuc: 93.6,
      status: 'completed'
    },
    {
      name: 'Support Vector Machine',
      accuracy: 89.3,
      precision: 87.1,
      recall: 91.8,
      f1Score: 89.4,
      rocAuc: 91.2,
      status: 'completed'
    },
    {
      name: 'Logistic Regression',
      accuracy: 87.8,
      precision: 85.6,
      recall: 90.1,
      f1Score: 87.8,
      rocAuc: 89.7,
      status: 'completed'
    },
    {
      name: 'Decision Tree',
      accuracy: 85.2,
      precision: 83.4,
      recall: 87.9,
      f1Score: 85.6,
      rocAuc: 86.8,
      status: 'completed'
    },
    {
      name: 'K-Nearest Neighbors',
      accuracy: 82.6,
      precision: 80.3,
      recall: 85.4,
      f1Score: 82.8,
      rocAuc: 84.1,
      status: 'completed'
    }
  ]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const startTraining = () => {
    setIsTraining(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          return 100;
        }
        return prev + 10;
      });
    }, 800);
  };

  const getBestModel = () => {
    return modelResults.reduce((best, current) => 
      current.accuracy > best.accuracy ? current : best
    );
  };

  const bestModel = getBestModel();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Dataset Algorithm Recommender</h2>
          <p className="text-muted-foreground mt-2">
            Upload your dataset and let AI recommend the best machine learning algorithm
          </p>
        </div>
        <div className="bg-gradient-ai p-3 rounded-lg">
          <Brain className="h-8 w-8 text-ai-foreground" />
        </div>
      </div>

      {/* Upload Section */}
      <Card className="border-0 shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Dataset Upload</span>
          </CardTitle>
          <CardDescription>
            Upload your CSV or Excel file to begin automatic model training and evaluation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="dataset">Select Dataset File</Label>
            <div className="flex items-center space-x-4">
              <Input
                id="dataset"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="flex-1"
              />
              {fileName && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>{fileName}</span>
                </div>
              )}
            </div>
          </div>

          {fileName && !isTraining && progress === 0 && (
            <Button 
              onClick={startTraining}
              className="w-full bg-gradient-ai text-ai-foreground"
            >
              <Zap className="mr-2 h-4 w-4" />
              Start AI Model Training
            </Button>
          )}

          {isTraining && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Training Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground">
                Training {modelResults.length} different algorithms on your dataset...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Best Model Highlight */}
      {(progress === 100 || !isTraining) && (
        <Card className="border-0 shadow-large bg-gradient-primary text-primary-foreground">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-primary-foreground/20 p-2 rounded-lg">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">Recommended Algorithm</CardTitle>
                  <CardDescription className="text-primary-foreground/80">
                    Best performing model for your dataset
                  </CardDescription>
                </div>
              </div>
              <Badge className="bg-primary-foreground text-primary text-sm px-3 py-1">
                #{1} Best
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">{bestModel.name}</h3>
                <p className="text-primary-foreground/80">
                  Achieved {bestModel.accuracy}% accuracy with excellent performance across all metrics
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{bestModel.accuracy}%</div>
                <div className="text-sm text-primary-foreground/80">Accuracy</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Model Results Leaderboard */}
      {(progress === 100 || !isTraining) && (
        <Card className="border-0 shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Model Performance Leaderboard</span>
            </CardTitle>
            <CardDescription>
              Comprehensive comparison of all trained models
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {modelResults.map((model, index) => (
                <div 
                  key={model.name}
                  className={`p-4 rounded-lg border transition-all hover:shadow-medium ${
                    index === 0 
                      ? 'bg-success-light border-success/30' 
                      : 'bg-muted/30 border-border'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                        index === 0 
                          ? 'bg-success text-success-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        #{index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{model.name}</h4>
                        {index === 0 && (
                          <Badge variant="secondary" className="bg-success text-success-foreground mt-1">
                            <TrendingUp className="mr-1 h-3 w-3" />
                            Best Performance
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-foreground">{model.accuracy}%</div>
                      <div className="text-sm text-muted-foreground">Accuracy</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-foreground">{model.precision}%</div>
                      <div className="text-xs text-muted-foreground">Precision</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-foreground">{model.recall}%</div>
                      <div className="text-xs text-muted-foreground">Recall</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-foreground">{model.f1Score}%</div>
                      <div className="text-xs text-muted-foreground">F1-Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-foreground">{model.rocAuc}%</div>
                      <div className="text-xs text-muted-foreground">ROC-AUC</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">Ready to retrain with new data?</h4>
                  <p className="text-sm text-muted-foreground">Upload a different dataset to get fresh recommendations</p>
                </div>
              <Button variant="outline" onClick={() => {
                setFileName('');
                setProgress(0);
                toast({
                  title: "Reset Complete",
                  description: "Ready to upload a new dataset for analysis.",
                });
              }}>
                <Upload className="mr-2 h-4 w-4" />
                Upload New Dataset
              </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}