// @ts-ignore
import React, { Suspense, useState, useTransition } from "react";
import Stories from "./Stories";
import prepareStories from "./Stories.data";
import prepareStory from "./Story.data";

const initialLimit = 3;
const step = 3;
const { TopStoriesResource } = prepareStories(initialLimit);

function App() {
  const [limit, setLimit] = useState(initialLimit);
  const [startTransition, isPending] = useTransition({ timeoutMs: 1000 });
  const loadMore = () => {
    const stories = TopStoriesResource.get() as number[];
    const nextStories = stories.slice(limit, limit + step);
    nextStories.forEach((storyId) => prepareStory(storyId));
    startTransition(() => {
      setLimit(limit + step);
    });
  };
  return (
    <div>
      <h1>Hackernews</h1>
      <Suspense fallback="Loading...">
        <Stories
          TopStoriesResource={TopStoriesResource}
          limit={limit}
          onRequestNext={loadMore}
          inlineSpinner={
            isPending ? <span style={{ marginLeft: 4 }}>Loading...</span> : null
          }
        />
      </Suspense>
    </div>
  );
}

export default App;
