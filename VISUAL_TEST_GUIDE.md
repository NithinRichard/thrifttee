# Visual Testing Guide 👀

## What You Should See

### 1. Homepage (http://localhost:3000)
```
✅ Loads quickly (< 1.5s)
✅ No console errors
✅ Parallax hero section
✅ Featured products grid
✅ Loading spinner if slow network
```

### 2. Products Page (http://localhost:3000/products)
```
✅ Search bar at top
✅ "Advanced Search" link below search bar  ← NEW!
✅ Product cards with images
✅ Compare button (chart icon) on each card  ← NEW!
✅ Images lazy load as you scroll  ← NEW!
```

**Look for Compare Button:**
```
[Product Card]
┌─────────────────┐
│   [Image]       │
│   Title         │
│   ₹999          │
│ [Add to Cart]   │
│ [♥] [📊]        │  ← Chart icon = Compare
└─────────────────┘
```

### 3. Product Detail Page
```
✅ Product images
✅ Product details
✅ Social share buttons (top right)  ← NEW!
   - Facebook icon
   - Twitter icon  
   - WhatsApp icon
   - Copy link icon
```

**Look for Share Buttons:**
```
Product Title
₹999  [f] [t] [w] [📋]  ← Share buttons here
      FB  TW  WA  Copy
```

### 4. Comparison Bar (Bottom of Screen)
**When you click compare on products:**
```
┌─────────────────────────────────────────────┐
│ Compare Products (2/3)        [Clear All]   │
│ ┌────────┐ ┌────────┐ ┌────────┐           │
│ │ Prod 1 │ │ Prod 2 │ │ Add    │           │
│ │  [X]   │ │  [X]   │ │ more   │           │
│ └────────┘ └────────┘ └────────┘           │
│           [Compare Now]                      │
└─────────────────────────────────────────────┘
```

### 5. Advanced Search Modal
**Click "Advanced Search" link:**
```
┌─────────────────────────────────┐
│ Advanced Search            [X]  │
├─────────────────────────────────┤
│ Keywords: [____________]        │
│                                 │
│ Min Price: [___] Max: [___]    │
│                                 │
│ Brand: [____________]           │
│                                 │
│ Condition: [Dropdown ▼]        │
│                                 │
│ Size: [Dropdown ▼]             │
│                                 │
│ [Clear All] [Apply Filters]    │
└─────────────────────────────────┘
```

### 6. Comparison Page (/compare)
```
┌─────────────────────────────────────────────┐
│ Compare Products              [← Back]      │
├─────────────────────────────────────────────┤
│ Feature    │ Product 1 │ Product 2 │ Prod 3│
├────────────┼───────────┼───────────┼───────┤
│ [Image]    │   [img]   │   [img]   │ [img] │
│ Price      │   ₹999    │   ₹1299   │ ₹799  │
│ Brand      │   Nike    │   Adidas  │ Puma  │
│ Size       │   M       │   L       │  M    │
│ Condition  │   Good    │   New     │ Fair  │
│ [Action]   │ [View]    │ [View]    │[View] │
└─────────────────────────────────────────────┘
```

### 7. PWA Install Banner (Bottom of Screen)
**After visiting site 2+ times:**
```
┌─────────────────────────────────────────────┐
│ Install ThriftTee                      [X]  │
│ Install our app for faster experience!     │
│              [Install App]                  │
└─────────────────────────────────────────────┘
```

### 8. DevTools - Network Tab
**What you should see:**
```
Name                    Size      Time
─────────────────────────────────────
main.chunk.js          500KB     200ms  ← Main bundle
HomePage.chunk.js      200KB     150ms  ← Lazy loaded
ProductsPage.chunk.js  300KB     180ms  ← Lazy loaded
vendors~chunk.js       400KB     250ms  ← Dependencies
```

### 9. DevTools - Application Tab
**Service Workers section:**
```
Service Workers
├─ http://localhost:3000
│  └─ service-worker.js
│     Status: activated and running ✅
│     Source: /service-worker.js
```

**Cache Storage section:**
```
Cache Storage
└─ thrifttee-v1
   ├─ /
   ├─ /static/css/main.css
   ├─ /static/js/main.js
   └─ /manifest.json
```

### 10. DevTools - Console
**Should NOT see:**
```
❌ Uncaught Error
❌ Failed to load resource
❌ 404 Not Found
❌ CORS error
```

**Should see (if analytics enabled):**
```
✅ SW registered
✅ Analytics initialized
✅ Page view tracked
```

---

## Color Coding

### ✅ Green = Working
- Feature visible and functional
- No errors
- Performs as expected

### ⚠️ Yellow = Warning
- Feature works but slow
- Minor visual issues
- Non-critical errors

### ❌ Red = Broken
- Feature not visible
- Console errors
- Functionality broken

---

## Quick Visual Checklist

Walk through the site and check:

1. **Homepage**
   - [ ] Loads fast
   - [ ] No errors
   - [ ] Smooth animations

2. **Products Page**
   - [ ] Compare buttons visible
   - [ ] Advanced search link visible
   - [ ] Images lazy load

3. **Product Detail**
   - [ ] Share buttons visible
   - [ ] All buttons work

4. **Comparison**
   - [ ] Bar appears when adding products
   - [ ] Comparison page works

5. **Advanced Search**
   - [ ] Modal opens
   - [ ] Filters work

6. **DevTools**
   - [ ] Chunks loading
   - [ ] Service worker registered
   - [ ] No console errors

---

## Screenshots to Take

1. **Products page with compare buttons**
2. **Comparison bar at bottom**
3. **Advanced search modal**
4. **Comparison page**
5. **Share buttons on product**
6. **Network tab showing chunks**
7. **Service worker registered**
8. **Lighthouse score 90+**

---

## Video Recording Checklist

Record a 2-minute video showing:

1. Navigate to products page (0:00-0:10)
2. Click compare on 2 products (0:10-0:20)
3. Show comparison bar (0:20-0:30)
4. Click "Compare Now" (0:30-0:40)
5. Show comparison page (0:40-0:50)
6. Go back, click Advanced Search (0:50-1:00)
7. Apply filters (1:00-1:10)
8. View product, click share (1:10-1:20)
9. Show DevTools - chunks loading (1:20-1:40)
10. Show service worker registered (1:40-2:00)

---

**Ready to test visually!** 👀

Open the app and follow this guide to verify everything looks correct.
