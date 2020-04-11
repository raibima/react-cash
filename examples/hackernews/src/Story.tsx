import React from "react";
import prepareStory from "./Story.data";

type StoryProps = ReturnType<typeof prepareStory> & {
  id: number;
};

export default function Story({ StoryResource, id }: StoryProps) {
  const [story] = StoryResource.useResource(id);
  return (
    <div>
      <h2>
        <a href={story.url}>{story.title}</a>
      </h2>
      <p>{`By: ${story.by}`}</p>
    </div>
  );
}
