<script lang="ts">
  import { onMount } from 'svelte';

  const levelData = {
    id: 1,
    title: "Oefening 1",
    objective: "Angstreflexen in het water overwinnen; vertrouwen",
    exercises: [
      {
        part: "A",
        location: "thuis",
        name: "Sproeikampioen",
        description: "Sproei de tenen en voeten, knieën en benen rustig nat, daarna de buik en de rug, de handen, de schouders, de achterkant van het hoofd, de bovenkant van het hoofd en het gezicht.",
        important: "Moedig je kind aan om het hoofd onder de waterstraal te staan. Komt er toch water in de ogen? Laat je kind dan met de ogen knipperen om het water woor sneller uit te krijgen. Dat is beter dan wrijven.",
        tip: "Soms kan je de intensiteit van een sproeikop aanpassen. Een zachte straal werkt in het begin waarschijnlijk beter dan een harde straal. Daag je kind ook uit om langer onder de waterstraal te staan, bv. door luidop te tellen.",
        videos: [
          {
            url: "/src/lib/beeldmateriaalZwemfed/1AA_PG_2_OEF1A.mp4",
            description: "Sproeikampioen oefening"
          }
        ]
      },
      {
        part: "B",
        location: "zwembad",
        name: "Spitter, spetter, spat",
        description: "Zorg dat je kind het lichaam nat maakt met de armen. Laat je kind:\n- tokkelen op het water (zoals piano spelen)\n- golven maken (beweeg van links naar rechts)\n- met de handen op het water slaan\n- jou ook lekker nat spetteren.\n\nZorg dat je kind ook regelmatig van positie wisselt: zitten op de poep op de trapjes van het bad, met de knieën op de bodem of gewoon rechtstaan.",
        important: "Moedig je kind aan om het hoofd niet weg te draaien van de spetters en te knipperen als het water in de ogen krijgt.",
        tip: "Probeer eens een variant en laat je kind ook spetteren met de benen: > Zet je kind op de kant of op de trap van het bad > Laat het de benen op en neer in het water bewegen. Zorg dat de benen en voeten gestrekt zijn.",
        videos: [
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
    ]
  };
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-4 text-foreground">{levelData.title}</h1>
  <p class="text-xl mb-8 text-orange-500">{levelData.objective}</p>

  {#each levelData.exercises as exercise}
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