'use client';

import { useState } from 'react';
import { Grid, Card, CardContent, Typography, CardMedia, Pagination, Box } from '@mui/material';

const projects = [
  { title: 'Modern Villa', description: 'A luxurious modern villa with a pool.', image: 'https://via.placeholder.com/300' },
  { title: 'Skyscraper Concept', description: 'A futuristic skyscraper design.', image: 'https://via.placeholder.com/300' },
  { title: 'Urban Park', description: 'A green oasis in the heart of the city.', image: 'https://via.placeholder.com/300' },
  { title: 'Cozy Cottage', description: 'A charming cottage in the countryside.', image: 'https://via.placeholder.com/300' },
  { title: 'Project 5', description: 'Description for project 5', image: 'https://via.placeholder.com/300' },
  { title: 'Project 6', description: 'Description for project 6', image: 'https://via.placeholder.com/300' },
  { title: 'Project 7', description: 'Description for project 7', image: 'https://via.placeholder.com/300' },
  { title: 'Project 8', description: 'Description for project 8', image: 'https://via.placeholder.com/300' },
  { title: 'Project 9', description: 'Description for project 9', image: 'https://via.placeholder.com/300' },
  { title: 'Project 10', description: 'Description for project 10', image: 'https://via.placeholder.com/300' },
  { title: 'Project 11', description: 'Description for project 11', image: 'https://via.placeholder.com/300' },
  { title: 'Project 12', description: 'Description for project 12', image: 'https://via.placeholder.com/300' },
];

const ITEMS_PER_PAGE = 6;

export default function ProjectsGrid() {
  const [page, setPage] = useState(1);
  const count = Math.ceil(projects.length / ITEMS_PER_PAGE);

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const currentProjects = projects.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <Box sx={{ py: 8 }}>
      <Typography variant="h4" component="h2" gutterBottom align="center">
        Featured Projects
      </Typography>
      <Grid container spacing={4}>
        {currentProjects.map((project, index) => (
          <Grid item key={index} xs={12} sm={6} md={4}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image={project.image}
                alt={project.title}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {project.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {project.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination count={count} page={page} onChange={handleChange} color="primary" />
      </Box>
    </Box>
  );
}