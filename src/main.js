const app = require('../api/index.js');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Chat API server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to start chatting!`);
});