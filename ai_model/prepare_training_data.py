import os
import sys
import django
import pandas as pd

# ---------------------------------------------------------
# Django setup
# ---------------------------------------------------------

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

sys.path.append(BASE_DIR)

os.environ.setdefault(
    'DJANGO_SETTINGS_MODULE',
    'feedforward.settings'
)

django.setup()

# ---------------------------------------------------------
# Import models
# ---------------------------------------------------------

from core.models import DonationPost


# ---------------------------------------------------------
# Output location
# ---------------------------------------------------------

DATA_DIR = os.path.join(
    BASE_DIR,
    'ai_model',
    'data'
)

os.makedirs(
    DATA_DIR,
    exist_ok=True
)

OUTPUT_FILE = os.path.join(
    DATA_DIR,
    'donation_completion_history.csv'
)


# ---------------------------------------------------------
# Get donation history
# ---------------------------------------------------------

donations = DonationPost.objects.all().order_by(
    'donor_id',
    'donation_date',
    'id'
)

rows = []

# Store previous donor information
donor_history = {}


for donation in donations:

    donor_id = donation.donor_id

    if donor_id not in donor_history:
        donor_history[donor_id] = {
            'completed_count': 0,
            'total_count': 0,
        }

    history = donor_history[donor_id]

    previous_completed_count = (
        history['completed_count']
    )

    previous_total_count = (
        history['total_count']
    )

    # -----------------------------------------------------
    # Donor historical completion rate
    # -----------------------------------------------------

    if previous_total_count > 0:
        previous_completion_rate = (
            previous_completed_count /
            previous_total_count
        )
    else:
        previous_completion_rate = 0.0

    # -----------------------------------------------------
    # Preparation method
    # -----------------------------------------------------

    if donation.preparation_method == 'home_cooked':
        preparation_method = 1
    else:
        preparation_method = 0

    # -----------------------------------------------------
    # Target
    #
    # 1 = completed
    # 0 = not completed in currently recorded outcome
    # -----------------------------------------------------

    completed = (
        1
        if donation.status == 'completed'
        else 0
    )

    rows.append({
        'donation_id': donation.id,
        'donor_id': donor_id,
        'people_count': donation.people_count,
        'preparation_method': preparation_method,
        'previous_completed_count':
            previous_completed_count,
        'previous_total_count':
            previous_total_count,
        'previous_completion_rate':
            previous_completion_rate,
        'donation_completed': completed,
    })

    # -----------------------------------------------------
    # Update donor history AFTER creating this row
    # -----------------------------------------------------

    history['total_count'] += 1

    if completed == 1:
        history['completed_count'] += 1


# ---------------------------------------------------------
# Create DataFrame
# ---------------------------------------------------------

df = pd.DataFrame(rows)


if df.empty:
    print('No donation records found.')
    sys.exit(1)


# ---------------------------------------------------------
# Save
# ---------------------------------------------------------

df.to_csv(
    OUTPUT_FILE,
    index=False
)


# ---------------------------------------------------------
# Output information
# ---------------------------------------------------------

print()
print('==============================================')
print('FeedForward Donation Completion Data')
print('==============================================')

print(
    f'Total donations used: {len(df)}'
)

print(
    f'Unique donors: {df["donor_id"].nunique()}'
)

print()
print('Target distribution:')
print(
    df['donation_completed'].value_counts()
)

print()
print('Training data:')
print(df.to_string(index=False))

print()
print('Saved to:')
print(OUTPUT_FILE)