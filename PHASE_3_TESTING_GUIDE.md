# Phase 3 Testing Guide

## 🧪 Testing Checklist

### ✅ 1. Code Splitting & Performance

#### Test: Verify Code Splitting
1. Open browser DevTools (F12)
2. Go to Network tab
3. Refresh the homepage
4. **Expected**: See multiple chunk files loading:
   - `main.chunk.js` (~500KB)
   - `HomePage.chunk.js` (~200KB)
   - Other lazy-loaded chunks

#### Test: Loading States
1. Throttle network to "Slow 3G" in DevTools
2. Navigate between pages
3. **Expected**: See loading spinner while chunks load

#### Test: Performance Metrics
1. Open Lighthouse in DevTools
2. Run audit on homepage
3. **Expected Scores**:
   - Performance: 90+
   - PWA: 100
   - Accessibility: 95+
   - Best Practices: 92+
   - SEO: 98+

---

### ✅ 2. Lazy Loading Images

#### Test: Image Lazy Loading
1. Open Network tab in DevTools
2. Load products page
3. Scroll slowly down the page
4. **Expected**: Images load only when scrolling near them
5. **Check**: "lazy" attribute on img tags in Elements tab

#### Test: Placeholder Behavior
1. Scroll quickly through products
2. **Expected**: Smooth fade-in as images load
3. **Expected**: No layout shift (CLS score)

---

### ✅ 3. Social Sharing

#### Test: Share Buttons
1. Go to any product detail page
2. Find social share buttons (top right near price)
3. **Expected**: See Facebook, Twitter, WhatsApp, Copy Link buttons

#### Test: Facebook Share
1. Click Facebook button
2. **Expected**: Opens Facebook share dialog in popup
3. **Expected**: Product title and image in preview

#### Test: Twitter Share
1. Click Twitter button
2. **Expected**: Opens Twitter share dialog
3. **Expected**: Product title in tweet text

#### Test: WhatsApp Share
1. Click WhatsApp button (mobile or desktop)
2. **Expected**: Opens WhatsApp with product link

#### Test: Copy Link
1. Click copy link button
2. **Expected**: Button shows checkmark
3. **Expected**: Link copied to clipboard
4. Paste in notepad to verify

---

### ✅ 4. Product Comparison

#### Test: Add to Comparison
1. Go to products page
2. Find compare button on product cards (chart icon)
3. Click compare on 1-3 products
4. **Expected**: Sticky bar appears at bottom
5. **Expected**: Shows selected products

#### Test: Comparison Bar
1. Add 2-3 products to comparison
2. **Expected**: See sticky bar with product thumbnails
3. **Expected**: "Compare Now" button appears
4. **Expected**: Can remove products with X button

#### Test: Comparison Page
1. Add 2-3 products to comparison
2. Click "Compare Now"
3. **Expected**: Navigate to /compare page
4. **Expected**: See side-by-side comparison table
5. **Expected**: Compare: price, brand, size, condition, etc.

#### Test: Comparison Persistence
1. Add products to comparison
2. Refresh page
3. **Expected**: Comparison bar still shows products (localStorage)

#### Test: Maximum Limit
1. Try adding 4th product
2. **Expected**: Alert "Maximum 3 products can be compared"

---

### ✅ 5. Advanced Search

#### Test: Open Advanced Search
1. Go to products page
2. Click "Advanced Search" link below search bar
3. **Expected**: Modal opens with filter form

#### Test: Filter Options
1. Open advanced search modal
2. **Expected**: See fields for:
   - Keywords
   - Min/Max Price
   - Brand
   - Condition dropdown
   - Size dropdown

#### Test: Apply Filters
1. Enter filters (e.g., price 500-2000, size M)
2. Click "Apply Filters"
3. **Expected**: Modal closes
4. **Expected**: Products filtered on page
5. **Expected**: URL updates with filters

#### Test: Clear Filters
1. Apply some filters
2. Click "Clear All" in modal
3. **Expected**: All fields reset
4. **Expected**: Shows all products

---

### ✅ 6. Service Worker & PWA

#### Test: Service Worker Registration
1. Open DevTools → Application tab
2. Go to Service Workers section
3. **Expected**: See service worker registered
4. **Expected**: Status: "activated and running"

#### Test: Cache Storage
1. In Application tab → Cache Storage
2. **Expected**: See "thrifttee-v1" cache
3. **Expected**: Cached files listed (CSS, JS, images)

#### Test: Offline Mode
1. Load homepage
2. In DevTools → Network tab, check "Offline"
3. Refresh page
4. **Expected**: Page still loads from cache
5. **Expected**: Basic functionality works

#### Test: PWA Install Prompt
1. Visit site on mobile or desktop Chrome
2. **Expected**: See install banner at bottom
3. Click "Install App"
4. **Expected**: App installs to home screen/desktop

#### Test: Installed PWA
1. Install the PWA
2. Open from home screen/desktop
3. **Expected**: Opens in standalone mode (no browser UI)
4. **Expected**: Custom splash screen with logo
5. **Expected**: Theme color matches brand

---

### ✅ 7. Analytics Tracking

#### Test: Google Analytics Setup
1. Create `.env` file with:
   ```
   REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
2. Restart dev server
3. **Expected**: No console errors

#### Test: Page View Tracking
1. Open browser console
2. Navigate between pages
3. **Expected**: See gtag events in console (if debug mode)
4. Check GA4 Real-time dashboard
5. **Expected**: See page views in real-time

#### Test: Add to Cart Tracking
1. Add product to cart
2. Check GA4 Real-time → Events
3. **Expected**: See "add_to_cart" event
4. **Expected**: Event includes product details

#### Test: Product View Tracking
1. View product detail page
2. Check GA4 Real-time → Events
3. **Expected**: See "view_item" event

---

### ✅ 8. SEO & Meta Tags

#### Test: Open Graph Tags
1. View page source (Ctrl+U)
2. Search for "og:title"
3. **Expected**: See Open Graph meta tags:
   - og:title
   - og:description
   - og:image
   - og:url

#### Test: Twitter Cards
1. View page source
2. Search for "twitter:card"
3. **Expected**: See Twitter Card meta tags

#### Test: Social Share Preview
1. Use Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
2. Enter your product URL
3. **Expected**: See correct title, description, image

---

## 🐛 Common Issues & Solutions

### Issue: Code splitting not working
**Solution**: Clear browser cache and rebuild
```bash
npm run build
```

### Issue: Service worker not updating
**Solution**: 
1. DevTools → Application → Service Workers
2. Click "Unregister"
3. Hard refresh (Ctrl+Shift+R)

### Issue: Images not lazy loading
**Solution**: Check browser support for loading="lazy"
- Works in Chrome 77+, Firefox 75+, Safari 15.4+

### Issue: Analytics not tracking
**Solution**: 
1. Verify GA_MEASUREMENT_ID in .env
2. Check browser console for errors
3. Disable ad blockers

### Issue: PWA install prompt not showing
**Solution**: 
1. Must be HTTPS (or localhost)
2. Must have valid manifest.json
3. Must have service worker
4. User must visit site 2+ times

---

## 📊 Performance Benchmarks

### Before Phase 3
- Load Time: 3.5s
- Bundle Size: 2.5MB
- Lighthouse: 72

### After Phase 3 (Expected)
- Load Time: 1.2s (-66%)
- Bundle Size: 500KB main + chunks (-80%)
- Lighthouse: 94+ (+22 points)

---

## ✅ Quick Test Commands

### Run Development Server
```bash
cd thrift-frontend
npm start
```

### Build Production
```bash
npm run build
```

### Test Production Build
```bash
npm install -g serve
serve -s build
```

### Run Lighthouse Audit
```bash
npm install -g lighthouse
lighthouse http://localhost:3000 --view
```

---

## 📱 Mobile Testing

### iOS Safari
1. Open site on iPhone
2. Tap Share → Add to Home Screen
3. **Expected**: PWA installs
4. Test offline mode

### Android Chrome
1. Open site on Android
2. Tap "Install" banner
3. **Expected**: PWA installs
4. Test offline mode

---

## 🎯 Success Criteria

- [ ] All chunks load correctly
- [ ] Images lazy load on scroll
- [ ] Social sharing works on all platforms
- [ ] Product comparison functional
- [ ] Advanced search filters products
- [ ] Service worker caches assets
- [ ] PWA installs successfully
- [ ] Analytics tracks all events
- [ ] Lighthouse score 90+
- [ ] No console errors

---

## 📝 Test Results Template

```
Date: ___________
Tester: ___________

Feature Tests:
[ ] Code Splitting - PASS/FAIL
[ ] Lazy Loading - PASS/FAIL
[ ] Social Sharing - PASS/FAIL
[ ] Product Comparison - PASS/FAIL
[ ] Advanced Search - PASS/FAIL
[ ] Service Worker - PASS/FAIL
[ ] PWA Install - PASS/FAIL
[ ] Analytics - PASS/FAIL

Performance:
- Load Time: _____s
- Lighthouse Score: _____
- Bundle Size: _____KB

Issues Found:
1. ___________
2. ___________

Notes:
___________
```

---

**Ready to test!** Start with the checklist above and mark items as you test them.
