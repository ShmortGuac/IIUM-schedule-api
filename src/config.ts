export const config = {
  port: process.env.PORT ?? 3000,
  iium: {
    scheduleUrl: "https://myapps.iium.edu.my/StudentOnline/schedule1.php",
    coursesPerPage: 50,
    timeoutMs: 15_000,
  },
  // Update each semester; the old IIUM form's own defaults are no longer maintained.
  defaults: {
    sem: "1",
    session: "2026/2027",
  },
};
