import StoryblokClient from "storyblok-js-client";
import * as dotenv from "dotenv";

dotenv.config();

if (!process.env.STORYBLOK_PERSONAL_ACCESS_TOKEN) {
  throw new Error(
    "Missing STORYBLOK_PERSONAL_ACCESS_TOKEN in environment variables"
  );
}
const Storyblok = new StoryblokClient({
  oauthToken: process.env.STORYBLOK_PERSONAL_ACCESS_TOKEN,
});

export default Storyblok;
