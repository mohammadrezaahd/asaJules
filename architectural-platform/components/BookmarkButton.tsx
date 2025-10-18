'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import { useSession } from 'next-auth/react';
import { usersApi, projectsApi, articlesApi } from '@/components/api';

const BookmarkButton = ({ projectId, articleId }: { projectId?: string; articleId?: string }) => {
  const { data: session } = useSession();
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (session) {
        try {
          const bookmarks = await usersApi.getBookmarks();
          if (projectId) {
            setIsBookmarked(bookmarks.projects.includes(projectId));
          } else if (articleId) {
            setIsBookmarked(bookmarks.articles.includes(articleId));
          }
        } catch (error) {
          console.error('Failed to fetch bookmarks:', error);
        }
      }
    };
    fetchBookmarks();
  }, [session, projectId, articleId]);

  const handleBookmark = async () => {
    try {
      if (projectId) {
        await projectsApi.bookmark(projectId);
      } else if (articleId) {
        await articlesApi.bookmark(articleId);
      }
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