"use client";

import React from "react";
import MediaManager from "@/components/MediaManager/MediaManager";

const MediaLibraryPage = () => {
  return (
    <MediaManager
      title="Media Library"
      allowedType="all"
      showUpload={true}
    />
  );
};

export default MediaLibraryPage;
