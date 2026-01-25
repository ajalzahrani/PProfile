const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");
const pkg = require("../package.json");
const readline = require("readline");

const config = {
  source: path.resolve(__dirname, ".."),
  destination: "", // This will be set based on user input
  files: [
    { from: ".next/standalone", to: "/" },
    { from: ".next/static", to: "/.next/static" },
    { from: "ecosystem.config.js", to: "/ecosystem.config.js" },
    { from: "public", to: "/public" },
  ],
};

async function deploy() {
  try {
    // Change to parent directory before building
    process.chdir(config.source);
    console.log("Current working directory:", process.cwd());

    // Ask for environment selection
    const envFile = await selectEnvironment();

    // Load the selected environment file
    require("dotenv").config({ path: envFile });

    // Ask for server destination selection
    const serverDestination = await selectServerDestination();
    config.destination = serverDestination; // Set the destination based on user input

    // Set the environment variables before building
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    process.env.PORT = "3004";
    process.env.HOSTNAME = "0.0.0.0";

    // Log application version and prompt for confirmation
    console.log("Current app version:", pkg.version);
    const deploymentConfirmation = await getConfirmation(
      "Do you want to continue with deployment? (y/n): ",
    );

    if (deploymentConfirmation !== "y") {
      console.log("Deployment cancelled by user");
      process.exit(0);
    }

    // Ask user for build confirmation
    const buildConfirmation = await getConfirmation(
      "Do you want to build the application? (y/n): ",
    );

    if (buildConfirmation === "y") {
      // Build the application
      console.log("Building application...");
      await execPromise("npm run build");
    }

    // Ensure destination exists
    console.log("Creating destination directory if needed...");
    await fs.ensureDir(config.destination);

    // Copy files
    console.log("Copying files...");
    for (const file of config.files) {
      const src = path.join(config.source, file.from);
      const dest = path.join(config.destination, file.to);

      console.log(`Copying ${file.from} to ${dest}`);
      try {
        await fs.copy(src, dest, {
          overwrite: true,
          errorOnExist: false,
        });
      } catch (err) {
        console.error(`Error copying ${file.from}:`, err);
        throw err;
      }
    }

    console.log("Deployment complete successfully!");
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

function execPromise(command) {
  return new Promise((resolve, reject) => {
    const options = {
      env: { ...process.env },
      shell: true,
    };

    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        console.error("Build output:", stdout);
        console.error("Build errors:", stderr);
        reject(error);
      } else {
        console.log("Build output:", stdout);
        resolve(stdout);
      }
    });
  });
}

async function selectEnvironment() {
  const environments = {
    dev: ".env.dev",
    test: ".env",
    prod: ".env.production",
  };

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question("Select environment (dev/test/prod): ", (answer) => {
      const envFile = environments[answer.toLowerCase()];
      if (envFile) {
        console.log(`Selected environment: ${envFile}`);
        resolve(path.join(config.source, envFile));
      } else {
        console.log(
          "Invalid selection. Defaulting to development environment.",
        );
        resolve(path.join(config.source, environments.dev));
      }
      rl.close();
    });
  });
}

async function selectServerDestination() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      "Select server destination (1.PProfile-TEST/2.PProfile(LIVE)): ",
      (answer) => {
        const destination =
          answer.toUpperCase() === "2"
            ? "//PProfile/p-profile"
            : "//QUEUETEST/p-profile"; // Default to QUEUETEST
        console.log(`Selected server destination: ${destination}`);
        resolve(destination);
        rl.close();
      },
    );
  });
}

async function getConfirmation(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(message, (answer) => {
      rl.close();
      resolve(answer.toLowerCase());
    });
  });
}

// Run the deployment
deploy();
