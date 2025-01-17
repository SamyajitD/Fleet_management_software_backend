const Employee = require("../models/employeeSchema.js");

module.exports.register = async (req, res) => {
    try {
        const { name, username, phoneNo, role, password } = req.body;
        const emp = new Employee({ name, username, phoneNo, role });
        const newEmployee = await Employee.register(emp, password);

        req.login(newEmployee, (err) => {
            if (err) return next(err);
            return res.status(200).json({ message: 'Registered Successfully', flag: true });
        });

    } catch (err) {
        return res.status(500).json({ message: "An error occurred while registering", error: err.message });
    }
}