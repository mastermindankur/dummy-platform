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

## Data Management

The application's data is stored in JSON files located in the `src/lib/` directory.

- `data.json`: Contains the core data for the dashboard pillars and their sub-items.
- `dti-tech-blogs.json`, `explore-resiliency-program.json`, `tech-sphere-sessions.json`: These files store data imported from Excel sheets via the "Update Data" page.

These data files are intended for local use and are excluded from the Git repository via the `.gitignore` file.
