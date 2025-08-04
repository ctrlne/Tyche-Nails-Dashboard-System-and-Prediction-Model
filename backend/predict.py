# CODE FOR: Python (save as predict.py inside your 'backend' folder)
import joblib # type: ignore
import pandas as pd # type: ignore
import sys
import json

# Load the trained model
model = joblib.load('no_show_model.pkl')

def get_prediction(data):
    """Takes appointment data and returns a no-show prediction."""
    # Create a DataFrame from the input data
    df = pd.DataFrame([data])
    
    # Simple feature engineering (should match your training notebook)
    df['day_of_week'] = pd.to_datetime(df['appointment_time']).dt.dayofweek
    df.replace([float('inf'), -float('inf')], 0, inplace=True)
    
    # Ensure all required feature columns exist
    required_features = ['lead_time_days', 'day_of_week', 'previous_appointments', 'no_show_rate', 'price']
    for col in required_features:
        if col not in df.columns:
            df[col] = 0 # Default to 0 if a feature is missing
            
    # Keep only the required feature columns in the correct order
    df = df[required_features]

    # Make a prediction
    prediction = model.predict(df)
    probability = model.predict_proba(df)

    # Return the result
    if prediction[0] == 1:
        return f"High ({int(probability[0][1] * 100)}%)"
    else:
        return f"Low ({int(probability[0][0] * 100)}%)"

if __name__ == "__main__":
    input_data = json.loads(sys.argv[1])
    result = get_prediction(input_data)
    print(result)