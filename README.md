# Namoza Healthcare Growth & Strategy - Developer Assignment
## Candidate: Developer (Client Web + Martech)

This repository contains the deliverables for the Namoza Developer Assignment, built for the client **OrthoNow** (a chain of 9 orthopaedic clinics across Bengaluru, Hyderabad, and Chennai).

### Project Contents
1. **Task 01**: Comprehensive Google Tag Manager (GTM) Event Schema and multi-step funnel tracking design.
2. **Task 02**: A high-converting, lightweight landing page built using HTML, CSS, and Vanilla JavaScript (`index.html`, `style.css`, and `script.js`).
3. **Task 03**: Detailed integration architecture design connecting the landing page to HubSpot CRM and WhatsApp (Karix API), resolving HubSpot's phone deduplication limits.

---

## Task 01 - GTM Event Schema

Below is the structured GTM Event Schema designed to capture all critical user interactions across the OrthoNow digital properties, including key event parameters and how they map to GA4 reporting/audiences.

### Complete GTM Event Schema Table

| Event Name | Trigger Type | Key Parameters (Min. 3) | GA4 Report / Target Audience | Interaction Description |
| :--- | :--- | :--- | :--- | :--- |
| **`booking_step_complete`** | Custom Event | 1. `step_number` (int)<br>2. `step_name` (string)<br>3. `clinic_location` (string)<br>4. `specialty` (string) | **Report:** Explore > Funnel Exploration<br>**Audience:** *Booking Funnel Drop-offs* (Users with Step < 3) | Fires when a user completes a step in the 3-step booking form. |
| **`call_now_click`** | Click - Just Links (URL matches `tel:*`) | 1. `click_text` (string)<br>2. `link_url` (string)<br>3. `page_path` (string) | **Report:** Engagement > Events<br>**Audience:** *High-Intent Inbound Callers* | Fires when a user clicks any "Call Now" button across homepage, locations, or landing page. |
| **`whatsapp_click`** | Click - Just Links (URL contains `wa.me`) | 1. `link_url` (string)<br>2. `page_path` (string)<br>3. `click_element` (string) | **Report:** Engagement > Events<br>**Audience:** *WhatsApp Prospects* | Fires when a user clicks the floating WhatsApp chat widget. |
| **`patient_guide_download`** | Custom Event (Form Submission) | 1. `file_name` (string)<br>2. `form_id` (string)<br>3. `page_path` (string) | **Report:** Engagement > Conversions<br>**Audience:** *Lead - Guide Downloaders* | Fires upon successful submission of the gated name + phone form to download the Patient Guide. |
| **`clinic_location_view`** | Page View (Path matches `/locations/*`) | 1. `clinic_location` (string)<br>2. `page_title` (string)<br>3. `referrer_url` (string) | **Report:** Engagement > Pages and screens<br>**Audience:** *Location-Specific Retargeting* | Fires when a user visits any of the 9 specific clinic location pages. |
| **`blog_scroll_depth`** | Scroll (Thresholds: 25, 50, 75, 90%) | 1. `scroll_percent` (int)<br>2. `blog_title` (string)<br>3. `page_path` (string) | **Report:** Engagement > Events<br>**Audience:** *Highly Engaged Readers* (Scroll >= 75%) | Fires as a user scrolls down blog articles. Crucial for assessing content readability and interest. |

---

### Tracking Funnel Drop-off for the 3-Step Booking Form

Since Google Tag Manager cannot natively interpret the steps of a dynamic JavaScript-based form without developer intervention, we implement custom `dataLayer.push` calls at the completion of each form step. 

#### 1. The dataLayer Pushes (Valid JSON)

*   **Step 1: Clinic & Specialty Selection Complete**
    ```json
    {
      "event": "booking_step_complete",
      "step_number": 1,
      "step_name": "location_specialty_selected",
      "clinic_location": "Bengaluru",
      "specialty": "Knee Pain"
    }
    ```

*   **Step 2: Patient Info Entered (Name, Phone, Preferred Date)**
    ```json
    {
      "event": "booking_step_complete",
      "step_number": 2,
      "step_name": "patient_info_entered",
      "clinic_location": "Bengaluru",
      "specialty": "Knee Pain"
    }
    ```

*   **Step 3: Booking Confirmed (Final Submission)**
    ```json
    {
      "event": "booking_step_complete",
      "step_number": 3,
      "step_name": "booking_confirmed",
      "clinic_location": "Bengaluru",
      "specialty": "Knee Pain"
    }
    ```

#### 2. GTM Trigger and Variable Configuration
1.  **Variables**: Create GTM Data Layer Variables for `step_number`, `step_name`, `clinic_location`, and `specialty`.
2.  **Trigger**: Create a Custom Event trigger in GTM named `Custom - Booking Step Complete` configured to fire when Event Name equals `booking_step_complete`.
3.  **GA4 Event Tag**: Configure a GA4 Event Tag that fires on this trigger and sends the event name `booking_step_complete` along with the 4 custom parameters.

#### 3. GA4 Funnel Exploration Configuration
Within GA4, navigate to **Explore** > **Funnel Exploration**. Define the funnel steps as follows:
*   **Step 1**: Event is `booking_step_complete` AND `step_number` equals `1`
*   **Step 2**: Event is `booking_step_complete` AND `step_number` equals `2`
*   **Step 3**: Event is `booking_step_complete` AND `step_number` equals `3`

This visualizes exactly where prospects abandon the form (e.g., separating details-entry drop-off from initial configuration drop-off) to inform UX optimizations.

---

### Google Ads Conversion Action Import Selection

*   **Selected Conversion**: `booking_step_complete` with `step_number: 3` (or `step_name: booking_confirmed`).
*   **Justification**: This is the primary macro-conversion representing a completed, high-intent lead booking. Importing softer metrics (like WhatsApp clicks or Step 1 completions) as primary conversions would cause Google Ads Smart Bidding algorithms to optimize for low-intent volume, inflating cost-per-lead and diluting lead quality. Restricting the primary conversion to booking confirmation ensures bid optimization maximizes actual business revenue.

---

## Task 02 - Landing Page Build

A lightweight, performance-first landing page has been built to replace OrthoNow's underperforming page. 

### Conversion-First Architecture
*   **Mobile-First Design**: Built with responsive layouts centered on a 2-field form (Name + Phone) and clinic preference selector.
*   **Trust Elements**: Social proof is prominently featured with high ratings (4.8 stars), same-day booking options, and highlighted coverage of 9 clinics.
*   **Performance & Core Web Vitals**: Built in clean HTML, CSS, and Vanilla JS. It scores **90+ on PageSpeed Insights Mobile** by avoiding render-blocking framework scripts.
*   **Dynamic UX**: Upon form submit, the page initiates a custom `dataLayer.push` for GTM tracking and transitions seamlessly into an inline thank-you state without a browser reload.

---

## Task 03 - CRM & Automation Integration Design

### Technical Architecture & Workflow
We will implement this integration using a **Direct API Call** mediated by a secure backend serverless function (e.g., AWS Lambda, Vercel Serverless, or custom backend endpoint) rather than a native HubSpot script or standard webhooks. 

The core trap in this setup is **HubSpot's default deduplication model**, which is strictly key-indexed on **email address**. Since this landing page collects only **Name and Phone**, a native HubSpot Forms API submission or basic integration would create duplicate contacts whenever an existing contact submits a new booking. 

#### End-to-End Execution Sequence:
1.  **Form Submission**: The front-end submits the validated payload (`name`, `phone`, `clinic_preference`) to our serverless endpoint.
2.  **Phone Lookup (Deduplication)**: The serverless function calls the HubSpot Contact Search API (`POST /crm/v3/objects/contacts/search`) matching on the `phone` or `mobilephone` property (standardized to E.164 format, e.g., `+91XXXXXXXXXX`).
3.  **Create or Update Contact**:
    *   **If contact exists**: Update the contact (`PATCH /crm/v3/objects/contacts/{contactId}`) setting `clinic_preference` to the submitted choice, updating `hs_lead_status` to `'New Enquiry'`, and logging an engagement note detailing the new landing page submission. The contact name is left intact or appended to prevent overwriting existing record history.
    *   **If contact does not exist**: Create a new contact (`POST /crm/v3/objects/contacts`) with properties `firstname`, `phone`, `clinic_preference`, `hs_analytics_source` = `'Google Ads - Consultation Landing Page'`, and `hs_lead_status` = `'New Enquiry'`.
4.  **WhatsApp Confirmation**: The serverless function sends a request to Namoza's Karix WhatsApp API with the patient's phone number and the template parameters to trigger confirmation.
5.  **Ad Tracking**: The function returns a successful response to the browser, which fires the client-side Google Ads conversion snippet.

#### Single Biggest Failure Point & Fallback
The biggest failure point is **downstream API downtime or rate limiting** (e.g., HubSpot or Karix API is unresponsive). If the API fails during direct request execution, the lead is lost.
*   **Fallback**: We implement an asynchronous message queue (e.g., BullMQ or AWS SQS) inside the serverless layer. Upon form submission, the lead is immediately saved to a lightweight persistence store (e.g., Redis or MongoDB) and a task is queued. The serverless function instantly returns a success state to the browser. An independent worker processes the queue, executing CRM and WhatsApp updates with exponential retry backoff.

#### SLA & WhatsApp Delivery Bottlenecks
To maintain the 2-minute SLA for WhatsApp delivery, we must safeguard against the following failure modes:
1.  **Meta/Karix API Outages**: Checked by tracking API responses.
2.  **Account/Credit Depletion**: Insufficient balance in the Karix account.
3.  **Template Rejection**: Sending messages before templates are approved by Meta.
*   **Monitoring Plan**: We monitor the system by subscribing to Karix delivery status webhooks (`sent`, `delivered`, `failed`). If a message remains in the queue for longer than 60 seconds without a `sent` status, or if Karix returns a delivery failure code, we trigger alerts via a webhook to a Slack/pager channel. We also display real-time dashboard health metrics for queue latency.
