/*********************************************************************************
* WEB422 – Assignment 1
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Nikita Sachivko Student ID: 165495193 Date: 8/16/2022
* Cyclic Link: _______________________________________________________________
*
********************************************************************************/

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const HTTP_PORT = process.env.PORT || 5000
const cors = require("cors")
const MoviesDB = require("./modules/moviesDB.js")
const db = new MoviesDB()

require("dotenv").config()
app.use(cors())
app.use(bodyParser.json())


/****************************
 * GET
 ***************************/

/**
 * Find all "Movie" objects for a specific "page" to the client as well as optionally filtering by "title"
 */
app.get("/api/movies", (req, res) => {
    try {
        if (!req.query?.page || !req.query?.perPage)
            throw "should have page and perPage parameters"

        const page = Number(req.query.page)
        const perPage = Number(req.query.perPage)
        const title = !!req.query.title ? req.query.title : ""

        if (isNaN(page))
            throw "page should be a number"
        else if (isNaN(perPage))
            throw "perPage should be a number"


        db.getAllMovies(page, perPage, title).then((data) => {
            res.status(200).json(data)
        }).catch((error) => {
            res.status(500).json({
                message: "500 Internal Server Error"
            })
        })
    } catch (error) {
        res.status(500).json("Error: " + error)
    }
})


/**
 * Find movie by id
 */
app.get("/api/movies/:id", (req, res) => {
    try {
        db.getMovieById(req.params.id).then((movie) => {
            res.status(200).json({
                movie
            })
        }).catch((err) => {
            res.status(500).json({
                message: `Movie with id: ${req.params.id} is not found`
            })
        })
    } catch (error) {
        res.status(500).json({
            message: "500 Internal Server Error"
        })
    }
})


/****************************
 * POST
 ***************************/

/**
 * This route will add movie to db
 */
app.post("/api/movies", (req, res) => {
    db.addNewMovie(req.body).then(() => {
        res.status(201).json(req.body)
    }).catch((error) => {
        res.status(500).json({
            message: "500 Internal Server Error"
        })
    })
})


/****************************
 * PUT
 ***************************/

/**
 * Movie update
 */
app.put("/api/movie/:id", (req, res) => {
    try {
        db.updateMovieById(req.body, req.params.id).then((updatedMovie) => {
            res.status(200).json({
                message: `Succes: movie with id: ${req.params.id} updated`,
                data: updatedMovie
            })
        }).catch((err) => {
            res.status(500).json({
                message: `Movie with id: ${req.params.id} is not updated`
            })
        })
    } catch (error) {
        res.status(500).json({
            message: "500 Internal Server Error"
        })
    }
})


/****************************
 * DELETE
 ***************************/
/**
 * Delets movie by id
 */
app.delete("/api/movies/:id", (req, res) => {
    try {
        db.deleteMovieById(req.params.id).then(() => {
            res.status(200).json({
                message: `Succes: movie with id: ${req.params.id} deleted`,
            })
        }).catch((err) => {
            res.status(500).json({
                message: `Movie with id: ${req.params.id} is not found`
            })
        })
    } catch (error) {
        res.status(500).json({
            message: "500 Internal Server Error"
        })
    }
})

/****************************
 * ADDITIONAL UTILS
 ***************************/
/**
 * If path not exist then resirection to 404 page
 */
app.use((req, res) => {
    res.status(404).send('Resource not found')
})

/**
 * We start listening server only when mondo db connected 200
 */
db.initialize(process.env.MONGODB_CONN_STRING).then(() => {
    app.listen(HTTP_PORT, () => {
        console.log(`server listening on: ${HTTP_PORT}`)
    })
}).catch((err) => {
    console.log(err)
})
