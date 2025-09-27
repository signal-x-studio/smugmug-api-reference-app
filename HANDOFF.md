# Project Handoff & Development Brief: SmugMug AI Reference Application

**Document Version:** 1.0
**Date:** 2023-10-27
**Status:** Ready for Handoff to Development Team / AI Agents

## 1. Executive Summary

This project is a React-based reference application for the SmugMug API. Its primary purpose is to serve as a high-quality boilerplate and educational tool for developers. It demonstrates core SmugMug API interactions (authentication, data fetching, metadata updates) and showcases advanced, practical integration with a multimodal AI model (Google Gemini) for intelligent content analysis and enrichment.

The application has pivoted from a pure feature-driven tool to a **reference implementation**. Therefore, code clarity, architectural soundness, and comprehensive documentation (both in-code and via the in-app docs modal) are prioritized.

## 2. Project Setup & Environment Configuration

### Prerequisites
- Node.js (v18 or later)
- `npm` or `yarn` package manager

### Installation
1.  Clone the repository from GitHub.
2.  Navigate to the project's root directory.
3.  Install dependencies:
    ```bash
    npm install
    ```

### Environment Variables
This project requires one critical environment variable to function. Create a file named `.env` in the project root.

**File:** `.env`
```
# This key is for the Google Gemini API.
# It is loaded via process.env.API_KEY in the Vite configuration.
API_KEY="YOUR_GOOGLE_GEMINI_API_KEY"
```
**Constraint:** The `API_KEY` **MUST NOT** be hardcoded anywhere in the application source code. Agents must always source this value from the environment variable.

### Running the Application
To start the development server:
```bash
npm run dev
```
The application will be accessible at `http://localhost:5173` (or the next available port).

## 3. Architecture Deep Dive

The application is a client-side single-page application (SPA) built with React and TypeScript, styled with Tailwind CSS.

### Directory Structure
```
/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable React UI components
│   ├── services/        # Logic for external API communication
│   │   ├── geminiService.ts      # All Google Gemini API calls
│   │   ├── mockSmugMugService.ts # Default service, simulates SmugMug API
│   │   └── smugmugService.ts     # Reference for REAL SmugMug API calls
│   ├── types.ts         # All TypeScript type definitions
│   ├── App.tsx          # Main application component, state management
│   └── index.tsx        # Application entry point
├── .env                 # (Must be created) Environment variables
├── index.html           # HTML root
├── package.json         # Project dependencies and scripts
└── ...                  # Configuration files
```

### State Management
-   **Strategy:** Centralized state management within the main `App.tsx` component.
-   **Implementation:** React Hooks (`useState`, `useCallback`, `useEffect`).
-   **Rationale:** For an application of this scale, this approach is simple, explicit, and avoids the overhead of external state management libraries (e.g., Redux, Zustand). All data flows down from `App.tsx` to child components. All data mutations are handled by callback functions passed down as props from `App.tsx`.

### Services Layer (`src/services/`)
This is the most critical layer for external communication.
-   `mockSmugMugService.ts`: **This is the active service by default.** It simulates API calls with hardcoded data and artificial delays, allowing the UI to be developed and demonstrated without a live backend.
-   `smugmugService.ts`: This file contains the complete client-side logic for generating a valid **OAuth 1.0a signature**. It is provided as a direct reference for building the required server-side proxy. **It will not work directly from the browser due to CORS and security constraints.**
-   `geminiService.ts`: This service orchestrates all calls to the Google Gemini API. It handles image-to-Base64 conversion and structures prompts to receive formatted JSON data from the model.

## 4. SmugMug API Interaction Model

**CRITICAL CONSTRAINT: A Backend Proxy is Required for Production**

The SmugMug API uses **OAuth 1.0a**, which is a signature-based authentication protocol. This process requires a `Client Secret` and an `Access Token Secret`. These credentials **MUST NEVER** be exposed on the client side.

-   **Current Implementation (Mock):** The app uses `mockSmugMugService.ts` to bypass this requirement for development.
-   **Production Path:** To make this application production-ready, a server-side backend (e.g., Node.js/Express, Python/Flask) must be created. This backend will:
    1.  Securely store the SmugMug API secrets.
    2.  Receive API requests from this React client.
    3.  Perform the OAuth 1.0a signing process on the server.
    4.  Forward the signed request to the SmugMug API.
    5.  Return the SmugMug API's response to the client.

The code in `smugmugService.ts` serves as the blueprint for the server-side signing logic.

## 5. AI Integration Patterns (Gemini API)

The application demonstrates three distinct patterns for AI-driven content analysis. All patterns are implemented in `geminiService.ts`.

1.  **Single Photo Metadata Generation (`generatePhotoMetadata`)**
    -   **Goal:** Generate structured data (title, description, keywords) for one image.
    -   **Mechanism:** Uses Gemini's `responseSchema` to force the model to return a valid JSON object matching a predefined structure. This ensures reliable data parsing.

2.  **Image Classification (`doesImageMatchPrompt`)**
    -   **Goal:** Determine if an image matches a user-provided text prompt (a "yes/no" answer).
    -   **Mechanism:** A highly constrained prompt combined with a `responseSchema` that requires a single boolean (`"match": true/false`). This is used for the "Smart Album" feature.

3.  **Multi-Image Collection Analysis (`generateAlbumStory`)**
    -   **Goal:** Analyze a *collection* of images to derive a cohesive theme, title, and narrative description for an entire album.
    -   **Mechanism:** Sends multiple image parts within a single API call. The prompt instructs the model to act as a curator, identifying the common threads among all provided images.

## 6. Current Feature Manifest

-   **SmugMug Authentication:** Mocked login flow.
-   **Album/Folder Navigation:** Hierarchical display of the user's SmugMug node tree.
-   **Photo Grid View:** Displays thumbnails of all photos in a selected album.
-   **Photo Detail Modal:** View a larger image and its metadata.
-   **AI-Powered Metadata Generation:**
    -   Manual analysis of single photos.
    -   Batch analysis of selected photos.
    -   Automated analysis of new uploads (`monitor` and `full` modes).
-   **Metadata Management:** Edit and save AI-generated (or manually entered) metadata to SmugMug.
-   **Smart Album Creation:** Creates a new album by using AI to find all photos across a user's account that match a text prompt.
-   **AI Album Storyteller:** Generates a cohesive title, narrative description, and keywords for an entire album by analyzing its photos collectively.
-   **In-App Developer Documentation:** A comprehensive guide to the app's architecture and features, accessible from the main UI.

## 7. Future Development Roadmap & Agent Instructions

The following features are targeted for future development. Agents should use the existing architecture as a blueprint.

### Feature 1: Client Proofing & Favorites Dashboard

-   **User Story:** "As a professional photographer, I want to see a dashboard that aggregates all the photos my clients have 'favorited' (hearted) across different galleries, so I can quickly identify their selections for editing and ordering."
-   **Technical Implementation Plan:**
    1.  **API Interaction:**
        -   Implement a new method in the SmugMug service (mock and real) to fetch "hearts" for an image.
        -   Endpoint: `GET /api/v2/image/IMAGE_KEY!hearts`. This will require the `ImageUri` as an input.
    2.  **UI Component:**
        -   Create a new view/component, `ProofingDashboard.tsx`.
        -   This component will be accessible via a new button in the main navigation (e.g., sidebar).
        -   It should display a grid of favorited images, grouped by album (client gallery).
        -   Each image card should show who favorited it.
    3.  **State Management (`App.tsx`):**
        -   Add new state to hold the aggregated list of favorited photos: `const [favoritedPhotos, setFavoritedPhotos] = useState<FavoritedPhoto[]>([]);`. A new `FavoritedPhoto` type will be needed in `types.ts`.
        -   Create a handler function, `handleFetchFavorites()`, that iterates through all user albums, fetches images, and then fetches hearts for each image, aggregating the results. This should be an asynchronous, on-demand process.
-   **Success Criteria:** A user can click a "Proofing" tab and see a list of all images that have at least one "heart," along with which album they belong to.

### Feature 2: Bulk Security & Watermark Manager

-   **User Story:** "As a photographer managing hundreds of albums, I want a tool to apply security settings (e.g., set a password, make it unlisted) and a specific watermark to an entire folder of albums at once, so I don't have to edit each album individually."
-   **Technical Implementation Plan:**
    1.  **API Interaction:**
        -   Implement a method to fetch available watermarks: `GET /api/v2/user/USER_NICKNAME!watermarks`.
        -   Utilize the existing `PATCH /api/v2/album/ALBUM_KEY` endpoint. The payload will include fields like `SecurityType`, `Password`, `Printable`, `WatermarkUri`.
    2.  **UI Component:**
        -   Create a new modal component, `BulkSettingsModal.tsx`.
        -   This modal should be triggered from a folder's context menu in the `AlbumList.tsx` component.
        -   The UI will present options for security type, a password input field, and a dropdown list of the user's watermarks.
    3.  **Logic:**
        -   The handler function for this feature will receive a `Folder` node.
        -   It will recursively traverse all child albums within that folder.
        -   For each album, it will issue a `PATCH` request to its `AlbumUri` with the new settings.
        -   The UI should show progress (e.g., "Updated 5 of 12 albums...").
-   **Success Criteria:** A user can right-click a folder, select "Bulk Edit Settings," choose a watermark and set a password, and have those settings applied to every album inside that folder and its subfolders.
