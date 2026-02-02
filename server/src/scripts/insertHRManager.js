import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

const insertHRManager = async () => {
  try {
    // Dynamic imports after dotenv is loaded
    const { getSequelize } = await import('../config/sqlDatabase.js');
    const { Employee } = await import('../models/sql/index.js');

    // Initialize Sequelize
    const sequelize = getSequelize();

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Connected to SQL Server');

    // MongoDB document data
    const mongoEmployee = {
      employeeId: "EMP001",
      firstName: "HR",
      lastName: "Manager",
      email: "hr@pvschemicals.com",
      position: "HR Manager",
      hireDate: new Date("2020-01-01T00:00:00.000Z"),
      salary: 75000,
      password: "$2b$10$dSmTyUDPv1PlFItWJk0stOyJ8R4IntB5oaLd5Ug50q9ZunC9PPOsm",
      isApprover: false,
      role: "hr",
      isActive: true
    };

    // Map to SQL Server schema
    const sqlEmployee = {
      employeeId: mongoEmployee.employeeId,
      firstName: mongoEmployee.firstName,
      lastName: mongoEmployee.lastName,
      email: mongoEmployee.email,
      password: mongoEmployee.password,
      position: mongoEmployee.position,
      jobTitle: mongoEmployee.position, // Use position as jobTitle
      role: mongoEmployee.role,
      hireDate: mongoEmployee.hireDate,
      salary: mongoEmployee.salary,
      annualSalary: mongoEmployee.salary, // Copy salary to annualSalary
      isApprover: mongoEmployee.isApprover,
      isActive: mongoEmployee.isActive,

      // Set default values for other fields
      ssn: null,
      department: null,
      company: 'PVS Chemicals',
      companyCode: null,
      location: null,
      supervisorId: null,
      supervisorName: null,
      lastHireDate: null,
      employeeType: 'Full-Time',
      salaryType: 'Salary',
      hourlyPayRate: 0,
      bonus2024: 0,
      bonus2025: 0,
      phone: null,
      addressStreet: null,
      addressCity: null,
      addressState: null,
      addressZipCode: null,
      addressCountry: 'USA',
      approverLevel: null,
      level1ApproverId: null,
      level1ApproverName: null,
      level2ApproverId: null,
      level2ApproverName: null,
      level3ApproverId: null,
      level3ApproverName: null,
      level4ApproverId: null,
      level4ApproverName: null,
      level5ApproverId: null,
      level5ApproverName: null,
      approvalStatus: null
    };

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({
      where: { employeeId: sqlEmployee.employeeId }
    });

    if (existingEmployee) {
      console.log('⚠️  Employee EMP001 already exists. Updating...');
      await Employee.update(sqlEmployee, {
        where: { employeeId: sqlEmployee.employeeId }
      });
      console.log('✅ Employee EMP001 updated successfully');
    } else {
      // Insert the employee
      const newEmployee = await Employee.create(sqlEmployee);
      console.log('✅ Employee inserted successfully!');
      console.log('Employee ID:', newEmployee.id);
      console.log('Employee Code:', newEmployee.employeeId);
      console.log('Name:', newEmployee.firstName, newEmployee.lastName);
      console.log('Email:', newEmployee.email);
      console.log('Role:', newEmployee.role);
    }

    // Fetch and display the employee
    const employee = await Employee.findOne({
      where: { employeeId: sqlEmployee.employeeId },
      attributes: { exclude: ['password'] }
    });

    console.log('\n📋 Employee in SQL Database:');
    console.log(JSON.stringify(employee, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error inserting employee:', error.message);
    console.error(error);
    process.exit(1);
  }
};

insertHRManager();
