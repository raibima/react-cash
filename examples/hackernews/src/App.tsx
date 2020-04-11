// @ts-ignore
import React, { Suspense, useState, useTransition } from "react";
import Stories from "./Stories";
import prepareStories from "./Stories.data";

const initialLimit = 3;
const step = 3;
const { TopStoriesResource } = prepareStories(initialLimit);

function App() {
  const [limit, setLimit] = useState(initialLimit);
  const [startTransition, isPending] = useTransition({ timeoutMs: 1000 });
  const loadMore = () => {
    startTransition(() => {
      setLimit(limit + step);
    });
  };
  return (
    <div>
      <h1>Hackernews</h1>
      <Suspense fallback="Loading...">
        <Stories TopStoriesResource={TopStoriesResource} limit={limit} />
      </Suspense>
      <button onClick={loadMore}>Load more</button>
      {isPending && <p>Loading...</p>}
    </div>
  );
}

export default App;
