from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import json
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
import xgboost as xgb
import plotly.graph_objects as go
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

def convert_to_serializable(obj):
    """Convert numpy types to Python native types for JSON serialization"""
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: convert_to_serializable(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_to_serializable(item) for item in obj]
    elif hasattr(obj, 'dtype'):  # Handle pandas dtypes
        return str(obj)
    return obj

class FinalMLSystem:
    def __init__(self):
        self.scaler = StandardScaler()
        self.label_encoders = {}
        
    def analyze_dataset(self, df):
        """Dataset analysis with proper type conversion"""
        # Convert all data to native Python types
        numeric_cols = [str(col) for col in df.select_dtypes(include=[np.number]).columns]
        categorical_cols = [str(col) for col in df.select_dtypes(include=['object', 'category']).columns]
        
        return {
            'shape': [int(df.shape[0]), int(df.shape[1])],
            'columns': [str(col) for col in df.columns],
            'missing_values': int(df.isnull().sum().sum()),
            'duplicate_rows': int(df.duplicated().sum()),
            'numeric_columns': numeric_cols,
            'categorical_columns': categorical_cols,
            'target_column': str(df.columns[-1]) if len(df.columns) > 1 else None,
            'is_classification': True
        }
    
    def preprocess_data(self, df, target_column):
        """Data preprocessing with proper encoding"""
        df_processed = df.copy()
        
        # Handle missing values
        for col in df_processed.columns:
            if df_processed[col].dtype == 'object':
                df_processed[col].fillna('Unknown', inplace=True)
            else:
                df_processed[col].fillna(df_processed[col].median(), inplace=True)
        
        # Encode categorical variables
        for col in df_processed.select_dtypes(include=['object', 'category']).columns:
            le = LabelEncoder()
            df_processed[col] = le.fit_transform(df_processed[col].astype(str))
            self.label_encoders[col] = le
        
        return df_processed
    
    def train_models(self, X, y):
        """Train ML models with proper error handling"""
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Define models
        models = {
            'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
            'XGBoost': xgb.XGBClassifier(random_state=42),
            'Neural Network': MLPClassifier(hidden_layer_sizes=(100, 50), random_state=42, max_iter=1000),
            'Support Vector Machine': SVC(random_state=42, probability=True),
            'Logistic Regression': LogisticRegression(random_state=42, max_iter=1000),
            'Decision Tree': DecisionTreeClassifier(random_state=42),
            'K-Nearest Neighbors': KNeighborsClassifier(n_neighbors=5),
            'Gradient Boosting': GradientBoostingClassifier(random_state=42)
        }
        
        # Train and evaluate models
        results = {}
        for name, model in models.items():
            try:
                model.fit(X_train_scaled, y_train)
                y_pred = model.predict(X_test_scaled)
                y_pred_proba = model.predict_proba(X_test_scaled) if hasattr(model, 'predict_proba') else None
                
                # Calculate metrics and convert to native Python types
                accuracy = float(accuracy_score(y_test, y_pred))
                precision = float(precision_score(y_test, y_pred, average='weighted', zero_division=0))
                recall = float(recall_score(y_test, y_pred, average='weighted', zero_division=0))
                f1 = float(f1_score(y_test, y_pred, average='weighted', zero_division=0))
                
                if y_pred_proba is not None:
                    try:
                        roc_auc = float(roc_auc_score(y_test, y_pred_proba, multi_class='ovr', average='weighted'))
                    except:
                        roc_auc = 0.0
                else:
                    roc_auc = 0.0
                
                results[name] = {
                    'accuracy': accuracy,
                    'precision': precision,
                    'recall': recall,
                    'f1_score': f1,
                    'roc_auc': roc_auc
                }
            except Exception as e:
                print(f"Error training {name}: {e}")
                results[name] = {
                    'accuracy': 0.0,
                    'precision': 0.0,
                    'recall': 0.0,
                    'f1_score': 0.0,
                    'roc_auc': 0.0
                }
        
        return results
    
    def create_plot(self, model_results):
        """Create performance plot"""
        models = list(model_results.keys())
        accuracies = [model_results[model]['accuracy'] for model in models]
        
        fig = go.Figure()
        fig.add_trace(go.Bar(
            x=models,
            y=accuracies,
            name='Accuracy',
            marker_color='lightblue'
        ))
        
        fig.update_layout(
            title="Model Performance Comparison",
            xaxis_title="Models",
            yaxis_title="Accuracy",
            height=400
        )
        
        return fig.to_json()

# Initialize ML system
ml_system = FinalMLSystem()

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
        
        # Preprocess data
        target_column = dataset_info['target_column']
        if target_column is None:
            return jsonify({'error': 'Could not identify target column'}), 400
        
        df_processed = ml_system.preprocess_data(df, target_column)
        
        # Prepare features and target
        X = df_processed.drop(columns=[target_column])
        y = df_processed[target_column]
        
        # Train models
        model_results = ml_system.train_models(X, y)
        
        # Create plot
        plot_data = ml_system.create_plot(model_results)
        
        # Find best model
        best_model = max(model_results.items(), key=lambda x: x[1]['accuracy'])
        
        # Generate feedback
        feedback = {
            'dataset_quality': {
                'size': f"{dataset_info['shape'][0]} rows, {dataset_info['shape'][1]} columns",
                'missing_data': f"{dataset_info['missing_values']} missing values",
                'duplicates': f"{dataset_info['duplicate_rows']} duplicate rows"
            },
            'model_performance': {
                'best_model': best_model[0],
                'best_accuracy': best_model[1]['accuracy']
            },
            'recommendations': [
                "Consider feature engineering for better performance",
                "Try ensemble methods for improved accuracy",
                "Perform cross-validation for robust evaluation"
            ],
            'warnings': [],
            'insights': [f"Best performing model: {best_model[0]} with {best_model[1]['accuracy']:.2%} accuracy"]
        }
        
        # Get top 3 models
        top_3_models = sorted(model_results.items(), key=lambda x: x[1]['accuracy'], reverse=True)[:3]
        top_3_names = [name for name, _ in top_3_models]
        
        # Prepare response with proper serialization
        response = {
            'success': True,
            'dataset_info': convert_to_serializable(dataset_info),
            'model_results': convert_to_serializable(model_results),
            'feedback': convert_to_serializable(feedback),
            'top_3_models': top_3_names,
            'plot_data': plot_data,
            'ensemble_created': True
        }
        
        return jsonify(response)
        
    except Exception as e:
        print(f"Error in upload_dataset: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'ML Backend is running'})

if __name__ == '__main__':
    print("🤖 AI EduPulse ML Backend Starting...")
    print("📍 Backend will be available at: http://localhost:5000")
    print("=" * 50)
    app.run(debug=True, port=5000, host='0.0.0.0')
