export interface CreateArticleDto {
  title: string;
  content: string;
  author: string; // Author's user ID
}

export interface UpdateArticleDto extends Partial<CreateArticleDto> {}