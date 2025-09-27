import { SmugMugCredentials, Photo, PhotoStatus, AiData, Album, SmugMugNode, Comment } from '../types';

const API_BASE_URL = 'https://api.smugmug.com';

// The following OAuth 1.0a implementation is for reference and would be used
// on a server-side proxy in a real application.

const percentEncode = (str: string): string => {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/\*/g, '%2A')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');
};

const createNonce = (length: number): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

async function hmacSha1(key: string, baseString: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    const baseStringData = encoder.encode(baseString);

    const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-1' },
        false,
        ['sign']
    );
    
    const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, baseStringData);
    
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

class SmugMugService {
    private credentials!: SmugMugCredentials;
    
    public init(credentials: SmugMugCredentials) {
        this.credentials = credentials;
    }
    
    /**
     * The core request function that handles OAuth 1.0a signing.
     * In a real app, this logic would live on your server-side proxy.
     */
    private async request(method: string, uri: string, body?: any): Promise<any> {
        if (!this.credentials) throw new Error("SmugMug service not initialized.");
        
        const fullUrl = uri.startsWith('http') ? uri : `${API_BASE_URL}${uri}`;
        const baseUrl = fullUrl.split('?')[0];
        const urlParts = new URL(fullUrl);
        const queryParams: Record<string, string> = {};
        urlParts.searchParams.forEach((value, key) => (queryParams[key] = value));

        const httpMethod = method.toUpperCase();
        
        const oauthParams: Record<string, string> = {
            oauth_consumer_key: this.credentials.apiKey,
            oauth_token: this.credentials.accessToken,
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
            oauth_nonce: createNonce(32),
            oauth_version: '1.0',
        };

        const allParamsForSignature = { ...queryParams, ...(body || {}), ...oauthParams };
        
        const sortedKeys = Object.keys(allParamsForSignature).sort();
        
        const paramString = sortedKeys
            .map(key => `${percentEncode(key)}=${percentEncode(String(allParamsForSignature[key]))}`)
            .join('&');

        const signatureBaseString = [
            httpMethod,
            percentEncode(baseUrl),
            percentEncode(paramString),
        ].join('&');

        const signingKey = `${percentEncode(this.credentials.apiSecret)}&${percentEncode(this.credentials.accessTokenSecret)}`;
        const signature = await hmacSha1(signingKey, signatureBaseString);
        
        oauthParams.oauth_signature = signature;

        const authHeaderValue = 'OAuth ' + Object.keys(oauthParams)
            .sort()
            .map(key => `${percentEncode(key)}="${percentEncode(oauthParams[key])}"`)
            .join(', ');

        const headers: HeadersInit = {
            'Authorization': authHeaderValue,
            'Accept': 'application/json',
        };
        
        let requestBody: string | undefined = undefined;
        let finalUrl = fullUrl;

        if (httpMethod === 'POST' || httpMethod === 'PATCH') {
            headers['Content-Type'] = 'application/json';
            requestBody = JSON.stringify(body);
        }

        const response = await fetch(finalUrl, {
            method: httpMethod,
            headers,
            body: requestBody,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`SmugMug API Error (${response.status}): ${errorText || 'Failed to fetch'}`);
        }
        
        const responseText = await response.text();
        if (!responseText) {
            return null; // Handle empty responses (e.g. from PATCH or DELETE)
        }
        
        try {
            const data = JSON.parse(responseText);
            return data.Response;
        } catch (e) {
            console.error("Failed to parse SmugMug JSON response:", responseText);
            throw new Error("Received an invalid response from SmugMug.");
        }
    }
    
    /**
     * Fetches the user's entire node tree (Folders and Albums).
     * @returns A promise that resolves to an array of SmugMugNode objects.
     * @see https://api.smugmug.com/api/v2/doc/reference/node.html
     */
    public async fetchNodeTree(): Promise<SmugMugNode[]> {
        const authUser = await this.request('GET', '/api/v2!authuser');
        if (!authUser || !authUser.Uris.Node) {
            throw new Error("Could not retrieve authenticated user's root node URI.");
        }
        const rootNodeUri = authUser.Uris.Node.Uri;

        // Recursively fetch nodes. Set a depth limit to avoid excessive requests.
        return this.fetchChildNodes(rootNodeUri, 3);
    }
    
    private async fetchChildNodes(nodeUri: string, maxDepth: number): Promise<SmugMugNode[]> {
        if (maxDepth <= 0) {
            return [];
        }

        // _expand=ChildNodes fetches the immediate children.
        const nodeResponse = await this.request('GET', `${nodeUri}?_expand=ChildNodes`);
        const childrenData = nodeResponse.Node?.Uris?.ChildNodes?.Node || [];

        const children: SmugMugNode[] = await Promise.all(
            childrenData.map(async (child: any): Promise<SmugMugNode | null> => {
                if (child.Type === 'Folder') {
                    // It's a folder, recursively fetch its children
                    const grandchildren = await this.fetchChildNodes(child.Uri, maxDepth - 1);
                    return {
                        id: child.NodeID,
                        name: child.Name,
                        uri: child.Uri,
                        type: 'Folder',
                        children: grandchildren,
                    };
                } else if (child.Type === 'Album') {
                     // It's an Album, fetch its details to get ImageCount
                    const albumResponse = await this.request('GET', child.Uri);
                    const album = albumResponse.Album;
                    return {
                        id: album.AlbumKey,
                        name: album.Name,
                        uri: album.Uri,
                        description: album.Description || '',
                        keywords: album.KeywordArray || [],
                        imageCount: album.ImageCount,
                        type: 'Album',
                    };
                }
                return null;
            })
        );
        // Sort with folders first, then alphabetically, and filter out any nulls
        return children.filter((c): c is SmugMugNode => c !== null).sort((a, b) => {
            if (a.type === 'Folder' && b.type === 'Album') return -1;
            if (a.type === 'Album' && b.type === 'Folder') return 1;
            return a.name.localeCompare(b.name);
        });
    }

    /**
     * Creates a new album for the authenticated user.
     * @param albumData - An object containing the new album's properties (e.g., Name, UrlName).
     * @returns A promise that resolves to the newly created Album object.
     * @see https://api.smugmug.com/api/v2/doc/reference/node.html (Creating a new album is done via the user's Node)
     */
    public async createAlbum(albumData: {Name: string, UrlName: string}): Promise<Album> {
        const authUser = await this.request('GET', '/api/v2!authuser');
        const userNodeUri = authUser.Uris.Node.Uri;
        
        const payload = {
            ...albumData,
            Type: "Album" // Required when creating an album at a node
        };
        
        const response = await this.request('POST', userNodeUri, payload);
        const newAlbumData = response.Album;
         return {
            id: newAlbumData.AlbumKey,
            name: newAlbumData.Name,
            uri: newAlbumData.Uri,
            description: newAlbumData.Description || '',
            keywords: newAlbumData.KeywordArray || [],
            imageCount: newAlbumData.ImageCount,
            type: 'Album',
        };
    }

    /**
     * Fetches all images within a specific album.
     * @param albumUri - The API URI of the album.
     * @returns A promise that resolves to an array of Photo objects.
     * @see https://api.smugmug.com/api/v2/doc/reference/album-images.html
     */
    public async fetchAlbumImages(albumUri: string): Promise<Photo[]> {
        const imagesUri = `${albumUri}!images?_expand=LargestImage&_sort=DateUploaded&_sortdirection=Descending&_count=100`;
        const imagesResponse = await this.request('GET', imagesUri);
        const images = imagesResponse.Image || [];
        
        return images.map((img: any): Photo => ({
            id: img.ImageKey,
            uri: img.Uri,
            imageUrl: img.Uris.LargestImage.Uri,
            status: PhotoStatus.PENDING,
            aiData: { 
                title: img.Title || '', 
                description: img.Caption || '', 
                keywords: img.KeywordArray || [] 
            },
            error: null,
        }));
    }

    /**
     * Updates the metadata for a specific photo.
     * @param imageUri - The API URI of the image to update.
     * @param data - An object containing the new title, description (caption), and keywords.
     * @returns A promise that resolves when the update is complete.
     * @see https://api.smugmug.com/api/v2/doc/reference/image.html (PATCH method)
     */
    public async updatePhotoMetadata(imageUri: string, data: AiData): Promise<void> {
        const payload = {
            Title: data.title,
            Caption: data.description,
            KeywordArray: data.keywords,
        };
        await this.request('PATCH', imageUri, payload);
    }
    
     /**
     * Updates the metadata for a specific album.
     * @param albumUri - The API URI of the album to update.
     * @param data - An object containing the new Name, Description, and KeywordArray.
     * @returns A promise that resolves when the update is complete.
     * @see https://api.smugmug.com/api/v2/doc/reference/album.html (PATCH method)
     */
    public async updateAlbumMetadata(albumUri: string, data: { Name: string; Description: string; KeywordArray: string[]; }): Promise<void> {
        await this.request('PATCH', albumUri, data);
    }
    
    /**
     * Deletes a specific photo.
     * @param imageUri - The API URI of the image to delete.
     * @returns A promise that resolves when the deletion is complete.
     * @see https://api.smugmug.com/api/v2/doc/reference/image.html (DELETE method)
     */
    public async deletePhoto(imageUri: string): Promise<void> {
        await this.request('DELETE', imageUri);
    }

    /**
     * Fetches comments for a specific image.
     * @param imageUri - The API URI of the image.
     * @returns A promise that resolves to an array of Comment objects.
     * @see https://api.smugmug.com/api/v2/doc/reference/image-comments.html
     */
    public async fetchImageComments(imageUri: string): Promise<Comment[]> {
        const commentsUri = `${imageUri}!comments`;
        const commentsResponse = await this.request('GET', commentsUri);
        const comments = commentsResponse.Comment || [];

        return comments.map((comment: any): Comment => ({
            id: comment.Uri.split('/').pop(),
            text: comment.Text,
            authorName: comment.Name,
            date: comment.Date,
        }));
    }
    
     /**
     * Fetches all images for the authenticated user by traversing the node tree.
     * @returns A promise that resolves to an array of all Photo objects.
     */
    public async fetchAllUserImages(): Promise<Photo[]> {
        const allPhotos: Photo[] = [];
        const visitedAlbumUris = new Set<string>();

        const findAlbumsRecursive = async (nodes: SmugMugNode[]) => {
            for (const node of nodes) {
                if (node.type === 'Album') {
                    if (!visitedAlbumUris.has(node.uri)) {
                        visitedAlbumUris.add(node.uri);
                        const albumPhotos = await this.fetchAlbumImages(node.uri);
                        allPhotos.push(...albumPhotos);
                    }
                } else if (node.type === 'Folder') {
                    await findAlbumsRecursive(node.children);
                }
            }
        };

        const topLevelNodes = await this.fetchNodeTree();
        await findAlbumsRecursive(topLevelNodes);
        
        return allPhotos;
    }
    
    /**
     * Collects an existing image into a specified album.
     * @param imageUri - The API URI of the image to collect.
     * @param albumUri - The API URI of the target album.
     * @returns A promise that resolves when the image is collected.
     * @see https://api.smugmug.com/api/v2/doc/cookbook.html#collecting-an-image-into-an-album
     */
    public async collectImageToAlbum(imageUri: string, albumUri: string): Promise<void> {
        const albumImagesUri = `${albumUri}!images`;
        const payload = {
            ImageUri: imageUri,
        };
        await this.request('POST', albumImagesUri, payload);
    }

    /**
     * Uploads a photo to a specified album.
     * @param albumUri - The API URI of the target album.
     * @param file - The image file to upload.
     * @returns A promise that resolves to the newly created Photo object.
     * @see https://api.smugmug.com/api/v2/doc/reference/upload.html
     */
    public async uploadPhoto(albumUri: string, file: File): Promise<Photo> {
        // IMPORTANT: This method cannot be successfully called from a browser due to
        // both CORS restrictions on the upload endpoint and the security requirement
        // of keeping the API secret confidential. This code is provided as a reference
        // for a server-side proxy implementation.
        console.log("Attempting to call real uploadPhoto. This will fail without a proxy.");
        
        /*
        // --- REAL SERVER-SIDE IMPLEMENTATION ---
        const UPLOAD_URL = 'https://upload.smugmug.com/';
        
        // This request needs to be signed with OAuth 1.0a, similar to the main `request`
        // method, but WITHOUT including the file body in the signature. The signature
        // is sent in the Authorization header, while the file is sent as the raw request body.
        const authHeaderValue = getOAuthHeaderForUpload(); // A server-side helper
    
        const headers = {
            'Authorization': authHeaderValue,
            'Content-Length': file.size.toString(),
            'Content-MD5': '', // Optional: base64-encoded MD5 hash of the file
            'X-Smug-AlbumUri': albumUri,
            'X-Smug-FileName': file.name,
            'X-Smug-ResponseType': 'JSON',
            'X-Smug-Version': 'v2'
        };
        
        const response = await fetch(UPLOAD_URL, {
            method: 'POST',
            headers: headers,
            body: file
        });
        
        if (!response.ok) {
            throw new Error(`SmugMug Upload Error: ${await response.text()}`);
        }
    
        const result = await response.json();
        if (result.stat !== 'ok' || !result.Image) {
            throw new Error(`SmugMug Upload Failed: ${result.message}`);
        }
        
        // The upload response is minimal. We need to make a second request to the standard
        // API to get the full image details, including the expanded URLs.
        const imageDetailsResponse = await this.request('GET', `${result.Image.Uri}?_expand=LargestImage`);
        const img = imageDetailsResponse.Image;
    
        return {
            id: img.ImageKey,
            uri: img.Uri,
            imageUrl: img.Uris.LargestImage.Uri,
            status: PhotoStatus.PENDING,
            aiData: { 
                title: img.Title || '', 
                description: img.Caption || '', 
                keywords: img.KeywordArray || [] 
            },
            error: null,
        };
        */
       
        // By default, this service is not used. If a developer switches to it without
        // implementing a proxy, this error will guide them.
        return Promise.reject(new Error(
            "Real photo uploads require a server-side proxy to handle OAuth 1.0a signing and CORS. " +
            "See comments in smugmugService.ts for the required implementation. The application uses a mock " +
            "service by default to demonstrate UI functionality."
        ));
    }
}

export const smugmugService = new SmugMugService();