export interface StructuredDiagnosis {
  problem: string;
  cause: string;
  solution: string;
  prevention: string;
  organicRemedy?: string;
}

export interface DiagnosisResult {
  id: string;
  rawText: string;
  structured: StructuredDiagnosis;
  season: string;
  location?: string | null;
  cropPhoto?: string | null;
  querySpeech?: string | null;
  timestamp: string;
}

export interface SeasonInfo {
  name: string;
  banglaMonths: string;
  englishMonths: string;
  icon: string;
  keyCrops: string[];
  climateRisk: string;
  advice: string;
}

export interface SampleQuery {
  id: string;
  crop: string;
  query: string;
  shortDesc: string;
  imageUrl?: string;
}

export interface CropInfo {
  id: string;
  name: string;
  scientificName: string;
  commonDiseases: {
    name: string;
    symptom: string;
    remedy: string;
  }[];
}
