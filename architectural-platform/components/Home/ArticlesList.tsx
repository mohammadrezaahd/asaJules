'use client';

import { List, ListItem, ListItemText, Typography, Box, Divider } from '@mui/material';

const articles = [
  { title: 'The Future of Sustainable Architecture', excerpt: 'Exploring eco-friendly materials and designs...' },
  { title: 'The Rise of Parametric Design', excerpt: 'How algorithms are shaping our cities...' },
  { title: 'A Look at Brutalist Architecture', excerpt: 'The raw beauty of concrete giants...' },
];

export default function ArticlesList() {
  return (
    <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
      <Typography variant="h4" component="h2" gutterBottom align="center">
        Latest Articles
      </Typography>
      <List>
        {articles.map((article, index) => (
          <div key={index}>
            <ListItem>
              <ListItemText
                primary={article.title}
                secondary={article.excerpt}
              />
            </ListItem>
            {index < articles.length - 1 && <Divider />}
          </div>
        ))}
      </List>
    </Box>
  );
}