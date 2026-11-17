<script lang="ts">
  import { Button } from "@ui-sdk/svelte/button";
  import { Field, FieldError, FieldLabel } from "@ui-sdk/svelte/field";
  import { Input } from "@ui-sdk/svelte/input";
  import {
    PasswordInput,
    PasswordInputControl,
    PasswordInputToggle,
  } from "@ui-sdk/svelte/password-input";

  let email = $state("");
  let signedIn = $state(false);

  function submit(event: SubmitEvent) {
    event.preventDefault();
    signedIn = true;
  }
</script>

<div class="page">
  <section class="card" aria-labelledby="login-title">
    <header>
      <h1 id="login-title">Login to your account</h1>
      <p>Enter your email below to login to your account.</p>
    </header>

    <form class="form" onsubmit={submit}>
      <Field name="email">
        <FieldLabel>Email</FieldLabel>
        <Input
          type="email"
          bind:value={email}
          placeholder="m@example.com"
          autocomplete="email"
          pattern={"[^\\s@]+@[^\\s@]+\\.[^\\s@]+"}
          required
          oninput={() => (signedIn = false)}
        />
        <FieldError>Enter a valid email address.</FieldError>
      </Field>

      <Field name="password">
        <div class="label-row">
          <FieldLabel>Password</FieldLabel>
          <a href="#forgot">Forgot your password?</a>
        </div>
        <PasswordInput required>
          <PasswordInputControl minlength={8} />
          <PasswordInputToggle aria-label="Show password" />
        </PasswordInput>
        <FieldError>Use at least 8 characters.</FieldError>
      </Field>

      <div class="actions">
        <Button type="submit" data-variant="solid">Login</Button>
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
          Login with Google
        </Button>
      </div>

      {#if signedIn}
        <p class="status" role="status">Signed in as {email}.</p>
      {/if}
    </form>

    <footer>Don't have an account? <a href="#signup">Sign up</a></footer>
  </section>
</div>

<style>
  .page {
    display: grid;
    place-items: center;
    min-height: 100%;
    padding: calc(var(--ui-spacing) * 8) calc(var(--ui-spacing) * 4);
    box-sizing: border-box;
    background: var(--ui-muted);
  }

  .card {
    display: grid;
    gap: calc(var(--ui-spacing) * 6);
    width: min(100%, 24rem);
    box-sizing: border-box;
    padding: calc(var(--ui-spacing) * 6);
    border: 1px solid var(--ui-border);
    border-radius: calc(var(--ui-radius) * 2);
    background: var(--ui-background);
  }

  header {
    display: grid;
    gap: calc(var(--ui-spacing) * 1.5);
  }

  h1 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
  }

  header p,
  footer {
    margin: 0;
    color: var(--ui-muted-foreground);
  }

  footer {
    text-align: center;
  }

  .form {
    display: grid;
    gap: calc(var(--ui-spacing) * 4);
  }

  .label-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: calc(var(--ui-spacing) * 2);
  }

  .label-row a {
    font-size: 0.8125rem;
  }

  .actions {
    display: grid;
    gap: calc(var(--ui-spacing) * 2);
  }

  .status {
    margin: 0;
  }

  a {
    color: var(--ui-primary);
  }
</style>
