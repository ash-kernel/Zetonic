export function getGreeting(): string {
  const hour = new Date().getHours();
  let time = "Good evening";
  if (hour < 12) time = "Good morning";
  else if (hour < 17) time = "Good afternoon";

  const name = (() => {
    try {
      const s = localStorage.getItem("zetonicSettings");
      const parsed = s ? (JSON.parse(s) as { userName?: string }) : {};
      return String(parsed.userName || "").trim();
    } catch {
      return "";
    }
  })();

  return name ? `${time}, ${name}` : time;
}
