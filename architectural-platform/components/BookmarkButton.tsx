'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import { useSession } from 'next-auth/react';

const BookmarkButton = ({ projectId, articleId }: { projectId?: string; articleId?: string }) => {
  const { data: session } = useSession();
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (session) {
        const res = await fetch('/api/user/bookmarks');
        const data = await res.json();
        if (projectId) {
          setIsBookmarked(data.projects.includes(projectId));
        } else if (articleId) {
          setIsBookmarked(data.articles.includes(articleId));
        }
      }
    };
    fetchBookmarks();
  }, [session, projectId, articleId]);

  const handleBookmark = async () => {
    const url = projectId
      ? `/api/projects/${projectId}/bookmark`
      : `/api/articles/${articleId}/bookmark`;

    const res = await fetch(url, { method: 'POST' });
    if (res.ok) {
      setIsBookmarked(!isBookmarked);
    }
  };

  if (!session) return null;

  return (
    <Button variant="outlined" onClick={handleBookmark}>
      {isBookmarked ? 'Bookmarked' : 'Bookmark'}
    </Button>
  );
};

export default BookmarkButton;