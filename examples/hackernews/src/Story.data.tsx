import { createResource } from "../../../";
import { fetchStory } from "./Hackernews";

const StoryResource = createResource(fetchStory, (id) => `story-${id}`);

export default function prepareStory(storyId: number) {
  StoryResource.prepare(storyId);
  return {
    StoryResource,
  };
}
