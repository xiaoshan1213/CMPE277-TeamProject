/*jslint node: true */
"use strict";

var mongoDB = require("./mongodb"),
    randomstring = require("randomstring"),
    collectionName = "user",
    crypto = require('crypto');

function sendEmail(code, email) {
    /*  sendEmail  ------to be finished-------------------------*/
}

exports.create = function (req, res) {
    
    var email = req.body.email,
        passwordMD5 = crypto.createHash('md5').update(req.body.password).digest("hex"),
        code,
        screenName = req.body.screenName,
        insert = {},
        col = mongoDB.getdb().collection(collectionName);
    
    col.findOne({$or: [{email: email}, {screenName: screenName}]}, function (err, rows) {
        
        if (err) {
            console.log(err);
        } else {
            console.log(rows);
            if (undefined !== rows.email) {
                
                code = randomstring.generate({length: 6, charset: 'numeric'});
                insert = {email: email, code: code, password: passwordMD5, varified: false, friends: [], pending: [], follow: []};
                col.insertOne(insert, function (err, rows) {
                    
                    sendEmail(code, email);
                    res.send({dup: false});

                });
                
            } else {
                res.send({dup: true});
            }
        }

    });
};

exports.update = function (req, res) {
    
    var email = req.body.email,
        col = mongoDB.getdb().collection(collectionName);
    
    
    col.findOneAndUpdate({email: email}, {$set: req.body}, {returnOriginal: false}, function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            console.log(rows);
            /* Get the user's all the post order by post time --------------------------------to be finished  */
            res.send(rows);
        }
    });
    
};

exports.verify = function (req, res) {
    
    var email = req.body.email,
        filter = { email: email, code: req.body.code},
        col = mongoDB.getdb().collection(collectionName);
    
    req.body.varified = true;
    
    col.findOneAndUpdate(filter, {$set: req.body}, function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            console.log(rows);
            if (undefined !== rows.email) {
                
                res.send({verified: true});
            } else {
                
                res.send({verified: false});
                
            }

        }
    });
    
};

exports.isVerified = function (req, res) {
    
    var col = mongoDB.getdb().collection(collectionName);
    
    col.findOne({email: req.params.email}, function (err, rows) {
        
        if (err) {
            console.log(err);
        } else {
            console.log(rows);
            if (undefined !== rows.email) {
                
                res.send({verified: rows.verified});
                
            } else {
                res.send({msg: "Not found."});
            }
        }

    });
};


exports.signIn = function (req, res) {
    
    var passwordMD5 = crypto.createHash('md5').update(req.body.password).digest("hex"),
        query = {email: req.body.email, password: passwordMD5},
        col = mongoDB.getdb().collection(collectionName);
    
    
    col.findOne(query, function (err, rows) {
        
        if (err) {
            console.log(err);
        } else {
            console.log(rows);
            if (undefined !== rows.email) {
                
                /* Get the user's all the post order by post time --------------------------------to be finished  */
                res.send({checked: true, User: rows});
                
            } else {
                res.send({checked: false});
            }
        }

    });

};

exports.signOut = function (req, res) {
    res.send({msg: "Sign Out Successfully"});
};

exports.get = function (req, res) {
    var col = mongoDB.getdb().collection(collectionName);
    
    col.findOne({email: req.params.email}, function (err, rows) {
        
        if (err) {
            console.log(err);
        } else {
            console.log(rows);
            if (undefined !== rows.email) {
                
                /* Get the user's all the post order by post time --------------------------------to be finished  */
                res.send(rows);
                
            } else {
                res.send({msg: "Email Not Found."});
            }
        }

    });
    
};



exports.getUsers = function (req, res) {
    var col = mongoDB.getdb().collection(collectionName);
    
    col.find({visibility: "public"}).toArray(function (err, rows) {
        
        if (err) {
            console.log(err);
        } else {
            console.log(rows);
            res.send(rows);
        }
        
    });
};


exports.getPendingUsers = function (req, res) {
    var col = mongoDB.getdb().collection(collectionName);
    
    col.findOne({email: req.params.email}, function (err, rows) {
        
        if (err) {
            console.log(err);
        } else {
            console.log(rows);
            if (undefined !== rows.email) {
                res.send(rows.pending);
                
            } else {
                
                res.send({msg: "Email Not Found."});

            }
        }
        
    });
    
};

exports.request = function (req, res) {
    var email = req.params.email,
        recipientEmail = req.params.recipientEmail,
        col = mongoDB.getdb().collection(collectionName);
    
    col.updateOne({email: email}, {$push: {pending: {email: recipientEmail}}}, function (err, rows) {
        
        if (err) {
            console.log(err);
        } else {
            console.log(rows);

            res.send({msg: "Add successfully"});
                
        }
    });
};

exports.accept = function (req, res) {
    
    var email = req.params.email,
        recipientEmail = req.params.recipientEmail,
        col = mongoDB.getdb().collection(collectionName);
    
    col.updateOne({email: email}, {$push: {friends: {email: recipientEmail}}, $pull: {pending: recipientEmail}}, function (err, rows) {
        
        if (err) {
            console.log(err);
        } else {
            console.log(rows);
            
            col.updateOne({email: recipientEmail}, {$push: {friends: {email: email}}, $pull: {pending: email}}, function (err, rows) {
                
                if (err) {
                    console.log(err);
                } else {
                    console.log(rows);

                    res.send({msg: "Accept Successfully"});

                }
            });
        }

    });
};


exports.deny = function (req, res) {
    
    var email = req.params.email,
        recipientEmail = req.params.recipientEmail,
        col = mongoDB.getdb().collection(collectionName);
    
    col.updateOne({email: email}, {$pull: {pending: recipientEmail}}, function (err, rows) {
        
        if (err) {
            console.log(err);
        } else {
            console.log(rows);
            
            col.updateOne({email: recipientEmail}, {$pull: {pending: email}}, function (err, rows) {
                
                if (err) {
                    console.log(err);
                } else {
                    console.log(rows);

                    res.send({msg: "Deny Successfully"});

                }
            });
        }

    });
};

exports.follow = function (req, res) {
    
    var email = req.params.email,
        recipientEmail = req.params.recipientEmail,
        col = mongoDB.getdb().collection(collectionName);
    
    col.updateOne({email: email}, {$push: {follow: recipientEmail}}, function (err, rows) {
        
        if (err) {
            console.log(err);
        } else {
            console.log(rows);
            res.send({msg: "follow Successfully"});
            
        }

    });
    
};

function mergeTwoJsonArray(array1, array2, key) {
    var i = 0,
        j = 0,
        newArray = [],
        needPush = true;
    
    console.log("array1");
    console.log(array1);
    console.log("array2");
    console.log(array2);
    
    for (j = 0; j < array2.length; j = j + 1) {
        newArray.push(array2[j]);
    }
    
    for (i = 0; i < array1.length; i = i + 1) {
        
        for (j = 0; j < array2.length; j = j + 1) {
            
            if (array1[i][key] === array2[i][key]) {
                needPush = false;
                break;
            }
        }
        
        if (needPush) { newArray.push(array1[i]); }
    }
    
    console.log("newArray");
    console.log(newArray);
    
    return newArray;
}

exports.getVisiblePosterEmails = function (email, callback) {
    
    var resArray = [],
        col = mongoDB.getdb().collection(collectionName);
    
    col.findOne({email: email}, function (err, rows) {
        
        if (err) {
            console.log(err);
        } else {
            console.log(rows);
            if ((undefined === rows) || (null === rows)) {
                
                callback({msg: "Email not found"});
            } else {
                resArray = mergeTwoJsonArray(rows.friends, rows.follow, "email");
                
                col.find({visibility: "public"}).toArray(function (err, rows) {
        
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(rows);
                        resArray = mergeTwoJsonArray(resArray, rows, "email");
                        callback(null, rows);
                    }

                });
            }
            
            
        }
    });
};

function hasJsonObject(key, value, array) {
    var i = 0;
    
    for (i = 0; i < array.length; i = i + 1) {
        if (value === array[i][key]) { return true; }
    }
    
    return false;
}


exports.getAnotherUser = function (req, res) {
    
    var email = req.params.email,
        anotherEmail = req.params.anotherEmail,
        canFollow = true,
        canRequest = true,
        col = mongoDB.getdb().collection(collectionName);
    
    col.findOne({email: anotherEmail}, function (err, rows) {
        
        if (err) {
            console.log(err);
        } else {
            console.log(rows);
            if (undefined !== rows.email) {
                
                /* Get the user's all the post order by post time --------------------------------to be finished  */
                if (hasJsonObject("email", email, rows.friend)) {
                    canRequest = false;
                } else if (hasJsonObject("email", email, rows.pending)) {
                    canRequest = false;
                }
                
                if (hasJsonObject("email", email, rows.follow)) { canFollow = false; }
                
                res.send({user: rows, canRequest: canRequest, canFollow: canFollow});
                
            } else {
                res.send({msg: "Email Not Found."});
            }
        }

    });
};
