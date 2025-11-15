export type VideoAspectRatio = '16:9' | '9:16';

export type GenerationStatus = 'idle' | 'loading' | 'success' | 'error';

export type VideoTheme = 'Serene Nature' | 'Golden Hour' | 'Divine Light' | 'Classic Parchment';

export interface AppState {
  verseText: string;
  verseReference: string;
  userDescription: string;
  aspectRatio: VideoAspectRatio;
  theme: VideoTheme;
  videoUrl: string | null;
  status: GenerationStatus;
  loadingMessage: string;
  error: string | null;
  apiKeySelected: boolean;
}
