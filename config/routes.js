module.exports = function(app) {

  app.get('/', function(req, res) {
    res.render('chat');
  });

  app.get('/register', function(req, res) {
    res.render('register', {});
  });

  app.post('/register', function(req, res) {

  });

};