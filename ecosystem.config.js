module.exports = {
  apps: [
    {
      name: "p-profile",
      script: "server.js",
      args: "--port 3004",
      cwd: "C:\\p-profile",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3004,
        HOSTNAME: "0.0.0.0",
      },
      // Add environment variables for database connection
      env_production: {
        NODE_ENV: "production",
        PORT: 3004,
        HOSTNAME: "0.0.0.0",
        // Make sure these match your .env.production file
        DATABASE_URL:
          "postgresql://pprofileadmin:22@172.16.51.49:5432/pprofile-dev?schema=public",
        NEXTAUTH_URL: "http://172.16.51.49:3004",
        NEXTAUTH_SECRET: "O44/g/kwx5FBy+bCek/R8UYVecyaP1JxAvxSRRtKmoI=",
      },
    },
  ],
};
