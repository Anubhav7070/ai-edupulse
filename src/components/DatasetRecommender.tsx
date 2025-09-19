import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  Brain, 
  TrendingUp, 
  Award, 
  BarChart3,
  FileSpreadsheet,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  BarChart2,
  Activity
} from 'lucide-react';
import Plot from 'react-plotly.js';

interface ModelResult {
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  status: 'completed' | 'training' | 'pending';
}

interface DatasetInfo {
  shape: [number, number];
  columns: string[];
  dtypes: Record<string, string>;
  missing_values: Record<string, number>;
  missing_percentage: Record<string, number>;
  duplicate_rows: number;
  memory_usage: number;
  numeric_columns: string[];
  categorical_columns: string[];
  target_column: string | null;
  is_classification: boolean;
  class_distribution: Record<string, number>;
  statistical_summary: Record<string, any>;
}

interface Feedback {
  dataset_quality: {
    size: string;
    missing_data: string;
    duplicates: string;
    memory_usage: string;
    data_types: {
      numeric: number;
      categorical: number;
    };
  };
  model_performance: {
    best_model: string;
    best_accuracy: number;
    model_count: number;
    accuracy_range: {
      min: number;
      max: number;
    };
  };
  recommendations: string[];
  warnings: string[];
  insights: string[];
}

export function DatasetRecommender() {
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const [modelResults, setModelResults] = useState<ModelResult[]>([]);
  const [datasetInfo, setDatasetInfo] = useState<DatasetInfo | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [plotData, setPlotData] = useState<any>(null);
  const [top3Models, setTop3Models] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const API_BASE_URL = 'http://localhost:5000/api';

  const uploadDataset = async (file: File) => {
    setIsTraining(true);
    setProgress(0);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const response = await fetch(`${API_BASE_URL}/upload-dataset`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process dataset');
      }

      const data = await response.json();
      
      // Convert model results to the expected format
      const results = Object.entries(data.model_results).map(([name, result]: [string, any]) => ({
        name,
        accuracy: result.accuracy * 100,
        precision: result.precision * 100,
        recall: result.recall * 100,
        f1_score: result.f1_score * 100,
        roc_auc: result.roc_auc * 100,
        status: 'completed' as const
      }));

      setModelResults(results);
      setDatasetInfo(data.dataset_info);
      setFeedback(data.feedback);
      setPlotData(JSON.parse(data.plot_data));
      setTop3Models(data.top_3_models);
      
      toast({
        title: "Dataset Analysis Complete!",
        description: `Successfully analyzed ${data.dataset_info.shape[0]} rows with ${data.dataset_info.shape[1]} columns.`,
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast({
        title: "Analysis Failed",
        description: err instanceof Error ? err.message : 'An error occurred during analysis',
        variant: "destructive"
      });
    } finally {
      setIsTraining(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      uploadDataset(file);
    }
  };

  // Sort results by accuracy so the leaderboard ranks correctly
  const sortedResults = [...modelResults].sort((a, b) => b.accuracy - a.accuracy);
  const bestModel = sortedResults[0];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Real-Time Hybrid ML System</h2>
          <p className="text-muted-foreground mt-2">
            Upload your dataset for real-time machine learning analysis with hybrid ensemble methods
          </p>
        </div>
        <div className="bg-gradient-ai p-3 rounded-lg">
          <Brain className="h-8 w-8 text-ai-foreground" />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
            <div className="text-center text-sm text-muted-foreground">
              File selected: {fileName}. Click to upload and analyze.
            </div>
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

      {/* Main Content Tabs */}
      {modelResults.length > 0 && (
        <Tabs defaultValue="results" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="results">Model Results</TabsTrigger>
            <TabsTrigger value="analysis">Dataset Analysis</TabsTrigger>
            <TabsTrigger value="visualization">Performance Charts</TabsTrigger>
            <TabsTrigger value="feedback">AI Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="space-y-6">
      {/* Best Model Highlight */}
            {bestModel && (
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
                        Achieved {bestModel.accuracy.toFixed(1)}% accuracy with excellent performance across all metrics
                </p>
              </div>
              <div className="text-right">
                      <div className="text-3xl font-bold">{bestModel.accuracy.toFixed(1)}%</div>
                <div className="text-sm text-primary-foreground/80">Accuracy</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Model Results Leaderboard */}
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
              {sortedResults.map((model, index) => (
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
                          <div className="text-2xl font-bold text-foreground">{model.accuracy.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Accuracy</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                          <div className="text-lg font-semibold text-foreground">{model.precision.toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">Precision</div>
                    </div>
                    <div className="text-center">
                          <div className="text-lg font-semibold text-foreground">{model.recall.toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">Recall</div>
                    </div>
                    <div className="text-center">
                          <div className="text-lg font-semibold text-foreground">{model.f1_score.toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">F1-Score</div>
                    </div>
                    <div className="text-center">
                          <div className="text-lg font-semibold text-foreground">{model.roc_auc.toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">ROC-AUC</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            {datasetInfo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileSpreadsheet className="h-5 w-5" />
                      <span>Dataset Overview</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Rows</div>
                        <div className="text-2xl font-bold">{datasetInfo.shape[0].toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Columns</div>
                        <div className="text-2xl font-bold">{datasetInfo.shape[1]}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Target Column</div>
                      <div className="font-semibold">{datasetInfo.target_column || 'Not detected'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Task Type</div>
                      <div className="font-semibold">{datasetInfo.is_classification ? 'Classification' : 'Regression'}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5" />
                      <span>Data Quality</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Missing Values</div>
                      <div className="text-2xl font-bold">{datasetInfo.duplicate_rows}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Duplicate Rows</div>
                      <div className="text-2xl font-bold">{datasetInfo.duplicate_rows}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Memory Usage</div>
                      <div className="text-2xl font-bold">{(datasetInfo.memory_usage / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Column Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Numeric Columns ({datasetInfo.numeric_columns.length})</h4>
                        <div className="space-y-1">
                          {datasetInfo.numeric_columns.map(col => (
                            <div key={col} className="text-sm text-muted-foreground">{col}</div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Categorical Columns ({datasetInfo.categorical_columns.length})</h4>
                        <div className="space-y-1">
                          {datasetInfo.categorical_columns.map(col => (
                            <div key={col} className="text-sm text-muted-foreground">{col}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="visualization" className="space-y-6">
            {plotData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart2 className="h-5 w-5" />
                    <span>Performance Visualization</span>
                  </CardTitle>
                  <CardDescription>
                    Interactive charts comparing model performance across different metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[600px]">
                    <Plot
                      data={plotData.data}
                      layout={plotData.layout}
                      style={{ width: '100%', height: '100%' }}
                      config={{ responsive: true }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            {feedback && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="h-5 w-5" />
                      <span>AI Analysis & Recommendations</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Best Performing Model</h4>
                        <div className="text-2xl font-bold text-success">{feedback.model_performance.best_model}</div>
                        <div className="text-sm text-muted-foreground">
                          {feedback.model_performance.best_accuracy.toFixed(1)}% accuracy
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Accuracy Range</h4>
                        <div className="text-sm text-muted-foreground">
                          {feedback.model_performance.accuracy_range.min.toFixed(1)}% - {feedback.model_performance.accuracy_range.max.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {feedback.warnings.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-warning">
                        <AlertTriangle className="h-5 w-5" />
                        <span>Warnings</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {feedback.warnings.map((warning, index) => (
                          <Alert key={index} variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{warning}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {feedback.insights.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-success">
                        <CheckCircle className="h-5 w-5" />
                        <span>Insights</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {feedback.insights.map((insight, index) => (
                          <Alert key={index}>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>{insight}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Info className="h-5 w-5" />
                      <span>Recommendations</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {feedback.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <div className="text-sm">{rec}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Reset Button */}
      {modelResults.length > 0 && (
        <Card>
          <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                <h4 className="font-semibold text-foreground">Ready to analyze another dataset?</h4>
                  <p className="text-sm text-muted-foreground">Upload a different dataset to get fresh recommendations</p>
                </div>
              <Button variant="outline" onClick={() => {
                setFileName('');
                setProgress(0);
                setModelResults([]);
                setDatasetInfo(null);
                setFeedback(null);
                setPlotData(null);
                setTop3Models([]);
                setError(null);
                toast({
                  title: "Reset Complete",
                  description: "Ready to upload a new dataset for analysis.",
                });
              }}>
                <Upload className="mr-2 h-4 w-4" />
                Upload New Dataset
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}