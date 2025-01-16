# Step-by-Step Plan to Implement Persistent User Settings

This plan outlines the necessary steps to implement persistent user settings for both the app and coach interfaces. The settings include push notifications, email notifications, light/dark mode, and language preferences. By following this structured approach, users will have their preferences saved in the database and automatically applied upon login.

## **1. Update the Database Schema**

### **a. Add `UserSettings` Model**

**Objective:** Create a new `UserSettings` model to store user preferences.

**Action:**

Update your Prisma schema to include the `UserSettings` model associated with the `User` model.

```typescript:prisma/schema.prisma
enum ThemeMode {
  LIGHT
  DARK
}

model UserSettings {
  id                  String      @id @default(uuid())
  userId              String      @unique
  pushNotifications   Boolean     @default(true)
  emailNotifications  Boolean     @default(true)
  themeMode           ThemeMode   @default(LIGHT)
  language            String      @default("en") // Ensure this matches your language tags
  createdAt           DateTime    @default(now())
  updatedAt           DateTime    @updatedAt

  user                User        @relation(fields: [userId], references: [id])
}
```

### **b. Run Migration**

**Objective:** Apply the schema changes to the database.

**Action:**

```bash
npx prisma migrate dev --name add_user_settings
```

## **2. Backend API Enhancements**

### **a. Create API Endpoints for User Settings**

**Objective:** Provide endpoints to fetch and update user settings.

**Action:**

Create a new file for handling user settings, e.g., `webapp/src/routes/api/user/settings/+server.ts`.

```typescript:src/routes/api/user/settings/+server.ts
import { prisma } from '$lib/server/db';
import { authenticated } from '$lib/server/auth'; // Assuming you have an auth middleware
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = authenticated(async ({ user }) => {
  const settings = await prisma.userSettings.findUnique({
    where: { userId: user.id }
  });

  if (!settings) {
    // Return default settings if none exist
    return new Response(JSON.stringify({
      pushNotifications: true,
      emailNotifications: true,
      themeMode: 'LIGHT',
      language: 'en'
    }), { status: 200 });
  }

  return new Response(JSON.stringify(settings), { status: 200 });
});

export const PATCH: RequestHandler = authenticated(async ({ request, user }) => {
  const updateData = await request.json();

  try {
    const settings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: updateData,
      create: {
        userId: user.id,
        ...updateData
      }
    });

    return new Response(JSON.stringify(settings), { status: 200 });
  } catch (error) {
    console.error('Failed to update user settings:', error);
    return new Response(JSON.stringify({ message: 'Failed to update settings' }), { status: 500 });
  }
});
```

### **b. Update Server-Side Load Functions**

**Objective:** Ensure user settings are loaded when the user accesses the app.

**Action:**

Modify your `+layout.server.ts` or relevant server-side load function to include user settings.

```typescript:src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';
import { prisma } from '$lib/server/db';
import { getUser } from '$lib/server/auth'; // Your auth utility

export const load: LayoutServerLoad = async ({ request }) => {
  const user = await getUser(request);

  if (user) {
    const settings = await prisma.userSettings.findUnique({
      where: { userId: user.id }
    });

    return {
      user,
      settings
    };
  }

  return {};
};
```

## **3. Frontend Implementation**

### **a. Create Settings Store**

**Objective:** Manage user settings state across the application.

**Action:**

Create a new store to hold user settings, e.g., `src/lib/stores/userSettings.ts`.

```typescript:src/lib/stores/userSettings.ts
import { writable } from 'svelte/store';

export interface UserSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  themeMode: 'LIGHT' | 'DARK';
  language: string;
}

export const userSettings = writable<UserSettings>({
  pushNotifications: true,
  emailNotifications: true,
  themeMode: 'LIGHT',
  language: 'en'
});
```

### **b. Fetch User Settings on Load**

**Objective:** Populate the settings store with data from the backend upon user login.

**Action:**

In your main layout or a top-level component, fetch and update the settings store.

```typescript:src/routes/+layout.svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { userSettings } from '$lib/stores/userSettings';
  import { get } from 'svelte/store';

  onMount(async () => {
    const response = await fetch('/api/user/settings');
    if (response.ok) {
      const data = await response.json();
      userSettings.set({
        pushNotifications: data.pushNotifications,
        emailNotifications: data.emailNotifications,
        themeMode: data.themeMode,
        language: data.language
      });

      // Apply theme
      document.documentElement.classList.toggle('dark', data.themeMode === 'DARK');

      // Apply language
      // Implement your i18n language switching logic here
    }
  });
</script>

<slot />
```

### **c. Update Settings Component**

**Objective:** Allow users to update their settings through the UI.

**Action:**

Modify both app and coach settings pages to include settings controls that interact with the settings store and backend API.

**Example for App Settings (`src/routes/app/settings/+page.svelte`):**

```typescript:src/routes/app/settings/+page.svelte
<script lang="ts">
  import { userSettings } from '$lib/stores/userSettings';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';

  let settings;
  userSettings.subscribe(value => {
    settings = value;
  });

  async function updateSettings(updates) {
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const data = await response.json();
        userSettings.set({
          pushNotifications: data.pushNotifications,
          emailNotifications: data.emailNotifications,
          themeMode: data.themeMode,
          language: data.language
        });
        toast.success('Settings updated successfully');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('An unexpected error occurred');
    }
  }

  function toggleDarkMode() {
    const newMode = settings.themeMode === 'LIGHT' ? 'DARK' : 'LIGHT';
    updateSettings({ themeMode: newMode });
    document.documentElement.classList.toggle('dark', newMode === 'DARK');
  }

  function handleLanguageChange(event) {
    const newLanguage = event.target.value;
    updateSettings({ language: newLanguage });
    // Implement your i18n language switching logic here
  }

  function handleTogglePushNotifications() {
    updateSettings({ pushNotifications: !settings.pushNotifications });
  }

  function handleToggleEmailNotifications() {
    updateSettings({ emailNotifications: !settings.emailNotifications });
  }
</script>

<div class="mx-auto space-y-6">
  <h1 class="text-3xl font-bold mb-8">Settings</h1>

  <!-- Appearance Settings -->
  <div class="bg-card text-card-foreground rounded-lg border shadow-sm">
    <div class="flex flex-col space-y-1.5 p-6">
      <h3 class="text-2xl font-semibold leading-none tracking-tight">Appearance</h3>
      <p class="text-muted-foreground text-sm">Customize the application's appearance.</p>
    </div>
    <Separator />
    <div class="p-6">
      <div class="flex items-center justify-between">
        <div class="space-y-0.5">
          <label class="block text-sm font-medium">Dark Mode</label>
          <p class="text-sm text-muted-foreground">Toggle between light and dark mode.</p>
        </div>
        <button on:click={toggleDarkMode} class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
          {settings.themeMode === 'DARK' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>
      </div>
    </div>
  </div>

  <!-- Notification Settings -->
  <div class="bg-card text-card-foreground rounded-lg border shadow-sm">
    <div class="flex flex-col space-y-1.5 p-6">
      <h3 class="text-2xl font-semibold leading-none tracking-tight">Notifications</h3>
      <p class="text-muted-foreground text-sm">Manage your notification preferences.</p>
    </div>
    <Separator />
    <div class="p-6 space-y-4">
      <div class="flex items-center justify-between">
        <div class="space-y-0.5">
          <label class="block text-sm font-medium">Push Notifications</label>
          <p class="text-sm text-muted-foreground">Receive push notifications in your browser.</p>
        </div>
        <button on:click={handleTogglePushNotifications} class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
          {settings.pushNotifications ? 'Disable' : 'Enable'}
        </button>
      </div>
      <div class="flex items-center justify-between">
        <div class="space-y-0.5">
          <label class="block text-sm font-medium">Email Notifications</label>
          <p class="text-sm text-muted-foreground">Receive email notifications about important updates.</p>
        </div>
        <button on:click={handleToggleEmailNotifications} class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
          {settings.emailNotifications ? 'Disable' : 'Enable'}
        </button>
      </div>
    </div>
  </div>

  <!-- Language Settings -->
  <div class="bg-card text-card-foreground rounded-lg border shadow-sm">
    <div class="flex flex-col space-y-1.5 p-6">
      <h3 class="text-2xl font-semibold leading-none tracking-tight">Language</h3>
      <p class="text-muted-foreground text-sm">Select your preferred language.</p>
    </div>
    <Separator />
    <div class="p-6">
      <select bind:value={settings.language} on:change={handleLanguageChange} class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
        <option value="en">English</option>
        <option value="nl">Dutch</option>
        <option value="fr">French</option>
      </select>
    </div>
  </div>
</div>
```

### **d. Apply Settings on App Load**

**Objective:** Ensure the app applies user settings (theme and language) upon loading.

**Action:**

Enhance your main layout or entry component to respond to changes in the settings store.

```typescript:src/routes/+layout.svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { userSettings } from '$lib/stores/userSettings';
  import { subscribe } from 'svelte/store';
  import { i18n } from '$lib/i18n'; // Your i18n setup

  userSettings.subscribe(settings => {
    // Apply theme
    document.documentElement.classList.toggle('dark', settings.themeMode === 'DARK');

    // Apply language
    i18n.changeLanguage(settings.language);
  });

  onMount(async () => {
    // Initial fetch is handled in the earlier step
  });
</script>

<slot />
```

## **4. Update Coach Interface**

### **a. Modify Coach Settings Page**

**Objective:** Allow coaches to update their settings similarly to the app users.

**Action:**

Replicate the settings implementation in the coach settings page (`src/routes/coach/settings/+page.svelte`).

```typescript:src/routes/coach/settings/+page.svelte
<script lang="ts">
  import { userSettings } from '$lib/stores/userSettings';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';

  let settings;
  userSettings.subscribe(value => {
    settings = value;
  });

  async function updateSettings(updates) {
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const data = await response.json();
        userSettings.set({
          pushNotifications: data.pushNotifications,
          emailNotifications: data.emailNotifications,
          themeMode: data.themeMode,
          language: data.language
        });
        toast.success('Settings updated successfully');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('An unexpected error occurred');
    }
  }

  function toggleDarkMode() {
    const newMode = settings.themeMode === 'LIGHT' ? 'DARK' : 'LIGHT';
    updateSettings({ themeMode: newMode });
    document.documentElement.classList.toggle('dark', newMode === 'DARK');
  }

  function handleLanguageChange(event) {
    const newLanguage = event.target.value;
    updateSettings({ language: newLanguage });
    // Implement your i18n language switching logic here
  }

  function handleTogglePushNotifications() {
    updateSettings({ pushNotifications: !settings.pushNotifications });
  }

  function handleToggleEmailNotifications() {
    updateSettings({ emailNotifications: !settings.emailNotifications });
  }
</script>

<div class="mx-auto space-y-6">
  <h1 class="text-3xl font-bold mb-8">Settings</h1>

  <!-- Appearance Settings -->
  <div class="bg-card text-card-foreground rounded-lg border shadow-sm">
    <div class="flex flex-col space-y-1.5 p-6">
      <h3 class="text-2xl font-semibold leading-none tracking-tight">Appearance</h3>
      <p class="text-muted-foreground text-sm">Customize the application's appearance.</p>
    </div>
    <Separator />
    <div class="p-6">
      <div class="flex items-center justify-between">
        <div class="space-y-0.5">
          <label class="block text-sm font-medium">Dark Mode</label>
          <p class="text-sm text-muted-foreground">Toggle between light and dark mode.</p>
        </div>
        <button on:click={toggleDarkMode} class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
          {settings.themeMode === 'DARK' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>
      </div>
    </div>
  </div>

  <!-- Notification Settings -->
  <div class="bg-card text-card-foreground rounded-lg border shadow-sm">
    <div class="flex flex-col space-y-1.5 p-6">
      <h3 class="text-2xl font-semibold leading-none tracking-tight">Notifications</h3>
      <p class="text-muted-foreground text-sm">Manage your notification preferences.</p>
    </div>
    <Separator />
    <div class="p-6 space-y-4">
      <div class="flex items-center justify-between">
        <div class="space-y-0.5">
          <label class="block text-sm font-medium">Push Notifications</label>
          <p class="text-sm text-muted-foreground">Receive push notifications in your browser.</p>
        </div>
        <button on:click={handleTogglePushNotifications} class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
          {settings.pushNotifications ? 'Disable' : 'Enable'}
        </button>
      </div>
      <div class="flex items-center justify-between">
        <div class="space-y-0.5">
          <label class="block text-sm font-medium">Email Notifications</label>
          <p class="text-sm text-muted-foreground">Receive email notifications about important updates.</p>
        </div>
        <button on:click={handleToggleEmailNotifications} class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
          {settings.emailNotifications ? 'Disable' : 'Enable'}
        </button>
      </div>
    </div>
  </div>

  <!-- Language Settings -->
  <div class="bg-card text-card-foreground rounded-lg border shadow-sm">
    <div class="flex flex-col space-y-1.5 p-6">
      <h3 class="text-2xl font-semibold leading-none tracking-tight">Language</h3>
      <p class="text-muted-foreground text-sm">Select your preferred language.</p>
    </div>
    <Separator />
    <div class="p-6">
      <select bind:value={settings.language} on:change={handleLanguageChange} class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
        <option value="en">English</option>
        <option value="nl">Dutch</option>
        <option value="fr">French</option>
      </select>
    </div>
  </div>
</div>
```

## **5. Ensure Settings Persistence on Login**

### **a. Apply Settings During Authentication**

**Objective:** When a user logs in, automatically apply their saved settings.

**Action:**

Modify your authentication flow to fetch and apply settings immediately after successful login.

```typescript:src/lib/server/auth.ts
import { prisma } from '$lib/server/db';
import type { RequestEvent } from '@sveltejs/kit';

export async function handleLogin(event: RequestEvent, userId: string) {
  // After authenticating the user
  const settings = await prisma.userSettings.findUnique({
    where: { userId }
  });

  if (settings) {
    event.locals.userSettings = settings;
  } else {
    // Initialize default settings
    const defaultSettings = await prisma.userSettings.create({
      data: {
        userId,
        pushNotifications: true,
        emailNotifications: true,
        themeMode: 'LIGHT',
        language: 'en'
      }
    });
    event.locals.userSettings = defaultSettings;
  }
}
```

### **b. Update Client-Side to Reflect Settings**

**Objective:** Ensure the frontend reflects the user's settings upon login.

**Action:**

Leverage the settings store to update the UI based on the fetched settings, as demonstrated in previous steps.

## **6. Testing**

### **a. Backend Testing**

**Objective:** Verify that settings are correctly saved and retrieved from the database.

**Action:**

- **Create Tests:**
  - Submit various settings updates and ensure they persist.
  - Fetch settings for different users and verify accuracy.

- **Manual Testing:**
  - Use tools like Postman to test the API endpoints.
  - Check database entries to ensure data integrity.

### **b. Frontend Testing**

**Objective:** Ensure the frontend correctly interacts with the backend and reflects user settings.

**Action:**

- **Functionality:**
  - Toggle dark mode and verify UI changes.
  - Enable/disable notifications and confirm updates.
  - Change language and ensure the app displays the correct translations.

- **Persistence:**
  - Refresh the page and ensure settings persist.
  - Log out and log back in to verify settings are re-applied.

### **c. UI/UX Testing**

**Objective:** Ensure the settings interface is intuitive and responsive.

**Action:**

- **Responsiveness:**
  - Test settings on various screen sizes to ensure layout consistency.

- **Accessibility:**
  - Verify that all interactive elements are accessible via keyboard.
  - Ensure proper contrast ratios for text and backgrounds, especially for dark mode.

## **7. Deployment**

### **a. Apply Migrations**

**Objective:** Ensure the production database includes the new `UserSettings` model.

**Action:**

Run the Prisma migration on your production environment.

```bash
npx prisma migrate deploy
```

### **b. Verify Deployment**

**Objective:** Confirm that settings functionality works as expected in production.

**Action:**

- Perform end-to-end testing in the production environment.
- Monitor logs for any errors related to user settings.

## **8. Documentation and Handover**

### **a. Update README.md**

**Objective:** Provide clear instructions on the new settings feature.

**Action:**

```markdown
## User Settings

Users can customize their preferences in the Settings section, including:

- **Theme Mode:** Toggle between Light and Dark modes.
- **Notifications:** Enable or disable Push and Email notifications.
- **Language:** Select your preferred language (English, Dutch, French).

These settings are saved and automatically applied on subsequent logins.
```

### **b. Document API Endpoints**

**Objective:** Ensure future maintenance can easily understand the settings API.

**Action:**

Add detailed documentation for the `/api/user/settings` endpoints, including request and response schemas.

### **c. Provide UI Mockups**

**Objective:** Assist designers and developers in maintaining consistent UI.

**Action:**

Include screenshots or mockups of the settings interface in your documentation.

# Summary

This step-by-step plan guides you through implementing persistent user settings in your application. By updating the database schema, enhancing backend APIs, modifying the frontend to manage and apply settings, and ensuring thorough testing and documentation, users will enjoy a seamless and personalized experience every time they log in.
