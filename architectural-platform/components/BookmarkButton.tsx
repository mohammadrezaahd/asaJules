'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import { useSession } from 'next-auth/react';
import axiosInstance from '@/lib/axios';

const BookmarkButton = ({ projectId, articleId }: { projectId?: string; articleId?: string }) => {
  const { data: session } = useSession();
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (session) {
        try {
          const res = await axiosInstance.get('/user/bookmarks');
          const data = res.data;
          if (projectId) {
            setIsBookmarked(data.projects.includes(projectId));
          } else if (articleId) {
            setIsBookmarked(data.articles.includes(articleId));
          }
        } catch (error) {
          console.error('Failed to fetch bookmarks:', error);
        }
      }
    };
    fetchBookmarks();
  }, [session, projectId, articleId]);

  const handleBookmark = async () => {
    const url = projectId
      ? `/projects/${projectId}/bookmark`
      : `/articles/${articleId}/bookmark`;

    try {
      await axiosInstance.post(url);
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Failed to bookmark:', error);
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