var express =require('express');
var sql = require('mysql');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());

var mysqlConfig = {
    host: 'us-cdbr-iron-east-03.cleardb.net',
    port: '3306',
    user: 'bf2f73eeeafeec',
    password: '7eeac762',
    database: 'heroku_ec366bbe5402271'
};
var connection;

function handleDisconnect() {
    connection = sql.createConnection(mysqlConfig);

    connection.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect();                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}

handleDisconnect();

function configureGET() {
    app.get('/', function (req, res) {
       res.render('index.pug', {'title':'Заголовок', 'msg':'Игорь'});
    });

    app.get('/api/answers', function (req, res) {
        connection.query("SELECT * FROM answer", function (error, rows, fields) {
            res.send(rows);
        });
    });
    app.get('/api/commands', function (req, res) {
        connection.query("SELECT * FROM command", function (error, rows, field) {
            res.send(rows);
        });
    });
    app.get('/api/communications', function (req, res) {
        connection.query("SELECT * FROM communication", function (error, rows, field) {
            res.send(rows);
        });
    });
    app.get('/api/communicationkeys', function (req, res) {
        connection.query("SELECT * FROM communicationkey", function (error, rows, field) {
            res.send(rows);
        });
    });
    app.get('/api/keywords', function (req, res) {
        connection.query("SELECT * FROM keyword", function (error, rows, field) {
            res.send(rows);
        });
    });
    app.get('/api/questions', function (req, res) {
        connection.query("SELECT * FROM question", function (error, rows, field) {
            res.send(rows);
        })
    });
    app.get('/api/clients', function (req, res) {
        connection.query("SELECT * FROM client", function (error, rows, field) {
            res.send(rows);
        })
    });

    app.get('/api/answers/answersForQuestion', function (req, res) {
       getDataFromDB("SELECT * FROM Answer WHERE id IN ( SELECT answerID FROM Communication WHERE questionID = "+ req.query.questionID +")", res);
    });

    app.get('/api/communications/communicationsForQuestion', function (req, res) {
        getDataFromDB("SELECT * FROM Communication WHERE questionID = "+ req.query.questionID, res);
    });

    app.get('/api/questions/byID', function (req, res) {
        connection.query("SELECT * FROM Question WHERE id = " + req.query.id, function (error, rows, field) {
            res.send(rows[0]);
        });
    });

    app.get('/api/answers/byID', function (req, res) {
        connection.query("SELECT * FROM Answer WHERE id = " + req.query.id, function (error, rows, field) {
            res.send(rows[0]);
        });
    });

    app.get('/api/keywords/byID', function (req, res) {
        connection.query("SELECT * FROM KeyWord WHERE id = " + req.query.id, function (error, rows, field) {
            res.send(rows[0]);
        });
    });

    app.get('/api/communicationkeys/communicationKeysForKeyWord', function (req, res) {
       getDataFromDB("SELECT * FROM communicationkey WHERE keyID = " + req.query.keyID, res);
    });
};


function getDataFromDB(query, res) {
    connection.query(query, function (erro, rows, field) {
        res.send(rows);
    });
}

function configureInsert() {

    app.post('/api/clients/insert', function (req, res) {
        var user = {
            realName: req.body.realName,
            login: req.body.login,
            pass: req.body.pass,
            age: req.body.age,
            city: req.body.city,
            email: req.body.email,
            lastEntry: req.body.lastEntry,
        };
        var fields = "\"" + user.realName +"\", \""+ user.login +"\", \""+ user.pass +"\", "+ user.age +", \""+ user.city +"\", \"" +user.email + "\", \"" + user.lastEntry + "\"";
        var query = "INSERT INTO client (realName, login, pass, age, city, email, lastEntry) VALUES ("+ fields +")";

        connection.query(query, function (error, rows, fields) {
            res.send(rows);
            console.log("Insert clients");
        });
    });
    app.post('/api/answers/insert', function (req, res) {
        var answer = {
          content: "\""+req.body.content+"\""
        };

        var query = "INSERT INTO answer (content) VALUES (" + answer.content + ")";
        connection.query(query, function (error, rows, fields) {
            var id = rows.insertId;
            connection.query("SELECT * FROM answer WHERE id = " + id, function (error, rows, fields) {
                res.send(rows[0]);
                console.log("Insert answer: " + answer.content);
            });
        });
    });
    app.post('/api/communications/insert', function (req, res) {
        var c = {
         questionID: req.body.questionID,
         answerID:req.body.answerID,
         correct:req.body.correct,
         power:req.body.power
        };
        var fields = c.questionID + ", " + c.answerID + ", " + c.correct + ", " + c.power;
        var query = "INSERT INTO communication (questionID, answerID, correct, power) VALUES(" + fields + ")";
        connection.query(query, function (error, rows, field) {
            var id = rows.insertId;
            connection.query("SELECT * FROM communication WHERE id = " + id, function (error, rows, fields) {
               res.send(rows[0]);
               console.log("Insert communication");
            });
        });
    });
    app.post('/api/communicationkeys/insert', function (req, res) {
        var c = {
            keyID: req.body.keyID,
            answerID: req.body.answerID,
            correct: req.body.correct,
            power: req.body.power
        };
        var fields = c.keyID + ", " + c.answerID + ", " + c.correct + ", " + c.power;
        var query = "INSERT INTO communicationkey (keyID, answerID, correct, power) VALUES (" + fields + ")";
        connection.query(query, function (error, rows, fields) {
           var id = rows.insertId;
           connection.query("SELECT * FROM communicationkey WHERE id = " + id, function (error, rows, fields) {
              res.send(rows[0]);
              console.log("Insert communicationsKey");
           });
        });
    });

    app.post('/api/keywords/insert', function (req, res) {
       var word = {
           content: "\"" + req.body.content+ "\""
       };
       var query = "INSERT INTO keyword (content) VALUES("+ word.content + ")";
       connection.query(query, function (error, rows, field) {
           var id = rows.insertId;
           connection.query("SELECT * FROM keyword WHERE id = " + id, function (error, rows, field) {
               res.send(rows[0]);
               console.log("Insert keyWord: " + word.content);
           })
       })
    });
    app.post('/api/questions/insert', function (req, res) {
       var q = {
           content: "\""+req.body.content+"\""
       }
       var query = "INSERT INTO question (content) VALUES ("+ q.content + ")";
       connection.query(query, function (error, rows, fields) {
           var id = rows.insertId;
           connection.query("SELECT * FROM question WHERE id = " + id, function (error, rows, field) {
              res.send(rows[0]);
              console.log("Insert question: " + q.content);
           });
       })
    });
}
function configureUpdate() {
    // UPDATE communication SET questionID = 1, answerID = 1, correct = 1, power = 1 WHERE id = 1
    app.post('/api/communications/update', function (req, res) {
        var com = {
            id: req.body.id,
            questionID: req.body.questionID,
            answerID: req.body.answerID,
            correct: req.body.correct,
            power: req.body.power
        };
        var query = "UPDATE communication SET " +
            "questionID = " + com.questionID +"," +
            "answerID = " + com.answerID + ", " +
            "correct = " + com.correct + ", " +
            "power = " + com.power + " WHERE id = " + com.id;
        connection.query(query, function (error, rows, field) {
            res.send(rows);
            console.log("Update communication: " + com.id);
        });
    });
    app.post('/api/communicationkeys/update', function (req, res) {
        var com = {
            id: req.body.id,
            keyID: req.body.keyID,
            answerID: req.body.answerID,
            correct: req.body.correct,
            power: req.body.power
        };

        var query = "UPDATE communicationkey SET " +
            "keyID = " + com.keyID +"," +
            "answerID = " + com.answerID + ", " +
            "correct = " + com.correct + ", " +
            "power = " + com.power + " WHERE id = " + com.id;

        connection.query(query, function (error, rows, field) {
            res.send(rows);
            console.log("Update communicationKey: " + com.id);
        });
    });
}
function configureDelete() {
    app.post('/api/questions/delete', function (req, res) {
        var id = req.query.id;
        var query = "DELETE FROM question WHERE id = " + id;
        connection.query(query, function (error, rows, field) {
           res.send(rows);
           console.log("Delete question: " + id);
           // Удаляются связи для данного вопроса
            deleteCommunicationForQuestion(id);
        });

    });
    app.post('/api/keywords/delete', function (req, res) {
        var id = req.query.id;
        var query = "DELETE FROM keyword WHERE id = " + id;
        connection.query(query, function (error, rows, field) {
            res.send(rows);
            console.log("Delete keyWord: " + id);
            deleteCommunicationKeyForKeyWord(id);
        });

    });
    app.post('/api/communications/delete', function (req, res) {
        var id = req.query.id;
        var query = "DELETE FROM communication WHERE id = " + id;
        connection.query(query, function (error, rows, field) {
            res.send(rows);
            console.log("Delete communication: " + id);
            // Удалить неиспользуемые ответы, если они появились
            deleteOldAnswer();
        });

    });
    app.post('/api/communicationkeys/delete', function (req, res) {
        var id = req.query.id;
        var query = "DELETE FROM communicationkey WHERE id = " + id;
        connection.query(query, function (error, rows, field) {
            res.send(rows);
            console.log("Delete communicationKey: " + id);
            // Удалить неиспользуемые ответы, если они появились
            deleteOldAnswer();
        });
    })
}
function  configureSelection() {
    app.post('/api/selection', function (req, res) {
        selectionCommunication();
        selectionCommunicationKey();
        res.send("{}");
        console.log("Selection");
    });
}

// Удалени не используемых аответов
function deleteOldAnswer() {
    var query = "SELECT *\n" +
        "FROM Answer\n" +
        "                WHERE id  NOT IN (\n" +
        "                    SELECT answerID\n" +
        "                    FROM Communication\n" +
        "                ) AND id NOT IN (\n" +
        "                    SELECT answerID\n" +
        "                    FROM CommunicationKey\n" +
        "                );";
    // Выбрали только те Answer-ы, которые не используются
    connection.query(query, function (e, r, f) {
        console.log(r);
        for (var i = 0; i < r.length; i++) {
            console.log(r[i]);
            query = "DELETE FROM Answer WHERE id = " + r[i].id;
            connection.query(query, function (e,r,f) {});
        }
    });
}
// Удаление коммуникаций с answerID
function deleteCommunicationsKeysForAnswer(answerID) {
    var query1 = "DELETE FROM Communication WHERE answerID = " + answerID;
    var query2 = "DELETE FROM CommunicationKey WHERE answerID = " + answerID;
    connection.query(query1, function (e,r,f) {
       deleteOldAnswer();
    });
    connection.query(query2, function (e,r,f) {
        deleteOldAnswer();
    })
}
// Удаление Communication для Question
function deleteCommunicationForQuestion(questionID) {
    var query = "DELETE FROM communication WHERE questionID = " + questionID;
    connection.query(query, function (e,r,f) {
        // Если появились неиспользуемые ответы, они также удаляются
        deleteOldAnswer();
    });
}
// Удаление CommunicationKey для KeyWord
function deleteCommunicationKeyForKeyWord(keyID) {
    var query = "DELETE FROM communicationkey WHERE keyID = " + keyID;
    connection.query(query, function (e,r,f) {
       // Удаление неиспользуемых ответов, если появились
       deleteOldAnswer();
    });
}
// Отбор CommunicationKey
function selectionCommunicationKey() {
// Сколько с correct < 0
    var query = "SELECT COUNT(id) FROM communicationkey WHERE correct < 0";
    console.log(query);
    connection.query(query, function (e,r,f) {
        var count = r["0"]["COUNT(id)"]/2;
        // Считаем среднюю power, среди тех, у кого она вообще есть
        var queryPower = "SELECT AVG(power) FROM communicationkey WHERE power != 0";
        console.log(queryPower);
        connection.query(queryPower, function (e,r,f) {
            var select = "SELECT * FROM communicationkey " +
                "WHERE id IN (" +
                " SELECT id " +
                " FROM communicationkey " +
                " WHERE power > " + r["0"]["AVG(power)"] + " AND correct < 0 " +
                " ORDER BY correct" +
                ")";
            console.log(select);
            connection.query(select, function (e,r,f) {
                for (var i = 0; i < r.length && i < count; i++) {
                    connection.query("DELETE FROM communicationkey WHERE id = " + r[i].id, function (e,r,f) {deleteOldAnswer()});
                }
            })
        });
    });
}
// Отбор Communication
function selectionCommunication() {
    // Сколько с correct < 0
    var query = "SELECT COUNT(id) FROM communication WHERE correct < 0";
    console.log(query);
    connection.query(query, function (e,r,f) {
       var count = r["0"]["COUNT(id)"]/2;
       // Считаем среднюю power, среди тех, у кого она вообще есть
        var queryPower = "SELECT AVG(power) FROM communication WHERE power != 0";
        console.log(queryPower);
        connection.query(queryPower, function (e,r,f) {
           var select = "SELECT * FROM communication " +
                        "WHERE id IN (" +
                                        " SELECT id " +
                                        " FROM communication " +
                                        " WHERE power > " + r["0"]["AVG(power)"] + " AND correct < 0 " +
                                        " ORDER BY correct" +
                                       ")";
           console.log(select);
           connection.query(select, function (e,r,f) {
               for (var i = 0; i < r.length && i < count; i++) {
                   connection.query("DELETE FROM communication WHERE id = " + r[i].id, function (e,r,f) {deleteOldAnswer()});
               }
           })
        });
    });
}


let port = process.env.PORT;
if (port == null || port == "") {
    port = 8000;
}
app.listen(port);
console.log('Listen port ' + port);
configureGET();
configureInsert();
configureUpdate();
configureDelete();
configureSelection();