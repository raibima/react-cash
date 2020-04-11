import React from "react";
import Story from "./Story";
import prepareStories from "./Stories.data";
import prepareStory from "./Story.data";

type StoriesProp = ReturnType<typeof prepareStories> & {
  limit: number;
};

export default function Stories({ TopStoriesResource, limit }: StoriesProp) {
  const [topStories] = TopStoriesResource.useResource();
  return (
    <div>
      {topStories.slice(0, limit).map((storyID) => {
        const { StoryResource } = prepareStory(storyID);
        return (
          <Story key={storyID} id={storyID} StoryResource={StoryResource} />
        );
      })}
    </div>
  );
}
