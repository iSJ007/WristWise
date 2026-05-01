# WristWise | Project Requirements & User Stories

This document outlines the core functional requirements for the **WristWise** web application, structured as User Stories with clear Acceptance Criteria and Definitions of Done.

---

## 1. Authentication & Identity

### US-01: User Registration
**As a** visitor,  
**I want to** create an account with a username, email, and password,  
**So that** I can access member-only features like reviews and wishlists.

**Acceptance Criteria:**
* A registration form is available with username, email, and password fields.
* Submitting the form creates an account and logs me in automatically.
* If the email is already in use, an error message is shown.
* Passwords are stored securely (hashed, never plain text).

**Definition of Done:**
* All acceptance criteria are met.
* Code is reviewed and approved.
* Automated tests for registration pass.
* Feature is deployed to the production environment.

---

### US-02: User Login
**As a** registered user,  
**I want to** log in with my email and password,  
**So that** I can access my account and member features.

**Acceptance Criteria:**
* A login form is available with email and password fields.
* On success, a JWT token is issued and the user is redirected to the home page.
* If credentials are incorrect, a clear error message is shown.
* The session persists so the user stays logged in after refreshing the page.

**Definition of Done:**
* All acceptance criteria are met.
* Code is reviewed and approved.
* Automated tests for login pass.
* Feature is deployed to the production environment.

---

## 2. Discovery & Search

### US-03: Browse Watches
**As a** visitor,  
**I want to** browse a paginated list of watches,  
**So that** I can explore the full watch database without being overwhelmed.

**Acceptance Criteria:**
* The home page displays watches in a grid with brand, name, reference, and average rating visible.
* Watches are paginated with Previous / Next controls.
* The total number of watches is displayed.

**Definition of Done:**
* All acceptance criteria are met.
* Code is reviewed and approved.
* Automated tests for the watch list endpoint pass.
* Feature is deployed to the production environment.

---

### US-04: Search for a Watch
**As a** visitor,  
**I want to** search for watches by brand, name, or reference number,  
**So that** I can quickly find a specific timepiece without scrolling.

**Acceptance Criteria:**
* A search bar is prominently displayed on the home page.
* As I type, a predictive dropdown appears with up to 10 matching results.
* Selecting a result navigates me directly to that watch's detail page.
* Search is debounced so the API is not called on every keystroke.

**Definition of Done:**
* All acceptance criteria are met.
* Code is reviewed and approved.
* Automated tests for the search endpoint pass.
* Feature is deployed to the production environment.

---

### US-05: View Watch Details
**As a** visitor,  
**I want to** view the full detail page of a watch,  
**So that** I can read its specs, movement info, and community reviews.

**Acceptance Criteria:**
* The detail page displays all watch fields: case material, diameter, movement, functions, description, etc.
* Limited edition watches are clearly flagged with the number of pieces.
* The page has a Details tab and a Reviews tab.
* The average rating and review count are shown in the header.

**Definition of Done:**
* All acceptance criteria are met.
* Code is reviewed and approved.
* Automated tests for the watch detail endpoint pass.
* Feature is deployed to the production environment.

---

## 3. Community & Social

### US-06: Submit a Review
**As a** logged-in user,  
**I want to** submit a star rating and written review for a watch,  
**So that** I can share my opinion with the community.

**Acceptance Criteria:**
* A review form with a 1–5 star selector and comment box is shown on the Reviews tab.
* Submitting the form saves the review and shows it immediately on the page.
* A user can only submit one review per watch — the form is hidden if they have already reviewed it.
* Visitors who are not logged in see a "Sign in to leave a review" prompt instead.

**Definition of Done:**
* All acceptance criteria are met.
* Code is reviewed and approved.
* Automated tests for the review endpoints pass.
* Feature is deployed to the production environment.

---

### US-07: Delete a Review
**As a** logged-in user,  
**I want to** delete my own review,  
**So that** I can remove feedback I no longer stand behind.

**Acceptance Criteria:**
* A delete button is visible only on reviews that belong to the logged-in user.
* Clicking delete removes the review immediately from the page.
* A user cannot delete another user's review.

**Definition of Done:**
* All acceptance criteria are met.
* Code is reviewed and approved.
* Automated tests for review deletion pass.
* Feature is deployed to the production environment.

---

## 4. Personalization & Enrichment

### US-08: Manage Wishlist
**As a** logged-in user,  
**I want to** save and remove watches from a personal wishlist,  
**So that** I can keep track of timepieces I am interested in.

**Acceptance Criteria:**
* An "Add to Wishlist" button is shown on every watch detail page.
* If the watch is already wishlisted, the button changes to "Remove from Wishlist."
* I can view all my saved watches on a dedicated Wishlist page.
* The wishlist persists between sessions.
* Visitors who are not logged in do not see the wishlist button.

**Definition of Done:**
* All acceptance criteria are met.
* Code is reviewed and approved.
* Automated tests for wishlist endpoints pass.
* Feature is deployed to the production environment.

---

### US-09: Watch Image (Optional)
**As a** visitor,  
**I want to** see a photo of the watch on its detail page,  
**So that** I get a visual sense of the timepiece alongside the specs.

**Acceptance Criteria:**
* A watch image is fetched from an external image API using the brand and model name.
* If no image is found, a branded placeholder is shown instead.
* Images load without blocking the rest of the page.

**Definition of Done:**
* All acceptance criteria are met.
* Code is reviewed and approved.
* Image API usage stays within the free tier.
* Feature is deployed to the production environment.