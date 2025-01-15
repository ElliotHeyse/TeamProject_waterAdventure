# Step Plan for Connecting Levels to Database

## Overview

This step plan outlines the process to transition the existing hardcoded levels in your Svelte application to a database-driven approach using Prisma. By following these steps, you will store all levels and their associated video paths in the database, enabling dynamic retrieval and display based on user interactions.

## Steps

### 1. Define the Level Model in Prisma

- **Location:** `webapp/prisma/schema.prisma`

- **Actions:**
  - Open the `schema.prisma` file.
  - Define a new `Level` model with the necessary fields, including relationships to videos.

- **Example:**
  ```prisma
  model Level {
    id          Int       @id @default(autoincrement())
    title       String
    objective   String
    exercises   Exercise[]
    createdAt   DateTime  @default(now())
    updatedAt   DateTime  @updatedAt
  }

  model Exercise {
    id          Int       @id @default(autoincrement())
    part        String
    location    String
    name        String
    description String
    important   String
    tip         String
    videos      Video[]
    levelId     Int
    level       Level     @relation(fields: [levelId], references: [id])
    createdAt   DateTime  @default(now())
    updatedAt   DateTime  @updatedAt
  }

  model Video {
    id          Int       @id @default(autoincrement())
    url         String
    description String
    exerciseId  Int
    exercise    Exercise  @relation(fields: [exerciseId], references: [id])
    createdAt   DateTime  @default(now())
    updatedAt   DateTime  @updatedAt
  }
  ```

### 2. Run Prisma Migrations

- **Actions:**
  - Open the terminal and navigate to the project root.
  - Execute the following commands to create and apply the migration:
    ```bash
    npx prisma migrate dev --name add_level_model
    npx prisma generate
    ```

### 3. Update the Seed Script

- **Location:** `webapp/prisma/seed.ts`

- **Actions:**
  - Modify the seed script to include the creation of levels, exercises, and associated videos.
  - Ensure that video URLs are correctly stored.

- **Example:**
  ```typescript
  import { PrismaClient } from '@prisma/client';
  const prisma = new PrismaClient();

  async function main() {
    // Create Levels
    const level1 = await prisma.level.create({
      data: {
        title: "Oefening 1",
        objective: "Angstreflexen in het water overwinnen; vertrouwen",
        exercises: {
          create: [
            {
              part: "A",
              location: "thuis",
              name: "Sproeikampioen",
              description: "Sproei de tenen en voeten...",
              important: "Moedig je kind aan...",
              tip: "Soms kan je de intensiteit...",
              videos: {
                create: [
                  {
                    url: "/src/lib/beeldmateriaalZwemfed/1AA_PG_2_OEF1A.mp4",
                    description: "Sproeikampioen oefening"
                  }
                ]
              }
            },
            {
              part: "B",
              location: "zwembad",
              name: "Spitter, spetter, spat",
              description: "Zorg dat je kind het lichaam nat maakt...",
              important: "Moedig je kind aan...",
              tip: "Probeer eens een variant...",
              videos: {
                create: [
                  {
                    url: "/src/lib/beeldmateriaalZwemfed/1BA_PG_7_OEF1B_WWles 1.mp4",
                    description: "Tokkelen op het water"
                  },
                  {
                    url: "/src/lib/beeldmateriaalZwemfed/1BB_PG_20_OEF1BWWLES3.mp4",
                    description: "Golven maken"
                  },
                  {
                    url: "/src/lib/beeldmateriaalZwemfed/1BC_LO_14_oef1B_LO LES2.mp4",
                    description: "Op het water slaan"
                  }
                ]
              }
            }
          ]
        }
      }
    });

    // Repeat for other levels if necessary
  }

  main()
    .catch(e => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
  ```

- **Execute Seed Script:**
  ```bash
  npx prisma db seed
  ```

### 4. Update TypeScript Interfaces

- **Location:** `webapp/src/lib/types/lessons.ts`

- **Actions:**
  - Define interfaces for `Level`, `Exercise`, and `Video` to reflect the updated Prisma models.

- **Example:**
  ```typescript
  export interface Level {
    id: number;
    title: string;
    objective: string;
    exercises: Exercise[];
    createdAt: Date;
    updatedAt: Date;
  }

  export interface Exercise {
    id: number;
    part: string;
    location: string;
    name: string;
    description: string;
    important: string;
    tip: string;
    videos: Video[];
    levelId: number;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface Video {
    id: number;
    url: string;
    description: string;
    exerciseId: number;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface LessonsPageData {
    levels: Level[];
  }
  ```

### 5. Modify the Levels Page to Fetch Data from the Database

- **Location:** `webapp/src/routes/app/levels/[id]/+page.server.ts`

- **Actions:**
  - Create a server-side load function to fetch the specific level data based on the `id` parameter.

- **Example:**
  ```typescript
  import { prisma } from '$lib/server/db';
  import type { PageServerLoad } from './$types';
  import type { LessonsPageData, Level } from '$lib/types/lessons';

  export const load: PageServerLoad = async ({ params }) => {
    const levelId = parseInt(params.id, 10);

    const level = await prisma.level.findUnique({
      where: { id: levelId },
      include: {
        exercises: {
          include: {
            videos: true
          }
        }
      }
    });

    if (!level) {
      throw new Error('Level not found');
    }

    return { level };
  };
  ```

### 6. Update the Levels Svelte Page to Use Fetched Data

- **Location:** `webapp/src/routes/app/levels/[id]/+page.svelte`

- **Actions:**
  - Modify the `<script>` section to receive the `level` data from the load function.
  - Remove the hardcoded `levelData` and replace it with the fetched data.

- **Example:**
  ```svelte
  <script lang="ts">
    export let data: { level: Level };
  </script>

  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-4 text-foreground">{data.level.title}</h1>
    <p class="text-xl mb-8 text-orange-500">{data.level.objective}</p>

    {#each data.level.exercises as exercise}
      <div class="bg-background border border-border rounded-lg shadow-lg p-6 mb-8">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h2 class="text-2xl font-semibold text-foreground">Deel {exercise.part} ({exercise.location})</h2>
            <h3 class="text-xl text-primary">{exercise.name}</h3>
          </div>
        </div>

        <div class="mb-4">
          <h4 class="font-semibold mb-2 text-foreground">Oefening:</h4>
          <p class="whitespace-pre-line text-muted-foreground">{exercise.description}</p>
        </div>

        <div class="mb-4">
          <h4 class="font-semibold text-orange-500 mb-2">Belangrijk:</h4>
          <p class="text-muted-foreground">{exercise.important}</p>
        </div>

        <div class="mb-4">
          <h4 class="font-semibold text-primary mb-2">Tip:</h4>
          <p class="text-muted-foreground">{exercise.tip}</p>
        </div>

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
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
  ```

### 7. Update Routing to Display Correct Levels

- **Actions:**
  - Ensure that when a user clicks on a level, the application navigates to the correct level page and displays the corresponding data.

- **Example:**
  - In the levels listing page (`webapp/src/routes/app/levels/+page.svelte`), update the links to navigate to `/app/levels/{id}`.

### 8. Test the Implementation

- **Actions:**
  - Start the development server:
    ```bash
    npm run dev
    ```
  - Navigate to different levels and verify that the correct data and videos are displayed.
  - Ensure that levels not present in the database do not display incorrect information.

### 9. Handle Edge Cases and Validation

- **Actions:**
  - Implement error handling for cases where a level does not exist.
  - Validate data fetched from the database before rendering.

- **Example:**
  - In the `+page.server.ts` file, throw a 404 error if the level is not found.

### 10. Optimize Performance

- **Actions:**
  - Implement caching strategies if necessary.
  - Lazy load videos to enhance performance.

- **Example:**
  ```svelte
  <video controls class="w-full rounded-lg border border-border" loading="lazy">
    <source src={video.url} type="video/mp4">
    Your browser does not support the video tag.
  </video>
  ```

### 11. Update Documentation

- **Location:** `README.md`

- **Actions:**
  - Document the new database structure.
  - Provide instructions on how to seed the database with levels and exercises.

### 12. Deploy Changes

- **Actions:**
  - Commit the changes to version control.
  - Deploy the updated application to your hosting platform.
  - Verify the deployment to ensure all functionalities work as expected.

## Notes

- Ensure that all interactions with the database are secure and handle potential errors gracefully.
- Maintain consistency in naming conventions and file structures as per your project's guidelines.
- Collaborate with the team to review the changes and perform code reviews if necessary.
