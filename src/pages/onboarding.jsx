import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { BarLoader } from "react-spinners";

const Onboarding = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [error, setError] = useState("");

  const navigateUser = useCallback(
    (currRole) => {
      navigate(currRole === "recruiter" ? "/post-job" : "/jobs", {
        replace: true,
      });
    },
    [navigate]
  );

  const handleRoleSelection = async (role) => {
    if (!user || selectedRole) return;

    setSelectedRole(role);
    setError("");

    try {
      await user.update({ unsafeMetadata: { role } });
      await user.reload();
      navigateUser(role);
    } catch (err) {
      setError(err?.errors?.[0]?.longMessage || err?.message || "Unable to save your role.");
      setSelectedRole(null);
    }
  };

  useEffect(() => {
    if (user?.unsafeMetadata?.role) {
      navigateUser(user.unsafeMetadata.role);
    }
  }, [navigateUser, user]);

  if (!isLoaded || !user) {
    return <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />;
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-10 px-4 py-12">
      <h2 className="gradient-title text-center text-5xl font-extrabold sm:text-7xl">
        I am a...
      </h2>
      <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
        <Button
          variant="blue"
          className="h-32 text-2xl"
          disabled={Boolean(selectedRole)}
          onClick={() => handleRoleSelection("candidate")}
        >
          {selectedRole === "candidate" ? "Saving..." : "Candidate"}
        </Button>
        <Button
          variant="destructive"
          className="h-32 text-2xl"
          disabled={Boolean(selectedRole)}
          onClick={() => handleRoleSelection("recruiter")}
        >
          {selectedRole === "recruiter" ? "Saving..." : "Recruiter"}
        </Button>
      </div>
      {selectedRole && <BarLoader width={"100%"} color="#36d7b7" />}
      {error && <p className="max-w-xl text-center text-sm text-red-400">{error}</p>}
    </div>
  );
};

export default Onboarding;
