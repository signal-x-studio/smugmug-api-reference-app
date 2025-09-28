/**
 * Schema.org Type Definitions for Agent-Ready Components
 * 
 * TypeScript interfaces for Schema.org structured data used by AI agents
 * to understand and interact with application components.
 */

/**
 * Base Schema.org type with common properties
 */
export interface SchemaOrgBase {
  /** Schema.org context */
  '@context': 'https://schema.org';
  
  /** Schema.org type */
  '@type': string;
  
  /** Unique identifier */
  identifier?: string;
  
  /** Name or title */
  name?: string;
  
  /** Description */
  description?: string;
  
  /** URL reference */
  url?: string;
}

/**
 * Schema.org WebApplication for the main application
 */
export interface SchemaOrgWebApplication extends SchemaOrgBase {
  '@type': 'WebApplication';
  
  /** Application category */
  applicationCategory: string;
  
  /** Operating system */
  operatingSystem: string;
  
  /** Available actions */
  potentialAction?: SchemaOrgAction[];
  
  /** Application features */
  featureList?: string[];
  
  /** Software version */
  softwareVersion?: string;
  
  /** Application creator */
  creator?: SchemaOrgPerson | SchemaOrgOrganization;
}

/**
 * Schema.org ImageGallery for photo gallery components
 */
export interface SchemaOrgImageGallery extends SchemaOrgBase {
  '@type': 'ImageGallery';
  
  /** Number of items in gallery */
  numberOfItems: number;
  
  /** Images in the gallery */
  image?: SchemaOrgPhotograph[];
  
  /** Gallery creator */
  creator?: SchemaOrgPerson;
  
  /** Date created */
  dateCreated?: string;
  
  /** Date modified */
  dateModified?: string;
  
  /** Available actions */
  potentialAction?: SchemaOrgAction[];
}

/**
 * Schema.org Photograph for individual photo items
 */
export interface SchemaOrgPhotograph extends SchemaOrgBase {
  '@type': 'Photograph';
  
  /** Image content URL */
  contentUrl: string;
  
  /** Thumbnail URL */
  thumbnailUrl?: string;
  
  /** Image width */
  width?: number;
  
  /** Image height */
  height?: number;
  
  /** File size in bytes */
  contentSize?: string;
  
  /** MIME type */
  encodingFormat?: string;
  
  /** Keywords/tags */
  keywords?: string;
  
  /** Date created */
  dateCreated?: string;
  
  /** Photo creator */
  creator?: SchemaOrgPerson;
  
  /** Location where photo was taken */
  locationCreated?: SchemaOrgPlace;
  
  /** Camera/device used */
  device?: string;
  
  /** Available actions */
  potentialAction?: SchemaOrgAction[];
  
  /** Associated albums */
  isPartOf?: SchemaOrgImageGallery[];
}

/**
 * Schema.org Person for user/creator information
 */
export interface SchemaOrgPerson extends SchemaOrgBase {
  '@type': 'Person';
  
  /** Given name */
  givenName?: string;
  
  /** Family name */
  familyName?: string;
  
  /** Email address */
  email?: string;
  
  /** Profile image */
  image?: string;
  
  /** Social media profiles */
  sameAs?: string[];
}

/**
 * Schema.org Organization for company/group information
 */
export interface SchemaOrgOrganization extends SchemaOrgBase {
  '@type': 'Organization';
  
  /** Organization logo */
  logo?: string;
  
  /** Contact point */
  contactPoint?: SchemaOrgContactPoint;
  
  /** Social media profiles */
  sameAs?: string[];
}

/**
 * Schema.org ContactPoint for contact information
 */
export interface SchemaOrgContactPoint extends SchemaOrgBase {
  '@type': 'ContactPoint';
  
  /** Contact type */
  contactType: string;
  
  /** Telephone number */
  telephone?: string;
  
  /** Email address */
  email?: string;
  
  /** Available languages */
  availableLanguage?: string[];
}

/**
 * Schema.org Place for location information
 */
export interface SchemaOrgPlace extends SchemaOrgBase {
  '@type': 'Place';
  
  /** Geographic coordinates */
  geo?: SchemaOrgGeoCoordinates;
  
  /** Address */
  address?: string | SchemaOrgPostalAddress;
  
  /** Country */
  addressCountry?: string;
  
  /** Region/state */
  addressRegion?: string;
  
  /** City */
  addressLocality?: string;
}

/**
 * Schema.org GeoCoordinates for location coordinates
 */
export interface SchemaOrgGeoCoordinates extends SchemaOrgBase {
  '@type': 'GeoCoordinates';
  
  /** Latitude */
  latitude: number;
  
  /** Longitude */
  longitude: number;
  
  /** Elevation */
  elevation?: number;
}

/**
 * Schema.org PostalAddress for structured addresses
 */
export interface SchemaOrgPostalAddress extends SchemaOrgBase {
  '@type': 'PostalAddress';
  
  /** Street address */
  streetAddress?: string;
  
  /** Address locality */
  addressLocality?: string;
  
  /** Address region */
  addressRegion?: string;
  
  /** Postal code */
  postalCode?: string;
  
  /** Address country */
  addressCountry?: string;
}

/**
 * Schema.org Action types for defining available actions
 */
export interface SchemaOrgAction extends SchemaOrgBase {
  '@type': 'Action' | 'ViewAction' | 'EditAction' | 'ShareAction' | 'SearchAction' | 'CreateAction' | 'DeleteAction';
  
  /** Action target URL or template */
  target?: string | SchemaOrgEntryPoint;
  
  /** Result of the action */
  result?: SchemaOrgBase;
  
  /** Object that the action is performed on */
  object?: SchemaOrgBase;
  
  /** Agent that performs the action */
  agent?: SchemaOrgPerson | SchemaOrgOrganization;
  
  /** When the action was performed */
  endTime?: string;
  
  /** When the action started */
  startTime?: string;
}

/**
 * Schema.org EntryPoint for action targets
 */
export interface SchemaOrgEntryPoint extends SchemaOrgBase {
  '@type': 'EntryPoint';
  
  /** URL template */
  urlTemplate?: string;
  
  /** Encoding type */
  encodingType?: string;
  
  /** Content type */
  contentType?: string;
  
  /** HTTP method */
  httpMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
}

/**
 * Schema.org SearchAction for search functionality
 */
export interface SchemaOrgSearchAction extends SchemaOrgAction {
  '@type': 'SearchAction';
  
  /** Search query input */
  'query-input'?: string;
}

/**
 * Union type for all supported Schema.org types
 */
export type SchemaOrgStructuredData = 
  | SchemaOrgWebApplication
  | SchemaOrgImageGallery
  | SchemaOrgPhotograph
  | SchemaOrgPerson
  | SchemaOrgOrganization
  | SchemaOrgPlace
  | SchemaOrgAction;

/**
 * Schema.org type names as string literals
 */
export type SchemaOrgTypeName = 
  | 'WebApplication'
  | 'ImageGallery'
  | 'Photograph'
  | 'Person'
  | 'Organization'
  | 'Place'
  | 'Action'
  | 'ViewAction'
  | 'EditAction'
  | 'ShareAction'
  | 'SearchAction'
  | 'CreateAction'
  | 'DeleteAction';

/**
 * Configuration for generating Schema.org data
 */
export interface SchemaOrgConfig {
  /** Base URL for the application */
  baseUrl: string;
  
  /** Application name */
  applicationName: string;
  
  /** Application description */
  applicationDescription?: string;
  
  /** Default creator information */
  defaultCreator?: SchemaOrgPerson | SchemaOrgOrganization;
  
  /** Whether to include debug information */
  includeDebug?: boolean;
  
  /** Custom Schema.org context */
  customContext?: Record<string, string>;
}