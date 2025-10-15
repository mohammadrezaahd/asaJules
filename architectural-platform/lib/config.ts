const environments = {
  server: {
    db_username: process.env.NEXT_PUBLIC_DB_USERNAME,
    db_pwd: process.env.NEXT_PUBLIC_DB_PWD,
    db_server: process.env.NEXT_PUBLIC_DB_SERVER,
    db_port: process.env.NEXT_PUBLIC_DB_PORT,
    db_name: process.env.NEXT_PUBLIC_DB_NAME,
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