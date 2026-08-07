const supabase = require('../config/db');

// Stopwords to filter out from keyword matching
const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'it', 'this', 'that', 'was', 'were',
  'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
  'ought', 'used', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves',
  'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself',
  'she', 'her', 'hers', 'herself', 'its', 'itself', 'they', 'them', 'their',
  'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'when', 'where',
  'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
  'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than',
  'too', 'very', 'just', 'also', 'now', 'here', 'there', 'then', 'once',
  'lost', 'found', 'item', 'items'
]);

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Calculate similarity score between two strings (0-100)
 */
function stringSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;

  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 100;

  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 100;

  const distance = levenshteinDistance(s1, s2);
  return Math.round((1 - distance / maxLen) * 100);
}

/**
 * Extract keywords from text
 */
function extractKeywords(text) {
  if (!text) return new Set();

  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOPWORDS.has(word));

  return new Set(words);
}

/**
 * Calculate Jaccard similarity between two sets of keywords (0-100)
 */
function jaccardSimilarity(set1, set2) {
  if (set1.size === 0 && set2.size === 0) return 0;
  if (set1.size === 0 || set2.size === 0) return 0;

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return Math.round((intersection.size / union.size) * 100);
}

/**
 * Calculate date proximity score (0-100)
 * Full score if within 7 days, decreases after
 */
function dateProximityScore(date1, date2) {
  if (!date1 || !date2) return 50; // Neutral score if dates missing

  const d1 = new Date(date1);
  const d2 = new Date(date2);

  const diffDays = Math.abs(d1 - d2) / (1000 * 60 * 60 * 24);

  if (diffDays <= 7) return 100;
  if (diffDays <= 14) return 80;
  if (diffDays <= 30) return 60;
  if (diffDays <= 60) return 40;
  return 20;
}

/**
 * Calculate match score between a lost item and a found item
 */
function calculateMatchScore(lostItem, foundItem) {
  const details = {};

  // 1. Category match (required - if not same category, return 0)
  if (lostItem.categoryid !== foundItem.categoryid) {
    return { score: 0, details: { categoryMatch: false } };
  }
  details.categoryMatch = true;

  // 2. Location similarity (0-100)
  details.locationScore = stringSimilarity(lostItem.location, foundItem.location);

  // 3. Date proximity (0-100)
  details.dateScore = dateProximityScore(lostItem.datelost, foundItem.datelost);

  // 4. Keyword overlap in title + description (0-100)
  const lostKeywords = extractKeywords(`${lostItem.title} ${lostItem.description}`);
  const foundKeywords = extractKeywords(`${foundItem.title} ${foundItem.description}`);
  details.keywordScore = jaccardSimilarity(lostKeywords, foundKeywords);
  details.matchingKeywords = [...lostKeywords].filter(k => foundKeywords.has(k));

  // Weighted score calculation
  // Category: 40 points (already confirmed)
  // Location: 25 points
  // Date: 15 points
  // Keywords: 20 points
  const score = Math.round(
    40 + // Category match
    (details.locationScore * 0.25) +
    (details.dateScore * 0.15) +
    (details.keywordScore * 0.20)
  );

  return { score, details };
}

/**
 * Enhance match score using AI for borderline matches (40-70 score)
 */
async function enhanceWithAI(lostItem, foundItem, ruleScore) {
  // Check if OpenRouter API key is available
  if (!process.env.OPENROUTER_API_KEY) {
    console.log('No OpenRouter API key found, skipping AI enhancement');
    return ruleScore;
  }

  try {
    const prompt = `Rate the similarity between these lost and found item descriptions on a scale of 0-100.

LOST ITEM:
Title: ${lostItem.title}
Description: ${lostItem.description || 'N/A'}
Location: ${lostItem.location}
Category: ${lostItem.categories?.name || 'Unknown'}

FOUND ITEM:
Title: ${foundItem.title}
Description: ${foundItem.description || 'N/A'}
Location: ${foundItem.location}
Category: ${foundItem.categories?.name || 'Unknown'}

Consider: item type, color, brand, distinguishing features, location context.
Return ONLY a number between 0-100, nothing else.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.SUPABASE_URL || 'http://localhost:3000',
        'X-Title': 'Campus Lost and Found'
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 10,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      console.error('AI enhancement failed:', response.status);
      return ruleScore;
    }

    const data = await response.json();
    const aiScore = parseInt(data.choices?.[0]?.message?.content?.trim() || '0', 10);

    if (isNaN(aiScore) || aiScore < 0 || aiScore > 100) {
      return ruleScore;
    }

    // Blend rule-based score (60%) with AI score (40%)
    const enhancedScore = Math.round((ruleScore * 0.6) + (aiScore * 0.4));
    console.log(`AI enhancement: rule=${ruleScore}, ai=${aiScore}, final=${enhancedScore}`);

    return enhancedScore;
  } catch (error) {
    console.error('AI enhancement error:', error.message);
    return ruleScore;
  }
}

/**
 * Find potential matches for a newly created item
 * @param {string} newItemId - The ID of the newly created item
 * @returns {Promise<Array>} - Array of matches found
 */
async function findMatchesForItem(newItemId) {
  try {
    // Get the new item with category info
    const { data: newItem, error: newError } = await supabase
      .from('items')
      .select(`
        id,
        title,
        description,
        status,
        location,
        datelost,
        categoryid,
        userid,
        categories (name)
      `)
      .eq('id', newItemId)
      .single();

    if (newError || !newItem) {
      console.error('Error fetching new item:', newError);
      return [];
    }

    // Determine which status to match against
    const oppositeStatus = newItem.status === 'lost' ? 'found' : 'lost';

    // Find candidate items (opposite status, same category, not claimed/resolved)
    const { data: candidates, error: candError } = await supabase
      .from('items')
      .select(`
        id,
        title,
        description,
        status,
        location,
        datelost,
        categoryid,
        userid,
        categories (name)
      `)
      .eq('status', oppositeStatus)
      .eq('categoryid', newItem.categoryid)
      .is('claimedby', null);

    if (candError) {
      console.error('Error fetching candidates:', candError);
      return [];
    }

    if (!candidates || candidates.length === 0) {
      console.log('No candidate items found for matching');
      return [];
    }

    console.log(`Found ${candidates.length} candidate items for matching`);

    const matches = [];
    const threshold = 50; // Minimum score to create a match

    for (const candidate of candidates) {
      // Determine which is lost and which is found
      const lostItem = newItem.status === 'lost' ? newItem : candidate;
      const foundItem = newItem.status === 'found' ? newItem : candidate;

      // Calculate rule-based score
      let { score, details } = calculateMatchScore(lostItem, foundItem);

      // Skip if below threshold
      if (score < threshold) continue;

      // AI enhancement for borderline matches (40-70)
      if (score >= 40 && score <= 70 && process.env.OPENROUTER_API_KEY) {
        score = await enhanceWithAI(lostItem, foundItem, score);
        details.aiEnhanced = true;
      }

      // Skip if enhanced score is below threshold
      if (score < threshold) continue;

      // Check if match already exists
      const { data: existingMatch } = await supabase
        .from('item_matches')
        .select('id')
        .eq('lost_item_id', lostItem.id)
        .eq('found_item_id', foundItem.id)
        .single();

      if (existingMatch) {
        console.log(`Match already exists between ${lostItem.id} and ${foundItem.id}`);
        continue;
      }

      // Create the match
      const { data: match, error: matchError } = await supabase
        .from('item_matches')
        .insert({
          lost_item_id: lostItem.id,
          found_item_id: foundItem.id,
          match_score: score,
          match_details: details,
          status: 'pending'
        })
        .select()
        .single();

      if (matchError) {
        console.error('Error creating match:', matchError);
        continue;
      }

      console.log(`Created match with score ${score} between ${lostItem.id} and ${foundItem.id}`);
      matches.push(match);

      // Create notifications for BOTH users
      const lostUser = lostItem.userid;
      const foundUser = foundItem.userid;

      // Notify the person who lost the item
      await supabase
        .from('notifications')
        .insert({
          userid: lostUser,
          senderid: foundUser,
          itemid: lostItem.id,
          message: `Potential match found for your lost "${lostItem.title}"! (${score}% match)`
        });

      // Notify the person who found the item
      await supabase
        .from('notifications')
        .insert({
          userid: foundUser,
          senderid: lostUser,
          itemid: foundItem.id,
          message: `Potential match found for your found "${foundItem.title}"! (${score}% match)`
        });
    }

    console.log(`Created ${matches.length} matches for item ${newItemId}`);
    return matches;
  } catch (error) {
    console.error('Error in findMatchesForItem:', error);
    return [];
  }
}

/**
 * Get all matches for a user's items
 */
async function getMatchesForUser(userId) {
  try {
    // Get user's items first
    const { data: userItems, error: itemsError } = await supabase
      .from('items')
      .select('id, status')
      .eq('userid', userId);

    if (itemsError || !userItems) {
      return [];
    }

    const itemIds = userItems.map(item => item.id);

    if (itemIds.length === 0) return [];

    // Get matches where user's items are involved
    const { data: matches, error: matchesError } = await supabase
      .from('item_matches')
      .select(`
        id,
        match_score,
        match_details,
        status,
        createdat,
        lost_item_id,
        found_item_id,
        lost_item:items!lost_item_id (
          id,
          title,
          description,
          status,
          location,
          datelost,
          images:item_images (url)
        ),
        found_item:items!found_item_id (
          id,
          title,
          description,
          status,
          location,
          datelost,
          images:item_images (url)
        )
      `)
      .or(`lost_item_id.in.(${itemIds.join(',')}),found_item_id.in.(${itemIds.join(',')})`)
      .order('createdat', { ascending: false });

    if (matchesError) {
      console.error('Error fetching matches:', matchesError);
      return [];
    }

    return matches || [];
  } catch (error) {
    console.error('Error in getMatchesForUser:', error);
    return [];
  }
}

module.exports = {
  findMatchesForItem,
  getMatchesForUser,
  calculateMatchScore,
  enhanceWithAI
};
