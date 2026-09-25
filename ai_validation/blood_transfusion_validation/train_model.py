

"""
train_model.py

METHODOLOGY-VALIDATION EXPERIMENT FOR FEEDFORWARD.

This script is NOT FeedForward's production AI model.
It uses the real UCI Blood Transfusion dataset to validate
the planned Logistic Regression approach.
"""

import os
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    roc_auc_score,
    classification_report,
)


DATA_PATH = os.path.join(
    os.path.dirname(__file__),
    "data",
    "transfusion.csv"
)

RESULTS_PATH = os.path.join(
    os.path.dirname(__file__),
    "results",
    "evaluation_report.txt"
)


def load_data():
    """Load the real dataset."""
    df = pd.read_csv(DATA_PATH)
    return df


def prepare_features(df):
    """
    Prepare features and target.

    Features:
    - Recency
    - Frequency
    - Time

    Target:
    - donated = 1
    - not donated = 0

    Monetary is intentionally not used because it is
    perfectly correlated with Frequency in this dataset.
    """

    features = df[
        ["Recency", "Frequency", "Time"]
    ].copy()

    target = (
        df["Class"] == "donated"
    ).astype(int)

    return features, target


def train_and_evaluate():

    # Step 1: Load real data
    df = load_data()

    # Step 2: Prepare features and target
    X, y = prepare_features(df)

    print(f"Loaded {len(df)} real donor records.")

    print(
        "Class balance:\n"
        f"{y.value_counts(normalize=True)}\n"
    )

    # Step 3: Split data into training and testing
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

    # Step 4: Scale features
    scaler = StandardScaler()

    X_train_scaled = scaler.fit_transform(
        X_train
    )

    X_test_scaled = scaler.transform(
        X_test
    )

    # Step 5: Train Logistic Regression
    model = LogisticRegression(
        class_weight="balanced",
        random_state=42
    )

    model.fit(
        X_train_scaled,
        y_train
    )

    # Step 6: Make predictions
    y_pred = model.predict(
        X_test_scaled
    )

    y_proba = model.predict_proba(
        X_test_scaled
    )[:, 1]

    # Step 7: Calculate evaluation metrics
    accuracy = accuracy_score(
        y_test,
        y_pred
    )

    precision = precision_score(
        y_test,
        y_pred
    )

    recall = recall_score(
        y_test,
        y_pred
    )

    f1 = f1_score(
        y_test,
        y_pred
    )

    confusion = confusion_matrix(
        y_test,
        y_pred
    )

    roc_auc = roc_auc_score(
        y_test,
        y_proba
    )

    report = classification_report(
        y_test,
        y_pred,
        target_names=[
            "not donated",
            "donated"
        ]
    )

    # Get model coefficients
    coefficients = dict(
        zip(
            X.columns,
            model.coef_[0]
        )
    )

    # Step 8: Create report
    lines = []

    lines.append("=" * 60)
    lines.append(
        "FEEDFORWARD - AI METHODOLOGY "
        "VALIDATION EXPERIMENT"
    )
    lines.append(
        "Dataset: UCI Blood Transfusion "
        "Service Center (real data)"
    )
    lines.append(
        "Model: Logistic Regression "
        "(scikit-learn)"
    )
    lines.append("=" * 60)

    lines.append("")

    lines.append(
        f"Total real records used: {len(df)}"
    )

    lines.append(
        f"Training set size: {len(X_train)}"
    )

    lines.append(
        f"Test set size: {len(X_test)}"
    )

    lines.append(
        f"Features used: {list(X.columns)}"
    )

    lines.append(
        "Feature dropped: Monetary "
        "(perfectly correlated with Frequency, r=1.0)"
    )

    lines.append("")

    lines.append(
        "--- Learned model coefficients "
        "(on scaled features) ---"
    )

    for feature, coefficient in coefficients.items():

        lines.append(
            f"  {feature}: {coefficient:.4f}"
        )

    lines.append(
        f"  Intercept: "
        f"{model.intercept_[0]:.4f}"
    )

    lines.append("")

    lines.append(
        "--- Evaluation on held-out test set ---"
    )

    lines.append(
        f"Accuracy:  {accuracy:.4f}"
    )

    lines.append(
        f"Precision: {precision:.4f}"
    )

    lines.append(
        f"Recall:    {recall:.4f}"
    )

    lines.append(
        f"F1-score:  {f1:.4f}"
    )

    lines.append(
        f"ROC-AUC:   {roc_auc:.4f}"
    )

    lines.append("")

    lines.append(
        "Confusion matrix:"
    )

    lines.append(
        "                 Predicted: No   "
        "Predicted: Yes"
    )

    lines.append(
        f"Actual: No        "
        f"{confusion[0][0]:>10}      "
        f"{confusion[0][1]:>10}"
    )

    lines.append(
        f"Actual: Yes       "
        f"{confusion[1][0]:>10}      "
        f"{confusion[1][1]:>10}"
    )

    lines.append("")

    lines.append(
        "Full classification report:"
    )

    lines.append(report)

    lines.append("=" * 60)

    lines.append(
        "NOTE: This experiment validates the "
        "Logistic Regression methodology on "
        "REAL external data."
    )

    lines.append(
        "It is NOT FeedForward's production model."
    )

    lines.append(
        "FeedForward's real model will be trained "
        "later using FeedForward's own "
        "DonationMatch history."
    )

    lines.append("=" * 60)

    output_text = "\n".join(lines)

    # Display report
    print(output_text)

    # Save report
    os.makedirs(
        os.path.dirname(RESULTS_PATH),
        exist_ok=True
    )

    with open(
        RESULTS_PATH,
        "w",
        encoding="utf-8"
    ) as file:

        file.write(output_text)

    print(
        f"\nFull report saved to: "
        f"{RESULTS_PATH}"
    )


if __name__ == "__main__":
    train_and_evaluate()