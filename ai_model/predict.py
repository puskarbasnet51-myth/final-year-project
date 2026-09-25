

import os
import joblib
import pandas as pd


# ============================================================
# FEED FORWARD - DONOR BEHAVIOUR PREDICTION
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "donor_behaviour_model.joblib"
)

SCALER_PATH = os.path.join(
    BASE_DIR,
    "models",
    "donor_behaviour_scaler.joblib"
)


# ============================================================
# LOAD TRAINED MODEL
# ============================================================

model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)


# ============================================================
# TEST DONOR DATA
# ============================================================

people_count = 20
days_since_previous = 3


# ============================================================
# PREPARE INPUT
# ============================================================

input_data = pd.DataFrame({
    "people_count": [people_count],
    "days_since_previous": [days_since_previous]
})


# ============================================================
# SCALE INPUT
# ============================================================

input_scaled = scaler.transform(input_data)


# ============================================================
# MAKE PREDICTION
# ============================================================

prediction = model.predict(input_scaled)[0]

probability = model.predict_proba(input_scaled)[0][1]


# ============================================================
# DISPLAY RESULT
# ============================================================

print()
print("=" * 60)
print("FEED FORWARD - DONOR BEHAVIOUR PREDICTION")
print("=" * 60)

print()
print("Test donor information:")
print(f"People count: {people_count}")
print(f"Days since previous donation: {days_since_previous}")

print()

if prediction == 1:
    print("Prediction: LIKELY TO DONATE AGAIN WITHIN 7 DAYS")
else:
    print("Prediction: NOT LIKELY TO DONATE AGAIN WITHIN 7 DAYS")

print()
print(f"Prediction probability: {probability:.2%}")

print()
print("=" * 60)