<script lang="ts">
  import SparklesIcon from "@lucide/svelte/icons/sparkles";
  import { Button } from "@ui-sdk/svelte/button";
  import { Field, FieldError, FieldLabel } from "@ui-sdk/svelte/field";
  import { Input } from "@ui-sdk/svelte/input";
  import { Separator } from "@ui-sdk/svelte/separator";

  let email = $state("");
  let sentTo = $state("");

  function submit(event: SubmitEvent) {
    event.preventDefault();
    sentTo = email;
  }
</script>

<div class="split">
  <aside class="brand">
    <div class="logo"><SparklesIcon size={18} aria-hidden="true" /> Acme Inc</div>
    <blockquote>
      <p>
        “This library has saved me countless hours of work and helped me deliver stunning designs to
        my clients faster than ever before.”
      </p>
      <footer>Sofia Davis</footer>
    </blockquote>
  </aside>

  <main class="panel">
    <form class="form" onsubmit={submit} aria-labelledby="signup-title">
      <header>
        <h1 id="signup-title">Create an account</h1>
        <p>Enter your email below to create your account</p>
      </header>

      <Field name="email">
        <FieldLabel>Email</FieldLabel>
        <Input
          type="email"
          bind:value={email}
          placeholder="name@example.com"
          autocomplete="email"
          pattern={"[^\\s@]+@[^\\s@]+\\.[^\\s@]+"}
          required
          oninput={() => (sentTo = "")}
        />
        <FieldError>Enter a valid email address.</FieldError>
      </Field>
      <Button type="submit" data-variant="solid">Sign up with email</Button>

      {#if sentTo}
        <p class="status" role="status">Check {sentTo} for a sign-in link.</p>
      {/if}

      <div class="divider">
        <Separator />
        <span>Or continue with</span>
        <Separator />
      </div>

      <Button>
        <svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.94l3.66-2.84z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.55 10.55 0 0 0 12 1 11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        Sign up with Google
      </Button>

      <p class="terms">
        By clicking continue, you agree to our <a href="#terms">Terms of Service</a> and
        <a href="#privacy">Privacy Policy</a>.
      </p>
    </form>
  </main>
</div>

<style>
  .split {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    min-height: 100%;
    background: var(--ui-background);
  }

  .brand {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: calc(var(--ui-spacing) * 6);
    padding: calc(var(--ui-spacing) * 8);
    border-right: 1px solid var(--ui-border);
    background: var(--ui-muted);
  }

  .logo {
    display: flex;
    align-items: center;
    gap: calc(var(--ui-spacing) * 2);
    font-size: 1.125rem;
    font-weight: 600;
  }

  blockquote {
    display: grid;
    gap: calc(var(--ui-spacing) * 2);
    margin: 0;
  }

  blockquote p {
    margin: 0;
    font-size: 1.125rem;
    line-height: 1.5;
  }

  blockquote footer {
    color: var(--ui-muted-foreground);
  }

  .panel {
    display: grid;
    place-items: center;
    padding: calc(var(--ui-spacing) * 8);
  }

  .form {
    display: grid;
    gap: calc(var(--ui-spacing) * 4);
    width: min(100%, 22rem);
  }

  header {
    display: grid;
    gap: calc(var(--ui-spacing) * 1);
    text-align: center;
  }

  h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
  }

  header p,
  .terms {
    margin: 0;
    color: var(--ui-muted-foreground);
  }

  .divider {
    display: flex;
    align-items: center;
    gap: calc(var(--ui-spacing) * 3);
    color: var(--ui-muted-foreground);
    font-size: 0.75rem;
    text-transform: uppercase;
  }

  .status {
    margin: 0;
    text-align: center;
  }

  .terms {
    font-size: 0.8125rem;
    text-align: center;
  }

  a {
    color: var(--ui-primary);
  }

  @container (max-width: 640px) {
    .split {
      grid-template-columns: 1fr;
    }

    .brand {
      display: none;
    }
  }
</style>
