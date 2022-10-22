const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const PORT = process.env.PORT || 8000;

const app = express();

const newspapers = [
    {
      name:"NASA",
      address:"https://climate.nasa.gov/",
      base:"https://climate.nasa.gov/"
    },
    {
        name:"nature.com",
        address:"https://www.nature.com/articles/d41586-022-00585-7",
        base:""
    },
    {
        name:"BBC",
        address:"https://www.bbc.com/news/science-environment-24021772",
        base:""
    }
]

let articles = [];

newspapers.forEach(newspaper => {
    axios.get(newspaper.address)
         .then(response => {
            const html = response.data; 
            const $ = cheerio.load(html);

            $("a:contains('climate')", html).each(function (){
                const title = $(this).text();
                 const url = $(this).attr("href");
                  
                 articles.push({
                    title,
                    url:newspaper.base + url,
                    source:newspaper.name
                 })
             })
         })
})

app.get("/", (req,res) => {
    res.json("Welcome to my Climate Change API");
});

app.get("/news", (req,res) => {
   res.json(articles);
})

app.get("/news/:newspaperId", (req,res) => {
     const newspaperId = req.params.newspaperId;

   const newspaperAddress = newspapers.filter(newspaper => newspaper.name == newspaperId)[0].address;
   const newspaperBase = newspapers.filter(newspaper => newspaper.name == newspaperId)[0].base;
   //console.log(newspaperAddress);
   //res.json(newspaperAddress);

   axios.get(newspaperAddress)
        .then(response => {
            const html = response.data;
            const $ = cheerio.load(html);
            const specificArticles = [];

            $("a:contains('climate')", html).each(function () {
                const title = $(this).text();
                const url = $(this).attr("href");
                specificArticles.push({
                     title,
                     url:newspaperBase + url,
                     source:newspaperId
                })
            });
            res.json(specificArticles);
        }).catch(err => console.log(err));
})

app.listen(PORT, ()=>console.log(`Server Running on PORT ${PORT}`));