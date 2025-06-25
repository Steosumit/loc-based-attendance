# Attendance Project

A Node.js-based web application for recording and managing classroom attendance with geolocation validation. An old project I built in sem 1 of my bachelor degree
[DEMO VIDEO](https://drive.google.com/file/d/1WSBD_EG_We4qfY_T-5CpVKsrff5cXBmN/view)

## Features

- **Student Attendance Submission**: Students can submit their attendance via a web form, which validates their location using the browser's Geolocation API.
- **Duplicate Submission Prevention**: The server tracks IP addresses and session IDs to prevent multiple submissions from the same user.
- **CSV Record Storage**: Attendance records are stored in subject-wise CSV files.
- **Admin/Instructor Portal**: (Planned/Partial) Includes basic HTML templates for student and recruiter portals.
- **Bootstrap UI**: Modern, responsive UI using Bootstrap.
- **Session Management**: Uses `express-session` for session tracking and duplicate prevention.
- **Customizable Server Settings**: Startup prompts allow configuration of session duration, reset time, and server port.

## Directory Structure

```
.
├── app.js                        # Main server application
├── startup_prompt.js             # Startup prompt for server configuration
├── public/                       # Static files served to clients
│   ├── index.html                # Main attendance form
│   ├── code.js                   # Client-side logic (geolocation, form submission)
│   ├── code.css                  # Styles for attendance form
│   ├── error.html                # 403 Unauthorized error page
│   ├── violation.html            # Duplicate attempt/violation page
│   └── ...                       # Other static assets (images, etc.)
├── btechmtech_2023-2028_*.csv    # Attendance records per subject
├── package.json                  # Project dependencies
└── Notes.txt                     # Developer notes and references
```

## How It Works

1. **Startup**:  
   Run `node app.js`. You will be prompted for session duration, reset time, and port.

2. **Attendance Submission**:  
   - Students open the web form ([public/index.html](public/index.html)).
   - They enter their email, name, and select a subject.
   - The browser requests their geolocation and validates if they are within the classroom polygon.
   - If valid, a POST request is sent to `/api` with the attendance data.
   - The server checks for duplicate submissions using IP and session ID.
   - If accepted, the record is appended to the appropriate CSV file.

3. **Duplicate/Violation Handling**:  
   - If a duplicate attempt is detected, the user is redirected to [public/violation.html](public/violation.html).

## Setup

1. **Install dependencies**:
   ```sh
   npm install
   ```

2. **Run the server**:
   ```sh
   node app.js
   ```

3. **Access the app**:  
   Open your browser at `http://localhost:<PORT>` (as set during startup).

## Customization

- **Subjects and Timetable**:  
  Edit the CSV files (e.g., `btechmtech_2023-2028_time_table.csv`) to match your subjects and schedule.

- **Geolocation Polygon**:  
  The classroom polygon is defined in [public/code.js](public/code.js) in the `validatePosition()` function.

- **Session Settings**:  
  Change session duration and reset time via the startup prompt or modify defaults in [app.js](app.js).

## Developer Notes

- See [Notes.txt](Notes.txt) for implementation details, troubleshooting, and useful links.
- The project uses only server-side CSV storage; there is no database integration.
- Static files are served from the `public` directory.

## Dependencies

- express
- express-session
- body-parser
- prompt-sync
- readline-sync
- bootstrap (for UI)

## License

ISC

---

Developed by Sumit Gupta (steosumit@gmail.com)
