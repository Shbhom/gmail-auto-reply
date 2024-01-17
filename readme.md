# Gmail Auto Reply Node App

## Overview

This Node.js application is designed to automatically reply to emails received on a specific day with a predefined message. The application uses Google OAuth for authentication and Gmail API for reading and replying to emails.

## Features

- **OAuth Authentication**: The application uses Google OAuth to authenticate users and obtain the necessary permissions.

- **Automated Replies**: Once authenticated, the app automatically replies to all emails received on the specified day with a predefined message.

- **Labeling**: The replied emails are labeled as "On Vacation" for easy identification.

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/gmail-auto-reply-node-app.git
    cd gmail-auto-reply-node-app
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory and add the following environment variables:

    ```env
    CLIENT_ID=your_google_client_id
    CLIENT_SECRET=your_google_client_secret
    REDIRECT_URI=http://localhost:3000/auth/callback
    ```

    Obtain the `CLIENT_ID` and `CLIENT_SECRET` by creating a project on the [Google Cloud Console](https://console.cloud.google.com/), enabling the Gmail API, and configuring the OAuth consent screen.

4. Build the TypeScript code:

    ```bash
    npm run build
    ```

## Usage

1. Start the application:

    ```bash
    npm start
    ```

2. Open your web browser and navigate to `http://localhost:5500/auth`. This will initiate the OAuth authentication process, and you will be redirected to the Google consent screen.

3. Grant the necessary permissions to the application.

4. Once authenticated, the app will automatically reply to all emails received on the current day with the predefined message.


## Important Note

- Ensure that the `REDIRECT_URI` in your Google Cloud Console project matches the one specified in your `.env` file.

- Make sure to handle the obtained credentials securely in a production environment.