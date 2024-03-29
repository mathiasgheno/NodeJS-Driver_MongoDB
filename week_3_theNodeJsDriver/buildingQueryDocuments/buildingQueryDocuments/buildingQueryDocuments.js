/*

Esse código a seguir é completo com excessão da função queryDocumento().
Nessa Lesson, a função queryDocument() cria um objeto que vai ser passado para o find()
para conseguir setar um documento da coleção crunchbase.companies. 

Para essa atividade, por favor complete o queryDocumento() como descrito no TODO. 

Uma vez completo, rode:

node buildingQueryDocuments.js


When you are convinced you have completed the application correctly, please enter the 
average number of employees per company reported in the output. Enter only the number reported.
It should be three numeric digits.

As a check that you have completed the exercise correctly, the total number of unique companies 
reported by the application should equal 42.

If the grading system does not accept the first solution you enter, please do not make further 
attempts to have your solution graded without seeking some help in the discussion forum.

*/

var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');


var allOptions = [
    {
        firstYear: 2002,
        lastYear: 2016,
        city: "Palo Alto"
    },
    {
        lastYear: 2010,
        city: "New York"
    },
    {
        city: "London"
    }
];

var numQueriesFinished = 0;
var companiesSeen = {};

for (var i=0; i<allOptions.length; i++) {
    var query = queryDocument(allOptions[i]);
    queryMongoDB(query, i);
}


function queryMongoDB(query, queryNum) {

    MongoClient.connect('mongodb://localhost:27017/crunchbase', function(err, db) {
        
        assert.equal(err, null);
        console.log("Successfully connected to MongoDB for query: " + queryNum);
        
        var cursor = db.collection('companies').find(query);
        
        var numMatches = 0;
        
        cursor.forEach(
            function(doc) {
                numMatches = numMatches + 1;
                if (doc.permalink in companiesSeen) return;
                companiesSeen[doc.permalink] = doc;
            },
            function(err) {
                assert.equal(err, null);
                console.log("Query " + queryNum + " was:" + JSON.stringify(query));
                console.log("Matching documents: " + numMatches);
                numQueriesFinished = numQueriesFinished + 1;
                if (numQueriesFinished == allOptions.length) {
                    report();
                }
                return db.close();
            }
        );
    });
    
}


function queryDocument(options) {

    console.log(options);
    
    var query = {
        // "tag_list": /* TODO: Complete this statement to match the regular expression "social-networking" */        
        "tag_list":{
            "$regex": "social-networking"
        }
    };

    if (("firstYear" in options) && ("lastYear" in options)) {
        /* 
           TODO: Write one line of code to ensure that if both firstYear and lastYear 
           appear in the options object, we will match documents that have a value for 
           the "founded_year" field of companies documents in the correct range. 
        */
        query.founded_year = {
            "$gte": options.firstYear,
            "$lte": options.lastYear
        };
    } else if ("firstYear" in options) {
        query.founded_year = { "$gte": options.firstYear };
    } else if ("lastYear" in options) {
        query.founded_year = { "$lte": options.lastYear };
    }

    if ("city" in options) {
        /* 
           TODO: Write one line of code to ensure that we do an equality match on the 
           "offices.city" field. The "offices" field stores an array in which each element 
           is a nested document containing fields that describe a corporate office. Each office
           document contains a "city" field. A company may have multiple corporate offices. 
        */
        query['offices.city'] = options.city;
    }
        
    return query;
    
}


function report(options) {
    var totalEmployees = 0;
    for (key in companiesSeen) {
        totalEmployees = totalEmployees + companiesSeen[key].number_of_employees;
    }

    var companiesList = Object.keys(companiesSeen).sort();
    console.log("Companies found: " + companiesList);
    console.log("Total employees in companies identified: " + totalEmployees);
    console.log("Total unique companies: " + companiesList.length);
    console.log("Average number of employees per company: " + Math.floor(totalEmployees / companiesList.length));
}









