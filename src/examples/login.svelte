<script lang="ts">
  import { Button, Card, FormField, ProviderButton, type FieldState } from "@kenn-io/kit-ui";

  let email = $state<FieldState>({ id: "login-email", label: "Email", value: "" });
  let password = $state<FieldState>({ id: "login-password", label: "Password", value: "" });
  let signedIn = $state(false);

  function submit(event: SubmitEvent) {
    event.preventDefault();
    email = {
      ...email,
      error: /^\S+@\S+\.\S+$/.test(email.value) ? undefined : "Enter a valid email address.",
    };
    password = {
      ...password,
      error: password.value.length >= 8 ? undefined : "Use at least 8 characters.",
    };
    signedIn = !email.error && !password.error;
  }
</script>

<div class="page">
  <div class="wrap">
    <Card title="Login to your account" level="raised" padding="md">
      <form class="form" onsubmit={submit} novalidate>
        <p class="lead">Enter your email below to login to your account.</p>

        <FormField
          field={email}
          type="email"
          placeholder="m@example.com"
          autocomplete="email"
          required
          oninput={(value) => (email = { ...email, value, error: undefined })}
        />

        <div class="password">
          <FormField
            field={password}
            type="password"
            autocomplete="current-password"
            required
            oninput={(value) => (password = { ...password, value, error: undefined })}
          />
          <a class="forgot" href="#forgot">Forgot your password?</a>
        </div>

        <div class="actions">
          <Button type="submit" label="Login" tone="info" surface="solid" size="lg" />
          <ProviderButton provider="google" label="Login with Google" />
        </div>

        {#if signedIn}
          <p class="success" role="status">Signed in as {email.value}.</p>
        {/if}
      </form>

      {#snippet footer()}
        <span class="signup">Don't have an account? <a href="#signup">Sign up</a></span>
      {/snippet}
    </Card>
  </div>
</div>

<style>
  .page {
    display: grid;
    place-items: center;
    min-height: 100%;
    padding: 32px 16px;
    background: var(--bg-inset);
  }

  .wrap {
    width: min(100%, 384px);
  }

  .form {
    display: grid;
    gap: 16px;
  }

  .lead {
    margin: 0;
    color: var(--text-muted);
    font-size: var(--font-size-sm);
  }

  .password {
    position: relative;
  }

  /* Sits on the label row, right-aligned, like the shadcn login block. */
  .forgot {
    position: absolute;
    top: 0;
    right: 0;
    color: var(--text-muted);
    font-size: var(--font-size-xs);
  }

  .actions {
    display: grid;
    gap: 8px;
  }

  .actions :global(.kit-button),
  .actions :global(.kit-provider-button) {
    width: 100%;
    justify-content: center;
  }

  .success {
    margin: 0;
    color: var(--accent-green);
    font-size: var(--font-size-sm);
  }

  .signup {
    display: block;
    color: var(--text-muted);
    font-size: var(--font-size-sm);
    text-align: center;
  }

  a {
    color: var(--text-accent);
  }
</style>
