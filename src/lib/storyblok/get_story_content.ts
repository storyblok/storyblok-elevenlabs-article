import * as cheerio from "cheerio";
import Storyblok from "./client";
import * as dotenv from "dotenv";

dotenv.config();

export const getStoryContent = async (
  spaceId: number,
  storyId: number
): Promise<string> => {
  try {
    const domain = await getDomain(spaceId);
    const url = await getStoryUrl(spaceId, storyId);
    const urlToCrawl = `${domain}${url}?ts=${Date.now()}`;
    const res = await fetch(urlToCrawl);
    const urlText = await res.text();
    const cheerioDocument = cheerio.load(urlText);
    return `Article title: ${cheerioDocument("h1").text()}. <break time="1.0s" /> Article content: ${cheerioDocument("[data-blog-content]").text()}`;
  } catch (err) {
    console.log(err);
    return "";
  }
};

const getStoryUrl = async (
  spaceId: number,
  storyId: number
): Promise<string> => {
  try {
    const res = await Storyblok.get(`/spaces/${spaceId}/stories/${storyId}`);
    return res.data.story.full_slug;
  } catch (err) {
    console.log(err);
    return "";
  }
};

const getDomain = async (spaceId: number): Promise<string> => {
  try {
    const res = await Storyblok.get(`/spaces/${spaceId}`);
    return res.data.space.domain;
  } catch (err) {
    console.log(err);
    return "";
  }
};
