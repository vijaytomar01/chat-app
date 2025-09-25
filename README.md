# Chat App

A real-time chat application built with Node.js, Express, and Socket.io.

## Features

- Real-time messaging
- User-friendly interface
- Multiple chat rooms support (planned)
- Message history (planned)
- User authentication (planned)

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd chat-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
chat-app/
├── src/
│   ├── server.js          # Express server and Socket.io setup
│   └── main.js            # Main application logic
├── public/
│   ├── index.html         # Main HTML file
│   ├── styles.css         # CSS styling
│   └── client.js          # Client-side JavaScript
├── package.json
├── .gitignore
└── README.md
```

## Technologies Used

- **Backend**: Node.js, Express.js, Socket.io
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Real-time Communication**: WebSockets via Socket.io

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## TODO

- [ ] Implement user authentication
- [ ] Add multiple chat rooms
- [ ] Add message persistence
- [ ] Implement file sharing
- [ ] Add emoji support
- [ ] Create mobile-responsive design