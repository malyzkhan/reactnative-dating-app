# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Configure local environment by copying `.env.example` to `.env`, then set
   `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to the
   values from your Supabase project's Connect/API settings. Publishable keys
   are included in the app bundle; never put a Supabase secret or service-role
   key in an `EXPO_PUBLIC_` variable. Keep database access protected with Row
   Level Security (RLS).

3. Start the app

   ```bash
   npx expo start
   ```

Twin uses Supabase Auth for account workflows. Dating profile, matching, and
chat data services are not connected yet.

### Supabase authentication setup

In **Supabase Dashboard → Authentication → URL Configuration**, add the following
to **Additional Redirect URLs**:

```text
childfreepakapp://**
```

Twin sends email verification to `childfreepakapp://auth/callback` and password
recovery to `childfreepakapp://auth/reset-password`. The configured app scheme
is `childfreepakapp`. For browser testing, also add the exact local web origin
and callback paths shown by your running Expo web app (for example,
`http://localhost:8081/auth/callback` and
`http://localhost:8081/auth/reset-password`). Do not use a placeholder origin
for a deployed web app.

The Google button starts the real Supabase OAuth flow. To enable it, configure
Google under **Authentication → Sign In / Providers → Google**, and enter the
Google OAuth client ID and client secret there—not in the app. In Google Cloud,
add the Supabase project's OAuth callback URL
(`https://dqdgeqcephifppbljfbl.supabase.co/auth/v1/callback`) as an authorized
redirect URI. Add the mobile callback above to Supabase's redirect allowlist.
An installed development or production build is needed to verify the custom
native scheme callback. Expo Go generates a temporary callback in the form
`exp://<host>:<port>/--/auth/callback` (and the corresponding
`/auth/reset-password` route); add the exact runtime URL to Supabase only when
testing with Expo Go. A development build is recommended for stable callbacks.

No SQL migrations or RLS policy changes are required for authentication itself.
Any future app tables must have deliberate RLS policies before the app uses
them. The Google provider credentials and real email delivery are dashboard
settings and cannot be verified from this workspace.

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside `src/app/`. This project
uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
