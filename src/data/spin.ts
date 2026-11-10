// On-page projects for the full-screen reel. Each prompt is one app, with screens,
// models, and one rule from a published guide. The picker does not call Math.random.
// The page passes a random source.

export type SpinIdea = {
  id: string;
  title: string;
  prompt: string;
  guide: string;
  guideTitle: string;
};

const close = "Show the diff. Do not commit.";

function promptFor(slug: string, steps: readonly string[]): string {
  return [`Read https://laravel-vuejs.space/${slug}`, ...steps, close].join(
    "\n",
  );
}

function idea(
  id: string,
  title: string,
  slug: string,
  guideTitle: string,
  steps: readonly string[],
): SpinIdea {
  return {
    id,
    title,
    guide: `/${slug}`,
    guideTitle,
    prompt: promptFor(slug, steps),
  };
}

export const spinIdeas: readonly SpinIdea[] = [
  idea(
    "shelf",
    "Shelf, the bookshelf",
    "laravel-soft-deletes-index-vue",
    "Keep soft-deleted rows off a Vue index",
    [
      "Build Shelf, a bookshelf for one reader. They add a book, mark it finished, and take it off the shelf.",
      "Screens: the shelf, one book, and a form to add a book.",
      "Models: Book with a title, a writer name, and a finished date.",
      "Call delete() from the button labeled Remove. Leave removed books off the shelf.",
      "Do not call forceDelete() from the button you labeled Remove.",
      "Do not pass removed books to the shelf and hide them with v-if.",
    ],
  ),
  idea(
    "standup",
    "Standup, the daily board",
    "laravel-vue-policies",
    "Gate a Vue index with viewAny",
    [
      "Build Standup, a board a team fills each morning. Each person posts what they did and what is next.",
      "Screens: today's board, one update, and a form to post yours.",
      "Models: Update with a person name, a did line, and a next line.",
      "Call authorize('viewAny', Update::class) before you list the morning.",
      "The gate answers whether this person may open the board. The query answers which rows.",
      "Do not filter the rows in Vue after sending every update.",
    ],
  ),
  idea(
    "field",
    "Field, the journal",
    "laravel-vue-file-upload",
    "Upload files from Vue to Laravel with Inertia",
    [
      "Build Field, a journal of site visits. Each visit has a note and a cover photo.",
      "Screens: the journal, one visit, and a form that adds the visit and its photo.",
      "Models: Visit with a place name, a note, and a cover path.",
      "Validate the photo as an image, max 2048 kilobytes.",
      "Post the form and send _method of put. Save the path.",
      "Do not put the file bytes in the database.",
      "PHP does not fill a file on a real PUT, PATCH, or DELETE.",
    ],
  ),
  idea(
    "pantry",
    "Pantry, the kitchen list",
    "laravel-vue-pagination",
    "Laravel and Vue pagination",
    [
      "Build Pantry, a list for one kitchen. Add an item, mark it used, and keep the list moving.",
      "Screens: the list, one item, and a form to add an item.",
      "Models: Item with a name, a spot in the kitchen, and a used date.",
      "Order the items by id and call cursorPaginate(10). A cursor page has no last_page.",
      "Do not order by a timestamp that can tie.",
    ],
  ),
  idea(
    "roster",
    "Roster, the workshop list",
    "laravel-breeze-jetstream-vue",
    "Breeze, Jetstream, and the Vue starter kit",
    [
      "Build Roster, a list of people in a Saturday workshop. They sign in and then see who is coming.",
      "Screens: the login the kit already has, the roster, and a form to add your name.",
      "Models: Attendee with a name and a seat note.",
      "Use the login the Vue starter kit already ships.",
      "Do not install Breeze or Jetstream on top of the Vue starter kit.",
    ],
  ),
  idea(
    "clip",
    "Clip, the snippet box",
    "pinia-laravel-inertia",
    "When to use Pinia with Laravel and Inertia",
    [
      "Build Clip, a box of short code notes for one person. Saved notes stay. A half-written note does not.",
      "Screens: the box, one note, and a form that holds the draft.",
      "Models: Snippet with a label and a body.",
      "Pass the saved snippets as a prop.",
      "Use Pinia only for a draft a refresh should forget.",
      "Do not router.reload the snippets into a Pinia store.",
    ],
  ),
  idea(
    "hours",
    "Hours, the time log",
    "laravel-migrate-on-deploy-vue",
    "Run migrations in the release, not in a request",
    [
      "Build Hours, a log of time one person spent on tasks. It does not send invoices and it does not take payment.",
      "Screens: the week, one entry, and a form to log minutes.",
      "Models: Entry with a task name, a day, and minutes.",
      "Run php artisan migrate --force in the release when you add the entries table.",
      "Do not call Artisan::call('migrate') from a controller.",
      "Do not migrate from a queued job.",
    ],
  ),
  idea(
    "relay",
    "Relay, the announcement board",
    "laravel-should-broadcast-vue",
    "Queue a broadcast instead of blocking the save",
    [
      "Build Relay, an announcement board for one room. Post a note and the board updates for everyone there.",
      "Screens: the board, and a form to post a note.",
      "Models: Note with a body and an author name.",
      "Use ShouldBroadcast so the save does not wait on the socket.",
      "Leave broadcastOn on the public Channel.",
      "Listen with useEchoPublic.",
      "Do not listen with useEcho on a public channel.",
      "Do not put the provider key, or the Reverb secret, in the event payload.",
    ],
  ),
  idea(
    "atlas",
    "Atlas, the trip log",
    "laravel-automatic-eager-loading",
    "Eager load a relation for a Vue list",
    [
      "Build Atlas, a log of trips. Each stop names the person who wrote it.",
      "Screens: the trips, one trip with its stops, and a form to add a stop.",
      "Models: Trip, and Stop with a place name and an author.",
      "Call with('author') before you map the stops.",
      "Do not read the author inside map() after you forgot with().",
      "Do not eager load every relation.",
    ],
  ),
  idea(
    "lane",
    "Lane, the card board",
    "laravel-queue-work-vs-listen",
    "queue:work in production, listen locally",
    [
      "Build Lane, a board of cards for one project. Columns are todo, doing, and done.",
      "Screens: the board, one card, and a form to add a card.",
      "Models: Card with a title, a column, and a note.",
      "Moving a card to done dispatches a job that records the move.",
      "Run queue:work in production and queue:listen on the laptop.",
      "Do not call queue:work from the controller.",
    ],
  ),
  idea(
    "press",
    "Press, the changelog",
    "laravel-vue-flash",
    "Show a saved message in Vue",
    [
      "Build Press, a public changelog for one product. A release note shows up on the list after you save it.",
      "Screens: the changelog, one note, and a form to publish a note.",
      "Models: Release with a version and a body.",
      "Return Inertia::flash('toast', ...) with the saved sentence.",
      "The starter kit already listens.",
      "Do not register a second router.on('flash').",
    ],
  ),
  idea(
    "plot",
    "Plot, the garden log",
    "laravel-vue-pagination",
    "Render simplePaginate without a last page",
    [
      "Build Plot, a log of beds in one garden. Each bed records what is planted.",
      "Screens: the beds, one bed, and a form to add a bed.",
      "Models: Bed with a name, a plant, and a planted date.",
      "Call simplePaginate on the beds. Render previous and next only.",
      "Do not print last_page or compute page 2 of undefined.",
    ],
  ),
  idea(
    "crate",
    "Crate, the moving list",
    "laravel-soft-deletes-index-vue",
    "Keep soft-deleted rows off a Vue index",
    [
      "Build Crate, a list of boxes for one move. A box can come off the list and come back.",
      "Screens: the boxes, one box, and a form to add a box.",
      "Models: Box with a room name and a contents line.",
      "Call delete() from the button labeled Packed. Leave packed boxes off the open list.",
      "Do not call forceDelete() from the button you labeled Packed.",
      "Do not pass packed boxes to the open list and hide them with v-if.",
    ],
  ),
  idea(
    "table",
    "Table, the potluck board",
    "inertia-form-component-vue",
    "preserveState keeps the Vue page you have",
    [
      "Build Table, a board for one shared meal. People sign what dish they will bring, then sign out.",
      "Screens: the dishes, a form to claim a dish, and logout.",
      "Models: Dish with a name and the person who brings it.",
      "Post logout to the Fortify logout route.",
      "Keep preserveState only when a save still has errors.",
      "Do not set preserveState: true on a logout request.",
    ],
  ),
  idea(
    "ink",
    "Ink, the writing log",
    "laravel-wayfinder-vue",
    "Typed Laravel routes in Vue with Wayfinder",
    [
      "Build Ink, a log of drafts for one writer. Each draft has a title and a page count.",
      "Screens: the drafts, one draft, and a form to add a draft.",
      "Models: Draft with a title and a page count.",
      "Point the form at the generated controller action.",
      "This is not Vue Router. Inertia still navigates.",
      "Do not add vue-router beside it.",
      "Do not install Ziggy beside the generated functions.",
    ],
  ),
  idea(
    "booth",
    "Booth, the event album",
    "laravel-vue-file-upload",
    "Upload files from Vue to Laravel with Inertia",
    [
      "Build Booth, an album for one event. Each photo has a caption.",
      "Screens: the album, one photo, and a form that adds the photo.",
      "Models: Photo with a caption and a path.",
      "Validate the photo as an image, max 2048 kilobytes.",
      "Post the form and send _method of put. Save the path.",
      "Do not put the file bytes in the database.",
      "PHP does not fill a file on a real PUT, PATCH, or DELETE.",
    ],
  ),
  idea(
    "desk",
    "Desk, the bug list",
    "laravel-vue-pagination",
    "Laravel and Vue pagination",
    [
      "Build Desk, a list of bugs for one app. Open a bug, write what happened, and mark it fixed.",
      "Screens: the list, one bug, and a form to report a bug.",
      "Models: Bug with a title, a report, and a fixed date.",
      "Order the bugs by id and call cursorPaginate(10). A cursor page has no last_page.",
      "Do not order by a timestamp that can tie.",
    ],
  ),
  idea(
    "issue",
    "Issue, the small magazine",
    "inertia-ssr",
    "Keep the Inertia SSR process running",
    [
      "Build a small magazine one editor publishes. A reader opens the public list of pieces.",
      "Screens: the public list, one piece, and a form to publish a piece.",
      "Models: Piece with a title, a body, and a published date.",
      "Supervise one SSR process for that public list.",
      "Do not read window in setup.",
      "Do not start a second SSR process on another port.",
    ],
  ),
  idea(
    "shift",
    "Shift, the weekly rota",
    "laravel-vue-policies",
    "Gate a Vue index with viewAny",
    [
      "Build Shift, a rota for one cafe week. Staff see the shifts they are allowed to open.",
      "Screens: the week, one shift, and a form to add a shift.",
      "Models: ShiftSlot with a day, a start time, and a person name.",
      "Call authorize('viewAny', ShiftSlot::class) before you list the week.",
      "The gate answers whether this person may open the rota. The query answers which rows.",
      "Do not filter the rows in Vue after sending every shift.",
    ],
  ),
  idea(
    "borrow",
    "Borrow, the tool library",
    "laravel-vue-flash",
    "Show a saved message in Vue",
    [
      "Build a library of tools neighbors lend. A person marks a tool out and later marks it back.",
      "Screens: the tools, one tool, and a form to add a tool.",
      "Models: Tool with a name, an owner name, and a due date.",
      "Return Inertia::flash('toast', ...) when a tool is marked out.",
      "The starter kit already listens.",
      "Do not register a second router.on('flash').",
    ],
  ),
  idea(
    "menu",
    "Menu, the dinner plan",
    "pinia-laravel-inertia",
    "When to use Pinia with Laravel and Inertia",
    [
      "Build Menu, a week of dinners for one home. Saved meals stay. A meal you have not saved does not.",
      "Screens: the week, one dinner, and a form that holds the unsaved meal.",
      "Models: Dinner with a day and a dish name.",
      "Pass the saved dinners as a prop.",
      "Use Pinia only for a draft a refresh should forget.",
      "Do not router.reload the dinners into a Pinia store.",
    ],
  ),
  idea(
    "streak",
    "Streak, the practice log",
    "laravel-wayfinder-vue",
    "Typed Laravel routes in Vue with Wayfinder",
    [
      "Build Streak, a log of practice days for one person. Each day records what they practiced.",
      "Screens: the days, one day, and a form to log a day.",
      "Models: Practice with a day and a note.",
      "Point the form at the generated controller action.",
      "This is not Vue Router. Inertia still navigates.",
      "Do not add vue-router beside it.",
      "Do not install Ziggy beside the generated functions.",
    ],
  ),
];

/** Pick one pool idea. Unseen ids are used first. `shown` is not mutated. */
export function nextSpin(
  pool: readonly SpinIdea[],
  shown: readonly string[],
  random: () => number,
): { idea: SpinIdea; shown: string[] } {
  if (pool.length === 0) throw new Error("The idea pool is empty.");
  const seen = new Set(shown);
  const unseen = pool.filter((item) => !seen.has(item.id));
  const bag = unseen.length > 0 ? unseen : pool;
  const roll = random();
  const scaled = Number.isFinite(roll) ? roll : 0;
  const index = Math.min(
    bag.length - 1,
    Math.max(0, Math.floor(scaled * bag.length)),
  );
  const picked = bag[index];
  if (!picked) throw new Error("The idea pool is empty.");
  return {
    idea: picked,
    shown: unseen.length > 0 ? [...shown, picked.id] : [picked.id],
  };
}
