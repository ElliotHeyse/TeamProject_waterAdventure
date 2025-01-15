## Step-by-Step Plan to Implement Submission Feedback and Medals

### **1. Update the Database Schema**

**a. Add `medal` Field to Submissions**

- **Objective:** Allow storing medals associated with each submission.

- **Action:**
  
  Update your Prisma schema to include a `medal` field in the `Submission` model.

  ```typescript
  // prisma/schema.prisma

  enum Medal {
    GOLD
    SILVER
    BRONZE
    NONE
  }

  model Submission {
    id        String   @id @default(uuid())
    pupilId   String
    lessonId  String
    videoUrl  String
    status    SubmissionStatus
    feedback  String?
    medal     Medal     @default(NONE)
    createdAt DateTime @default(now())

    pupil     Pupil    @relation(fields: [pupilId], references: [id])
    lesson    Lesson   @relation(fields: [lessonId], references: [id])
    review    Review?

    // Other fields...
  }
  ```

- **Run Migration:**
  
  ```bash
  npx prisma migrate dev --name add_medal_to_submission
  ```

**b. Link Medal to Levels (Optional)**

- **Objective:** If medals are associated with levels rather than individual submissions, ensure that levels can store medal information.

- **Action:**
  
  Update the `Level` model in your Prisma schema.

  ```typescript
  // prisma/schema.prisma

  enum LevelMedal {
    GOLD
    SILVER
    BRONZE
    NONE
  }

  model Level {
    id        Int         @id @default(autoincrement())
    title     String
    status    LevelStatus
    medal     LevelMedal  @default(NONE)
    // Other fields...
  }
  ```

- **Run Migration:**
  
  ```bash
  npx prisma migrate dev --name add_medal_to_level
  ```

### **2. Backend API Enhancements**

**a. Update Submission Review Action**

- **Objective:** Allow coaches to add a medal when reviewing a submission.

- **Action:**
  
  Modify the `review_submission` action in your server-side code to accept and save the `medal`.

  ```typescript
  // webapp/src/routes/coach/submissions/+page.server.ts

  import { prisma } from '$lib/server/db';
  import type { Actions } from './$types';
  import { fail } from '@sveltejs/kit';

  export const actions: Actions = {
    reviewSubmission: async ({ request }) => {
      const formData = await request.formData();
      const submissionId = formData.get('submissionId') as string;
      const feedback = formData.get('feedback') as string;
      const medal = formData.get('medal') as 'GOLD' | 'SILVER' | 'BRONZE' | 'NONE';

      if (!submissionId || !feedback || !medal) {
        return fail(400, { message: 'Missing required fields' });
      }

      try {
        await prisma.submission.update({
          where: { id: submissionId },
          data: {
            feedback,
            medal,
            status: 'REVIEWED',
          },
        });
        return { success: true };
      } catch (error) {
        console.error('Failed to review submission:', error);
        return fail(500, { message: 'Failed to review submission' });
      }
    },
  };
  ```

**b. Update Load Functions for Parent Views**

- **Objective:** Ensure that parent views receive the `medal` information.

- **Action:**
  
  Modify the relevant `load` functions to include the `medal` field.

  ```typescript
  // webapp/src/routes/app/settings/+page.server.ts

  export const load = (async () => {
      // Existing code...
      return {
          parent,
          submissions: await prisma.submission.findMany({
              where: { pupilId: parent.pupilId },
              include: { lesson: true },
              orderBy: { createdAt: 'desc' },
          }),
      };
  }) satisfies PageServerLoad;
  ```

### **3. Frontend Enhancements**

**a. Update Coach's Review Panel to Include Medal Selection**

- **Objective:** Allow coaches to select a medal when providing feedback.

- **Action:**
  
  Modify the `ReviewPanel` component to include a medal dropdown.

  ```svelte
  <!-- webapp/src/lib/components/coach/submissions/review-panel.svelte -->

  <script lang="ts">
    import { toast } from 'svelte-sonner';
    import { Loader2 } from 'lucide-svelte';
    import * as m from '$lib/paraglide/messages.js';

    interface Submission {
      id: string;
      pupilName: string;
      lessonTitle: string;
      date: string;
      status: 'pending' | 'reviewed';
      videoUrl: string;
      feedback: string;
      medal: 'GOLD' | 'SILVER' | 'BRONZE' | 'NONE';
    }

    interface Props {
      submission: Submission | null;
      onClose: () => void;
      onSubmit: (feedback: string, medal: string) => void;
    }

    const { submission, onClose, onSubmit }: Props = $props();
    let feedback = $state(submission?.feedback || '');
    let medal = $state(submission?.medal || 'NONE');
    let isSubmitting = $state(false);

    async function handleSubmit() {
      if (!submission) return;

      isSubmitting = true;
      try {
        const response = await fetch(`/api/submissions/${submission.id}/review`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ feedback, medal })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to submit review');
        }

        toast.success(m.review_submitted());
        onSubmit(feedback, medal);
      } catch (error) {
        console.error('Error:', error);
        toast.error(m.error_submitting_review());
      } finally {
        isSubmitting = false;
      }
    }
  </script>

  <div class="space-y-6">
    <!-- Existing code for submission details and video -->

    <div class="space-y-4">
      <label class="block">
        <span class="text-sm font-medium">{m.feedback()}</span>
        <textarea
          bind:value={feedback}
          class="bg-background focus:border-ring focus:ring-ring mt-1 block w-full rounded-md border shadow-sm"
          rows="4"
          placeholder={m.enter_feedback()}
        ></textarea>
      </label>

      <label class="block">
        <span class="text-sm font-medium">Medaille</span>
        <select
          bind:value={medal}
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="NONE">Geen</option>
          <option value="BRONZE">Brons</option>
          <option value="SILVER">Zilver</option>
          <option value="GOLD">Goud</option>
        </select>
      </label>

      <div class="flex justify-end space-x-3">
        <button
          class="bg-background ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          onclick={onClose}
          disabled={isSubmitting}
        >
          {m.cancel()}
        </button>
        <button
          class="bg-primary text-primary-foreground ring-offset-background hover:bg-primary/90 focus-visible:ring-ring inline-flex h-9 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          onclick={handleSubmit}
          disabled={isSubmitting}
        >
          {#if isSubmitting}
            <Loader2 class="h-4 w-4 animate-spin" />
            {m.submitting()}
          {:else}
            {m.submit_review()}
          {/if}
        </button>
      </div>
    </div>
  </div>
  ```

**b. Display Feedback, Video, and Medal for Parents**

- **Objective:** Show parents the feedback, video, and medal beneath their submitted videos.

- **Action:**
  
  Update the parent's submission view to include these details.

  ```svelte
  <!-- webapp/src/routes/app/settings/+page.svelte -->

  <script lang="ts">
    import type { PageData } from './$types';
    // Import necessary components

    let { data } = $props<{ data: PageData }>();
    let submissions = data.submissions;
  </script>

  <div class="space-y-6">
    {#each submissions as submission}
      <div class="bg-card p-6 rounded-md shadow">
        <h3 class="text-lg font-semibold">{submission.lessonTitle}</h3>
        <video controls class="w-full mt-4">
          <source src={submission.videoUrl} type="video/mp4">
          Your browser does not support the video tag.
        </video>
        {#if submission.feedback}
          <div class="mt-4">
            <h4 class="font-medium">Feedback:</h4>
            <p>{submission.feedback}</p>
          </div>
        {/if}
        {#if submission.medal !== 'NONE'}
          <div class="mt-4 flex items-center">
            <span class="font-medium">Medaille:</span>
            <img src={`/path-to-medals/${submission.medal.toLowerCase()}.svg`} alt={submission.medal} class="ml-2 w-6 h-6"/>
          </div>
        {/if}
      </div>
    {/each}
  </div>
  ```

**c. Enable Medal Display on Level Icons**

- **Objective:** Show medals on the level path based on the awards received.

- **Action:**
  
  Modify the `level-badge` component to reflect the medal.

  ```svelte
  <!-- webapp/src/lib/components/coach/ui/badge/level-badge.svelte -->

  <script lang="ts">
    import { Icon } from 'svelte-hero-icons';
    import { cn } from '$lib/utils';
    import { Badge } from '$lib/components/coach/ui/badge';
    import { tv } from 'tailwind-variants';

    let { level = 'BEGINNER', medal = 'NONE' }: { level: string; medal: string } = $props();

    const levelVariants = tv({
      base: 'transition-colors',
      variants: {
        level: {
          BEGINNER: 'bg-emerald-100 text-emerald-700',
          INTERMEDIATE: 'bg-sky-100 text-sky-700',
          ADVANCED: 'bg-violet-100 text-violet-700',
        }
      },
      defaultVariants: {
        level: 'BEGINNER'
      }
    });

    const medalVariants = {
      GOLD: '/path-to-medals/gold.svg',
      SILVER: '/path-to-medals/silver.svg',
      BRONZE: '/path-to-medals/bronze.svg',
      NONE: null
    };
  </script>

  <Badge
    class={cn(
      'gap-1.5 pl-2 pr-2.5 font-medium',
      levelVariants({ level: level as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' })
    )}
  >
    {#if medal !== 'NONE'}
      <img src={medalVariants[medal]} alt={medal} class="w-4 h-4"/>
    {/if}
    {level.charAt(0).toUpperCase() + level.slice(1).toLowerCase()}
  </Badge>
  ```

  Update the level path component to utilize the updated `level-badge`.

  ```svelte
  <!-- webapp/src/routes/app/levels/+page.svelte -->

  <script lang="ts">
    import LevelBadge from '$lib/components/coach/ui/badge/level-badge.svelte';
    // Existing imports and script...

    function handleLevelClick(level, event) {
      // Existing logic...
    }
  </script>

  <div class="absolute inset-0 w-full h-full">
    {#each levels as level}
      <button
        class="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110 focus:outline-none"
        style="left: {level.x}%; top: {level.y}%;"
        onclick={(e) => handleLevelClick(level, e)}
      >
        <LevelBadge level={level.status} medal={level.medal} />
      </button>
    {/each}
  </div>
  ```

### **4. Update Coach Interface to Add Medals**

- **Objective:** Allow coaches to assign medals during the review process.

- **Action:**
  
  Ensure that the coach's review form includes the medal selection and that it's correctly processed.

  *(Refer to Step 3a for the `ReviewPanel` component modification.)*

### **5. Parent Interface to Display Medals**

- **Objective:** Parents should see the medals awarded to their submissions.

- **Action:**
  
  Ensure that the parent view (refer to Step 3b) fetches and displays the `medal` field.

### **6. Display Medals on the Level Path**

- **Objective:** Visually represent medals on the level progression path.

- **Action:**
  
  *(Refer to Step 3c for modifying the `level-badge` component and the level path.)*

### **7. Testing**

**a. Backend Testing**

- **Objective:** Verify that medals are correctly saved and retrieved.

- **Action:**
  
  - Submit a review with a medal and ensure it persists in the database.
  - Fetch submissions and verify the `medal` field is included.

**b. Frontend Testing**

- **Objective:** Ensure that both coaches and parents can interact with the new features seamlessly.

- **Action:**
  
  - **For Coaches:**
    - Submit feedback with different medals.
    - Verify that the submission updates correctly.
  
  - **For Parents:**
    - Check that feedback, video, and medals appear under their submissions.
    - Confirm that medals display correctly on the level path.

**c. UI/UX Testing**

- **Objective:** Ensure that the UI changes are intuitive and visually consistent.

- **Action:**
  
  - Test responsiveness of the medal displays.
  - Verify accessibility features (e.g., alt texts for images).

### **8. Deployment**

- **Objective:** Deploy the updated application to your production environment.

- **Action:**
  
  - Ensure all migrations are applied.
  - Test the deployment in a staging environment before going live.

### **9. Documentation and Handover**

- **Objective:** Provide clear documentation for future maintenance and for the composer.

- **Action:**
  
  - Update README.md with new features.
  - Document any new API endpoints or database changes.
  - Provide screenshots or UI mockups if necessary.

---

## Summary

This plan outlines the necessary steps to enhance your application by enabling coaches to provide feedback and assign medals to submissions, and allowing parents to view this information. It covers database schema updates, backend API modifications, frontend interface changes for both coaches and parents, UI enhancements for displaying medals, thorough testing, deployment, and documentation. Following this structured approach will ensure a smooth implementation of the desired features.
