const express = require("express");
const mustacheExpress = require("mustache-express");
const app = express();

const pool = require('./database');

app.engine("mustache", mustacheExpress());
app.set("view engine", "mustache");
app.set("views", __dirname + "/views");

/**
 * Configuration de express
 * pour récupérer les données d'un formulaire
 * et pour servir les fichiers statiques
 * (css, js, images, etc.)
 */
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get('/personnages', async (req, res) => {
  pool.getConnection(function(err, connection) {
    if (err) throw err; 

    connection.query('SELECT * FROM personnages JOIN equipes ON personnages.equipe_id = equipes.id', function (error, results, fields) {
    res.render ('personnages',
    {
      pageTitle: "Tes héros préférés",
      heros: results
    });
    connection.release();
    if (error) throw error;
    });
  });
});

  app.get('/personnages/:id', async (req, res) => {
    pool.getConnection(function(err, connection) {
      if (err) throw err; 

      let id = req.params.id;
      connection.query('SELECT * FROM personnages JOIN equipes ON personnages.equipe_id = equipes.id WHERE personnages.id = ?', [id] , function (error, results, fields) {
        res.render ('personnage',
        {
          pageTitle: "Ton héros préféré",
          hero: results[0]
        });

        connection.release();
        if (error) throw error;
      });
    });
  });

  app.get('/create/personnages', function(req, res) {
    pool.getConnection(function(err, connection) {
      if (err) throw err; 
      let id = req.params.id;
      connection.query('SELECT * FROM equipes', function (error, results, fields) {
        res.render ('create',
        {
          pageTitle: "Créer ton personnage",
          equipes: results
        });

        connection.release();
        if (error) throw error;
      });
    }); 
  });

  app.post('/traitement-create', function(req, res) {
    pool.getConnection(function(err, connection) {
      if (err) throw err; 
      const {nom, description, equipe_id} = req.body;
      connection.query('INSERT INTO personnages (nom, description, photo, equipe_id) VALUES (?, ?, ?, ?)', [nom, description, '', equipe_id] , function (error, results, fields) {
        res.redirect('/personnages')

        connection.release();
        if (error) throw error;
      });
    });
  });

  app.delete('/delete/personnages/:id', async (req, res) => {
    pool.getConnection(function(err, connection) {
      if (err) throw err; 

      let id = req.params.id;
      connection.query('DELETE FROM personnages WHERE id = ?', [id] , function (error, results, fields) {
        res.redirect('/personnages')
    
        connection.release();
        if (error) throw error;
      });
    });
  });

  app.put('/put/personnages/:id', async (req, res) => {
    pool.getConnection(function(err, connection) {
        if (err) throw err; 
        let id = req.params.id;

        const {nom, description, photo, equipe_id} = req.body;

        connection.query('UPDATE personnages SET nom = ?, description = ?, photo = ?, equipe_id = ? WHERE id = ?', [nom, description, photo, equipe_id, id] , function (error, results, fields) {
            res.redirect('/personnages')
            connection.release();
            if (error) throw error;
        });
      });
  });



app.listen(3000, () => {
  console.log("Server is running on port 3000");
});