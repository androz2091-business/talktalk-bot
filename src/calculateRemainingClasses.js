const axios = require('axios');

const API_BASE = 'https://api.calendly.com';
const CALENDLY_ORG = 'https://api.calendly.com/organizations/8f7ec085-8b6b-4f5f-81c1-954f7a69f8d0';
const TOKEN = process.env.CALENDLY_API_TOKEN;

async function getAllRemainingClasses(studentList) {
  const headers = {
    Authorization: `Bearer ${TOKEN}`,
  };

  const grouped = new Map();

  for (const student of studentList) {
    const { groupId } = student;
    if (!grouped.has(groupId)) grouped.set(groupId, []);
    grouped.get(groupId).push(student);
  }

  const results = [];

  for (const [groupId, groupMembers] of grouped.entries()) {
    const emails = groupMembers.map(m => m.email);
    const currentPack = groupMembers[0].currentPack;

    console.log(`Processing group ${emails.join('&')}`);

    const eventMap = new Map();

    for (const email of emails) {
      let nextPage = `${API_BASE}/scheduled_events?organization=${encodeURIComponent(CALENDLY_ORG)}&invitee_email=${encodeURIComponent(email)}`;

      try {
        while (nextPage) {
          const res = await axios.get(nextPage, { headers });
          for (const event of res.data.collection) {
            eventMap.set(event.uri, {...event, email}); // avoid duplicate events
          }
          nextPage = res.data.pagination?.next_page || null;
        }
      } catch (err) {
        console.error(`❌ Failed to fetch events for ${email}: ${err.response?.status} ${err.message}`);
        continue;
      }
    }

    let count = 0;

    for (const event of eventMap.values()) {
      const start = new Date(event.start_time);
      const now = new Date();

      if (event.status === 'active' && new Date(event.start_time) <= now) {
        count++;
        console.log(`BOOKED ${event.email}: ${event.event_memberships[0].user_name} ${new Date(event?.start_time).toLocaleString()}`);
      } else if (event.status === 'canceled' && event.cancellation?.created_at) {
        const canceledAt = new Date(event.cancellation?.created_at);
        const diffMs = start - canceledAt;

        // Canceled within 1 hour before class → still counts
        if (diffMs <= 60 * 60 * 1000 && diffMs > 0) {
          count++;
          // console.log(`LATE CANCELED ${event.email}: ${event.event_memberships[0].user_name} ${new Date(event?.start_time).toLocaleString()}`);
        } else {
          // console.log(`EARLY CANCELED ${event.email}: ${event.event_memberships[0].user_name} ${new Date(event?.start_time).toLocaleString()}`);
        }
      }
    }

    for (const member of groupMembers) {
      results.push({
        email: member.email,
        name: member.name,
        remaining: currentPack - count,
        expiration: member.expirationDate,
        count,
      });
    }
  }

  return results;
}

module.exports = { getAllRemainingClasses };
