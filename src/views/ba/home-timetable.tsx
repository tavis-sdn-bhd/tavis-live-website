import { TimetableContext } from "@/components/timetable-grid";
import type { Timetable } from "@/lib/pages";
import HomePage from "./home";

/** The home page with the timetable EmDash holds, so its live class card agrees with the online tuition page's grid. */
export default function HomeWithTimetable({ path, timetable }: { path: string; timetable: Timetable }) {
  return (
    <TimetableContext value={timetable}>
      <HomePage path={path} />
    </TimetableContext>
  );
}
