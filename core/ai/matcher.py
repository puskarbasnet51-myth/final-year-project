import os
import pickle
import pandas as pd
from datetime import date, datetime

_dir = os.path.dirname(os.path.abspath(__file__))


def _load():
    model_path  = os.path.join(_dir, 'matching_model.pkl')
    scaler_path = os.path.join(_dir, 'scaler.pkl')
    if not os.path.exists(model_path):
        return None, None
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    with open(scaler_path, 'rb') as f:
        scaler = pickle.load(f)
    return model, scaler


def _to_date(d):
    if isinstance(d, str):
        return datetime.strptime(d, '%Y-%m-%d').date()
    if isinstance(d, datetime):
        return d.date()
    return d


def get_match_score(donation_people, request_people,
                    donation_date, request_date):
    model, scaler = _load()
    donation_date = _to_date(donation_date)

    people_diff = abs(donation_people - request_people)
    day_of_week = donation_date.weekday()
    days_until  = max(0, (donation_date - date.today()).days)

    if model is None:
        return 1 if people_diff <= 10 else 0

    row = pd.DataFrame([{
        'people_diff': people_diff,
        'day_of_week': day_of_week,
        'days_until':  days_until
    }])
    row_scaled = scaler.transform(row)
    return int(model.predict(row_scaled)[0])


def find_best_match(donation_post, meal_requests):
    if not meal_requests:
        return None

    best       = None
    best_score = -9999

    for req in meal_requests:
        score       = get_match_score(
            donation_post.people_count,
            req.people_count,
            donation_post.donation_date,
            req.preferred_date,
        )
        people_diff = abs(donation_post.people_count - req.people_count)
        composite   = score * 100 - people_diff

        if composite > best_score:
            best_score = composite
            best       = req

    return best