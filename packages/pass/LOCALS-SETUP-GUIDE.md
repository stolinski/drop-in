# Setting Up User Data in Locals - @drop-in/pass

After upgrading to the new HttpOnly JWT implementation, you need to properly configure your hooks to populate `event.locals.user` with authenticated user data.

## The Problem

If you're seeing empty `locals`, it's because the new security upgrade changed how user authentication works:

- **Before**: JWT was readable client-side, user data was manually fetched
- **After**: JWT is HttpOnly (secure), user data is automatically populated server-side

## ✅ Required Setup

### 1. Update your `hooks.server.ts`

This is the **critical step** that populates `event.locals.user`:

```typescript
// src/hooks.server.ts
import { create_pass_routes, create_session_handle } from '@drop-in/pass';
import { sequence } from '@sveltejs/kit/hooks';

export const handle = sequence(
  create_session_handle(db),  // 🔥 THIS IS REQUIRED - populates event.locals.user
  create_pass_routes(db)      // Handles auth routes (/api/auth/*)
);
```

⚠️ **Order matters**: `create_session_handle(db)` must come before `create_pass_routes(db)`

### 2. Verify TypeScript Types (Optional but Recommended)

Ensure your `app.d.ts` has the correct types:

```typescript
// src/app.d.ts
import type { User } from '@drop-in/pass/schema';

declare global {
  namespace App {
    interface Locals {
      user?: Partial<User>;
    }
    // ... other declarations
  }
}

export {};
```

## 🚀 Using User Data in Your App

### Server-Side (Load Functions)

```typescript
// src/routes/+layout.server.ts
export async function load({ locals }) {
  return {
    user: locals.user // Automatically populated by create_session_handle(db)
  };
}
```

```typescript
// src/routes/dashboard/+page.server.ts
import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
  // Check authentication
  if (!locals.user) {
    redirect(302, '/login');
  }

  // User is authenticated
  console.log('User ID:', locals.user.id);
  console.log('User Email:', locals.user.email);
  
  return {
    user: locals.user,
    // other data...
  };
}
```

### API Routes

```typescript
// src/routes/api/protected/+server.ts
import { json, error } from '@sveltejs/kit';

export async function GET({ locals }) {
  if (!locals.user) {
    error(401, 'Not authenticated');
  }

  return json({
    message: `Hello ${locals.user.email}!`,
    userId: locals.user.id
  });
}
```

### Client-Side (When Needed)

For client-side user data, use Svelte 5 runes with the `/api/auth/me` endpoint:

```typescript
// src/lib/stores/user.svelte.ts
import { pass } from '@drop-in/pass/client';

class UserStore {
  user = $state(null);
  loading = $state(false);
  error = $state(null);

  async loadCurrentUser() {
    this.loading = true;
    this.error = null;
    
    try {
      const { user } = await pass.me();
      this.user = user;
      return user;
    } catch (err) {
      this.user = null;
      this.error = err.message;
      return null;
    } finally {
      this.loading = false;
    }
  }

  async logout() {
    try {
      await pass.logout();
      this.user = null;
    } catch (err) {
      this.error = err.message;
    }
  }
}

export const userStore = new UserStore();
```

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { onMount } from 'svelte';
  import { userStore } from '$lib/stores/user.svelte.js';

  let { data } = $props();

  // Initialize client-side user data if needed
  onMount(async () => {
    if (!userStore.user && data.user) {
      userStore.user = data.user;
    } else if (!userStore.user) {
      await userStore.loadCurrentUser();
    }
  });
</script>

<nav>
  {#if userStore.user}
    <span>Welcome, {userStore.user.email}!</span>
    <button onclick={() => userStore.logout()}>Logout</button>
  {:else}
    <a href="/login">Login</a>
  {/if}
</nav>

<main>
  {@render children()}
</main>
```

## 🔧 Troubleshooting

### Issue: `locals.user` is undefined

**Solution**: Check your `hooks.server.ts` setup:

```typescript
// ❌ Wrong - missing create_session_handle
export const handle = create_pass_routes(db);

// ❌ Wrong - wrong order
export const handle = sequence(create_pass_routes(db), create_session_handle(db));

// ✅ Correct
export const handle = sequence(create_session_handle(db), create_pass_routes(db));
```

### Issue: User logged in but `locals.user` still undefined

**Check these common issues:**

1. **Cookie domain/path issues**:
   ```typescript
   // Verify cookies are being set correctly
   export async function load({ cookies, locals }) {
     console.log('JWT Cookie:', cookies.get('jwt'));
     console.log('Refresh Token:', cookies.get('refresh_token'));
     console.log('Locals User:', locals.user);
     return {};
   }
   ```

2. **Database connection**:
   ```typescript
   // Test database connectivity
   import { authenticate_user } from '@drop-in/pass';
   
   export async function load({ cookies }) {
     const auth = await authenticate_user(db, cookies);
     console.log('Auth result:', auth);
     return {};
   }
   ```

3. **HTTPS in production**:
   - HttpOnly cookies require HTTPS in production
   - Ensure `secure: true` in cookie options matches your environment

### Issue: Works in development but not production

**Common production issues:**

1. **Domain configuration**:
   ```typescript
   // Check if cookies are being sent
   console.log('Request headers:', request.headers.get('cookie'));
   ```

2. **HTTPS enforcement**:
   ```typescript
   // Verify secure cookie settings
   import { cookie_options } from '@drop-in/pass/cookies';
   console.log('Cookie options:', cookie_options);
   ```

## 🎯 Complete Working Example

Here's a complete working setup with modern Svelte 5:

### `src/hooks.server.ts`
```typescript
import { create_pass_routes, create_session_handle } from '@drop-in/pass';
import { sequence } from '@sveltejs/kit/hooks';

export const handle = sequence(
  create_session_handle(db),
  create_pass_routes(db)
);
```

### `src/routes/+layout.server.ts`
```typescript
export async function load({ locals }) {
  return {
    user: locals.user
  };
}
```

### `src/routes/+layout.svelte`
```svelte
<script>
  let { data, children } = $props();
  let user = $derived(data.user);
</script>

<nav>
  {#if user}
    <span>Welcome, {user.email}!</span>
    <form method="POST" action="/api/auth/logout">
      <button type="submit">Logout</button>
    </form>
  {:else}
    <a href="/login">Login</a>
  {/if}
</nav>

<main>
  {@render children()}
</main>
```

### `src/routes/login/+page.svelte`
```svelte
<script>
  import { pass } from '@drop-in/pass/client';
  import { goto } from '$app/navigation';

  let email = $state('');
  let password = $state('');
  let error = $state('');
  let loading = $state(false);

  async function handleLogin() {
    loading = true;
    error = '';
    
    try {
      await pass.login(email, password);
      goto('/dashboard'); // Redirect after successful login
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }
</script>

<form onsubmit={handleLogin}>
  <input bind:value={email} type="email" placeholder="Email" required />
  <input bind:value={password} type="password" placeholder="Password" required />
  <button type="submit" disabled={loading}>
    {loading ? 'Logging in...' : 'Login'}
  </button>
  {#if error}
    <p class="error">{error}</p>
  {/if}
</form>
```

### `src/routes/dashboard/+page.svelte`
```svelte
<script>
  let { data } = $props();
  let user = $derived(data.user);
</script>

<h1>Dashboard</h1>

{#if user}
  <div>
    <h2>Welcome, {user.email}!</h2>
    <p>User ID: {user.id}</p>
    <p>Account created: {new Date(user.created_at).toLocaleDateString()}</p>
    <p>Verified: {user.verified ? 'Yes' : 'No'}</p>
  </div>
{:else}
  <p>Loading user data...</p>
{/if}
```

### `src/lib/components/AuthGuard.svelte`
```svelte
<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let { children, redirectTo = '/login' } = $props();
  let user = $derived($page.data.user);

  onMount(() => {
    if (!user) {
      goto(redirectTo);
    }
  });
</script>

{#if user}
  {@render children()}
{:else}
  <p>Redirecting to login...</p>
{/if}
```

## 🔍 Debug Checklist

If locals is still empty, check each of these:

- [ ] `create_session_handle(db)` is imported and used in hooks.server.ts
- [ ] `create_session_handle(db)` comes before `create_pass_routes(db)` in the sequence
- [ ] JWT and refresh_token cookies are being set (check browser dev tools)
- [ ] Database connection is working
- [ ] User exists in database with correct ID
- [ ] HTTPS is configured in production
- [ ] SameSite/Secure cookie settings match your environment

## 📞 Still Having Issues?

If you're still experiencing problems:

1. **Enable debug logging** in your load function:
   ```typescript
   export async function load({ locals, cookies }) {
     console.log('=== DEBUG ===');
     console.log('Locals user:', locals.user);
     console.log('JWT cookie:', cookies.get('jwt'));
     console.log('Refresh token:', cookies.get('refresh_token'));
     console.log('=== END DEBUG ===');
     return { user: locals.user };
   }
   ```

2. **Test authentication manually**:
   ```typescript
   import { authenticate_user, get_user_by_id } from '@drop-in/pass';
   
   export async function load({ cookies }) {
     const auth = await authenticate_user(db, cookies);
     if (auth) {
       const user = await get_user_by_id(db, auth.user_id);
       console.log('Manual auth result:', { auth, user });
     }
     return {};
   }
   ```

3. **Check the upgrade guide**: See [SECURITY-UPGRADE.md](./SECURITY-UPGRADE.md) for migration details

## 🎯 Key Svelte 5 Changes

- Use `$state()` for reactive variables instead of `let`
- Use `$derived()` for computed values instead of `$:`
- Use `$props()` for component props
- Use `{@render children()}` instead of `<slot>`
- Use `onsubmit={handler}` instead of `on:submit|preventDefault={handler}`
- Use `onclick={handler}` instead of `on:click={handler}`

Remember: The new HttpOnly system is more secure but requires proper hook setup. Once configured correctly, user data will be automatically available in `locals.user` for all server-side code!