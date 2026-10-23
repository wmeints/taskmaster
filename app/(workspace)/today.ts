import { cookies } from "next/headers";
import { timeZoneCookie, todayIn } from "@/lib/tasks/deadlines";

// Today's date for the signed-in user; the browser reports its time zone in a cookie.
export async function getToday(): Promise<string> {
  const timeZone = (await cookies()).get(timeZoneCookie)?.value;
  return todayIn(timeZone ?? "UTC");
}
