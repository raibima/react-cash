// @ts-ignore
import React from "react";
import Story from "./Story";
import prepareStories from "./Stories.data";
import prepareStory from "./Story.data";

type StoriesProp = ReturnType<typeof prepareStories> & {
  limit: number;
  onRequestNext: () => void;
  inlineSpinner: React.ReactNode;
};

export default function Stories({
  TopStoriesResource,
  limit,
  onRequestNext,
  inlineSpinner
}: StoriesProp) {
  const [topStories] = TopStoriesResource.useResource();
  return (
    <div>
      {topStories.slice(0, limit).map((storyID) => {
        const { StoryResource } = prepareStory(storyID);
        return (
          <Story key={storyID} id={storyID} StoryResource={StoryResource} />
        );
      })}
      <button onClick={onRequestNext}>Load more</button>
      {inlineSpinner}
    </div>
  );
}
