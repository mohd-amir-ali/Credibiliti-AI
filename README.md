# Credibiliti-AI: Smart, Private Loan Eligibility & Instant Approval System

[![Launch Credibiliti-AI](https://img.shields.io/badge/Launch_App-Credibiliti--AI-000000?style=for-the-badge&logoColor=14B8A6)](https://mohd-amir-ali.github.io/Credibiliti-AI/)
[![Regulatory Framework](https://img.shields.io/badge/Framework-RBI_Fair_Practices_%26_Basel_III-14B8A6?style=for-the-badge)](./engine/credibiliti_engine.py)
[![Explainable AI](https://img.shields.io/badge/Explainability-SHAP_%26_Counterfactual_Recourse-E5A93C?style=for-the-badge)](https://mohd-amir-ali.github.io/Credibiliti-AI/)
[![Author](https://img.shields.io/badge/Built_by-techwithamir.com-0B111C?style=for-the-badge)](https://techwithamir.com)

**Credibiliti-AI** is a dual-portal credit underwriting and loan eligibility platform designed to solve a core tension in modern digital lending: how borrowers can verify their creditworthiness and receive actionable loan decisions without exposing sensitive personal identifiers to unnecessary data harvesting or demographic bias.

The system separates the lending workflow into a **Client Workspace** (for private eligibility checks, credit scale conversion, and loan restructuring) and a **Bank Underwriter Console** (for institutional risk assessment under Basel III and Reserve Bank of India Fair Practices guidelines).

---

## Core Concept & Problem Statement

Traditional loan origination pipelines require applicants to surrender raw Permanent Account Numbers (PAN), bank account details, employer records, and full bureau histories before knowing whether they even qualify for a facility. This creates three structural problems:

1. **Over-Collection of Sensitive KYC Data:** Early-stage eligibility checks expose raw financial identifiers across multiple intermediaries before a sanction is ever issued.
2. **Opaque "Black-Box" Rejections:** Borrowers who are declined rarely receive quantitative feedback on which risk factor caused the rejection or how to fix it.
3. **Subjective & Biased Underwriting:** When human underwriters inspect raw identity markers alongside financial ratios, unconscious demographic or employer-tier bias can influence credit decisions.

**Credibiliti-AI** addresses these challenges by combining cryptographic selective disclosure with transparent, formula-driven risk modeling.

---

## Ethical AI & Privacy Architecture

### 1. Selective Zero-Knowledge KYC Shield
Rather than hiding everything (which would make a pre-approval letter unusable at a bank) or exposing everything (which compromises borrower privacy), Credibiliti-AI implements **Selective Disclosure**:
* **Verified Legal Name Retained:** The applicant's legal name remains visible on the generated passkey and pre-approval letter so the receiving institution can bind the sanction to a real legal entity.
* **Cryptographic Masking of Sensitive Identifiers:** PAN / National ID (`ZK-KYC-...`), Salary Account and IFSC (`ZK-ACC-...`), Employer records (`ZK-EMP-...`), and raw bureau files are converted into deterministic SHA-256 commitments before reaching the underwriter queue.
* **Boolean Policy Predicates:** Instead of viewing raw personal files, the bank desk verifies four cryptographic policy predicates (`Credit Score Threshold`, `Post-Loan FOIR <= 42%`, `Revolving Utilization <= 45%`, and `Tenure / Collateral Stability`).

### 2. Algorithmic Fairness & Bias Prevention
Underwriting decisions in Credibiliti-AI rely strictly on cash-flow serviceability, collateral coverage, and repayment history. By blinding raw account numbers, PAN strings, and corporate hierarchy metadata during risk scoring, the engine evaluates every applicant on identical mathematical criteria.

### 3. Explainable Decisions & Right to Recourse (SHAP + Counterfactuals)
In line with ethical AI principles and RBI Fair Practices guidelines on transparent credit communication, no applicant receives an unexplained rejection:
* **7-Factor SHAP Attribution:** Both the borrower and the bank underwriter can inspect the exact positive or negative log-odds contribution of seven risk drivers: Credit Score (Global Bureau `300-850` or Indian CIBIL `300-900`), Post-Loan FOIR/DTI, Revolving Credit Utilization, Collateral & LTV Security, Employment Tenure, 24-Month Delinquency Record, and Loan-to-Income (LTI) Multiple.
* **Actionable Counterfactual Approval Boosters:** When an application falls into a `CONDITIONAL` or `DECLINED` tier, the engine calculates three concrete restructuring paths (Tenure Extension & Collateral Shield, Principal Right-Sizing, or Revolving Debt Consolidation) that show the borrower the exact adjustments required to reach a Tier-1 approval.

---

## Quantitative Risk Engine (Basel III & RBI Serviceability)

Both the browser engine (`app.js`) and the standalone Python verification script (`engine/credibiliti_engine.py`) compute institutional credit metrics in Indian Rupees (`₹`):

* **Equated Monthly Installment (EMI) & Post-Loan FOIR:** Calculates monthly debt service obligations and checks whether total post-loan fixed obligations remain within the 42.0% Fixed Obligation to Income Ratio (FOIR) benchmark.
* **12-Month Probability of Default (PD %):** Derived from a calibrated logistic risk index across the seven credit and serviceability factors.
* **Loss Given Default (LGD %) & Expected Credit Loss (ECL):** Adjusts loss severity based on pledged collateral coverage (`EAD * PD * LGD = ECL`) so underwriters can measure exact capital reserve impact before issuing a sanction seal.
* **Global Bureau & CIBIL Scale Interoperability:** Supports real-time conversion between the standard Global Credit Bureau scale (`300-850`) and the Indian CIBIL scale (`300-900`).

---

## Repository Structure

```text
Credibiliti-AI/
├── index.html                  # Client Workspace & Bank Underwriter Console interface
├── styles.css                  # Application layout and print/PDF stylesheet
├── app.js                      # Basel III risk engine, ZK masking, SHAP & counterfactual logic
├── engine/
│   ├── credibiliti_engine.py   # Standalone Python CLI verification engine
│   └── requirements.txt        # Python environment specification (standard library)
├── .gitignore                  # Git ignore rules for local environment files
└── README.md                   # Project documentation
```

---

## Quick Start

Run the web application locally:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

To run the standalone Python risk verification engine from the terminal:

```bash
python3 engine/credibiliti_engine.py
```

---

## Author

**Mohd Amir Ali**  
Portfolio: [techwithamir.com](https://techwithamir.com)
