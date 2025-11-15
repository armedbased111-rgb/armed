// apps/web/src/hooks/useDownloadPackage.ts
import { useState, useEffect } from "react";
import { buildApiUrl } from "../utils/api";

export interface DownloadPackage {
  orderId: string;
  packageId: string;
  zipHash: string;
  fileSizeMb: number;
  expiresAt: string;
  downloadUrl: string;
}

export interface PackageStatus {
  packageId: string;
  orderId: string;
  zipHash: string;
  fileSizeMb: number | null;
  generatedAt: string;
  expiresAt: string;
  isExpired: boolean;
  downloadCount: number;
  maxDownloads: number;
  remainingDownloads: number;
  lastDownloadAt: string | null;
  available: boolean;
}

/**
 * Hook pour gérer le package de téléchargement complet d'une commande
 */
export function useDownloadPackage(orderId: string | null) {
  const [packageInfo, setPackageInfo] = useState<DownloadPackage | null>(null);
  const [packageStatus, setPackageStatus] = useState<PackageStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Récupérer le statut du package
  const fetchPackageStatus = async () => {
    if (!orderId) return;

    try {
      const url = buildApiUrl(`orders/${orderId}/package/status`);
      const response = await fetch(url);

      if (!response.ok) {
        // Si le package n'existe pas encore, ce n'est pas une erreur
        if (response.status === 404) {
          setPackageStatus(null);
          return;
        }
        throw new Error("Failed to fetch package status");
      }

      const data = await response.json();
      setPackageStatus(data);
    } catch (err) {
      console.error("Error fetching package status:", err);
      // Ne pas définir d'erreur pour le statut
    }
  };

  // Récupérer ou générer le package
  const fetchOrGeneratePackage = async () => {
    if (!orderId) return;

    setLoading(true);
    setGenerating(true);
    setError(null);

    try {
      const url = buildApiUrl(`orders/${orderId}/package`);
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate package");
      }

      const data = await response.json();
      setPackageInfo(data);
      
      // Rafraîchir le statut après génération
      await fetchPackageStatus();
    } catch (err) {
      setError((err as Error).message);
      console.error("Error generating package:", err);
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  // Télécharger le package
  const triggerDownload = () => {
    if (!orderId) return;

    const url = buildApiUrl(`orders/${orderId}/package/download`);
    
    // Ouvrir dans un nouvel onglet pour déclencher le téléchargement
    window.open(url, "_blank");
    
    // Rafraîchir le statut après un court délai
    setTimeout(() => {
      fetchPackageStatus();
    }, 1000);
  };

  // Charger le statut au montage
  useEffect(() => {
    if (orderId) {
      fetchPackageStatus();
    }
  }, [orderId]);

  return {
    downloadPackage: triggerDownload,
    packageInfo,
    packageStatus,
    loading,
    generating,
    error,
    fetchOrGeneratePackage,
    refreshStatus: fetchPackageStatus,
  };
}

