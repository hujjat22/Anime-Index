# Anime Index

A small anime explorer built with React and Vite for a class project. It displays anime series from the public TVMaze API.

## Features

- Browse anime shows and load more results from the TVMaze catalog
- Search for an anime by title
- Save and remove favorite shows; favorites stay in this browser using `localStorage`
- Show loading and error messages while getting data

## Run the app

Install the project packages, then start the local website:

```bash
npm install
npm run dev
```

If PowerShell blocks the `npm` command, use the Windows command instead:

```powershell
npm.cmd install
npm.cmd run dev
```

## How the project was created

```bash
npm create vite@latest api-class-app -- --template react
cd api-class-app
npm install
```

## API credit

Anime information and images come from the [TVMaze API](https://www.tvmaze.com/api). TVMaze data is licensed under [CC BY-SA](https://creativecommons.org/licenses/by-sa/4.0/).
