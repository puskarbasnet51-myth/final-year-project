import os
import joblib
import pandas as pd


# ---------------------------------------------------------
# Find project root
# ---------------------------------------------------------

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)


# ---------------------------------------------------------
# Model paths
# ---------------------------------------------------------

MODEL_PATH = os.path.join(
    BASE_DIR,
    'ai_model',
    'models',
    'donation_completion_model.joblib'
)

SCALER_PATH = os.path.join(
    BASE_DIR,
    'ai_model',
    'models',
    'donation_completion_scaler.joblib'
)


# ---------------------------------------------------------
# Load model
# ---------------------------------------------------------

model = joblib.load(
    MODEL_PATH
)

scaler = joblib.load(
    SCALER_PATH
)


# ---------------------------------------------------------
# Prediction function
# ---------------------------------------------------------

def predict_donation_completion(
    people_count,
    preparation_method,
    previous_completed_count,
    previous_total_count,
    previous_completion_rate
):

    # -----------------------------------------------------
    # Convert preparation method
    # -----------------------------------------------------

    if preparation_method == 'home_cooked':
        preparation_value = 1
    else:
        preparation_value = 0

    # -----------------------------------------------------
    # Create input DataFrame
    # -----------------------------------------------------

    input_data = pd.DataFrame({
        'people_count': [
            people_count
        ],

        'preparation_method': [
            preparation_value
        ],

        'previous_completed_count': [
            previous_completed_count
        ],

        'previous_total_count': [
            previous_total_count
        ],

        'previous_completion_rate': [
            previous_completion_rate
        ],
    })

    # -----------------------------------------------------
    # Scale
    # -----------------------------------------------------

    input_scaled = scaler.transform(
        input_data
    )

    # -----------------------------------------------------
    # Prediction
    # -----------------------------------------------------

    prediction = model.predict(
        input_scaled
    )[0]

    probability = model.predict_proba(
        input_scaled
    )[0][1]

    # -----------------------------------------------------
    # Return result
    # -----------------------------------------------------

    return {
        'prediction': int(prediction),

        'probability': float(
            probability
        ),

        'likely_to_complete': bool(
            prediction == 1
        ),
    }