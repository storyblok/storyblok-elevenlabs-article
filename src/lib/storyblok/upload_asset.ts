import { FormData } from "formdata-node";
import Storyblok from "./client";
import * as dotenv from "dotenv";

dotenv.config();

interface SignedResponse {
  fields: { [key: string]: string };
  post_url: string;
  pretty_url: string;
  id: number;
}

interface StoryblokAssetResponse {
  data: SignedResponse;
}

export const uploadAsset = async (
  fileContent: Buffer,
  spaceId: number,
  storyId: number
): Promise<boolean> => {
  const fileName = `${storyId}-text-to-speech.mp3`;
  try {
    // Upload the asset to the space
    const newAssetEntry = (await Storyblok.post(`/spaces/${spaceId}/assets/`, {
      filename: fileName,
    })) as unknown as StoryblokAssetResponse;
    const signedResponse = newAssetEntry.data as SignedResponse;
    const blob = new Blob([fileContent]);
    const assetRequestBody = new FormData();
    for (let key in signedResponse.fields) {
      if (signedResponse.fields[key])
        assetRequestBody.set(key, signedResponse.fields[key]);
    }
    assetRequestBody.set("file", blob, fileName);
    await fetch(signedResponse.post_url, {
      method: "POST",
      body: assetRequestBody,
    });
    await Storyblok.get(
      `spaces/${spaceId}/assets/${signedResponse.id}/finish_upload`
    );
    // Get the story
    const getStoryRes = await Storyblok.get(
      `/spaces/${spaceId}/stories/${storyId}`
    );
    // Update the story
    const updatePayload = getStoryRes.data;
    updatePayload.story.content.audio = {
      filename: signedResponse.pretty_url,
      fieldtype: "asset",
      is_external_url: false,
      id: signedResponse.id,
    };
    await Storyblok.put(
      `/spaces/${spaceId}/stories/${storyId}`,
      updatePayload
    );
    // Delete the old audio
    const oldAudio = getStoryRes.data.story.content.audio;
    if (oldAudio) {
      await Storyblok.delete(`/spaces/${spaceId}/assets/${oldAudio.id}`, {});
    }
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};
