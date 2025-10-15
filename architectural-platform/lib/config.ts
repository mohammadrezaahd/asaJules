const environments = {
  server: {
    // Use MONGODB_URI directly instead of separate components
    mongodb_uri: process.env.MONGODB_URI,
    // Keep these for potential future use, but use proper env var names
    db_username: process.env.DB_USERNAME,
    db_pwd: process.env.DB_PWD,
    db_server: process.env.DB_SERVER,
    db_port: process.env.DB_PORT,
    db_name: process.env.DB_NAME,
  },
  uri: {
    base_url: process.env.NEXT_PUBLIC_BASE_URL,
    api_url: process.env.NEXT_PUBLIC_API_URL,
  },
  storage: {
    storage_directory: process.env.NEXT_PUBLIC_STORAGE_DIRECTORY,
    storage_folder: process.env.NEXT_PUBLIC_STORAGE_FOLDER,
  },
  auth: {
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
  },
  nextAuth: {
    secret: process.env.NEXTAUTH_SECRET,
    url: process.env.NEXTAUTH_URL,
  },
};

export default environments;