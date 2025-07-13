const axios = require('axios');

const API_BASE = 'https://api.calendly.com';
const CALENDLY_ORG = 'https://api.calendly.com/organizations/8f7ec085-8b6b-4f5f-81c1-954f7a69f8d0';

async function getAllRemainingClasses(studentList) {
  const headers = {
    Authorization: `Bearer ${process.env.CALENDLY_API_TOKEN}`,
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
    const monthlyStats = new Map();

    for (const email of emails) {
      let nextPage = `${API_BASE}/scheduled_events?organization=${encodeURIComponent(CALENDLY_ORG)}&invitee_email=${encodeURIComponent(email)}`;

      try {
        while (nextPage) {
          const res = await axios.get(nextPage, { headers });
          for (const event of res.data.collection) {
            eventMap.set(event.uri, {...event, email}); // avoid duplicate events
            
            if (event.status === 'active' || (event.status === 'canceled' && event.cancellation?.created_at)) {
              const date = new Date(event.start_time);
              const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              monthlyStats.set(monthKey, (monthlyStats.get(monthKey) || 0) + 1);
            }
          }
          nextPage = res.data.pagination?.next_page || null;
        }
      } catch (err) {
        console.error(`❌ Failed to fetch events for ${email}: ${err.response?.status} ${err.message}`);
        continue;
      }
    }

    let count = 0;
    let completedClasses = [];
    let hasRecentBooking = false; // recent booking within 2 weeks

    for (const event of eventMap.values()) {
      const start = new Date(event.start_time);
      const now = new Date();
      const twoWeeksAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));

      if (start >= twoWeeksAgo && start <= now && event.status === 'active') {
        hasRecentBooking = true;
      }

      if (event.status === 'active' && new Date(event.start_time) <= now) {
        count++;
        completedClasses.push({
          date: event.start_time,
          title: event.name || (event.event_memberships && event.event_memberships[0]?.user_name) || '',
          cancelled: false
        });
        console.log(`BOOKED ${event.email}: ${event.event_memberships[0].user_name} ${new Date(event?.start_time).toLocaleString()}`);
      } else if (event.status === 'canceled' && event.cancellation?.created_at) {
        const canceledAt = new Date(event.cancellation?.created_at);
        const diffMs = start - canceledAt;

        // Canceled within 1 hour before class → still counts
        if (diffMs <= 60 * 60 * 1000 && diffMs > 0) {
          count++;
          completedClasses.push({
            date: event.start_time,
            title: event.name || (event.event_memberships && event.event_memberships[0]?.user_name) || '',
            cancelled: true
          });
          // console.log(`LATE CANCELED ${event.email}: ${event.event_memberships[0].user_name} ${new Date(event?.start_time).toLocaleString()}`);
        } else {
          console.log(`EARLY CANCELED ${event.email}: ${event.event_memberships[0].user_name} ${new Date(event?.start_time).toLocaleString()}`);
          // Early cancelled, still add to list but not counted
          completedClasses.push({
            date: event.start_time,
            title: event.name || (event.event_memberships && event.event_memberships[0]?.user_name) || '',
            cancelled: true
          });
        }
      }
    }

    // Convert monthly stats to array and sort by date
    const monthlyData = Array.from(monthlyStats.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({
        month,
        count
      }));

    for (const member of groupMembers) {
      let status, statusClass;
      if (hasRecentBooking) {
        status = 'Active';
        statusClass = 'badge-success';
      } else if (currentPack - count > 0) {
        status = 'Inactive';
        statusClass = 'badge-warning';
      } else {
        status = 'Expired';
        statusClass = 'badge-danger';
      }

      results.push({
        email: member.email,
        name: member.name,
        remaining: currentPack - count,
        expiration: member.expirationDate,
        count,
        monthlyStats: monthlyData,
        completedClasses,
        hasRecentBooking,
        status,
        statusClass
      });
    }
  }

  return results;
}

module.exports = { getAllRemainingClasses };
