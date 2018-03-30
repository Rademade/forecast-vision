const express = require('express');
const { Report } = require('./services/report');

const app = express();

app.set('view engine', 'pug');
app.set('views', './views');

app.get('/', (req, res) => {
    (new Report()).load(function(weeksData){
        res.render('index', {
            weeksData: weeksData
        });
    });
});

app.listen(process.env.PORT || 3000, () =>
    console.log('App listening on port ' + (process.env.PORT || 3000))
);