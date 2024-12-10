import { v4 as uuidv4 } from "uuid";
import { StableBTreeMap, Server, ic } from "azle";
import express from "express";

export default function createServer() {
    class Student {
        id: string;
        name: string;
        age: number;
        createdAt: Date;
        updatedAt: Date | null;
    }

    const studentsStorage = StableBTreeMap<string, Student>(0);
    const app = express();
    app.use(express.json());

    // Create a new student
    app.post("/students", (req, res) => {
        const student: Student = {
            id: uuidv4(),
            createdAt: getCurrentDate(),
            updatedAt: null,
            ...req.body,
        };

        studentsStorage.insert(student.id, student);
        res.json(student);
    });

    // Get all students
    app.get("/students", (req, res) => {
        res.json(Array.from(studentsStorage.values()));
    });

    // Get a student by ID
    app.get("/students/:id", (req, res) => {
        const studentId = req.params.id;
        const studentOpt = studentsStorage.get(studentId);

        if (!studentOpt) {
            res.status(404).send(`The student with ID=${studentId} was not found.`);
        } else {
            res.json(studentOpt);
        }
    });

    // Update a student by ID
    app.put("/students/:id", (req, res) => {
        const studentId = req.params.id;
        const studentOpt = studentsStorage.get(studentId);

        if (!studentOpt) {
            res.status(400).send(`Couldn't update student with ID=${studentId}. Student not found.`);
        } else {
            const student = studentOpt;
            const updatedStudent = { 
                ...student, 
                ...req.body, 
                updatedAt: getCurrentDate() };

            studentsStorage.insert(studentId, updatedStudent);
            res.json(updatedStudent);
        }
    });

    // Delete a student by ID
    app.delete("/students/:id", (req, res) => {
        const studentId = req.params.id;
        const deletedStudent = studentsStorage.remove(studentId);

        if (!deletedStudent) {
            res.status(400).send(`Couldn't delete student with ID=${studentId}. Student not found.`);
        } else {
            res.json(deletedStudent);
        }
    });

    // Start the server
    return app.listen(3000, () => {
        console.log("Server is running on port 3000");
    });

    // Helper function to get the current date
    function getCurrentDate() {
        return new Date(Date.now());
    }
}
