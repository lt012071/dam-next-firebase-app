import type { NextApiRequest, NextApiResponse } from "next";
import { fetchVersions } from "@/lib/versionRepository";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const { assetId } = req.query;
  if (!assetId || typeof assetId !== "string") {
    res.status(400).json({ error: "assetId is required" });
    return;
  }
  try {
    const versions = await fetchVersions(assetId);
    res.status(200).json({ count: versions.length });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch versions" });
  }
} 