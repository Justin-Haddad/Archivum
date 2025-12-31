# TMDB API Usage Rules & Guidelines

## ⚠️ Important Rules You Must Follow

### 1. **Rate Limits** (Critical!)
- **40 requests per 10 seconds** (free tier)
- **100,000 requests per day** (free tier)
- If you exceed these limits, you'll get a `429 Too Many Requests` error
- **Solution**: Implement request throttling/caching in your app

### 2. **Attribution Required** ⭐ (MANDATORY)
You **MUST** display TMDB attribution in your app:

**Required Text:**
> "This product uses the TMDB API but is not endorsed or certified by TMDB."

**Where to display:**
- In your app's "About" or "Credits" section
- Footer of your website
- Settings/Info page
- Anywhere users can see it

**TMDB Logo:**
- You should also display the TMDB logo if possible
- Get the logo from: https://www.themoviedb.org/about/logos-attribution

### 3. **API Key Security** 🔒
- **NEVER** commit your API key to Git/GitHub
- Keep it in `.env` file (which should be in `.gitignore`)
- **NEVER** expose it in client-side code that's publicly accessible
- If your key is exposed, revoke it immediately and get a new one

### 4. **Commercial Use**
- **Free tier**: Only for **non-commercial** projects
- **Commercial projects** (making money): Need to contact TMDB for a commercial license
- Contact: https://www.themoviedb.org/contact

### 5. **Data Usage**
- TMDB data is community-contributed and may have errors
- You're responsible for data accuracy in your app
- Don't claim TMDB data as your own

### 6. **Image Usage**
- Movie posters/images from TMDB can be used
- Must attribute TMDB as the source
- Images are subject to copyright of the original studios

### 7. **Caching & Performance**
- **Recommended**: Cache API responses to reduce requests
- Don't make unnecessary duplicate requests
- Use efficient search queries

---

## ✅ Best Practices

### Do's:
- ✅ Cache search results
- ✅ Implement request throttling
- ✅ Show TMDB attribution
- ✅ Handle rate limit errors gracefully
- ✅ Keep API key secure
- ✅ Use appropriate image sizes (don't request full-size images if you don't need them)

### Don'ts:
- ❌ Don't spam the API with requests
- ❌ Don't expose your API key
- ❌ Don't use for commercial purposes without a license
- ❌ Don't forget attribution
- ❌ Don't cache data indefinitely (refresh periodically)

---

## 🛡️ How to Handle Rate Limits in Your App

Your current implementation should handle this, but here's what happens:

```javascript
// If you hit rate limits, you'll get:
// Status: 429 Too Many Requests
// Response: { "status_code": 25, "status_message": "Your request count is over the allowed limit." }
```

**What to do:**
1. Show a user-friendly message: "Too many requests. Please try again in a moment."
2. Implement exponential backoff (wait longer between retries)
3. Cache results to avoid repeated requests

---

## 📋 Quick Checklist

Before going live, make sure:

- [ ] TMDB attribution is displayed in your app
- [ ] API key is in `.env` file (not committed to Git)
- [ ] Rate limiting is handled gracefully
- [ ] Error messages are user-friendly
- [ ] You're not using it commercially (or have a commercial license)

---

## 🔗 Official Resources

- **TMDB API Docs**: https://developer.themoviedb.org/docs
- **Terms of Service**: https://www.themoviedb.org/terms-of-use
- **API Status**: https://status.themoviedb.org/
- **Support**: https://www.themoviedb.org/contact

---

## 💡 For Your Archivum App

Since you're building a personal media tracking app:

1. **Add attribution** to your footer or About page
2. **Keep API key secure** in `.env` file
3. **Implement caching** to reduce API calls
4. **Handle errors** gracefully (show user-friendly messages)

**Example attribution in your app footer:**
```html
<div className="tmdb-attribution">
  <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
</div>
```

---

## 🤖 AI & Machine Learning Restrictions

**IMPORTANT:** TMDB explicitly prohibits using their data to:
- Train or validate machine learning/AI systems
- Develop or enhance AI models
- Use in large language models or chatbots

**What this means for recommendations:**
- ✅ You CAN use your own user data (ratings, watch history) to build recommendations
- ✅ You CAN use TMDB API to fetch movie details for display
- ❌ You CANNOT use TMDB data to train your recommendation algorithm

**See `AI_RECOMMENDATIONS_GUIDE.md` for detailed guidance on building compliant AI recommendations.**

---

## ⚖️ Legal Note

This is a summary of common rules. Always refer to TMDB's official Terms of Service for the most up-to-date and legally binding information.

