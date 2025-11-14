// apps/web/src/hooks/useDownloads.ts
import { useState, useEffect } from "react";
import { buildApiUrl } from "../utils/api";

export interface DownloadLink {
  productId: string;
  productTitle: string;
  productSlug: string;
  downloadToken: string;
  downloadUrl: string;
  expiresAt: string;
  downloadsRemaining: number;
  downloadCount: number;
  maxDownloads: number;
}

export interface DownloadLinks {
  orderId: string;
  buyerEmail: string;
  downloads: DownloadLink[];
}

export function useDownloads(orderId: string | null) {
  const [downloads, setDownloads] = useState<DownloadLinks | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const fetchDownloads = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = buildApiUrl(`orders/${orderId}/downloads`);
        const response = await fetch(url);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch downloads");
        }

        const data = await response.json();
        setDownloads(data);
      } catch (err) {
        setError((err as Error).message);
        console.error("Error fetching downloads:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDownloads();
  }, [orderId]);

  return { downloads, loading, error };
}


