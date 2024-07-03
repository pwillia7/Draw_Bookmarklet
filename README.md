# Note Taking Bookmarklet

This repository contains a bookmarklet that allows users to create and save notes directly from their browser. The notes can include drawings and captured HTML selections. The bookmarklet enables users to capture a section of a webpage, draw on it, and save the note as a PNG file.

## Features

- Create a note modal that can be resized and dragged.
- Draw on the canvas using mouse, finger, or stylus.
- Capture HTML elements from the webpage and overlay them on the canvas.
- Preserve the aspect ratio of captured images.
- Save the note as a PNG file named with the note title and the current URL.
- Edit the note title directly in the modal.

## Usage

### Create the Bookmarklet

1. Copy the code from the `bookmarklet.js` file in this repository.
2. Create a new bookmark in your browser.
3. Paste the copied code into the URL field of the bookmark.

### Using the Bookmarklet

1. Click the bookmarklet to open the note modal.
2. Select the HTML elements you want to include.
3. Click the "Capture Selection" button to capture and render the selected HTML elements onto the canvas.
4. Use the color picker to select your desired drawing color.
5. Use the slider to adjust the brush thickness.
6. Click on the note title to edit it.
7. Draw on the canvas using your mouse, finger, or stylus.
8. Click the 'Save' button to save the note as a PNG file named with the note title and the current URL.
9. Click the 'X' button to cancel and close the modal without saving.

## Development

### Prerequisites

- A modern web browser

### Installation

1. Clone this repository:
    ```sh
    git clone https://github.com/your-username/note-taking-bookmarklet.git
    ```
2. Open `index.html` in your browser to test the bookmarklet locally.

### Building the Bookmarklet

The bookmarklet code is contained in the `bookmarklet.js` file. To update the bookmarklet:

1. Edit the `bookmarklet.js` file as needed.
2. Minify the code (optional for production use).
3. Copy the updated code and create a new bookmark in your browser.

## Contributing

1. Fork this repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`.
3. Make your changes and commit them: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature/your-feature-name`.
5. Open a pull request.



