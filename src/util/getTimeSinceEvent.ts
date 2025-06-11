// A Function to calculate the difference between the current time and eventTime set from the Database.
export default function getTimeSinceEvent(eventDate) {
  // Get the time difference between the current time and the event date
  const eventTime = new Date(eventDate).getTime();
  const currentTime = new Date().getTime();
  const timeDifference = currentTime - eventTime;

  // Calculate the difference in time between the event date and current time
  const secondsSinceEvent = Math.floor(timeDifference / 1000);
  const minutesSinceEvent = Math.floor(secondsSinceEvent / 60);
  const hoursSinceEvent = Math.floor(minutesSinceEvent / 60);
  const daysSinceEvent = Math.floor(hoursSinceEvent / 24);

  // Use a switch statement to determine the largest unit of time that is greater than 0
  switch (true) {
    case daysSinceEvent > 0:
      return `${daysSinceEvent} day${daysSinceEvent > 1 ? 's' : ''} ago`;
    case hoursSinceEvent > 0:
      return `${hoursSinceEvent} hour${hoursSinceEvent > 1 ? 's' : ''} ago`;
    case minutesSinceEvent > 0:
      return `${minutesSinceEvent} minute${minutesSinceEvent > 1 ? 's' : ''} ago`;
    default:
      return `${secondsSinceEvent} second${secondsSinceEvent !== 1 ? 's' : ''} ago`;
  }
}
