<script lang="ts">
  import { Button, FormField, ProviderButton, type FieldState } from "@kenn-io/kit-ui";
  import SparklesIcon from "@lucide/svelte/icons/sparkles";

  let email = $state<FieldState>({ id: "signup-email", label: "Email", value: "" });
  let sent = $state(false);

  function submit(event: SubmitEvent) {
    event.preventDefault();
    const valid = /^\S+@\S+\.\S+$/.test(email.value);
    email = { ...email, error: valid ? undefined : "Enter a valid email address." };
    sent = valid;
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
    <form class="form" onsubmit={submit} novalidate>
      <header>
        <h1>Create an account</h1>
        <p>Enter your email below to create your account</p>
      </header>

      <FormField
        field={email}
        type="email"
        placeholder="name@example.com"
        autocomplete="email"
        required
        oninput={(value) => (email = { ...email, value, error: undefined })}
      />
      <Button type="submit" label="Sign up with email" tone="info" surface="solid" size="lg" />

      {#if sent}
        <p class="success" role="status">Check {email.value} for a sign-in link.</p>
      {/if}

      <div class="divider"><span>Or continue with</span></div>

      <ProviderButton provider="google" label="Sign up with Google" />

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
    background: var(--bg-primary);
  }

  .brand {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 24px;
    padding: 32px;
    background: var(--bg-sidebar);
    border-right: 1px solid var(--border-default);
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
  }

  blockquote {
    margin: 0;
    display: grid;
    gap: 8px;
  }

  blockquote p {
    margin: 0;
    font-size: var(--font-size-lg);
    line-height: 1.5;
  }

  blockquote footer {
    color: var(--text-muted);
    font-size: var(--font-size-sm);
  }

  .panel {
    display: grid;
    place-items: center;
    padding: 32px;
  }

  .form {
    display: grid;
    gap: 16px;
    width: min(100%, 350px);
  }

  header {
    display: grid;
    gap: 4px;
    text-align: center;
  }

  h1 {
    margin: 0;
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
  }

  header p {
    margin: 0;
    color: var(--text-muted);
    font-size: var(--font-size-sm);
  }

  .form :global(.kit-button),
  .form :global(.kit-provider-button) {
    width: 100%;
    justify-content: center;
  }

  .divider {
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--text-muted);
    font-size: var(--font-size-2xs);
    text-transform: uppercase;
  }

  .divider::before,
  .divider::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--border-default);
  }

  .success {
    margin: 0;
    color: var(--accent-green);
    font-size: var(--font-size-sm);
    text-align: center;
  }

  .terms {
    margin: 0;
    color: var(--text-muted);
    font-size: var(--font-size-xs);
    text-align: center;
  }

  a {
    color: var(--text-accent);
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
