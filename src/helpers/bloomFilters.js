export async function initBloomFilters() {
  emailFilter = await loadFilter(EMAIL_FILTER_KEY);
  phoneFilter = await loadFilter(PHONE_FILTER_KEY);

  // ✅ Rebuild only if Redis is missing the filters
  if (!emailFilter || !phoneFilter) {
    console.log('Rebuilding Bloom Filters from DB...');

    emailFilter = BloomFilter.create(100000000, 0.01); // 1% false positive rate
    phoneFilter = BloomFilter.create(100000000, 0.01);

    // ⚠️ This will be heavy! Use LIMIT + pagination if needed
    const batchSize = 100_000;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const users = await User.findAll({
        attributes: ['email', 'phone'],
        limit: batchSize,
        offset,
        raw: true,
      });

      for (const { email, phone } of users) {
        if (email) emailFilter.add(email.toLowerCase());
        if (phone) phoneFilter.add(phone);
      }

      offset += users.length;
      hasMore = users.length === batchSize;
    }

    await saveFilter(EMAIL_FILTER_KEY, emailFilter);
    await saveFilter(PHONE_FILTER_KEY, phoneFilter);

    console.log('Bloom filters rebuilt and saved to Redis');
  } else {
    console.log('Bloom filters loaded from Redis');
  }
}
