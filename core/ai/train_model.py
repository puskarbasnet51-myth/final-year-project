import os
import pickle
import pandas as pd
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report
import random

random.seed(42)
n = 500

people_diff = [random.randint(0, 30) for _ in range(n)]
day_of_week = [random.randint(0, 6) for _ in range(n)]
days_until  = [random.randint(0, 14) for _ in range(n)]
labels      = [
    1 if people_diff[i] <= 10 and days_until[i] <= 7 else 0
    for i in range(n)
]

df = pd.DataFrame({
    'people_diff': people_diff,
    'day_of_week': day_of_week,
    'days_until':  days_until,
    'label':       labels
})

X = df[['people_diff', 'day_of_week', 'days_until']]
y = df['label']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

scaler      = StandardScaler()
X_train_sc  = scaler.fit_transform(X_train)
X_test_sc   = scaler.transform(X_test)

model = KNeighborsClassifier(n_neighbors=5)
model.fit(X_train_sc, y_train)

y_pred = model.predict(X_test_sc)
acc    = accuracy_score(y_test, y_pred)
print(f"\nModel Accuracy: {acc * 100:.2f}%")
print(classification_report(y_test, y_pred))

model_dir = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(model_dir, 'matching_model.pkl'), 'wb') as f:
    pickle.dump(model, f)
with open(os.path.join(model_dir, 'scaler.pkl'), 'wb') as f:
    pickle.dump(scaler, f)

print("Model saved successfully.")