# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-01-27-photo-discovery-search/spec.md

## Agent-Accessible Functions

### window.agentState.search

**Purpose:** Enable browser agents to execute photo searches programmatically
**Parameters:** 
- `query` (string): Natural language search query
- `filters` (object): Structured filter criteria
- `options` (object): Search options (limit, sort, etc.)

**Response:** 
```typescript
{
  results: Photo[],
  totalCount: number,
  queryParsed: {
    intent: string,
    entities: object,
    confidence: number
  },
  executionTime: number
}
```

**Errors:** InvalidQueryError, SearchTimeoutError, NoResultsError

### window.agentState.bulkSelect

**Purpose:** Programmatically select photos for bulk operations
**Parameters:**
- `photoIds` (string[]): Array of photo IDs to select
- `selectAll` (boolean): Select all current search results

**Response:**
```typescript
{
  selectedCount: number,
  selectedPhotos: Photo[],
  availableOperations: BulkOperation[]
}
```

**Errors:** InvalidPhotoIdError, SelectionLimitExceededError

### window.agentState.executeBulkOperation

**Purpose:** Execute bulk operations on selected photos
**Parameters:**
- `operation` (string): Operation type (addToAlbum, addKeywords, export, etc.)
- `parameters` (object): Operation-specific parameters
- `confirmationRequired` (boolean): Whether user confirmation is needed

**Response:**
```typescript
{
  success: boolean,
  processedCount: number,
  errors: BulkOperationError[],
  operationId: string
}
```

**Errors:** OperationNotSupportedError, InsufficientPermissionsError, BulkOperationFailedError

## Internal Search API

### SearchService.executeQuery

**Purpose:** Core search execution with natural language processing
**Parameters:**
- `naturalLanguageQuery` (string): User's search query
- `currentFilters` (FilterState): Active filters
- `searchOptions` (SearchOptions): Pagination and sorting

**Response:**
```typescript
interface SearchResult {
  photos: Photo[],
  totalMatches: number,
  queryAnalysis: QueryAnalysis,
  suggestedRefinements: string[],
  performance: SearchMetrics
}
```

### FilterService.buildQuery

**Purpose:** Convert natural language and UI filters to search criteria
**Parameters:**
- `naturalLanguage` (string): Extracted entities from NL query
- `uiFilters` (object): Traditional metadata filters
- `contextFilters` (object): Previous search context

**Response:**
```typescript
interface SearchCriteria {
  semanticTerms: string[],
  metadataFilters: MetadataFilter[],
  dateRange: DateRange,
  locationFilter: LocationFilter,
  confidenceThreshold: number
}
```

## Schema.org Markup

### SearchAction

```json
{
  "@type": "SearchAction",
  "target": {
    "@type": "EntryPoint",
    "urlTemplate": "/search?q={search_term_string}",
    "actionPlatform": ["http://schema.org/DesktopWebPlatform", "http://schema.org/MobileWebPlatform"]
  },
  "query-input": {
    "@type": "PropertyValueSpecification",
    "valueRequired": true,
    "valueName": "search_term_string"
  }
}
```

### Photo Results with Agent Actions

```json
{
  "@type": "Photograph",
  "contentUrl": "photo-url",
  "keywords": ["sunset", "landscape", "europe"],
  "potentialAction": [
    {
      "@type": "SelectAction",
      "target": "selectPhoto(photoId)"
    },
    {
      "@type": "ViewAction", 
      "target": "viewPhoto(photoId)"
    }
  ]
}
```