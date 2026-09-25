import os
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report,
)


# ---------------------------------------------------------
# Paths
# ---------------------------------------------------------

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

DATA_FILE = os.path.join(
    BASE_DIR,
    'ai_model',
    'data',
    'donation_completion_history.csv'
)

MODELS_DIR = os.path.join(
    BASE_DIR,
    'ai_model',
    'models'
)

RESULTS_DIR = os.path.join(
    BASE_DIR,
    'ai_model',
    'results'
)

os.makedirs(
    MODELS_DIR,
    exist_ok=True
)

os.makedirs(
    RESULTS_DIR,
    exist_ok=True
)


MODEL_FILE = os.path.join(
    MODELS_DIR,
    'donation_completion_model.joblib'
)

SCALER_FILE = os.path.join(
    MODELS_DIR,
    'donation_completion_scaler.joblib'
)

REPORT_FILE = os.path.join(
    RESULTS_DIR,
    'donation_completion_evaluation.txt'
)


# ---------------------------------------------------------
# Load data
# ---------------------------------------------------------

df = pd.read_csv(DATA_FILE)

print()
print('==============================================')
print('FeedForward Donation Completion AI')
print('==============================================')

print(
    f'Total records: {len(df)}'
)


# ---------------------------------------------------------
# Features
# ---------------------------------------------------------

FEATURES = [
    'people_count',
    'preparation_method',
    'previous_completed_count',
    'previous_total_count',
    'previous_completion_rate',
]

TARGET = 'donation_completed'


X = df[FEATURES].copy()
y = df[TARGET].copy()


print()
print('Features:')
for feature in FEATURES:
    print(f'- {feature}')

print()
print('Target:')
print('- donation_completed')


# ---------------------------------------------------------
# Check classes
# ---------------------------------------------------------

if y.nunique() < 2:

    print()
    print(
        'ERROR: The training data contains only '
        'one target class.'
    )

    print(
        'The model needs both completed and '
        'not-completed records.'
    )

    raise SystemExit(1)


# ---------------------------------------------------------
# Train/test split
# ---------------------------------------------------------

test_size = 0.30

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=test_size,
    random_state=42,
    stratify=y
)


print()
print(
    f'Training records: {len(X_train)}'
)

print(
    f'Test records: {len(X_test)}'
)


# ---------------------------------------------------------
# Scaling
# ---------------------------------------------------------

scaler = StandardScaler()

X_train_scaled = scaler.fit_transform(
    X_train
)

X_test_scaled = scaler.transform(
    X_test
)


# ---------------------------------------------------------
# Logistic Regression
# ---------------------------------------------------------

model = LogisticRegression(
    class_weight='balanced',
    random_state=42,
    max_iter=1000
)

model.fit(
    X_train_scaled,
    y_train
)


# ---------------------------------------------------------
# Predictions
# ---------------------------------------------------------

predictions = model.predict(
    X_test_scaled
)

probabilities = model.predict_proba(
    X_test_scaled
)[:, 1]


# ---------------------------------------------------------
# Evaluation
# ---------------------------------------------------------

accuracy = accuracy_score(
    y_test,
    predictions
)

precision = precision_score(
    y_test,
    predictions,
    zero_division=0
)

recall = recall_score(
    y_test,
    predictions,
    zero_division=0
)

f1 = f1_score(
    y_test,
    predictions,
    zero_division=0
)

try:
    roc_auc = roc_auc_score(
        y_test,
        probabilities
    )
except ValueError:
    roc_auc = 0.0


matrix = confusion_matrix(
    y_test,
    predictions
)

report = classification_report(
    y_test,
    predictions,
    zero_division=0
)


# ---------------------------------------------------------
# Save model
# ---------------------------------------------------------

joblib.dump(
    model,
    MODEL_FILE
)

joblib.dump(
    scaler,
    SCALER_FILE
)


# ---------------------------------------------------------
# Save evaluation report
# ---------------------------------------------------------

with open(
    REPORT_FILE,
    'w',
    encoding='utf-8'
) as file:

    file.write(
        'FeedForward Donation Completion AI\n'
    )

    file.write(
        '====================================\n\n'
    )

    file.write(
        'Purpose:\n'
    )

    file.write(
        'Predict the probability that a specific '
        'donation will be completed.\n\n'
    )

    file.write(
        f'Total records: {len(df)}\n'
    )

    file.write(
        f'Training records: {len(X_train)}\n'
    )

    file.write(
        f'Test records: {len(X_test)}\n\n'
    )

    file.write(
        'Features:\n'
    )

    for feature in FEATURES:
        file.write(
            f'- {feature}\n'
        )

    file.write(
        '\nTarget: donation_completed\n\n'
    )

    file.write(
        f'Accuracy: {accuracy:.4f}\n'
    )

    file.write(
        f'Precision: {precision:.4f}\n'
    )

    file.write(
        f'Recall: {recall:.4f}\n'
    )

    file.write(
        f'F1-score: {f1:.4f}\n'
    )

    file.write(
        f'ROC-AUC: {roc_auc:.4f}\n\n'
    )

    file.write(
        'Confusion Matrix:\n'
    )

    file.write(
        str(matrix)
    )

    file.write(
        '\n\nClassification Report:\n'
    )

    file.write(report)


# ---------------------------------------------------------
# Display
# ---------------------------------------------------------

print()
print('Model saved:')
print(MODEL_FILE)

print()
print('Scaler saved:')
print(SCALER_FILE)

print()
print('----------------------------------------------')
print(f'Accuracy:  {accuracy:.4f}')
print(f'Precision: {precision:.4f}')
print(f'Recall:    {recall:.4f}')
print(f'F1-score:  {f1:.4f}')
print(f'ROC-AUC:   {roc_auc:.4f}')

print()
print('Confusion matrix:')
print(matrix)

print()
print('Evaluation report saved:')
print(REPORT_FILE)