```markdown
# Step Plan for Tracking Level Completion per Child

This step plan outlines the necessary steps to implement a system for tracking the completion of swimming levels for each child. The plan includes schema modifications, backend updates, frontend enhancements, and updates to the seed data to accurately monitor and display level and part completions.

## 1. Update Prisma Schema

### 1.1. Create `LevelProgress` Model

Add a new `LevelProgress` model to track each child's progress per level, including the completion status of part A. This model links `Pupil` and `Lesson`, allowing you to monitor which parts of each lesson a pupil has completed.

```typescript:webapp/prisma/schema.prisma
model LevelProgress {
  id          String   @id @default(cuid())
  pupilId     String
  lessonId    String
  part        Part
  completed   Boolean  @default(false)
  completedAt DateTime?

  // Relations
  pupil   Pupil   @relation(fields: [pupilId], references: [id])
  lesson  Lesson  @relation(fields: [lessonId], references: [id])

  @@unique([pupilId, lessonId, part])
}

enum Part {
  A
  B
}
```

### 1.2. Update `Pupil` Model

Add a relation field to link pupils with their level progress.

```typescript:webapp/prisma/schema.prisma
model Pupil {
  id            String          @id @default(cuid())
  name          String
  dateOfBirth   DateTime
  level         Level
  parentId      String
  coachId       String
  notes         String?

  // Relations
  parent        Parent          @relation(fields: [parentId], references: [id])
  coach         Coach           @relation(fields: [coachId], references: [id])
  levelProgress LevelProgress[]
}
```

### 1.3. Update `Lesson` Model

Ensure that the `Lesson` model includes the `part` field if necessary and maintains relationships correctly.

```typescript:webapp/prisma/schema.prisma
model Lesson {
  id               String           @id @default(cuid())
  title            String
  description      String
  coachId          String
  duration         Int              // in minutes
  level            Level
  date             DateTime
  order            Int              @default(autoincrement())
  isSwimmingLesson Boolean          @default(false)
  objective        String?
  exercises        Exercise[]

  // Relations
  coach            Coach            @relation(fields: [coachId], references: [id])
  submissions      Submission[]
  levelProgress    LevelProgress[]
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt
}
```

## 2. Run Prisma Migrations

Execute the following commands to apply the schema changes:

```bash
npx prisma migrate dev --name add_level_progress
npx prisma generate
```

## 3. Update Seed Script

Modify the seed script to initialize `LevelProgress` entries for each pupil and lesson. This ensures that each pupil has a progress record for the relevant lessons.

```typescript:webapp/prisma/seed.ts
// ... existing imports and seed data ...

async function main() {
  // ... existing seeding logic ...

  // Fetch all pupils and lessons
  const pupils = await prisma.pupil.findMany();
  const lessons = await prisma.lesson.findMany({
    where: { isSwimmingLesson: true },
  });

  // Initialize LevelProgress for each pupil and lesson part A
  await Promise.all(
    pupils.map((pupil) =>
      lessons.map((lesson) =>
        prisma.levelProgress.create({
          data: {
            pupilId: pupil.id,
            lessonId: lesson.id,
            part: "A",
            completed: false,
          },
        })
      )
    )
  );

  // Optionally initialize part B if the lesson includes it
  await Promise.all(
    pupils.map((pupil) =>
      lessons
        .filter((lesson) => lesson.exercises.some((ex) => ex.part === "B"))
        .map((lesson) =>
          prisma.levelProgress.create({
            data: {
              pupilId: pupil.id,
              lessonId: lesson.id,
              part: "B",
              completed: false,
            },
          })
        )
    )
  );

  // ... any additional seeding logic ...
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## 4. Backend: Update Server-Side Logic

### 4.1. Create API Endpoints

Develop API endpoints to handle the creation, updating, and retrieval of level progress.

```typescript:webapp/src/routes/api/level-progress/+server.ts
import { prisma } from '$lib/server/db';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const { pupilId, lessonId, part } = await request.json();

  if (!pupilId || !lessonId || !part) {
    throw error(400, 'Missing required fields');
  }

  const levelProgress = await prisma.levelProgress.create({
    data: {
      pupilId,
      lessonId,
      part,
    },
  });

  return json(levelProgress);
};

export const PATCH: RequestHandler = async ({ request }) => {
  const { id, completed } = await request.json();

  if (id === undefined || completed === undefined) {
    throw error(400, 'Missing required fields');
  }

  const updatedProgress = await prisma.levelProgress.update({
    where: { id },
    data: {
      completed,
      completedAt: completed ? new Date() : null,
    },
  });

  return json(updatedProgress);
};

export const GET: RequestHandler = async ({ url }) => {
  const pupilId = url.searchParams.get('pupilId');

  if (!pupilId) {
    throw error(400, 'Missing pupilId');
  }

  const progress = await prisma.levelProgress.findMany({
    where: { pupilId },
    include: {
      lesson: true,
    },
  });

  return json(progress);
};
```

### 4.2. Update Server Load Functions

Modify existing load functions to include level progress data where necessary.

```typescript:webapp/src/routes/app/levels/[id]/+page.server.ts
import { prisma } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
  const levelId = params.id;
  if (!levelId) {
    throw error(400, 'Invalid level ID');
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: levelId },
    include: {
      exercises: {
        include: {
          videos: true,
        },
      },
    },
  });

  if (!lesson) {
    throw error(404, 'Lesson not found');
  }

  const progress = await prisma.levelProgress.findMany({
    where: { pupilId: locals.pupilId, lessonId: lesson.id },
  });

  return {
    lesson,
    progress,
  };
};
```

## 5. Frontend: Enhance UI for Tracking Progress

### 5.1. Update Lesson Page

Modify the lesson page to display and update progress for each part.

```svelte:webapp/src/routes/app/levels/[id]/+page.svelte
<script lang="ts">
  import type { PageData } from './$types';
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  export let data: PageData;

  const progress = writable(data.progress);

  async function toggleCompletion(partProgress) {
    const updated = { ...partProgress, completed: !partProgress.completed };
    const response = await fetch('/api/level-progress', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: updated.id, completed: updated.completed }),
    });
    const result = await response.json();
    progress.update(items =>
      items.map(item => item.id === result.id ? result : item)
    );
  }
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-4 text-foreground">{data.lesson.title}</h1>
  <p class="text-xl mb-8 text-orange-500">{data.lesson.objective}</p>

  {#each data.lesson.exercises as exercise}
    <div class="bg-background border border-border rounded-lg shadow-lg p-6 mb-8">
      <!-- Exercise Details -->
      <div>
        <h2 class="text-2xl font-semibold text-foreground">Deel {exercise.part} ({exercise.location})</h2>
        <h3 class="text-xl text-primary">{exercise.name}</h3>
      </div>

      <!-- Progress Toggle -->
      <button
        class="mt-4 px-4 py-2 bg-primary text-white rounded"
        on:click={() => {
          const partProgress = data.progress.find(p => p.lessonId === data.lesson.id && p.part === exercise.part);
          toggleCompletion(partProgress);
        }}
      >
        {#if data.progress.find(p => p.lessonId === data.lesson.id && p.part === exercise.part)?.completed}
          Mark as Incomplete
        {:else}
          Mark as Completed
        {/if}
      </button>

      <!-- Rest of the exercise content -->
      <div class="mb-4">
        <h4 class="font-semibold mb-2 text-foreground">Oefening:</h4>
        <p class="whitespace-pre-line text-muted-foreground">{exercise.description}</p>
      </div>

      {#if exercise.important}
        <div class="mb-4">
          <h4 class="font-semibold text-orange-500 mb-2">Belangrijk:</h4>
          <p class="text-muted-foreground">{exercise.important}</p>
        </div>
      {/if}

      {#if exercise.tip}
        <div class="mb-4">
          <h4 class="font-semibold text-primary mb-2">Tip:</h4>
          <p class="text-muted-foreground">{exercise.tip}</p>
        </div>
      {/if}

      <div class="mt-6 space-y-6">
        {#each exercise.videos as video}
          <div class="flex flex-col md:flex-row gap-6">
            <div class="w-full md:w-1/2">
              <h5 class="text-lg font-semibold mb-2 text-foreground">{video.description}</h5>
              <video controls class="w-full rounded-lg border border-border">
                <source src={video.url} type="video/mp4">
                Your browser does not support the video tag.
              </video>
            </div>
            <div class="w-full md:w-1/2 text-muted-foreground md:mt-10">
              {#if video.description === "Tokkelen op het water"}
                <ul class="list-disc pl-4 space-y-2">
                  <li>Zittend op de trap met de handen golven maken</li>
                  <li>Drijvend voorwaarts voortduwen</li>
                  <li>Rustig in water stappen</li>
                  <li>Handen in het water houden</li>
                  <li>Vingers sturen</li>
                  <li>Voorwerpen niet omstoten</li>
                </ul>
              {:else if video.description === "Golven maken"}
                <ul class="list-disc pl-4 space-y-2">
                  <li>Zittend op de trap met de benen</li>
                  <li>Vriesvluchtige voorbij of omrijdende</li>
                  <li>Gestrekte benen en voet-tenen</li>
                  <li>Been-beweging zonder hulp</li>
                  <li>Been-verplaatsing</li>
                </ul>
              {:else if video.description === "Op het water slaan"}
                <ul class="list-disc pl-4 space-y-2">
                  <li>Carwash</li>
                  <li>Plezier door de voorwaarts lopen</li>
                  <li>Met handen spelen op het water</li>
                  <li>Achterwaarts, zijwaarts, springend... in de voorwaarts</li>
                  <li>Een doorgang uitsluiten</li>
                  <li>Ogen open houden</li>
                  <li>Met vingers samengeknepen sturen</li>
                </ul>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/each}
</div>
```

### 5.2. Display Progress on Dashboard

Show a summary of completed levels and parts on the coach's dashboard.

```svelte:webapp/src/routes/coach/pupils/[id]/+page.svelte
<script lang="ts">
  import type { PageData } from './$types';
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  export let data: PageData;

  const progress = writable([]);

  onMount(async () => {
    const res = await fetch(`/api/level-progress?pupilId=${data.pupil.id}`);
    const result = await res.json();
    progress.set(result);
  });
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-4">{data.pupil.name}'s Progress</h1>

  <div class="space-y-4">
    {#each $progress as p}
      <div class="flex items-center justify-between bg-background p-4 rounded-lg shadow">
        <div>
          <h2 class="text-xl font-semibold">{p.lesson.title} - Part {p.part}</h2>
          <p class="text-sm text-muted-foreground">
            {p.completed ? 'Completed at ' + new Date(p.completedAt).toLocaleDateString() : 'Incomplete'}
          </p>
        </div>
        <button
          class="px-4 py-2 bg-primary text-white rounded"
          on:click={() => toggleCompletion(p)}
        >
          {p.completed ? 'Mark as Incomplete' : 'Mark as Completed'}
        </button>
      </div>
    {/each}
  </div>
</div>
```

## 6. Testing

### 6.1. Unit Tests

Write unit tests for the new API endpoints to ensure they handle data correctly.

```typescript:webapp/tests/api/level-progress.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { POST, PATCH, GET } from '$routes/api/level-progress/+server';
import { prisma } from '$lib/server/db';

describe('LevelProgress API', () => {
  let testPupil;
  let testLesson;
  let testProgress;

  beforeAll(async () => {
    testPupil = await prisma.pupil.create({
      data: {
        name: 'Test Pupil',
        dateOfBirth: new Date(2015, 0, 1),
        level: 'BEGINNER',
        parentId: 'parent-id',
        coachId: 'coach-id',
      },
    });

    testLesson = await prisma.lesson.create({
      data: {
        title: 'Test Lesson',
        description: 'Test Description',
        coachId: 'coach-id',
        duration: 45,
        level: 'BEGINNER',
        date: new Date(),
        isSwimmingLesson: true,
      },
    });

    testProgress = await prisma.levelProgress.create({
      data: {
        pupilId: testPupil.id,
        lessonId: testLesson.id,
        part: 'A',
        completed: false,
      },
    });
  });

  it('should create a new level progress entry', async () => {
    const request = new Request('/api/level-progress', {
      method: 'POST',
      body: JSON.stringify({
        pupilId: testPupil.id,
        lessonId: testLesson.id,
        part: 'B',
      }),
    });

    const response = await POST({ request });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pupilId).toBe(testPupil.id);
    expect(data.lessonId).toBe(testLesson.id);
    expect(data.part).toBe('B');
    expect(data.completed).toBe(false);
  });

  it('should update an existing level progress entry', async () => {
    const request = new Request('/api/level-progress', {
      method: 'PATCH',
      body: JSON.stringify({
        id: testProgress.id,
        completed: true,
      }),
    });

    const response = await PATCH({ request });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.completed).toBe(true);
    expect(new Date(data.completedAt)).toBeInstanceOf(Date);
  });

  it('should retrieve progress for a pupil', async () => {
    const url = new URL('/api/level-progress', 'http://localhost');
    url.searchParams.append('pupilId', testPupil.id);

    const request = new Request(url.toString(), {
      method: 'GET',
    });

    const response = await GET({ request });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0].pupilId).toBe(testPupil.id);
  });
});
```

### 6.2. Integration Tests

Ensure that the frontend interacts correctly with the backend API to reflect changes in the UI. Use end-to-end testing tools like Cypress or Playwright to simulate user interactions.

```javascript
// Example using Cypress
describe('Level Progress Tracking', () => {
  it('marks a lesson part as completed', () => {
    cy.visit('/app/levels/1');
    
    cy.contains('Mark as Completed').click();
    
    cy.contains('Mark as Incomplete').should('exist');
  });

  it('displays progress on the dashboard', () => {
    cy.visit('/coach/pupils/1');

    cy.contains('Test Lesson - Part A').should('exist');
    cy.contains('Completed').should('exist');
  });
});
```

## 7. Documentation

Update the project documentation to include details about the new `LevelProgress` feature.

```markdown:README.md
# Level Progress Tracking

## Overview

The `LevelProgress` feature allows tracking of each child's progress through swimming levels and their respective parts. This ensures that coaches and parents can monitor and manage the completion status effectively.

## Data Model

### LevelProgress

- **id**: Unique identifier.
- **pupilId**: Reference to the `Pupil`.
- **lessonId**: Reference to the `Lesson`.
- **part**: Enum (`A`, `B`) indicating the part of the lesson.
- **completed**: Boolean indicating completion status.
- **completedAt**: Timestamp of when the part was completed.

## API Endpoints

### Create Level Progress

- **POST** `/api/level-progress`
- **Body**:
  ```json
  {
    "pupilId": "string",
    "lessonId": "string",
    "part": "A" | "B"
  }
  ```

### Update Level Progress

- **PATCH** `/api/level-progress`
- **Body**:
  ```json
  {
    "id": "string",
    "completed": true | false
  }
  ```

### Get Level Progress

- **GET** `/api/level-progress?pupilId=string`

## Frontend Integration

### Lesson Page

- **Functionality**: Ability to mark parts as completed.
- **Location**: `webapp/src/routes/app/levels/[id]/+page.svelte`

### Dashboard

- **Functionality**: Display summary of completed levels and parts.
- **Location**: `webapp/src/routes/coach/pupils/[id]/+page.svelte`

## Testing

Ensure all API endpoints and frontend interactions are covered by tests to maintain reliability.

- **Unit Tests**: Located in `webapp/tests/api/level-progress.test.ts`
- **Integration Tests**: Use Cypress or Playwright scripts located in `webapp/tests/e2e/`

## Future Enhancements

- Add notifications for coaches and parents upon level completion.
- Implement graphical progress indicators.
- Allow partial progress tracking for more detailed insights.

## References

- [Prisma Documentation](https://www.prisma.io/docs/)
- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [Cypress Documentation](https://docs.cypress.io/)
```

## 8. Deployment

Deploy the updated application to your staging environment and verify that the new features work as expected before rolling out to production.

### 8.1. Staging Deployment

1. **Build the Application**:
   ```bash
   npm run build
   ```

2. **Deploy to Staging Server**:
   Upload the build artifacts to your staging server following your deployment process.

3. **Run Migrations on Staging**:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

4. **Seed Data (if necessary)**:
   ```bash
   node prisma/seed.ts
   ```

5. **Test the Features**:
   Manually verify that level tracking works correctly and that progress is accurately recorded and displayed.

### 8.2. Production Deployment

Once verified on staging, proceed to deploy the changes to the production environment following your standard deployment procedures.

---

By following this step plan, you will implement a robust system to track the completion of swimming levels and their respective parts for each child, enhancing the overall functionality of the WaterAdventure platform.

```
