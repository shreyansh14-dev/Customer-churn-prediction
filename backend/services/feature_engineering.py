"""
MLVerse Feature Engineering Service
Transforms raw uploaded CSV data into model-ready features for each domain.
This mirrors the exact preprocessing done during training.
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple


# ─────────────────────────────────────────────────────
# DOMAIN DETECTION
# ─────────────────────────────────────────────────────

def detect_domain_from_columns(columns: List[str]) -> str:
    """
    Detect which ML domain best matches the uploaded dataset columns.
    Returns: 'telecom' | 'banking' | 'streaming' | 'saas' | 'retail' | 'credit' | 'ecommerce'
    """
    cols_lower = [c.lower() for c in columns]

    telecom_signals  = {'monthlycharges', 'totalcharges', 'internetservice', 'phoneservice',
                        'contract', 'paperlessbilling', 'paymentmethod', 'multiplelines',
                        'onlinesecurity', 'techsupport', 'streamingmovies', 'streamingtv'}
    banking_signals  = {'creditscore', 'balance', 'numofproducts', 'hascrcard',
                        'isactivemember', 'estimatedsalary', 'exited', 'geography'}
    streaming_signals = {'weekly_hours', 'song_skip_rate', 'playlist', 'num_playlists',
                         'num_favorite_artists', 'weekly_songs_played', 'notifications_clicked'}
    saas_signals     = {'mrr', 'arr', 'sessions_last_month', 'feature_usage_score',
                        'support_tickets_total', 'payment_failures_total', 'active_seats'}
    credit_signals   = {'amt_credit', 'amt_annuity', 'sk_id_curr', 'ext_source',
                        'debt_to_income', 'amt_income_total'}
    retail_signals   = {'stockcode', 'description', 'invoiceno', 'quantity', 'unitprice',
                        'recency', 'monetary_value', 'rfm'}
    commerce_signals = {'total_events', 'view_count', 'cart_count', 'hist_purchase_count',
                        'cart_to_view_ratio', 'intent_score'}

    def score(signals):
        return sum(1 for s in signals if any(s in c for c in cols_lower))

    scores = {
        'telecom':   score(telecom_signals),
        'banking':   score(banking_signals),
        'streaming': score(streaming_signals),
        'saas':      score(saas_signals),
        'credit':    score(credit_signals),
        'retail':    score(retail_signals),
        'ecommerce': score(commerce_signals),
    }

    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else 'saas'


def get_model_for_domain(domain: str) -> str:
    return {
        'telecom':   'churniq_telecom',
        'banking':   'churniq_banking',
        'streaming': 'churniq_streaming',
        'saas':      'churniq_saas',
        'credit':    'creditriskiq',
        'retail':    'retailiq',
        'ecommerce': 'commerceiq',
    }.get(domain, 'churniq_saas')


# ─────────────────────────────────────────────────────
# PER-DOMAIN FEATURE ENGINEERING
# ─────────────────────────────────────────────────────

def _col(df: pd.DataFrame, *candidates) -> pd.Series:
    """Return the first matching column (case-insensitive), or a Series of zeros."""
    col_lower = {c.lower(): c for c in df.columns}
    for cand in candidates:
        if cand.lower() in col_lower:
            return pd.to_numeric(df[col_lower[cand.lower()]], errors='coerce').fillna(0)
    return pd.Series(0.0, index=df.index)


def _col_str(df: pd.DataFrame, *candidates) -> pd.Series:
    """Return the first matching string column (case-insensitive)."""
    col_lower = {c.lower(): c for c in df.columns}
    for cand in candidates:
        if cand.lower() in col_lower:
            return df[col_lower[cand.lower()]].astype(str).str.strip()
    return pd.Series('', index=df.index)


def engineer_telecom(df: pd.DataFrame) -> pd.DataFrame:
    """Transform raw Telecom CSV (Kaggle-style) → churniq_telecom features."""
    out = pd.DataFrame(index=df.index)

    tenure          = _col(df, 'tenure')
    monthly_charges = _col(df, 'MonthlyCharges', 'monthly_charges')
    total_charges   = _col(df, 'TotalCharges', 'total_charges')

    out['tenure']            = tenure
    out['MonthlyCharges']    = monthly_charges
    out['TotalCharges']      = total_charges
    out['charges_per_tenure']= monthly_charges / (tenure + 1)

    # Binary flags from categorical columns
    senior   = _col_str(df, 'SeniorCitizen')
    out['is_senior'] = pd.to_numeric(
        _col(df, 'SeniorCitizen'), errors='coerce').fillna(0).clip(0, 1)
    out['has_partner']   = (_col_str(df, 'Partner').str.lower() == 'yes').astype(float)
    out['has_dependents']= (_col_str(df, 'Dependents').str.lower() == 'yes').astype(float)
    out['has_phone']     = (_col_str(df, 'PhoneService').str.lower() == 'yes').astype(float)

    internet = _col_str(df, 'InternetService').str.lower()
    out['has_fiber'] = (internet == 'fiber optic').astype(float)
    out['has_dsl']   = (internet == 'dsl').astype(float)

    def yes_col(name):
        return (_col_str(df, name).str.lower() == 'yes').astype(float)

    out['has_tech_support']      = yes_col('TechSupport')
    out['has_online_security']   = yes_col('OnlineSecurity')
    out['has_online_backup']     = yes_col('OnlineBackup')
    out['has_device_protection'] = yes_col('DeviceProtection')
    out['has_streaming_tv']      = yes_col('StreamingTV')
    out['has_streaming_movies']  = yes_col('StreamingMovies')

    contract = _col_str(df, 'Contract').str.lower()
    out['is_month_to_month'] = (contract == 'month-to-month').astype(float)
    out['is_one_year']       = (contract == 'one year').astype(float)
    out['is_two_year']       = (contract == 'two year').astype(float)

    out['is_paperless'] = yes_col('PaperlessBilling')

    payment = _col_str(df, 'PaymentMethod').str.lower()
    out['is_auto_pay'] = payment.str.contains('automatic|auto', na=False).astype(float)

    out['total_services'] = (
        out['has_phone'] + out['has_tech_support'] + out['has_online_security'] +
        out['has_online_backup'] + out['has_device_protection'] +
        out['has_streaming_tv'] + out['has_streaming_movies']
    )

    out['mrr']            = monthly_charges
    out['arr']            = monthly_charges * 12
    out['customer_value'] = total_charges
    out['payment_health'] = (1 - out['is_month_to_month']) * 0.5 + out['is_auto_pay'] * 0.5
    out['support_burden'] = (1 - out['has_tech_support']) * 0.5 + out['has_fiber'] * 0.3

    return out.fillna(0)


def engineer_banking(df: pd.DataFrame) -> pd.DataFrame:
    """Transform raw Banking CSV (Kaggle-style) → churniq_banking features."""
    out = pd.DataFrame(index=df.index)

    credit_score     = _col(df, 'CreditScore', 'credit_score')
    age              = _col(df, 'Age', 'age')
    tenure           = _col(df, 'Tenure', 'tenure')
    balance          = _col(df, 'Balance', 'balance')
    num_products     = _col(df, 'NumOfProducts', 'num_of_products', 'numofproducts')
    salary           = _col(df, 'EstimatedSalary', 'estimated_salary', 'salary')

    out['CreditScore']      = credit_score
    out['Age']              = age
    out['Tenure']           = tenure
    out['Balance']          = balance
    out['NumOfProducts']    = num_products
    out['HasCrCard']        = _col(df, 'HasCrCard', 'has_cr_card').clip(0, 1)
    out['IsActiveMember']   = _col(df, 'IsActiveMember', 'is_active_member').clip(0, 1)
    out['EstimatedSalary']  = salary

    # Engineered features
    out['balance_to_salary']  = (balance / (salary + 1)).clip(0, 10)
    out['credit_score_tier']  = pd.cut(credit_score, bins=[0, 580, 670, 740, 800, 900],
                                        labels=[1, 2, 3, 4, 5]).astype(float).fillna(2)
    out['age_over_50']        = (age > 50).astype(float)
    out['products_per_tenure']= (num_products / (tenure + 1)).clip(0, 5)

    geography = _col_str(df, 'Geography', 'geography', 'country').str.lower()
    out['is_france']  = (geography == 'france').astype(float)
    out['is_germany'] = (geography == 'germany').astype(float)
    out['is_spain']   = (geography == 'spain').astype(float)

    gender = _col_str(df, 'Gender', 'gender').str.lower()
    out['is_female'] = (gender == 'female').astype(float)

    out['is_zero_balance']       = (balance == 0).astype(float)
    out['high_value_customer']   = (balance > salary * 0.5).astype(float)

    out['mrr']            = (salary / 12 * 0.02).clip(50, 500)
    out['arr']            = out['mrr'] * 12
    out['customer_value'] = balance + salary * 0.1
    out['payment_health'] = (credit_score / 900).clip(0, 1)

    return out.fillna(0)


def engineer_streaming(df: pd.DataFrame) -> pd.DataFrame:
    """Transform raw Streaming CSV → churniq_streaming features."""
    out = pd.DataFrame(index=df.index)

    out['age']                     = _col(df, 'age')
    out['weekly_hours']            = _col(df, 'weekly_hours', 'hours_per_week')
    out['average_session_length']  = _col(df, 'average_session_length', 'avg_session_length')
    out['song_skip_rate']          = _col(df, 'song_skip_rate', 'skip_rate')
    out['weekly_songs_played']     = _col(df, 'weekly_songs_played', 'songs_played')
    out['weekly_unique_songs']     = _col(df, 'weekly_unique_songs', 'unique_songs')
    out['num_favorite_artists']    = _col(df, 'num_favorite_artists', 'favorite_artists')
    out['num_platform_friends']    = _col(df, 'num_platform_friends', 'friends')
    out['num_playlists_created']   = _col(df, 'num_playlists_created', 'playlists')
    out['num_shared_playlists']    = _col(df, 'num_shared_playlists', 'shared_playlists')
    out['notifications_clicked']   = _col(df, 'notifications_clicked', 'notifications')
    out['num_subscription_pauses'] = _col(df, 'num_subscription_pauses', 'pauses')
    out['support_contacted']       = _col(df, 'support_contacted', 'support_tickets')

    # Derived features
    wh = out['weekly_hours'].clip(0.1, 168)
    ws = out['weekly_songs_played'].clip(0.1, 10000)
    out['skip_rate_per_song']  = (out['song_skip_rate'] / ws).clip(0, 1)
    out['songs_per_hour']      = (ws / wh).clip(0, 100)
    unique = out['weekly_unique_songs'].clip(0.1, ws)
    out['variety_ratio']       = (unique / ws).clip(0, 1)
    out['social_score']        = (out['num_platform_friends'] + out['num_shared_playlists']) / 2
    out['playlist_intensity']  = out['num_playlists_created'] / (wh / 10).clip(1, None)
    out['pause_risk']          = out['num_subscription_pauses'].clip(0, 10) / 10

    plan = _col_str(df, 'plan', 'subscription_type', 'Plan').str.lower()
    out['is_premium'] = plan.str.contains('premium', na=False).astype(float)
    out['is_family']  = plan.str.contains('family', na=False).astype(float)
    out['is_student'] = plan.str.contains('student', na=False).astype(float)
    out['is_annual']  = plan.str.contains('annual|yearly', na=False).astype(float)

    mrr_val = _col(df, 'mrr', 'monthly_fee', 'monthly_price', 'MonthlyCharges')
    out['tenure']         = _col(df, 'tenure', 'tenure_months')
    out['mrr']            = mrr_val.where(mrr_val > 0, 9.99)
    out['arr']            = out['mrr'] * 12
    out['customer_value'] = out['mrr'] * (out['tenure'] + 1)
    out['engagement']     = (out['weekly_hours'] / 10).clip(0, 1)
    out['payment_health'] = 1 - (out['num_subscription_pauses'] / 10).clip(0, 1)
    out['support_burden'] = (out['support_contacted'] / 5).clip(0, 1)

    return out.fillna(0)


def engineer_saas(df: pd.DataFrame) -> pd.DataFrame:
    """Transform raw B2B SaaS CSV → churniq_saas features."""
    out = pd.DataFrame(index=df.index)

    tenure  = _col(df, 'tenure', 'tenure_months', 'months_active', 'account_age')
    mrr     = _col(df, 'mrr', 'monthly_charges', 'monthly_revenue', 'monthly_fee', 'MonthlyCharges')
    sessions= _col(df, 'sessions_last_month', 'sessions', 'logins', 'activity_count')
    usage   = _col(df, 'feature_usage_score', 'usage_score', 'adoption_score', 'engagement_score')
    tickets = _col(df, 'support_tickets_total', 'support_tickets', 'tickets')
    fails   = _col(df, 'payment_failures_total', 'payment_failures', 'failed_payments')
    seats   = _col(df, 'active_seats', 'company_size', 'seats', 'employees')

    out['tenure']                  = tenure
    out['mrr']                     = mrr.where(mrr > 0, 99)
    out['avg_mrr']                 = out['mrr']
    out['monthly_price']           = out['mrr']
    out['sessions_last_month']     = sessions
    out['sessions_mean']           = sessions
    out['sessions_std']            = sessions * 0.2
    out['feature_usage_score']     = usage.where(usage > 0, 50)
    out['feature_usage_trend']     = (usage - 50) / 50
    out['support_tickets_total']   = tickets
    out['support_tickets_recent']  = tickets
    out['payment_failures_total']  = fails
    out['payment_failures_recent'] = fails
    out['active_seats']            = seats.where(seats > 0, 5)
    out['arr']                     = out['mrr'] * 12
    out['activity_trend']          = (sessions - 20) / 20
    out['usage_volatility']        = usage * 0.1
    out['support_burden']          = (tickets / 5).clip(0, 1)
    out['payment_health']          = (1 - (fails / 3).clip(0, 1))
    out['company_size']            = out['active_seats']
    out['customer_value']          = out['mrr'] * (tenure + 1)
    out['recency']                 = _col(df, 'recency', 'days_inactive', 'inactivity_days')
    out['frequency']               = sessions
    out['monetary_value']          = out['customer_value']
    out['engagement']              = (sessions / 30).clip(0, 1)
    out['subscription_health']     = out['payment_health'] * out['engagement']

    # Country one-hots (default US)
    for c in ['BR', 'CA', 'DE', 'FR', 'GB', 'IN', 'NL', 'SG', 'US']:
        out[f'country_{c}'] = 0.0
    out['country_US'] = 1.0

    # Plan one-hots (default Starter)
    for p in ['Enterprise', 'Pro', 'Starter']:
        out[f'plan_type_{p}'] = 0.0
    plan = _col_str(df, 'plan', 'plan_type', 'contract', 'Contract').str.lower()
    out['plan_type_Enterprise'] = plan.str.contains('enterprise', na=False).astype(float)
    out['plan_type_Pro']        = plan.str.contains('pro|business', na=False).astype(float)
    out['plan_type_Starter']    = (~(out['plan_type_Enterprise'].astype(bool) |
                                      out['plan_type_Pro'].astype(bool))).astype(float)

    return out.fillna(0)


def engineer_credit(df: pd.DataFrame) -> pd.DataFrame:
    """Transform raw credit/loan CSV → creditriskiq features."""
    out = pd.DataFrame(index=df.index)

    income  = _col(df, 'AMT_INCOME_TOTAL', 'income', 'annual_income')
    credit  = _col(df, 'AMT_CREDIT', 'loan_amount', 'credit_amount')
    annuity = _col(df, 'AMT_ANNUITY', 'annuity')
    goods   = _col(df, 'AMT_GOODS_PRICE', 'goods_price')
    age     = _col(df, 'age_years', 'age', 'DAYS_BIRTH')
    employed= _col(df, 'employed_years', 'DAYS_EMPLOYED', 'employment_years')
    ext1    = _col(df, 'EXT_SOURCE_1', 'ext_source_1')
    ext2    = _col(df, 'EXT_SOURCE_2', 'ext_source_2', 'credit_score')
    ext3    = _col(df, 'EXT_SOURCE_3', 'ext_source_3')

    # Convert DAYS_BIRTH/DAYS_EMPLOYED (negative days) to years if needed
    if age.min() < -100:
        age = (-age / 365).clip(18, 90)
    if employed.min() < -100:
        employed = (-employed / 365).clip(0, 50)

    out['AMT_INCOME_TOTAL']   = income.where(income > 0, 50000)
    out['AMT_CREDIT']         = credit.where(credit > 0, 100000)
    out['AMT_ANNUITY']        = annuity.where(annuity > 0, credit * 0.05)
    out['debt_to_income']     = (credit / (income + 1)).clip(0, 20)
    out['annuity_to_income']  = (out['AMT_ANNUITY'] / (income + 1)).clip(0, 1)
    out['credit_to_annuity']  = (credit / (out['AMT_ANNUITY'] + 1)).clip(0, 50)
    out['goods_to_credit']    = (goods / (credit + 1)).clip(0, 2)
    out['age_years']          = age.where(age > 0, 35)
    out['employed_years']     = employed.clip(0, 50)

    ext_mean = pd.concat([ext1, ext2, ext3], axis=1)
    ext_mean[ext_mean <= 0] = np.nan
    out['ext_source_mean'] = ext_mean.mean(axis=1).fillna(0.5)

    loan_type = _col_str(df, 'NAME_CONTRACT_TYPE', 'loan_type', 'contract_type').str.lower()
    out['is_cash_loan'] = loan_type.str.contains('cash', na=False).astype(float)

    out['own_car']      = (_col_str(df, 'FLAG_OWN_CAR', 'own_car').str.upper() == 'Y').astype(float)
    out['own_realty']   = (_col_str(df, 'FLAG_OWN_REALTY', 'own_realty').str.upper() == 'Y').astype(float)
    out['has_children'] = (_col(df, 'CNT_CHILDREN', 'num_children', 'children') > 0).astype(float)
    out['region_rating']= _col(df, 'REGION_RATING_CLIENT', 'region_rating').clip(1, 3)

    return out.fillna(0)


# ─────────────────────────────────────────────────────
# MAIN ENTRY POINT
# ─────────────────────────────────────────────────────

def engineer_features(df: pd.DataFrame, domain: str = None) -> Tuple[pd.DataFrame, str, str]:
    """
    Detect domain, apply feature engineering, return (engineered_df, domain, model_name).
    """
    if domain is None:
        domain = detect_domain_from_columns(list(df.columns))

    model_name = get_model_for_domain(domain)

    if domain == 'telecom':
        engineered = engineer_telecom(df)
    elif domain == 'banking':
        engineered = engineer_banking(df)
    elif domain == 'streaming':
        engineered = engineer_streaming(df)
    elif domain == 'credit':
        engineered = engineer_credit(df)
    else:
        # SaaS, retail, ecommerce — try best-effort SaaS mapping
        engineered = engineer_saas(df)

    # Preserve ID column from original data
    for id_col in ['customer_id', 'customerID', 'CustomerID', 'user_id', 'id', 'SK_ID_CURR']:
        if id_col in df.columns:
            engineered['_id'] = df[id_col].astype(str).values
            break
    else:
        engineered['_id'] = [f'CUST-{i+1:05d}' for i in range(len(df))]

    # Preserve raw revenue/value columns for display
    for raw_col in ['MonthlyCharges', 'Balance', 'EstimatedSalary', 'TotalCharges',
                    'mrr', 'monthly_charges', 'monthly_revenue']:
        if raw_col in df.columns:
            engineered[f'_raw_{raw_col.lower()}'] = pd.to_numeric(
                df[raw_col], errors='coerce').fillna(0).values

    return engineered, domain, model_name
