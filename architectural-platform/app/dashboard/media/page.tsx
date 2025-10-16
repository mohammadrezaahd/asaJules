"use client";

import React from "react";
import AdvancedMediaManager from "@/components/MediaManager/AdvancedMediaManager";

const MediaLibraryPage = () => {
  return (
    <AdvancedMediaManager
      title="Media Library"
      allowedType="all"
      showUpload={true}
    />
  );
};

export default MediaLibraryPage;
