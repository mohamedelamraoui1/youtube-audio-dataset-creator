import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export interface AudioRequest {
  url: string;
  language: string;
  title: string;
  gender: string;
  quality_checked: boolean;
  trim_start?: number;
  trim_end?: number;
  segment_duration?: number;
  analyze_quality?: boolean;
}

export interface AudioResponse {
  success: boolean;
  message: string;
  files: string[];
  audio_checks: {
    has_low_bg_noise: boolean | null;
    speech_ratio: number | null;
    likely_single_speaker: boolean | null;
    spectral_flatness?: number;
    quality_score?: number;
    error?: string;
  };
}

export interface LanguagesResponse {
  languages: Record<string, string>;
}

export const api = {
  async getLanguages(): Promise<LanguagesResponse> {
    const response = await axios.get(`${API_BASE_URL}/languages`);
    return response.data;
  },

  async processAudio(data: AudioRequest): Promise<AudioResponse> {
    const response = await axios.post(`${API_BASE_URL}/process-audio`, data);
    return response.data;
  },

  async getFiles(language: string): Promise<{ files: string[] }> {
    const response = await axios.get(`${API_BASE_URL}/files/${language}`);
    return response.data;
  },
};
