# Equipment Feature Fix Documentation

## Issue Identified
The Equipment Needed section was not working properly due to a schema mismatch between the Sanity backend and frontend expectations.

### Root Cause
1. **Backend**: Equipment was defined as a simple array of strings in the post schema
2. **Frontend**: Expected equipment to be references to full equipment documents with properties like name, description, affiliateLinks, etc.
3. **Missing Schema**: The equipment document type existed in the frontend but was not registered in Sanity Studio

## Fix Applied

### 1. Created Equipment Schema in Sanity
Created `/sanity/schemaTypes/equipment.js` with:
- Name, slug, category, importance fields
- Image support
- Affiliate links array for monetization
- Care instructions and alternatives
- Full equipment document structure

### 2. Registered Equipment Schema
Updated `/sanity/schemaTypes/index.ts` to import and register the equipment schema

### 3. Updated Post Schema
Modified `/sanity/schemaTypes/post.js` to:
- Change equipment field from string array to reference array
- Added equipmentLegacy field for backward compatibility (hidden in studio)

### 4. Updated Post Adapter
Enhanced `/eats-frontend/lib/adapters/post-adapter.ts` to:
- Handle both string and object equipment data
- Fall back to equipmentLegacy field if needed
- Properly clean and validate equipment data

### 5. Created Migration Script
Added `/sanity/migrations/migrate-equipment-to-references.js` to help migrate existing data

## How to Use the Fixed Equipment Feature

### For Content Editors in Sanity Studio

1. **Create Equipment Documents**:
   - Go to Sanity Studio (http://localhost:3333)
   - Navigate to the "Kitchen Equipment" section
   - Create equipment items with:
     - Name (e.g., "Large Pot", "Chef's Knife")
     - Category (Cookware, Tools, etc.)
     - Importance level (Essential, Recommended, Helpful)
     - Optional: Add images, descriptions, affiliate links

2. **Add Equipment to Recipes**:
   - Edit a recipe post
   - In the "Equipment Needed" field, click "Add item"
   - Search for and select equipment from the dropdown
   - The equipment will now show as references

### For Existing Recipes with String Equipment

#### Option 1: Manual Update
1. Create equipment documents for each string item
2. Update recipes to use the new equipment references

#### Option 2: Run Migration Script
```bash
cd sanity
# Set your Sanity write token
export SANITY_WRITE_TOKEN="your-token-here"
# Run the migration
node migrations/migrate-equipment-to-references.js
```

### Frontend Display
The `EquipmentNeededCompact` component will now:
- Display equipment with proper styling and importance indicators
- Show affiliate links when available
- Allow users to view equipment details
- Support shopping cart functionality for equipment bundles
- Gracefully handle legacy string equipment

## Testing the Fix

1. **Check Sanity Studio**:
   - Visit http://localhost:3333
   - Verify "Kitchen Equipment" document type appears
   - Create a test equipment item

2. **Test in a Recipe**:
   - Edit any recipe
   - Add equipment references
   - Publish the changes

3. **Verify Frontend Display**:
   - Visit the recipe page (e.g., http://localhost:3006/post/street-corn-pasta-salad)
   - Equipment section should display with:
     - Proper equipment names
     - Importance indicators (🔴 Essential, 🔵 Recommended, 🟢 Helpful)
     - Click functionality for items with affiliate links

## Benefits of the Fix

1. **Rich Equipment Data**: Equipment now has full metadata (images, descriptions, links)
2. **Monetization Ready**: Affiliate links can be added to equipment
3. **Better UX**: Users can see equipment details and shop for items
4. **Backward Compatible**: Existing string equipment still works
5. **Scalable**: Equipment is now reusable across recipes

## Next Steps

1. **Add Equipment Data**: Populate equipment documents in Sanity
2. **Migrate Existing Recipes**: Run migration script or manually update
3. **Add Affiliate Links**: Enhance equipment with shopping links
4. **Optimize Display**: Further customize the equipment display components

## Troubleshooting

If equipment doesn't appear:
1. Check that Sanity Studio shows the equipment schema
2. Verify equipment documents exist and are published
3. Ensure recipes reference equipment documents (not strings)
4. Clear Next.js cache: `rm -rf .next && npm run dev`
5. Check browser console for errors

If you see string equipment instead of rich data:
- This means the recipe still uses legacy string equipment
- Either run the migration or manually update the recipe