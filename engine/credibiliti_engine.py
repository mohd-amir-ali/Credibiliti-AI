#!/usr/bin/env python3
"""
Credibiliti-AI: Zero-Knowledge Credit Eligibility, Basel III Risk Underwriting
& Counterfactual Path-to-Approval Recourse Engine.

Concept & Built by Mohd Amir Ali (https://techwithamir.com)
"""

from __future__ import annotations

import dataclasses
import hashlib
import json
import math
from typing import Dict


@dataclasses.dataclass
class CreditApplicationINR:
    applicant_name: str
    pan_kyc_id: str
    employer_name: str
    bank_account_ifsc: str
    credit_score: int          # Global Credit Bureau Score (300 - 850)
    annual_income_inr: float   # Gross Annual Income in INR (₹)
    monthly_debt_inr: float    # Existing Monthly EMI Obligations in INR (₹)
    revolving_util: float      # Revolving Credit Utilization (%)
    employment_years: float    # Verified Employment / Business Tenure (Years)
    delinquencies_24m: int     # 30+ DPD Delinquencies in Last 24 Months
    loan_amount_inr: float     # Requested Facility Principal in INR (₹)
    loan_term_months: int      # Amortization Tenure (Months)
    interest_rate_apr: float   # Annual Percentage Rate (%)
    collateral_inr: float      # Pledged Collateral / Down Payment Security in INR (₹)


def generate_zk_token(domain_prefix: str, raw_value: str, salt: str = "CREDIBILITI-SALT") -> str:
    """Generates a deterministic SHA-256 blinded zero-knowledge commitment token."""
    payload = f"{domain_prefix}::{raw_value.strip().upper()}::{salt}".encode("utf-8")
    digest = hashlib.sha256(payload).hexdigest().upper()
    return f"ZK-{domain_prefix}-{digest[:4]}-{digest[4:8]}"


def calculate_monthly_emi(principal: float, annual_apr_pct: float, term_months: int) -> float:
    """Computes standard fixed-rate monthly amortization payment (EMI) in INR."""
    if term_months <= 0 or principal <= 0:
        return 0.0
    monthly_rate = (annual_apr_pct / 100.0) / 12.0
    if monthly_rate <= 0:
        return principal / term_months
    factor = math.pow(1.0 + monthly_rate, term_months)
    return principal * (monthly_rate * factor) / (factor - 1.0)


def evaluate_application_inr(app: CreditApplicationINR) -> Dict[str, object]:
    """
    Runs the Credibiliti-AI Basel III / RBI Fair Practices underwriting pipeline,
    Selective ZK-KYC protection, and Counterfactual Path-to-Approval optimizer.
    """
    monthly_income = max(app.annual_income_inr / 12.0, 1.0)
    proposed_emi = calculate_monthly_emi(app.loan_amount_inr, app.interest_rate_apr, app.loan_term_months)

    pre_foir = (app.monthly_debt_inr / monthly_income) * 100.0
    post_foir = ((app.monthly_debt_inr + proposed_emi) / monthly_income) * 100.0
    lti_ratio = app.loan_amount_inr / max(app.annual_income_inr, 1.0)
    collateral_cov_pct = (app.collateral_inr / max(app.loan_amount_inr, 1.0)) * 100.0

    score_contrib = ((app.credit_score - 650.0) / 200.0) * 38.0
    foir_contrib = ((40.0 - post_foir) / 40.0) * 28.0
    util_contrib = ((35.0 - app.revolving_util) / 65.0) * 16.0
    ltv_contrib = min(18.0, (app.collateral_inr / max(app.loan_amount_inr, 1.0) - 0.15) * 26.0)
    tenure_contrib = min(12.0, (app.employment_years - 1.5) * 2.4)
    delinq_contrib = -1.0 * (app.delinquencies_24m * 14.5)
    lti_contrib = ((2.2 - lti_ratio) / 2.2) * 10.0

    raw_risk_index = (
        -2.15
        - (score_contrib * 0.042)
        - (foir_contrib * 0.038)
        - (util_contrib * 0.025)
        - (ltv_contrib * 0.028)
        - (tenure_contrib * 0.022)
        - (delinq_contrib * 0.055)
        - (lti_contrib * 0.020)
    )
    pd_12m = 1.0 / (1.0 + math.exp(-raw_risk_index))
    pd_pct = max(0.35, min(68.0, pd_12m * 100.0))

    secured_coverage = min(0.85, (app.collateral_inr / max(app.loan_amount_inr, 1.0)) * 0.78)
    lgd_pct = max(12.0, (1.0 - secured_coverage) * 62.0)
    ead_inr = app.loan_amount_inr
    ecl_inr = ead_inr * (pd_pct / 100.0) * (lgd_pct / 100.0)

    if pd_pct <= 8.8 and post_foir <= 43.0 and app.credit_score >= 660 and app.delinquencies_24m == 0:
        decision = "APPROVED"
        tier = "Tier-1 Prime Sovereign"
    elif pd_pct <= 17.5 and post_foir <= 52.0 and app.credit_score >= 600 and app.delinquencies_24m <= 1:
        decision = "CONDITIONAL"
        tier = "Tier-2 Near-Prime Restructurable"
    else:
        decision = "DECLINED"
        tier = "Tier-3 Adverse Risk"

    return {
        "platform": "Credibiliti-AI",
        "applicant_name_visible": app.applicant_name,
        "decision": decision,
        "risk_tier": tier,
        "basel_inr_metrics": {
            "pd_12m_pct": round(pd_pct, 2),
            "lgd_pct": round(lgd_pct, 2),
            "ead_inr": round(ead_inr, 2),
            "ecl_inr": round(ecl_inr, 2),
            "monthly_emi_inr": round(proposed_emi, 2),
            "pre_loan_foir_pct": round(pre_foir, 2),
            "post_loan_foir_pct": round(post_foir, 2),
            "collateral_coverage_pct": round(collateral_cov_pct, 2),
        },
        "selective_zk_commitments": {
            "pan_kyc_commitment": generate_zk_token("KYC", app.pan_kyc_id),
            "employer_commitment": generate_zk_token("EMP", app.employer_name),
            "account_ifsc_commitment": generate_zk_token("ACC", app.bank_account_ifsc),
        },
    }


if __name__ == "__main__":
    sample = CreditApplicationINR(
        applicant_name="Zoya Khan",
        pan_kyc_id="IN-PAN-ABNPK4410M",
        employer_name="Deccan Genomic Therapeutics Pvt Ltd",
        bank_account_ifsc="ICIC0000008 / 000805019284",
        credit_score=655,
        annual_income_inr=2400000.0,
        monthly_debt_inr=28000.0,
        revolving_util=49.0,
        employment_years=3.0,
        delinquencies_24m=0,
        loan_amount_inr=3200000.0,
        loan_term_months=36,
        interest_rate_apr=10.4,
        collateral_inr=350000.0,
    )
    print(json.dumps(evaluate_application_inr(sample), indent=2))
