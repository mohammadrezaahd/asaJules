'use client';

import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Card, CardContent } from '@mui/material';
import { IArticle } from '@/models/Article';
import Link from 'next/link';

const ArticlesPage = () => {
  const [articles, setArticles] = useState<IArticle[]>([]);

  useEffect(() => {
    const fetchArticles = async () => {
      const res = await fetch('/api/articles');
      const data = await res.json();
      setArticles(data);
    };
    fetchArticles();
  }, []);

  return (
    <Container>
      <Typography variant="h2" component="h1" gutterBottom align="center" sx={{ my: 4 }}>
        Articles
      </Typography>
      <Grid container spacing={4}>
        {articles.map((article) => (
          <Grid item xs={12} key={article._id}>
            <Link href={`/articles/${article._id}`} passHref style={{ textDecoration: 'none' }}>
              <Card>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {article.title}
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ArticlesPage;