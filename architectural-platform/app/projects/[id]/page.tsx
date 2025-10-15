import { notFound } from 'next/navigation';
import { Container, Typography, Grid, Paper } from '@mui/material';
import ModelViewer from '@/components/ModelViewer';
import dbConnect from '@/lib/db';
import Project from '@/models/Project';

async function getProject(id: string) {
  await dbConnect();
  try {
    const project = await Project.findById(id).populate('category').populate('createdBy');
    if (!project) {
      return null;
    }
    return JSON.parse(JSON.stringify(project));
  } catch (error) {
    return null;
  }
}

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const project = await getProject(params.id);

  if (!project) {
    notFound();
  }

  return (
    <Container>
      <Typography variant="h2" component="h1" gutterBottom align="center" sx={{ my: 4 }}>
        {project.name}
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ height: '500px' }}>
            <ModelViewer modelUrl={project.modelUrl} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <BookmarkButton projectId={project._id} />
          <Typography variant="h5" gutterBottom>
            Description
          </Typography>
          <Typography variant="body1">{project.description}</Typography>
        </Grid>
      </Grid>
    </Container>
  );
}