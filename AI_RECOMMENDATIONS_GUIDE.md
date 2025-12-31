# AI Recommendations & TMDB Compliance Guide

## ⚠️ Important TMDB Restriction

**TMDB explicitly prohibits:**
- Using their data to **train or validate** machine learning/AI systems
- Using their data to develop or enhance AI models
- Using their data for large language models or chatbots

**This means:** You **CANNOT** use TMDB data to train your recommendation algorithm.

---

## ✅ What You CAN Do (Compliant Approach)

### 1. **Use Your Own User Data for Recommendations**
- ✅ Use user's **watch history** (stored in your database)
- ✅ Use user's **ratings** (1-10 stars from your library)
- ✅ Use user's **preferences** (genres, years, etc.)
- ✅ Build recommendation algorithms based on **your own data**

### 2. **Use TMDB Data Only for Display**
- ✅ Fetch movie/show **information** to display recommendations
- ✅ Get **posters and images** for recommended items
- ✅ Show **metadata** (year, description, etc.)
- ✅ Use TMDB as a **data source**, not a **training source**

---

## 🎯 Compliant Recommendation Strategy

### How It Works:

```
User's Watch History (Your Database)
    ↓
Your Recommendation Algorithm (Trained on YOUR data)
    ↓
Generate List of Recommended Movie IDs
    ↓
Fetch Movie Details from TMDB (for display only)
    ↓
Show Recommendations to User
```

### Example Implementation:

```javascript
// ✅ ALLOWED: Use your own data to find similar users/items
function getRecommendations(userId) {
  // 1. Get user's library from YOUR database
  const userLibrary = await getUserLibrary(userId);
  
  // 2. Find similar users based on YOUR data
  const similarUsers = findSimilarUsers(userLibrary);
  
  // 3. Generate recommendations based on YOUR data
  const recommendedMovieIds = generateRecommendations(similarUsers);
  
  // 4. Fetch movie details from TMDB (for display only)
  const recommendations = await Promise.all(
    recommendedMovieIds.map(id => fetchMovieFromTMDB(id))
  );
  
  return recommendations;
}
```

---

## ❌ What You CANNOT Do

```javascript
// ❌ PROHIBITED: Training AI with TMDB data
const trainingData = await fetchAllMoviesFromTMDB(); // NO!
const model = trainAI(trainingData); // This violates terms

// ❌ PROHIBITED: Using TMDB data to build recommendation models
const movieFeatures = extractFeaturesFromTMDB(); // NO!
const recommendations = aiModel.predict(movieFeatures); // Violates terms
```

---

## 💡 Recommended Approaches

### Option 1: Collaborative Filtering (Best for Your App)
- Use **your users' ratings** to find similar users
- Recommend what similar users liked
- **No TMDB training data needed**
- **Fully compliant**

### Option 2: Content-Based Filtering
- Analyze **genres, years, ratings** from your library
- Recommend similar items
- Use TMDB only to **fetch** movie details
- **Compliant** if you don't train on TMDB data

### Option 3: Hybrid Approach
- Combine collaborative + content-based
- Use **your library data** for both
- TMDB only for fetching display data
- **Compliant**

### Option 4: Simple Rule-Based (Easiest)
- "Users who liked X also liked Y"
- Based on **your database** patterns
- TMDB for fetching movie info
- **Fully compliant**

---

## 🔧 Implementation Example

Here's how you could implement compliant recommendations:

```javascript
// In your backend or context
async function getRecommendations(userId) {
  // 1. Get user's library from YOUR Supabase database
  const { data: userLibrary } = await supabase
    .from('user_library')
    .select('*')
    .eq('user_id', userId);
  
  // 2. Find users with similar tastes (using YOUR data)
  const similarUsers = await findSimilarUsers(userId, userLibrary);
  
  // 3. Get movies they liked that current user hasn't seen
  const recommendedIds = await getRecommendedMovieIds(
    userId, 
    similarUsers, 
    userLibrary
  );
  
  // 4. Fetch movie details from TMDB (for display only)
  const recommendations = [];
  for (const movieId of recommendedIds) {
    const movie = await fetchMovieFromTMDB(movieId);
    recommendations.push(movie);
  }
  
  return recommendations;
}

// Helper: Find similar users based on YOUR data
async function findSimilarUsers(userId, userLibrary) {
  // Get all users' libraries from YOUR database
  const { data: allLibraries } = await supabase
    .from('user_library')
    .select('*');
  
  // Calculate similarity based on ratings/genres
  // This uses YOUR data, not TMDB training data
  return calculateSimilarity(userLibrary, allLibraries);
}
```

---

## ✅ Compliance Checklist

- [ ] Recommendation algorithm uses **only your database** (user ratings, watch history)
- [ ] TMDB API is used **only to fetch movie details** for display
- [ ] No TMDB data is used to **train** any AI/ML models
- [ ] Attribution is displayed (already done in your footer)
- [ ] Rate limits are respected

---

## 🚨 If You Want to Use TMDB Data for Training

If you absolutely need to use TMDB data for AI training:

1. **Contact TMDB directly**: https://www.themoviedb.org/contact
2. **Request written permission** for AI/ML use
3. **Get commercial license** if needed
4. **Wait for approval** before proceeding

---

## 📊 Summary

| Action | Allowed? | Notes |
|--------|----------|-------|
| Use your user data for recommendations | ✅ Yes | Your database, your data |
| Fetch movie details from TMDB | ✅ Yes | For display only |
| Train AI on TMDB data | ❌ No | Requires written permission |
| Use TMDB data in ML models | ❌ No | Prohibited without consent |
| Build recommendations from your library | ✅ Yes | Fully compliant |

---

## 🎯 Bottom Line

**You CAN build AI recommendations**, but:
- ✅ Use **your users' data** (ratings, watch history) to train/find patterns
- ✅ Use **TMDB API** only to fetch movie information for display
- ❌ Don't use **TMDB data** to train your recommendation algorithm

This approach is **fully compliant** and will work great for your app!

