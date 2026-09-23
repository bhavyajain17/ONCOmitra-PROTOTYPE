# ONCOmitra

> **From community screening to completed care — a human-supervised clinical decision-support platform for oral-cancer screening, prioritisation, referral tracking, and continuity of care.**

## 📌 Overview

**ONCOmitra** is a web-based prototype designed to address the **screening-to-care gap in oral cancer**.

The platform connects frontline screening with clinician review, referral coordination, biopsy tracking, and follow-up through a single patient journey.

The core idea is simple:

> **A screening result improves outcomes only when the patient reaches the next clinically appropriate step.**

In many care pathways, a patient may be screened and flagged as suspicious but still experience delays or loss to follow-up before clinical evaluation or biopsy. ONCOmitra is designed to make this journey **visible, trackable, and accountable**.

### Target Users

* ASHA / ANM / frontline health workers
* Primary Health Centre (PHC) teams
* Community Health Centre (CHC) teams
* Clinicians and dentists
* District-level healthcare teams
* Researchers working with approved de-identified data

### Main Purpose

ONCOmitra aims to:

* Structure community-level screening
* Support image and clinical information capture
* Prioritise cases for clinician review
* Generate and track referrals
* Assign follow-up responsibility
* Monitor biopsy and follow-up status
* Reduce loss to follow-up
* Provide an evidence-linked research interface
* Maintain a clear boundary between AI-assisted support and clinical decision-making

**ONCOmitra does not diagnose cancer autonomously. Clinical examination and appropriate diagnostic testing remain essential.**

---

# ✨ Features

## 🩺 1. Community Screening

The frontline workflow supports structured capture of:

* Patient information
* Consent
* Symptoms
* Risk factors and habits
* Lesion duration
* Lesion location
* Lesion appearance
* Clinical red flags
* Screening images
* Screening location and worker information

The intended workflow supports guided oral-image capture, including:

* Oral-cavity overview
* Close-up of suspicious area

---

## 📷 2. Image-Quality Awareness

The planned workflow checks image usability before downstream analysis.

Important quality factors include:

* Blur
* Lighting
* Glare
* Framing
* Lesion visibility

Example system response:

> **“Image quality insufficient: glare detected. Please recapture.”**

The purpose is to reduce the risk of making downstream prioritisation decisions from inadequate images.

---

## 🤖 3. Explainable Clinical Prioritisation

The current prototype demonstrates **rule-based clinical prioritisation** rather than a clinically validated cancer-detection model.

The prototype can organise cases into:

* 🟢 Low priority
* 🟡 Intermediate priority
* 🔴 High priority

It also displays contributing factors / reason codes so that the user can understand why a case was prioritised.

### Clinical boundary

> **The AI recommends. The workflow routes. The authorised clinician decides.**

The system is designed as clinical decision support and not as an autonomous diagnostic system.

---

## 👨‍⚕️ 4. Clinician Review

The intended clinician workflow allows authorised users to:

* Review the screening case
* Confirm priority
* Modify priority
* Request a repeat image
* Recommend referral
* Escalate a case
* Document an override rationale

This creates a **human-in-the-loop** workflow rather than an automated diagnostic decision.

---

## 🔗 5. Referral Coordination

For cases requiring further evaluation, the workflow supports:

* Referral generation
* Referral token
* Destination facility
* Expected next step
* Contact / appointment information
* Follow-up reminder
* Assigned follow-up owner

The objective is to make every referral **visible and accountable**.

---

## 📊 6. Closed-Loop Patient Journey

ONCOmitra models the complete pathway:

```text
Screening
    ↓
Clinician Review
    ↓
Referral
    ↓
Biopsy
    ↓
Result
    ↓
Follow-up
```

Instead of ending at “screened positive”, the system is designed to track what happens next.

---

## 📴 7. Offline-First Workflow

The prototype demonstrates an offline-first concept for frontline environments where connectivity may be unreliable.

The intended architecture supports:

```text
Capture Offline
      ↓
Local Queue
      ↓
Controlled Synchronisation
      ↓
Central Backend
```

Production synchronisation and secure backend infrastructure are part of the future implementation.

---

## 🧬 8. Research Intelligence Layer

ONCOmitra includes a research-oriented interface connecting clinical phenotype with molecular evidence.

Research markers represented in the prototype include:

* **TP53**
* **CDKN2A**
* **NOTCH1**
* **PIK3CA**
* **EGFR**
* **CASP8**

The research layer is intended to support future integration of:

* Clinical phenotype
* Histopathology
* Genomic data
* Transcriptomic datasets
* Biomarker research
* De-identified datasets
* Published literature

### Important

The molecular values shown in the prototype are **synthetic / illustrative data** and are not real patient biomarker measurements.

The research layer is **not a diagnostic or prognostic biomarker engine**.

---

## 🛡️ 9. Safety and Human Oversight

The architecture follows a human-supervised approach.

The system is designed so that the AI/LLM layer should not:

* Make an autonomous cancer diagnosis
* Independently approve or reject biopsy
* Override a clinician
* Modify patient records without authorisation
* Execute clinical actions without an authorised workflow step

The intended safety architecture includes:

* Consent-first intake
* Role-based access
* Least-privilege permissions
* Audit logging
* Uncertainty escalation
* Named referral ownership
* De-identified research data
* Controlled synchronisation

---

## 📈 10. Analytics and Audit

The platform is designed to measure continuity-of-care indicators such as:

* Time from screening to clinician review
* Assigned follow-up owner
* Referral completion rate
* Median screening-to-biopsy time
* Follow-up completion
* Image-quality rejection rate
* Repeat-capture rate
* Escalation events

These metrics are intended for future validation and real-world deployment.

---

# 🛠️ Tech Stack

## Frontend — Current Prototype

* HTML5
* CSS3
* JavaScript
* Responsive web interface
* Browser local storage / local prototype state
* Browser-based speech synthesis
* Client-side report / CSV functionality

## AI / Decision Support — Current Prototype

* Explainable rule-based prioritisation
* Structured clinical reason codes
* Human-in-the-loop workflow

> The current prototype does **not** claim to contain a clinically validated oral-cancer image-classification model.

## Backend — Future Architecture

* Python
* FastAPI
* PostgreSQL
* Secure REST APIs
* Role-based access control
* Audit services
* Controlled synchronisation

## Edge AI — Future Architecture

* TensorFlow Lite / ONNX
* Image-quality assessment
* Validated prioritisation models

## LLM Layer — Future Controlled Architecture

A guarded assistant designed for:

* Approved screening guidance
* Structured case summarisation
* Patient-friendly referral instructions
* Approved workflow guidance
* Aggregate programme queries

The LLM is not intended to make autonomous clinical decisions.

## Interoperability — Future

* ABDM / ABHA-compatible design
* FHIR-compatible exchange
* Approved healthcare-system integrations

---

# 📂 Project Structure

### Current MVP

```text
ONCOmitra/
│
├── index.html
├── assets/
│   ├── images/
│   └── icons/
│
├── css/
│   └── styles.css
│
├── js/
│   ├── app.js
│   ├── triage.js
│   ├── screening.js
│   ├── referral.js
│   └── analytics.js
│
├── data/
│   └── demo-data/
│
├── docs/
│   ├── research/
│   ├── architecture/
│   └── validation/
│
├── README.md
└── .gitignore
```

### Planned Production Architecture

```text
ONCOmitra/
│
├── frontend/
│   ├── screening/
│   ├── clinician/
│   ├── district/
│   └── research/
│
├── backend/
│   ├── api/
│   ├── models/
│   ├── services/
│   ├── authentication/
│   ├── referrals/
│   └── audit/
│
├── ai/
│   ├── image-quality/
│   └── prioritisation/
│
├── research/
│   ├── datasets/
│   ├── biomarkers/
│   └── literature/
│
├── docs/
│   ├── architecture/
│   ├── validation/
│   ├── privacy/
│   └── clinical-safety/
│
└── README.md
```

---

# 🔄 End-to-End Workflow

```text
┌──────────────────────────────┐
│ ASHA / ANM FRONTLINE WORKER  │
└──────────────┬───────────────┘
               ↓
       Consent + Screening
               ↓
       Risk & Symptom Capture
               ↓
        Guided Image Capture
               ↓
        Image Quality Check
               ↓
      Explainable Prioritisation
               ↓
┌──────────────────────────────┐
│      CLINICIAN REVIEW        │
└──────────────┬───────────────┘
               ↓
       Confirm / Modify /
          Escalate
               ↓
       Referral Generation
               ↓
       Referral Token + Owner
               ↓
          Clinical Visit
               ↓
            Biopsy
               ↓
            Result
               ↓
          Follow-up
               ↓
      Continuity Analytics
```

---

# 🔬 Research & Evidence Framework

ONCOmitra separates three different forms of evidence.

## 1. Published Evidence

Supports the underlying clinical workflow and research rationale.

Examples include:

* Community oral screening research
* Referral-completion evidence
* Oral-cancer diagnostic pathways
* OSCC molecular research
* Biomarker studies

## 2. Prototype Evidence

Demonstrated through software testing:

* Screening workflow
* Structured data capture
* Rule-based prioritisation
* Explainability
* Referral generation
* Patient journey tracking
* Offline queue concept
* Audit workflow

## 3. Future Clinical Evidence

Requires formal validation:

* Sensitivity
* Specificity
* False-negative rate
* Clinician-system agreement
* Image-quality performance
* Referral completion
* Time to clinician review
* Time to biopsy
* Follow-up completion
* Usability
* Prospective clinical outcomes

> **Prototype verification is not clinical validation.**

---

# 🧪 Validation Roadmap

### Phase 1 — Prototype Verification

Test:

* Screening scenarios
* Triage scenarios
* Referral generation
* Patient journey states
* Offline workflow
* Audit events

### Phase 2 — Retrospective Validation

Use approved/de-identified datasets to evaluate:

* Sensitivity
* Specificity
* False negatives
* Clinician agreement
* Image quality

### Phase 3 — Prospective Clinical Evaluation

Evaluate:

* Referral completion
* Time to clinical review
* Time to biopsy
* Follow-up completion
* Safety events
* Workflow usability

### Phase 4 — Supervised Pilot

Co-design with:

* ASHA/ANM workers
* Clinicians
* PHC/CHC teams
* District health teams

### Phase 5 — Scale

Future capabilities:

* Secure backend
* Healthcare-system integration
* Multilingual communication
* District-level analytics
* Prospective clinical validation

---

# 🚀 Future Scope

* Secure production backend
* PostgreSQL-based patient and referral database
* Authentication and role-based access
* ABDM / ABHA-compatible integrations
* FHIR-compatible data exchange
* Validated image-quality model
* Clinically validated prioritisation model
* Multilingual frontline interface
* Patient communication
* Transport / outreach coordination
* Advanced district analytics
* De-identified research infrastructure
* Prospective clinical validation

---

# ⚠️ Current Prototype Status

**ONCOmitra is currently a functional prototype / MVP.**

The current implementation demonstrates the **front-end workflow and care-continuity concept**.

The following are **future implementation or validation stages**:

* Production backend
* Multi-user authentication
* Live database
* Secure cloud synchronisation
* Clinically validated image-AI
* Prospective clinical validation
* Real patient biomarker analysis
* Production ABDM/FHIR integration

### Clinical Disclaimer

> **ONCOmitra is a clinical decision-support and care-continuity prototype. It is not a standalone diagnostic system. It does not diagnose oral cancer, replace clinical examination, or replace histopathological confirmation.**

---

# 👥 Team

### Dr. Pratham Jain

Clinical Lead — clinical workflow and safety

### Dr. Sapnil Kumar Patel

Senior Clinical Lead — referral workflows and oncology oversight

### Ayush Gupta

Product Strategy & Implementation

### Bhavya Jain

Technical Lead — application, AI and system architecture

### Vanshika Yadav

Design Lead — frontline interface and field usability

---

# 🎯 Core Philosophy

> **The AI recommends.
> The workflow routes.
> The authorised clinician decides.**

ONCOmitra does not promise that AI alone will solve oral cancer.

It is designed to ensure that a suspicious screening result receives a **safer, clearer and more trackable path to appropriate care**.

---

## 📄 Project Status

**Health-a-thon 2026 — Prototype**

**Domain:** Digital Health & Care Continuity
**Focus:** Oral Cancer Screening → Clinical Prioritisation → Referral → Biopsy → Follow-up

**Status:** Working Prototype / MVP

