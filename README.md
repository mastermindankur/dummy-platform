# Firebase Studio 

This is a NextJS starter in Firebase Studio. 

To get started, take a look at `src/app/page.tsx`.

## Tech Stack

This project is built with the following technologies:

- **Framework**: [Next.js](https://nextjs.org/) (React framework)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Running Locally

To run this application on your local machine, you'll need to have [Node.js](https://nodejs.org/) installed, which includes `npm`.

1.  **Install dependencies:**
    Open your terminal in the project root and run:
    ```bash
    npm install
    ```

2.  **Start the development server:**
    After the installation is complete, run:
    ```bash
    npm run dev
    ```

This will start the application, and you can view it in your browser at `http://localhost:9002`.

## Running with Docker

You can also build and run this application using Docker.

1.  **Build the Docker Image:**
    From the root directory of the project, run the following command to build the image:
    ```bash
    docker build -t wce-dashboard .
    ```

2.  **Run the Docker Container:**
    Once the image is built, run the following command to start the container. This command maps port `9002` on your local machine to port `3000` inside the container and mounts a local data directory to persist your application's data.

    To avoid naming conflicts, it's good practice to remove any old container with the same name first.
    ```bash
    docker rm -f wce-dashboard
    ```

    Then, run the new container.

    **Option A: Persist data within the project's `src/lib/data` directory:**
    ```bash
    docker run -d \
      -p 9002:3000 \
      -v "$(pwd)/src/lib/data:/app/src/lib/data" \
      --name wce-dashboard \
      wce-dashboard
    ```

    **Option B: Persist data in an external directory (e.g., your Downloads folder):**
    Replace `~/Downloads/data` with the absolute path to your desired data folder.
    ```bash
    docker run -d \
      -p 9002:3000 \
      -v ~/Downloads/data:/app/src/lib/data \
      --name wce-dashboard \
      wce-dashboard
    ```

    You can then access the application at `http://localhost:9002`.

## Data Management

The application's data is stored in JSON files located in the `src/lib/data/` directory inside the container.

- `data.json`: Contains the core data for the dashboard pillars and their sub-items.
- Excel Data: Files like `dti-tech-blogs.json` store data imported from Excel sheets.
- `value-map-versions/`: This directory contains all versioned data for the Executive Value Map.

When running with Docker, this data directory is mounted as a volume to ensure data persistence across container restarts.