# Settings

Living in `src/settings.ts` settings exists for hard coded constant variables that can act as settings for an app. This is currently quite minimal but will grow.

```js
export const settings = {
	app_name: 'Drop In',
	app_route: '/dashboard',
};
```

## Options

### app_name

A string used throughout the site anytime you might reference the app's name.

### app_route

Where the user is redirected to after the user has logged in. Also used in the `auth_guard` function
