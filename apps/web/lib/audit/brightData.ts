export async function generateSnapshotId(url: string, platform: string) {
  let datasetId = null;

  // Validate platform
  const validPlatforms = ["instagram", "linkedin", "youtube", "tiktok"];
  if (!validPlatforms.includes(platform.toLowerCase())) {
    throw new Error(`Invalid platform: ${platform}. Must be one of: ${validPlatforms.join(", ")}`);
  }

  // Validate URL
  try {
    const urlObj = new URL(url);
    if (!url.trim()) {
      throw new Error("URL cannot be empty");
    }
  } catch (error) {
    throw new Error(`Invalid URL: ${url}`);
  }

  // Map platform to datasetId
  if (platform === "instagram") {
    datasetId = "gd_l1vikfch901nx3by4";
  } else if (platform === "linkedin") {
    datasetId = "gd_l1viktl72bvl7bjuj0";
  } else if (platform === "youtube") {
    datasetId = "gd_lk538t2k2p1k3oos71";
  } else if (platform === "tiktok") {
    datasetId = "gd_l1villgoiiidt09ci";
  }

  if (!process.env.BRIGHT_DATA_TOKEN) {
    throw new Error("BRIGHT_DATA_TOKEN environment variable is not configured");
  }

  try {
    const response = await fetch(
      `https://api.brightdata.com/datasets/v3/trigger?dataset_id=${datasetId}&include_errors=true`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.BRIGHT_DATA_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([{ url: url.trim() }]),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Bright Data API error: ${response.statusText}. ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.snapshot_id) {
      throw new Error("No snapshot_id returned from Bright Data API");
    }

    return result.snapshot_id;
  } catch (error) {
    console.error("Error generating snapshot ID:", error);
    throw error;
  }
}

export const fetchSnapshot = async (
  snapshotId: string,
  retries = 5,
  delay = 10000
): Promise<any[]> => {


  for (let attempt = 1; attempt <= retries; attempt++) {
    

    try {
    

      const snapshotResponse = await fetch(
        `https://api.brightdata.com/datasets/v3/snapshot/${snapshotId}?format=json`,
        {
          headers: { Authorization: `Bearer ${process.env.BRIGHT_DATA_TOKEN}` },
        }
      );

      if (!snapshotResponse.ok) {
        const errorText = await snapshotResponse.text();
        console.error(
          `Snapshot response error on attempt ${attempt}:`,
          errorText
        );
        throw new Error(`Failed to fetch snapshot data: ${errorText}`);
      }

      const snapshotData = await snapshotResponse.json();

      if (snapshotData.status === "running") {
        console.log(
          `Snapshot still processing. Retrying in ${delay / 1000} seconds...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      if (Array.isArray(snapshotData) && snapshotData.length > 0) {
        console.log(
          ` Snapshot data fetched successfully! (${snapshotData.length} records)`
        );
        return snapshotData;
      }

      console.warn("⚠️ No data found in snapshot response, retrying...");
    } catch (error) {
      console.error(`Error fetching snapshot (attempt ${attempt}):`, error);
      if (attempt === retries) {
        console.error("Max retries reached. Snapshot retrieval failed.");
        throw new Error("Max retries reached while fetching snapshot");
      }
    }
  }

  throw new Error("Snapshot retrieval failed after maximum retries.");
};
