# Auth Migration Guide: From @drop-in/pass to Better Auth

## Overview

This document outlines how to migrate authentication from the `@drop-in/pass` library to Better Auth while maintaining backward compatibility for existing users. The migration handles two different password hashing methods and ensures zero downtime.

## Current State Analysis

### Password Hashing Methods in @drop-in/pass

1. **Legacy Method**: `bcrypt(sha256(password))` - SHA-256 hash first, then bcrypt
2. **Current Method**: `bcrypt(password)` - Direct bcrypt hashing

### Challenge

- Both methods store bcrypt hashes in the database
- No way to distinguish which method was used for existing users
- Need to support gradual migration during login attempts

## Database Schema Changes

### Required Field Addition

Add a new field to track authentication method:

```sql
ALTER TABLE user ADD COLUMN auth_provider VARCHAR(50) DEFAULT 'unknown';
```

### Field Values

- `'unknown'` - Default state for existing users (auth method not yet determined)
- `'legacy-sha256'` - User verified with bcrypt(sha256(password)) method
- `'legacy-bcrypt'` - User verified with bcrypt(password) method
- `'better-auth'` - User migrated to Better Auth
- `'native-better-auth'` - User created directly with Better Auth

## User Auth Type Detection Mechanism

### Initial State Setup

When deploying the migration system, all existing users should have `auth_provider = 'unknown'`. This is handled by the DEFAULT value in the schema change.

### Detection Strategy During Login

#### Step 1: Check Current Auth Provider Status

```typescript
async function determineAuthMethod(user: User, password: string): Promise<AuthResult> {
	// If already determined, use the known method
	if (user.auth_provider !== 'unknown') {
		return await handleKnownAuthMethod(user, password);
	}

	// Unknown user - need to detect auth method
	return await detectAndSetAuthMethod(user, password);
}
```

#### Step 2: Detection Logic for Unknown Users

```typescript
async function detectAndSetAuthMethod(user: User, password: string): Promise<AuthResult> {
	// Try current @drop-in/pass method first: bcrypt(password)
	const currentMatch = await bcrypt.compare(password, user.password_hash);
	if (currentMatch) {
		// Update user to legacy-bcrypt
		await updateAuthProvider(user.id, 'legacy-bcrypt');
		return { success: true, method: 'legacy-bcrypt', shouldMigrate: true };
	}

	// Try legacy method: bcrypt(sha256(password))
	const sha256Hash = crypto.createHash('sha256').update(password).digest('hex');
	const legacyMatch = await bcrypt.compare(sha256Hash, user.password_hash);
	if (legacyMatch) {
		// Update user to legacy-sha256
		await updateAuthProvider(user.id, 'legacy-sha256');
		return { success: true, method: 'legacy-sha256', shouldMigrate: true };
	}

	return { success: false, error: 'Invalid credentials' };
}
```

#### Step 3: Update Auth Provider Helper

```typescript
async function updateAuthProvider(userId: string, provider: string): Promise<void> {
	try {
		await db.update(userTable).set({ auth_provider: provider }).where(eq(userTable.id, userId));

		console.log(`User ${userId} auth method detected and set to: ${provider}`);
	} catch (error) {
		console.error(`Failed to update auth provider for user ${userId}:`, error);
		// Don't fail login if this update fails
	}
}
```

### Migration Trigger Logic

```typescript
async function handleAuthResult(authResult: AuthResult, user: User, password: string) {
	if (!authResult.success) {
		return authResult;
	}

	// If user is legacy (either type) and login succeeded, migrate to Better Auth
	if (authResult.shouldMigrate) {
		await migrateToBetterAuth(user, password);
	}

	return authResult;
}
```

- `'native-better-auth'` - User created directly with Better Auth

### Auth Type Detection Strategy

When the migration is deployed, all existing users will have `auth_provider = 'unknown'`. The system determines their actual auth method during their first login attempt:

1. **Unknown users**: Try both legacy methods and record which one works
2. **Successful detection**: Update `auth_provider` to specific legacy type
3. **Migration opportunity**: Convert detected legacy users to Better Auth
4. **New users**: Always create with `'native-better-auth'`

## Complete Detection and Migration Workflow

### Overview of the Detection Process

1. **Initial State**: All existing users have `auth_provider = 'unknown'`
2. **First Login Attempt**: System detects which legacy method works and updates the field
3. **Subsequent Logins**: System uses the known auth method
4. **Migration**: Once detected, user is migrated to Better Auth on successful login

### Complete Login Flow with Detection

```typescript
async function hybridLogin(email: string, password: string) {
	const user = await getUserByEmail(email);

	if (!user) {
		return { success: false, error: 'User not found' };
	}

	// Route 1: Better Auth users (already migrated)
	if (user.auth_provider === 'better-auth' || user.auth_provider === 'native-better-auth') {
		return await betterAuth.signIn.email({ email, password });
	}

	// Route 2: Known legacy users
	if (user.auth_provider === 'legacy-sha256' || user.auth_provider === 'legacy-bcrypt') {
		const authResult = await verifyKnownLegacyUser(user, password);
		if (authResult.success) {
			await migrateToBetterAuth(user, password);
		}
		return authResult;
	}

	// Route 3: Unknown users (need detection)
	if (user.auth_provider === 'unknown') {
		const detectionResult = await detectAndSetAuthMethod(user, password);
		if (detectionResult.success) {
			await migrateToBetterAuth(user, password);
		}
		return detectionResult;
	}

	return { success: false, error: 'Invalid auth provider state' };
}
```

### Helper Functions for Known Legacy Users

```typescript
async function verifyKnownLegacyUser(user: User, password: string): Promise<AuthResult> {
	if (user.auth_provider === 'legacy-bcrypt') {
		const isValid = await bcrypt.compare(password, user.password_hash);
		return { success: isValid, method: 'legacy-bcrypt', shouldMigrate: true };
	}

	if (user.auth_provider === 'legacy-sha256') {
		const sha256Hash = crypto.createHash('sha256').update(password).digest('hex');
		const isValid = await bcrypt.compare(sha256Hash, user.password_hash);
		return { success: isValid, method: 'legacy-sha256', shouldMigrate: true };
	}

	return { success: false, error: 'Unknown legacy auth method' };
}
```

## Migration Strategy

### Phase 1: Setup Better Auth

1. Install and configure Better Auth in your app
2. Add the `auth_provider` field to your user table
3. Keep @drop-in/pass running alongside Better Auth

### Phase 2: Implement Hybrid Login Flow

#### Login Logic Flow

```typescript
async function hybridLogin(email: string, password: string) {
	const user = await getUserByEmail(email);

	if (!user) {
		return { success: false, error: 'User not found' };
	}

	// If already migrated to Better Auth, use it directly
	if (user.auth_provider === 'better-auth' || user.auth_provider === 'native-better-auth') {
		return await betterAuth.signIn.email({ email, password });
	}

	// Legacy user - try @drop-in/pass verification
	const legacyAuthResult = await verifyLegacyPassword(email, password, user);

	if (legacyAuthResult.success) {
		// Migrate to Better Auth
		await migrateToBetterAuth(user, password);
		return legacyAuthResult;
	}

	return { success: false, error: 'Invalid credentials' };
}
```

#### Legacy Password Verification

```typescript
async function verifyLegacyPassword(email: string, password: string, user: User) {
	// Try current method first: bcrypt(password)
	const currentMatch = await bcrypt.compare(password, user.password_hash);
	if (currentMatch) {
		return { success: true, method: 'current', user };
	}

	// Try legacy method: bcrypt(sha256(password))
	const sha256Hash = crypto.createHash('sha256').update(password).digest('hex');
	const legacyMatch = await bcrypt.compare(sha256Hash, user.password_hash);
	if (legacyMatch) {
		return { success: true, method: 'legacy', user };
	}

	return { success: false };
}
```

#### Migration to Better Auth

```typescript
async function migrateToBetterAuth(user: User, plainPassword: string) {
	try {
		// Create Better Auth user record
		await betterAuth.api.signUp({
			email: user.email,
			password: plainPassword,
			// Preserve other user data
		});

		// Update auth provider
		await db
			.update(userTable)
			.set({ auth_provider: 'better-auth' })
			.where(eq(userTable.id, user.id));

		console.log(`User ${user.email} successfully migrated to Better Auth`);
		return { success: true };
	} catch (error) {
		console.error(`Failed to migrate user ${user.email}:`, error);
		// Don't fail the login - user can still use legacy auth
		return { success: false, error };
	}
}
```

### Phase 3: Handle New User Registration

#### Registration Logic

```typescript
async function hybridRegister(email: string, password: string) {
	// Always use Better Auth for new users
	const result = await betterAuth.signUp.email({ email, password });

	if (result.success) {
		// Mark as native Better Auth user
		await db
			.update(userTable)
			.set({ auth_provider: 'native-better-auth' })
			.where(eq(userTable.email, email));
	}

	return result;
}
```

## Implementation Requirements

### Database Requirements

1. Add `auth_provider` field to user table
2. Ensure Better Auth can create its own user records or extend existing ones
3. Handle potential conflicts between @drop-in/pass and Better Auth user IDs

### Security Considerations

1. **Password Exposure**: Plain password is temporarily available during migration
2. **Session Management**: Handle transition between auth systems
3. **Rate Limiting**: Apply to both legacy and Better Auth attempts
4. **Audit Logging**: Track migration attempts and failures

### Error Handling

1. **Migration Failures**: Allow login to succeed even if Better Auth migration fails
2. **Database Errors**: Handle connection issues during migration
3. **Rollback Strategy**: Plan for reverting if Better Auth has issues

## Monitoring Detection and Migration Progress

### Database Queries to Track Progress

```sql
-- Check current distribution of auth providers
SELECT auth_provider, COUNT(*) as user_count
FROM user
GROUP BY auth_provider;

-- Find users who still need detection
SELECT COUNT(*) as unknown_users
FROM user
WHERE auth_provider = 'unknown';

-- Check migration completion percentage
SELECT
  (COUNT(CASE WHEN auth_provider IN ('better-auth', 'native-better-auth') THEN 1 END) * 100.0 / COUNT(*)) as migration_percentage
FROM user;
```

### Application-Level Monitoring

```typescript
// Enhanced metrics to track detection and migration
const migrationMetrics = {
	totalUsers: 0,
	unknownUsers: 0, // Users still with 'unknown' auth_provider
	legacySha256Users: 0, // Users detected as legacy-sha256
	legacyBcryptUsers: 0, // Users detected as legacy-bcrypt
	betterAuthUsers: 0, // Users migrated to better-auth
	nativeBetterAuthUsers: 0, // Users created with better-auth
	migrationFailures: 0,
	detectionFailures: 0, // Users who failed both legacy methods
};

// Function to get current migration status
async function getMigrationStatus() {
	const counts = await db
		.select({
			auth_provider: userTable.auth_provider,
			count: sql`count(*)`,
		})
		.from(userTable)
		.groupBy(userTable.auth_provider);

	return counts.reduce((acc, row) => {
		acc[row.auth_provider] = parseInt(row.count);
		return acc;
	}, {});
}

// Log detection events
function logDetectionEvent(userId: string, detectedMethod: string, success: boolean) {
	console.log(`Detection Event: User ${userId} - Method: ${detectedMethod} - Success: ${success}`);
	// Send to your monitoring system (DataDog, etc.)
}
```

## Monitoring and Metrics

### Track Migration Progress

```typescript
// Add logging to monitor migration
const migrationMetrics = {
	totalUsers: 0,
	migratedUsers: 0,
	legacyMethodUsers: 0,
	currentMethodUsers: 0,
	migrationFailures: 0,
};
```

### Key Metrics to Monitor

- Migration success rate
- Login failure rates during transition
- Performance impact of dual auth system
- Time to complete full migration

## Cleanup Phase

### Once Migration is Complete

1. Remove @drop-in/pass dependency
2. Remove legacy password verification code
3. Remove `auth_provider` field (optional)
4. Update all auth-related code to use Better Auth exclusively

### Verification Steps

1. Confirm all active users have `auth_provider = 'better-auth'` or `'native-better-auth'`
2. Test login flows with migrated accounts
3. Verify new user registration works correctly
4. Check that all auth features (password reset, etc.) work with Better Auth

## Timeline Considerations

### Recommended Phases

1. **Week 1-2**: Setup Better Auth and database changes
2. **Week 3-4**: Implement hybrid login system
3. **Week 5-8**: Monitor migration progress (most users login within 30 days)
4. **Week 9**: Begin cleanup of legacy auth code
5. **Week 10+**: Complete removal of @drop-in/pass

### Risk Mitigation

- Deploy hybrid system during low-traffic periods
- Have rollback plan ready
- Monitor error rates closely
- Consider forced migration for inactive users after extended period

## Code Organization

### Suggested File Structure

```
src/auth/
├── better-auth.config.ts     # Better Auth configuration
├── hybrid-auth.ts           # Main hybrid login logic
├── legacy-auth.ts           # @drop-in/pass verification
├── migration.ts             # Migration utilities
└── types.ts                 # Auth-related types
```

### Environment Variables

```env
# Better Auth configuration
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=your-app-url

# Legacy auth (during transition)
DATABASE_URL=your-database-url
JWT_SECRET=your-jwt-secret
```

## Testing Strategy

### Test Cases Required

1. **Legacy user login** (both hashing methods)
2. **Migrated user login** (Better Auth)
3. **New user registration** (Better Auth)
4. **Migration failure scenarios**
5. **Concurrent login attempts during migration**
6. **Session handling across auth systems**

This guide provides the foundation for implementing a smooth migration from @drop-in/pass to Better Auth while maintaining user access throughout the transition.
