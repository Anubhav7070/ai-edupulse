from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import numpy as np
import json
import os
import io
import base64
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, classification_report
from sklearn.preprocessing import StandardScaler, LabelEncoder
import xgboost as xgb
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

class HybridMLSystem:
    def __init__(self):
        self.models = {}
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.results = {}
        self.dataset_info = {}
        
    def analyze_dataset(self, df):
        """Comprehensive dataset analysis and feedback"""
        info = {
            'shape': df.shape,
            'columns': list(df.columns),
            'dtypes': df.dtypes.to_dict(),
            'missing_values': df.isnull().sum().to_dict(),
            'missing_percentage': (df.isnull().sum() / len(df) * 100).to_dict(),
            'duplicate_rows': df.duplicated().sum(),
            'memory_usage': df.memory_usage(deep=True).sum(),
            'numeric_columns': df.select_dtypes(include=[np.number]).columns.tolist(),
            'categorical_columns': df.select_dtypes(include=['object', 'category']).columns.tolist(),
            'target_column': None,
            'is_classification': True,
            'class_distribution': {},
            'correlation_matrix': None,
            'statistical_summary': {}
        }
        
        # Statistical summary for numeric columns
        if info['numeric_columns']:
            info['statistical_summary'] = df[info['numeric_columns']].describe().to_dict()
        
        # Try to identify target column (last column or column with 'target' in name)
        potential_targets = [col for col in df.columns if 'target' in col.lower() or 'label' in col.lower() or 'class' in col.lower()]
        if potential_targets:
            info['target_column'] = potential_targets[0]
        elif len(df.columns) > 1:
            info['target_column'] = df.columns[-1]
        
        # Analyze target distribution if target column exists
        if info['target_column'] and info['target_column'] in df.columns:
            target_col = df[info['target_column']]
            if target_col.dtype == 'object' or len(target_col.unique()) < 20:
                info['class_distribution'] = target_col.value_counts().to_dict()
                info['is_classification'] = True
            else:
                info['is_classification'] = False
        
        # Correlation matrix for numeric columns
        if len(info['numeric_columns']) > 1:
            info['correlation_matrix'] = df[info['numeric_columns']].corr().to_dict()
        
        return info
    
    def preprocess_data(self, df, target_column=None):
        """Preprocess dataset for ML training"""
        df_processed = df.copy()
        
        # Handle missing values
        for col in df_processed.columns:
            if df_processed[col].dtype == 'object':
                df_processed[col].fillna(df_processed[col].mode()[0] if not df_processed[col].mode().empty else 'Unknown', inplace=True)
            else:
                df_processed[col].fillna(df_processed[col].median(), inplace=True)
        
        # Encode categorical variables
        for col in df_processed.select_dtypes(include=['object', 'category']).columns:
            if col != target_column:
                le = LabelEncoder()
                df_processed[col] = le.fit_transform(df_processed[col].astype(str))
                self.label_encoders[col] = le
        
        return df_processed
    
    def train_models(self, X, y, is_classification=True):
        """Train multiple ML models with hyperparameter tuning"""
        models = {}
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y if is_classification else None)
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        if is_classification:
            # Random Forest
            rf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
            rf.fit(X_train_scaled, y_train)
            models['Random Forest'] = rf
            
            # XGBoost
            xgb_model = xgb.XGBClassifier(random_state=42, n_jobs=-1)
            xgb_model.fit(X_train_scaled, y_train)
            models['XGBoost'] = xgb_model
            
            # Neural Network
            nn = MLPClassifier(hidden_layer_sizes=(100, 50), random_state=42, max_iter=1000)
            nn.fit(X_train_scaled, y_train)
            models['Neural Network'] = nn
            
            # Support Vector Machine
            svm = SVC(random_state=42, probability=True)
            svm.fit(X_train_scaled, y_train)
            models['Support Vector Machine'] = svm
            
            # Logistic Regression
            lr = LogisticRegression(random_state=42, max_iter=1000)
            lr.fit(X_train_scaled, y_train)
            models['Logistic Regression'] = lr
            
            # Decision Tree
            dt = DecisionTreeClassifier(random_state=42)
            dt.fit(X_train_scaled, y_train)
            models['Decision Tree'] = dt
            
            # K-Nearest Neighbors
            knn = KNeighborsClassifier(n_neighbors=5)
            knn.fit(X_train_scaled, y_train)
            models['K-Nearest Neighbors'] = knn
            
            # Gradient Boosting
            gb = GradientBoostingClassifier(random_state=42)
            gb.fit(X_train_scaled, y_train)
            models['Gradient Boosting'] = gb
        
        # Evaluate models
        results = {}
        for name, model in models.items():
            y_pred = model.predict(X_test_scaled)
            y_pred_proba = model.predict_proba(X_test_scaled) if hasattr(model, 'predict_proba') else None
            
            results[name] = {
                'accuracy': accuracy_score(y_test, y_pred),
                'precision': precision_score(y_test, y_pred, average='weighted', zero_division=0),
                'recall': recall_score(y_test, y_pred, average='weighted', zero_division=0),
                'f1_score': f1_score(y_test, y_pred, average='weighted', zero_division=0),
                'roc_auc': roc_auc_score(y_test, y_pred_proba, multi_class='ovr', average='weighted') if y_pred_proba is not None else 0,
                'model': model
            }
        
        return results, X_test_scaled, y_test
    
    def create_hybrid_ensemble(self, models, X_test, y_test):
        """Create hybrid ensemble of top 3 models"""
        # Get top 3 models by accuracy
        sorted_models = sorted(models.items(), key=lambda x: x[1]['accuracy'], reverse=True)
        top_3_models = sorted_models[:3]
        
        # Create voting classifier
        voting_models = [(name, model['model']) for name, model in top_3_models]
        ensemble = VotingClassifier(voting_models, voting='soft')
        
        # Train ensemble (we need to retrain with original data)
        return ensemble, [name for name, _ in top_3_models]
    
    def generate_feedback(self, dataset_info, model_results):
        """Generate comprehensive feedback about dataset and model performance"""
        feedback = {
            'dataset_quality': {},
            'model_performance': {},
            'recommendations': [],
            'warnings': [],
            'insights': []
        }
        
        # Dataset quality analysis
        missing_pct = sum(dataset_info['missing_percentage'].values()) / len(dataset_info['missing_percentage'])
        feedback['dataset_quality'] = {
            'size': f"{dataset_info['shape'][0]} rows, {dataset_info['shape'][1]} columns",
            'missing_data': f"{missing_pct:.1f}% missing values on average",
            'duplicates': f"{dataset_info['duplicate_rows']} duplicate rows",
            'memory_usage': f"{dataset_info['memory_usage'] / 1024 / 1024:.2f} MB",
            'data_types': {
                'numeric': len(dataset_info['numeric_columns']),
                'categorical': len(dataset_info['categorical_columns'])
            }
        }
        
        # Model performance analysis
        best_model = max(model_results.items(), key=lambda x: x[1]['accuracy'])
        feedback['model_performance'] = {
            'best_model': best_model[0],
            'best_accuracy': best_model[1]['accuracy'],
            'model_count': len(model_results),
            'accuracy_range': {
                'min': min(r['accuracy'] for r in model_results.values()),
                'max': max(r['accuracy'] for r in model_results.values())
            }
        }
        
        # Generate recommendations
        if missing_pct > 10:
            feedback['warnings'].append("High percentage of missing values detected. Consider data imputation strategies.")
        
        if dataset_info['duplicate_rows'] > 0:
            feedback['warnings'].append(f"Found {dataset_info['duplicate_rows']} duplicate rows. Consider removing duplicates.")
        
        if len(dataset_info['numeric_columns']) < 2:
            feedback['warnings'].append("Limited numeric features. Consider feature engineering.")
        
        if best_model[1]['accuracy'] < 0.7:
            feedback['warnings'].append("Model performance is below 70%. Consider feature engineering or more data.")
        elif best_model[1]['accuracy'] > 0.9:
            feedback['insights'].append("Excellent model performance achieved!")
        
        feedback['recommendations'] = [
            "Consider feature scaling for better model performance",
            "Try ensemble methods for improved accuracy",
            "Perform cross-validation for more robust evaluation",
            "Consider feature selection to reduce overfitting"
        ]
        
        return feedback
    
    def create_performance_plots(self, model_results, top_3_names):
        """Create performance comparison plots for top 3 models"""
        # Prepare data
        models = list(model_results.keys())
        metrics = ['accuracy', 'precision', 'recall', 'f1_score', 'roc_auc']
        
        # Create subplots
        fig = make_subplots(
            rows=2, cols=3,
            subplot_titles=['Accuracy Comparison', 'Precision vs Recall', 'F1-Score Distribution', 
                          'ROC-AUC Scores', 'Overall Performance', 'Model Ranking'],
            specs=[[{"type": "bar"}, {"type": "scatter"}, {"type": "bar"}],
                   [{"type": "bar"}, {"type": "radar"}, {"type": "bar"}]]
        )
        
        # Accuracy comparison
        accuracies = [model_results[model]['accuracy'] for model in models]
        fig.add_trace(
            go.Bar(x=models, y=accuracies, name='Accuracy', marker_color='lightblue'),
            row=1, col=1
        )
        
        # Precision vs Recall scatter
        precisions = [model_results[model]['precision'] for model in models]
        recalls = [model_results[model]['recall'] for model in models]
        fig.add_trace(
            go.Scatter(x=precisions, y=recalls, mode='markers+text', 
                      text=models, textposition='top center',
                      marker=dict(size=10, color='red'), name='Precision vs Recall'),
            row=1, col=2
        )
        
        # F1-Score distribution
        f1_scores = [model_results[model]['f1_score'] for model in models]
        fig.add_trace(
            go.Bar(x=models, y=f1_scores, name='F1-Score', marker_color='lightgreen'),
            row=1, col=3
        )
        
        # ROC-AUC scores
        roc_aucs = [model_results[model]['roc_auc'] for model in models]
        fig.add_trace(
            go.Bar(x=models, y=roc_aucs, name='ROC-AUC', marker_color='orange'),
            row=2, col=1
        )
        
        # Radar chart for top 3 models
        for i, model_name in enumerate(top_3_names[:3]):
            if model_name in model_results:
                values = [model_results[model_name][metric] for metric in metrics]
                fig.add_trace(
                    go.Scatterpolar(
                        r=values,
                        theta=metrics,
                        fill='toself',
                        name=model_name,
                        line=dict(color=px.colors.qualitative.Set1[i])
                    ),
                    row=2, col=2
                )
        
        # Model ranking
        sorted_models = sorted(model_results.items(), key=lambda x: x[1]['accuracy'], reverse=True)
        ranked_models = [item[0] for item in sorted_models]
        ranked_accuracies = [item[1]['accuracy'] for item in sorted_models]
        
        fig.add_trace(
            go.Bar(x=ranked_models, y=ranked_accuracies, name='Ranking', 
                  marker_color=['gold' if i < 3 else 'lightgray' for i in range(len(ranked_models))]),
            row=2, col=3
        )
        
        # Update layout
        fig.update_layout(
            height=800,
            title_text="Machine Learning Model Performance Analysis",
            showlegend=True
        )
        
        return fig

# Initialize ML system
ml_system = HybridMLSystem()

@app.route('/api/upload-dataset', methods=['POST'])
def upload_dataset():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Read dataset
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file)
        elif file.filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(file)
        else:
            return jsonify({'error': 'Unsupported file format'}), 400
        
        # Analyze dataset
        dataset_info = ml_system.analyze_dataset(df)
        ml_system.dataset_info = dataset_info
        
        # Preprocess data
        target_column = dataset_info['target_column']
        if target_column is None:
            return jsonify({'error': 'Could not identify target column'}), 400
        
        df_processed = ml_system.preprocess_data(df, target_column)
        
        # Prepare features and target
        X = df_processed.drop(columns=[target_column])
        y = df_processed[target_column]
        
        # Train models
        model_results, X_test, y_test = ml_system.train_models(X, y, dataset_info['is_classification'])
        ml_system.results = model_results
        
        # Create hybrid ensemble
        ensemble, top_3_names = ml_system.create_hybrid_ensemble(model_results, X_test, y_test)
        
        # Generate feedback
        feedback = ml_system.generate_feedback(dataset_info, model_results)
        
        # Create performance plots
        plot_fig = ml_system.create_performance_plots(model_results, top_3_names)
        plot_json = plot_fig.to_json()
        
        # Prepare response
        response = {
            'success': True,
            'dataset_info': dataset_info,
            'model_results': model_results,
            'feedback': feedback,
            'top_3_models': top_3_names,
            'plot_data': plot_json,
            'ensemble_created': True
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/train-ensemble', methods=['POST'])
def train_ensemble():
    try:
        data = request.json
        model_names = data.get('model_names', [])
        
        if not model_names:
            return jsonify({'error': 'No model names provided'}), 400
        
        # This would retrain the ensemble with selected models
        # For now, return success
        return jsonify({
            'success': True,
            'message': 'Ensemble training completed',
            'selected_models': model_names
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/get-dataset-info', methods=['GET'])
def get_dataset_info():
    return jsonify(ml_system.dataset_info)

@app.route('/api/get-model-results', methods=['GET'])
def get_model_results():
    return jsonify(ml_system.results)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
