const axios = require('axios');

async function testRegistration() {
  try {
    // First, get departments
    console.log('Getting departments?...');
    const deptResponse = await axios.get('http://localhost:3000/api/v1/auth/departments');
    console.log('Departments:', deptResponse.data.data);
    
    const departments = deptResponse.data.data;
    const itDept = departments?.find(d => d.name === 'IT');
    
    if (!itDept) {
      console.error('IT department not found');
      return;
    }
    
    console.log('Using IT department:', itDept);
    
    // Test registration
    console.log('\nTesting registration...');
    const registerData = {
      first_name: 'John',
      last_name: 'Doe', 
      email: 'john.doe@test.com',
      password: 'Test123!',
      department_id: itDept.id
    };
    
    console.log('Registration data:', registerData);
    
    const response = await axios.post('http://localhost:3000/api/v1/auth/register', registerData);
    console.log('Registration successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testRegistration(); 