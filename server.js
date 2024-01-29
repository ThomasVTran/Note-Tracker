const express = require('express');
const path = require('path');
const fs = require('fs');
const uuid = require('./uuid')

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/notes.html'))
);

// GET request for notes
app.get('/api/notes', (req, res) => {
    fs.readFile('./db/db.json', 'utf-8', (err, data) => {
        if (err) {
            console.log(err);
        } else {
            const parseData = JSON.parse(data)
            res.json(parseData)
        }
    })
    console.info(`${req.method} request received to get notes`);
});

app.post('/api/notes', (req, res) => {
    console.info(`${req.method} request received to add a note`);
    const { title, text } = req.body;
    if (title && text) {
        const newNote = {
            title: req.body.title,
            test: req.body.text,
            id: uuid(),
        };
        fs.readFile('./db/db.json', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
            } else {
                // Convert string into JSON object
                const parsedNotes = JSON.parse(data);
                // Add a new review
                parsedNotes.push(newNote);
                // Write updated reviews back to the file
                fs.writeFile('./db/db.json', JSON.stringify(parsedNotes, null, 4),
                    (writeErr) =>
                        writeErr
                            ? console.error(writeErr)
                            : console.info('Successfully updated tests!')
                );
            }
        });
        const response = {
            status: 'success',
            body: newNote,
        };
        console.log(response);
        res.status(201).json(response);
    } else {
        res.status(500).json('Error in posting review');
    }
});

app.delete('/api/notes/:id', (req, res) => {
    console.log('DELETE request received');
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
        } else {
            // Convert string into JSON object
            const parsedNotes = JSON.parse(data)
            const noteArray = parsedNotes.filter(({ id }) => id !== req.params.id);
            fs.writeFile('./db/db.json', JSON.stringify(noteArray, null, 4),
                (writeErr) =>
                    writeErr
                        ? res.json('Failed deleted note!')
                        : res.json('Successfully deleted note!')
            );
        }
    });
});

app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT}`)
); 