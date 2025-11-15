import { useState, useEffect } from "react";
import { buildApiUrl } from "../utils/api";

interface Track {
  id: string;
  slug: string;
  title: string;
  priceCents: number;
  currency: string;
  bpm?: number;
  key?: string;
  genre?: string;
  description?: string;
  coverUrl?: string;
  previewUrl?: string;
  durationSec?: number;
  waveformData?: any;
  productType: string;
  createdAt: string;
  updatedAt: string;
  licenses?: Array<{
    id: string;
    type: string;
    priceCents: number;
    currency: string;
  }>;
}

interface UseTracksParams {
  page?: number;
  pageSize?: number;
  genre?: string;
  minBpm?: number;
  maxBpm?: number;
  key?: string;
  sort?: "createdAt" | "price" | "bpm";
  order?: "asc" | "desc";
}

interface UseTracksReturn {
  data: Track[] | null;
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  } | null;
  loading: boolean;
  error: string | null;
}

export function useTracks(params: UseTracksParams = {}): UseTracksReturn {
  const [data, setData] = useState<Track[] | null>(null);
  const [meta, setMeta] = useState<UseTracksReturn["meta"]>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTracks = async () => {
      setLoading(true);
      setError(null);

      try {
        // Construire les query params
        const queryParams = new URLSearchParams();
        
        if (params.page) queryParams.set("page", String(params.page));
        if (params.pageSize) queryParams.set("pageSize", String(params.pageSize));
        if (params.genre) queryParams.set("genre", params.genre);
        if (params.minBpm) queryParams.set("minBpm", String(params.minBpm));
        if (params.maxBpm) queryParams.set("maxBpm", String(params.maxBpm));
        if (params.key) queryParams.set("key", params.key);
        if (params.sort) queryParams.set("sort", params.sort);
        if (params.order) queryParams.set("order", params.order);

        const url = buildApiUrl(`tracks?${queryParams.toString()}`);
        const response = await fetch(url);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const result = await response.json();
        setData(result.data);
        setMeta(result.meta);
      } catch (err) {
        console.error("Error fetching tracks:", err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, [
    params.page,
    params.pageSize,
    params.genre,
    params.minBpm,
    params.maxBpm,
    params.key,
    params.sort,
    params.order,
  ]);

  return { data, meta, loading, error };
}

// Hook pour récupérer un track spécifique par slug
export function useTrack(slug: string | undefined) {
  const [data, setData] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const fetchTrack = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = buildApiUrl(`tracks/${slug}`);
        const response = await fetch(url);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error("Error fetching track:", err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchTrack();
  }, [slug]);

  return { data, loading, error };
}

