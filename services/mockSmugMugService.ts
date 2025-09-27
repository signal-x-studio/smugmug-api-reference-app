import { SmugMugCredentials, Photo, PhotoStatus, AiData, Album, SmugMugNode, Comment } from '../types';

// This mock service simulates the SmugMug API to allow for UI development
// without needing a real, working backend proxy for OAuth 1.0a.

const mockNodeTree: SmugMugNode[] = [
    { id: 'ALBUM_1', name: 'Landscapes', uri: '/api/v2/album/ALBUM_1', description: 'A collection of beautiful landscapes from around the world.', keywords: ['nature', 'travel', 'scenery'], imageCount: 4, type: 'Album' },
    { 
        id: 'FOLDER_1', 
        name: 'Client Work', 
        uri: '/api/v2/node/FOLDER_1', 
        type: 'Folder', 
        children: [
            { id: 'ALBUM_2', name: 'Portraits', uri: '/api/v2/album/ALBUM_2', description: '', keywords: [], imageCount: 2, type: 'Album' },
            { id: 'ALBUM_3', name: 'Cityscapes', uri: '/api/v2/album/ALBUM_3', description: 'The hustle and bustle of urban life.', keywords: ['city', 'urban', 'architecture'], imageCount: 2, type: 'Album' },
        ] 
    },
    { id: 'ALBUM_4', name: 'Abstract', uri: '/api/v2/album/ALBUM_4', description: '', keywords: [], imageCount: 1, type: 'Album' },
    { id: 'FOLDER_EMPTY', name: 'Empty Folder', uri: '/api/v2/node/FOLDER_EMPTY', type: 'Folder', children: [] },
];


let mockPhotos: { [albumId: string]: Photo[] } = {
  'ALBUM_1': [
      {
        id: 'MOCK_ANIMAL_12',
        uri: '/api/v2/image/MOCK_ANIMAL_12',
        imageUrl: 'https://images.pexels.com/photos/326900/pexels-photo-326900.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        aiData: { title: 'Curious Fox', description: 'A red fox stands in a snowy field, looking directly at the camera with curiosity.', keywords: ['fox', 'animal', 'snow', 'winter', 'wildlife'] },
        status: PhotoStatus.PENDING, error: null
      },
      {
        id: 'MOCK_NATURE_2',
        uri: '/api/v2/image/MOCK_NATURE_2',
        imageUrl: 'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        aiData: { title: 'Misty Forest Path', description: 'A serene view of a wooden walkway winding through a foggy forest with tall, green trees.', keywords: ['forest', 'mist', 'path', 'nature', 'serene'] },
        status: PhotoStatus.PENDING, error: null
      },
      {
        id: 'MOCK_TRAVEL_8',
        uri: '/api/v2/image/MOCK_TRAVEL_8',
        imageUrl: 'https://images.pexels.com/photos/21014/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        aiData: { title: 'Mountain Reflection', description: 'A stunning landscape of a mountain reflected in the clear, still water of a lake.', keywords: ['mountain', 'lake', 'reflection', 'travel', 'landscape'] },
        status: PhotoStatus.PENDING, error: null
      },
       {
        id: 'MOCK_SPACE_9',
        uri: '/api/v2/image/MOCK_SPACE_9',
        imageUrl: 'https://images.pexels.com/photos/110854/pexels-photo-110854.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        aiData: { title: 'Milky Way Galaxy', description: 'A breathtaking night sky filled with stars, showcasing the vibrant colors of the Milky Way galaxy.', keywords: ['space', 'stars', 'galaxy', 'night', 'astronomy'] },
        status: PhotoStatus.PENDING, error: null
      },
  ],
  'ALBUM_2': [
     {
        id: 'MOCK_PEOPLE_7',
        uri: '/api/v2/image/MOCK_PEOPLE_7',
        imageUrl: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        aiData: { title: 'Man in Profile', description: 'A profile shot of a man with a beard, looking off into the distance.', keywords: ['portrait', 'man', 'profile', 'beard', 'person'] },
        status: PhotoStatus.PENDING, error: null
      },
      {
        id: 'MOCK_FASHION_10',
        uri: '/api/v2/image/MOCK_FASHION_10',
        imageUrl: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        aiData: { title: 'Dapper Gentleman', description: 'A well-dressed man in a suit adjusts his tie, exuding confidence and style.', keywords: ['fashion', 'suit', 'style', 'portrait', 'man'] },
        status: PhotoStatus.PENDING, error: null
      },
  ],
  'ALBUM_3': [
     {
        id: 'MOCK_CITY_3',
        uri: '/api/v2/image/MOCK_CITY_3',
        imageUrl: 'https://images.pexels.com/photos/2246476/pexels-photo-2246476.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        aiData: { title: 'Urban Canyon', description: 'A view looking up from a city street, surrounded by towering skyscrapers and illuminated signs.', keywords: ['city', 'skyscraper', 'urban', 'street', 'night'] },
        status: PhotoStatus.PENDING, error: null
      },
      {
        id: 'MOCK_CAR_11',
        uri: '/api/v2/image/MOCK_CAR_11',
        imageUrl: 'https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        aiData: { title: 'Classic Silver Mercedes', description: 'A vintage silver Mercedes-Benz parked on an autumn road, surrounded by fallen leaves.', keywords: ['car', 'vintage', 'classic', 'Mercedes', 'autumn'] },
        status: PhotoStatus.PENDING, error: null
      },
  ],
  'ALBUM_4': [
    {
        id: 'MOCK_ABSTRACT_1',
        uri: '/api/v2/image/MOCK_ABSTRACT_1',
        imageUrl: 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        aiData: { title: 'Colorful Smoke', description: 'An abstract image of swirling, vibrant smoke in hues of purple, blue, and pink.', keywords: ['abstract', 'smoke', 'color', 'vibrant', 'background'] },
        status: PhotoStatus.PENDING, error: null
    },
  ]
};

const mockComments: { [imageId: string]: Comment[] } = {
    'MOCK_NATURE_2': [
        { id: 'C1', text: 'This looks so peaceful! Where was this taken?', authorName: 'Jane Doe', date: '2023-10-26T10:00:00Z' },
        { id: 'C2', text: 'Absolutely stunning shot. The atmosphere is incredible.', authorName: 'John Smith', date: '2023-10-26T11:30:00Z' },
    ],
    'MOCK_TRAVEL_8': [
        { id: 'C3', text: 'Wow, the reflection is perfect!', authorName: 'Emily White', date: '2023-09-15T14:22:00Z' },
    ],
    'MOCK_FASHION_10': [], // A photo with no comments to test the empty state
};

class MockSmugMugService {
    private albumsFetchedOnce: Set<string> = new Set();
    
    public init(credentials: SmugMugCredentials) {
        console.log("Mock SmugMug Service Initialized.");
        this.albumsFetchedOnce.clear();
    }
    
    private simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    public async fetchNodeTree(): Promise<SmugMugNode[]> {
        console.log("Mock: Fetching node tree...");
        await this.simulateDelay(500);
        console.log("Mock: Returning node tree:", mockNodeTree);
        return JSON.parse(JSON.stringify(mockNodeTree));
    }
    
    public async createAlbum(albumData: {Name: string, UrlName: string}): Promise<Album> {
        console.log("Mock: Creating album with data:", albumData);
        await this.simulateDelay(600);
        const newAlbum: Album = {
            id: `ALBUM_${Date.now()}`,
            name: albumData.Name,
            uri: `/api/v2/album/ALBUM_${Date.now()}`,
            description: '',
            keywords: [],
            imageCount: 0,
            type: 'Album'
        };
        mockNodeTree.unshift(newAlbum); // Add to the start of the list
        mockPhotos[newAlbum.id] = []; // Create an empty photo list for it
        console.log("Mock: Created new album:", newAlbum);
        return newAlbum;
    }

    public async fetchAlbumImages(albumUri: string): Promise<Photo[]> {
        const albumId = albumUri.split('/').pop();
        console.log(`Mock: Fetching photos for album ${albumId}...`);
        await this.simulateDelay(800);
        if (!albumId || !mockPhotos[albumId]) {
            console.log(`Mock: No photos found for album ${albumId}`);
            return [];
        }

        // Simulate a new photo appearing after the first fetch to test the "Sync" feature
        if (albumId === 'ALBUM_1' && !this.albumsFetchedOnce.has(albumId)) {
            this.albumsFetchedOnce.add(albumId);
            // On first load, return only the original 3 photos, excluding the new "fox" photo
            const originalPhotos = mockPhotos[albumId].slice(1); 
            console.log(`Mock: Returning initial photos for ${albumId}:`, originalPhotos);
            return originalPhotos.map(p => ({ ...p }));
        }

        const photosToReturn = mockPhotos[albumId].map(p => ({ ...p }));
        console.log(`Mock: Returning all photos for ${albumId}:`, photosToReturn);
        return photosToReturn;
    }

    public async updatePhotoMetadata(imageUri: string, data: AiData): Promise<void> {
        console.log(`Mock: Updating photo ${imageUri} with data:`, data);
        await this.simulateDelay(800);
        
        const imageId = imageUri.split('/').pop();
        // Update the mock data in place
        for (const albumId in mockPhotos) {
            const photoIndex = mockPhotos[albumId].findIndex(p => p.id === imageId);
            if(photoIndex > -1) {
                mockPhotos[albumId][photoIndex].aiData = data;
                break;
            }
        }
        
        console.log(`Mock: Successfully updated ${imageUri}`);
    }

    public async updateAlbumMetadata(albumUri: string, data: { Name: string; Description: string; KeywordArray: string[]; }): Promise<void> {
        console.log(`Mock: Updating album ${albumUri} with data:`, data);
        await this.simulateDelay(500);

        const findAndUpdate = (nodes: SmugMugNode[]): boolean => {
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                if (node.uri === albumUri && node.type === 'Album') {
                    nodes[i] = {
                        ...node,
                        name: data.Name,
                        description: data.Description,
                        keywords: data.KeywordArray
                    };
                    return true;
                }
                if (node.type === 'Folder' && findAndUpdate(node.children)) {
                    return true;
                }
            }
            return false;
        };

        findAndUpdate(mockNodeTree);
        console.log(`Mock: Successfully updated album ${albumUri}`);
    }

    public async deletePhoto(imageUri: string): Promise<void> {
        console.log(`Mock: Deleting photo ${imageUri}`);
        await this.simulateDelay(1000);
        const imageId = imageUri.split('/').pop();
        let albumIdToUpdate: string | null = null;
        
        for (const albumId in mockPhotos) {
             const photoIndex = mockPhotos[albumId].findIndex(p => p.id === imageId);
             if (photoIndex > -1) {
                 mockPhotos[albumId].splice(photoIndex, 1);
                 albumIdToUpdate = albumId;
                 break;
             }
        }

        if (albumIdToUpdate) {
            const findAndDecrement = (nodes: SmugMugNode[]) => {
                for (const node of nodes) {
                    if (node.type === 'Album' && node.id === albumIdToUpdate) {
                        node.imageCount--;
                        return true;
                    }
                    if (node.type === 'Folder' && findAndDecrement(node.children)) {
                        return true;
                    }
                }
                return false;
            }
            findAndDecrement(mockNodeTree);
        }
        console.log(`Mock: Successfully deleted ${imageUri}`);
    }
    
    public async fetchImageComments(imageUri: string): Promise<Comment[]> {
        const imageId = imageUri.split('/').pop();
        console.log(`Mock: Fetching comments for image ${imageId}...`);
        await this.simulateDelay(1200);
        
        if (!imageId || !mockComments[imageId]) {
            console.log(`Mock: No comments found for image ${imageId}`);
            return [];
        }

        const commentsToReturn = mockComments[imageId];
        console.log(`Mock: Returning ${commentsToReturn.length} comments for ${imageId}`);
        return commentsToReturn;
    }

    public async fetchAllUserImages(): Promise<Photo[]> {
        console.log("Mock: Fetching all user images...");
        await this.simulateDelay(1500);
        const allPhotos = Object.values(mockPhotos).flat();
        console.log(`Mock: Found ${allPhotos.length} total photos.`);
        return allPhotos;
    }
    
    public async collectImageToAlbum(imageUri: string, albumUri: string): Promise<void> {
        const imageId = imageUri.split('/').pop();
        const albumId = albumUri.split('/').pop();
        console.log(`Mock: Collecting image ${imageId} into album ${albumId}`);
        await this.simulateDelay(200);

        if (!albumId || !imageId) {
            throw new Error("Mock error: Invalid image or album URI.");
        }
        
        const allPhotos = Object.values(mockPhotos).flat();
        const photoToCollect = allPhotos.find(p => p.id === imageId);

        if (!photoToCollect) {
            throw new Error("Mock error: Image not found.");
        }

        if (!mockPhotos[albumId]) {
             throw new Error("Mock error: Target album not found.");
        }

        // Add to photo list
        mockPhotos[albumId].push(photoToCollect);
        
        // Update album count in the node tree
        const findAndIncrement = (nodes: SmugMugNode[]) => {
            for (const node of nodes) {
                if (node.type === 'Album' && node.id === albumId) {
                    node.imageCount++;
                    return true;
                }
                if (node.type === 'Folder' && findAndIncrement(node.children)) {
                    return true;
                }
            }
            return false;
        }
        findAndIncrement(mockNodeTree);

        console.log(`Mock: Successfully collected image. New count for album ${albumId} is ${mockPhotos[albumId].length}`);
    }

    public async uploadPhoto(albumUri: string, file: File): Promise<Photo> {
        const albumId = albumUri.split('/').pop();
        console.log(`Mock: Uploading photo "${file.name}" to album ${albumId}`);
        await this.simulateDelay(2000); // Simulate upload time
        
        if (!albumId || !mockPhotos[albumId]) {
            throw new Error("Mock Error: Album not found for upload.");
        }

        const newPhoto: Photo = {
            id: `MOCK_ID_${Date.now()}`,
            uri: `/api/v2/image/MOCK_URI_${Date.now()}`,
            imageUrl: 'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // A static placeholder for new uploads
            status: PhotoStatus.PENDING,
            aiData: {
                title: file.name,
                description: '',
                keywords: [],
            },
            error: null,
        };

        // Add to the beginning of the album's photos
        mockPhotos[albumId].unshift(newPhoto);

        // Update album count
        const findAndIncrement = (nodes: SmugMugNode[]) => {
            for (const node of nodes) {
                if (node.type === 'Album' && node.id === albumId) {
                    node.imageCount++;
                    return true;
                }
                if (node.type === 'Folder' && findAndIncrement(node.children)) {
                    return true;
                }
            }
            return false;
        }
        findAndIncrement(mockNodeTree);

        console.log(`Mock: Successfully "uploaded" and created new photo:`, newPhoto);
        return newPhoto;
    }
}

export const smugmugService = new MockSmugMugService();