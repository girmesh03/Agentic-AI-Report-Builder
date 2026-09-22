/**
 * @module hooks/useAudioBlob
 * @description Custom hook for Method 1: Authenticated In-Memory Blob Audio Streaming.
 * Fetches protected audio clip binaries with credentials: 'include' and manages
 * local Blob URL lifecycle with automatic revocation on cleanup.
 * Conforms to Master Technical Specification Section 6.5.
 */
import { useState, useEffect } from 'react';

/**
 * Fetches an authenticated audio clip from the backend and produces a revocable object URL.
 *
 * @param {string} reportId - MongoDB ID of the parent report.
 * @param {string} clipId - MongoDB ID of the audio clip subdocument.
 * @returns {{ blobUrl: string|null, isLoading: boolean, error: string|null }}
 */
export const useAudioBlob = (reportId, clipId) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!reportId || !clipId) {
      setBlobUrl(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;
    let createdUrl = null;
    const controller = new AbortController();

    const fetchClip = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/v1/reports/${reportId}/clips/${clipId}`, {
          method: 'GET',
          credentials: 'include',
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to stream audio clip (${response.status})`);
        }

        const blob = await response.blob();
        if (isMounted) {
          createdUrl = URL.createObjectURL(blob);
          setBlobUrl(createdUrl);
          setIsLoading(false);
        }
      } catch (err) {
        if (err.name !== 'AbortError' && isMounted) {
          setError(err.message || 'Error streaming audio');
          setIsLoading(false);
        }
      }
    };

    fetchClip();

    return () => {
      isMounted = false;
      controller.abort();
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [reportId, clipId]);

  return { blobUrl, isLoading, error };
};

export default useAudioBlob;
