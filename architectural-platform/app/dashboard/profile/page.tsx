"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Container } from "@mui/material";

const ProfileRedirect = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    
    if (session?.user?.id) {
      // Redirect to user's own profile
      router.replace(`/dashboard/profile/${session.user.id}`);
    } else {
      // Redirect to login if no session
      router.replace("/auth/login");
    }
  }, [session, status, router]);

  return (
    <Container>
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    </Container>
  );
};

export default ProfileRedirect;