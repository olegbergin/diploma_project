# Debugging: Schedule Exceptions Not Loading

**Date:** November 23, 2025
**Status:** 🔴 STUCK - Investigating why schedule_exceptions not returned by API

---

## 🎯 The Problem

Schedule exceptions (holidays, closures, special hours) are **not loading** in the Business Edit page, even though:
- ✅ Data exists in the database
- ✅ Backend code has been updated to select and return it
- ✅ Frontend code is ready to parse and display it

---

## 📊 What We Know

### Database State
- **Column exists:** `schedule_exceptions` column is in the `businesses` table
- **Data exists:** Example data found:
  ```json
  [{"id":"1763863937484-5rr3xv3pl","type":"closure","title":"חופש","startDate":"2025-11-26","endDate":"2025-11-27","reason":"vacation","customHours":null,"description":""}]
  ```

### API Response (Problem!)
When calling `GET /api/businesses/11`, the response includes:
```json
{
  "businessId": 11,
  "id": 11,
  "ownerId": 23,
  "business_name": "ציפי ציפורניים",
  "name": "ציפי ציפורניים",
  // ... many other fields ...
  "owner_name": "NewOwner1 Biz",     // ← Not in our query!
  "average_rating": "4.0",           // ← Not in our query!
  "total_reviews": 4,                // ← Not in our query!
  "services": [...]                  // ← Not in our query!
  // ❌ NO schedule_exceptions field!
}
```

### The Mystery
The response contains fields that **our controller doesn't return**:
- `owner_name` (from users table JOIN)
- `average_rating` (from reviews aggregation)
- `total_reviews` (from reviews count)
- `services` (array of services)
- Duplicate fields: `businessId` AND `id`, `business_name` AND `name`, etc.

**This proves a different endpoint or middleware is handling the request!**

---

## 🔍 What We've Tried

### 1. Updated Backend Controller ✅
**File:** `backend/controllers/businessController.js`

```javascript
exports.getBusinessById = async (req, res) => {
  console.log('🚀 getBusinessById CALLED - ID:', req.params.id);

  const [rows] = await connection.query(
    "SELECT business_id, owner_id, name, category, description, location, city, photos, schedule, schedule_exceptions, created_at FROM businesses WHERE business_id = ? AND status = 'approved'",
    [req.params.id]
  );

  if (rows.length > 0) {
    const business = rows[0];
    console.log('🔍 DEBUG - schedule_exceptions:', business.schedule_exceptions);

    // Ensure schedule_exceptions is always present
    if (!business.schedule_exceptions) {
      business.schedule_exceptions = '[]';
    }

    res.json(business);
  }
}
```

**Problem:** The 🚀 rocket emoji **NEVER appears** in logs!

### 2. Verified Controller Loads ✅
Added at top of `businessController.js`:
```javascript
console.log('🔥🔥🔥 businessController.js LOADED with schedule_exceptions fix! 🔥🔥🔥');
```

**Result:** 🔥 Fire emoji **DOES appear** on server start - controller loads correctly!

### 3. Updated updateBusiness ✅
The save endpoint was fixed to include `schedule_exceptions`:
```javascript
schedule_exceptions = ?
```
This saves correctly (data exists in DB).

### 4. Checked Frontend Request ✅
- **URL:** `http://localhost:3031/api/businesses/11`
- **Method:** GET
- **Expected route:** `/api/businesses/:id` → `businessController.getBusinessById`

---

## 🤔 The Smoking Gun

**Evidence that a different code path is being used:**

1. **No logs appear** when page loads (rocket emoji never shows)
2. **Response contains extra fields** not in our query:
   - `owner_name` (requires JOIN with users table)
   - `average_rating` (requires aggregation of reviews)
   - `services` (requires separate query or JOIN)
3. **Field name transformations** happening:
   - Snake_case → camelCase (e.g., `business_id` → `businessId`)
   - Duplicate aliases (both `id` and `businessId`)

---

## 🎯 Hypotheses

### Theory 1: Different Endpoint
There might be another route handling `/businesses/:id` that we haven't found:
- Middleware intercepting the request?
- Route defined elsewhere (not in `businesses.js`)?
- Express router priority issue?

### Theory 2: Response Serializer/Transformer
Something is transforming the response:
- Axios interceptor on frontend? (Checked - No)
- Express middleware on backend? (Not found yet)
- Database view instead of table? (business_review_stats exists but doesn't have all these fields)

### Theory 3: Cached Response
- Frontend caching the old response?
- Service worker?
- Browser cache despite hard refresh?

### Theory 4: Multiple Backend Servers
- Old backend process still running?
- Different port being used?
- Old code responding to requests?

---

## 📝 Debugging Steps Taken

1. ✅ Added extensive logging to `getBusinessById`
2. ✅ Verified controller file loads (🔥 emoji)
3. ✅ Explicitly listed columns in SELECT query
4. ✅ Added fallback for NULL schedule_exceptions
5. ✅ Restarted backend multiple times
6. ✅ Checked for multiple backend processes
7. ✅ Verified request URL in Network tab
8. ❌ **Never saw the 🚀 emoji** - endpoint not being called!

---

## 🚀 Next Steps

### Immediate Actions

1. **Find the REAL endpoint handling this request:**
   ```bash
   # Search for routes with owner_name or services
   grep -r "owner_name" backend/
   grep -r "SELECT.*services" backend/
   grep -r "LEFT JOIN.*users" backend/
   ```

2. **Check for middleware:**
   ```bash
   grep -r "app.use" backend/src/
   grep -r "router.use" backend/routes/
   ```

3. **Verify route registration order:**
   - Check `backend/src/app.js` for route order
   - Routes registered first take precedence

4. **Add logging to ALL business routes:**
   - Log in `businesses.js` router file itself
   - See which route actually handles the request

5. **Check for API Gateway/Proxy:**
   - Is there nginx, API Gateway, or other proxy?
   - Could be routing to old code

### Questions to Answer

- [ ] Which route is ACTUALLY handling `/api/businesses/11`?
- [ ] Where are `owner_name`, `services`, and `average_rating` coming from?
- [ ] Why is our `getBusinessById` never called (no 🚀)?
- [ ] Is there a serializer/transformer we haven't found?
- [ ] Are there multiple versions of the backend code?

---

## 📂 Files Modified (All Committed)

**Backend:**
- `backend/controllers/businessController.js` - Added schedule_exceptions
- `backend/controllers/appointmentController.js` - Fixed local dates
- `backend/utils/scheduleUtils.js` - Schedule/exception utilities
- `backend/migrations/add_schedule_exceptions.sql` - DB migration

**Frontend:**
- `frontend/src/components/BusinessEditPage/BusinessEditPage.jsx` - Debug logging
- `frontend/src/components/BookingPage/BookingPageSingleScreen.jsx` - New booking page
- `frontend/src/utils/dateUtils.js` - Date utilities
- `frontend/src/utils/exceptionUtils.js` - Exception utilities

---

## 🎓 Lessons Learned

1. **Logs are critical** - Without them, we can't tell if code runs
2. **API responses reveal the truth** - The extra fields told us our code isn't running
3. **Multiple servers are dangerous** - Always verify which process handles requests
4. **Route precedence matters** - Order of route registration affects which fires

---

## 💡 Recommended Investigation

**Priority 1:** Find where `owner_name` and `services` are added
```bash
cd backend
grep -r "owner_name" . --include="*.js" | grep -v node_modules
grep -r "services.*business" . --include="*.js" | grep -v node_modules
```

**Priority 2:** Add route-level logging
```javascript
// In backend/routes/businesses.js
router.get("/:id", (req, res, next) => {
  console.log('🎯 Route businesses/:id HIT - ID:', req.params.id);
  next();
}, businessController.getBusinessById);
```

**Priority 3:** Check if there's a global response transformer
```javascript
// Look for this pattern in app.js or middleware
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function(data) {
    // Transform data here?
    originalJson.call(this, transformedData);
  };
  next();
});
```

---

**Status:** Waiting for investigation into route handling
**Blocker:** Cannot proceed until we find which code actually handles the request
**Impact:** Schedule exceptions feature is non-functional

---

*Last Updated: 2025-11-23 02:56 UTC*
