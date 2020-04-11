/**
 * =======================
 * Top Stories
 * =======================
 */
type StoryID = number;
const topStoriesUrl = "https://hacker-news.firebaseio.com/v0/topstories.json";
export async function fetchTopStories(): Promise<StoryID[]> {
  const res = await fetch(topStoriesUrl);
  const json = await res.json();
  return json as StoryID[];
}

/**
 * =======================
 * Story Detail
 * =======================
 */
export type Story = {
  id: StoryID;
  title: string;
  by: string;
  url: string;
  time: number;
  descendants: number;
  score: number;
  kids: StoryID[];
  type: "story";
};

const storyUrl = (id: number) =>
  "https://hacker-news.firebaseio.com/v0/item/" + id + ".json";

export async function fetchStory(id: number): Promise<Story> {
  const res = await fetch(storyUrl(id));
  const json = await res.json();
  return json as Story;
}
