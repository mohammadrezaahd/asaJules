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
import axiosInstance from "@/lib/axios";

export default function ArticlesList() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await axiosInstance.get("/articles");
        setArticles(res.data.articles);
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
        {articles?.map((article: any, index: number) => (
          <div key={article._id}>
            <Link
              href={`/articles/${article._id}`}
              passHref
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <ListItem>
                <ListItemText
                  primary={article.title}
                  secondary={article.excerpt}
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
