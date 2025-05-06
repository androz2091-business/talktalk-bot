const axios = require('axios');

const API_BASE = 'https://api.calendly.com';
const CALENDLY_ORG = 'https://api.calendly.com/organizations/8f7ec085-8b6b-4f5f-81c1-954f7a69f8d0';
const TOKEN = process.env.CALENDLY_API_TOKEN;

async function getAllRemainingClasses(studentList) {
  const headers = {
    Authorization: `Bearer ${TOKEN}`,
  };

  const results = [];

  for (const student of studentList) {
    const { email, currentPack, expirationDate } = student;

    if (!email) {
      console.warn(`⚠️ Skipping student with missing email:`, student);
      continue;
    }

    const expiration = new Date(expirationDate);
    const now = new Date();

    if (expiration < now) {
      continue;
    }

    const events = [];
    let nextPage = `${API_BASE}/scheduled_events?organization=${encodeURIComponent(CALENDLY_ORG)}&invitee_email=${encodeURIComponent(email)}`;

    try {
      while (nextPage) {
        const res = await axios.get(nextPage, { headers });
        events.push(...res.data.collection);
        nextPage = res.data.pagination?.next_page || null;
      }
    } catch (err) {
      console.error(`❌ Failed to fetch events for ${email}: ${err.response?.status} ${err.message}`);
      continue;
    }

    let count = 0;

    for (const event of events) {
      const start = new Date(event.start_time);

      if (event.status === 'active') {
        count++;
      } else if (event.status === 'canceled' && event.cancellation?.created_at) {
        const canceledAt = new Date(event.cancellation?.created_at);
        const diffMs = start - canceledAt;

        // Canceled within 1 hour before class → still counts
        if (diffMs <= 60 * 60 * 1000 && diffMs > 0) {
          count++;
        }
      }
    }

    results.push({
      email,
      remaining: currentPack - count,
      expiration: expiration.toISOString().split('T')[0],
      count
    });
  }

  return results;
}

module.exports = { getAllRemainingClasses };
