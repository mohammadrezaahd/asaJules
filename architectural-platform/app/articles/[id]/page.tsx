import { notFound } from 'next/navigation';
import { Container, Typography, Paper } from '@mui/material';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';

async function getArticle(id: string) {
  await dbConnect();
  try {
    const article = await Article.findById(id).populate('category').populate('createdBy');
    if (!article) {
      return null;
    }
    return JSON.parse(JSON.stringify(article));
  } catch (error) {
    return null;
  }
}

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const article = await getArticle(params.id);

  if (!article) {
    notFound();
  }

  return (
    <Container>
      <Typography variant="h2" component="h1" gutterBottom align="center" sx={{ my: 4 }}>
        {article.title}
      </Typography>
      <BookmarkButton articleId={article._id} />
      <Paper sx={{ p: 4, mt: 2 }}>
        <Typography variant="body1">{article.content}</Typography>
      </Paper>
    </Container>
  );
}