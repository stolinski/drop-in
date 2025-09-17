# 📦 **Drop-in Monorepo Publishing Guide**

## 🎯 **Publishing Single Package Changes**

### **When you only modify @drop-in/pass:**

#### 1️⃣ **Create a Changeset**
```bash
pnpm changeset
```
- Select **only** `@drop-in/pass`
- Choose bump type (patch/minor/major)
- Write clear description

#### 2️⃣ **Preview Changes** (Optional but Recommended)
```bash
pnpm run release:preview
```
This shows what versions will be bumped without publishing.

#### 3️⃣ **Build & Publish**
```bash
pnpm run release
```
This builds and publishes only changed packages.

## 🔄 **Complete Workflow Example**

```bash
# 1. Make your changes to @drop-in/pass
# 2. Run tests
pnpm -F @drop-in/pass test

# 3. Create changeset
pnpm changeset
# Select: @drop-in/pass, patch, "Add comprehensive testing and docs"

# 4. Preview (optional)
pnpm run release:preview
# Check: Only @drop-in/pass version bumped

# 5. Publish
pnpm run release
# Result: Only @drop-in/pass gets published to npm
```

## 🏗️ **Dependency Chain Handling**

Changesets automatically handles workspace dependencies:

- If you change `@drop-in/pass` 
- And `@drop-in/ramps` depends on it via `workspace:^`
- Changesets will **automatically bump @drop-in/ramps** too
- Both packages get published together

## 🛠️ **Available Scripts**

```bash
# Create a changeset (interactive)
pnpm changeset

# Apply version bumps (updates package.json files)
pnpm changeset:version

# Publish changed packages
pnpm changeset:publish

# Build and publish in one step
pnpm run release

# Preview what will be published (doesn't publish)
pnpm run release:preview
```

## ⚠️ **Important Notes**

1. **Always create changesets** - Don't manually bump versions
2. **Review preview** - Check which packages will be published
3. **Workspace dependencies** - Are automatically handled
4. **Build before publish** - `pnpm run release` handles this
5. **Git commits** - Changesets creates proper commit messages

## 🔍 **Troubleshooting**

### **"Nothing to publish"**
- You forgot to create a changeset: `pnpm changeset`

### **Wrong packages being published**
- Check workspace dependencies in package.json files
- Use `pnpm run release:preview` to see what will happen

### **Version conflicts**
- Run `pnpm changeset:version` to see conflicts
- Resolve manually and run again

### **Build failures**
- Check individual package builds: `pnpm -F @drop-in/pass build`
- Fix TypeScript errors before publishing

## 🎯 **Your Setup is Good!**

✅ **Changesets** - Perfect for monorepo versioning  
✅ **PNPM workspaces** - Efficient dependency management  
✅ **Workspace references** - `workspace:^` pattern is correct  
✅ **Turbo** - Good for coordinated builds  

The main issue was missing `publishConfig.access: "public"` in package.json files, which I've fixed above.