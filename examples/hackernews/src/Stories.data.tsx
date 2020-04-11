import { createResource } from "../../../";
import { fetchTopStories } from "./Hackernews";
import prepareStory from "./Story.data";

const TopStoriesResource = createResource(fetchTopStories, "top-stories");

export default function prepareStories(limit: number) {
  const { prepare: prepareTopStories, get: getTopStories } = TopStoriesResource;

  prepareTopStories().then(() => {
    const topStories = getTopStories();
    if (Array.isArray(topStories)) {
      topStories.slice(0, limit).forEach((storyId) => {
        prepareStory(storyId);
      });
    }
  });

  return {
    TopStoriesResource,
  };
}
