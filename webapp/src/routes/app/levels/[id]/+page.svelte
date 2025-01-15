<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-4 text-foreground">{data.lesson.title}</h1>
  <p class="text-xl mb-8 text-orange-500">{data.lesson.objective}</p>

  {#each data.lesson.exercises as exercise}
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