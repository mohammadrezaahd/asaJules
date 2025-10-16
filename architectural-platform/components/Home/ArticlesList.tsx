"use client";

import { useState, useEffect } from "react";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import Link from "next/link";
import { articlesApi } from "@/components/api";
import { Article } from "@/types";

export default function ArticlesList() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await articlesApi.getAll();
        if (response.isSuccess && response.data) {
          setArticles(response.data);
        } else {
          console.error("Error fetching articles:", response.error);
        }
      } catch (error) {
        console.error("Error fetching articles:", error);
      }
    };
    fetchArticles();
  }, []);

  return (
    <Box sx={{ py: 8, bgcolor: "background.paper" }}>
      <Typography variant="h4" component="h2" gutterBottom align="center">
        Latest Articles
      </Typography>
      <List>
        {articles?.map((article, index) => (
          <div key={article._id}>
            <Link
              href={`/articles/${article._id}`}
              passHref
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <ListItem>
                <ListItemText
                  primary={article.title}
                />
              </ListItem>
            </Link>
            {index < articles.length - 1 && <Divider />}
          </div>
        ))}
      </List>
    </Box>
  );
}
