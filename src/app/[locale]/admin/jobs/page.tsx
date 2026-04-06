import { adminGetJobs } from "@/lib/admin-data";
import { JobsClient } from "./JobsClient";

export default async function AdminJobsPage() {
  const jobs = await adminGetJobs(200);
  return <JobsClient jobs={jobs} />;
}
