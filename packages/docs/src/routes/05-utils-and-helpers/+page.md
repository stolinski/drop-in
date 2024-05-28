# Utils and Helpers

## Auth Utils

app_guard and auth_guard are used for redirecting a user to either login pages or app pages depending on if the user is logged in or out.

### How to use

```js
// +layout.svelte or +page.svelte
// <script>
// ...
import { app_guard } from '$utils/app_guard';
// Everything in the app route tree is protected behind user accounts.
$effect.pre(app_guard);
// ...
// </script>
```

`$effect.pre` runs before the component mounts, checking if the user data is there and redirects based on auth status.

You can use this code on any additional route or remove it if you'd like anyone to navigate anywhere.abs

Pages within `(app)` will redirect to `/auth/login` if the user is not logged in.
