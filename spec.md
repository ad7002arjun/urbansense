# UrbanSense Smart Civics Reporting System

## Current State
New project. No existing application files.

## Requested Changes (Diff)

### Add
- Camera capture UI so citizens can photograph civic issues
- Frontend AI image classification using TensorFlow.js MobileNet to detect issue type (pothole, flooding, garbage, broken light, graffiti, etc.)
- Urgency classification: Urgent (safety hazards, flooding, infrastructure damage) vs Standard (minor issues)
- Issue category taxonomy: Road & Pavement, Water & Drainage, Lighting, Waste Management, Public Safety, Other
- Report submission form: title, description, location (text input), category (auto-filled from AI), urgency (auto-filled from AI), photo
- Citizen view: submit report, view own reports + status
- Admin/Government view: all reports dashboard, status management (Reported → In Progress → Resolved), filter/sort by urgency and category
- Statistics panel: total reports, urgent count, resolved count
- Role-based access: citizen vs admin

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Select components: camera, blob-storage, authorization
2. Generate Motoko backend with report CRUD, status management, admin role
3. Frontend:
   - Landing page with hero, how-it-works steps, recent reports grid, stats
   - Report submission flow: camera capture → AI classification → form review → submit
   - My Reports page for citizen
   - Admin dashboard with full reports list, status update controls
   - TensorFlow.js MobileNet integration for image classification → mapped to civic categories and urgency
