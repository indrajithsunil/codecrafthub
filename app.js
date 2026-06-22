// CodeCraftHub Learning Platform
// Simple Express REST API with JSON file storage

const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

// Allow Express to read JSON request bodies
app.use(express.json());

// Location of our JSON data file
const filePath = path.join(__dirname, "courses.json");

// Create courses.json automatically if it doesn't exist
function initializeFile() {
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify([], null, 2));
            console.log("courses.json created");
        }
    } catch (error) {
        console.log("Error creating file:", error.message);
    }
}

// Read courses from JSON file
function getCourses() {
    try {
        const data = fs.readFileSync(filePath, "utf8");
        return JSON.parse(data);
    } catch (error) {
        throw new Error("File read error");
    }
}

// Save courses to JSON file
function saveCourses(courses) {
    try {
        fs.writeFileSync(
            filePath,
            JSON.stringify(courses, null, 2)
        );
    } catch (error) {
        throw new Error("File write error");
    }
}


// GET all courses
app.get("/api/courses", (req, res) => {
    try {
        const courses = getCourses();
        res.json(courses);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


// GET one course by ID
app.get("/api/courses/:id", (req, res) => {

    try {
        const courses = getCourses();

        const course = courses.find(
            c => c.id === parseInt(req.params.id)
        );

        if (!course) {
            return res.status(404).json({
                error: "Course not found"
            });
        }

        res.json(course);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


// CREATE new course
app.post("/api/courses", (req, res) => {

    const {
        name,
        description,
        target_date,
        status
    } = req.body;


    // Validate required fields
    if (!name || !description || !target_date || !status) {
        return res.status(400).json({
            error: "Missing required fields"
        });
    }


    // Validate status
    const validStatuses = [
        "Not Started",
        "In Progress",
        "Completed"
    ];


    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            error: "Invalid status value"
        });
    }


    try {

        const courses = getCourses();

        const newCourse = {
            id: courses.length + 1,
            name,
            description,
            target_date,
            status,
            created_at: new Date().toISOString()
        };


        courses.push(newCourse);

        saveCourses(courses);


        res.status(201).json(newCourse);


    } catch (error) {

        res.status(500).json({
            error: error.message
        });
    }
});



// UPDATE course
app.put("/api/courses/:id", (req, res) => {

    try {

        const courses = getCourses();

        const course = courses.find(
            c => c.id === parseInt(req.params.id)
        );


        if (!course) {
            return res.status(404).json({
                error: "Course not found"
            });
        }


        const validStatuses = [
            "Not Started",
            "In Progress",
            "Completed"
        ];


        if (
            req.body.status &&
            !validStatuses.includes(req.body.status)
        ) {
            return res.status(400).json({
                error: "Invalid status value"
            });
        }


        course.name =
            req.body.name || course.name;

        course.description =
            req.body.description || course.description;

        course.target_date =
            req.body.target_date || course.target_date;

        course.status =
            req.body.status || course.status;


        saveCourses(courses);


        res.json(course);


    } catch (error) {

        res.status(500).json({
            error: error.message
        });
    }
});




// DELETE course
app.delete("/api/courses/:id", (req, res) => {

    try {

        let courses = getCourses();


        const index = courses.findIndex(
            c => c.id === parseInt(req.params.id)
        );


        if (index === -1) {
            return res.status(404).json({
                error: "Course not found"
            });
        }


        const deleted = courses.splice(index, 1);


        saveCourses(courses);


        res.json({
            message: "Course deleted",
            course: deleted[0]
        });


    } catch (error) {

        res.status(500).json({
            error: error.message
        });
    }
});



// Start server
initializeFile();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});