import { Container, Box } from '@mui/material';
import Banner from '@/components/Home/Banner';
import ProjectsGrid from '@/components/Home/ProjectsGrid';
import ArticlesList from '@/components/Home/ArticlesList';
import Decoration3D from '@/components/Three/Decoration3D';

export default function HomePage() {
  return (
    <>
      <Banner />
      <Container maxWidth="lg">
        <ProjectsGrid />
        <Box sx={{ height: '400px', my: 4 }}>
          <Decoration3D />
        </Box>
        <ArticlesList />
      </Container>
    </>
  );
}