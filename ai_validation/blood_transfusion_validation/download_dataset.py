

"""
download_dataset.py

Downloads the REAL UCI Blood Transfusion Service Center dataset.
"""

import urllib.request
import os

DATA_URL = (
    "https://raw.githubusercontent.com/INRIA/scikit-learn-mooc/"
    "main/datasets/blood_transfusion.csv"
)

OUTPUT_PATH = os.path.join(
    os.path.dirname(__file__),
    "data",
    "transfusion.csv"
)


def download():
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    print("Downloading real UCI Blood Transfusion dataset...")
    print(DATA_URL)

    urllib.request.urlretrieve(DATA_URL, OUTPUT_PATH)

    print(f"Saved to: {OUTPUT_PATH}")

    # Check number of rows
    with open(OUTPUT_PATH, encoding="utf-8") as f:
        line_count = sum(1 for _ in f)

    print(f"Row count including header: {line_count}")

    if line_count != 749:
        print(
            "WARNING: Expected 749 lines "
            "(1 header + 748 donor records)."
        )
    else:
        print(
            "Row count matches the documented "
            "UCI dataset size: 748 records."
        )


if __name__ == "__main__":
    download()