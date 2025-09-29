# Structured Data Guide

Structured data is the foundation of agent-native applications. By embedding Schema.org markup in your components, you make your application's content and functionality discoverable and understandable to AI agents.

## Why Structured Data Matters

AI agents need context to understand what they're looking at. Structured data provides:

- **Semantic meaning**: What type of content this is (photo, album, person, etc.)
- **Relationships**: How different pieces of content relate to each other
- **Actions**: What operations can be performed on this content
- **Metadata**: Additional context like creation dates, keywords, locations

## Schema.org Integration

We use [Schema.org](https://schema.org) vocabulary, the industry standard for structured data markup.

### Core Photo Management Types

#### Photograph
For individual photos:

```json
{
  "@context": "https://schema.org",
  "@type": "Photograph",
  "identifier": "photo-12345",
  "name": "Golden Gate Bridge at Sunset",
  "description": "Beautiful sunset view of the Golden Gate Bridge from Marin Headlands",
  "contentUrl": "https://example.com/photos/golden-gate-sunset.jpg",
  "thumbnailUrl": "https://example.com/thumbnails/golden-gate-sunset-thumb.jpg",
  "keywords": ["sunset", "golden gate bridge", "san francisco", "landscape"],
  "dateCreated": "2023-08-15T19:30:00-07:00",
  "creator": {
    "@type": "Person",
    "name": "John Photographer"
  },
  "contentLocation": {
    "@type": "Place",
    "name": "Marin Headlands",
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 37.8299,
      "longitude": -122.4818
    }
  },
  "exifData": {
    "@type": "PropertyValue",
    "name": "Camera Settings",
    "value": "Canon EOS R5, 24-70mm f/2.8, ISO 100, f/8, 1/125s"
  }
}
```

#### ImageGallery
For photo collections and albums:

```json
{
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  "name": "California Road Trip 2023",
  "description": "Photos from our amazing road trip through California",
  "numberOfItems": 47,
  "dateCreated": "2023-08-10",
  "creator": {
    "@type": "Person", 
    "name": "Travel Photographer"
  },
  "image": [
    {
      "@type": "Photograph",
      "name": "Golden Gate Bridge",
      "contentUrl": "https://example.com/photos/golden-gate.jpg"
    },
    {
      "@type": "Photograph", 
      "name": "Yosemite Falls",
      "contentUrl": "https://example.com/photos/yosemite-falls.jpg"
    }
  ],
  "potentialAction": [
    {
      "@type": "ViewAction",
      "name": "View Album",
      "target": "https://example.com/albums/california-trip-2023"
    },
    {
      "@type": "ShareAction",
      "name": "Share Album",
      "target": "https://example.com/share/california-trip-2023"
    }
  ]
}
```

## React Component Integration

### Using the AgentWrapper Component

Our `AgentWrapper` component automatically generates and injects structured data:

```jsx
import { AgentWrapper, SCHEMA_TYPES } from '../../src/agents';

function PhotoCard({ photo }) {
  return (
    <AgentWrapper
      componentId={`photo-${photo.id}`}
      schemaType={SCHEMA_TYPES.PHOTOGRAPH}
      data={photo}
    >
      <div className="photo-card">
        <img src={photo.url} alt={photo.title} />
        <h3>{photo.title}</h3>
        <p>{photo.description}</p>
      </div>
    </AgentWrapper>
  );
}
```

### Manual Schema.org Generation

For more control, use our utility functions:

```jsx
import { generatePhotographSchema } from '../../src/agents/utils/schema-generator';

function PhotoCard({ photo }) {
  const schemaData = generatePhotographSchema({
    identifier: photo.id,
    name: photo.title,
    contentUrl: photo.url,
    keywords: photo.tags,
    dateCreated: photo.createdAt
  });

  return (
    <div className="photo-card">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <img src={photo.url} alt={photo.title} />
      <h3>{photo.title}</h3>
    </div>
  );
}
```

## Data Attributes for Agent Discovery

In addition to JSON-LD, use data attributes for real-time agent interaction:

```jsx
function PhotoCard({ photo }) {
  return (
    <div 
      className="photo-card"
      data-agent-type="photograph"
      data-agent-id={photo.id}
      data-agent-actions="view,edit,delete,share"
      itemScope
      itemType="https://schema.org/Photograph"
    >
      <img 
        src={photo.url} 
        alt={photo.title}
        itemProp="contentUrl"
      />
      <h3 itemProp="name">{photo.title}</h3>
      <p itemProp="description">{photo.description}</p>
      
      <div className="photo-keywords">
        {photo.tags.map(tag => (
          <span key={tag} itemProp="keywords">{tag}</span>
        ))}
      </div>
    </div>
  );
}
```

## Schema.org Validator Component

Test your structured data with our live validator:

import SchemaOrgValidator from '@site/src/components/SchemaOrgValidator';

<SchemaOrgValidator />

## Best Practices

### 1. Use Consistent Identifiers
Always provide stable, unique identifiers that agents can rely on:

```json
{
  "@type": "Photograph",
  "identifier": "photo-uuid-12345", // Not "photo-1" which might change
  "name": "Sunset Photo"
}
```

### 2. Include Rich Metadata
The more context you provide, the better agents can understand and work with your content:

```json
{
  "@type": "Photograph",
  "keywords": ["sunset", "beach", "vacation"], // Multiple relevant keywords
  "contentLocation": {
    "@type": "Place",
    "name": "Santa Monica Beach" // Specific location, not just "beach"
  },
  "dateCreated": "2023-08-15T19:30:00-07:00" // Specific timestamp with timezone
}
```

### 3. Define Available Actions
Help agents understand what they can do with your content:

```json
{
  "@type": "ImageGallery",
  "potentialAction": [
    {
      "@type": "ViewAction",
      "name": "View Gallery",
      "target": "/gallery/{id}"
    },
    {
      "@type": "EditAction", 
      "name": "Edit Gallery",
      "target": "/gallery/{id}/edit"
    },
    {
      "@type": "ShareAction",
      "name": "Share Gallery", 
      "target": "/gallery/{id}/share"
    }
  ]
}
```

### 4. Validate Your Markup
Use tools to ensure your structured data is correct:

- Google's Rich Results Test
- Schema.org validator
- Our built-in validator component (above)

## Performance Considerations

### Lazy Loading
Generate structured data only when needed:

```jsx
import { useDualInterface } from '../../src/agents';

function PhotoCard({ photo, isVisible }) {
  const { agentInterface } = useDualInterface({
    componentId: `photo-${photo.id}`,
    data: photo,
    generateSchema: isVisible // Only when component is visible
  });

  return (
    <div className="photo-card">
      {/* Component content */}
    </div>
  );
}
```

### Minification
Use our utility to reduce JSON-LD size in production:

```jsx
import { minifySchemaOrg } from '../../src/agents/utils/schema-generator';

const schemaData = minifySchemaOrg(generatePhotographSchema(photo));
```

## Common Patterns

### Photo Galleries with Filtering
```json
{
  "@type": "ImageGallery",
  "name": "Vacation Photos",
  "additionalProperty": [
    {
      "@type": "PropertyValue",
      "name": "filterBy",
      "value": ["date", "location", "keywords"]
    },
    {
      "@type": "PropertyValue", 
      "name": "sortBy",
      "value": ["date", "name", "relevance"]
    }
  ]
}
```

### User-Generated Content
```json
{
  "@type": "Photograph",
  "creator": {
    "@type": "Person",
    "name": "User Name",
    "sameAs": "https://example.com/users/username"
  },
  "uploadDate": "2023-08-15T10:00:00Z",
  "license": "https://creativecommons.org/licenses/by/4.0/"
}
```

## Next Steps

With structured data in place, you're ready to explore:
- [Action Registry](./action-registry.md) - Making your application's functions accessible to agents
- [Natural Language API](./natural-language-api.md) - Processing natural language commands
- [Interactive Examples](./interactive-examples.md) - See it all working together