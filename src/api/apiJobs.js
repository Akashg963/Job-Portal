import supabaseClient from "@/utils/supabase";

// Fetch Jobs
export async function getJobs(token, { location, company_id, searchQuery }) {
  const supabase = await supabaseClient(token);
  let query = supabase
    .from("jobs")
    .select("*, saved: saved_jobs(id), company: companies(name,logo_url)");

  if (location) {
    query = query.eq("location", location);
  }

  if (company_id) {
    query = query.eq("company_id", company_id);
  }

  if (searchQuery) {
    query = query.ilike("title", `%${searchQuery}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching Jobs:", error);
    return null;
  }

  return data;
}

// Read Saved Jobs
export async function getSavedJobs(token, { user_id }) {
  const supabase = await supabaseClient(token);

  let query = supabase
    .from("saved_jobs")
    .select("*, job: jobs(*, company: companies(name,logo_url))");

  if (user_id) {
    query = query.eq("user_id", user_id);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching Saved Jobs:", error);
    return null;
  }

  return data;
}

// Read single job
export async function getSingleJob(token, { job_id }) {
  const supabase = await supabaseClient(token);
  let query = supabase
    .from("jobs")
    .select(
      "*, company: companies(name,logo_url), applications: applications(*)"
    )
    .eq("id", job_id)
    .single();

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching Job:", error);
    return null;
  }

  return data;
}

// - Add / Remove Saved Job
export async function saveJob(token, { alreadySaved }, saveData) {
  const supabase = await supabaseClient(token);

  if (alreadySaved) {
    // If the job is already saved, remove only the current user's saved record
    const { data, error: deleteError } = await supabase
      .from("saved_jobs")
      .delete()
      .eq("user_id", saveData.user_id)
      .eq("job_id", saveData.job_id)
      .select();

    if (deleteError) {
      console.error("Error removing saved job:", deleteError);
      return data;
    }

    return data;
  } else {
    // If the job is not saved, add it to saved jobs
    const { data, error: insertError } = await supabase
      .from("saved_jobs")
      .upsert(
        [{ ...saveData, user_id: saveData.user_id }],
        {
          onConflict: "user_id,job_id",
          ignoreDuplicates: false,
        }
      )
      .select();

    if (insertError) {
      console.error("Error saving job:", insertError);
      return data;
    }

    return data;
  }
}

// - job isOpen toggle - (recruiter_id = auth.uid())
export async function updateHiringStatus(token, { job_id }, isOpen) {
  const supabase = await supabaseClient(token);
  const { data, error } = await supabase
    .from("jobs")
    .update({ isOpen })
    .eq("id", job_id)
    .select();

  if (error) {
    console.error("Error Updating Hiring Status:", error);
    return null;
  }

  return data;
}

// get my created jobs
export async function getMyJobs(token, { recruiter_id }) {
  const supabase = await supabaseClient(token);

  const { data, error } = await supabase
    .from("jobs")
    .select("*, company: companies(name,logo_url)")
    .eq("recruiter_id", recruiter_id);

  if (error) {
    console.error("Error fetching Jobs:", error);
    return null;
  }

  return data;
}

// Delete job
export async function deleteJob(token, { job_id }) {
  const supabase = await supabaseClient(token);

  const { data, error: deleteError } = await supabase
    .from("jobs")
    .delete()
    .eq("id", job_id)
    .select();

  if (deleteError) {
    console.error("Error deleting job:", deleteError);
    return data;
  }

  return data;
}

// - post job
export async function addNewJob(token, _, jobData) {
  const supabase = await supabaseClient(token);

  const basePayload = {
    ...jobData,
    company_id: Number(jobData.company_id),
  };

  const payloadCandidates = [
    {
      ...basePayload,
      isOpen: true,
    },
    {
      ...basePayload,
      is_open: true,
    },
  ];

  let lastError = null;

  for (const payload of payloadCandidates) {
    const { data, error } = await supabase
      .from("jobs")
      .insert([payload])
      .select();

    if (!error) {
      return data;
    }

    lastError = error;

    const message = error?.message || "";
    const looksLikeColumnMismatch = /column .* does not exist|does not exist|invalid input syntax/i.test(message);

    if (!looksLikeColumnMismatch) {
      break;
    }
  }

  console.error(lastError);
  throw new Error(lastError?.message || "Error creating job");
}
