export interface User {
  id: string;
  emailOrPhone: string;
  credits: number;
  plan: string;
  dailyGenerations: number;
  lastGenerationDate: string;
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrl: string;
  timestamp: string;
  referenceImageUrl?: string;
  isUpscaled?: boolean;
}

export interface Plan {
  name: string;
  price: string;
  credits: number;
  features: string[];
  popular?: boolean;
}

export enum Screen {
  GENERATE = 'GENERATE',
  HISTORY = 'HISTORY',
  PROFILE = 'PROFILE',
  PRICING = 'PRICING'
}