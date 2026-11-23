import { TimetableContext } from "@/components/timetable-grid";
import type { Timetable } from "@/lib/pages";
import OnlineTuitionPage from "./online-tuition";

/** The online tuition page with the timetable EmDash holds, which its Astro route reads when the site is built. */
export default function OnlineTuitionWithTimetable({ path, timetable }: { path: string; timetable: Timetable }) {
  return (
    <TimetableContext value={timetable}>
      <OnlineTuitionPage path={path} />
    </TimetableContext>
  );
}
