import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('./prisma/dev.db');

db.all('SELECT titulo, imagem FROM Noticia WHERE titulo LIKE "%67 anos%" OR titulo = "teste"', (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        console.log("NOTÍCIAS ENCONTRADAS:");
        console.log(JSON.stringify(rows, null, 2));
    }
    db.close();
});
