# Design Document

## Overview

Based on analysis of the existing authentication code, there are several specific bugs causing users to be logged out unexpectedly:

## Identified Issues

### 1. Cookie Configuration Mismatch

- **Problem**: JWT cookies are set manually via `document.cookie` with different settings than server-side cookies
- **Location**: `packages/pass/src/client/api_calls.ts` lines 26 and 50
- **Impact**: Cookies may not persist properly across sessions

### 2. Missing Database Execution in Logout

- **Problem**: The logout function deletes refresh tokens but doesn't execute the query
- **Location**: `packages/pass/src/logout.ts` line 11-14
- **Impact**: Refresh tokens aren't actually invalidated on logout

### 3. Zero Sync Static Authentication

- **Problem**: Z instance is created once with initial auth state and never updates
- **Location**: `templates/z/src/lib/z.svelte.ts`
- **Impact**: Zero Sync may lose authentication when JWT changes

### 4. Incomplete Cookie Clearing on Logout

- **Problem**: Client-side logout doesn't clear JWT cookies, only calls server
- **Location**: `packages/pass/src/client/api_calls.ts` logout method
- **Impact**: JWT cookies remain after logout

### 5. Missing Error Handling in Authentication

- **Problem**: No logging or error handling when JWT validation fails
- **Location**: Throughout authentication flow
- **Impact**: Silent failures make debugging impossible

## Bug Fixes Required

### Fix 1: Standardize Cookie Management

- Use consistent cookie settings between client and server
- Ensure proper secure flags and expiration
- Use js-cookie library consistently instead of manual document.cookie

### Fix 2: Fix Logout Database Query

- Add `.execute()` to the database delete operation
- Add proper error handling for database operations
- Ensure refresh tokens are actually invalidated

### Fix 3: Fix Client-Side Logout

- Clear JWT cookies on client-side logout
- Clear any cached authentication state
- Ensure complete cleanup of auth data

### Fix 4: Add Authentication Debugging

- Add logging for JWT validation attempts
- Log cookie operations and failures
- Add debugging for Zero Sync authentication issues

### Fix 5: Handle Zero Sync Auth Updates

- Make Z instance reactive to authentication changes
- Ensure Zero Sync reconnects when auth state changes
- Handle authentication failures gracefully

## Implementation Approach

The fixes will be minimal and targeted:

1. Fix the specific bugs identified in the existing code
2. Add logging and error handling for debugging
3. Ensure consistency between client and server cookie handling
4. Test that sessions persist properly after fixes
