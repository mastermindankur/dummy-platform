# WCE 2025 Program Dashboard

This is a Next.js application that serves as a comprehensive dashboard for tracking the progress, value, and key actions related to the World Class Engineering (WCE) 2025 program.

## Tech Stack

This project is built with the following technologies:

- **Framework**: [Next.js](https://nextjs.org/) (React framework)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Core Features

- **Executive Value Map**: A dynamic, interactive visualization connecting strategic outcomes to the drivers and levers that enable them. It includes versioning and a comparison tool to track strategic evolution.
- **YTD Progress Dashboard**: A high-level overview of the program's health, with status breakdowns for all key sub-items across different pillars.
- **Detailed Pillar Views**: Drill-down pages for each strategic pillar, showing detailed metrics, charts, and progress against annual targets.
- **Action Item Tracker**: A Kanban-style board for tracking key action items, their owners, due dates, and completion status.
- **Impact Showcase**: A dedicated section to quantify and display the business impact of various engineering initiatives.
- **Data Management Hub**: A centralized, password-protected area to update all dashboard data, including pillar details, value map content, and uploading data via Excel files.

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

## Data Management

The application's data is stored in JSON files located in the `src/lib/data/` directory.

### Important: Data Directory and Git

The `src/lib/data/` directory is intentionally included in the `.gitignore` file. This is to ensure that sensitive or large data files are not committed to the Git repository.

If you have accidentally committed this folder in the past, you can remove it from Git's tracking (while keeping the files on your local machine) by running the following commands:

```bash
# Tell Git to stop tracking the data folder
git rm -r --cached src/lib/data

# Commit the removal
git commit -m "Stop tracking src/lib/data folder"

# Push the change to your remote repository
git push
```

## Running with Docker

You can also build and run this application using Docker.

1.  **Build the Docker Image:**
    From the root directory of the project, run the following command to build the image:
    ```bash
    docker build -t wce-dashboard .
    ```

2.  **Run the Docker Container:**
    Once the image is built, run the following command to start the container. This command maps port `9002` on your local machine to port `3000` inside the container and mounts the local `src/lib/data` directory to persist your application's data.

    To avoid naming conflicts, it's good practice to remove any old container with the same name first.
    ```bash
    docker rm -f wce-dashboard
    ```

    Then, run the new container:
    ```bash
    docker run -d \
      -p 9002:3000 \
      -v "$(pwd)/src/lib/data:/app/src/lib/data" \
      --name wce-dashboard \
      wce-dashboard
    ```

    You can then access the application at `http://localhost:9002`.
