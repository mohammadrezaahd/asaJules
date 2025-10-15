'use client';

import React from 'react';
import { Container, Typography, Grid, Card, CardContent, CardMedia } from '@mui/material';

const featuredContent = [
  {
    title: 'Featured Project 1',
    description: 'An amazing 3D model of a modern house.',
    image: 'https://via.placeholder.com/300',
    type: 'Project',
  },
  {
    title: 'Featured Article 1',
    description: 'An in-depth look at the latest architectural trends.',
    image: 'https://via.placeholder.com/300',
    type: 'Article',
  },
];

const HomePage = () => {
  return (
    <Container>
      <Typography variant="h2" component="h1" gutterBottom align="center" sx={{ my: 4 }}>
        Welcome to 3DArch
      </Typography>
      <Typography variant="h5" component="p" color="text.secondary" align="center" gutterBottom>
        Your hub for 3D model visualization and architectural articles.
      </Typography>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        {featuredContent.map((item, index) => (
          <Grid item xs={12} sm={6} md={6} key={index}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={item.image}
                alt={item.title}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default HomePage;