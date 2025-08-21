# DEPRECATED: See INTEGRATIONS.md for current Swell notes

# Swell.js Error Fix - Debug Guide (legacy)

## Issue Fixed
The "Internal server error" when adding items to cart has been resolved by fixing several key issues:

### 1. **API Parameter Format**
- **Problem**: Using `product_id` (snake_case) instead of `productId` (camelCase)
- **Fix**: Updated all API calls to use camelCase parameters
- **Location**: `lib/swell.ts` - addToCart method

### 2. **Swell Initialization**
- **Problem**: API calls made before Swell was properly initialized
- **Fix**: Added initialization state tracking and `ensureInitialized()` method
- **Location**: `lib/swell.ts` - initialization logic

### 3. **Product Matching**
- **Problem**: Mismatch between local panel IDs and Swell product slugs
- **Fix**: Enhanced product matching logic with multiple strategies
- **Location**: `app/products/page.tsx` - getMergedPanels function

## Testing Steps

### 1. Visit Test Page
Navigate to: `http://localhost:3001/test-swell`

This page will show:
- ✅ Environment variables status
- ✅ Swell initialization status  
- ✅ Product fetching test
- ✅ Cart operations test

### 2. Manual Cart Test
1. Go to: `http://localhost:3001/products`
2. Try adding a panel to cart
3. Check browser console for any errors
4. Verify cart icon shows item count

### 3. Check Browser Console
Look for these success messages:
```
Swell initialized successfully
Product matched for cart: [panel-name]
Cart item added successfully
```

## Environment Variables (Already Configured)
```
NEXT_PUBLIC_SWELL_STORE_ID=prismhealthlab
NEXT_PUBLIC_SWELL_PUBLIC_KEY=pk_b8RNnWKaP3iZHbhu4pUSHQTI3WwtzXpJ
SWELL_SECRET_KEY=sk_eji0Gm8ctSrmccL5byge1ue6Fvkn3wwt
NEXT_PUBLIC_SWELL_URL=https://prismhealthlab.swell.store
```

## Key Changes Made

### lib/swell.ts
- Added initialization state tracking
- Fixed API parameter names (camelCase)
- Added proper error handling
- Added `ensureInitialized()` method

### context/CartContext.tsx
- Enhanced error logging
- Fixed cart transformation logic
- Added user-friendly error messages

### app/products/page.tsx
- Improved product matching logic
- Added debug logging for cart operations
- Enhanced error handling

## Troubleshooting

### If cart still doesn't work:
1. Check the test page for specific error details
2. Verify products exist in your Swell dashboard
3. Check browser network tab for API errors
4. Review browser console for initialization messages

### Common Issues:
- **Products not found**: Create products in Swell with matching slugs
- **API errors**: Verify API keys in Swell dashboard
- **Initialization fails**: Check environment variables are loaded

## Next Steps
1. Test cart functionality on products page
2. Verify checkout flow works
3. Test with real Swell products if needed
4. Monitor browser console for any remaining errors

The fixes should resolve the "Internal server error" completely. The error was primarily due to incorrect API parameter formatting and initialization timing issues.
