-- Create database
CREATE DATABASE IF NOT EXISTS payroll_management;
USE payroll_management;

-- Create users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(50) NOT NULL,
    role ENUM('admin', 'employee') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create employee_types table
CREATE TABLE employee_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_salary DECIMAL(10,2) NOT NULL,
    working_hours INTEGER NOT NULL,
    benefits TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create employees table
CREATE TABLE employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    position VARCHAR(50),
    department VARCHAR(50),
    hire_date DATE NOT NULL,
    salary DECIMAL(10,2) NOT NULL,
    user_id INT,
    employee_type_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (employee_type_id) REFERENCES employee_types(id)
);

-- Create payroll table
CREATE TABLE payroll (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    basic_salary DECIMAL(10,2) NOT NULL,
    allowances DECIMAL(10,2) DEFAULT 0,
    deductions DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    payment_date DATE NOT NULL,
    status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Create allowances table
CREATE TABLE allowances (
    id INT PRIMARY KEY AUTO_INCREMENT,
    payroll_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payroll_id) REFERENCES payroll(id)
);

-- Create deductions table
CREATE TABLE deductions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    payroll_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payroll_id) REFERENCES payroll(id)
);

-- Create attendance table
CREATE TABLE attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    date DATE NOT NULL,
    check_in TIME,
    check_out TIME,
    status ENUM('present', 'absent', 'late') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Create tax_slabs table
CREATE TABLE tax_slabs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    min_amount DECIMAL(10,2) NOT NULL,
    max_amount DECIMAL(10,2) NOT NULL,
    tax_percentage DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user
INSERT INTO users (username, password, role) VALUES ('admin', 'admin123', 'admin');

-- Insert sample data
-- Employee Types
INSERT INTO employee_types (name, description, base_salary, working_hours) VALUES
('Full-time', 'Permanent employee with full benefits', 75000, 40),
('Part-time', 'Employee working less than 40 hours per week', 40000, 20),
('Contract', 'Temporary employee on contract basis', 60000, 30);

-- Tax Slabs (Fixed max_amount to be within DECIMAL(10,2) range)
INSERT INTO tax_slabs (min_amount, max_amount, tax_percentage) VALUES
(0, 50000, 0),
(50001, 100000, 10),
(100001, 200000, 20),
(200001, 500000, 30),
(500001, 1000000, 35);

-- Create procedure to add new employee with user account
DELIMITER //
CREATE PROCEDURE add_employee(
    IN p_first_name VARCHAR(50),
    IN p_last_name VARCHAR(50),
    IN p_email VARCHAR(100),
    IN p_phone VARCHAR(20),
    IN p_address TEXT,
    IN p_position VARCHAR(50),
    IN p_department VARCHAR(50),
    IN p_hire_date DATE,
    IN p_salary DECIMAL(10,2),
    IN p_employee_type_id INT
)
BEGIN
    DECLARE new_employee_id INT;
    DECLARE new_user_id INT;
    
    -- Insert new employee
    INSERT INTO employees (
        first_name, last_name, email, phone, address,
        position, department, hire_date, salary, employee_type_id
    ) VALUES (
        p_first_name, p_last_name, p_email, p_phone, p_address,
        p_position, p_department, p_hire_date, p_salary, p_employee_type_id
    );
    
    -- Get the new employee's ID
    SET new_employee_id = LAST_INSERT_ID();
    
    -- Create user account
    INSERT INTO users (username, password, role)
    VALUES (new_employee_id, DATE_FORMAT(p_hire_date, '%Y%m%d'), 'employee');
    
    -- Get the new user's ID
    SET new_user_id = LAST_INSERT_ID();
    
    -- Update employee with user_id
    UPDATE employees 
    SET user_id = new_user_id 
    WHERE id = new_employee_id;
END //
DELIMITER ;

-- Sample Employees (using the new procedure)
CALL add_employee('John', 'Doe', 'john.doe@company.com', '1234567890', '123 Main St', 'Software Engineer', 'IT', '2023-01-01', 75000, 1);
CALL add_employee('Jane', 'Smith', 'jane.smith@company.com', '2345678901', '456 Oak St', 'HR Manager', 'Human Resources', '2023-02-15', 85000, 1);
CALL add_employee('Mike', 'Johnson', 'mike.johnson@company.com', '3456789012', '789 Pine St', 'Sales Executive', 'Sales', '2023-03-01', 65000, 2);

-- Sample Payroll Records
INSERT INTO payroll (employee_id, basic_salary, allowances, deductions, payment_date, status) VALUES
(1, 75000, 5000, 2000, '2023-12-01', 'paid'),
(2, 85000, 6000, 2500, '2023-12-01', 'paid'),
(3, 65000, 4000, 1500, '2023-12-01', 'pending');

-- Sample Allowances
INSERT INTO allowances (payroll_id, type, amount, description) VALUES
(1, 'Housing', 3000, 'Monthly housing allowance'),
(1, 'Transportation', 2000, 'Monthly transportation allowance'),
(2, 'Housing', 3500, 'Monthly housing allowance'),
(2, 'Transportation', 2500, 'Monthly transportation allowance'),
(3, 'Housing', 2500, 'Monthly housing allowance'),
(3, 'Transportation', 1500, 'Monthly transportation allowance');

-- Sample Deductions
INSERT INTO deductions (payroll_id, type, amount, description) VALUES
(1, 'Insurance', 500, 'Health insurance'),
(2, 'Insurance', 500, 'Health insurance'),
(3, 'Insurance', 500, 'Health insurance');

-- Sample Attendance Records
INSERT INTO attendance (employee_id, date, check_in, check_out, status) VALUES
(1, '2023-12-01', '09:00:00', '17:00:00', 'present'),
(1, '2023-12-02', '09:15:00', '17:00:00', 'late'),
(2, '2023-12-01', '09:00:00', '17:00:00', 'present'),
(2, '2023-12-02', '09:00:00', '17:00:00', 'present'),
(3, '2023-12-01', '09:00:00', '17:00:00', 'present'),
(3, '2023-12-02', NULL, NULL, 'absent');

-- Create trigger to update total allowances and deductions in payroll
DELIMITER //
CREATE TRIGGER after_allowance_insert
AFTER INSERT ON allowances
FOR EACH ROW
BEGIN
    UPDATE payroll 
    SET allowances = (
        SELECT COALESCE(SUM(amount), 0)
        FROM allowances
        WHERE payroll_id = NEW.payroll_id
    )
    WHERE id = NEW.payroll_id;
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER after_deduction_insert
AFTER INSERT ON deductions
FOR EACH ROW
BEGIN
    UPDATE payroll 
    SET deductions = (
        SELECT COALESCE(SUM(amount), 0)
        FROM deductions
        WHERE payroll_id = NEW.payroll_id
    )
    WHERE id = NEW.payroll_id;
END //
DELIMITER ;

-- Create function to calculate tax amount
DELIMITER //
CREATE FUNCTION calculate_tax_amount(
    total_income DECIMAL(10,2)
) RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    DECLARE tax_amount DECIMAL(10,2) DEFAULT 0;
    DECLARE remaining_income DECIMAL(10,2);
    DECLARE slab_tax DECIMAL(10,2);
    
    SET remaining_income = total_income;
    
    -- Calculate tax for each slab
    SELECT 
        CASE 
            WHEN remaining_income <= max_amount THEN
                (remaining_income - min_amount) * (tax_percentage / 100)
            ELSE
                (max_amount - min_amount) * (tax_percentage / 100)
        END INTO slab_tax
    FROM tax_slabs
    WHERE remaining_income > min_amount
    ORDER BY min_amount
    LIMIT 1;
    
    SET tax_amount = COALESCE(slab_tax, 0);
    
    RETURN tax_amount;
END //
DELIMITER ;

-- Create trigger to calculate tax amount when payroll is created or updated
DELIMITER //
CREATE TRIGGER before_payroll_insert
BEFORE INSERT ON payroll
FOR EACH ROW
BEGIN
    SET NEW.tax_amount = calculate_tax_amount(NEW.basic_salary + NEW.allowances);
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER before_payroll_update
BEFORE UPDATE ON payroll
FOR EACH ROW
BEGIN
    SET NEW.tax_amount = calculate_tax_amount(NEW.basic_salary + NEW.allowances);
END //
DELIMITER ;

-- Create function to calculate total salary
DELIMITER //
CREATE FUNCTION calculate_total_salary(
    basic_salary DECIMAL(10,2),
    allowances DECIMAL(10,2),
    deductions DECIMAL(10,2),
    tax_amount DECIMAL(10,2)
) RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    RETURN basic_salary + allowances - deductions - tax_amount;
END //
DELIMITER ;

-- Create procedure to generate monthly payroll
DELIMITER //
CREATE PROCEDURE generate_monthly_payroll(
    IN p_month INT,
    IN p_year INT
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_employee_id INT;
    DECLARE v_salary DECIMAL(10,2);
    DECLARE cur CURSOR FOR 
        SELECT id, salary FROM employees;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO v_employee_id, v_salary;
        IF done THEN
            LEAVE read_loop;
        END IF;

        INSERT INTO payroll (
            employee_id, basic_salary, allowances, deductions,
            payment_date, status
        ) VALUES (
            v_employee_id, v_salary, 0, 0,
            DATE(CONCAT(p_year, '-', p_month, '-01')),
            'pending'
        );
    END LOOP;
    CLOSE cur;
END //
DELIMITER ; 