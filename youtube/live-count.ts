/* eslint-disable no-extra-boolean-cast */

import type {
  VercelRequest,
  VercelResponse,
} from "@vercel/node";

type YouTubeResponse = {
  items?: Array<{
    liveStreamingDetails?: {
      actualStartTime?: string;
      actualEndTime?: string;
      concurrentViewers?: string;
    };
  }>;

  error?: {
    code?: number;
    message?: string;
    errors?: Array<{
      reason?: string;
      message?: string;
    }>;
  };
};

type LiveCountResponse = {
  live: boolean;
  viewers: number | null;
  updatedAt?: string;
  message?: string;
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // ==========================================
  // CORS
  // ==========================================

  res.setHeader(
    "Access-Control-Allow-Origin",
    "*",
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, OPTIONS",
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type",
  );

  // ==========================================
  // OPTIONS / PREFLIGHT
  // ==========================================

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // ==========================================
  // ONLY GET
  // ==========================================

  if (req.method !== "GET") {
    return res.status(405).json({
      live: false,
      viewers: null,
      message: "Method not allowed",
    } satisfies LiveCountResponse);
  }

  // ==========================================
  // VIDEO ID
  // ==========================================

  const videoId =
    typeof req.query.videoId === "string"
      ? req.query.videoId.trim()
      : "";

  if (!videoId) {
    return res.status(400).json({
      live: false,
      viewers: null,
      message: "videoId is required",
    } satisfies LiveCountResponse);
  }

  // ==========================================
  // BASIC VIDEO ID VALIDATION
  // ==========================================

  if (
    videoId.length < 5 ||
    videoId.length > 100
  ) {
    return res.status(400).json({
      live: false,
      viewers: null,
      message: "Invalid videoId",
    } satisfies LiveCountResponse);
  }

  // ==========================================
  // YOUTUBE API KEY
  // ==========================================

  const apiKey =
    process.env.YOUTUBE_API_KEY?.trim();

  if (!apiKey) {
    console.error(
      "YOUTUBE_API_KEY environment variable is missing.",
    );

    return res.status(500).json({
      live: false,
      viewers: null,
      message:
        "YouTube API key is not configured",
    } satisfies LiveCountResponse);
  }

  try {
    // ==========================================
    // YOUTUBE DATA API URL
    // ==========================================

    const youtubeUrl = new URL(
      "https://www.googleapis.com/youtube/v3/videos",
    );

    youtubeUrl.searchParams.set(
      "part",
      "liveStreamingDetails",
    );

    youtubeUrl.searchParams.set(
      "id",
      videoId,
    );

    youtubeUrl.searchParams.set(
      "key",
      apiKey,
    );

    // ==========================================
    // API REQUEST
    // ==========================================

    const response = await fetch(
      youtubeUrl.toString(),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    const data =
      (await response.json()) as YouTubeResponse;

    // ==========================================
    // YOUTUBE API ERROR
    // ==========================================

    if (!response.ok) {
      console.error(
        "YouTube API error:",
        data?.error,
      );

      return res.status(response.status).json({
        live: false,
        viewers: null,
        message:
          data?.error?.message ||
          "YouTube API request failed",
      } satisfies LiveCountResponse);
    }

    // ==========================================
    // VIDEO NOT FOUND
    // ==========================================

    const video = data.items?.[0];

    if (!video) {
      return res.status(200).json({
        live: false,
        viewers: null,
        message: "Video not found",
        updatedAt: new Date().toISOString(),
      } satisfies LiveCountResponse);
    }

    // ==========================================
    // LIVE STREAM DETAILS
    // ==========================================

    const details =
      video.liveStreamingDetails;

    // ==========================================
    // NOT A LIVE VIDEO
    // ==========================================

    if (!details) {
      return res.status(200).json({
        live: false,
        viewers: null,
        message: "Not a live broadcast",
        updatedAt: new Date().toISOString(),
      } satisfies LiveCountResponse);
    }

    // ==========================================
    // CURRENT VIEWERS
    // ==========================================

    const viewers =
      details.concurrentViewers !== undefined
        ? Number(details.concurrentViewers)
        : null;

    const validViewerCount =
      viewers !== null &&
      Number.isFinite(viewers)
        ? Math.max(0, viewers)
        : null;

    // ==========================================
    // CURRENT LIVE STATUS
    // ==========================================

    const isCurrentlyLive =
      Boolean(details.actualStartTime) &&
      !Boolean(details.actualEndTime);

    // ==========================================
    // CACHE RESPONSE
    // ==========================================
    //
    // Helps reduce unnecessary repeated requests.
    //

    res.setHeader(
      "Cache-Control",
      "s-maxage=20, stale-while-revalidate=10",
    );

    // ==========================================
    // FINAL RESPONSE
    // ==========================================

    return res.status(200).json({
      live: isCurrentlyLive,

      viewers: isCurrentlyLive
        ? validViewerCount
        : null,

      updatedAt: new Date().toISOString(),
    } satisfies LiveCountResponse);
  } catch (error) {
    console.error(
      "YouTube live count error:",
      error,
    );

    return res.status(500).json({
      live: false,
      viewers: null,
      message:
        "Unable to fetch YouTube live data",
    } satisfies LiveCountResponse);
  }
}